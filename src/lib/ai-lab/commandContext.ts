import type { Agent, AgentDomain, CommandContextSource, TaskCommandContext } from "./types";
import { detectExplicitDomain, getCollaboratorDomainsForDomain, routeCommand } from "./commandRouter";
import {
  getKnowledgeContextForDomain,
  getKnowledgeNode,
  getDomainForKnowledgeNode,
  getRelatedNodes,
} from "./knowledgeGraph";
import {
  getResearchContextForDomain,
  getResearchItem,
  getDomainForResearch,
  getResearchForKnowledgeNode,
} from "./researchGraph";
import { getProject, getDomainForProject, getProjectsForKnowledgeNode, getProjectsForResearch } from "./projectGraph";

// Phase 10 — the Command Center's context model. Nothing here is new
// state: a CommandContext is always DERIVED, on demand, from the four
// mutually-exclusive selections AgentLabProvider already owns (at most one
// of them is ever non-null) plus the current activeTaskId. See
// getCurrentCommandContext below.

export type CommandContext = {
  agentId?: string;
  knowledgeNodeId?: string;
  researchId?: string;
  projectId?: string;
  taskId?: string;
  source: CommandContextSource;
};

const EMPTY_CONTEXT: CommandContext = { source: "overview" };

// Priority order from spec §7: Project > Research > Knowledge > Agent.
// Since the four selections are already mutually exclusive (selecting one
// clears the other three — see AgentLabProvider.tsx), at most one branch
// here ever actually fires; the ordering below just mirrors that priority
// for anyone reading this rather than because more than one could be set.
export function getCurrentCommandContext(selection: {
  selectedAgentId: string | null;
  selectedKnowledgeNodeId: string | null;
  selectedResearchId: string | null;
  selectedProjectId: string | null;
  activeTaskId: string | null;
}): CommandContext {
  const taskId = selection.activeTaskId ?? undefined;
  if (selection.selectedProjectId) return { projectId: selection.selectedProjectId, taskId, source: "project" };
  if (selection.selectedResearchId) return { researchId: selection.selectedResearchId, taskId, source: "research" };
  if (selection.selectedKnowledgeNodeId) return { knowledgeNodeId: selection.selectedKnowledgeNodeId, taskId, source: "knowledge" };
  if (selection.selectedAgentId) return { agentId: selection.selectedAgentId, taskId, source: "agent" };
  // A task can be active/displayed with nothing selected (e.g. right after
  // it completes) — recorded for display, but deliberately NOT used to
  // shape a new command's routing (see resolveCommandInterpretation):
  // inheriting a past task's context into an unrelated new command is
  // exactly the "context contamination" spec §11 warns against.
  if (taskId) return { taskId, source: "task" };
  return EMPTY_CONTEXT;
}

// Which domain the CURRENT selection points to, in the same Project >
// Research > Knowledge > Agent priority order — undefined for "overview"/
// "task" sources, since neither implies a domain on its own.
export function resolveContextualDomain(context: CommandContext, agents: Agent[]): AgentDomain | undefined {
  if (context.projectId) return getDomainForProject(context.projectId);
  if (context.researchId) return getDomainForResearch(context.researchId);
  if (context.knowledgeNodeId) return getDomainForKnowledgeNode(context.knowledgeNodeId);
  if (context.agentId) return agents.find((a) => a.id === context.agentId)?.domain;
  return undefined;
}

export type CommandContextRow = {
  key: "project" | "research" | "knowledge" | "agent";
  label: string;
  value: string;
};

// The Command Center's context strip (spec §4) — deliberately minimal:
// the selected entity's own row, plus (when it isn't already the agent)
// which agent a generic command would currently resolve to. The fuller
// Knowledge/Research/Project breakdown for a SPECIFIC typed command lives
// in the Command Brief (CommandPreview.tsx) instead, which has an actual
// command to reason about — keeping this strip subtle rather than growing
// it into a second dashboard.
export function describeCommandContext(context: CommandContext, agents: Agent[]): CommandContextRow[] {
  const rows: CommandContextRow[] = [];
  if (context.source === "project" && context.projectId) {
    const project = getProject(context.projectId);
    if (project) rows.push({ key: "project", label: "Project", value: project.title });
  } else if (context.source === "research" && context.researchId) {
    const research = getResearchItem(context.researchId);
    if (research) {
      const shortLabel = getKnowledgeNode(research.id)?.label ?? research.title;
      rows.push({ key: "research", label: "Research", value: shortLabel });
    }
  } else if (context.source === "knowledge" && context.knowledgeNodeId) {
    const node = getKnowledgeNode(context.knowledgeNodeId);
    if (node) rows.push({ key: "knowledge", label: "Knowledge", value: node.label });
  } else if (context.source === "agent" && context.agentId) {
    const agent = agents.find((a) => a.id === context.agentId);
    if (agent) rows.push({ key: "agent", label: "Agent", value: agent.name });
  }

  if (context.source !== "agent") {
    const domain = resolveContextualDomain(context, agents);
    const agent = domain ? agents.find((a) => a.domain === domain) : undefined;
    if (agent) rows.push({ key: "agent", label: "Agent", value: agent.name });
  }

  return rows;
}

