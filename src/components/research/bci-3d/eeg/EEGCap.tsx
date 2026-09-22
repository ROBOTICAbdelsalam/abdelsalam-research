"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/components/3d/random";

// The EEG cap itself: no licensed real-world asset exists for this
// specialized hardware (src/data/bci-assets.ts), so it's built procedurally
// — fitted onto whatever head it's given via the same "cranium" ellipsoid
// technique the Hero's HumanMachineNode already uses to fit its neural mesh
// onto the bust-head GLB (position + non-uniform scale by the cranium's own
// centre/radii), so the cap always sits correctly whether the head below it
// is the real GLB bust or its procedural fallback.

const CAP_ELECTRODES = 40; // a representative scatter, not a literal 64-point map — the true count is stated on the monitor

export type Cranium = { centre: THREE.Vector3; radii: THREE.Vector3 };

function Electrodes() {
  const positions = useMemo(() => {
    const random = mulberry32(11);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < CAP_ELECTRODES; i++) {
      const u = random() * 0.82 - 0.02; // biased toward the upper hemisphere
      const theta = random() * Math.PI * 2;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      pts.push(new THREE.Vector3(s * Math.cos(theta), 0.14 + Math.abs(u) * 0.96, s * Math.sin(theta)));
    }
    return pts;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]} scale={0.05}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#cfd8ea" emissive="#3f6bd6" emissiveIntensity={0.5} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

export function EEGCap({ cranium }: { cranium: Cranium }) {
  // The dome/strap/electrodes are fitted with the cranium's own non-uniform
  // scale (an ellipsoid, not a sphere — heads aren't round). The chin strap
  // and cable bundle are simple fixed shapes sized off a single scalar
  // radius instead, since non-uniform scale would visibly pinch a thin
  // cylinder rather than just resizing it.
  const r = (cranium.radii.x + cranium.radii.z) / 2;
  return (
    <group>
      <group position={cranium.centre} scale={cranium.radii}>
        <mesh scale={1.05}>
          <sphereGeometry args={[1, 28, 22, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial color="#14171d" roughness={0.62} metalness={0.12} />
        </mesh>
        <mesh position-y={0.16} rotation-x={Math.PI / 2} scale={1.05}>
          <torusGeometry args={[1, 0.05, 8, 28]} />
          <meshStandardMaterial color="#0e1014" roughness={0.55} metalness={0.15} />
        </mesh>
        <Electrodes />
      </group>
      {/* Chin strap. */}
      <mesh
        position={[cranium.centre.x, cranium.centre.y - r * 0.55, cranium.centre.z + r * 1.02]}
        rotation={[1.15, 0, 0]}
      >
        <cylinderGeometry args={[r * 0.045, r * 0.045, r * 1.6, 6]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.15} />
      </mesh>
      {/* Cable bundle draping from the back of the cap toward the amplifier. */}
      <mesh
        position={[cranium.centre.x, cranium.centre.y - r * 0.5, cranium.centre.z - r * 0.9]}
        rotation={[-0.65, 0, 0]}
      >
        <cylinderGeometry args={[r * 0.09, r * 0.09, r * 1.1, 6]} />
        <meshStandardMaterial color="#0e1014" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
