"use client";

import { useMemo } from "react";
import { ROOM } from "@/lib/ai-lab/layout";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";

const INDICATOR_POSITIONS: [number, number][] = [
  [-8.5, -11],
  [8.5, -11],
  [-8.5, 11],
  [8.5, 11],
  [-8.5, 0],
  [8.5, 0],
];

// A technical floor: matte graphite panel, two layered grids (a fine
// "seam" grid and a coarser "panel division" grid) and a handful of small
// illuminated floor indicators. Deliberately restrained — no glowing
// cyberpunk grid.
export function LabFloor() {
  const width = ROOM.halfWidth * 2;
  const depth = ROOM.halfDepth * 2;

  const indicatorColors = useMemo(
    () => [TONE_HEX.accent, TONE_HEX.trace, TONE_HEX["signal-green"], TONE_HEX.amber, TONE_HEX.violet, TONE_HEX.gold],
    []
  );

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color={MATERIAL.floor} roughness={0.75} metalness={0.2} />
      </mesh>

      <gridHelper
        args={[Math.max(width, depth), Math.max(width, depth) / 2, MATERIAL.gridLineStrong, MATERIAL.gridLine]}
        position={[0, 0.01, 0]}
      />
      <gridHelper
        args={[Math.max(width, depth), 4, MATERIAL.gridLineStrong, MATERIAL.gridLineStrong]}
        position={[0, 0.015, 0]}
      />

      {INDICATOR_POSITIONS.map(([x, z], i) => (
        <mesh key={`${x}-${z}`} position={[x, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.12, 16]} />
          <meshStandardMaterial
            color={indicatorColors[i % indicatorColors.length]}
            emissive={indicatorColors[i % indicatorColors.length]}
            emissiveIntensity={0.9}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
