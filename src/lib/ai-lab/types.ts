import type { SignalTone } from "@/components/ui/SignalNode";

// Shared type foundation for ABD AI LAB. Task/Activity/AgentMessage/
// systemStatus are driven by lib/ai-lab/useAgentRuntime.ts (per-agent
// state) and useAgentOrchestrator.ts (command routing, the simulated task
// lifecycle, and the inter-agent communication relay it plays out over —
// see communicationScript.ts) — all in-memory, session-only, local
// simulations. No real backend, no real execution, no real messaging.
// KnowledgeNode (Phase 6) is a structured local knowledge graph — see
// data/ai-lab-knowledge.ts for content and lib/ai-lab/knowledgeGraph.ts for
// the lookup/traversal utilities — not a real knowledge base, embeddings
// index or retrieval system. ResearchItem (Phase 7) is a structured
// pointer into this site's real research content — see
// data/ai-lab-research.ts for content and lib/ai-lab/researchGraph.ts for
// the lookup utilities — not a research database or publication feed.
// ProjectItem (Phase 8) is the same kind of structured pointer, this time
// into this site's real project content — see data/ai-lab-projects.ts and
// lib/ai-lab/projectGraph.ts — not a record of real engineering work.

export type AgentStatus =
  | "idle"
  | "waiting"
  | "working"
  | "thinking"
  | "completed"
  | "error";

export type AgentDomain =
  | "artificial-intelligence"
  | "robotics"
  | "brain-computer-interfaces"
  | "data-science"
  | "automation"
  | "software-engineering";

// A task's lifecycle (Phase 4 spec §8): QUEUED -> THINKING -> WORKING ->
// COMPLETED, or FAILED if the (simulated, deliberately-triggered) error
// path runs instead.
export type TaskStatus = "queued" | "thinking" | "working" | "completed" | "failed";

// Only "simulation" exists today. The field is here so a future phase can
// add "live" without changing every call site that already reads it.
export type ExecutionMode = "simulation";

// A task, either seeded as an agent's illustrative "current work" (Phase 3
// data/ai-lab.ts) or created by the orchestrator from a submitted command
// (Phase 4). `collaborators` here is the set THIS task actually activated —
// a subset of the assigned agent's general Agent.collaborators — so the
// two can differ (an agent may generally collaborate with three others but
// only two are relevant to a given command).
export type Task = {
  id: string;
  title: string;
  description: string;
  assignedAgent: string;
  collaborators: string[];
  status: TaskStatus;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: string;
  nextStep?: string;
  executionMode: ExecutionMode;
  // Ids of knowledge nodes this task draws on (Phase 6 §33) — set from a
  // per-domain lookup at creation, used to "activate" the corresponding
  // Knowledge Brain nodes while the task runs and to show them again in
  // the completed result.
  knowledgeContext: string[];
  // Ids of research items this task draws on (Phase 7 §12) — optional and
  // usually empty: only the domains an actual ResearchItem lists as
  // relatedAgents get one (see researchGraph.ts's getResearchContextForDomain).
  // A robotics task, for example, has no research context, since there is
  // no robotics research item — this is never auto-attached.
  researchContext?: string[];
  // Ids of project items this task was submitted for (Phase 8 §12) — set
  // only when the command was submitted from the Project Workspace with a
  // project actually selected (see useAgentOrchestrator.ts's submitCommand
  // taking an optional projectId). Most tasks have no project context.
  projectContext?: string[];
  // How the command was interpreted (Phase 10 §17/§18) — stored once at
  // submission time so History/Result/Operations can show the same
  // interpretation later without recomputing it from a selection state
  // that may have since changed. Not a duplicate of knowledgeContext/
  // researchContext/projectContext above, which already carry the actual
  // resolved context ids — this just records the shape of the decision
  // (was a selection used, and a short human-readable intent phrase).
  commandContext?: TaskCommandContext;
};

// Phase 10 §3 — which kind of lab selection (if any) shaped a command's
// interpretation. Mirrors the mutual-exclusion selection state
// AgentLabProvider already owns; "task" covers the case where a task is
// active/displayed but none of the four selections are (see
// commandContext.ts's getCurrentCommandContext).
export type CommandContextSource = "overview" | "agent" | "knowledge" | "research" | "project" | "task";

export type TaskCommandContext = {
  source: CommandContextSource;
  usedContext: boolean;
  intentLabel: string;
  subjectLabel: string;
};

export type ActivityType =
  | "system"
  | "orchestrator"
  | "agent"
  | "communication"
  | "knowledge"
  | "research"
  | "project"
  | "task"
  | "result";

// `agentId` is who the activity is ABOUT (null for lab-wide system
// messages with no single subject); `type` is which layer produced it —
// see ActivityStream.tsx for how the two combine into a display label.
export type Activity = {
  id: string;
  type: ActivityType;
  agentId: string | null;
  message: string;
  timestamp: string;
};

export type Agent = {
  id: string;
  name: string;
  role: string;
  domain: AgentDomain;
  status: AgentStatus;
  tone: SignalTone;
  summary: string;
  focusAreas: string[];
  skills: string[];
  currentTask: Task;
  lastActivity: Activity;
  // Ids of other agents this one conceptually collaborates with — a
  // simulation of a multi-agent system, not a record of real agent-to-agent
  // messaging. Deliberately ids, not role-name strings, so lookups stay
  // type-safe against `agents`.
  collaborators: string[];
};

export type MessageType = "request" | "context" | "analysis" | "handoff" | "result" | "system";
export type MessageStatus = "queued" | "traveling" | "delivered" | "processed";

