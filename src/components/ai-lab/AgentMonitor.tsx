"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import type { AgentDomain, AgentStatus } from "@/lib/ai-lab/types";
import { createAgentScreenTexture } from "@/lib/ai-lab/canvasTextures";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import type { SignalTone } from "@/components/ui/SignalNode";
import { useReducedMotion } from "@/lib/useReducedMotion";

// How "active" the screen looks per status (spec §13/§14): idle stays
// minimal, thinking/working step up in brightness and speed, completed
// holds a steady bright pulse, error stays deliberately restrained rather
// than flashing a warning color.
const SCREEN_ACTIVITY: Record<AgentStatus, { base: number; amount: number; speed: number }> = {
  idle: { base: 0.65, amount: 0.1, speed: 0.6 },
  waiting: { base: 0.68, amount: 0.12, speed: 0.8 },
  thinking: { base: 0.78, amount: 0.2, speed: 1.6 },
  working: { base: 0.9, amount: 0.25, speed: 2.4 },
  completed: { base: 0.95, amount: 0.05, speed: 1 },
  error: { base: 0.5, amount: 0.08, speed: 0.5 },
};

// A workstation screen: a procedurally-drawn texture (see
// lib/ai-lab/canvasTextures.ts — no external images) on a double-sided
// plane, so it reads correctly regardless of which side the camera
// approaches from. The screen "breathes" with a slow emissive pulse
// instead of redrawing every frame, which keeps six monitors cheap.
export function AgentMonitor({
  domain,
  tone,
  status = "idle",
  dimmed = false,
  phase = 0,
}: {
  domain: AgentDomain;
  tone: SignalTone;
  status?: AgentStatus;
  dimmed?: boolean;
  phase?: number;
}) {
  const screenRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const color = TONE_HEX[tone];

  const texture = useMemo(() => createAgentScreenTexture(domain, color), [domain, color]);

  useFrame((state) => {
    if (!screenRef.current) return;
    const material = screenRef.current.material as THREE.MeshStandardMaterial;
    const activity = SCREEN_ACTIVITY[status];
    const dimFactor = dimmed ? 0.45 : 1;
    if (shouldReduceMotion) {
      material.emissiveIntensity = activity.base * dimFactor;
      return;
    }
    material.emissiveIntensity =
      (activity.base + Math.sin(state.clock.elapsedTime * activity.speed + phase) * activity.amount) * dimFactor;
  });

  return (
    <group>
      <mesh position={[0, 0, -0.015]}>
        <boxGeometry args={[0.92, 0.58, 0.03]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh ref={screenRef}>
        <planeGeometry args={[0.84, 0.5]} />
        <meshStandardMaterial
          color="#ffffff"
          map={texture}
          emissive="#ffffff"
          emissiveMap={texture ?? undefined}
          emissiveIntensity={0.85}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
