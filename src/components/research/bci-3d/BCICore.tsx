"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { GlowRing } from "@/components/3d/GlowRing";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { CORE_POSITION } from "./layout";
import { Nameplate } from "./Nameplate";

// H. CENTRAL BCI SYSTEM CORE — a restrained scientific visualization sitting
// on the pipeline's spine, deliberately not a repaint of the Hero/AI Lab's
// core: a small faceted crystalline solid (not a brain shape) on a low
// pedestal, ringed by four thin orbits — one per element of the system
// (brain, AI, adaptation, robotics) — rather than a glowing orb. A quiet
// landmark, not an interactive station: no hover/click hit-volume.

const RINGS = [
  { radius: 0.62, color: "#2dd4c8", tilt: [0.1, 0, 0] as const },
  { radius: 0.78, color: "#5b9dff", tilt: [0, 0, 0.14] as const },
  { radius: 0.94, color: "#e0a23d", tilt: [-0.12, 0, 0.05] as const },
  { radius: 1.1, color: "#5cf2a8", tilt: [0.06, 0, -0.16] as const },
];

export function BCICore() {
  const { running } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const core = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion || !core.current) return;
    core.current.rotation.y += delta * (running ? 0.35 : 0.12);
    core.current.rotation.x += delta * 0.05;
  });

  return (
    <group position={CORE_POSITION as unknown as [number, number, number]}>
      <group position-y={0.55}>
        <mesh position-y={-0.42}>
          <cylinderGeometry args={[0.34, 0.4, 0.22, 24]} />
          <meshStandardMaterial color="#161a21" roughness={0.5} metalness={0.5} />
        </mesh>
        <group ref={core}>
          <mesh>
            <icosahedronGeometry args={[0.22, 1]} />
            <meshPhysicalMaterial
              color="#0e1420"
              emissive="#5b9dff"
              emissiveIntensity={running ? 0.75 : 0.4}
              roughness={0.2}
              metalness={0.15}
              transmission={0.35}
              thickness={0.3}
              ior={1.4}
              transparent
              opacity={0.95}
            />
          </mesh>
          <mesh scale={1.03}>
            <icosahedronGeometry args={[0.22, 1]} />
            <meshBasicMaterial color="#8fc4ff" wireframe transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
        {/* A thin glass display shell — grounds the geometry as a physical
            visualization installation on the pedestal rather than a free-
            floating effect. */}
        <mesh>
          <cylinderGeometry args={[0.36, 0.36, 0.5, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#0a1018"
            transmission={0.85}
            roughness={0.08}
            thickness={0.05}
            ior={1.45}
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
          />
        </mesh>
        {RINGS.map((ring, i) => (
          <GlowRing
            key={i}
            radius={ring.radius}
            y={0}
            color={ring.color}
            width={0.02}
            core={0.2}
            opacity={0.4}
            tilt={ring.tilt as unknown as [number, number, number]}
          />
        ))}
      </group>
      <Nameplate text="Hybrid Adaptive BCI" sub="System core" position={[0, 1.55, 0.85]} />
    </group>
  );
}
