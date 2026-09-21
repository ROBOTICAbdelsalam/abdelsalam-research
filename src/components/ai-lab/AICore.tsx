"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group, Mesh } from "three";
import { CORE_POSITION } from "@/lib/ai-lab/layout";
import { LAB_COLORS, MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { useReducedMotion } from "@/lib/useReducedMotion";

// The lab's centerpiece — an engineered computational core, not a magic
// orb: a matte pedestal, a slowly rotating wireframe lattice, a
// counter-rotating tilted ring, and a small pulsing emissive core at the
// center. All geometry is primitive (icosahedron/torus/cylinder) — no
// external models. `active` (spec §18) lifts rotation speed and emissive
// intensity while a task is executing, lerping back to baseline afterward
// rather than snapping — "do not overdo the effect" means a ~1.5-1.6x
// bump, not a different animation.
export function AICore({ active = false }: { active?: boolean }) {
  const latticeRef = useRef<Group>(null);
  const ringRef = useRef<Mesh>(null);
  const coreRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const activityRef = useRef(0);

  useFrame((state, delta) => {
    if (shouldReduceMotion) return;
    activityRef.current = THREE.MathUtils.lerp(activityRef.current, active ? 1 : 0, delta * 1.5);
    const boost = 1 + activityRef.current * 0.6;

    if (latticeRef.current) latticeRef.current.rotation.y += delta * 0.12 * boost;
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.18 * boost;
      const material = ringRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.8 + activityRef.current * 0.5;
    }
    if (coreRef.current) {
      const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 1.4 * boost) * (0.15 + activityRef.current * 0.08);
      coreRef.current.scale.setScalar(pulse);
      const material = coreRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 1.1 + activityRef.current * 0.6;
    }
  });

  const [x, , z] = CORE_POSITION;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.16, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.7, 1.9, 0.32, 24]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.34, 0]}>
        <torusGeometry args={[1.55, 0.03, 12, 48]} />
        <meshStandardMaterial
          color={TONE_HEX.accent}
          emissive={TONE_HEX.accent}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>

      <group ref={latticeRef} position={[0, 2.1, 0]}>
        <mesh>
          <icosahedronGeometry args={[1.05, 1]} />
          <meshStandardMaterial
            color={LAB_COLORS.borderStrong}
            wireframe
            emissive={TONE_HEX.trace}
            emissiveIntensity={0.25}
          />
        </mesh>
      </group>

      <mesh ref={ringRef} position={[0, 2.1, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 8, 64]} />
        <meshStandardMaterial
          color={TONE_HEX.trace}
          emissive={TONE_HEX.trace}
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={coreRef} position={[0, 2.1, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={TONE_HEX.accent}
          emissive={TONE_HEX.accent}
          emissiveIntensity={1.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
