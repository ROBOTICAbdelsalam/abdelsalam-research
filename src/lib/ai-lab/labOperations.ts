import type { Activity, ActivityType, Agent, AgentMessage, SystemStatus, Task } from "./types";
import { ORCHESTRATOR_ID, SYSTEM_ID, KNOWLEDGE_ID } from "./types";

// Pure selectors over the SAME state useAgentOrchestrator/AgentLabProvider
// already own (Phase 9 §3) — the Operations Console reads through these
// instead of keeping any counter, cache or second copy of tasks/activities/
// messages/agents. Every function here is a plain derivation: call it again
// and it recomputes from whatever's passed in, so there's nothing that can
// drift out of sync with the real state.

export function getActiveAgents(agents: Agent[]): Agent[] {
  return agents.filter((a) => a.status !== "idle");
}

export type TaskSummary = {
  total: number;
  queued: number;
  thinking: number;
  working: number;
  completed: number;
  failed: number;
};

export function getTaskSummary(tasks: Task[]): TaskSummary {
  return {
    total: tasks.length,
    queued: tasks.filter((t) => t.status === "queued").length,
    thinking: tasks.filter((t) => t.status === "thinking").length,
    working: tasks.filter((t) => t.status === "working").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };
}

export function getCommunicationSummary(messages: AgentMessage[]) {
  return {
    total: messages.length,
    traveling: messages.filter((m) => m.status === "traveling").length,
    processed: messages.filter((m) => m.status === "processed").length,
  };
}

export function getActivityByType(activities: Activity[], type: ActivityType): Activity[] {
  return activities.filter((a) => a.type === type);
}

export function getRecentOperations(activities: Activity[], limit = 10): Activity[] {
  return [...activities].reverse().slice(0, limit);
}

export function getLastActivityOfType(activities: Activity[], type: ActivityType): Activity | undefined {
  for (let i = activities.length - 1; i >= 0; i -= 1) {
    if (activities[i].type === type) return activities[i];
  }
  return undefined;
}

export function getLastCompletedTask(tasks: Task[]): Task | undefined {
  const completed = tasks.filter((t) => t.status === "completed" || t.status === "failed");
  return completed.length ? completed[completed.length - 1] : undefined;
}

// A descriptive (not quantitative) overall lab state — spec §15/§27:
// IDLE / SIMULATION RUNNING / COMPLETED / SIMULATION ERROR, never a health
// score or percentage. Directly derived from the orchestrator's own
// SystemStatus, just phrased for the console.
export function getLabStatusLabel(systemStatus: SystemStatus): string {
  switch (systemStatus) {
    case "processing":
      return "SIMULATION RUNNING";
    case "completed":
      return "COMPLETED";
    case "error":
      return "SIMULATION ERROR";
    case "ready":
    default:
      return "IDLE";
  }
}

// A coarse, honestly-derived stage label from a task's own progress value —
// not a fabricated pipeline step, just a plain-language read of the number
// already stored on the task (spec §20's "Stage" for a simulation error).
export function getTaskStageLabel(progress: number): string {
  if (progress <= 0) return "Assignment";
  if (progress < 90) return "Collaboration Relay";
  return "Wrap-Up";
}

// Resolves a message participant id to a display name — the same lookup
// AgentInfoPanel's Communications section already needed, centralized here
// so the Operations Console's communication views use the identical logic
// rather than a second copy of it.
export function getParticipantName(id: string, agents: Agent[]): string {
  if (id === ORCHESTRATOR_ID) return "Orchestrator";
  if (id === SYSTEM_ID) return "System";
  if (id === KNOWLEDGE_ID) return "Knowledge Brain";
  return agents.find((a) => a.id === id)?.name ?? id;
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// A plain-text session summary for "Copy Session Log" (spec §22) — only
// real session state, no fabricated metrics. Kept as a pure string builder
// so the UI trigger is just a clipboard write, no export library needed.
export function buildSessionSummaryText({
  agents,
  tasks,
  activities,
  messages,
}: {
  agents: Agent[];
  tasks: Task[];
  activities: Activity[];
  messages: AgentMessage[];
}): string {
  const lines: string[] = [];
  lines.push("ABD AI LAB — SESSION SUMMARY (local simulation)");
  lines.push(`Generated ${new Date().toLocaleString()}`);
  lines.push("");

  lines.push("AGENTS");
  agents.forEach((agent) => {
    lines.push(`- ${agent.name} (${agent.role}) — ${agent.status.toUpperCase()} — ${agent.currentTask.title}`);
  });
  lines.push("");

  lines.push(`TASKS (${tasks.length})`);
  if (tasks.length === 0) {
    lines.push("- No commands submitted this session.");
  }
  tasks.forEach((task) => {
    const agent = agents.find((a) => a.id === task.assignedAgent);
    lines.push(`- [${task.status.toUpperCase()}] ${task.title} — ${agent?.name ?? "Unknown"} (${formatClock(task.createdAt)})`);
    if (task.knowledgeContext.length) lines.push(`    Knowledge: ${task.knowledgeContext.join(", ")}`);
    if (task.researchContext?.length) lines.push(`    Research: ${task.researchContext.join(", ")}`);
    if (task.projectContext?.length) lines.push(`    Project: ${task.projectContext.join(", ")}`);
    if (task.result) lines.push(`    Result: ${task.result.split("\n")[0]}`);
  });
  lines.push("");

  lines.push(`COMMUNICATION (${messages.length} messages)`);
  lines.push(`ACTIVITY LOG (${activities.length} events)`);
  getRecentOperations(activities, activities.length)
    .slice()
    .reverse()
    .forEach((activity) => {
      lines.push(`- ${formatClock(activity.timestamp)} [${activity.type}] ${activity.message}`);
    });
  lines.push("");
  lines.push("Execution mode: simulation. No real AI, external API or production system was involved.");

  return lines.join("\n");
}
