"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { useReducedMotion } from "@/lib/useReducedMotion";

// A compact articulated arm — reinforces Robotics/AI/Intelligent Systems
// physically in the room (Phase 2 spec §26), separate from the Robotics
// Engineer's desk monitor. Built entirely from primitives; the two joints
// sway gently and independently rather than looping through a fixed
// animation cycle.
export function RoboticElement({ position }: { position: [number, number, number] }) {
  const shoulderRef = useRef<Group>(null);
  const elbowRef = useRef<Group>(null);
  const shouldReduceMotion = useReducedMotion();

  useFrame((state) => {
    if (shouldReduceMotion) return;
    const t = state.clock.elapsedTime;
    if (shoulderRef.current) shoulderRef.current.rotation.y = Math.sin(t * 0.35) * 0.35;
    if (elbowRef.current) elbowRef.current.rotation.z = -0.4 + Math.sin(t * 0.5 + 1) * 0.15;
  });

  const jointColor = TONE_HEX["signal-green"];

  return (
    <group position={position}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.16, 16]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.4} metalness={0.6} />
      </mesh>

      <group ref={shoulderRef} position={[0, 0.16, 0]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.14, 0.7, 0.14]} />
          <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.35} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.09, 12, 12]} />
          <meshStandardMaterial
            color={jointColor}
            emissive={jointColor}
            emissiveIntensity={0.7}
            toneMapped={false}
          />
        </mesh>

        <group ref={elbowRef} position={[0, 0.7, 0]}>
          <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.35} metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.62, 0]}>
            <boxGeometry args={[0.16, 0.08, 0.16]} />
            <meshStandardMaterial
              color={jointColor}
              emissive={jointColor}
              emissiveIntensity={0.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
