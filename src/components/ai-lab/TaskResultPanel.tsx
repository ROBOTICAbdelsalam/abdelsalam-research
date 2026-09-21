import Link from "next/link";
import { CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import type { Agent, Task } from "@/lib/ai-lab/types";
import { getKnowledgeForTask, getKnowledgeNode, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchForTask } from "@/lib/ai-lab/researchGraph";
import { getProjectsForTask } from "@/lib/ai-lab/projectGraph";

function formatDuration(task: Task): string {
  if (!task.startedAt || !task.completedAt) return "—";
  const seconds = (new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000;
  return `${seconds.toFixed(1)}s`;
}

// The polished result view (spec §14) — shown once a task reaches
// completed/failed. Deliberately qualitative: no fabricated precision like
// a confidence percentage, since none of this reflects a real evaluation.
const STATUS_COLOR = {
  failed: "#e0574d",
  completed: "var(--signal-green)",
} as const;

export function TaskResultPanel({
  task,
  agents,
  onSelectKnowledgeNode,
  onSelectResearch,
  onSelectProject,
}: {
  task: Task;
  agents: Agent[];
  onSelectKnowledgeNode: (id: string) => void;
  onSelectResearch: (id: string) => void;
  onSelectProject: (id: string) => void;
}) {
  const failed = task.status === "failed";
  const color = failed ? STATUS_COLOR.failed : STATUS_COLOR.completed;
  const assignedAgent = agents.find((a) => a.id === task.assignedAgent);
  const collaboratorAgents = task.collaborators
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is Agent => Boolean(a));
  const knowledgeContext = getKnowledgeForTask(task.knowledgeContext);
  const researchContext = getResearchForTask(task.researchContext);
  const projectContext = getProjectsForTask(task.projectContext);

  return (
    <div className="rounded-2xl border p-5" style={{ borderColor: color }} role="status">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {failed ? (
            <XCircle size={16} style={{ color }} aria-hidden />
          ) : (
            <CheckCircle2 size={16} style={{ color }} aria-hidden />
          )}
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em]" style={{ color }}>
            {failed ? "Task Failed" : "Task Completed"}
          </span>
        </div>
        <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          Simulation
        </span>
      </div>

      <p className="mt-3 font-display text-base font-medium tracking-tight">{task.title}</p>
      {task.commandContext && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted/70">
          Interpreted as — {task.commandContext.intentLabel}
          {task.commandContext.usedContext ? ` (using ${task.commandContext.subjectLabel} context)` : ""}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-wide text-muted sm:grid-cols-4">
        <div>
          <dt className="text-muted/70">Agent</dt>
          <dd className="mt-0.5 text-foreground normal-case">{assignedAgent?.name ?? "Unknown"}</dd>
        </div>
        <div>
          <dt className="text-muted/70">Duration</dt>
          <dd className="mt-0.5 text-foreground normal-case">{formatDuration(task)}</dd>
        </div>
        <div>
          <dt className="text-muted/70">Progress</dt>
          <dd className="mt-0.5 text-foreground normal-case">{task.progress}%</dd>
        </div>
        <div>
          <dt className="text-muted/70">Collaborators</dt>
          <dd className="mt-0.5 text-foreground normal-case">
            {collaboratorAgents.length > 0 ? collaboratorAgents.map((a) => a.name).join(", ") : "None"}
          </dd>
        </div>
      </dl>

      {task.result && (
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-border bg-background/40 p-3.5 font-sans text-sm leading-relaxed text-foreground">
          {task.result}
        </pre>
      )}

      {task.nextStep && !failed && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Suggested Next Action</p>
          <p className="mt-1 text-sm text-muted">{task.nextStep}</p>
        </div>
      )}

      {projectContext.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Project Context</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {projectContext.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                aria-label={`Explore ${project.title} in the Project Workspace`}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-2 py-0.5 font-mono text-[10px] text-gold transition-colors hover:border-gold"
              >
                {project.title}
              </button>
            ))}
            {projectContext.map((project) => (
              <Link
                key={`${project.id}-open`}
                href={project.route}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
              >
                Open Project
                <ExternalLink size={10} aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      )}

      {knowledgeContext.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Knowledge Context</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {knowledgeContext.map((node) => {
              const tone = getKnowledgeNodeTone(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => onSelectKnowledgeNode(node.id)}
                  aria-label={`View ${node.label} in the Knowledge Brain`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: `var(--${tone})` }}
                    aria-hidden
                  />
                  {node.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {researchContext.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Research Context</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {researchContext.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectResearch(item.id)}
                aria-label={`Explore ${item.title} in the Knowledge Brain`}
                className="inline-flex items-center gap-1.5 rounded-full border border-trace/40 bg-trace-soft px-2 py-0.5 font-mono text-[10px] text-trace transition-colors hover:border-trace"
              >
                {getKnowledgeNode(item.id)?.label ?? item.title}
              </button>
            ))}
            {researchContext.map((item) => (
              <Link
                key={`${item.id}-open`}
                href={item.route}
                className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
              >
                Open Research
                <ExternalLink size={10} aria-hidden />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
