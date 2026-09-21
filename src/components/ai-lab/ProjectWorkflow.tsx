"use client";

import { Play, CheckCircle2 } from "lucide-react";
import type { Agent, ProjectItem, Task } from "@/lib/ai-lab/types";
import { getAgentsForProject, getKnowledgeForProject, getResearchForProject } from "@/lib/ai-lab/projectGraph";

function Stage({
  label,
  children,
  last = false,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">{label}</span>
      {children}
      {!last && <div className="ml-1 h-4 w-px bg-border" aria-hidden />}
    </div>
  );
}

// A conceptual workflow view (Phase 8 §15) — PROJECT -> CONTEXT -> KNOWLEDGE
// -> AGENTS -> TASK -> RESULT. This does NOT represent real autonomous
// execution: it's a compact, clickable map of how the SAME existing panels
// (Knowledge Brain, Agent info, the orchestrator's own task lifecycle)
// already relate to the currently-open project, not a second graph engine
// or a real pipeline runner. Every click routes through state this app
// already has — selecting a knowledge node/agent, or calling the existing
// submitCommand — never a bespoke workflow state machine.
export function ProjectWorkflow({
  project,
  agents,
  activeTask,
  onSelectKnowledge,
  onSelectAgent,
  onRunTask,
  isBusy,
}: {
  project: ProjectItem;
  agents: Agent[];
  activeTask: Task | null;
  onSelectKnowledge: (id: string) => void;
  onSelectAgent: (id: string) => void;
  onRunTask: () => void;
  isBusy: boolean;
}) {
  const knowledge = getKnowledgeForProject(project.id);
  const research = getResearchForProject(project.id);
  const relevantAgents = getAgentsForProject(project.id, agents);
  const isThisProjectRunning = Boolean(activeTask && activeTask.projectContext?.includes(project.id));
  const hasResult = Boolean(activeTask?.result) && isThisProjectRunning && activeTask?.status !== "queued";

  return (
    <div className="flex flex-col">
      <Stage label="Project">
        <span className="rounded-full border border-gold/40 bg-gold-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-gold">
          {project.title}
        </span>
      </Stage>

      <Stage label="Context">
        <span className="font-mono text-[10px] text-muted">
          {knowledge.length} knowledge · {research.length} research
        </span>
      </Stage>

      <Stage label="Knowledge">
        {knowledge.length > 0 ? (
          <button
            type="button"
            onClick={() => onSelectKnowledge(knowledge[0].id)}
            className="rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            Explore {knowledge[0].label}
          </button>
        ) : (
          <span className="font-mono text-[10px] text-muted/60">No linked knowledge</span>
        )}
      </Stage>

      <Stage label="Agents">
        {relevantAgents.length > 0 ? (
          <button
            type="button"
            onClick={() => onSelectAgent(relevantAgents[0].id)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: `var(--${relevantAgents[0].tone})` }}
              aria-hidden
            />
            {relevantAgents[0].name}
          </button>
        ) : (
          <span className="font-mono text-[10px] text-muted/60">No relevant agent</span>
        )}
      </Stage>

      <Stage label="Task">
        {isThisProjectRunning && activeTask?.status !== "completed" && activeTask?.status !== "failed" ? (
          <span className="font-mono text-[10px] uppercase tracking-wide text-accent">
            {activeTask?.status} — simulation running
          </span>
        ) : (
          <button
            type="button"
            onClick={onRunTask}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-accent transition-colors hover:border-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play size={10} aria-hidden />
            Run Simulation Task
          </button>
        )}
      </Stage>

      <Stage label="Result" last>
        {hasResult ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-signal-green">
            <CheckCircle2 size={11} aria-hidden />
            Result available below
          </span>
        ) : (
          <span className="font-mono text-[10px] text-muted/60">No result yet</span>
        )}
      </Stage>
    </div>
  );
}
