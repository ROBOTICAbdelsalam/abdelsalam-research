"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown, ExternalLink, Search, X } from "lucide-react";
import type { Agent, ProjectItem } from "@/lib/ai-lab/types";
import { projectItems } from "@/data/ai-lab-projects";
import {
  getAgentsForProject,
  getKnowledgeForProject,
  getResearchForProject,
  findProjects,
} from "@/lib/ai-lab/projectGraph";
import { getKnowledgeNode, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ProjectWorkflow } from "./ProjectWorkflow";
import { useAgentLab } from "./AgentLabProvider";

// The Project Workspace's compact, progressive-disclosure panel for ONE
// project (Phase 8 §4) — same shape as ResearchIntelligencePanel/
// KnowledgeDetailsPanel: headline (title/description/technologies/status)
// always visible, engineering context (knowledge/research/agents) and
// actions behind "Show details". This is an "engineering workbench" view
// of real project data (data/projects.ts via data/ai-lab-projects.ts), not
// a project-management dashboard — there is no invented status, sprint or
// metric anywhere here.
export function ProjectWorkspace({
  project,
  agents,
  onClose,
  onSelectAgent,
  onSelectKnowledgeNode,
  onSelectResearch,
}: {
  project: ProjectItem;
  agents: Agent[];
  onClose?: () => void;
  onSelectAgent: (id: string) => void;
  onSelectKnowledgeNode: (id: string) => void;
  onSelectResearch: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const { tasks, activeTaskId, systemStatus, submitCommand } = useAgentLab();

  const relatedKnowledge = getKnowledgeForProject(project.id);
  const relatedResearch = getResearchForProject(project.id);
  const relatedAgents = getAgentsForProject(project.id, agents);
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  function runTask() {
    // This project is what's being worked on in the Workspace regardless
    // of whatever the ambient lab selection happens to be, so the context
    // is built directly from it rather than via getCurrentCommandContext.
    submitCommand(`Analyze the ${project.title} project`, { projectId: project.id, source: "project" });
  }

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
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gold">{project.category}</p>
          <h3 className="mt-1 font-display text-lg font-medium tracking-tight">{project.title}</h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close project details"
            className="shrink-0 rounded-full border border-border p-1.5 text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

      {project.status && (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">{project.status}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <span key={tech} className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted">
            {tech}
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
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Knowledge Context</p>
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
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${tone})` }} aria-hidden />
                      {node.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Research Context</p>
          {relatedResearch.length > 0 ? (
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
          ) : (
            <p className="mt-1.5 text-xs text-muted/70">No linked research</p>
          )}

          {relatedAgents.length > 0 && (
            <>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Relevant Agents</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedAgents.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onSelectAgent(agent.id)}
                    aria-label={`View ${agent.name}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted transition-colors hover:border-accent hover:text-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `var(--${agent.tone})` }} aria-hidden />
                    {agent.name}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Engineering Workflow</p>
          <div className="mt-2">
            <ProjectWorkflow
              project={project}
              agents={agents}
              activeTask={activeTask}
              onSelectKnowledge={onSelectKnowledgeNode}
              onSelectAgent={onSelectAgent}
              onRunTask={runTask}
              isBusy={systemStatus === "processing"}
            />
          </div>

          <Link
            href={project.route}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide text-gold transition-colors hover:border-gold"
          >
            Open Project
            <ExternalLink size={11} aria-hidden />
          </Link>

          <p className="mt-4 border-t border-border pt-3 text-[10px] leading-relaxed text-muted/70">
            Local project workspace — a structured pointer into this site&apos;s real project content, not a live
            engineering environment. Running a simulation task does not execute, build or deploy anything.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

// The always-visible 2D page section (no WebGL dependency) — the Project
// Workspace equivalent of KnowledgeBrain: there are 5 real projects (spec
// §18), so this adds lightweight search over title/description/
// technologies plus a card grid, embedding ProjectWorkspace for whichever
// project is currently selected.
export function ProjectWorkspaceSection() {
  const { agents, selectedProjectId, setSelectedProjectId, setSelectedAgentId, setSelectedKnowledgeNodeId, setSelectedResearchId } =
    useAgentLab();
  const [search, setSearch] = useState("");

  const searchResult = useMemo(() => findProjects(search), [search]);
  const visibleProjects = projectItems.filter((p) => searchResult.direct.includes(p.id));
  const selectedProject = projectItems.find((p) => p.id === selectedProjectId) ?? null;

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search projects</span>
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects — e.g. robotics, data, BCI…"
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-accent"
        />
      </label>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProjects.map((project) => {
          const selected = selectedProjectId === project.id;
          return (
            <button
              key={project.id}
              type="button"
              onClick={() => setSelectedProjectId(selected ? null : project.id)}
              aria-pressed={selected}
              className="rounded-2xl border bg-surface p-4 text-left transition-all"
              style={{ borderColor: selected ? "var(--gold)" : "var(--border)" }}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{project.category}</span>
              <p className="mt-1.5 text-sm font-medium text-foreground">{project.title}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{project.description}</p>
            </button>
          );
        })}
        {visibleProjects.length === 0 && (
          <p className="text-xs text-muted/70">No projects match that search.</p>
        )}
      </div>

      {selectedProject && (
        <div className="mt-6 max-w-md">
          <ProjectWorkspace
            project={selectedProject}
            agents={agents}
            onClose={() => setSelectedProjectId(null)}
            onSelectAgent={setSelectedAgentId}
            onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
            onSelectResearch={setSelectedResearchId}
          />
        </div>
      )}
    </div>
  );
}
