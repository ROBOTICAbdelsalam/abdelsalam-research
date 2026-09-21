"use client";

import { createContext, useContext, useCallback, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { useAgentOrchestrator, type AgentOrchestrator } from "@/lib/ai-lab/useAgentOrchestrator";
import type { KnowledgeCategory } from "@/lib/ai-lab/types";
import { getKnowledgeForResearch } from "@/lib/ai-lab/researchGraph";
import { getKnowledgeForProject } from "@/lib/ai-lab/projectGraph";

type AgentLabContextValue = AgentOrchestrator & {
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  setSelectedAgentId: (id: string | null) => void;
  setHoveredAgentId: Dispatch<SetStateAction<string | null>>;
  // Knowledge Brain UI state (Phase 6 §31) — lives in this same provider,
  // not a second store, and stays mutually exclusive with agent/research/
  // project selection (each setter below clears the other three) since all
  // four drive the same 3D camera focus.
  selectedKnowledgeNodeId: string | null;
  hoveredKnowledgeNodeId: string | null;
  knowledgeFilter: KnowledgeCategory | "all";
  knowledgeSearch: string;
  // Derived from the currently-running task's knowledgeContext, the
  // currently-selected research item's relatedKnowledge, AND the
  // currently-selected project's relatedKnowledge — not separate state.
  // "active" nodes are whatever the active task draws on, or whatever the
  // selected research/project item connects to (Phase 7 §10, Phase 8 §7).
  activeKnowledgeNodeIds: string[];
  setSelectedKnowledgeNodeId: (id: string | null) => void;
  setHoveredKnowledgeNodeId: Dispatch<SetStateAction<string | null>>;
  setKnowledgeFilter: Dispatch<SetStateAction<KnowledgeCategory | "all">>;
  setKnowledgeSearch: Dispatch<SetStateAction<string>>;
  // Research Intelligence UI state (Phase 7) — same provider, same
  // mutual-exclusion pattern.
  selectedResearchId: string | null;
  hoveredResearchId: string | null;
  setSelectedResearchId: (id: string | null) => void;
  setHoveredResearchId: Dispatch<SetStateAction<string | null>>;
  // Derived from the currently-running task's researchContext — mirrors
  // activeKnowledgeNodeIds exactly, for the same reason.
  activeResearchIds: string[];
  // Project Workspace UI state (Phase 8) — same provider, same
  // mutual-exclusion pattern extended to four selections.
  selectedProjectId: string | null;
  hoveredProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  setHoveredProjectId: Dispatch<SetStateAction<string | null>>;
  // Derived from the currently-running task's projectContext.
  activeProjectIds: string[];
};

const AgentLabContext = createContext<AgentLabContextValue | null>(null);

// The single shared source of truth for the AI Lab page. The 3D scene
// (LabExperience/LabScene), the 2D roster (AgentRoster) and the Command
// Center are siblings in separate page sections, not a parent/child pair —
// Context is what keeps a click (or a submitted command) in any one of
// them selecting/activating the same agent everywhere else.
export function AgentLabProvider({ children }: { children: ReactNode }) {
  const [selectedAgentId, setSelectedAgentIdRaw] = useState<string | null>(null);
  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);
  const [selectedKnowledgeNodeId, setSelectedKnowledgeNodeIdRaw] = useState<string | null>(null);
  const [hoveredKnowledgeNodeId, setHoveredKnowledgeNodeId] = useState<string | null>(null);
  const [knowledgeFilter, setKnowledgeFilter] = useState<KnowledgeCategory | "all">("all");
  const [knowledgeSearch, setKnowledgeSearch] = useState("");
  const [selectedResearchId, setSelectedResearchIdRaw] = useState<string | null>(null);
  const [hoveredResearchId, setHoveredResearchId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectIdRaw] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  // Agent focus, Knowledge focus, Research focus and Project focus all
  // drive the same 3D camera target, so selecting one clears the other
  // three right in the same update rather than leaving more than one
  // "selected" and the camera unsure which point to look at.
  const setSelectedAgentId = useCallback((id: string | null) => {
    setSelectedAgentIdRaw(id);
    if (id !== null) {
      setSelectedKnowledgeNodeIdRaw(null);
      setSelectedResearchIdRaw(null);
      setSelectedProjectIdRaw(null);
    }
  }, []);
  const setSelectedKnowledgeNodeId = useCallback((id: string | null) => {
    setSelectedKnowledgeNodeIdRaw(id);
    if (id !== null) {
      setSelectedAgentIdRaw(null);
      setSelectedResearchIdRaw(null);
      setSelectedProjectIdRaw(null);
    }
  }, []);
  const setSelectedResearchId = useCallback((id: string | null) => {
    setSelectedResearchIdRaw(id);
    if (id !== null) {
      setSelectedAgentIdRaw(null);
      setSelectedKnowledgeNodeIdRaw(null);
      setSelectedProjectIdRaw(null);
    }
  }, []);
  const setSelectedProjectId = useCallback((id: string | null) => {
    setSelectedProjectIdRaw(id);
    if (id !== null) {
      setSelectedAgentIdRaw(null);
      setSelectedKnowledgeNodeIdRaw(null);
      setSelectedResearchIdRaw(null);
    }
  }, []);

  // The orchestrator calls this when it assigns a task to an agent, so
  // submitting a command focuses the camera on whoever picked it up —
  // spec §10: "camera can optionally focus on the agent".
  const handleAssign = useCallback((agentId: string) => setSelectedAgentId(agentId), [setSelectedAgentId]);
  const orchestrator = useAgentOrchestrator(handleAssign);

  const activeTask = orchestrator.tasks.find((t) => t.id === orchestrator.activeTaskId);
  const taskIsRunning = Boolean(activeTask) && orchestrator.systemStatus === "processing";

  const activeKnowledgeNodeIds = useMemo(() => {
    const taskIds = taskIsRunning ? (activeTask?.knowledgeContext ?? []) : [];
    const researchIds = selectedResearchId ? getKnowledgeForResearch(selectedResearchId).map((n) => n.id) : [];
    const projectIds = selectedProjectId ? getKnowledgeForProject(selectedProjectId).map((n) => n.id) : [];
    const combined = [...taskIds, ...researchIds, ...projectIds];
    return combined.length ? Array.from(new Set(combined)) : combined;
  }, [activeTask, taskIsRunning, selectedResearchId, selectedProjectId]);

  const activeResearchIds = useMemo(
    () => (taskIsRunning ? (activeTask?.researchContext ?? []) : []),
    [activeTask, taskIsRunning]
  );

  const activeProjectIds = useMemo(
    () => (taskIsRunning ? (activeTask?.projectContext ?? []) : []),
    [activeTask, taskIsRunning]
  );

  // Wraps the orchestrator's own resetSession so a full session reset also
  // clears every selection this provider owns — the orchestrator only
  // knows about tasks/activities/messages/agents, not which entity is
  // currently focused in the 3D scene.
  const resetSession = useCallback(() => {
    orchestrator.resetSession();
    setSelectedAgentIdRaw(null);
    setSelectedKnowledgeNodeIdRaw(null);
    setSelectedResearchIdRaw(null);
    setSelectedProjectIdRaw(null);
  }, [orchestrator]);

  const value = useMemo<AgentLabContextValue>(
    () => ({
      ...orchestrator,
      resetSession,
      selectedAgentId,
      hoveredAgentId,
      setSelectedAgentId,
      setHoveredAgentId,
      selectedKnowledgeNodeId,
      hoveredKnowledgeNodeId,
      knowledgeFilter,
      knowledgeSearch,
      activeKnowledgeNodeIds,
      setSelectedKnowledgeNodeId,
      setHoveredKnowledgeNodeId,
      setKnowledgeFilter,
      setKnowledgeSearch,
      selectedResearchId,
      hoveredResearchId,
      setSelectedResearchId,
      setHoveredResearchId,
      activeResearchIds,
      selectedProjectId,
      hoveredProjectId,
      setSelectedProjectId,
      setHoveredProjectId,
      activeProjectIds,
    }),
    [
      orchestrator,
      resetSession,
      selectedAgentId,
      hoveredAgentId,
      setSelectedAgentId,
      selectedKnowledgeNodeId,
      hoveredKnowledgeNodeId,
      knowledgeFilter,
      knowledgeSearch,
      activeKnowledgeNodeIds,
      setSelectedKnowledgeNodeId,
      selectedResearchId,
      hoveredResearchId,
      setSelectedResearchId,
      activeResearchIds,
      selectedProjectId,
      hoveredProjectId,
      setSelectedProjectId,
      activeProjectIds,
    ]
  );

  return <AgentLabContext.Provider value={value}>{children}</AgentLabContext.Provider>;
}

export function useAgentLab() {
  const ctx = useContext(AgentLabContext);
  if (!ctx) {
    throw new Error("useAgentLab must be used within an AgentLabProvider");
  }
  return ctx;
}
