"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import type { Mesh } from "three";
import type { Vec3 } from "@/lib/ai-lab/layout";
import { TONE_HEX } from "@/lib/ai-lab/colors";
import type { SignalTone } from "@/components/ui/SignalNode";
import { useReducedMotion } from "@/lib/useReducedMotion";

// A restrained data-flow indicator between two points: a thin, low-opacity
// line plus one small particle drifting along it. Used sparingly (each
// workstation to the Core, and the Core to Command/Knowledge) — not a web
// of glowing lines across the whole room. `active` brightens and speeds up
// a pathway that currently matters (the selected agent's own link, or a
// collaboration link) — everything else stays at its restrained ambient
// baseline, per Phase 3 spec §12.
export function DataPathway({
  from,
  to,
  tone = "accent",
  speed = 0.35,
  phase = 0,
  active = false,
}: {
  from: Vec3;
  to: Vec3;
  tone?: SignalTone;
  speed?: number;
  phase?: number;
  active?: boolean;
}) {
  const particleRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const color = TONE_HEX[tone];
  const effectiveSpeed = active ? speed * 1.8 : speed;
  const lineOpacity = active ? 0.75 : 0.3;

  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to]
  );

  useFrame((state) => {
    if (shouldReduceMotion || !particleRef.current) return;
    const t = (state.clock.elapsedTime * effectiveSpeed + phase) % 1;
    particleRef.current.position.lerpVectors(points[0], points[1], t);
  });

  return (
    <group>
      <Line points={points} color={color} lineWidth={active ? 1.5 : 1} transparent opacity={lineOpacity} />
      {!shouldReduceMotion && (
        <mesh ref={particleRef} position={points[0]}>
          <sphereGeometry args={[active ? 0.07 : 0.05, 8, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={active ? 1.8 : 1.2}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}
