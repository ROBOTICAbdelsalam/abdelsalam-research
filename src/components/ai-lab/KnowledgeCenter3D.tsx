"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import {
  KNOWLEDGE_CENTER_POSITION,
  KNOWLEDGE_CLUSTER_HEIGHT,
  KNOWLEDGE_HUB_ID,
  computeKnowledgeEdges,
  computeKnowledgeLayout,
  type Vec3,
} from "@/lib/ai-lab/layout";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { useReducedMotion } from "@/lib/useReducedMotion";

const IMPORTANCE_SIZE: Record<1 | 2 | 3, number> = { 1: 0.055, 2: 0.075, 3: 0.1 };
const HUB_SIZE = 0.12;

type NodeVisualState = "selected" | "connected" | "active" | "dimmed" | "normal";

// One node in the graph — a small emissive sphere with a generous invisible
// hit target (matching AgentWorkstation's own hit-area pattern), so
// targeting a ~0.06-unit sphere doesn't require pixel-perfect pointing.
function KnowledgeNodeMesh({
  position,
  size,
  tone,
  hovered,
  state,
  onSelect,
  onHoverChange,
}: {
  position: Vec3;
  size: number;
  tone: string;
  hovered: boolean;
  state: NodeVisualState;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const meshRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  useCursor(hovered);

  useFrame((frameState) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    const base = state === "selected" ? 2.2 : state === "connected" ? 1.4 : state === "dimmed" ? 0.25 : 1;
    const activePulse =
      state === "active" && !shouldReduceMotion ? Math.sin(frameState.clock.elapsedTime * 3.4) * 0.5 + 1.6 : base;
    const target = hovered ? Math.max(base, 1.8) : state === "active" ? activePulse : base;
    material.emissiveIntensity = THREE.MathUtils.lerp(material.emissiveIntensity, target, 0.2);
    material.opacity = THREE.MathUtils.lerp(material.opacity, state === "dimmed" ? 0.35 : 1, 0.2);
  });

  return (
    <group position={position}>
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHoverChange(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHoverChange(false);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[size + 0.09, 8, 8]} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 12, 12]} />
        <meshStandardMaterial
          color={tone}
          emissive={tone}
          emissiveIntensity={1}
          transparent
          opacity={1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

// The Knowledge Center's physical form (Phase 6) — a real, interactive
// rendering of the local knowledge graph (data/ai-lab-knowledge.ts), not a
// decorative placeholder: same 27 nodes and edges the 2D Knowledge Brain
// panel reads, laid out deterministically (see computeKnowledgeLayout) so
// the graph looks the same on every load. Selecting a node highlights it
// and its direct connections and dims the rest (spec §22); a running
// task's knowledgeContext pulses its nodes independently of selection.
export function KnowledgeCenter3D({
  selectedNodeId,
  hoveredNodeId,
  activeNodeIds,
  onSelectNode,
  onHoverNode,
}: {
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  activeNodeIds: string[];
  onSelectNode: (id: string | null) => void;
  onHoverNode: (id: string | null) => void;
}) {
  const groupRef = useRef<Group>(null);
  const shouldReduceMotion = useReducedMotion();
  const [x, , z] = KNOWLEDGE_CENTER_POSITION;

  const layout = useMemo(() => computeKnowledgeLayout(), []);
  const edges = useMemo(() => computeKnowledgeEdges(), []);
  const activeSet = useMemo(() => new Set(activeNodeIds), [activeNodeIds]);

  const selectedNode = selectedNodeId ? knowledgeNodes.find((n) => n.id === selectedNodeId) ?? null : null;
  const connectedIds = useMemo(() => new Set(selectedNode?.relatedNodes ?? []), [selectedNode]);

  // Rotation is a resting-state flourish only — it stops the moment someone
  // is actually trying to hover or click a node, since a moving target
  // defeats the point of making the graph interactive.
  useFrame((_, delta) => {
    if (shouldReduceMotion || !groupRef.current || selectedNodeId || hoveredNodeId) return;
    groupRef.current.rotation.y += delta * 0.05;
  });

  function stateFor(nodeId: string): NodeVisualState {
    if (nodeId === selectedNodeId) return "selected";
    if (activeSet.has(nodeId)) return "active";
    if (selectedNodeId && connectedIds.has(nodeId)) return "connected";
    if (selectedNodeId) return "dimmed";
    return "normal";
  }

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.9, 1.05, 0.3, 20]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.45} metalness={0.55} />
      </mesh>

      <group ref={groupRef} position={[0, KNOWLEDGE_CLUSTER_HEIGHT, 0]}>
        {edges.map(([a, b]) => {
          const posA = layout[a];
          const posB = layout[b];
          if (!posA || !posB) return null;
          const touchesSelected = selectedNodeId !== null && (a === selectedNodeId || b === selectedNodeId);
          const dimmed = selectedNodeId !== null && !touchesSelected;
          const edgeTone = TONE_HEX[getKnowledgeNodeTone(a === KNOWLEDGE_HUB_ID ? b : a)];
          return (
            <Line
              key={`${a}-${b}`}
              points={[posA, posB]}
              color={edgeTone}
              lineWidth={touchesSelected ? 1.6 : 1}
              transparent
              opacity={dimmed ? 0.08 : touchesSelected ? 0.8 : 0.25}
            />
          );
        })}

        {knowledgeNodes.map((node) => {
          const position = layout[node.id];
          if (!position) return null;
          const size = node.id === KNOWLEDGE_HUB_ID ? HUB_SIZE : IMPORTANCE_SIZE[node.importance];
          return (
            <KnowledgeNodeMesh
              key={node.id}
              position={position}
              size={size}
              tone={TONE_HEX[getKnowledgeNodeTone(node.id)]}
              hovered={hoveredNodeId === node.id}
              state={stateFor(node.id)}
              onSelect={() => onSelectNode(selectedNodeId === node.id ? null : node.id)}
              onHoverChange={(hovered) => onHoverNode(hovered ? node.id : null)}
            />
          );
        })}
      </group>
    </group>
  );
}
