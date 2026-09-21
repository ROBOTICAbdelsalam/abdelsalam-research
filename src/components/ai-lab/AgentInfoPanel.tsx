"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, ChevronDown, X } from "lucide-react";
import type { Agent, AgentMessage } from "@/lib/ai-lab/types";
import { STATUS_META } from "@/lib/ai-lab/statusMeta";
import { getKnowledgeForAgent, getKnowledgeNode, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchForAgent } from "@/lib/ai-lab/researchGraph";
import { getProjectsForAgent } from "@/lib/ai-lab/projectGraph";
import { getParticipantName } from "@/lib/ai-lab/labOperations";
import { useReducedMotion } from "@/lib/useReducedMotion";

const MAX_VISIBLE_MESSAGES = 4;

// The panel shown when a workstation is selected (spec §7). Progressive
// disclosure (spec §27): name/role/status/current task are the headline —
// always visible — while description/capabilities/focus areas/
// collaborators/last activity sit behind a "Details" toggle so the panel
// reads as a compact HUD card, not a dashboard dump. Plain HTML/Tailwind,
// not part of the 3D scene — this is half of how the canvas stays
// accessible: the same information is always available as real DOM
// content, not just pixels inside a <canvas>.
export function AgentInfoPanel({
  agent,
  agents,
  messages,
  onClose,
  onSelectAgent,
  onSelectKnowledgeNode,
  onSelectResearch,
  onSelectProject,
}: {
  agent: Agent;
  agents: Agent[];
  messages: AgentMessage[];
  onClose: () => void;
  onSelectAgent: (id: string) => void;
  onSelectKnowledgeNode: (id: string) => void;
  onSelectResearch: (id: string) => void;
  onSelectProject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const status = STATUS_META[agent.status];
  const collaborators = agent.collaborators
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is Agent => Boolean(a));
  const relatedKnowledge = getKnowledgeForAgent(agent.id);
  const relatedResearch = getResearchForAgent(agent.id);
  const relatedProjects = getProjectsForAgent(agent.id);
  const recentMessages = messages
    .filter((m) => m.fromAgent === agent.id || m.toAgent === agent.id)
    .slice(-MAX_VISIBLE_MESSAGES)
    .reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto w-full max-w-xs rounded-2xl border border-border-strong bg-surface/95 p-5 shadow-lg backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: `var(--${agent.tone})` }}>
            {agent.role}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium tracking-tight">{agent.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close agent details"
          className="shrink-0 rounded-full border border-border p-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <X size={14} />
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="h-2 w-2 shrink-0 rounded-full motion-safe:animate-node-pulse"
          style={{ backgroundColor: status.hex }}
          aria-hidden
        />
        <span className="font-mono text-xs font-semibold uppercase tracking-wide" style={{ color: status.hex }}>
          {status.label}
        </span>
        <span className="text-xs text-muted">— {status.description}</span>
      </div>

      <div className="mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Current Task</p>
        <p className="mt-1 text-sm text-foreground">{agent.currentTask.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${agent.currentTask.progress}%`, backgroundColor: `var(--${agent.tone})` }}
            />
          </div>
          <span className="font-mono text-[11px] tabular-nums text-muted">{agent.currentTask.progress}%</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-foreground"
      >
        <ChevronDown size={12} className={expanded ? "rotate-180 transition-transform" : "transition-transform"} />
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
        >
          <p className="mt-3 text-sm leading-relaxed text-muted">{agent.summary}</p>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Capabilities</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {agent.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted"
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Focus Areas</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {agent.focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted"
              >
                {area}
              </span>
            ))}
          </div>

          {relatedKnowledge.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Knowledge</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedKnowledge.map((node) => {
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
            </>
          )}

          {relatedResearch.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Research</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedResearch.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectResearch(item.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-trace/40 bg-trace-soft px-2 py-0.5 font-mono text-[10px] text-trace transition-colors hover:border-trace"
                  >
                    {getKnowledgeNode(item.id)?.label ?? item.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {relatedProjects.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Projects</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-2 py-0.5 font-mono text-[10px] text-gold transition-colors hover:border-gold"
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {collaborators.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Collaborators</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {collaborators.map((collaborator) => (
                  <button
                    key={collaborator.id}
                    type="button"
                    onClick={() => onSelectAgent(collaborator.id)}
                    aria-label={`View ${collaborator.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: `var(--${collaborator.tone})` }}
                      aria-hidden
                    />
                    {collaborator.name}
                  </button>
                ))}
              </div>
            </>
          )}

          {recentMessages.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Communications</p>
              <div className="mt-2 flex flex-col gap-2">
                {recentMessages.map((message) => {
                  const outgoing = message.fromAgent === agent.id;
                  const otherParty = getParticipantName(outgoing ? message.toAgent : message.fromAgent, agents);
                  return (
                    <div key={message.id} className="flex items-start gap-2 text-xs">
                      {outgoing ? (
                        <ArrowUpRight size={12} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                      ) : (
                        <ArrowDownLeft size={12} className="mt-0.5 shrink-0 text-muted" aria-hidden />
                      )}
                      <div className="min-w-0">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{otherParty}</span>
                        <p className="text-muted/90">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Last Activity</p>
          <p className="mt-1 text-xs text-muted">{agent.lastActivity.message}</p>

          <p className="mt-4 border-t border-border pt-3 text-[10px] leading-relaxed text-muted/70">
            Local simulation — no external AI is executing this task.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
