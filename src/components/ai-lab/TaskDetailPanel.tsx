"use client";

import { X } from "lucide-react";
import type { Agent, Task, TaskStatus } from "@/lib/ai-lab/types";
import { TASK_STATUS_META } from "@/lib/ai-lab/statusMeta";
import { TaskResultPanel } from "./TaskResultPanel";

const LIFECYCLE_STAGES: { key: TaskStatus; label: string }[] = [
  { key: "queued", label: "Queued" },
  { key: "thinking", label: "Thinking" },
  { key: "working", label: "Working" },
  { key: "completed", label: "Completed" },
];

// The complete session record for one task (Phase 9 §8) — a thin wrapper
// around the existing TaskResultPanel (CONTEXT/RESULT/EXECUTION are
// already exactly that panel's content, so this reuses it rather than
// re-implementing the same knowledge/research/project chip rendering a
// third time) plus a lifecycle stepper and a clickable agent chip, the two
// pieces TaskResultPanel doesn't already cover. Opened from TaskHistory or
// LabTimeline without disturbing whatever the Command Center currently has
// active — this only reads the one Task object it's given.
export function TaskDetailPanel({
  task,
  agents,
  onClose,
  onSelectAgent,
  onSelectKnowledgeNode,
  onSelectResearch,
  onSelectProject,
}: {
  task: Task;
  agents: Agent[];
  onClose: () => void;
  onSelectAgent: (id: string) => void;
  onSelectKnowledgeNode: (id: string) => void;
  onSelectResearch: (id: string) => void;
  onSelectProject: (id: string) => void;
}) {
  const failed = task.status === "failed";
  const reachedIndex = failed ? -1 : LIFECYCLE_STAGES.findIndex((s) => s.key === task.status);
  const assignedAgent = agents.find((a) => a.id === task.assignedAgent);

  return (
    <div className="rounded-2xl border border-border-strong bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Task Detail — {new Date(task.createdAt).toLocaleString()}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close task detail"
          className="shrink-0 rounded-full border border-border p-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <X size={13} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Task lifecycle">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const reached = !failed && i <= reachedIndex;
          return (
            <span key={stage.key} className="flex items-center gap-1.5">
              <span
                className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                style={{
                  borderColor: reached ? TASK_STATUS_META[stage.key].hex : "var(--border)",
                  color: reached ? TASK_STATUS_META[stage.key].hex : "var(--muted)",
                }}
              >
                {stage.label}
              </span>
              {i < LIFECYCLE_STAGES.length - 1 && <span className="text-muted/40">→</span>}
            </span>
          );
        })}
        {failed && (
          <span
            className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
            style={{ borderColor: TASK_STATUS_META.failed.hex, color: TASK_STATUS_META.failed.hex }}
          >
            Failed
          </span>
        )}
      </div>

      {assignedAgent && (
        <button
          type="button"
          onClick={() => onSelectAgent(assignedAgent.id)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${assignedAgent.tone})` }} aria-hidden />
          {assignedAgent.name}
        </button>
      )}

      <div className="mt-4">
        <TaskResultPanel
          task={task}
          agents={agents}
          onSelectKnowledgeNode={onSelectKnowledgeNode}
          onSelectResearch={onSelectResearch}
          onSelectProject={onSelectProject}
        />
      </div>
    </div>
  );
}
