"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Group } from "three";
import { WithAsset } from "@/components/3d/AssetBoundary";
import { extractGeometry, normalizeToUnitHeight } from "@/components/3d/gltfGeometry";
import { GlowRing } from "@/components/3d/GlowRing";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { CORE_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";

// CENTRAL BCI VISUALIZATION — a real anatomical brain mesh (the same
// optimized GLB the Hero's AI/ML node uses, public/models/brain.glb, CC BY
// 3.0 — restyled here as a grounded glass-and-emissive installation, not
// Hero's hologram; see src/data/bci-assets.ts), inside a thin glass display
// case on a pedestal, ringed by four thin orbits — one per element of the
// system (brain, AI, adaptation, robotics). A walk-up landmark on the open
// floor, not a floating sci-fi object: no hover/click hit-volume, and no
// permanent glow ring on the ground beneath it.

const RINGS = [
  { radius: 0.5, color: "#2dd4c8", tilt: [0.1, 0, 0] as const },
  { radius: 0.62, color: "#5b9dff", tilt: [0, 0, 0.14] as const },
  { radius: 0.74, color: "#e0a23d", tilt: [-0.12, 0, 0.05] as const },
  { radius: 0.86, color: "#5cf2a8", tilt: [0.06, 0, -0.16] as const },
];

function GlbBrain({ running }: { running: boolean }) {
  const gltf = useGLTF("/models/brain.glb", false);
  const geometry = useMemo(() => {
    const geo = extractGeometry(gltf.scene);
    normalizeToUnitHeight(geo);
    geo.translate(0, -0.5, 0); // centre vertically instead of base-on-floor
    geo.scale(0.34, 0.34, 0.34);
    return geo;
  }, [gltf]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow>
      {/* No `transmission` here deliberately — it forces WebGL to render an
          extra off-screen pass for refraction, which measurably hurt frame
          pacing (and, in turn, the camera-transition convergence loop) once
          combined with this scene's real GLB furniture and shadows.
          `transparent` + `opacity` gets a close, much cheaper approximation
          for an object this size and this far from camera. */}
      <meshPhysicalMaterial
        color="#0e1420"
        emissive="#5b9dff"
        emissiveIntensity={running ? 0.7 : 0.38}
        roughness={0.25}
        metalness={0.1}
        transparent
        opacity={0.88}
      />
    </mesh>
  );
}

function ProceduralCoreFallback({ running }: { running: boolean }) {
  return (
    <group>
      <mesh>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshPhysicalMaterial
          color="#0e1420"
          emissive="#5b9dff"
          emissiveIntensity={running ? 0.75 : 0.4}
          roughness={0.2}
          metalness={0.15}
          transparent
          opacity={0.88}
        />
      </mesh>
      <mesh scale={1.03}>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshBasicMaterial color="#8fc4ff" wireframe transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

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
          <WithAsset fallback={<ProceduralCoreFallback running={running} />}>
            <GlbBrain running={running} />
          </WithAsset>
        </group>
        {RINGS.map((ring, i) => (
          <GlowRing key={i} radius={ring.radius} y={0} color={ring.color} width={0.02} core={0.2} opacity={0.4} tilt={ring.tilt as unknown as [number, number, number]} />
        ))}
        {/* Thin glass display case — grounds the brain as a physical
            visualization installation rather than a free-floating effect.
            Plain transparency instead of `transmission` for the same
            render-cost reason as the brain material above. */}
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.56, 24, 1, true]} />
          <meshPhysicalMaterial color="#dce6ff" roughness={0.08} metalness={0} transparent opacity={0.08} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <Nameplate text="Hybrid Adaptive BCI" sub="System core" position={[0, 1.55, 0.7]} />
    </group>
  );
}
