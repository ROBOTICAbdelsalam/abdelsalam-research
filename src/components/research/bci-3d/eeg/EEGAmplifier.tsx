"use client";

import { Cable } from "../Cable";

// EEG amplifier/acquisition unit — a generic professional research
// amplifier enclosure (proportions and layout loosely inspired by
// real multi-channel EEG acquisition hardware — a rectangular metal
// case, a front connector panel, status LEDs — no logos or trademarks
// reproduced; see src/data/bci-assets.ts for why this stays procedural
// rather than a licensed asset). A row of small electrode input ports
// on the front panel, a status/power LED cluster, and curved cable
// leads toward the cap and the workstation, rather than a plain box.

const PORT_COUNT = 8;

export function EEGAmplifier({ position = [-0.62, 0.79, -0.02] as [number, number, number] }) {
  return (
    <group position={position}>
      {/* Enclosure. */}
      <mesh position-y={0.05} castShadow receiveShadow>
        <boxGeometry args={[0.24, 0.1, 0.17]} />
        <meshStandardMaterial color="#15171d" roughness={0.4} metalness={0.5} />
      </mesh>
      {/* Front panel, slightly inset — a real fascia, not the same surface as the case. */}
      <mesh position={[0, 0.05, 0.086]}>
        <boxGeometry args={[0.226, 0.086, 0.006]} />
        <meshStandardMaterial color="#0e1014" roughness={0.5} metalness={0.35} />
      </mesh>
      {/* A row of electrode input ports — small round connector stubs, the
          multi-channel input side of the unit. */}
      {Array.from({ length: PORT_COUNT }, (_, i) => (
        <mesh key={i} position={[-0.092 + i * 0.0263, 0.068, 0.09]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.0055, 0.0055, 0.01, 8]} />
          <meshStandardMaterial color="#2a2f38" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      {/* Status LEDs: power (steady green) + a data-activity LED. */}
      <mesh position={[-0.09, 0.032, 0.09]}>
        <boxGeometry args={[0.012, 0.006, 0.004]} />
        <meshStandardMaterial color="#5cf2a8" emissive="#5cf2a8" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[-0.07, 0.032, 0.09]}>
        <boxGeometry args={[0.012, 0.006, 0.004]} />
        <meshStandardMaterial color="#2dd4c8" emissive="#2dd4c8" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* Rear data/power connector. */}
      <mesh position={[0, 0.045, -0.088]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, 0.01, 12]} />
        <meshStandardMaterial color="#3a4150" roughness={0.35} metalness={0.6} />
      </mesh>
      {/* Ventilation slats on top. */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.07 + i * 0.035, 0.101, 0]}>
          <boxGeometry args={[0.02, 0.002, 0.1]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.6} />
        </mesh>
      ))}
      {/* Rubber feet — a real bench-top enclosure sits on small isolating
          pads, not flush on the desk surface. */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}-${sz}`} position={[sx * 0.1, -0.002, sz * 0.07]}>
            <cylinderGeometry args={[0.008, 0.008, 0.006, 8]} />
            <meshStandardMaterial color="#0a0a0c" roughness={0.9} metalness={0} />
          </mesh>
        )),
      )}

      {/* Lead bundle toward the participant, and a downstream cable to the
          acquisition monitor — real drooping curves, not straight rods. */}
      <Cable from={[-0.11, 0.075, 0.06]} to={[-0.32, 0.14, 0.05]} sag={0.05} bow={[0.02, 0, 0.04]} radius={0.008} />
      <Cable from={[0.1, 0.06, 0.05]} to={[0.3, 0.01, 0.12]} sag={0.03} bow={[0.04, 0, -0.02]} radius={0.006} />
    </group>
  );
}
