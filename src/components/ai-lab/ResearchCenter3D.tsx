"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useCursor } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import { RESEARCH_CENTER_POSITION, RESEARCH_CENTER_HEIGHT } from "@/lib/ai-lab/layout";
import { createResearchDisplayTexture } from "@/lib/ai-lab/canvasTextures";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { FloatingAgentLabel } from "./FloatingAgentLabel";
import type { ResearchItem } from "@/lib/ai-lab/types";

// The lab's physical Research Intelligence representation (Phase 7) — a
// slim reading stand beside the Knowledge Center: a low document stack and
// an upright technical display panel, not a giant glowing book or a
// sci-fi hologram. Interaction mirrors AgentWorkstation exactly (generous
// invisible hit area, a floor ring that brightens on hover/select) so it
// reads as one more workstation in the same room, not a bespoke UI widget.
export function ResearchCenter3D({
  item,
  selected,
  hovered,
  active,
  onSelect,
  onHoverChange,
}: {
  item: ResearchItem;
  selected: boolean;
  hovered: boolean;
  active: boolean;
  onSelect: () => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const ringRef = useRef<Mesh>(null);
  const screenRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const [x, , z] = RESEARCH_CENTER_POSITION;
  const color = TONE_HEX.trace;

  const texture = useMemo(
    () => createResearchDisplayTexture(item.title, item.status, item.focusAreas),
    [item.title, item.status, item.focusAreas]
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
        : base + Math.sin(state.clock.elapsedTime * speed) * amount;
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
        <boxGeometry args={[1.6, 1.6, 1.4]} />
      </mesh>

      <mesh ref={ringRef} position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.78, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.12}
          toneMapped={false}
        />
      </mesh>

      {/* Low reading-stand base */}
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.32, 0.75]} />
        <meshStandardMaterial color={MATERIAL.desk} roughness={0.6} metalness={0.25} />
      </mesh>

      {/* A small stacked-document motif — thin offset plates, not a giant book */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.22 + i * 0.02, 0.335 + i * 0.028, 0.16 - i * 0.03]} castShadow>
          <boxGeometry args={[0.42, 0.025, 0.3]} />
          <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* Upright technical display panel */}
      <group position={[0.12, 0, -0.12]} rotation={[0, -0.18, 0]}>
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[0.72, 0.9, 0.045]} />
          <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.4} />
        </mesh>
        <mesh ref={screenRef} position={[0, 0.98, 0.026]}>
          <planeGeometry args={[0.64, 0.8]} />
          <meshStandardMaterial
            map={texture}
            emissive="#ffffff"
            emissiveMap={texture ?? undefined}
            emissiveIntensity={0.65}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Thin accent trim along the top edge */}
        <mesh position={[0, 1.445, 0.026]}>
          <boxGeometry args={[0.66, 0.02, 0.01]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 1.2 : 0.6}
            toneMapped={false}
          />
        </mesh>
      </group>

      <group position={[0, RESEARCH_CENTER_HEIGHT + 0.55, -0.12]}>
        <FloatingAgentLabel name="Research" tone="trace" emphasis={labelEmphasis} />
      </group>
    </group>
  );
}
