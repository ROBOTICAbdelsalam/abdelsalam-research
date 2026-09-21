import { agents as agentDirectory } from "@/data/ai-lab";
import { buildCommunicationSteps, contentForStep, type CommunicationStep } from "../communicationScript";
import { getKnowledgeNode } from "../knowledgeGraph";
import { getProject } from "../projectGraph";
import { resolveParticipantPosition, travelDurationFor } from "../layout";
import { generateResult, FAILURE_REASON } from "../resultTemplates";
import { KNOWLEDGE_ID } from "../types";
import type { Agent, MessageType } from "../types";
import type { AgentRuntimeAdapter, RuntimeCapabilities, RuntimeEvent, RuntimeEventHandlers, RuntimeFailure, RuntimeResult, RuntimeTaskInput } from "./types";

// Phase 11 — SimulationRuntime. This is the ONE AgentRuntimeAdapter
// implementation that exists today. It is the exact task-lifecycle timing
// and sequencing that used to live inline inside useAgentOrchestrator.ts's
// runSimulation (Phases 4-10) — moved here unchanged in substance, just
// restructured to report what happens through RuntimeEvent instead of
// calling React state setters directly. useAgentOrchestrator.ts owns every
// piece of state (tasks/activities/messages/agents); this file never
// imports React and never touches that state itself — it only describes,
// through events, what a local simulation run does and when.
//
// FUTURE BACKEND BOUNDARY: a later phase could add a second
// AgentRuntimeAdapter implementation that instead calls a real LLM
// provider, an actual multi-agent framework, MCP tools, or a robotics
// system, and hand it to useAgentOrchestrator in place of this one. That
// adapter would receive the exact same RuntimeTaskInput and would report
// back through the exact same RuntimeEvent/RuntimeResult/RuntimeFailure
// shapes — nothing in useAgentOrchestrator.ts, commandContext.ts or any UI
// component would need to change. No such adapter exists yet, and nothing
// in this file connects to a real service.

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const agentsById = new Map<string, Agent>(agentDirectory.map((a) => [a.id, a]));

const CAPABILITIES: RuntimeCapabilities = {
  supportsStreaming: false,
  supportsCancellation: true,
  supportsAgentMessages: true,
  supportsKnowledgeContext: true,
  supportsResearchContext: true,
  supportsProjectContext: true,
};

type SimMessage = {
  id: string;
  from: string;
  to: string;
  type: MessageType;
  content: string;
  travelDurationMs: number;
};

function createMessage(from: string, to: string, type: MessageType, content: string): SimMessage {
  const fromPos = resolveParticipantPosition(from, agentDirectory);
  const toPos = resolveParticipantPosition(to, agentDirectory);
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from,
    to,
    type,
    content,
    travelDurationMs: travelDurationFor(fromPos, toPos),
  };
}

function messageSentEvent(taskId: string, msg: SimMessage, communication?: { agentId: string; activity: string }): RuntimeEvent {
  return {
    type: "message_sent",
    taskId,
    messageId: msg.id,
    from: msg.from,
    to: msg.to,
    messageType: msg.type,
    content: msg.content,
    travelDurationMs: msg.travelDurationMs,
    communication,
  };
}

function messageResolvedEvent(taskId: string, msg: SimMessage, communication?: { agentId: string; activity: string }): RuntimeEvent {
  return {
    type: "message_resolved",
    taskId,
    messageId: msg.id,
    from: msg.from,
    to: msg.to,
    messageType: msg.type,
    content: msg.content,
    communication,
  };
}

// Mirrors the pre-Phase-11 logCommunication helper exactly: only a leg
// between two real agents (never the orchestrator/system/knowledge
// sentinels) gets a "Sent/Received" Activity Stream line — see
// ORCHESTRATOR_ID/SYSTEM_ID/KNOWLEDGE_ID in types.ts, none of which are in
// agentsById.
function communicationFor(phase: "send" | "receive", step: CommunicationStep) {
  const fromAgent = agentsById.get(step.from);
  const toAgent = agentsById.get(step.to);
  if (!fromAgent || !toAgent) return undefined;
  return phase === "send"
    ? { agentId: fromAgent.id, activity: `Sent ${step.type} to ${toAgent.name}` }
    : { agentId: toAgent.id, activity: `Received ${step.type} from ${fromAgent.name}` };
}

