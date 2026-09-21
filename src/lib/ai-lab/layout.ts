import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import type { Agent, AgentDomain } from "./types";
import { KNOWLEDGE_ID, ORCHESTRATOR_ID, SYSTEM_ID } from "./types";

// Spatial layout for the 3D laboratory (Phase 2). One shared config so
// positions aren't scattered across scene components. Units are meters-ish,
// Y up, floor at y = 0.
//
// Composition: six workstations form a hexagon around a central AI Core —
// deliberately echoing the homepage Hero's six-nodes-around-a-core diagram
// (see components/sections/HeroVisual.tsx) in three dimensions. The Command
// Center sits at the front of the room (closest to the default camera,
// like an operator's console overseeing the floor); the Knowledge Center
// sits at the back, opposite it.

export type Vec3 = [number, number, number];

export const ROOM = {
  halfWidth: 10,
  halfDepth: 13,
  wallHeight: 6.4,
};

// Yaw (radians) so a group's default forward (-Z) faces the origin.
export function facingOrigin(x: number, z: number) {
  return Math.atan2(x, z);
}

export const CORE_POSITION: Vec3 = [0, 0, 0];
export const COMMAND_CENTER_POSITION: Vec3 = [0, 0, 10.4];
export const KNOWLEDGE_CENTER_POSITION: Vec3 = [0, 0, -10.4];
// The Research Center (Phase 7) sits directly beside the Knowledge Center,
// in the same research-oriented corner of the room rather than a new area
// — same depth (z), offset sideways by enough to clear the Knowledge
// Center's pedestal and node cluster entirely.
export const RESEARCH_CENTER_POSITION: Vec3 = [-3.6, 0, -10.4];
// The Project Center (Phase 8) mirrors the Research Center on the other
// side of the Knowledge Center — same back-of-room row (Knowledge in the
// middle, Research and Project flanking it), keeping the room's existing
// composition rather than opening a new area.
export const PROJECT_CENTER_POSITION: Vec3 = [3.6, 0, -10.4];

// Where a workstation-to-core DataPathway meets the core, and where a
// message addressed to/from an agent (rather than the orchestrator or
// system) converges at that agent's desk — shared here so LabScene and the
// Phase 5 communication layer agree on the same points without duplicating
// the numbers.
export const CORE_LINK_HEIGHT = 0.8;
const AGENT_MESSAGE_HEIGHT = 1.55;
// Height of the node cluster on top of the Knowledge Center's pedestal —
// shared so KnowledgeCenter3D and the Phase 6 message/camera-focus code
// agree on where "the graph" actually sits.
export const KNOWLEDGE_CLUSTER_HEIGHT = 1.75;
// Height of the Research Center's display panel — shared so
// ResearchCenter3D and the Phase 7 camera-focus code agree on where "the
// research display" actually sits.
export const RESEARCH_CENTER_HEIGHT = 1.35;
// Height of the Project Center's schematic display — shared so
// ProjectCenter3D and the Phase 8 camera-focus code agree on where "the
// workbench display" actually sits.
export const PROJECT_CENTER_HEIGHT = 1.1;

export const WORKSTATION_POSITIONS: Record<AgentDomain, Vec3> = {
  "artificial-intelligence": [-4.2, 0, -6.5],
  "brain-computer-interfaces": [4.2, 0, -6.5],
  "data-science": [-7, 0, 0],
  robotics: [7, 0, 0],
  automation: [-4.2, 0, 6.5],
  "software-engineering": [4.2, 0, 6.5],
};

export const CAMERA_DEFAULT = {
  position: [0, 13.5, 19] as Vec3,
  target: [0, 1.6, -1.5] as Vec3,
};

// Generic "focus" shot for any workstation: pulled outward and up from the
// desk, centered on the desk itself (not the midpoint toward the core) so
// the selected workstation is what actually fills the frame.
export function focusShotFor(position: Vec3, targetHeight = 1.1): { position: Vec3; target: Vec3 } {
  const [x, , z] = position;
  return {
    position: [x * 1.65, 3.6, z * 1.65],
    target: [x * 0.9, targetHeight, z * 0.9],
  };
}

