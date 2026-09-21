"use client";

import { useMemo } from "react";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getAssetMaterials } from "./assetMaterials";
import { nodeScale, type SystemLayout } from "./sceneConfig";
import { mulberry32 } from "./random";

// Stacked server infrastructure on the Data deck: a tall five-unit tower and
// a shorter three-unit one, each unit a slim rack-mount slab with a lit blue
// strip and a row of status LEDs (as in the reference).

type Tower = { x: number; z: number; units: number; widthPx: number; heightPx: number };
const TOWERS: Tower[] = [
  { x: 0, z: 0, units: 5, widthPx: 74, heightPx: 140 },
  { x: 78, z: 26, units: 3, widthPx: 46, heightPx: 72 },
];

function Unit({ w, h, d, seed }: { w: number; h: number; d: number; seed: number }) {
  const m = getAssetMaterials();
  const geometry = useMemo(() => new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h) * 0.09), [w, h, d]);
  const leds = useMemo(() => {
    const random = mulberry32(seed);
    return Array.from({ length: 4 }, (_, i) => ({ x: -w * 0.34 + i * w * 0.1, warm: random() > 0.7 }));
  }, [w, seed]);

  return (
    <group>
      <mesh geometry={geometry} material={m.rack} />
      {/* Lit front strip. */}
      <mesh material={m.glowBlue} position={[w * 0.05, 0, d / 2 + 0.002]}>
        <planeGeometry args={[w * 0.5, h * 0.16]} />
      </mesh>
      {/* Top face glow. */}
      <mesh material={m.glowBlue} rotation-x={-Math.PI / 2} position-y={h / 2 + 0.002}>
        <planeGeometry args={[w * 0.82, d * 0.82]} />
      </mesh>
      {leds.map((led, i) => (
        <mesh key={i} material={led.warm ? m.glowAmber : m.glowCyan} position={[led.x, h * 0.28, d / 2 + 0.003]}>
          <circleGeometry args={[h * 0.05, 8]} />
        </mesh>
      ))}
    </group>
  );
}

export function DataInfrastructure({ system }: { system: SystemLayout }) {
  const { u, v } = useMemo(() => nodeScale(system), [system]);

  return (
    // Front of the racks turned slightly toward the camera's left.
    <group position={[-system.radius * 0.12, 0, -system.radius * 0.05]} rotation-y={0.45}>
      {TOWERS.map((tower, ti) => {
        const w = tower.widthPx * u;
        const totalH = tower.heightPx * v;
        const unitH = totalH / tower.units;
        return (
          <group key={ti} position={[tower.x * u, 0, tower.z * u * 0.6]}>
            {Array.from({ length: tower.units }, (_, i) => (
              <group key={i} position-y={unitH * (i + 0.5)}>
                <Unit w={w} h={unitH * 0.92} d={w * 0.9} seed={ti * 10 + i + 1} />
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}