type ActiveRun = {
  token: { taskId: string; cancelled: boolean };
  input: RuntimeTaskInput;
  handlers: RuntimeEventHandlers;
};

export function createSimulationRuntime(): AgentRuntimeAdapter {
  let active: ActiveRun | null = null;

  function cancelTask(taskId: string) {
    if (!active || active.token.taskId !== taskId || active.token.cancelled) return;
    active.token.cancelled = true;
    const { input, handlers } = active;
    active = null;
    handlers.onEvent({
      type: "task_cancelled",
      taskId,
      agentId: input.primaryAgent.id,
      collaboratorIds: input.collaborators.map((c) => c.id),
    });
  }

  async function run(input: RuntimeTaskInput, handlers: RuntimeEventHandlers) {
    const { task, primaryAgent: primary, collaborators, isErrorDemo } = input;
    const token = { taskId: task.id, cancelled: false };
    active = { token, input, handlers };
    const stillActive = () => active?.token === token && !token.cancelled;
    const collaboratorIds = collaborators.map((c) => c.id);

    await wait(500);
    if (!stillActive()) return;

    handlers.onEvent({
      type: "task_started",
      taskId: task.id,
      agentId: primary.id,
      currentTask: { ...task, status: "thinking" },
      activity: `Assigned task to ${primary.name}`,
    });

    const steps = buildCommunicationSteps(primary, collaborators);
    const middleSteps = steps.slice(1, steps.length - 2);
    const assignStep = steps[0];
    const resultStep = steps[steps.length - 2];
    const finalStep = steps[steps.length - 1];

    // --- Leg 1: orchestrator -> primary (the assignment itself) ---
    const assignMessage = createMessage(assignStep.from, assignStep.to, assignStep.type, contentForStep(assignStep, task.title, agentsById));
    handlers.onEvent(messageSentEvent(task.id, assignMessage));
    await wait(assignMessage.travelDurationMs);
    if (!stillActive()) return;
    handlers.onEvent(messageResolvedEvent(task.id, assignMessage));

    // --- Knowledge Brain supplies context ---
    const primaryContextNode = getKnowledgeNode(input.knowledgeContext[0] ?? "");
    if (primaryContextNode) {
      await wait(300);
      if (!stillActive()) return;
      handlers.onEvent({
        type: "knowledge_activated",
        taskId: task.id,
        phase: "linked",
        agentId: null,
        activity: `${primaryContextNode.label} context linked.`,
      });
      const knowledgeMessage = createMessage(KNOWLEDGE_ID, primary.id, "context", `${primaryContextNode.label} context available.`);
      handlers.onEvent(messageSentEvent(task.id, knowledgeMessage));
      await wait(knowledgeMessage.travelDurationMs);
      if (!stillActive()) return;
      handlers.onEvent(messageResolvedEvent(task.id, knowledgeMessage));
      handlers.onEvent({
        type: "knowledge_activated",
        taskId: task.id,
        phase: "supplied",
        agentId: primary.id,
        activity: `${primaryContextNode.label} knowledge supplied to ${primary.name}.`,
      });
    }

    // --- Research context resolves ---
    const primaryResearchId = input.researchContext[0];
    const primaryResearchLabel = primaryResearchId ? getKnowledgeNode(primaryResearchId)?.label : undefined;
    if (primaryResearchId && primaryResearchLabel) {
      await wait(250);
      if (!stillActive()) return;
      handlers.onEvent({
        type: "research_activated",
        taskId: task.id,
        agentId: primary.id,
        activity: `${primaryResearchLabel} research context linked.`,
      });
    }

    // --- Project context activates ---
    const primaryProjectId = input.projectContext[0];
    const primaryProject = primaryProjectId ? getProject(primaryProjectId) : undefined;
    if (primaryProject) {
      await wait(250);
      if (!stillActive()) return;
      handlers.onEvent({
        type: "project_activated",
        taskId: task.id,
        agentId: primary.id,
        activity: `${primaryProject.title} project context activated.`,
      });
    }

    await wait(700);
    if (!stillActive()) return;
    handlers.onEvent({
      type: "agent_working",
      taskId: task.id,
      agentId: primary.id,
      start: {
        progress: 10,
        currentTask: { ...task, status: "working", progress: 10 },
        activity: "Started processing",
      },
    });

    // --- Middle legs: the actual agent <-> agent relay ---
    const totalMiddle = Math.max(1, middleSteps.length);
    for (let i = 0; i < middleSteps.length; i++) {
      await wait(400);
      if (!stillActive()) return;

      const step = middleSteps[i];
      const content = contentForStep(step, task.title, agentsById);
      const message = createMessage(step.from, step.to, step.type, content);
      handlers.onEvent(messageSentEvent(task.id, message, communicationFor("send", step)));
      handlers.onEvent({ type: "agent_working", taskId: task.id, agentId: step.from });

      await wait(message.travelDurationMs);
      if (!stillActive()) return;
      handlers.onEvent(messageResolvedEvent(task.id, message, communicationFor("receive", step)));
      handlers.onEvent({ type: "agent_thinking", taskId: task.id, agentId: step.to });

      const progress = 10 + Math.round(((i + 1) / totalMiddle) * 75);
      handlers.onEvent({ type: "progress", taskId: task.id, agentId: primary.id, progress });

      if (isErrorDemo && i === 0) {
        await wait(400);
        if (!stillActive()) return;
        emitFailure();
        if (active?.token === token) active = null;
        return;
      }
    }

    if (isErrorDemo && middleSteps.length === 0) {
      await wait(400);
      if (!stillActive()) return;
      emitFailure();
      if (active?.token === token) active = null;
      return;
    }

    await wait(500);
    if (!stillActive()) return;

    // --- Wrap-up: primary -> orchestrator -> system ---
    const resultMessage = createMessage(resultStep.from, resultStep.to, resultStep.type, contentForStep(resultStep, task.title, agentsById));
    handlers.onEvent(messageSentEvent(task.id, resultMessage));
    await wait(resultMessage.travelDurationMs);
    if (!stillActive()) return;
    handlers.onEvent(messageResolvedEvent(task.id, resultMessage));

    const finalMessage = createMessage(finalStep.from, finalStep.to, finalStep.type, contentForStep(finalStep, task.title, agentsById));
    handlers.onEvent(messageSentEvent(task.id, finalMessage));
    await wait(finalMessage.travelDurationMs);
    if (!stillActive()) return;
    handlers.onEvent(messageResolvedEvent(task.id, finalMessage));

    const { summary, nextStep } = generateResult(primary, collaborators);
    const completedAt = new Date().toISOString();
    const result: RuntimeResult = {
      result: summary,
      nextStep,
      executionMode: "simulation",
      context: {
        knowledgeContext: input.knowledgeContext,
        researchContext: input.researchContext,
        projectContext: input.projectContext,
      },
    };
    handlers.onEvent({
      type: "task_completed",
      taskId: task.id,
      agentId: primary.id,
      collaboratorIds,
      currentTask: { ...task, status: "completed", progress: 100, completedAt, result: summary, nextStep },
      result,
      projectActivity: primaryProject ? "Project simulation completed." : undefined,
    });
    if (active?.token === token) active = null;

    function emitFailure() {
      const completedAtFailure = new Date().toISOString();
      const failure: RuntimeFailure = { code: "SIMULATED_ERROR", message: FAILURE_REASON, stage: "working" };
      handlers.onEvent({
        type: "task_failed",
        taskId: task.id,
        agentId: primary.id,
        collaboratorIds,
        currentTask: { ...task, status: "failed", completedAt: completedAtFailure, result: FAILURE_REASON },
        failure,
      });
    }
  }

  return {
    getExecutionMode: () => "simulation",
    getCapabilities: () => CAPABILITIES,
    executeTask: (input, handlers) => {
      void run(input, handlers);
    },
    cancelTask,
  };
}
