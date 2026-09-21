"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, X } from "lucide-react";
import type { Agent, ResearchItem, ResearchType } from "@/lib/ai-lab/types";
import { researchItems } from "@/data/ai-lab-research";
import { getAgentsForResearch, getKnowledgeForResearch } from "@/lib/ai-lab/researchGraph";
import { getProjectsForResearch } from "@/lib/ai-lab/projectGraph";
import { getKnowledgeNode, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useAgentLab } from "./AgentLabProvider";

const TYPE_LABEL: Record<ResearchType, string> = {
  THESIS: "Thesis",
};

// The Research Intelligence layer's main display (Phase 7 §6) — same
// progressive-disclosure shape as AgentInfoPanel/KnowledgeDetailsPanel
// (headline always visible, relationships behind "Show details") so all
// three info surfaces read as one design language. The heading reuses the
// matching Knowledge Brain node's short label ("Hybrid-Adaptive BCI")
// rather than the full academic title, which stays fully visible in the
// description and on the real research page linked below — nothing here
// is a second, shortened copy of that content, just a different amount of
// it shown at once.
export function ResearchIntelligencePanel({
  item,
  agents,
  onClose,
  onSelectAgent,
  onSelectKnowledgeNode,
  onSelectProject,
}: {
  item: ResearchItem;
  agents: Agent[];
  onClose?: () => void;
  onSelectAgent: (id: string) => void;
  onSelectKnowledgeNode: (id: string) => void;
  onSelectProject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const shortLabel = getKnowledgeNode(item.id)?.label ?? item.title;
  const relatedKnowledge = getKnowledgeForResearch(item.id);
  const relatedAgents = getAgentsForResearch(item.id, agents);
  const relatedProjects = getProjectsForResearch(item.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border-strong bg-surface/95 p-5 shadow-lg backdrop-blur"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-trace">{TYPE_LABEL[item.type]}</p>
          <h3 className="mt-1 font-display text-lg font-medium tracking-tight">{shortLabel}</h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close research details"
            className="shrink-0 rounded-full border border-border p-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{item.description}</p>

      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">{item.status}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {item.focusAreas.map((area) => (
          <span key={area} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
            {area}
          </span>
        ))}
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
          {relatedKnowledge.length > 0 && (
            <>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Related Knowledge</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedKnowledge.map((node) => {
                  const tone = getKnowledgeNodeTone(node.id);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => onSelectKnowledgeNode(node.id)}
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

          {relatedAgents.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Related Agents</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onSelectAgent(agent.id)}
                    aria-label={`View ${agent.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: `var(--${agent.tone})` }}
                      aria-hidden
                    />
                    {agent.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Technologies</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.relatedTechnologies.map((tech) => (
              <span key={tech} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
                {tech}
              </span>
            ))}
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Projects</p>
          {relatedProjects.length > 0 ? (
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
          ) : (
            <p className="mt-1.5 text-xs text-muted/70">No linked project</p>
          )}

          <Link
            href={item.route}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-trace/40 bg-trace-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-trace transition-colors hover:border-trace"
          >
            Open Research Page
            <ExternalLink size={11} aria-hidden />
          </Link>

          <p className="mt-4 border-t border-border pt-3 text-[10px] leading-relaxed text-muted/70">
            Structured research data — a pointer into this site&apos;s real research content, not a live research
            database.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// The always-visible 2D page section (no WebGL dependency) — the Research
// Intelligence equivalent of KnowledgeBrain: since there's only one real
// research item, there's no list to browse (spec §15's "if there is only
// one research item, do not manufacture a complex filter UI"), so this is
// just the panel itself, self-contained, reading straight from the shared
// AI Lab context rather than a second state source.
export function ResearchIntelligenceSection() {
  const { agents, setSelectedAgentId, setSelectedKnowledgeNodeId, setSelectedProjectId } = useAgentLab();
  return (
    <ResearchIntelligencePanel
      item={researchItems[0]}
      agents={agents}
      onSelectAgent={setSelectedAgentId}
      onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
      onSelectProject={setSelectedProjectId}
    />
  );
}
