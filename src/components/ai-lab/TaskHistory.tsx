"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { TASK_STATUS_META } from "@/lib/ai-lab/statusMeta";
import { getKnowledgeForTask } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchForTask } from "@/lib/ai-lab/researchGraph";
import { getProjectsForTask } from "@/lib/ai-lab/projectGraph";
import { useAgentLab } from "./AgentLabProvider";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit" });
}

// Session-only task history (spec §19), extended in Phase 9 §7 with
// progressive disclosure: collapsed (command/agent/status, as before) vs
// expanded (context/result/next step) per row via a small chevron toggle,
// independent of the existing click-to-view-in-Command-Center behavior —
// clicking a row still calls viewTask exactly as it always has.
export function TaskHistory() {
  const { tasks, agents, viewTask } = useAgentLab();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const ordered = [...tasks].reverse();

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Task History</p>
      <div className="mt-3 max-h-80 space-y-1.5 overflow-y-auto pr-1">
        {ordered.length === 0 && <p className="text-xs text-muted">No commands submitted yet this session.</p>}
        {ordered.map((task) => {
          const agent = agents.find((a) => a.id === task.assignedAgent);
          const statusMeta = TASK_STATUS_META[task.status];
          const hasResult = Boolean(task.result);
          const expanded = expandedId === task.id;
          const knowledgeContext = getKnowledgeForTask(task.knowledgeContext);
          const researchContext = getResearchForTask(task.researchContext);
          const projectContext = getProjectsForTask(task.projectContext);

          return (
            <div key={task.id} className="rounded-lg">
              <div className="flex w-full items-center gap-2">
                <button
                  type="button"
                  onClick={() => hasResult && viewTask(task.id)}
                  disabled={!hasResult}
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors enabled:hover:bg-background disabled:cursor-default"
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusMeta.hex }} aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-xs text-foreground">{task.title}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {agent?.name ?? "—"}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted/70">
                    {formatTime(task.createdAt)}
                  </span>
                </button>
                {hasResult && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : task.id)}
                    aria-expanded={expanded}
                    aria-label={expanded ? "Hide task context" : "Show task context"}
                    className="shrink-0 rounded-full p-1 text-muted transition-colors hover:text-foreground"
                  >
                    <ChevronDown size={13} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />
                  </button>
                )}
              </div>

              {expanded && (
                <div className="ml-2 mt-1 space-y-2 border-l border-border pb-2 pl-4 text-xs">
                  {task.commandContext && (
                    <p className="text-muted">
                      <span className="text-muted/60">Interpreted as — </span>
                      {task.commandContext.intentLabel}
                      {task.commandContext.usedContext ? ` (using ${task.commandContext.subjectLabel} context)` : ""}
                    </p>
                  )}
                  {task.collaborators.length > 0 && (
                    <p className="text-muted">
                      <span className="text-muted/60">Collaborators — </span>
                      {task.collaborators
                        .map((id) => agents.find((a) => a.id === id)?.name)
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                  {knowledgeContext.length > 0 && (
                    <p className="text-muted">
                      <span className="text-muted/60">Knowledge — </span>
                      {knowledgeContext.map((n) => n.label).join(" · ")}
                    </p>
                  )}
                  {researchContext.length > 0 && (
                    <p className="text-muted">
                      <span className="text-muted/60">Research — </span>
                      {researchContext.map((r) => r.title).join(", ")}
                    </p>
                  )}
                  {projectContext.length > 0 && (
                    <p className="text-muted">
                      <span className="text-muted/60">Project — </span>
                      {projectContext.map((p) => p.title).join(", ")}
                    </p>
                  )}
                  {task.result && <p className="text-foreground/90">{task.result}</p>}
                  {task.nextStep && (
                    <p className="text-muted">
                      <span className="text-muted/60">Next step — </span>
                      {task.nextStep}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
