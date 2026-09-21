import type { SignalTone } from "@/components/ui/SignalNode";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import type { Agent, AgentDomain, KnowledgeNode } from "./types";
import { DOMAIN_TONE } from "./colors";
import { KNOWLEDGE_CLUSTERS, KNOWLEDGE_HUB_ID } from "./layout";

const NODE_DOMAIN: Record<string, AgentDomain> = Object.fromEntries(
  Object.entries(KNOWLEDGE_CLUSTERS).flatMap(([domain, ids]) => ids.map((id) => [id, domain as AgentDomain]))
);

// The single place that decides a knowledge node's color, so the 3D graph,
// the 2D Knowledge Brain panel and any chip elsewhere in the UI never
// disagree about what a given concept's tone is (spec §20's "reuse the
// existing palette" — every node borrows the tone of the domain it's
// grounded in, rather than a second, knowledge-specific color system).
export function getKnowledgeNodeTone(nodeId: string): SignalTone {
  if (nodeId === KNOWLEDGE_HUB_ID) return "accent";
  const domain = NODE_DOMAIN[nodeId];
  return domain ? DOMAIN_TONE[domain] : "accent";
}

// Reuses the SAME node->domain map getKnowledgeNodeTone reads above —
// Phase 10's command context resolution (commandContext.ts) needs "which
// domain does this selected knowledge node belong to", and this is already
// the one place that answer lives, not a second knowledge-domain resolver.
export function getDomainForKnowledgeNode(nodeId: string): AgentDomain | undefined {
  if (nodeId === KNOWLEDGE_HUB_ID) return undefined;
  return NODE_DOMAIN[nodeId];
}

// Lookup/traversal utilities over the local knowledge graph (content lives
// in data/ai-lab-knowledge.ts). Pure functions — no state, no side effects
// — so both the 2D Knowledge Brain panel and the 3D KnowledgeCenter3D can
// derive the same answers from the same data without a second graph.

export function getKnowledgeNode(id: string): KnowledgeNode | undefined {
  return knowledgeNodes.find((n) => n.id === id);
}

export function getRelatedNodes(nodeId: string): KnowledgeNode[] {
  const node = getKnowledgeNode(nodeId);
  if (!node) return [];
  return node.relatedNodes.map((id) => getKnowledgeNode(id)).filter((n): n is KnowledgeNode => Boolean(n));
}

export function getRelatedAgents(nodeId: string, agents: Agent[]): Agent[] {
  const node = getKnowledgeNode(nodeId);
  if (!node) return [];
  return node.relatedAgents.map((id) => agents.find((a) => a.id === id)).filter((a): a is Agent => Boolean(a));
}

export function getKnowledgeForAgent(agentId: string): KnowledgeNode[] {
  return knowledgeNodes.filter((n) => n.relatedAgents.includes(agentId));
}

export function getKnowledgeForTask(knowledgeContext: string[]): KnowledgeNode[] {
  return knowledgeContext.map((id) => getKnowledgeNode(id)).filter((n): n is KnowledgeNode => Boolean(n));
}

export type KnowledgeSearchResult = {
  direct: string[]; // node ids whose label/description/category matched the query
  related: string[]; // one hop out from a direct match, excluding anything already direct
};

const EMPTY_RESULT: KnowledgeSearchResult = { direct: [], related: [] };

// Spec §24's example — searching "BCI" should surface EEG, Signal
// Processing and Classification too, not just nodes whose label literally
// contains "bci". Direct text/category matches expand one hop along
// relatedNodes, since a search is meant to help someone find a *topic*,
// not just grep node names.
export function findKnowledgeNodes(query: string): KnowledgeSearchResult {
  const q = query.trim().toLowerCase();
  if (!q) return EMPTY_RESULT;

  const direct = knowledgeNodes.filter(
    (n) =>
      n.label.toLowerCase().includes(q) ||
      n.description.toLowerCase().includes(q) ||
      n.category.toLowerCase().includes(q)
  );
  const directIds = new Set(direct.map((n) => n.id));

  const relatedIds = new Set<string>();
  direct.forEach((n) => n.relatedNodes.forEach((id) => !directIds.has(id) && relatedIds.add(id)));

  return { direct: Array.from(directIds), related: Array.from(relatedIds) };
}

// The default knowledge context a newly-created task draws on (spec §33),
// keyed by the primary agent's domain. Curated rather than derived, so
// each domain's context reads as a deliberate, coherent set rather than
// "every node that happens to be reachable".
export const DOMAIN_KNOWLEDGE_CONTEXT: Record<AgentDomain, string[]> = {
  "artificial-intelligence": ["artificial-intelligence", "machine-learning", "deep-learning", "reinforcement-learning"],
  robotics: ["robotics", "ros2", "robot-control", "motion-planning", "navigation"],
  "brain-computer-interfaces": [
    "hybrid-adaptive-bci",
    "brain-computer-interface",
    "eeg",
    "signal-processing",
    "classification",
    "machine-learning",
  ],
  "data-science": ["data-engineering", "sql", "python"],
  automation: ["automation", "ai-agents", "workflow-orchestration"],
  "software-engineering": ["software-architecture", "typescript", "nextjs"],
};

export function getKnowledgeContextForDomain(domain: AgentDomain): string[] {
  return DOMAIN_KNOWLEDGE_CONTEXT[domain] ?? [];
}
