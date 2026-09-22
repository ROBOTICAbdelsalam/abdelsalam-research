"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { WithAsset } from "@/components/3d/AssetBoundary";

// Generic loader for the BCI twin's real, textured furniture GLBs (kept
// materials — unlike the Hero's brain/bust-head GLBs, which are geometry-
// only and restyled per scene via @/components/3d/gltfGeometry; that other
// pattern is reused as-is by BCICore.tsx and EEGParticipant.tsx rather than
// duplicated here). See src/data/bci-assets.ts for what each path is and
// where its license comes from.
//
// Always wraps the load in WithAsset (@/components/3d/AssetBoundary), the
// same Suspense+error-boundary pair the Hero scene already uses — a
// missing, blocked, or failed GLB falls back to the caller's procedural
// stand-in instead of breaking the scene (section 29's fallback contract).

export type GlbPropProps = {
  path: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotationY?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

function LoadedProp({ path, scale = 1, position, rotationY = 0, castShadow = true, receiveShadow = true }: GlbPropProps) {
  const gltf = useGLTF(path);
  // Each placement needs its own Object3D instance (three.js can't parent
  // one node under two groups), but geometries/materials stay shared
  // references from drei's GLTF cache — cheap to place the same asset many
  // times (the desk appears at every workstation).
  const scene = useMemo(() => {
    const clone = gltf.scene.clone(true);
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;
      }
    });
    return clone;
  }, [gltf, castShadow, receiveShadow]);

  return <primitive object={scene} scale={scale} position={position} rotation-y={rotationY} />;
}

export function GlbProp({ fallback, ...props }: GlbPropProps & { fallback: React.ReactNode }) {
  return (
    <WithAsset fallback={fallback}>
      <LoadedProp {...props} />
    </WithAsset>
  );
}
