"use client";

import { ROOM } from "@/lib/ai-lab/layout";
import { MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";

const CORNER_X = ROOM.halfWidth - 0.5;
const CORNER_Z = ROOM.halfDepth - 0.5;
const BEAM_HEIGHT = ROOM.wallHeight;

function CornerBeam({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, BEAM_HEIGHT / 2, z]} castShadow>
      <boxGeometry args={[0.3, BEAM_HEIGHT, 0.3]} />
      <meshStandardMaterial color={MATERIAL.beam} roughness={0.45} metalness={0.65} />
    </mesh>
  );
}

function ServerRack({ x, z }: { x: number; z: number }) {
  const slitColor = TONE_HEX.trace;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.8, 3.2, 1]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.4} metalness={0.55} />
      </mesh>
      {[0.6, 1.2, 1.8, 2.4, 3.0].map((y, i) => (
        <mesh key={y} position={[0.41, y, 0.2 - (i % 2) * 0.3]}>
          <boxGeometry args={[0.02, 0.08, 0.5]} />
          <meshStandardMaterial
            color={slitColor}
            emissive={slitColor}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// Architectural shell: corner structural beams, an overhead truss (kept
// clear of the camera's default sightline), a back wall behind the
// Knowledge Center, and a couple of server-rack details along the sides.
// Deliberately not a fully enclosed box — the room stays open so the
// elevated default camera can read the whole floor.
export function LabEnvironment() {
  return (
    <group>
      <mesh position={[0, ROOM.wallHeight / 2, -ROOM.halfDepth]} receiveShadow>
        <planeGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight]} />
        <meshStandardMaterial color={MATERIAL.wall} roughness={0.85} />
      </mesh>

      <CornerBeam x={-CORNER_X} z={-CORNER_Z} />
      <CornerBeam x={CORNER_X} z={-CORNER_Z} />
      <CornerBeam x={-CORNER_X} z={CORNER_Z} />
      <CornerBeam x={CORNER_X} z={CORNER_Z} />

      {/* Overhead truss — set back so it frames the scene without crossing
          the camera's view of the AI Core. */}
      <mesh position={[0, BEAM_HEIGHT, -ROOM.halfDepth + 2]}>
        <boxGeometry args={[ROOM.halfWidth * 1.7, 0.22, 0.22]} />
        <meshStandardMaterial color={MATERIAL.beam} roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[-CORNER_X, BEAM_HEIGHT, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM.halfDepth * 1.7, 0.22, 0.22]} />
        <meshStandardMaterial color={MATERIAL.beam} roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[CORNER_X, BEAM_HEIGHT, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[ROOM.halfDepth * 1.7, 0.22, 0.22]} />
        <meshStandardMaterial color={MATERIAL.beam} roughness={0.5} metalness={0.6} />
      </mesh>

      <ServerRack x={-CORNER_X + 0.6} z={-4} />
      <ServerRack x={CORNER_X - 0.6} z={-4} />
    </group>
  );
}
