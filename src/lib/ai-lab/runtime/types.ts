import type { Agent, ExecutionMode, MessageType, Task, TaskStatus } from "../types";
import type { CommandInterpretation } from "../commandContext";

// Phase 11 — the runtime boundary. Everything an AgentRuntimeAdapter needs
// to run a task, and everything it can report back, lives here. This file
// defines the SHAPE of that boundary only — SimulationRuntime (see
// simulationRuntime.ts) is the one implementation that exists today.
//
// The point of drawing this line now is so a later phase could add a real
// runtime adapter (an actual LLM/agent framework/robotics link — see the
// "FUTURE BACKEND BOUNDARY" note in simulationRuntime.ts) by implementing
// AgentRuntimeAdapter again, without touching useAgentOrchestrator.ts,
// commandContext.ts, or any UI component. Nothing in this file makes that
// connection real — there is still exactly one adapter, and it is still a
// local, deterministic simulation.

// Re-exported so runtime code has one import path for it, but it's the
// SAME type Task.executionMode already uses (types.ts) — not a parallel
// definition. Only "simulation" exists; see simulationRuntime.ts's own note
// on why fake future modes aren't listed here.
export type { ExecutionMode };

// What THIS adapter actually supports — reported, not assumed, so a caller
// never has to guess. A future adapter with different abilities (e.g. no
// cancellation mid-flight) would report its own honest set here instead of
// this one being treated as a universal default.
export type RuntimeCapabilities = {
  supportsStreaming: boolean;
  supportsCancellation: boolean;
  supportsAgentMessages: boolean;
  supportsKnowledgeContext: boolean;
  supportsResearchContext: boolean;
  supportsProjectContext: boolean;
};

// Everything a task execution needs, gathered once at submission time by
// useAgentOrchestrator.ts from the SAME command interpretation the Command
// Brief already previewed (commandContext.ts's resolveCommandInterpretation)
// — never re-derived or re-interpreted by the runtime itself (spec §23:
// "exactly one interpretation source"). knowledgeContext/researchContext/
// projectContext are carried alongside the full `interpretation` (which
// already contains them) because they're also the exact arrays already
// resolved onto `task` — passed through, not recomputed.
export type RuntimeTaskInput = {
  task: Task;
  command: string;
  interpretation: CommandInterpretation;
  primaryAgent: Agent;
  collaborators: Agent[];
  knowledgeContext: string[];
  researchContext: string[];
  projectContext: string[];
  // Spec §11 — the deterministic "simulate error" demo path stays a
  // property of the INPUT (an orchestrator-level decision about the raw
  // command text, see ERROR_DEMO_PATTERN in useAgentOrchestrator.ts), not
  // something the runtime decides on its own.
  isErrorDemo: boolean;
};

// A structured, honest completion payload (spec §12) — no quantitative
// metrics, no fabricated confidence. `result`/`nextStep` are the same
// template-based strings resultTemplates.ts has always produced.
export type RuntimeResult = {
  result: string;
  nextStep: string;
  executionMode: ExecutionMode;
  context: {
    knowledgeContext: string[];
    researchContext: string[];
    projectContext: string[];
  };
};

// A structured failure (spec §11) — a code/message/stage triple, never a
// raw stack trace. The UI keeps showing its own fixed "SIMULATION ERROR"
// copy; this is what the orchestrator receives, not what a visitor sees.
export type RuntimeFailure = {
  code: string;
  message: string;
  stage: TaskStatus;
};

// The runtime's own event vocabulary (spec §6) — one union, not a generic
// pub/sub bus (spec §7: no EventBus/Redux/Zustand). Every variant maps to a
// piece of state useAgentOrchestrator.ts already owned directly before this
// phase (tasks/activities/messages/agent status) — nothing here represents
// behavior that didn't already exist. Text fields the UI ultimately renders
// (`activity`) are pre-formatted by the runtime, which is the layer that
// actually knows what happened — the orchestrator's job is just to apply
// each event to the right piece of state, not to re-derive what it means.
export type RuntimeEvent =
  | { type: "task_started"; taskId: string; agentId: string; currentTask: Task; activity: string }
  | {
      type: "message_sent";
      taskId: string;
      messageId: string;
      from: string;
      to: string;
      messageType: MessageType;
      content: string;
      travelDurationMs: number;
      communication?: { agentId: string; activity: string };
    }
  | {
      type: "message_resolved";
      taskId: string;
      messageId: string;
      from: string;
      to: string;
      messageType: MessageType;
      content: string;
      communication?: { agentId: string; activity: string };
    }
  | { type: "knowledge_activated"; taskId: string; phase: "linked" | "supplied"; agentId: string | null; activity: string }
  | { type: "research_activated"; taskId: string; agentId: string; activity: string }
  | { type: "project_activated"; taskId: string; agentId: string; activity: string }
  | { type: "agent_working"; taskId: string; agentId: string; start?: { progress: number; currentTask: Task; activity: string } }
  | { type: "agent_thinking"; taskId: string; agentId: string }
  | { type: "progress"; taskId: string; agentId: string; progress: number }
  | {
      type: "task_completed";
      taskId: string;
      agentId: string;
      collaboratorIds: string[];
      currentTask: Task;
      result: RuntimeResult;
      // Set only when this task had a project context — the "${title}
      // project simulation completed." Activity Stream line, pre-formatted
      // by the runtime (it already knows the project) for the orchestrator
      // to push right after the fixed "Simulation completed" line, exactly
      // matching pre-Phase-11 ordering.
      projectActivity?: string;
    }
  | { type: "task_failed"; taskId: string; agentId: string; collaboratorIds: string[]; currentTask: Task; failure: RuntimeFailure }
  | { type: "task_cancelled"; taskId: string; agentId: string; collaboratorIds: string[] };

export type RuntimeEventHandlers = {
  onEvent: (event: RuntimeEvent) => void;
};

// The runtime boundary itself (spec §3). useAgentOrchestrator.ts talks to
// whatever implements this — today, always SimulationRuntime — and never to
// task-lifecycle timing directly.
export type AgentRuntimeAdapter = {
  getExecutionMode: () => ExecutionMode;
  getCapabilities: () => RuntimeCapabilities;
  executeTask: (input: RuntimeTaskInput, handlers: RuntimeEventHandlers) => void;
  cancelTask: (taskId: string) => void;
};
