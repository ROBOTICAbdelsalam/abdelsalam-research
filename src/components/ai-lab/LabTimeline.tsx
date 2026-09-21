"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { ActivityType } from "@/lib/ai-lab/types";
import { TASK_STATUS_META } from "@/lib/ai-lab/statusMeta";
import { getParticipantName } from "@/lib/ai-lab/labOperations";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { TaskDetailPanel } from "./TaskDetailPanel";
import { useAgentLab } from "./AgentLabProvider";

const TYPE_TONE: Record<ActivityType, string> = {
  system: "var(--muted)",
  orchestrator: "var(--accent)",
  agent: "var(--trace)",
  communication: "var(--violet)",
  knowledge: "var(--gold)",
  research: "var(--trace)",
  project: "var(--gold)",
  task: "var(--amber)",
  result: "var(--signal-green)",
};

type FilterKey = "all" | "tasks" | "communication" | "knowledge" | "research" | "projects" | "agents" | "system";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tasks", label: "Tasks" },
  { key: "communication", label: "Communication" },
  { key: "knowledge", label: "Knowledge" },
  { key: "research", label: "Research" },
  { key: "projects", label: "Projects" },
  { key: "agents", label: "Agents" },
  { key: "system", label: "System" },
];

const GENERIC_TYPES: Partial<Record<FilterKey, ActivityType[]>> = {
  knowledge: ["knowledge"],
  research: ["research"],
  projects: ["project"],
  agents: ["agent"],
  system: ["system", "orchestrator"],
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// A higher-level session timeline over the SAME activity/task/message
// state ActivityStream/TaskHistory already read (Phase 9 §6) — not a
// second event store. "Tasks" and "Communication" render structured rows
// (real Task/AgentMessage records, each clickable through to a task's full
// detail or an agent's own selection) since that data supports it;
// everything else renders the same activity log lines ActivityStream
// shows, just in this console's taller, grouped context.
export function LabTimeline() {
  const {
    agents,
    tasks,
    activities,
    messages,
    setSelectedAgentId,
    setSelectedKnowledgeNodeId,
    setSelectedResearchId,
    setSelectedProjectId,
  } = useAgentLab();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;
  const genericTypes = GENERIC_TYPES[filter];
  const orderedActivities = [...activities].reverse();
  const orderedTasks = [...tasks].reverse();
  const orderedMessages = [...messages].reverse().slice(0, 30);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Session Timeline</p>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter the session timeline">
        {FILTERS.map((item) => {
          const active = item.key === filter;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={active}
              className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-h-96 space-y-2 overflow-y-auto pr-1" aria-live="polite">
        {filter === "tasks" &&
          (orderedTasks.length === 0 ? (
            <p className="text-xs text-muted">No commands submitted yet this session.</p>
          ) : (
            orderedTasks.map((task) => {
              const agent = agents.find((a) => a.id === task.assignedAgent);
              const statusMeta = TASK_STATUS_META[task.status];
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => setSelectedTaskId(task.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors hover:bg-background"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusMeta.hex }} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-foreground">{task.title}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">{agent?.name ?? "—"}</span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted/70">{formatTime(task.createdAt)}</span>
                </button>
              );
            })
          ))}

        {filter === "communication" &&
          (orderedMessages.length === 0 ? (
            <p className="text-xs text-muted">No communication yet this session.</p>
          ) : (
            orderedMessages.map((message) => {
              const task = tasks.find((t) => t.id === message.taskId);
              return (
                <div key={message.id} className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedAgentId(message.fromAgent)}
                    className="font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
                  >
                    {getParticipantName(message.fromAgent, agents)}
                  </button>
                  <ArrowRight size={11} className="shrink-0 text-muted/50" aria-hidden />
                  <button
                    type="button"
                    onClick={() => setSelectedAgentId(message.toAgent)}
                    className="font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
                  >
                    {getParticipantName(message.toAgent, agents)}
                  </button>
                  {task && (
                    <button
                      type="button"
                      onClick={() => setSelectedTaskId(task.id)}
                      className="min-w-0 flex-1 truncate text-left text-muted/80 transition-colors hover:text-foreground"
                    >
                      {task.title}
                    </button>
                  )}
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted/60">{message.status}</span>
                </div>
              );
            })
          ))}

        {filter !== "tasks" &&
          filter !== "communication" &&
          (() => {
            const list = genericTypes ? orderedActivities.filter((a) => genericTypes.includes(a.type)) : orderedActivities;
            if (list.length === 0) return <p className="text-xs text-muted">No activity yet.</p>;
            return list.map((activity) => {
              const agent = activity.agentId ? agents.find((a) => a.id === activity.agentId) : undefined;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                  className="flex items-start gap-3 text-xs"
                >
                  <span className="shrink-0 font-mono tabular-nums text-muted/60">{formatTime(activity.timestamp)}</span>
                  <span
                    className="shrink-0 font-mono font-semibold uppercase tracking-wide"
                    style={{ color: TYPE_TONE[activity.type] }}
                  >
                    {agent ? agent.name.toUpperCase() : activity.type.toUpperCase()}
                  </span>
                  <span className="text-muted">{activity.message}</span>
                </motion.div>
              );
            });
          })()}
      </div>

      {selectedTask && (
        <div className="mt-4">
          <TaskDetailPanel
            task={selectedTask}
            agents={agents}
            onClose={() => setSelectedTaskId(null)}
            onSelectAgent={setSelectedAgentId}
            onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
            onSelectResearch={setSelectedResearchId}
            onSelectProject={setSelectedProjectId}
          />
        </div>
      )}
    </div>
  );
}
