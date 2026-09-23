"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { WithAsset } from "@/components/3d/AssetBoundary";
import { extractGeometry, normalizeToUnitHeight } from "@/components/3d/gltfGeometry";
import { EEGCap, type Cranium } from "./EEGCap";

// The seated EEG participant — REBUILT for the realism pass. Previously a
// procedural capsule (torso) + sphere (head); now the real head/neck/
// shoulders bust GLB already in the repo (public/models/bust-head.glb, CC
// BY 3.0 — shared with the Hero's Human-Machine Interaction node, restyled
// here rather than duplicated; see src/data/bci-assets.ts) for real modeled
// proportions, with the same "fit an ellipsoid to the cranium" technique
// the Hero uses to place its neural mesh, reused here to place the EEG cap.
//
// The bust faces +z in its own file; rotated 180° here so the participant
// faces the back wall — every camera in the room sees them from behind or
// the side, never the face. That, plus a uniform dark material (the
// original skin/clothing materials are stripped from this asset) rather
// than any photoreal skin tone, keeps the participant clearly a non-
// identifying stand-in.

const HEAD_URL = "/models/bust-head.glb";
const BUST_HEIGHT_M = 0.56; // real-world height (shoulders to head-top) this asset is scaled to

function GlbBust() {
  const gltf = useGLTF(HEAD_URL, false);

  const { geometry, cranium } = useMemo(() => {
    const geo = extractGeometry(gltf.scene);
    normalizeToUnitHeight(geo);
    // Fit an ellipsoid to the skull from a mid-cranium slab — identical
    // technique to HumanMachineNode.tsx's GlbBust, reused so both scenes
    // agree on where "the head" is within this same asset.
    const position = geo.getAttribute("position");
    const slab = new THREE.Box3();
    const p = new THREE.Vector3();
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i);
      if (p.y > 0.62 && p.y < 0.86) slab.expandByPoint(p);
    }
    const size = slab.getSize(new THREE.Vector3());
    const centre = slab.getCenter(new THREE.Vector3());
    const ry = 0.31;
    return {
      geometry: geo,
      cranium: {
        centre: new THREE.Vector3(centre.x, 1 - ry * 1.02, centre.z - size.z * 0.02),
        radii: new THREE.Vector3((size.x / 2) * 1.06, ry * 1.05, (size.z / 2) * 1.06),
      } satisfies Cranium,
    };
  }, [gltf]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#262b34" roughness={0.78} metalness={0.04} />
      </mesh>
      <EEGCap cranium={cranium} />
    </group>
  );
}

function ProceduralBustFallback() {
  const cranium: Cranium = useMemo(
    () => ({ centre: new THREE.Vector3(0, 0.86, 0.01), radii: new THREE.Vector3(0.19, 0.2, 0.17) }),
    [],
  );
  return (
    <group>
      <mesh position-y={0.34} castShadow>
        <capsuleGeometry args={[0.27, 0.46, 6, 16]} />
        <meshStandardMaterial color="#262b34" roughness={0.78} />
      </mesh>
      <mesh position-y={0.86} castShadow>
        <sphereGeometry args={[0.19, 24, 20]} />
        <meshStandardMaterial color="#262b34" roughness={0.78} />
      </mesh>
      <EEGCap cranium={cranium} />
    </group>
  );
}

// A simple seated arm — upper arm + forearm + a rounded hand, hanging from
// the shoulder and bending forward at the elbow toward the desk.
// Positioned in the same normalized (unit-bust-height) space as the bust
// geometry itself, as a sibling inside the same rotated+scaled group, so it
// scales and faces correctly together with whichever bust (real GLB or
// procedural fallback) is actually rendered.
//
// Both meshes' default long axis (capsuleGeometry) points local +Y — "0
// rotation" is straight UP, not down. The shoulder attachment also sits
// well below the head/neck (y=0.42, not the head's own ~0.47-0.9 range in
// this normalized space) — both were previously wrong, which together
// made the arms read as antenna-like horns sprouting from beside the head
// rather than limbs reaching down to the desk (see the realism-pass visual
// audit). rotation.x on the upper arm is now near Math.PI (flips +Y to
// point down) with a small forward lean; the forearm then bends the elbow
// forward from there to bring the hand down near the keyboard.
function Arm({ side }: { side: 1 | -1 }) {
  const skin = "#262b34"; // same uniform material as the bust — see the file header on why this isn't a photoreal skin tone
  return (
    <group position={[side * 0.29, 0.42, 0.05]} rotation={[Math.PI - 0.3, 0, side * 0.16]}>
      <mesh position-y={0.11} castShadow>
        <capsuleGeometry args={[0.052, 0.2, 4, 8]} />
        <meshStandardMaterial color={skin} roughness={0.78} />
      </mesh>
      <group position-y={0.22} rotation={[1.55, 0, side * 0.1]}>
        <mesh position-y={0.1} castShadow>
          <capsuleGeometry args={[0.042, 0.19, 4, 8]} />
          <meshStandardMaterial color={skin} roughness={0.78} />
        </mesh>
        {/* Hand: a flattened, rounded block resting near the keyboard —
            enough to read as a hand at this scale without finger detail. */}
        <mesh position-y={0.21} rotation-x={0.3} castShadow>
          <boxGeometry args={[0.075, 0.03, 0.11]} />
          <meshStandardMaterial color={skin} roughness={0.76} />
        </mesh>
      </group>
    </group>
  );
}

function Chair() {
  return (
    <group>
      <group position-y={0.02}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation-y={(i / 5) * Math.PI * 2} position={[0, 0.015, 0]} castShadow>
            <boxGeometry args={[0.03, 0.03, 0.26]} />
            <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.7} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.4, 10]} />
        <meshStandardMaterial color="#2a2f38" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.23, 0.06, 20]} />
        <meshStandardMaterial color="#1c2027" roughness={0.65} />
      </mesh>
      <group position={[0, 0.68, -0.16]} rotation={[-0.12, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.5, 0.06]} />
          <meshStandardMaterial color="#1c2027" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[0.34, 0.42, 0.015]} />
          <meshStandardMaterial color="#262b34" roughness={0.55} />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.235, 0.58, -0.02]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.22]} />
          <meshStandardMaterial color="#20242c" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`post-${side}`} position={[side * 0.235, 0.49, -0.02]}>
          <cylinderGeometry args={[0.014, 0.014, 0.18, 8]} />
          <meshStandardMaterial color="#20242c" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

export function EEGParticipant() {
  return (
    <group>
      <Chair />
      {/* A small, dim fill light on the participant only — the EEG alcove's
          general lighting is a distant desk lamp, which left the seated
          figure reading as a near-silhouette with no visible shoulder/torso
          shape. Warm-neutral and low-intensity: a fill, not a spotlight. */}
      <pointLight position={[0.25, 1.3, 0.5]} color="#aebdd6" intensity={2.6} distance={1.6} decay={2} />
      {/* Seated torso height: the chair's backrest sits around y=0.68-1.1,
          so the bust's shoulder line (its own y=0) starts a little above
          the seat pan. */}
      <group position={[0, 0.66, 0]} rotation-y={Math.PI} scale={BUST_HEIGHT_M}>
        <WithAsset fallback={<ProceduralBustFallback />}>
          <GlbBust />
        </WithAsset>
        {/* Arms — shared between the real bust and its procedural fallback
            rather than duplicated in each, since both use the same
            normalized cranium/shoulder space (see GlbBust's cranium fit). */}
        <Arm side={1} />
        <Arm side={-1} />
      </group>
    </group>
  );
}
