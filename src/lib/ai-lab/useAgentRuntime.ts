"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { agents as seedAgents } from "@/data/ai-lab";
import type { Agent, AgentStatus, Task } from "./types";

export type AgentRuntime = {
  agents: Agent[];
  setAgentStatus: (agentId: string, status: AgentStatus) => void;
  setAgentProgress: (agentId: string, progress: number) => void;
  assignAgentTask: (agentId: string, task: Task) => void;
  clearAgentTask: (agentId: string) => void;
  completeAgentTask: (agentId: string) => void;
  recordAgentActivity: (agentId: string, message: string) => void;
  // A generic escape hatch alongside the named actions above — the
  // orchestrator (useAgentOrchestrator.ts) needs to set several fields on
  // an agent atomically (status + currentTask together) at each simulation
  // step, and a narrow setter per possible combination would multiply
  // faster than it clarifies anything.
  patchAgent: (agentId: string, patch: Partial<Agent>) => void;
  // Pauses the ambient "feels alive" ticker below — the orchestrator calls
  // this while it's actively driving a real command, so the two simulations
  // never fight over the same agent's status.
  setAmbientSuspended: (suspended: boolean) => void;
  // Restores every agent to its original seed state (Phase 9 §21's "Reset
  // Lab Session") — since `agents` starts as a plain copy of the seed data
  // and every mutation above only ever replaces entries, resetting is just
  // going back to that same seed array, not a bespoke revert path.
  resetAgents: () => void;
};

const COMPLETED_REVERT_MS = 4000;
const ERROR_REVERT_MS = 5500;
const AMBIENT_TICK_MS = 12000;

// The natural next step for the ambient simulation to nudge an agent
// through. Agents already "completed" or "error" are left alone — those
// are terminal-for-now states a human (or the orchestrator) resolves.
// Typed to this narrower union (rather than AgentStatus) because these
// three values are also valid TaskStatus values, and the ticker writes the
// same step into both the agent's status and its currentTask.status.
type AmbientStep = "thinking" | "working" | "completed";
const AMBIENT_NEXT_STATUS: Partial<Record<AgentStatus, AmbientStep>> = {
  idle: "thinking",
  waiting: "thinking",
  thinking: "working",
  working: "completed",
};

