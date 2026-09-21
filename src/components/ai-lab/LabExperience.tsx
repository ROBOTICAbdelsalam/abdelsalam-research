"use client";

import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { labMeta } from "@/data/ai-lab";
import { useIsDesktop } from "@/lib/ai-lab/useIsDesktop";
import { useWebglSupport } from "@/lib/ai-lab/useWebglSupport";
import { WebGLFallback } from "./WebGLFallback";
import { AgentInfoPanel } from "./AgentInfoPanel";
import { KnowledgeDetailsPanel } from "./KnowledgeDetailsPanel";
import { ResearchIntelligencePanel } from "./ResearchIntelligencePanel";
import { ProjectWorkspace } from "./ProjectWorkspace";
import { useAgentLab } from "./AgentLabProvider";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import { researchItems } from "@/data/ai-lab-research";
import { projectItems } from "@/data/ai-lab-projects";

const LabScene = dynamic(() => import("./LabScene").then((mod) => mod.LabScene), {
  ssr: false,
  loading: () => <LabLoadingShell />,
});

function LabLoadingShell() {
  return (
    <div className="flex h-[560px] items-center justify-center rounded-3xl border border-border-strong bg-surface">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted motion-safe:animate-pulse-slow">
        Initializing laboratory environment…
      </p>
    </div>
  );
}

