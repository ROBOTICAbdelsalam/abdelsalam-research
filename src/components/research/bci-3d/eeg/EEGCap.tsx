"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/components/3d/random";
import { Cable } from "../Cable";

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

  // Each electrode is one holder mesh — a small flat-topped cone (plastic
  // cup silhouette) instead of a bare sphere, with the contact itself
  // suggested by its emissive tip color. One mesh per site (not a
  // holder+contact pair): with 40 sites this is instantiated in a scene
  // that already carries real GLB furniture and a detailed hand, and
  // Screen.tsx's own housing detail was already trimmed for the same
  // scene-wide-multiplier reason — see the realism-pass performance notes.
  return (
    <group>
      {positions.map((p, i) => {
        const normal = new THREE.Vector3(p.x, p.y, p.z).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        return (
          <mesh key={i} position={[p.x, p.y, p.z]} quaternion={quat} scale={0.05} castShadow>
            <coneGeometry args={[1, 1.3, 7]} />
            <meshStandardMaterial color="#26304a" emissive="#3f6bd6" emissiveIntensity={0.4} roughness={0.45} metalness={0.25} />
          </mesh>
        );
      })}
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
      {/* Cable bundle exiting the back of the cap and draping down toward
          the shoulder, out of view, on its way to the amplifier — a real
          curve with slack rather than a straight rod. */}
      <Cable
        from={[cranium.centre.x, cranium.centre.y - r * 0.15, cranium.centre.z - r * 0.95]}
        to={[cranium.centre.x, cranium.centre.y - r * 1.5, cranium.centre.z - r * 0.5]}
        sag={-r * 0.15}
        bow={[r * 0.25, 0, -r * 0.2]}
        radius={r * 0.09}
        color="#0e1014"
        metalness={0.3}
      />
    </group>
  );
}