// A point offset sideways from a workstation, in the workstation's own
// rotated frame — used to place freestanding decor (the robotic arm, the
// BCI panel) beside a desk without hand-picking world coordinates per item.
export function offsetFrom(position: Vec3, rotationY: number, localOffset: [number, number]): Vec3 {
  const [x, y, z] = position;
  const [lx, lz] = localOffset;
  const dx = lx * Math.cos(rotationY) + lz * Math.sin(rotationY);
  const dz = -lx * Math.sin(rotationY) + lz * Math.cos(rotationY);
  return [x + dx, y, z + dz];
}

// The physical point a Phase 5 AgentMessage's endpoint resolves to. Every
// leg of a communication — including the ones at either end of a task,
// where the sender/receiver is the orchestrator or "the system" rather
// than an agent — has a real 3D position: the Command Center desk stands
// in for the orchestrator, and the AI Core stands in for the system,
// exactly the physical roles those objects already play in the room.
export function resolveParticipantPosition(participantId: string, agents: Agent[]): Vec3 {
  if (participantId === ORCHESTRATOR_ID) {
    return [COMMAND_CENTER_POSITION[0], 2.1, COMMAND_CENTER_POSITION[2]];
  }
  if (participantId === SYSTEM_ID) {
    return [CORE_POSITION[0], CORE_LINK_HEIGHT + 1.3, CORE_POSITION[2]];
  }
  if (participantId === KNOWLEDGE_ID) {
    return [KNOWLEDGE_CENTER_POSITION[0], KNOWLEDGE_CLUSTER_HEIGHT, KNOWLEDGE_CENTER_POSITION[2]];
  }
  const agent = agents.find((a) => a.id === participantId);
  if (!agent) return CORE_POSITION;
  const [x, , z] = WORKSTATION_POSITIONS[agent.domain];
  return [x, AGENT_MESSAGE_HEIGHT, z];
}

const MIN_TRAVEL_MS = 300;
const MAX_TRAVEL_MS = 900;

// Spec §11: message travel takes 300-900ms depending on distance, so a
// visitor can actually perceive it rather than seeing an instant jump.
export function travelDurationFor(from: Vec3, to: Vec3): number {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return Math.min(MAX_TRAVEL_MS, Math.max(MIN_TRAVEL_MS, 300 + distance * 40));
}

// --- Knowledge Brain 3D graph layout (Phase 6) ---------------------------
//
// Which domain "cluster" each knowledge node visually belongs to, plus the
// hub node (intelligent-systems) that sits unclustered at the center.
// Hand-authored rather than derived from `category` alone, so the graph's
// spatial grouping matches its actual conceptual grouping — the same one
// DOMAIN_KNOWLEDGE_CONTEXT in knowledgeGraph.ts curates per domain — rather
// than an approximation (several categories, like "technology" or
// "method", span more than one domain).
export const KNOWLEDGE_HUB_ID = "intelligent-systems";
export const KNOWLEDGE_CLUSTERS: Record<AgentDomain, string[]> = {
  "artificial-intelligence": [
    "artificial-intelligence",
    "machine-learning",
    "deep-learning",
    "reinforcement-learning",
    "computer-vision",
  ],
  "brain-computer-interfaces": [
    "brain-computer-interface",
    "eeg",
    "signal-processing",
    "feature-extraction",
    "classification",
    "human-machine-interaction",
    "hybrid-adaptive-bci",
  ],
  "data-science": ["data-engineering", "sql", "python"],
  robotics: ["robotics", "ros2", "robot-control", "motion-planning", "navigation"],
  automation: ["automation", "ai-agents", "workflow-orchestration"],
  "software-engineering": ["software-architecture", "typescript", "nextjs"],
};

