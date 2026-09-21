"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { agents as agentDirectory } from "@/data/ai-lab";
import {
  getCurrentCommandContext,
  resolveCommandInterpretation,
  toTaskCommandContext,
  type CommandContext,
} from "./commandContext";
import { useAgentRuntime, type AgentRuntime } from "./useAgentRuntime";
import { createSimulationRuntime } from "./runtime/simulationRuntime";
import type { RuntimeEvent } from "./runtime/types";
import type { Activity, ActivityType, AgentMessage, SystemStatus, Task } from "./types";

const MAX_COMMAND_LENGTH = 240;
const MAX_ACTIVITIES = 60;
const MAX_MESSAGES_HISTORY = 100;
// A command containing this phrase deterministically takes the (simulated)
// error path — spec §22: "a specific development/demo command", never a
// random failure a real visitor could stumble into.
const ERROR_DEMO_PATTERN = /\b(simulate|trigger)\s+error\b/i;
// How long a "completed"/"error" badge lingers before the system settles
// back to "ready" (Phase 11: the ONE place this used to be duplicated
// three times inside the simulation's own timing now lives, since it's
// orchestrator/UI polish reacting to a runtime event, not simulation
// content itself — see handleRuntimeEvent's task_completed/task_failed cases).
const SETTLE_DELAY_MS = 1500;

export type SubmitOutcome =
  | { ok: true; matched: boolean; task: Task }
  | { ok: false; reason: "empty" | "too-long" | "busy" };

