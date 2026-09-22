"use client";

import * as THREE from "three";

// A research desk: aluminum-framed slab on two legs, dressed with the small
// physical equipment a real workstation has — keyboard, mouse, a coiled
// cable dropping to the floor, and a small warm desk lamp. The shared base
// every workstation (EEG, Signal Processing, Feature Extraction, CNN-LSTM,
// Adaptive Decision, ROS 2, Gazebo) stands its monitors on, so dressing it
// once here upgrades every station's physical believability at once.

export function Desk({
  width = 1.5,
  depth = 0.7,
  topY = 0.78,
  equipment = true,
  lamp = true,
}: {
  width?: number;
  depth?: number;
  topY?: number;
  /** Keyboard + mouse + a floor cable — off by default only where a desk is deliberately bare. */
  equipment?: boolean;
  /** A small warm practical light — deliberately not blue, to keep the room from reading as monochrome. */
  lamp?: boolean;
}) {
  return (
    <group>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.045, depth]} />
        <meshStandardMaterial color="#1c2027" roughness={0.35} metalness={0.55} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * width) / 2.28, topY / 2, 0]} castShadow>
          <boxGeometry args={[0.05, topY, depth * 0.86]} />
          <meshStandardMaterial color="#2a2f38" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, topY - 0.18, 0]}>
        <boxGeometry args={[width * 0.92, 0.02, depth * 0.7]} />
        <meshStandardMaterial color="#14171d" roughness={0.5} metalness={0.4} />
      </mesh>

      {equipment && (
        <group position={[width * 0.27, topY + 0.001, depth * 0.24]}>
          {/* Keyboard: a slab with a faint key-row texture suggested by two shallow grooves. */}
          <mesh position={[0, 0.007, 0]} castShadow>
            <boxGeometry args={[0.32, 0.014, 0.115]} />
            <meshStandardMaterial color="#181b21" roughness={0.6} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.0145, 0]}>
            <boxGeometry args={[0.29, 0.001, 0.09]} />
            <meshStandardMaterial color="#0e1014" roughness={0.7} />
          </mesh>
          {/* Mouse. */}
          <mesh position={[0.23, 0.012, 0.05]} rotation={[0, 0.25, 0]} castShadow>
            <capsuleGeometry args={[0.018, 0.03, 4, 8]} />
            <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.25} />
          </mesh>
          {/* Data/power cable dropping off the back edge to the floor. */}
          <mesh position={[-0.02, -0.09, -depth * 0.24]} rotation={[0.18, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, topY - 0.02, 6]} />
            <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.2} />
          </mesh>
        </group>
      )}

      {lamp && (
        <group position={[-width * 0.4, topY, -depth * 0.32]}>
          <mesh position={[0, 0.012, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.05, 0.024, 16]} />
            <meshStandardMaterial color="#2a2f38" roughness={0.4} metalness={0.65} />
          </mesh>
          <mesh position={[0.01, 0.16, 0]} rotation={[0, 0, -0.32]} castShadow>
            <cylinderGeometry args={[0.008, 0.008, 0.3, 8]} />
            <meshStandardMaterial color="#3a4150" roughness={0.35} metalness={0.75} />
          </mesh>
          <mesh position={[0.11, 0.29, 0]} rotation={[0, 0, 0.55]} castShadow>
            <coneGeometry args={[0.045, 0.08, 16, 1, true]} />
            <meshStandardMaterial color="#1a1e26" roughness={0.5} metalness={0.4} side={THREE.DoubleSide} />
          </mesh>
          {/* Small, tightly-falling-off practical — warm contrast against the
              room's cool overheads, per the realism pass's lighting notes
              ("do not make everything blue"). Short distance keeps the cost
              (and the visual footprint) local to this one desk. */}
          <pointLight position={[0.11, 0.24, 0]} color="#e8a34a" intensity={9} distance={1.6} decay={2} />
        </group>
      )}
    </group>
  );
}
