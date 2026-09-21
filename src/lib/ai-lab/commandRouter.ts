import type { AgentDomain } from "./types";

// A LOCAL heuristic keyword router — not an LLM, not an intelligent
// classifier. It scores a command against a fixed per-domain keyword list
// and picks the highest-scoring domain. Word-boundary matching (not raw
// substring) avoids the obvious false positives short keywords invite —
// e.g. "ai" inside "email", "ml" inside "html".
const DOMAIN_KEYWORDS: Record<AgentDomain, string[]> = {
  "brain-computer-interfaces": ["bci", "eeg", "brain", "neural signal", "neural"],
  robotics: ["robot", "robots", "robotic", "robotics", "ros2", "ros 2", "navigation", "motion"],
  "data-science": ["data", "sql", "dataset", "datasets", "analysis"],
  automation: ["automation", "workflow", "workflows", "api", "apis", "pipeline", "pipelines"],
  "software-engineering": ["code", "software", "architecture", "typescript", "next.js", "nextjs"],
  "artificial-intelligence": ["ai", "machine learning", "model", "models", "deep learning", "research"],
};

// Checked in this order when scores tie, so a command mentioning both "BCI"
// and "research" (see spec example 1) resolves to the more specific domain
// (BCI) rather than the broad catch-all (AI).
const DOMAIN_PRIORITY: AgentDomain[] = [
  "brain-computer-interfaces",
  "robotics",
  "data-science",
  "automation",
  "software-engineering",
  "artificial-intelligence",
];

// The task-level collaborator set for each primary domain — a
// generalization of the Phase 4 spec's six deterministic routing examples
// (§12) into one rule per domain, rather than pattern-matching six exact
// sentences. Deliberately a subset of that agent's general
// Agent.collaborators, not a copy of it — a given command only activates
// the collaborators actually relevant to it.
const TASK_COLLABORATORS: Record<AgentDomain, AgentDomain[]> = {
  "brain-computer-interfaces": ["artificial-intelligence", "data-science"],
  robotics: ["software-engineering", "automation"],
  "artificial-intelligence": ["data-science"],
  "data-science": ["automation", "software-engineering"],
  automation: ["software-engineering", "data-science"],
  "software-engineering": ["artificial-intelligence", "automation"],
};

// Exposed so a project-aware command (Phase 8 §11) that overrides the
// primary domain via the project's own curated domain — rather than
// whatever routeCommand's keyword match would have picked — can still look
// up the right collaborator set for that (possibly different) domain,
// without duplicating this table a second time.
export function getCollaboratorDomainsForDomain(domain: AgentDomain): AgentDomain[] {
  return TASK_COLLABORATORS[domain];
}

// A NARROWER keyword set than DOMAIN_KEYWORDS above, used only to detect
// whether a command names a domain clearly and unambiguously enough to
// override a currently-selected Agent/Knowledge/Research/Project context
// (Phase 10 §7/§10/§11). DOMAIN_KEYWORDS deliberately includes broad,
// overloaded words ("architecture", "code", "data", "research", "ai") that
// still work fine for picking a domain when nothing is selected, but would
// make a poor override signal — "analyze the architecture" while ROS2
// Robotics Systems is selected should stay a robotics command, not jump to
// software-engineering just because "architecture" is one of its keywords.
// Only words that are essentially exclusive to one domain qualify here.
const STRONG_DOMAIN_KEYWORDS: Record<AgentDomain, string[]> = {
  "brain-computer-interfaces": ["bci", "eeg", "brain", "neural signal", "neural"],
  robotics: ["robot", "robots", "robotic", "robotics", "ros2", "ros 2", "navigation", "motion planning"],
  "data-science": ["sql", "dataset", "datasets"],
  automation: ["workflow", "workflows", "pipeline", "pipelines"],
  "software-engineering": ["typescript", "next.js", "nextjs"],
  "artificial-intelligence": ["machine learning", "deep learning", "reinforcement learning"],
};

// Returns the domain a command names explicitly and unambiguously enough
// to override existing lab context — undefined if the command is generic
// ("analyze the architecture", "review this") rather than naming a
// specific different domain outright ("analyze ROS2 navigation").
export function detectExplicitDomain(command: string): AgentDomain | undefined {
  for (const domain of DOMAIN_PRIORITY) {
    if (countMatches(command, STRONG_DOMAIN_KEYWORDS[domain]) > 0) return domain;
  }
  return undefined;
}

export type RoutingResult = {
  primaryDomain: AgentDomain;
  collaboratorDomains: AgentDomain[];
  matched: boolean;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countMatches(command: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => {
    const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, "i");
    return pattern.test(command) ? count + 1 : count;
  }, 0);
}

export function routeCommand(command: string): RoutingResult {
  let bestDomain: AgentDomain | null = null;
  let bestScore = 0;

  for (const domain of DOMAIN_PRIORITY) {
    const score = countMatches(command, DOMAIN_KEYWORDS[domain]);
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }

  // No keyword matched anything — spec §23's fallback: AI Researcher as
  // the general-purpose agent, explicitly flagged as unmatched so the UI
  // can say so rather than pretend it understood the command.
  if (!bestDomain) {
    return { primaryDomain: "artificial-intelligence", collaboratorDomains: [], matched: false };
  }

  return { primaryDomain: bestDomain, collaboratorDomains: TASK_COLLABORATORS[bestDomain], matched: true };
}
