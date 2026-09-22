"use client";

// EEG amplifier/acquisition unit: a dark rack-style box with a status LED
// row and cable leads — actual-looking hardware sitting on the desk beside
// the participant, rather than the cap driving a "hologram". No licensed
// real-world asset exists for this specific hardware class (specialized
// medical equipment — see src/data/bci-assets.ts), so it stays procedural.

export function EEGAmplifier({ position = [-0.62, 0.79, -0.02] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.045} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.09, 0.16]} />
        <meshStandardMaterial color="#15171d" roughness={0.45} metalness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.08 + i * 0.05, 0.096, 0.082]}>
          <boxGeometry args={[0.014, 0.006, 0.004]} />
          <meshStandardMaterial
            color={i === 0 ? "#5cf2a8" : "#2a2f38"}
            emissive={i === 0 ? "#5cf2a8" : "#000000"}
            emissiveIntensity={i === 0 ? 1.4 : 0}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Lead bundle toward the participant, and a downstream cable to the
          acquisition monitor — simple draped-segment approximations. */}
      <mesh position={[-0.16, 0.09, -0.02]} rotation={[0.3, -0.5, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.3, 6]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0.15, 0.07, 0.02]} rotation={[0.2, 0.7, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.26, 6]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.55} metalness={0.2} />
      </mesh>
    </group>
  );
}