// A simulated inter-agent message (Phase 5) — an in-memory record of the
// orchestrator's own relay-chain simulation (see
// lib/ai-lab/communicationScript.ts), not real agent-to-agent networking.
// `fromAgent`/`toAgent` are usually an Agent.id, but can also be the
// sentinel values ORCHESTRATOR_ID or SYSTEM_ID (see below) for the legs at
// either end of a task (orchestrator assigning work, system receiving the
// final result) — those two sentinels have real 3D positions too (the
// Command Center and the AI Core respectively), so every leg of a
// conversation can be visualized consistently.
export type AgentMessage = {
  id: string;
  fromAgent: string;
  toAgent: string;
  taskId: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  createdAt: string;
  // Wall-clock ms timestamp (Date.now()) mirroring `createdAt`, kept
  // separately because the 3D layer needs a fast numeric time to interpolate
  // a packet's position every frame without re-parsing an ISO string.
  startedAtMs: number;
  travelDurationMs: number;
};

export const ORCHESTRATOR_ID = "orchestrator";
export const SYSTEM_ID = "system";
// The Knowledge Brain as a message participant (Phase 6 §18) — like
// ORCHESTRATOR_ID/SYSTEM_ID, this resolves to a real 3D position (the
// Knowledge Center) so a "knowledge supplied to agent" leg can reuse the
// exact same MessagePacket infrastructure as any other communication.
export const KNOWLEDGE_ID = "knowledge";

export type KnowledgeCategory =
  | "research"
  | "ai"
  | "robotics"
  | "bci"
  | "data"
  | "automation"
  | "software"
  | "technology"
  | "method"
  | "system";

// A node in the local knowledge graph (Phase 6) — a structured map of
// concepts this site's actual content already supports (see
// data/ai-lab-knowledge.ts), not a real knowledge base, vector store or
// retrieval system. `relatedResearch`/`relatedTechnologies` are freeform
// labels (research area / tool names already used elsewhere on the site),
// not ids into another collection — there's no separate "research" or
// "technology" entity type to point at. `importance` is 1-3 and only
// drives visual weight (3 = a domain root, 1 = a specific technique).
export type KnowledgeNode = {
  id: string;
  label: string;
  category: KnowledgeCategory;
  description: string;
  relatedAgents: string[];
  relatedNodes: string[];
  relatedResearch: string[];
  relatedTechnologies: string[];
  importance: 1 | 2 | 3;
};

// Only "THESIS" exists today because that's the only real research item
// this site documents (see data/ai-lab-research.ts) — the field is here so
// a future publication/preprint doesn't require renaming the type.
export type ResearchType = "THESIS";

// A research item in the local Research Intelligence layer (Phase 7) — a
// structured pointer into content that already exists elsewhere on the
// site (data/featured-research.ts, data/publications.ts, data/projects.ts),
// not a second copy of that content and not a real research database.
// `relatedKnowledge` are KnowledgeNode ids, `relatedAgents` are Agent ids
// and `relatedProjects` are Project slugs (see data/projects.ts) — real
// foreign keys into existing collections, not freeform labels.
// `relatedTechnologies` stays freeform, matching KnowledgeNode's own
// convention, since there's no separate "technology" entity to point at.
export type ResearchItem = {
  id: string;
  title: string;
  type: ResearchType;
  status: string;
  description: string;
  route: string;
  relatedKnowledge: string[];
  relatedAgents: string[];
  relatedTechnologies: string[];
  relatedProjects: string[];
  focusAreas: string[];
};

// A project item in the local Project Workspace layer (Phase 8) — a
// structured pointer into this site's real project content
// (data/projects.ts), not a second copy of it and not a record of actual
// engineering work performed by these simulated agents. `relatedKnowledge`
// is grounded in real technology overlap with the knowledge graph;
// `relatedAgents` is DERIVED (the union of relatedAgents across
// `relatedKnowledge`'s own nodes — see projectGraph.ts), never manually
// invented, so a project only lists an agent when the knowledge graph
// itself already connects them. `relatedResearch` is likewise derived from
// ResearchItem.relatedProjects (data/ai-lab-research.ts), not a second,
// independently-authored relationship. `status` is omitted (not
// fabricated) when the source project has none.
export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  route: string;
  category: string;
  status?: string;
  technologies: string[];
  relatedKnowledge: string[];
  relatedResearch: string[];
  relatedAgents: string[];
};

export type LabMode = "simulation" | "live";

// Phase 4 spec §25's four global states, surfaced in the Command Center.
export type SystemStatus = "ready" | "processing" | "completed" | "error";

export type LabState = {
  mode: LabMode;
  agents: Agent[];
  tasks: Task[];
  activity: Activity[];
  messages: AgentMessage[];
  knowledge: KnowledgeNode[];
  systemStatus: SystemStatus;
  // Knowledge Brain UI state (Phase 6 §31) — lives in the same
  // AgentLabProvider context as everything above, not a separate store.
  // activeKnowledgeNodes isn't its own field in the real provider — it's
  // derived from the running task's Task.knowledgeContext (see
  // AgentLabProvider.tsx), listed here only to document the concept.
  selectedKnowledgeNodeId: string | null;
  knowledgeFilter: KnowledgeCategory | "all";
  knowledgeSearch: string;
  // Research Intelligence UI state (Phase 7) — same provider, same
  // mutual-exclusion-with-agent/knowledge-selection pattern, not a second
  // store. See AgentLabProvider.tsx.
  selectedResearchId: string | null;
  // Project Workspace UI state (Phase 8) — same provider, same
  // mutual-exclusion pattern extended to four selections instead of three.
  selectedProjectId: string | null;
};
