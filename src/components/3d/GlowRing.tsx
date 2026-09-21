"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Activity } from "./interaction";
import { setUniform } from "./imperative";
import { createGlowRingMaterial, type GlowRingOptions } from "./materials";

type GlowRingProps = GlowRingOptions & {
  y?: number;
  /** Extra rotation (radians) applied after the ring is laid flat — used to tilt orbital rings. */
  tilt?: [number, number, number];
  segments?: number;
  renderOrder?: number;
  /** Ring opacity becomes `opacity + gain × activity.value` (used for hover highlights). */
  activity?: Activity;
  gain?: number;
};

// A flat ring drawn with a soft additive shader: a thin bright core line plus
// a wide faint halo. Reads as a glowing ring without post-processing bloom,
// and can carry travelling highlights (`dashes`) or be an arc (`arcLength`).
export function GlowRing({
  y = 0,
  tilt = [0, 0, 0],
  segments = 160,
  renderOrder = 2,
  activity,
  gain = 1,
  ...options
}: GlowRingProps) {
  const { color, radius, width = 0.09, core, opacity, dashes, speed, arcStart, arcLength } = options;

  const geometry = useMemo(() => new THREE.RingGeometry(radius - width, radius + width, segments, 1), [radius, width, segments]);
  const material = useMemo(
    () => createGlowRingMaterial({ color, radius, width, core, opacity, dashes, speed, arcStart, arcLength }),
    [color, radius, width, core, opacity, dashes, speed, arcStart, arcLength],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    if (activity) setUniform(material, "uOpacity", (opacity ?? 1) + gain * activity.value);
  });

  return (
    <group position-y={y} rotation={tilt}>
      <mesh
        geometry={geometry}
        material={material}
        rotation-x={-Math.PI / 2}
        renderOrder={renderOrder}
        frustumCulled={false}
      />
    </group>
  );
}