export type AgentOrchestrator = AgentRuntime & {
  tasks: Task[];
  activities: Activity[];
  messages: AgentMessage[];
  systemStatus: SystemStatus;
  activeTaskId: string | null;
  submitCommand: (command: string, context?: CommandContext) => SubmitOutcome;
  cancelActiveTask: () => void;
  dismissActiveTask: () => void;
  viewTask: (taskId: string) => void;
  // Phase 9 §21 — session-local controls, both safe no-ops on nothing:
  // resetSession clears every piece of state this hook owns (tasks,
  // activities, messages, agents) back to a fresh session; clearTaskHistory
  // only clears the task list, leaving the activity log and agents alone.
  // Neither touches any real persisted data — everything here is
  // in-memory and session-only to begin with.
  resetSession: () => void;
  clearTaskHistory: () => void;
};

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// The "AgentOrchestrator" layer from the spec's diagram:
//
//   CommandCenter -> AgentOrchestrator -> Runtime Adapter -> Simulation Runtime
//
// It owns every piece of session state (the task timeline, the activity
// stream, agent-to-agent messages, and — via useAgentRuntime — agent
// status) and resolves command interpretation, but it does NOT own
// task-lifecycle timing: that lives behind the AgentRuntimeAdapter
// interface (see runtime/types.ts), implemented today by
// createSimulationRuntime() (runtime/simulationRuntime.ts). This hook talks
// to that adapter only through RuntimeTaskInput (what to run) and
// RuntimeEvent (what happened) — see handleRuntimeEvent below, which is the
// ONE place a RuntimeEvent turns into actual state changes.
export function useAgentOrchestrator(onAssign?: (agentId: string) => void): AgentOrchestrator {
  const runtime = useAgentRuntime();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>("ready");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const activeTaskIdRef = useRef<string | null>(null);
  // Exactly one AgentRuntimeAdapter instance for this hook's lifetime — the
  // ONE runtime execution path (spec §30). A lazy useState initializer
  // (rather than a ref) is the correct way to create a stable, one-time
  // value in React — reading a ref's value during render isn't supported.
  const [runtimeAdapter] = useState(() => createSimulationRuntime());

  useEffect(() => {
    activeTaskIdRef.current = activeTaskId;
  }, [activeTaskId]);

  // Resetting to `true` in the effect body (not just the useRef initializer)
  // matters: dev-mode Strict Mode intentionally mounts, unmounts and
  // remounts every component once, and the cleanup below runs during that
  // synthetic unmount. Without this reset, `mountedRef.current` would be
  // permanently stuck at `false` after that dance ever completes, and every
  // runtime event arriving afterward would be silently (and incorrectly)
  // discarded.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Stop any in-flight run's timers from continuing to tick in the
      // background after this hook is gone — cancelTask is a safe no-op if
      // nothing is running. The resulting task_cancelled event itself is
      // harmlessly dropped by handleRuntimeEvent's own mountedRef guard,
      // since nothing is left to show it to.
      if (activeTaskIdRef.current) {
        runtimeAdapter.cancelTask(activeTaskIdRef.current);
      }
    };
  }, [runtimeAdapter]);

  const pushActivity = useCallback((type: ActivityType, agentId: string | null, message: string) => {
    setActivities((prev) => {
      const next: Activity[] = [
        ...prev,
        { id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, agentId, message, timestamp: new Date().toISOString() },
      ];
      return next.length > MAX_ACTIVITIES ? next.slice(next.length - MAX_ACTIVITIES) : next;
    });
  }, []);

  // Immediately halts any message mid-flight for a task — used on failure
  // and cancellation so a packet doesn't keep animating toward a
  // destination that's no longer doing anything.
  const haltMessagesForTask = useCallback((taskId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.taskId === taskId && m.status !== "processed" ? { ...m, status: "processed" } : m))
    );
  }, []);

  const patchTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)));
  }, []);

  const resetInvolvedAgents = useCallback(
    (agentIds: string[]) => {
      agentIds.forEach((id) => runtime.setAgentStatus(id, "idle"));
    },
    [runtime]
  );

  // The one-time "completed"/"error" badge lingering for a beat before the
  // system settles back to "ready" — see SETTLE_DELAY_MS.
  //
  // Phase 12 §9 fix: systemStatus === "completed"/"error" does NOT block a
  // new submitCommand (only "processing" does — see submitCommand's guard),
  // so a visitor CAN submit task B during task A's ~1.5s settle window.
  // Without the taskId check below, task A's delayed reset would fire
  // AFTER task B has already taken over — stomping task B's "processing"
  // badge back to "ready" and (worse) resuming the ambient ticker while
  // task B is still genuinely running, letting it interfere with task B's
  // own agent state. Guarding on activeTaskIdRef (already kept in sync for
  // the unmount-cancel above) makes this a no-op whenever a newer task has
  // superseded the one this settle was scheduled for.
  const settleAfterDelay = useCallback(
    (taskId: string) => {
      void wait(SETTLE_DELAY_MS).then(() => {
        if (!mountedRef.current) return;
        if (activeTaskIdRef.current !== taskId) return;
        setSystemStatus("ready");
        runtime.setAmbientSuspended(false);
      });
    },
    [runtime]
  );

  // The single place a RuntimeEvent becomes an actual state change (spec
  // §19's "RUNTIME EVENTS -> ORCHESTRATOR STATE"). Every case here is the
  // same statement(s) that used to run inline inside the old runSimulation
  // — just reading their data off the event instead of a closure variable.
  // The runtime has already decided WHAT happened and WHEN (and, for
  // human-readable text, already formatted it) — this only decides how
  // that maps onto tasks/activities/messages/agent state.
  const handleRuntimeEvent = useCallback(
    (event: RuntimeEvent) => {
      if (!mountedRef.current) return;

      switch (event.type) {
        case "task_started": {
          runtime.patchAgent(event.agentId, { status: "thinking", currentTask: event.currentTask });
          patchTask(event.taskId, { status: "thinking", startedAt: new Date().toISOString() });
          pushActivity("orchestrator", event.agentId, event.activity);
          onAssign?.(event.agentId);
          break;
        }
        case "message_sent": {
          const message: AgentMessage = {
            id: event.messageId,
            fromAgent: event.from,
            toAgent: event.to,
            taskId: event.taskId,
            type: event.messageType,
            content: event.content,
            status: "traveling",
            createdAt: new Date().toISOString(),
            startedAtMs: Date.now(),
            travelDurationMs: event.travelDurationMs,
          };
          setMessages((prev) => {
            const next = [...prev, message];
            return next.length > MAX_MESSAGES_HISTORY ? next.slice(next.length - MAX_MESSAGES_HISTORY) : next;
          });
          if (event.communication) pushActivity("communication", event.communication.agentId, event.communication.activity);
          break;
        }
        case "message_resolved": {
          setMessages((prev) => prev.map((m) => (m.id === event.messageId ? { ...m, status: "processed" } : m)));
          if (event.communication) {
            pushActivity("communication", event.communication.agentId, event.communication.activity);
            runtime.recordAgentActivity(event.communication.agentId, event.content);
          }
          break;
        }
        case "knowledge_activated": {
          pushActivity("knowledge", event.agentId, event.activity);
          break;
        }
        case "research_activated": {
          pushActivity("research", event.agentId, event.activity);
          break;
        }
        case "project_activated": {
          pushActivity("project", event.agentId, event.activity);
          break;
        }
        case "agent_working": {
          runtime.setAgentStatus(event.agentId, "working");
          if (event.start) {
            runtime.setAgentProgress(event.agentId, event.start.progress);
            patchTask(event.taskId, { status: "working", progress: event.start.progress });
            pushActivity("agent", event.agentId, event.start.activity);
          }
          break;
        }
        case "agent_thinking": {
          runtime.setAgentStatus(event.agentId, "thinking");
          break;
        }
        case "progress": {
          runtime.setAgentProgress(event.agentId, event.progress);
          patchTask(event.taskId, { progress: event.progress });
          break;
        }
        case "task_completed": {
          runtime.patchAgent(event.agentId, { status: "completed", currentTask: event.currentTask });
          patchTask(event.taskId, {
            status: "completed",
            progress: 100,
            completedAt: event.currentTask.completedAt,
            result: event.result.result,
            nextStep: event.result.nextStep,
          });
          resetInvolvedAgents(event.collaboratorIds);
          pushActivity("result", event.agentId, "Simulation completed");
          if (event.projectActivity) pushActivity("project", event.agentId, event.projectActivity);
          setSystemStatus("completed");
          settleAfterDelay(event.taskId);
          break;
        }
        case "task_failed": {
          haltMessagesForTask(event.taskId);
          runtime.patchAgent(event.agentId, { status: "error", currentTask: event.currentTask });
          patchTask(event.taskId, {
            status: "failed",
            completedAt: event.currentTask.completedAt,
            result: event.failure.message,
          });
          resetInvolvedAgents(event.collaboratorIds);
          pushActivity("result", event.agentId, `Simulation failed: ${event.failure.message}`);
          setSystemStatus("error");
          settleAfterDelay(event.taskId);
          break;
        }
        case "task_cancelled": {
          haltMessagesForTask(event.taskId);
          resetInvolvedAgents([event.agentId, ...event.collaboratorIds]);
          patchTask(event.taskId, {
            status: "failed",
            result: "Cancelled by user before completion.",
            completedAt: new Date().toISOString(),
          });
          pushActivity("system", null, "Task cancelled by user");
          setSystemStatus("ready");
          runtime.setAmbientSuspended(false);
          break;
        }
      }
    },
    [haltMessagesForTask, onAssign, patchTask, pushActivity, resetInvolvedAgents, runtime, settleAfterDelay]
  );

  const submitCommand = useCallback(
    (rawCommand: string, context?: CommandContext): SubmitOutcome => {
      const command = rawCommand.trim();
      if (systemStatus === "processing") return { ok: false, reason: "busy" };
      if (!command) return { ok: false, reason: "empty" };
      if (command.length > MAX_COMMAND_LENGTH) return { ok: false, reason: "too-long" };

      // Phase 10 §6/§7 — the SAME interpretation function the live Command
      // Brief preview uses (see commandContext.ts), so what a visitor
      // previewed before pressing Execute is exactly what gets simulated.
      // Falls back to plain "overview" (no selection) when no context is
      // passed at all, which reproduces every prior phase's behavior
      // unchanged for a command with nothing selected.
      const resolvedContext = context ?? getCurrentCommandContext({
        selectedAgentId: null,
        selectedKnowledgeNodeId: null,
        selectedResearchId: null,
        selectedProjectId: null,
        activeTaskId: null,
      });
      const interpretation = resolveCommandInterpretation(command, resolvedContext, agentDirectory);
      const { primary, collaborators, matched, knowledgeContext, researchContext, projectContext } = interpretation;
      const isErrorDemo = ERROR_DEMO_PATTERN.test(command);

      const task: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: command,
        description: matched
          ? `Routed to ${primary.name} based on ${interpretation.usedContext ? "current lab context" : "command content"}.`
          : "Simulation router could not identify a specialized agent — routed to a general-purpose fallback.",
        assignedAgent: primary.id,
        collaborators: collaborators.map((a) => a.id),
        status: "queued",
        progress: 0,
        createdAt: new Date().toISOString(),
        executionMode: "simulation",
        knowledgeContext,
        researchContext,
        projectContext: projectContext.length > 0 ? projectContext : undefined,
        commandContext: toTaskCommandContext(resolvedContext, interpretation),
      };

      setTasks((prev) => [...prev, task]);
      setActiveTaskId(task.id);
      setSystemStatus("processing");
      runtime.setAmbientSuspended(true);
      pushActivity("system", null, "Command received");
      // Phase 10 §19 — the interpretation itself is worth a log line,
      // separate from "Assigned task to X" a moment later (task_started),
      // which is about the assignment relay, not the interpretation
      // decision.
      pushActivity(
        "orchestrator",
        primary.id,
        interpretation.usedContext
          ? `Command interpreted for ${primary.name} using ${interpretation.subjectLabel} context.`
          : `Command interpreted for ${primary.name}.`
      );

      runtimeAdapter.executeTask(
        {
          task,
          command,
          interpretation,
          primaryAgent: primary,
          collaborators,
          knowledgeContext,
          researchContext,
          projectContext,
          isErrorDemo,
        },
        { onEvent: handleRuntimeEvent }
      );

      return { ok: true, matched, task };
    },
    [handleRuntimeEvent, pushActivity, runtime, runtimeAdapter, systemStatus]
  );

  const cancelActiveTask = useCallback(() => {
    if (!activeTaskId) return;
    runtimeAdapter.cancelTask(activeTaskId);
  }, [activeTaskId, runtimeAdapter]);

  // Hides a finished (completed/failed) result — e.g. via Escape. Does
  // nothing while a task is genuinely still running; that's what Cancel is
  // for, and the two shouldn't be reachable through the same key.
  const dismissActiveTask = useCallback(() => {
    if (systemStatus === "processing") return;
    setActiveTaskId(null);
  }, [systemStatus]);

  // Re-opens a past task's result from the history list — only when
  // nothing is currently running, so it can never interrupt a live task.
  const viewTask = useCallback(
    (taskId: string) => {
      if (systemStatus === "processing") return;
      setActiveTaskId(taskId);
    },
    [systemStatus]
  );

  // A full session reset (Phase 9 §21) — cancels any in-flight run first
  // (the resulting task_cancelled event's state patches are harmlessly
  // superseded by the clears below, since React batches every setState
  // call made in this same invocation into one render), then wipes
  // tasks/activities/messages and restores every agent to its original
  // seed state. Nothing here is persisted outside this session, so there's
  // nothing destructive beyond the current tab.
  const resetSession = useCallback(() => {
    if (activeTaskId) {
      runtimeAdapter.cancelTask(activeTaskId);
    }
    setTasks([]);
    setActivities([]);
    setMessages([]);
    setActiveTaskId(null);
    setSystemStatus("ready");
    runtime.resetAgents();
    runtime.setAmbientSuspended(false);
  }, [activeTaskId, runtime, runtimeAdapter]);

  // Clears only the task list (Phase 9 §21) — the activity log and agents
  // are left alone, matching how TaskHistory and ActivityStream already
  // read two independent pieces of state today. Refuses while a task is
  // actually running, same guard as dismissActiveTask.
  const clearTaskHistory = useCallback(() => {
    if (systemStatus === "processing") return;
    setTasks([]);
    setActiveTaskId(null);
  }, [systemStatus]);

  return {
    ...runtime,
    tasks,
    activities,
    messages,
    systemStatus,
    activeTaskId,
    submitCommand,
    cancelActiveTask,
    dismissActiveTask,
    viewTask,
    resetSession,
    clearTaskHistory,
  };
}