// A short, deterministic action-noun for the Command Brief's "Intent" line
// (spec §8/§12) — not real language understanding, just a fixed
// verb->noun lookup over the command's own first recognized word. Anything
// unrecognized falls back to a plain "Task" label.
const INTENT_VERBS: [RegExp, string][] = [
  [/\banalyz(e|ing)\b/i, "Analysis"],
  [/\breview(ing)?\b/i, "Review"],
  [/\bexplor(e|ing)\b/i, "Exploration"],
  [/\bplan(ning)?\b/i, "Planning"],
  [/\bdesign(ing)?\b/i, "Design"],
  [/\bcompar(e|ing)\b/i, "Comparison"],
  [/\bcreat(e|ing)\b/i, "Creation"],
];

function buildIntentNoun(command: string): string {
  for (const [pattern, noun] of INTENT_VERBS) {
    if (pattern.test(command)) return noun;
  }
  return "Task";
}

const DOMAIN_LABEL: Record<AgentDomain, string> = {
  "artificial-intelligence": "Artificial Intelligence",
  robotics: "Robotics",
  "brain-computer-interfaces": "Brain-Computer Interfaces",
  "data-science": "Data Science",
  automation: "Automation",
  "software-engineering": "Software Engineering",
};

export type CommandInterpretation = {
  primaryDomain: AgentDomain;
  primary: Agent;
  collaborators: Agent[];
  knowledgeContext: string[];
  researchContext: string[];
  projectContext: string[];
  matched: boolean;
  usedContext: boolean;
  intentLabel: string;
  subjectLabel: string;
};