// The angular order the six clusters are placed around the hub — mirrors
// WORKSTATION_POSITIONS' own key order so the knowledge graph's wedges read
// consistently with the room's workstation layout.
const KNOWLEDGE_CLUSTER_ORDER: AgentDomain[] = [
  "artificial-intelligence",
  "brain-computer-interfaces",
  "data-science",
  "robotics",
  "automation",
  "software-engineering",
];

// Shortest hop-distance from a cluster's root, walking only edges that stay
// inside that cluster — this is what turns real `relatedNodes` data into a
// radius (root at the center of its wedge, deeper concepts further out).
function hopDistancesFromRoot(rootId: string, clusterIds: Set<string>): Map<string, number> {
  const distances = new Map<string, number>([[rootId, 0]]);
  const queue = [rootId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    const node = knowledgeNodes.find((n) => n.id === current);
    if (!node) continue;
    for (const neighborId of node.relatedNodes) {
      if (!clusterIds.has(neighborId) || distances.has(neighborId)) continue;
      distances.set(neighborId, (distances.get(current) ?? 0) + 1);
      queue.push(neighborId);
    }
  }
  return distances;
}

const KNOWLEDGE_BASE_RADIUS = 1.05;
const KNOWLEDGE_RADIUS_STEP = 0.6;
const KNOWLEDGE_WEDGE_DEGREES = 360 / KNOWLEDGE_CLUSTER_ORDER.length;

// A deterministic (not per-render-random) layout for the Knowledge Brain's
// 3D graph, local to the cluster group that sits atop the Knowledge Center
// pedestal (see KNOWLEDGE_CLUSTER_HEIGHT) — spec §21/§28: the same shape
// every load, driven by the graph's own relatedNodes edges rather than an
// arbitrary sphere scatter.
export function computeKnowledgeLayout(): Record<string, Vec3> {
  const positions: Record<string, Vec3> = { [KNOWLEDGE_HUB_ID]: [0, 0.5, 0] };

  KNOWLEDGE_CLUSTER_ORDER.forEach((domain, clusterIndex) => {
    const clusterIds = KNOWLEDGE_CLUSTERS[domain];
    const clusterIdSet = new Set(clusterIds);
    const rootId = clusterIds[0];
    const distances = hopDistancesFromRoot(rootId, clusterIdSet);
    const clusterAngle = clusterIndex * KNOWLEDGE_WEDGE_DEGREES;
    const verticalDirection = clusterIndex % 2 === 0 ? 1 : -1;

    const byHop = new Map<number, string[]>();
    clusterIds.forEach((id) => {
      const hop = distances.get(id) ?? 0;
      byHop.set(hop, [...(byHop.get(hop) ?? []), id]);
    });

    byHop.forEach((idsAtHop, hop) => {
      const radius = KNOWLEDGE_BASE_RADIUS + hop * KNOWLEDGE_RADIUS_STEP;
      const spread = Math.min(KNOWLEDGE_WEDGE_DEGREES * 0.7, idsAtHop.length * 14);
      idsAtHop.forEach((id, i) => {
        const offset = idsAtHop.length > 1 ? (i - (idsAtHop.length - 1) / 2) * (spread / idsAtHop.length) : 0;
        const angleRad = ((clusterAngle + offset) * Math.PI) / 180;
        const y = hop * 0.06 * verticalDirection;
        positions[id] = [Math.sin(angleRad) * radius, y, Math.cos(angleRad) * radius];
      });
    });
  });

  return positions;
}

// Every undirected edge in the graph, deduped — relatedNodes is symmetric
// (a lists b and b lists a), so reading it naively would draw each
// connection twice.
export function computeKnowledgeEdges(): [string, string][] {
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  knowledgeNodes.forEach((node) => {
    node.relatedNodes.forEach((relatedId) => {
      const key = [node.id, relatedId].sort().join("::");
      if (seen.has(key)) return;
      seen.add(key);
      edges.push([node.id, relatedId]);
    });
  });
  return edges;
}
