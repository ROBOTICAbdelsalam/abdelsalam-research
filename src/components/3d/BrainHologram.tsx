"use client";

import { useEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { addPhases, extractGeometry } from "./gltfGeometry";
import { createFresnelMaterial, createLinesMaterial } from "./materials";
import { mulberry32 } from "./random";

// The AI/ML node's anatomical brain (GLB — see public/models/CREDITS.md),
// restyled as a blue hologram: a fresnel-lit shell plus a glowing wireframe.
// Normalised so its longest axis (front-to-back) is 1 unit; the parent scales it.

export const BRAIN_URL = "/models/brain.glb";

export function BrainHologram() {
  const gltf = useGLTF(BRAIN_URL, false);

  const { shell, wire } = useMemo(() => {
    const geometry = extractGeometry(gltf.scene);
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = box.getSize(new THREE.Vector3());
    const centre = box.getCenter(new THREE.Vector3());
    const longest = Math.max(size.x, size.y, size.z);
    geometry.translate(-centre.x, -centre.y, -centre.z);
    geometry.scale(1 / longest, 1 / longest, 1 / longest);
    const wireframe = addPhases(new THREE.WireframeGeometry(geometry), mulberry32(4));
    return { shell: geometry, wire: wireframe };
  }, [gltf]);

  const shellMaterial = useMemo(
    () => createFresnelMaterial({ color: "#2f7dff", color2: "#cdefff", power: 1.7, opacity: 0.95, fill: 0.16 }),
    [],
  );
  const wireMaterial = useMemo(() => createLinesMaterial("#9bd6ff", 0.5), []);

  useEffect(
    () => () => {
      shell.dispose();
      wire.dispose();
    },
    [shell, wire],
  );
  useEffect(() => () => shellMaterial.dispose(), [shellMaterial]);
  useEffect(() => () => wireMaterial.dispose(), [wireMaterial]);

  return (
    <group>
      <mesh geometry={shell} material={shellMaterial} renderOrder={3} />
      <lineSegments geometry={wire} material={wireMaterial} scale={1.004} renderOrder={4} frustumCulled={false} />
    </group>
  );
}
