"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createFresnelMaterial } from "../materials";

// The transparent enclosure: a fresnel-lit outer shell (bright rim, faint
// body) plus a dimmer back-face pass that gives the glass its thickness.
export function GlassSphere({ radius = 1 }: { radius?: number }) {
  const front = useMemo(
    () => createFresnelMaterial({ color: "#3a8cff", color2: "#d2f5ff", power: 1.9, opacity: 1, fill: 0.085 }),
    [],
  );
  const back = useMemo(
    () => createFresnelMaterial({ color: "#1d5fe0", color2: "#5bb8ff", power: 1.5, opacity: 0.8, fill: 0.05, side: THREE.BackSide }),
    [],
  );
  useEffect(() => () => front.dispose(), [front]);
  useEffect(() => () => back.dispose(), [back]);

  return (
    <group>
      <mesh material={back} renderOrder={2} scale={radius * 0.985}>
        <sphereGeometry args={[1, 64, 48]} />
      </mesh>
      <mesh material={front} renderOrder={5} scale={radius}>
        <sphereGeometry args={[1, 72, 54]} />
      </mesh>
    </group>
  );
}
