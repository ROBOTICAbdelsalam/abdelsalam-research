import type { ProjectItem } from "@/lib/ai-lab/types";
import { projects } from "@/data/projects";
import { researchItems } from "@/data/ai-lab-research";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";

// ABD AI LAB — the Project Workspace's content (Phase 8). A structured
// pointer into the site's real project content (data/projects.ts), not a
// second copy of it and not a record of real engineering work these
// simulated agents performed.
//
// `relatedKnowledge` per project is hand-authored, grounded ONLY in real
// overlap between that project's own `technologies` (data/projects.ts) and
// an actual knowledge node's id/label/relatedTechnologies in
// data/ai-lab-knowledge.ts — e.g. ros2-robotics-systems lists "ROS2" and
// "Python" as technologies, so it connects to the "ros2" and "python"
// nodes, not to unrelated ones. jet-engine-simulation's technologies
// (ANSYS, MATLAB, CAD, Thermodynamics, Fluid Mechanics) match nothing in
// the knowledge graph, so it correctly gets an empty array — no invented
// connection.
//
// `relatedAgents` and `relatedResearch` are DERIVED below, not manually
// authored a second time: relatedAgents is the union of relatedAgents
// across a project's own relatedKnowledge nodes (spec §9 — "based on the
// project's technologies/domain only when that relationship is already
// supported by existing graph data"), and relatedResearch is read
// straight from ResearchItem.relatedProjects (data/ai-lab-research.ts),
// which already encodes the one real project<->research link
// (hybrid-adaptive-bci). Two independently hand-typed relationship lists
// would risk drifting apart; deriving one from the other can't.
const RELATED_KNOWLEDGE: Record<string, string[]> = {
  "hybrid-adaptive-bci": [
    "hybrid-adaptive-bci",
    "brain-computer-interface",
    "eeg",
    "signal-processing",
    "feature-extraction",
    "classification",
    "machine-learning",
    "human-machine-interaction",
  ],
  "ai-job-agent": ["ai-agents", "workflow-orchestration", "automation", "python"],
  "ros2-robotics-systems": ["ros2", "robotics", "robot-control", "python"],
  "intelligent-data-pipeline": ["data-engineering", "sql", "python"],
  "jet-engine-simulation": [],
};

function agentsFromKnowledge(knowledgeIds: string[]): string[] {
  const ids = new Set<string>();
  knowledgeIds.forEach((id) => {
    const node = knowledgeNodes.find((n) => n.id === id);
    node?.relatedAgents.forEach((agentId) => ids.add(agentId));
  });
  return Array.from(ids);
}

function researchForProject(projectSlug: string): string[] {
  return researchItems.filter((r) => r.relatedProjects.includes(projectSlug)).map((r) => r.id);
}

// Which project the physical Project Center (and the Project Focus camera
// shot) shows by default, before anyone has picked a different one — reads
// the site's own real `featured` flag (data/projects.ts) rather than
// hardcoding a project id here.
export const featuredProjectId = projects.find((p) => p.featured)?.slug ?? projects[0].slug;

export const projectItems: ProjectItem[] = projects.map((project) => {
  const relatedKnowledge = RELATED_KNOWLEDGE[project.slug] ?? [];
  return {
    id: project.slug,
    title: project.name,
    description: project.build,
    route: `/projects/${project.slug}`,
    category: project.category,
    status: project.status,
    technologies: project.technologies,
    relatedKnowledge,
    relatedResearch: researchForProject(project.slug),
    relatedAgents: agentsFromKnowledge(relatedKnowledge),
  };
});
