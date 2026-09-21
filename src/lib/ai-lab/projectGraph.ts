import { projectItems } from "@/data/ai-lab-projects";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import { researchItems } from "@/data/ai-lab-research";
import type { Agent, AgentDomain, KnowledgeNode, ProjectItem, ResearchItem } from "./types";

// Lookup/traversal utilities over the Project Workspace layer (content
// lives in data/ai-lab-projects.ts) — pure functions, mirroring
// knowledgeGraph.ts/researchGraph.ts's shape so every entity type is read
// the same way by every UI surface.

export function getProject(id: string): ProjectItem | undefined {
  return projectItems.find((p) => p.id === id);
}

export function getKnowledgeForProject(projectId: string): KnowledgeNode[] {
  const project = getProject(projectId);
  if (!project) return [];
  return project.relatedKnowledge
    .map((id) => knowledgeNodes.find((n) => n.id === id))
    .filter((n): n is KnowledgeNode => Boolean(n));
}

export function getResearchForProject(projectId: string): ResearchItem[] {
  const project = getProject(projectId);
  if (!project) return [];
  return project.relatedResearch
    .map((id) => researchItems.find((r) => r.id === id))
    .filter((r): r is ResearchItem => Boolean(r));
}

export function getAgentsForProject(projectId: string, agents: Agent[]): Agent[] {
  const project = getProject(projectId);
  if (!project) return [];
  return project.relatedAgents
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is Agent => Boolean(a));
}

// Reverse lookups — mirroring researchGraph.ts's getResearchForAgent/
// getResearchForKnowledgeNode.
export function getProjectsForAgent(agentId: string): ProjectItem[] {
  return projectItems.filter((p) => p.relatedAgents.includes(agentId));
}

export function getProjectsForKnowledgeNode(nodeId: string): ProjectItem[] {
  return projectItems.filter((p) => p.relatedKnowledge.includes(nodeId));
}

// The single home for "which projects relate to this research item" — the
// relationship itself lives on ResearchItem.relatedProjects
// (data/ai-lab-research.ts); this just resolves those ids to full
// ProjectItem records, replacing the Phase 7 version of this lookup that
// read data/projects.ts directly and returned the raw Project type.
export function getProjectsForResearch(researchId: string): ProjectItem[] {
  return projectItems.filter((p) => p.relatedResearch.includes(researchId));
}

export function getProjectsForTask(projectContext: string[] | undefined): ProjectItem[] {
  if (!projectContext) return [];
  return projectContext
    .map((id) => getProject(id))
    .filter((p): p is ProjectItem => Boolean(p));
}

// Which domain a project's simulated task should route to — curated from
// the project's own real category/groups (data/projects.ts), not derived
// from freeform keyword-matching the project's name. jet-engine-simulation
// has no entry: none of the six AI Lab domains cover mechanical/thermal
// engineering, so a command about it honestly falls through to the
// ordinary unmatched-command fallback rather than being force-fit to an
// unrelated specialist.
const PROJECT_DOMAIN: Partial<Record<string, AgentDomain>> = {
  "hybrid-adaptive-bci": "brain-computer-interfaces",
  "ai-job-agent": "automation",
  "ros2-robotics-systems": "robotics",
  "intelligent-data-pipeline": "data-science",
};

export function getDomainForProject(projectId: string): AgentDomain | undefined {
  return PROJECT_DOMAIN[projectId];
}

export type ProjectSearchResult = {
  direct: string[];
};

// A lightweight search over title/description/technologies (spec §18) —
// there are only 5 real projects, so this stays a simple substring filter
// rather than the two-tier direct/related expansion the Knowledge Brain's
// larger graph needed.
export function findProjects(query: string): ProjectSearchResult {
  const q = query.trim().toLowerCase();
  if (!q) return { direct: projectItems.map((p) => p.id) };
  const direct = projectItems.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.technologies.some((t) => t.toLowerCase().includes(q))
  );
  return { direct: direct.map((p) => p.id) };
}
