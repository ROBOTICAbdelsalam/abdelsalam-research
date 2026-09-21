"use client";

import { Canvas } from "@react-three/fiber";
import type { Agent, AgentDomain, AgentMessage, SystemStatus } from "@/lib/ai-lab/types";
import { researchItems } from "@/data/ai-lab-research";
import { projectItems, featuredProjectId } from "@/data/ai-lab-projects";
import {
  CORE_POSITION,
  COMMAND_CENTER_POSITION,
  KNOWLEDGE_CENTER_POSITION,
  KNOWLEDGE_CLUSTER_HEIGHT,
  RESEARCH_CENTER_POSITION,
  RESEARCH_CENTER_HEIGHT,
  PROJECT_CENTER_POSITION,
  PROJECT_CENTER_HEIGHT,
  WORKSTATION_POSITIONS,
  CAMERA_DEFAULT,
  CORE_LINK_HEIGHT,
  facingOrigin,
  focusShotFor,
  offsetFrom,
  resolveParticipantPosition,
} from "@/lib/ai-lab/layout";
import { LAB_COLORS } from "@/lib/ai-lab/colors";
import { LabLighting } from "./LabLighting";
import { LabFloor } from "./LabFloor";
import { LabEnvironment } from "./LabEnvironment";
import { AICore } from "./AICore";
import { CommandCenter3D } from "./CommandCenter3D";
import { KnowledgeCenter3D } from "./KnowledgeCenter3D";
import { ResearchCenter3D } from "./ResearchCenter3D";
import { ProjectCenter3D } from "./ProjectCenter3D";
import { AgentWorkstation } from "./AgentWorkstation";
import { RoboticElement } from "./RoboticElement";
import { BCIVisualization } from "./BCIVisualization";
import { DataPathway } from "./DataPathway";
import { MessagePacket } from "./MessagePacket";
import { CameraRig } from "./CameraRig";

const primaryResearchItem = researchItems[0];
const defaultProjectItem = projectItems.find((p) => p.id === featuredProjectId) ?? projectItems[0];

// Spec §12: "use a small maximum active-message count" — the simulation is
// strictly one-leg-at-a-time so this is mostly a defensive ceiling, not
// something that binds in practice.
const MAX_VISIBLE_PACKETS = 3;

