"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createSignalMaterial } from "./materials";
import { mulberry32 } from "./random";
import { signalIntensity, type SignalPathDef } from "./signalPaths";
import { SoftGlow } from "./SoftGlow";

// One link in the network: a bright core strand, two finer side strands and a
// wide soft halo, all sharing the flowing-pulse shader, plus glow nodes where
// the path meets its system and the core.

function offsetCurve(curve: THREE.CatmullRomCurve3, lateral: number, lift: number) {
  const points = curve.points.map((p, i, all) => {
    const next = all[Math.min(i + 1, all.length - 1)];
    const prev = all[Math.max(i - 1, 0)];
    const tangent = next.clone().sub(prev).setY(0).normalize();
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x);
    return p.clone().addScaledVector(side, lateral).setY(p.y + lift);
  });
  return new THREE.CatmullRomCurve3(points, false, "centripetal");
}

export function SignalPath({ def, segments = 64 }: { def: SignalPathDef; segments?: number }) {
  const intensity = signalIntensity[def.id];
  const weight = def.weight;

  const geometries = useMemo(() => {
    const random = mulberry32(def.id.length * 17 + def.id.charCodeAt(0));
    return {
      core: new THREE.TubeGeometry(def.curve, segments, 0.03 * weight, 8, false),
      halo: new THREE.TubeGeometry(def.curve, Math.round(segments * 0.75), 0.13 * weight, 8, false),
      sideA: new THREE.TubeGeometry(offsetCurve(def.curve, 0.1, 0.02), segments, 0.012, 6, false),
      sideB: new THREE.TubeGeometry(offsetCurve(def.curve, -0.1, -0.01), segments, 0.012, 6, false),
      phase: random(),
    };
  }, [def, segments, weight]);

  const materials = useMemo(() => {
    const base = { color: def.color, direction: def.direction, intensity };
    return {
      core: createSignalMaterial({ ...base, speed: 0.18, pulses: 2, opacity: 1, phase: geometries.phase }),
      halo: createSignalMaterial({ ...base, speed: 0.18, pulses: 2, opacity: 0.32, phase: geometries.phase }),
      sideA: createSignalMaterial({ ...base, speed: 0.13, pulses: 3, opacity: 0.75, phase: geometries.phase + 0.3 }),
      sideB: createSignalMaterial({ ...base, speed: 0.22, pulses: 2, opacity: 0.75, phase: geometries.phase + 0.6 }),
    };
  }, [def, intensity, geometries.phase]);

  useEffect(
    () => () => {
      geometries.core.dispose();
      geometries.halo.dispose();
      geometries.sideA.dispose();
      geometries.sideB.dispose();
    },
    [geometries],
  );
  useEffect(
    () => () => {
      Object.values(materials).forEach((m) => m.dispose());
    },
    [materials],
  );

  return (
    <group>
      <mesh geometry={geometries.halo} material={materials.halo} renderOrder={7} frustumCulled={false} />
      <mesh geometry={geometries.core} material={materials.core} renderOrder={8} frustumCulled={false} />
      <mesh geometry={geometries.sideA} material={materials.sideA} renderOrder={8} frustumCulled={false} />
      <mesh geometry={geometries.sideB} material={materials.sideB} renderOrder={8} frustumCulled={false} />
      <SoftGlow color={def.color} opacity={0.75} scale={0.5 * weight} position={def.start.toArray()} renderOrder={9} />
      <SoftGlow color="#bfeaff" opacity={0.8} scale={0.46 * weight} position={def.end.toArray()} renderOrder={9} />
    </group>
  );
}