// Orchestrates the 3D lab: decides whether to render it at all (desktop +
// WebGL only — see spec §31/§32), owns the selection/hover state shared
// between the canvas and the surrounding HTML controls, and renders the
// accessible layer around the canvas (info panel, reset control, and a
// real <button> per agent so selection never depends on pointing at 3D
// geometry — spec §33: "the 3D canvas must not be the only way to access
// information").
export function LabExperience() {
  const isDesktop = useIsDesktop();
  const webglSupported = useWebglSupport();
  const {
    agents,
    tasks,
    messages,
    activeTaskId,
    systemStatus,
    selectedAgentId,
    hoveredAgentId,
    setSelectedAgentId,
    setHoveredAgentId,
    selectedKnowledgeNodeId,
    hoveredKnowledgeNodeId,
    activeKnowledgeNodeIds,
    setSelectedKnowledgeNodeId,
    setHoveredKnowledgeNodeId,
    selectedResearchId,
    hoveredResearchId,
    activeResearchIds,
    setSelectedResearchId,
    setHoveredResearchId,
    selectedProjectId,
    hoveredProjectId,
    activeProjectIds,
    setSelectedProjectId,
    setHoveredProjectId,
  } = useAgentLab();

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const selectedKnowledgeNode = knowledgeNodes.find((n) => n.id === selectedKnowledgeNodeId) ?? null;
  const selectedResearchItem = researchItems.find((r) => r.id === selectedResearchId) ?? null;
  const selectedProjectItem = projectItems.find((p) => p.id === selectedProjectId) ?? null;
  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;
  // Only override the collaboration signal with the running task's
  // collaborators when the selected agent IS that task's assignee —
  // otherwise browsing some other agent while a background task runs would
  // incorrectly borrow its collaborator set.
  const activeTaskCollaboratorIds =
    activeTask && activeTask.assignedAgent === selectedAgentId ? activeTask.collaborators : null;

  if (!isDesktop) {
    return <WebGLFallback reason="mobile" />;
  }

  if (!webglSupported) {
    return <WebGLFallback reason="webgl" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface">
        <div className="h-[560px] w-full">
          <LabScene
            agents={agents}
            selectedAgentId={selectedAgentId}
            hoveredAgentId={hoveredAgentId}
            systemStatus={systemStatus}
            activeTaskCollaboratorIds={activeTaskCollaboratorIds}
            messages={messages}
            onSelectAgent={setSelectedAgentId}
            onHoverAgent={setHoveredAgentId}
            selectedKnowledgeNodeId={selectedKnowledgeNodeId}
            hoveredKnowledgeNodeId={hoveredKnowledgeNodeId}
            activeKnowledgeNodeIds={activeKnowledgeNodeIds}
            onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
            onHoverKnowledgeNode={setHoveredKnowledgeNodeId}
            selectedResearchId={selectedResearchId}
            hoveredResearchId={hoveredResearchId}
            activeResearchIds={activeResearchIds}
            onSelectResearch={setSelectedResearchId}
            onHoverResearch={setHoveredResearchId}
            selectedProjectId={selectedProjectId}
            hoveredProjectId={hoveredProjectId}
            activeProjectIds={activeProjectIds}
            onSelectProject={setSelectedProjectId}
            onHoverProject={setHoveredProjectId}
          />
        </div>

        {/* z-20 is required, not decorative: drei's <Html> floating labels
            (FloatingAgentLabel, zIndexRange={[10, 0]}) are portaled inside
            the canvas wrapper and otherwise paint over this overlay
            regardless of DOM/JSX order, since they establish their own
            stacking context. */}
        <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-4">
          <div className="flex justify-between">
            <span className="pointer-events-auto rounded-full border border-border bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted backdrop-blur">
              Mode — {labMeta.mode}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedAgentId(null);
                setSelectedKnowledgeNodeId(null);
                setSelectedResearchId(null);
                setSelectedProjectId(null);
              }}
              disabled={!selectedAgentId && !selectedKnowledgeNodeId && !selectedResearchId && !selectedProjectId}
              className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted backdrop-blur transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted"
            >
              <RotateCcw size={11} aria-hidden />
              Reset View
            </button>
          </div>

          <div className="flex justify-start">
            <AnimatePresence>
              {selectedAgent && (
                <AgentInfoPanel
                  key={selectedAgent.id}
                  agent={selectedAgent}
                  agents={agents}
                  messages={messages}
                  onClose={() => setSelectedAgentId(null)}
                  onSelectAgent={setSelectedAgentId}
                  onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
                  onSelectResearch={setSelectedResearchId}
                  onSelectProject={setSelectedProjectId}
                />
              )}
              {selectedKnowledgeNode && (
                <KnowledgeDetailsPanel
                  key={selectedKnowledgeNode.id}
                  node={selectedKnowledgeNode}
                  agents={agents}
                  onClose={() => setSelectedKnowledgeNodeId(null)}
                  onSelectAgent={setSelectedAgentId}
                  onSelectNode={setSelectedKnowledgeNodeId}
                  onSelectResearch={setSelectedResearchId}
                  onSelectProject={setSelectedProjectId}
                />
              )}
              {selectedResearchItem && (
                <ResearchIntelligencePanel
                  key={selectedResearchItem.id}
                  item={selectedResearchItem}
                  agents={agents}
                  onClose={() => setSelectedResearchId(null)}
                  onSelectAgent={setSelectedAgentId}
                  onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
                  onSelectProject={setSelectedProjectId}
                />
              )}
              {selectedProjectItem && (
                <ProjectWorkspace
                  key={selectedProjectItem.id}
                  project={selectedProjectItem}
                  agents={agents}
                  onClose={() => setSelectedProjectId(null)}
                  onSelectAgent={setSelectedAgentId}
                  onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
                  onSelectResearch={setSelectedResearchId}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Select a workstation">
        {agents.map((agent) => {
          const active = selectedAgentId === agent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgentId(active ? null : agent.id)}
              onMouseEnter={() => setHoveredAgentId(agent.id)}
              onMouseLeave={() => setHoveredAgentId((current) => (current === agent.id ? null : current))}
              aria-pressed={active}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors"
              style={{
                borderColor: active ? `var(--${agent.tone})` : "var(--border)",
                color: active ? `var(--${agent.tone})` : "var(--muted)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `var(--${agent.tone})` }}
                aria-hidden
              />
              {agent.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