// The single place a command's full interpretation is computed — used by
// BOTH the live Command Brief preview (CommandPreview.tsx) and the actual
// submitCommand in useAgentOrchestrator.ts, so what gets previewed is
// exactly what gets simulated. Pure and synchronous (spec §26): no
// network, no LLM, just the existing keyword router and graph utilities.
//
// Priority (spec §7): an explicit, unambiguous domain keyword in the
// command (detectExplicitDomain) always wins and clears any selected
// entity's context (spec §10/§11 — "context isolation"). Otherwise, the
// current selection's domain wins over the plain keyword router. With
// neither, this behaves exactly like every command before Phase 10.
export function resolveCommandInterpretation(
  rawCommand: string,
  context: CommandContext,
  agents: Agent[]
): CommandInterpretation {
  const command = rawCommand.trim();
  const keywordRouting = routeCommand(command);
  const contextDomain = resolveContextualDomain(context, agents);
  const explicitDomain = detectExplicitDomain(command);

  let primaryDomain: AgentDomain;
  let matched: boolean;
  let usedContext: boolean;

  if (explicitDomain && explicitDomain !== contextDomain) {
    primaryDomain = explicitDomain;
    matched = true;
    usedContext = false;
  } else if (contextDomain) {
    primaryDomain = contextDomain;
    matched = true;
    usedContext = true;
  } else {
    primaryDomain = keywordRouting.primaryDomain;
    matched = keywordRouting.matched;
    usedContext = false;
  }

  const primary = agents.find((a) => a.domain === primaryDomain)!;
  const collaborators = getCollaboratorDomainsForDomain(primaryDomain)
    .map((domain) => agents.find((a) => a.domain === domain))
    .filter((a): a is Agent => Boolean(a));

  let knowledgeContext: string[];
  let researchContext: string[];
  let projectContext: string[];
  let subjectLabel = DOMAIN_LABEL[primaryDomain];

  if (usedContext && context.source === "project" && context.projectId) {
    const project = getProject(context.projectId);
    knowledgeContext = project && project.relatedKnowledge.length > 0 ? project.relatedKnowledge : getKnowledgeContextForDomain(primaryDomain);
    researchContext = project ? project.relatedResearch : [];
    projectContext = project ? [project.id] : [];
    if (project) subjectLabel = project.title;
  } else if (usedContext && context.source === "research" && context.researchId) {
    const research = getResearchItem(context.researchId);
    knowledgeContext = research ? research.relatedKnowledge : getKnowledgeContextForDomain(primaryDomain);
    researchContext = research ? [research.id] : [];
    projectContext = getProjectsForResearch(context.researchId).map((p) => p.id);
    if (research) subjectLabel = getKnowledgeNode(research.id)?.label ?? research.title;
  } else if (usedContext && context.source === "knowledge" && context.knowledgeNodeId) {
    // §14: primary knowledge + related knowledge via the existing graph —
    // never the generic per-domain default once a SPECIFIC node is
    // selected, and never nodes outside its own direct neighborhood.
    const node = getKnowledgeNode(context.knowledgeNodeId);
    knowledgeContext = node
      ? Array.from(new Set([node.id, ...getRelatedNodes(node.id).map((n) => n.id)]))
      : getKnowledgeContextForDomain(primaryDomain);
    // §15: research only attaches here because it's "directly relevant" —
    // this specific node is part of a real research item — not because of
    // the broader domain.
    researchContext = getResearchForKnowledgeNode(context.knowledgeNodeId).map((r) => r.id);
    projectContext = getProjectsForKnowledgeNode(context.knowledgeNodeId).map((p) => p.id);
    if (node) subjectLabel = node.label;
  } else {
    // source is "agent"/"task"/"overview", or an explicit override just
    // cleared the selected entity's context — plain domain defaults,
    // identical to how every command has resolved since Phase 6/7.
    knowledgeContext = getKnowledgeContextForDomain(primaryDomain);
    researchContext = getResearchContextForDomain(primaryDomain);
    projectContext = [];
  }

  return {
    primaryDomain,
    primary,
    collaborators,
    knowledgeContext,
    researchContext,
    projectContext,
    matched,
    usedContext,
    intentLabel: `${buildIntentNoun(command)} — ${subjectLabel}`,
    subjectLabel,
  };
}

export function toTaskCommandContext(context: CommandContext, interpretation: CommandInterpretation): TaskCommandContext {
  return {
    source: context.source,
    usedContext: interpretation.usedContext,
    intentLabel: interpretation.intentLabel,
    subjectLabel: interpretation.subjectLabel,
  };
}

// Context-aware suggestions (spec §21) — grounded only in the selected
// entity's own real data (title/technologies/related knowledge), never
// invented capabilities. Returns null for "overview"/"task"/"agent"
// sources so CommandCenter falls back to its existing generic suggestions
// unchanged.
export function getContextualSuggestions(context: CommandContext): string[] | null {
  if (context.source === "project" && context.projectId) {
    const project = getProject(context.projectId);
    if (!project) return null;
    const knowledge = project.relatedKnowledge.map((id) => getKnowledgeNode(id)).filter((n): n is NonNullable<typeof n> => Boolean(n));
    const suggestions = [`Analyze the ${project.title} architecture`, `Review the ${project.title} pipeline`];
    knowledge.slice(0, 2).forEach((node) => suggestions.push(`Explore ${node.label}`));
    return suggestions.slice(0, 4);
  }
  if (context.source === "research" && context.researchId) {
    const research = getResearchItem(context.researchId);
    if (!research) return null;
    const shortLabel = getKnowledgeNode(research.id)?.label ?? research.title;
    const knowledge = research.relatedKnowledge.map((id) => getKnowledgeNode(id)).filter((n): n is NonNullable<typeof n> => Boolean(n));
    const suggestions = [`Analyze the ${shortLabel} architecture`, `Review the ${shortLabel} pipeline`];
    knowledge.slice(0, 2).forEach((node) => suggestions.push(`Explore ${node.label}`));
    return suggestions.slice(0, 4);
  }
  if (context.source === "knowledge" && context.knowledgeNodeId) {
    const node = getKnowledgeNode(context.knowledgeNodeId);
    if (!node) return null;
    const related = getRelatedNodes(node.id);
    const suggestions = [`Explore ${node.label}`, `Analyze ${node.label} in depth`];
    related.slice(0, 2).forEach((related_) => suggestions.push(`Review ${related_.label}`));
    return suggestions.slice(0, 4);
  }
  return null;
}
