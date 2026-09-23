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

// CENTRAL BCI VISUALIZATION — REBUILT for the visual-reconstruction pass
// into a room-dominant installation: a real anatomical brain mesh (the
// same optimized GLB the Hero's AI/ML node uses, public/models/brain.glb,
// CC BY 3.0 — restyled here, not Hero's hologram; see src/data/bci-assets.
// ts) suspended inside a large floor-to-eye-height glass cylinder, capped
// top and bottom by metal collar rings, on a substantial lit pedestal —
// the room's visual center of gravity per the reference, not a small
// tabletop display. Four orbiting rings remain (brain/AI/adaptation/
// robotics). Still a walk-up landmark, not a floating sci-fi object: no
// hover/click hit-volume, no permanent glow ring on the ground.
//
// Scale note: the previous version's glass case was 0.56m tall on a 0.22m
// pedestal collar — a tabletop object. This one's glass cylinder alone is
// 1.9m tall (participant-eye-height, per the reference's proportions) on a
// 0.62m pedestal, ~2.5m overall — large enough to genuinely anchor the
// room instead of being visually lost among the surrounding workstations.

const RINGS = [
  { radius: 0.62, color: "#2dd4c8", tilt: [0.1, 0, 0] as const },
  { radius: 0.78, color: "#5b9dff", tilt: [0, 0, 0.14] as const },
  { radius: 0.94, color: "#e0a23d", tilt: [-0.12, 0, 0.05] as const },
  { radius: 1.1, color: "#5cf2a8", tilt: [0.06, 0, -0.16] as const },
];

const GLASS_RADIUS = 0.62;
const GLASS_HEIGHT = 1.9;
const PEDESTAL_HEIGHT = 0.62;
const PEDESTAL_RADIUS = 0.56;

function GlbBrain({ running }: { running: boolean }) {
  const gltf = useGLTF("/models/brain.glb", false);
  const geometry = useMemo(() => {
    const geo = extractGeometry(gltf.scene);
    normalizeToUnitHeight(geo);
    geo.translate(0, -0.5, 0); // centre vertically instead of base-on-floor
    geo.scale(0.86, 0.86, 0.86);
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
        emissiveIntensity={running ? 0.8 : 0.46}
        roughness={0.25}
        metalness={0.1}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function ProceduralCoreFallback({ running }: { running: boolean }) {
  return (
    <group scale={2.1}>
      <mesh>
        <icosahedronGeometry args={[0.22, 1]} />
        <meshPhysicalMaterial
          color="#0e1420"
          emissive="#5b9dff"
          emissiveIntensity={running ? 0.85 : 0.48}
          roughness={0.2}
          metalness={0.15}
          transparent
          opacity={0.9}
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
      {/* Pedestal — a real physical base the glass cylinder stands on, not
          a thin collar. A cyan ring at the top edge (where it meets the
          glass) and a warm amber underglow at the floor keep this from
          reading as a single flat blue light source, matching the
          reference's warm-base / cool-collar treatment. */}
      <mesh position-y={PEDESTAL_HEIGHT / 2} castShadow receiveShadow>
        <cylinderGeometry args={[PEDESTAL_RADIUS, PEDESTAL_RADIUS * 1.08, PEDESTAL_HEIGHT, 32]} />
        <meshStandardMaterial color="#14171d" roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh position-y={PEDESTAL_HEIGHT - 0.02}>
        <cylinderGeometry args={[PEDESTAL_RADIUS * 1.01, PEDESTAL_RADIUS * 1.01, 0.03, 32]} />
        <meshStandardMaterial color="#2dd4c8" emissive="#2dd4c8" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <mesh position-y={0.015}>
        <cylinderGeometry args={[PEDESTAL_RADIUS * 1.12, PEDESTAL_RADIUS * 1.12, 0.03, 32]} />
        <meshStandardMaterial color="#e0a23d" emissive="#e0a23d" emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.05, 0]} color="#e0a23d" intensity={6} distance={2.2} decay={2} />
      <pointLight position={[0, PEDESTAL_HEIGHT + 0.6, 0]} color="#5b9dff" intensity={5} distance={3.2} decay={2} />

      <group position-y={PEDESTAL_HEIGHT + GLASS_HEIGHT / 2}>
        <group ref={core}>
          <WithAsset fallback={<ProceduralCoreFallback running={running} />}>
            <GlbBrain running={running} />
          </WithAsset>
        </group>
        {RINGS.map((ring, i) => (
          <GlowRing key={i} radius={ring.radius} y={0} color={ring.color} width={0.028} core={0.2} opacity={0.4} tilt={ring.tilt as unknown as [number, number, number]} />
        ))}
        {/* Glass cylinder — grounds the brain as a physical display
            installation rather than a free-floating effect. Plain
            transparency instead of `transmission` for the same render-cost
            reason as the brain material above. */}
        <mesh>
          <cylinderGeometry args={[GLASS_RADIUS, GLASS_RADIUS, GLASS_HEIGHT, 32, 1, true]} />
          <meshPhysicalMaterial color="#dce6ff" roughness={0.06} metalness={0} transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
        {/* Metal collar rings top and bottom of the glass — a real
            enclosure with a cap, not an open-ended tube. */}
        {[GLASS_HEIGHT / 2, -GLASS_HEIGHT / 2].map((y) => (
          <mesh key={y} position-y={y} castShadow>
            <torusGeometry args={[GLASS_RADIUS, 0.035, 12, 32]} />
            <meshStandardMaterial color="#3a4150" roughness={0.3} metalness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Engraved-look base plate label, at the pedestal — matches the
          reference's "BCI CORE / EEG · AI · ADAPTIVE DECISION" plate. */}
      <Nameplate text="BCI Core" sub="EEG · AI · Adaptive Decision" position={[0, PEDESTAL_HEIGHT + GLASS_HEIGHT + 0.55, 0]} width={1.7} />
    </group>
  );
}
