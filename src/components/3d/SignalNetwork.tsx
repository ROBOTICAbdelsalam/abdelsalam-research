"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createPointsMaterial } from "./materials";
import { mulberry32 } from "./random";
import { SignalPath } from "./SignalPath";
import { SIGNAL_PATHS, type SignalPathDef } from "./signalPaths";
import { useSceneSettings } from "./sceneContext";
import { isSystemVisible } from "./sceneView";

// The full network: every path, plus small particles riding each one in the
// direction of its flow. Particle count is kept low (and drops further on
// smaller screens); with reduced motion they hold still along the paths.

function Particles({ paths, perPath }: { paths: readonly SignalPathDef[]; perPath: number }) {
  const { reducedMotion } = useSceneSettings();
  const total = paths.length * perPath;

  const { geometry, state } = useMemo(() => {
    const random = mulberry32(21);
    const positions = new Float32Array(total * 3);
    const sizes = new Float32Array(total);
    const phases = new Float32Array(total);
    const offsets = new Float32Array(total);
    const speeds = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      sizes[i] = 0.035 + random() * 0.035;
      phases[i] = random();
      offsets[i] = random();
      speeds[i] = 0.045 + random() * 0.05;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return { geometry: g, state: { offsets, speeds } };
  }, [total]);

  const material = useMemo(() => createPointsMaterial("#c9f1ff", 1), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  const clock = useRef(0);

  const write = (time: number) => {
    const attribute = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let p = 0; p < paths.length; p++) {
      const def = paths[p];
      for (let k = 0; k < perPath; k++) {
        const i = p * perPath + k;
        let t = (state.offsets[i] + time * state.speeds[i] * def.direction) % 1;
        if (t < 0) t += 1;
        def.curve.getPointAt(t, scratch);
        attribute.setXYZ(i, scratch.x, scratch.y + 0.02, scratch.z);
      }
    }
    attribute.needsUpdate = true;
  };

  // Place particles once up front so the static (reduced-motion) frame is populated.
  useEffect(() => {
    write(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry]);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    clock.current += delta;
    write(clock.current);
  });

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);

  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={10} />;
}

export function SignalNetwork() {
  const { mode } = useSceneSettings();
  const small = mode === "mobile" || mode === "tablet";
  const paths = useMemo(() => SIGNAL_PATHS.filter((def) => isSystemVisible(mode, def.id)), [mode]);
  return (
    <group>
      {paths.map((def) => (
        <SignalPath key={def.id} def={def} segments={small ? 40 : 64} />
      ))}
      <Particles paths={paths} perPath={small ? 4 : 8} />
    </group>
  );
}
