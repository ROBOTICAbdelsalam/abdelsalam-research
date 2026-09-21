"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import type { Agent, KnowledgeCategory, KnowledgeNode } from "@/lib/ai-lab/types";
import { getKnowledgeNode, getRelatedNodes, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchForKnowledgeNode } from "@/lib/ai-lab/researchGraph";
import { getProjectsForKnowledgeNode } from "@/lib/ai-lab/projectGraph";
import { useReducedMotion } from "@/lib/useReducedMotion";

const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  research: "Research",
  ai: "Artificial Intelligence",
  robotics: "Robotics",
  bci: "Brain-Computer Interfaces",
  data: "Data",
  automation: "Automation",
  software: "Software",
  technology: "Technology",
  method: "Method",
  system: "System",
};

// The panel shown when a Knowledge Brain node is selected (spec §22/§27) —
// the same progressive-disclosure shape as AgentInfoPanel (headline always
// visible, relationships behind a "Show details" toggle) so the two info
// surfaces read as one design language, not two different panel styles.
// Deliberately no "confidence" or result-like language here — a knowledge
// node is a concept in a local graph, not a finding.
export function KnowledgeDetailsPanel({
  node,
  agents,
  onClose,
  onSelectAgent,
  onSelectNode,
  onSelectResearch,
  onSelectProject,
}: {
  node: KnowledgeNode;
  agents: Agent[];
  onClose: () => void;
  onSelectAgent: (id: string) => void;
  onSelectNode: (id: string) => void;
  onSelectResearch: (id: string) => void;
  onSelectProject: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const tone = getKnowledgeNodeTone(node.id);
  const relatedAgents = node.relatedAgents
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is Agent => Boolean(a));
  const relatedNodes = getRelatedNodes(node.id);
  const usedInResearch = getResearchForKnowledgeNode(node.id);
  const usedInProjects = getProjectsForKnowledgeNode(node.id);

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
          <p className="font-mono text-[10px] uppercase tracking-[0.15em]" style={{ color: `var(--${tone})` }}>
            {CATEGORY_LABEL[node.category]}
          </p>
          <h3 className="mt-1 font-display text-lg font-medium tracking-tight">{node.label}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close knowledge node details"
          className="shrink-0 rounded-full border border-border p-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <X size={14} />
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{node.description}</p>

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
          {relatedAgents.length > 0 && (
            <>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Related Agents</p>
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

          {relatedNodes.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Related Concepts</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedNodes.map((related) => (
                  <button
                    key={related.id}
                    type="button"
                    onClick={() => onSelectNode(related.id)}
                    className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    {related.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {usedInResearch.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Used In Research</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {usedInResearch.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectResearch(item.id)}
                    className="rounded-full border border-trace/40 bg-trace-soft px-2 py-0.5 font-mono text-[10px] text-trace transition-colors hover:border-trace"
                  >
                    {getKnowledgeNode(item.id)?.label ?? item.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {usedInProjects.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Used In Project</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {usedInProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="rounded-full border border-gold/40 bg-gold-soft px-2 py-0.5 font-mono text-[10px] text-gold transition-colors hover:border-gold"
                  >
                    {project.title}
                  </button>
                ))}
              </div>
            </>
          )}

          {node.relatedTechnologies.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                Related Technologies
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {node.relatedTechnologies.map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </>
          )}

          <p className="mt-4 border-t border-border pt-3 text-[10px] leading-relaxed text-muted/70">
            Local knowledge graph — a structured simulation context, not real retrieval or memory.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
