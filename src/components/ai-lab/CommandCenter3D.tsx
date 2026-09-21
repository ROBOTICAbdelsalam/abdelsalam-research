"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import { COMMAND_CENTER_POSITION } from "@/lib/ai-lab/layout";
import { createCommandDisplayTexture } from "@/lib/ai-lab/canvasTextures";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Agent } from "@/lib/ai-lab/types";

// The physical command center: an operator's console facing into the lab,
// with a status wall behind it. Purely a 3D representation for Phase 2 —
// no command execution is wired up (that's Phase 4, per the brief).
export function CommandCenter3D({ agents, mode }: { agents: Agent[]; mode: string }) {
  const screenRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const [x, , z] = COMMAND_CENTER_POSITION;

  const texture = useMemo(
    () => createCommandDisplayTexture(agents.map((a) => a.name), mode),
    [agents, mode]
  );

  useFrame((state) => {
    if (!screenRef.current) return;
    const material = screenRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = shouldReduceMotion
      ? 0.75
      : 0.68 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
  });

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.9, 0.7]} />
        <meshStandardMaterial color={MATERIAL.desk} roughness={0.65} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.92, -0.1]}>
        <boxGeometry args={[2.05, 0.04, 0.5]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.4} metalness={0.5} />
      </mesh>

      <mesh position={[0, 2.1, 0.55]}>
        <boxGeometry args={[2.4, 1.5, 0.06]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh ref={screenRef} position={[0, 2.1, 0.52]}>
        <planeGeometry args={[2.2, 1.3]} />
        <meshStandardMaterial
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture ?? undefined}
          emissiveIntensity={0.72}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[-0.7, 0, 0.7].map((offsetX) => (
        <mesh key={offsetX} position={[offsetX, 0.94, 0.05]}>
          <boxGeometry args={[0.16, 0.03, 0.16]} />
          <meshStandardMaterial
            color={TONE_HEX.trace}
            emissive={TONE_HEX.trace}
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
