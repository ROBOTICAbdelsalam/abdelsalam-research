"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import type { Vec3 } from "@/lib/ai-lab/layout";
import { TONE_HEX } from "@/lib/ai-lab/colors";
import type { SignalTone } from "@/components/ui/SignalNode";
import { useReducedMotion } from "@/lib/useReducedMotion";

// A small technical "data capsule" that travels once from `from` to `to`
// over `durationMs`, starting at `startedAtMs` — driven entirely by real
// elapsed time in useFrame (spec §30: no per-frame React state), so it
// stays correctly in sync with the orchestrator's own timer regardless of
// render timing. It disappears when the parent stops rendering it (once
// the corresponding message leaves "traveling" status), which lines up
// with it visually reaching the destination.
//
// The capsule is elongated and oriented along its direction of travel
// (computed once, not per frame) rather than a plain sphere — a stationary
// screenshot of "BCI -> AI" should already look different from "AI -> BCI"
// (spec §10), not just differ while animating.
export function MessagePacket({
  from,
  to,
  tone = "accent",
  startedAtMs,
  durationMs,
}: {
  from: Vec3;
  to: Vec3;
  tone?: SignalTone;
  startedAtMs: number;
  durationMs: number;
}) {
  const groupRef = useRef<Group>(null);
  const shouldReduceMotion = useReducedMotion();
  const color = TONE_HEX[tone];

  const fromVec = useMemo(() => new THREE.Vector3(...from), [from]);
  const toVec = useMemo(() => new THREE.Vector3(...to), [to]);
  const quaternion = useMemo(() => {
    const direction = new THREE.Vector3().subVectors(toVec, fromVec).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  }, [fromVec, toVec]);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsed = Date.now() - startedAtMs;
    const t = shouldReduceMotion ? 1 : Math.min(1, Math.max(0, elapsed / durationMs));
    groupRef.current.position.lerpVectors(fromVec, toVec, t);
  });

  return (
    <group ref={groupRef} position={from} quaternion={quaternion}>
      <mesh>
        <capsuleGeometry args={[0.045, 0.16, 4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
