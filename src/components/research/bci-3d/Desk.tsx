"use client";

// A plain research desk: aluminum-framed slab on two legs. The shared base
// every workstation (Signal Processing, Feature Extraction, CNN-LSTM,
// Adaptive Decision, ROS 2) stands its monitors and equipment on.

export function Desk({ width = 1.5, depth = 0.7, topY = 0.78 }: { width?: number; depth?: number; topY?: number }) {
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
    </group>
  );
}