// This hook is the "AgentRuntime" (and, since nothing live exists yet, also
// the "SimulationRuntime") in the conceptual chain the spec describes:
//
//   CommandCenter -> AgentOrchestrator -> AgentRuntime -> SimulationRuntime
//                                                          -> (future) LiveAgentRuntime
//
// Everything here is in-memory and session-only: no network calls, no
// persistence, no real task execution. useAgentOrchestrator.ts is the layer
// above this one — it owns command routing and the task timeline, and
// calls into these mutators rather than touching `agents` state directly,
// so there's exactly one place agent state actually changes.
export function useAgentRuntime(): AgentRuntime {
  const [agents, setAgents] = useState<Agent[]>(seedAgents);
  const pendingReverts = useRef<Set<string>>(new Set());

  const updateAgent = useCallback((agentId: string, updater: (agent: Agent) => Agent) => {
    setAgents((prev) => prev.map((a) => (a.id === agentId ? updater(a) : a)));
  }, []);

  const patchAgent = useCallback(
    (agentId: string, patch: Partial<Agent>) => {
      updateAgent(agentId, (a) => ({ ...a, ...patch }));
    },
    [updateAgent]
  );

  const setAgentStatus = useCallback(
    (agentId: string, status: AgentStatus) => {
      updateAgent(agentId, (a) => ({ ...a, status }));
    },
    [updateAgent]
  );

  const setAgentProgress = useCallback(
    (agentId: string, progress: number) => {
      const clamped = Math.max(0, Math.min(100, progress));
      updateAgent(agentId, (a) => ({ ...a, currentTask: { ...a.currentTask, progress: clamped } }));
    },
    [updateAgent]
  );

  const assignAgentTask = useCallback(
    (agentId: string, task: Task) => {
      updateAgent(agentId, (a) => ({ ...a, currentTask: task }));
    },
    [updateAgent]
  );

  const clearAgentTask = useCallback(
    (agentId: string) => {
      updateAgent(agentId, (a) => ({
        ...a,
        status: "idle",
        currentTask: { ...a.currentTask, status: "queued", progress: 0 },
      }));
    },
    [updateAgent]
  );

  const completeAgentTask = useCallback(
    (agentId: string) => {
      updateAgent(agentId, (a) => ({
        ...a,
        status: "completed",
        currentTask: {
          ...a.currentTask,
          status: "completed",
          progress: 100,
          completedAt: new Date().toISOString(),
        },
      }));
    },
    [updateAgent]
  );

  const recordAgentActivity = useCallback(
    (agentId: string, message: string) => {
      updateAgent(agentId, (a) => ({
        ...a,
        lastActivity: {
          id: `${agentId}-${Date.now()}`,
          type: "agent",
          agentId,
          message,
          timestamp: new Date().toISOString(),
        },
      }));
    },
    [updateAgent]
  );

  // Auto-revert "completed" or "error" back to "idle" after a few seconds —
  // driven by watching committed state rather than scheduling timers inside
  // a setState updater (which React may invoke more than once). The guard
  // inside the timeout means a manual status change during that window
  // simply makes this a no-op instead of clobbering it. "error" gets a
  // longer window — it's a rarer, more significant event worth letting the
  // visitor actually read before the workstation resets (spec §22: "reset
  // the involved agents safely").
  useEffect(() => {
    agents.forEach((agent) => {
      if (
        (agent.status === "completed" || agent.status === "error") &&
        !pendingReverts.current.has(agent.id)
      ) {
        pendingReverts.current.add(agent.id);
        const revertingFrom = agent.status;
        setTimeout(
          () => {
            pendingReverts.current.delete(agent.id);
            setAgents((prev) =>
              prev.map((a) => (a.id === agent.id && a.status === revertingFrom ? { ...a, status: "idle" } : a))
            );
          },
          revertingFrom === "error" ? ERROR_REVERT_MS : COMPLETED_REVERT_MS
        );
      }
    });
  }, [agents]);

  // Ambient simulation: every so often, nudge one random eligible agent one
  // step forward, so the lab reads as "alive" without requiring a visitor
  // to touch anything. Deliberately a several-second cadence, not a
  // per-frame loop, and it never touches an agent mid-completion-revert.
  // Skipped while the orchestrator is actively running a real command —
  // see useAgentOrchestrator.ts, which pauses this via `suspended`.
  const suspendedRef = useRef(false);
  const setAmbientSuspended = useCallback((suspended: boolean) => {
    suspendedRef.current = suspended;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (suspendedRef.current) return;
      setAgents((prev) => {
        const candidates = prev.filter((a) => AMBIENT_NEXT_STATUS[a.status] !== undefined);
        if (candidates.length === 0) return prev;
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        const next = AMBIENT_NEXT_STATUS[target.status];
        if (!next) return prev;
        return prev.map((a) => {
          if (a.id !== target.id) return a;
          const progress = next === "completed" ? 100 : Math.min(96, a.currentTask.progress + 22);
          return {
            ...a,
            status: next,
            currentTask: { ...a.currentTask, progress, status: next },
          };
        });
      });
    }, AMBIENT_TICK_MS);

    return () => clearInterval(interval);
  }, []);

  const resetAgents = useCallback(() => {
    setAgents(seedAgents);
  }, []);

  return {
    agents,
    setAgentStatus,
    setAgentProgress,
    assignAgentTask,
    clearAgentTask,
    completeAgentTask,
    recordAgentActivity,
    patchAgent,
    setAmbientSuspended,
    resetAgents,
  };
}
