"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import { PROJECT_CENTER_POSITION, PROJECT_CENTER_HEIGHT } from "@/lib/ai-lab/layout";
import { createProjectDisplayTexture } from "@/lib/ai-lab/canvasTextures";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { FloatingAgentLabel } from "./FloatingAgentLabel";
import type { ProjectItem } from "@/lib/ai-lab/types";

// The lab's physical Project Workspace representation (Phase 8) — an
// engineering workbench beside the Knowledge/Research Centers: a flat
// bench top, a few small component props, and an angled schematic display
// (like a drafting board), not a floating card or a holographic prop.
// Interaction mirrors AgentWorkstation/ResearchCenter3D exactly (invisible
// hit area, a floor ring that brightens on hover/select) so it reads as
// one more workstation in the same room.
export function ProjectCenter3D({
  item,
  selected,
  hovered,
  active,
  onSelect,
  onHoverChange,
}: {
  item: ProjectItem;
  selected: boolean;
  hovered: boolean;
  active: boolean;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const ringRef = useRef<Mesh>(null);
  const screenRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const [x, , z] = PROJECT_CENTER_POSITION;
  const color = TONE_HEX.gold;

  const texture = useMemo(
    () => createProjectDisplayTexture(item.title, item.category, item.technologies),
    [item.title, item.category, item.technologies]
  );

  useCursor(hovered);

  useFrame((state) => {
    if (ringRef.current) {
      const material = ringRef.current.material as THREE.MeshStandardMaterial;
      const targetOpacity = selected ? 0.9 : hovered ? 0.55 : active ? 0.35 : 0.12;
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, 0.15);
    }
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      const base = active ? 0.85 : 0.6;
      const amount = active ? 0.15 : 0.05;
      const speed = active ? 1.8 : 0.5;
      material.emissiveIntensity = shouldReduceMotion
        ? base
        : base + Math.sin(state.clock.elapsedTime * speed + 1.2) * amount;
    }
  });

  const labelEmphasis = selected || hovered ? "emphasized" : active ? "normal" : "dimmed";

  return (
    <group position={[x, 0, z]}>
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
        <boxGeometry args={[1.7, 1.4, 1.5]} />
      </mesh>

      <mesh ref={ringRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.72, 0.82, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>

      {/* Workbench base + wide flat top */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.15, 0.4, 0.85]} />
        <meshStandardMaterial color={MATERIAL.desk} roughness={0.6} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.435, 0]}>
        <boxGeometry args={[1.3, 0.05, 1.0]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.45} metalness={0.4} />
      </mesh>

      {/* Small engineering-component props scattered on the bench */}
      <mesh position={[0.42, 0.51, 0.28]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.14]} />
        <meshStandardMaterial color={MATERIAL.beam} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.36, 0.5, -0.22]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.09, 12]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Angled schematic display, like a drafting board propped on the bench */}
      <group position={[-0.28, 0.46, -0.1]} rotation={[-0.55, 0.22, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.62, 0.62, 0.04]} />
          <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh ref={screenRef} position={[0, 0.42, 0.023]}>
          <planeGeometry args={[0.56, 0.56]} />
          <meshStandardMaterial
            map={texture}
            emissive="#ffffff"
            emissiveMap={texture ?? undefined}
            emissiveIntensity={0.65}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.735, 0.023]}>
          <boxGeometry args={[0.58, 0.018, 0.01]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 1.2 : 0.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      <group position={[0, PROJECT_CENTER_HEIGHT + 0.55, -0.1]}>
        <FloatingAgentLabel name="Project" tone="gold" emphasis={labelEmphasis} />
      </group>
    </group>
  );
}
