"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Mesh } from "three";
import type { AgentStatus } from "@/lib/ai-lab/types";
import { STATUS_META } from "@/lib/ai-lab/statusMeta";
import { useReducedMotion } from "@/lib/useReducedMotion";

// Pulse timing is a 3D-only concern, kept here; the color itself comes from
// STATUS_META so the light always agrees with the 2D roster/info panel.
const STATUS_PULSE: Record<AgentStatus, { baseIntensity: number; pulseAmount: number; pulseSpeed: number }> = {
  idle: { baseIntensity: 0.35, pulseAmount: 0, pulseSpeed: 0 },
  waiting: { baseIntensity: 0.5, pulseAmount: 0.3, pulseSpeed: 1.2 },
  working: { baseIntensity: 0.8, pulseAmount: 0.4, pulseSpeed: 2.4 },
  thinking: { baseIntensity: 0.7, pulseAmount: 0.35, pulseSpeed: 4 },
  completed: { baseIntensity: 0.9, pulseAmount: 0, pulseSpeed: 0 },
  error: { baseIntensity: 0.8, pulseAmount: 0.5, pulseSpeed: 6 },
};

export function AgentStatusLight({
  status,
  dimmed = false,
  position = [0, 0, 0],
}: {
  status: AgentStatus;
  dimmed?: boolean;
  position?: [number, number, number];
}) {
  const meshRef = useRef<Mesh>(null);
  const shouldReduceMotion = useReducedMotion();
  const pulse = STATUS_PULSE[status];
  const color = STATUS_META[status].hex;
  const dimFactor = dimmed ? 0.5 : 1;

  useFrame((state) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (shouldReduceMotion || pulse.pulseAmount === 0) {
      material.emissiveIntensity = pulse.baseIntensity * dimFactor;
      return;
    }
    material.emissiveIntensity =
      (pulse.baseIntensity + Math.sin(state.clock.elapsedTime * pulse.pulseSpeed) * pulse.pulseAmount) * dimFactor;
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={pulse.baseIntensity}
        toneMapped={false}
      />
    </mesh>
  );
}
