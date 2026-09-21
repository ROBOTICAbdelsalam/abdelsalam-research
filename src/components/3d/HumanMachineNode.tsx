"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { WithAsset } from "./AssetBoundary";
import { getAssetMaterials } from "./assetMaterials";
import { nodeHighlight } from "./interaction";
import { timeUniform } from "./materials";
import { useSceneSettings } from "./sceneContext";
import { extractGeometry, normalizeToUnitHeight } from "./gltfGeometry";
import { createFresnelMaterial, createLinesMaterial, createPointsMaterial } from "./materials";
import { buildNeuralCap } from "./neuralCap";
import { nodeScale, type SystemLayout } from "./sceneConfig";
import { SoftGlow } from "./SoftGlow";

// Human–Machine Interaction: a bust in profile, facing the AI Core, wearing a
// glowing EEG/neural mesh over the skull — the visual for the site's
// Hybrid-Adaptive BCI research. The head is an optimised GLB (see
// public/models/CREDITS.md) restyled as dark glass; a procedural bust stands
// in while it loads or if it fails.

export const HEAD_URL = "/models/bust-head.glb";

type Cranium = { centre: THREE.Vector3; radii: THREE.Vector3 };

function NeuralMesh({ cranium }: { cranium: Cranium }) {
  const cap = useMemo(() => buildNeuralCap(3), []);
  const lineMaterial = useMemo(() => createLinesMaterial("#7fd0ff", 0.75), []);
  const pointMaterial = useMemo(() => createPointsMaterial("#ffffff", 1), []);
  useEffect(
    () => () => {
      cap.lines.dispose();
      cap.points.dispose();
    },
    [cap],
  );
  useEffect(() => () => lineMaterial.dispose(), [lineMaterial]);
  useEffect(() => () => pointMaterial.dispose(), [pointMaterial]);

  return (
    <group position={cranium.centre} scale={cranium.radii}>
      <lineSegments geometry={cap.lines} material={lineMaterial} frustumCulled={false} renderOrder={4} />
      <points geometry={cap.points} material={pointMaterial} frustumCulled={false} renderOrder={5} />
    </group>
  );
}

// The sculpted head (unit height, base on y = 0, face toward +z).
function GlbBust() {
  const gltf = useGLTF(HEAD_URL, false);
  const m = getAssetMaterials();

  const { geometry, cranium } = useMemo(() => {
    const geo = extractGeometry(gltf.scene);
    normalizeToUnitHeight(geo);
    // Fit an ellipsoid to the skull from a mid-cranium slab.
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
      },
    };
  }, [gltf]);

  const rim = useMemo(
    () => createFresnelMaterial({ color: "#0d3f86", color2: "#8fdcff", power: 2.4, opacity: 0.95, fill: 0 }),
    [],
  );
  useEffect(() => () => rim.dispose(), [rim]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group>
      <mesh geometry={geometry} material={m.blackMatte} />
      <mesh geometry={geometry} material={rim} scale={1.004} renderOrder={3} />
      <NeuralMesh cranium={cranium} />
    </group>
  );
}

// Procedural stand-in (face toward +x, height H).
function ProceduralBust({ height: H }: { height: number }) {
  const m = getAssetMaterials();
  const headR = H * 0.27;
  const headY = H - headR * 1.08;
  const cranium = useMemo<Cranium>(
    () => ({ centre: new THREE.Vector3(0, 0, 0), radii: new THREE.Vector3(headR * 1.04, headR * 1.12, headR * 0.9) }),
    [headR],
  );
  return (
    <group>
      <mesh material={m.darkJoint} position-y={H * 0.1} scale={[H * 0.2, H * 0.19, H * 0.39]}>
        <sphereGeometry args={[1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={m.darkJoint} position={[-H * 0.02, H * 0.36, 0]}>
        <cylinderGeometry args={[H * 0.08, H * 0.095, H * 0.2, 24]} />
      </mesh>
      <group position={[0, headY, 0]}>
        <mesh material={m.darkJoint} scale={[headR * 0.98, headR * 1.08, headR * 0.86]}>
          <sphereGeometry args={[1, 48, 36]} />
        </mesh>
        <mesh material={m.darkJoint} position={[headR * 0.98, -headR * 0.08, 0]} rotation-z={-Math.PI / 2 - 0.12}>
          <coneGeometry args={[headR * 0.12, headR * 0.32, 12]} />
        </mesh>
        <group rotation-y={Math.PI / 2}>
          <NeuralMesh cranium={cranium} />
        </group>
      </group>
    </group>
  );
}

export function HumanMachineNode({ system }: { system: SystemLayout }) {
  const { v } = useMemo(() => nodeScale(system), [system]);
  const height = 240 * v;
  const { reducedMotion } = useSceneSettings();
  const sway = useRef<THREE.Group>(null);

  // A barely-there sway, like a person holding still while their EEG streams.
  useFrame(() => {
    if (reducedMotion || !sway.current) return;
    const t = timeUniform.value * (1 + nodeHighlight.hmi.value * 1.2);
    sway.current.rotation.y = 0.045 * Math.sin(t * 0.4);
  });

  return (
    // Bust slightly behind the deck centre, face toward +x (the AI Core).
    <group ref={sway} position={[system.radius * 0.06, 0, -system.radius * 0.12]}>
      <SoftGlow color="#2a6cff" opacity={0.35} scale={height * 1.5} position={[0, height * 0.6, -0.4]} />
      <WithAsset fallback={<ProceduralBust height={height} />}>
        {/* Model faces +z; turn it to face +x. */}
        <group scale={height} rotation-y={Math.PI / 2}>
          <GlbBust />
        </group>
      </WithAsset>
    </group>
  );
}
