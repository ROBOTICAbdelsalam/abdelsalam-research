import { researchItems } from "@/data/ai-lab-research";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import type { Agent, AgentDomain, KnowledgeNode, ResearchItem } from "./types";

// Lookup/traversal utilities over the Research Intelligence layer (content
// lives in data/ai-lab-research.ts) — pure functions, no state, mirroring
// knowledgeGraph.ts's shape so both layers are read the same way by every
// UI surface (ResearchIntelligencePanel, SystemMap, AgentInfoPanel,
// KnowledgeDetailsPanel, TaskResultPanel). "Which projects relate to this
// research" moved to projectGraph.ts's getProjectsForResearch in Phase 8,
// alongside every other project relationship query.

export function getResearchItem(id: string): ResearchItem | undefined {
  return researchItems.find((r) => r.id === id);
}

export function getKnowledgeForResearch(researchId: string): KnowledgeNode[] {
  const item = getResearchItem(researchId);
  if (!item) return [];
  return item.relatedKnowledge
    .map((id) => knowledgeNodes.find((n) => n.id === id))
    .filter((n): n is KnowledgeNode => Boolean(n));
}

export function getAgentsForResearch(researchId: string, agents: Agent[]): Agent[] {
  const item = getResearchItem(researchId);
  if (!item) return [];
  return item.relatedAgents
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is Agent => Boolean(a));
}

export function getResearchForTask(researchContext: string[] | undefined): ResearchItem[] {
  if (!researchContext) return [];
  return researchContext
    .map((id) => getResearchItem(id))
    .filter((r): r is ResearchItem => Boolean(r));
}

// Reverse lookups — "what research is this agent/knowledge node part of",
// used by AgentInfoPanel's Research section and KnowledgeDetailsPanel's
// "Used In Research" section respectively.
export function getResearchForAgent(agentId: string): ResearchItem[] {
  return researchItems.filter((r) => r.relatedAgents.includes(agentId));
}

export function getResearchForKnowledgeNode(nodeId: string): ResearchItem[] {
  return researchItems.filter((r) => r.relatedKnowledge.includes(nodeId));
}

// The default research context a newly-created task draws on (Phase 7
// §12), keyed by the primary agent's domain — curated, not derived, and
// deliberately sparse: only domains an actual ResearchItem lists an agent
// from get anything at all. Robotics, automation and software-engineering
// have no research item behind them, so they get none — research is never
// auto-attached to a task just because a task exists.
const RESEARCH_DOMAIN_CONTEXT: Partial<Record<AgentDomain, string[]>> = {
  "artificial-intelligence": ["hybrid-adaptive-bci"],
  "brain-computer-interfaces": ["hybrid-adaptive-bci"],
  "data-science": ["hybrid-adaptive-bci"],
};

export function getResearchContextForDomain(domain: AgentDomain): string[] {
  return RESEARCH_DOMAIN_CONTEXT[domain] ?? [];
}

// The inverse of the lookup above — reused by Phase 10's command context
// resolution (commandContext.ts) so selecting a research item resolves to
// a domain the same curated way research context has always resolved from
// a domain, rather than a second, independently-authored mapping.
const DOMAIN_FOR_RESEARCH: Record<string, AgentDomain> = {
  "hybrid-adaptive-bci": "brain-computer-interfaces",
};

export function getDomainForResearch(researchId: string): AgentDomain | undefined {
  return DOMAIN_FOR_RESEARCH[researchId];
}