export function LabScene({
  agents,
  selectedAgentId,
  hoveredAgentId,
  systemStatus,
  activeTaskCollaboratorIds,
  messages,
  onSelectAgent,
  onHoverAgent,
  selectedKnowledgeNodeId,
  hoveredKnowledgeNodeId,
  activeKnowledgeNodeIds,
  onSelectKnowledgeNode,
  onHoverKnowledgeNode,
  selectedResearchId,
  hoveredResearchId,
  activeResearchIds,
  onSelectResearch,
  onHoverResearch,
  selectedProjectId,
  hoveredProjectId,
  activeProjectIds,
  onSelectProject,
  onHoverProject,
}: {
  agents: Agent[];
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  systemStatus: SystemStatus;
  activeTaskCollaboratorIds: string[] | null;
  messages: AgentMessage[];
  onSelectAgent: (id: string | null) => void;
  onHoverAgent: (id: string | null) => void;
  selectedKnowledgeNodeId: string | null;
  hoveredKnowledgeNodeId: string | null;
  activeKnowledgeNodeIds: string[];
  onSelectKnowledgeNode: (id: string | null) => void;
  onHoverKnowledgeNode: (id: string | null) => void;
  selectedResearchId: string | null;
  hoveredResearchId: string | null;
  activeResearchIds: string[];
  onSelectResearch: (id: string | null) => void;
  onHoverResearch: (id: string | null) => void;
  selectedProjectId: string | null;
  hoveredProjectId: string | null;
  activeProjectIds: string[];
  onSelectProject: (id: string | null) => void;
  onHoverProject: (id: string | null) => void;
}) {
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;
  const focus = selectedAgent
    ? focusShotFor(WORKSTATION_POSITIONS[selectedAgent.domain])
    : selectedKnowledgeNodeId
      ? focusShotFor(KNOWLEDGE_CENTER_POSITION, KNOWLEDGE_CLUSTER_HEIGHT)
      : selectedResearchId
        ? focusShotFor(RESEARCH_CENTER_POSITION, RESEARCH_CENTER_HEIGHT)
        : selectedProjectId
          ? focusShotFor(PROJECT_CENTER_POSITION, PROJECT_CENTER_HEIGHT)
          : null;
  const displayedProject = projectItems.find((p) => p.id === selectedProjectId) ?? defaultProjectItem;
  // While a task is running for the selected agent, its task-specific
  // collaborators (a curated subset — see commandRouter.ts) take over from
  // its general Agent.collaborators list, so the collaboration signal
  // reflects who's actually involved in the running task.
  const collaboratorIds = new Set(activeTaskCollaboratorIds ?? selectedAgent?.collaborators ?? []);

  // Only messages genuinely mid-flight get a 3D packet — delivered/
  // processed ones simply stop rendering, which lines up with the packet
  // visually completing its journey (see MessagePacket.tsx).
  const travelingMessages = messages.filter((m) => m.status === "traveling").slice(0, MAX_VISIBLE_PACKETS);

  const roboticsWorkstationDomain: AgentDomain = "robotics";
  const bciWorkstationDomain: AgentDomain = "brain-computer-interfaces";
  const roboticsRotation = facingOrigin(...toXZ(WORKSTATION_POSITIONS[roboticsWorkstationDomain]));
  const bciRotation = facingOrigin(...toXZ(WORKSTATION_POSITIONS[bciWorkstationDomain]));

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.5]}
      gl={{ antialias: true }}
      camera={{ position: CAMERA_DEFAULT.position, fov: 42, near: 0.1, far: 60 }}
      onPointerMissed={() => {
        onSelectAgent(null);
        onSelectKnowledgeNode(null);
        onSelectResearch(null);
        onSelectProject(null);
      }}
    >
      <color attach="background" args={[LAB_COLORS.background]} />
      <fog attach="fog" args={[LAB_COLORS.background, 22, 44]} />

      <LabLighting />
      <LabFloor />
      <LabEnvironment />
      <AICore active={systemStatus === "processing"} />
      <CommandCenter3D agents={agents} mode="simulation" />
      <KnowledgeCenter3D
        selectedNodeId={selectedKnowledgeNodeId}
        hoveredNodeId={hoveredKnowledgeNodeId}
        activeNodeIds={activeKnowledgeNodeIds}
        onSelectNode={onSelectKnowledgeNode}
        onHoverNode={onHoverKnowledgeNode}
      />
      <ResearchCenter3D
        item={primaryResearchItem}
        selected={selectedResearchId === primaryResearchItem.id}
        hovered={hoveredResearchId === primaryResearchItem.id}
        active={activeResearchIds.includes(primaryResearchItem.id)}
        onSelect={() => onSelectResearch(selectedResearchId === primaryResearchItem.id ? null : primaryResearchItem.id)}
        onHoverChange={(hovered) => onHoverResearch(hovered ? primaryResearchItem.id : null)}
      />
      <ProjectCenter3D
        item={displayedProject}
        selected={selectedProjectId === displayedProject.id}
        hovered={hoveredProjectId === displayedProject.id}
        active={activeProjectIds.includes(displayedProject.id)}
        onSelect={() => onSelectProject(selectedProjectId === displayedProject.id ? null : displayedProject.id)}
        onHoverChange={(hovered) => onHoverProject(hovered ? displayedProject.id : null)}
      />

      <RoboticElement
        position={offsetFrom(WORKSTATION_POSITIONS[roboticsWorkstationDomain], roboticsRotation, [0.95, 0.25])}
      />
      <BCIVisualization
        position={offsetFrom(WORKSTATION_POSITIONS[bciWorkstationDomain], bciRotation, [0.85, 0.1])}
      />

      {agents.map((agent) => {
        const position = WORKSTATION_POSITIONS[agent.domain];
        const rotationY = facingOrigin(...toXZ(position));
        const isSelected = selectedAgentId === agent.id;
        const isCollaborator = collaboratorIds.has(agent.id);
        const dimmed = selectedAgent !== null && !isSelected && !isCollaborator;
        return (
          <group key={agent.id}>
            <AgentWorkstation
              agent={agent}
              position={position}
              rotationY={rotationY}
              selected={isSelected}
              hovered={hoveredAgentId === agent.id}
              dimmed={dimmed}
              isCollaborator={isCollaborator}
              onSelect={() => onSelectAgent(isSelected ? null : agent.id)}
              onHoverChange={(hovered) => onHoverAgent(hovered ? agent.id : null)}
            />
            <DataPathway
              from={[position[0], CORE_LINK_HEIGHT, position[2]]}
              to={[CORE_POSITION[0], CORE_LINK_HEIGHT + 1.3, CORE_POSITION[2]]}
              tone={agent.tone}
              phase={position[0] + position[2]}
              active={isSelected}
            />
          </group>
        );
      })}

      {/* Collaboration signal (spec §11): only drawn while an agent is
          selected — the lab stays visually quiet otherwise — as a
          hub-and-spoke from the selected workstation out to each of its
          collaborators, with the selected agent as the origin. */}
      {selectedAgent &&
        Array.from(collaboratorIds).map((collaboratorId) => {
          const collaboratorAgent = agents.find((a) => a.id === collaboratorId);
          if (!collaboratorAgent) return null;
          const fromPos = WORKSTATION_POSITIONS[selectedAgent.domain];
          const toPos = WORKSTATION_POSITIONS[collaboratorAgent.domain];
          return (
            <DataPathway
              key={`collab-${collaboratorId}`}
              from={[fromPos[0], 1.55, fromPos[2]]}
              to={[toPos[0], 1.55, toPos[2]]}
              tone={selectedAgent.tone}
              speed={0.5}
              active
            />
          );
        })}

      <DataPathway
        from={[CORE_POSITION[0], CORE_LINK_HEIGHT + 1.3, CORE_POSITION[2]]}
        to={[KNOWLEDGE_CENTER_POSITION[0], 1.75, KNOWLEDGE_CENTER_POSITION[2]]}
        tone="violet"
        speed={0.22}
      />
      <DataPathway
        from={[CORE_POSITION[0], CORE_LINK_HEIGHT + 1.3, CORE_POSITION[2]]}
        to={[COMMAND_CENTER_POSITION[0], 2.1, COMMAND_CENTER_POSITION[2]]}
        tone="trace"
        speed={0.28}
      />
      {/* Research Center sits beside the Knowledge Center (Phase 7 §8) — a
          single ambient link between the two, same as the Core's own
          ambient links above, not a new pathway system. */}
      <DataPathway
        from={[KNOWLEDGE_CENTER_POSITION[0], 1.2, KNOWLEDGE_CENTER_POSITION[2]]}
        to={[RESEARCH_CENTER_POSITION[0], 0.9, RESEARCH_CENTER_POSITION[2]]}
        tone="trace"
        speed={0.3}
      />
      {/* Project Center mirrors Research Center on the other side of the
          Knowledge Center (Phase 8 §5) — same single ambient link pattern. */}
      <DataPathway
        from={[KNOWLEDGE_CENTER_POSITION[0], 1.2, KNOWLEDGE_CENTER_POSITION[2]]}
        to={[PROJECT_CENTER_POSITION[0], 0.65, PROJECT_CENTER_POSITION[2]]}
        tone="gold"
        speed={0.3}
      />

      {/* Message packets (spec §7/§9): one small capsule per in-flight
          message, travelling between the two participants' real 3D
          positions — including the Command Center (orchestrator) and the
          AI Core (system) at either end of a task. */}
      {travelingMessages.map((message) => {
        const fromAgentEntity = agents.find((a) => a.id === message.fromAgent);
        const toAgentEntity = agents.find((a) => a.id === message.toAgent);
        const tone = fromAgentEntity?.tone ?? toAgentEntity?.tone ?? "accent";
        return (
          <MessagePacket
            key={message.id}
            from={resolveParticipantPosition(message.fromAgent, agents)}
            to={resolveParticipantPosition(message.toAgent, agents)}
            tone={tone}
            startedAtMs={message.startedAtMs}
            durationMs={message.travelDurationMs}
          />
        );
      })}

      <CameraRig focus={focus} />
    </Canvas>
  );
}

function toXZ(position: readonly [number, number, number]): [number, number] {
  return [position[0], position[2]];
}
