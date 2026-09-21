"use client";

import { ArrowRight } from "lucide-react";
import { TASK_STATUS_META } from "@/lib/ai-lab/statusMeta";
import { getKnowledgeForTask, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchForTask } from "@/lib/ai-lab/researchGraph";
import { getProjectsForTask } from "@/lib/ai-lab/projectGraph";
import { getParticipantName } from "@/lib/ai-lab/labOperations";
import { useAgentLab } from "./AgentLabProvider";

// The Operations Console's "what is happening right now" surface (Phase 9
// §5) — entirely derived from the SAME Task/Agent/AgentMessage state the
// Command Center and 3D scene already read, not a second task
// representation. Every chip routes through the existing selection setters
// (spec §9-§12), so clicking Agent/Knowledge/Research/Project here is
// identical to clicking the same entity anywhere else in the lab.
export function LabLiveState() {
  const {
    tasks,
    activeTaskId,
    agents,
    messages,
    setSelectedAgentId,
    setSelectedKnowledgeNodeId,
    setSelectedResearchId,
    setSelectedProjectId,
  } = useAgentLab();

  const task = tasks.find((t) => t.id === activeTaskId) ?? null;

  if (!task) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Live State</p>
        <p className="mt-3 text-sm text-muted">IDLE — no simulation running. Submit a command to begin.</p>
      </div>
    );
  }

  const statusMeta = TASK_STATUS_META[task.status];
  const assignedAgent = agents.find((a) => a.id === task.assignedAgent);
  const collaboratorAgents = task.collaborators
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
  const knowledgeContext = getKnowledgeForTask(task.knowledgeContext);
  const researchContext = getResearchForTask(task.researchContext);
  const projectContext = getProjectsForTask(task.projectContext);
  const taskMessages = messages.filter((m) => m.taskId === task.id);
  const lastMessage = taskMessages[taskMessages.length - 1];

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Live State — Simulation Task</p>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide"
          style={{ borderColor: statusMeta.hex, color: statusMeta.hex }}
        >
          {statusMeta.label}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-foreground">{task.title}</p>
      {task.commandContext && (
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted/60">
          {task.commandContext.intentLabel}
          {task.commandContext.usedContext ? ` — using ${task.commandContext.subjectLabel} context` : ""}
        </p>
      )}

      {assignedAgent && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Agent</p>
          <button
            type="button"
            onClick={() => setSelectedAgentId(assignedAgent.id)}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${assignedAgent.tone})` }} aria-hidden />
            {assignedAgent.name}
          </button>
        </div>
      )}

      {collaboratorAgents.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Collaborators</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {collaboratorAgents.map((agent) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => setSelectedAgentId(agent.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${agent.tone})` }} aria-hidden />
                {agent.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {knowledgeContext.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Knowledge</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {knowledgeContext.map((node) => {
              const tone = getKnowledgeNodeTone(node.id);
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedKnowledgeNodeId(node.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${tone})` }} aria-hidden />
                  {node.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {researchContext.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Research</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {researchContext.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedResearchId(item.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-trace/40 bg-trace-soft px-2 py-0.5 font-mono text-[10px] text-trace transition-colors hover:border-trace"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {projectContext.length > 0 && (
        <div className="mt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Project</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {projectContext.map((project) => (
              <button
                key={project.id}
                type="button"
                onClick={() => setSelectedProjectId(project.id)}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-2 py-0.5 font-mono text-[10px] text-gold transition-colors hover:border-gold"
              >
                {project.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Communication</p>
        {lastMessage ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
            {getParticipantName(lastMessage.fromAgent, agents)}
            <ArrowRight size={11} className="shrink-0" aria-hidden />
            {getParticipantName(lastMessage.toAgent, agents)}
            <span className="text-muted/60">— {lastMessage.status}</span>
          </p>
        ) : (
          <p className="mt-1 text-xs text-muted/60">No messages yet.</p>
        )}
      </div>
    </div>
  );
}
