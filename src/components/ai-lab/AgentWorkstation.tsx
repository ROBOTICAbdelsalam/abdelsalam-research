"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import type { Agent } from "@/lib/ai-lab/types";
import type { Vec3 } from "@/lib/ai-lab/layout";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { AgentMonitor } from "./AgentMonitor";
import { AgentStatusLight } from "./AgentStatusLight";
import { FloatingAgentLabel } from "./FloatingAgentLabel";

export function AgentWorkstation({
  agent,
  position,
  rotationY,
  selected,
  hovered,
  dimmed = false,
  isCollaborator = false,
  onSelect,
  onHoverChange,
}: {
  agent: Agent;
  position: Vec3;
  rotationY: number;
  selected: boolean;
  hovered: boolean;
  dimmed?: boolean;
  isCollaborator?: boolean;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const ringRef = useRef<Mesh>(null);
  const color = TONE_HEX[agent.tone];
  const labelEmphasis = selected || hovered ? "emphasized" : dimmed ? "dimmed" : "normal";

  useCursor(hovered);

  useFrame(() => {
    if (!ringRef.current) return;
    const material = ringRef.current.material as THREE.MeshStandardMaterial;
    const targetOpacity = selected ? 0.9 : hovered ? 0.55 : isCollaborator ? 0.3 : 0.12;
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.15);
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Generous invisible hit area — larger than the visible desk so the
          workstation is easy to target without the visuals feeling oversized. */}
      <mesh
        visible={false}
        position={[0, 0.6, 0]}
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
        <boxGeometry args={[1.8, 1.6, 1.8]} />
      </mesh>

      <mesh ref={ringRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.75, 0.85, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 0.36, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.72, 0.6]} />
        <meshStandardMaterial color={MATERIAL.desk} roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.73, -0.12]}>
        <boxGeometry args={[1.05, 0.03, 0.4]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.35} metalness={0.55} />
      </mesh>

      <group position={[0, 1.02, -0.24]}>
        <AgentMonitor
          domain={agent.domain}
          tone={agent.tone}
          status={agent.status}
          dimmed={dimmed}
          phase={position[0] + position[2]}
        />
      </group>

      <AgentStatusLight status={agent.status} dimmed={dimmed} position={[0.42, 0.78, 0.16]} />

      <group position={[0, 1.55, -0.24]}>
        <FloatingAgentLabel name={agent.name} tone={agent.tone} emphasis={labelEmphasis} />
      </group>
    </group>
  );
}
