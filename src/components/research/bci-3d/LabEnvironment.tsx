"use client";

import { useMemo } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { ROOM } from "./layout";

// The physical shell: dark graphite floor and walls, a few overhead trusses
// with practical lights, brushed-aluminum skirting. Deliberately plain —
// every station supplies its own detail; the room just has to read as a
// real, dim research lab rather than a void.

const FLOOR_COLOR = "#0d0f13";
const WALL_COLOR = "#12151b";

export function LabEnvironment() {
  const floorGeometry = useMemo(
    () => new THREE.PlaneGeometry(ROOM.halfWidth * 2, ROOM.halfDepth * 2),
    [],
  );

  const trussXs = [-ROOM.halfWidth * 0.55, 0, ROOM.halfWidth * 0.55];
  const trussZs = [-9, -3, 3, 9];

  return (
    <group>
      <mesh
        geometry={floorGeometry}
        rotation-x={-Math.PI / 2}
        position={[0, 0, ROOM.centerZ]}
        receiveShadow
      >
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.32} metalness={0.5} />
      </mesh>
      {/* Faint floor seams, on a subtle grid — reads as tile, not a mirror. */}
      <gridHelper
        args={[ROOM.halfWidth * 2, 24, "#1c212b", "#171b22"]}
        position={[0, 0.006, ROOM.centerZ]}
      />

      {/* Perimeter walls. */}
      <mesh position={[0, ROOM.wallHeight / 2, ROOM.centerZ - ROOM.halfDepth]}>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.75} metalness={0.15} />
      </mesh>
      <mesh position={[0, ROOM.wallHeight / 2, ROOM.centerZ + ROOM.halfDepth]}>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.75} metalness={0.15} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * ROOM.halfWidth, ROOM.wallHeight / 2, ROOM.centerZ]}>
          <boxGeometry args={[0.2, ROOM.wallHeight, ROOM.halfDepth * 2]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.75} metalness={0.15} />
        </mesh>
      ))}
      {/* Low skirting strip, brushed aluminum, ties the walls to the floor. */}
      {[-1, 1].map((side) => (
        <mesh key={`skirt-${side}`} position={[side * (ROOM.halfWidth - 0.02), 0.06, ROOM.centerZ]}>
          <boxGeometry args={[0.04, 0.12, ROOM.halfDepth * 2]} />
          <meshStandardMaterial color="#4a5160" roughness={0.3} metalness={0.85} />
        </mesh>
      ))}

      {/* Overhead trusses with practical strip lights. */}
      {trussZs.map((z) =>
        trussXs.map((x) => (
          <group key={`${x}-${z}`} position={[x, ROOM.wallHeight - 0.35, z]}>
            <mesh>
              <boxGeometry args={[0.08, 0.08, 0.9]} />
              <meshStandardMaterial color="#3a4150" roughness={0.4} metalness={0.75} />
            </mesh>
            <mesh position={[0, -0.06, 0]}>
              <boxGeometry args={[0.32, 0.02, 0.6]} />
              <meshStandardMaterial color="#dce6ff" emissive="#5b9dff" emissiveIntensity={0.6} toneMapped={false} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}

export function LabLighting() {
  return (
    <>
      <ambientLight intensity={0.42} color="#5878ff" />
      <hemisphereLight args={["#4a6cff", "#05060a", 0.5]} />
      {/* Soft overhead practicals along the pipeline spine. */}
      {[-9, -3, 3, 9].map((z) => (
        <pointLight key={z} position={[0, ROOM.wallHeight - 0.6, z]} color="#dce6ff" intensity={75} distance={16} decay={2} />
      ))}
      {/* Cool key light from the front, gentle amber kicker from the back. */}
      <directionalLight position={[8, 9, 10]} intensity={1.1} color="#a9c3ff" />
      <pointLight position={[-4, 3, -12]} color="#e0a23d" intensity={35} distance={12} decay={2} />

      {/* A small, cheap synthetic environment (one baked frame, no network
          fetch) so brushed-metal surfaces have something restrained to
          reflect — without it, metallic PBR materials read as flat black
          regardless of direct light. Tuned dim and cool, matching the lab's
          own palette rather than a bright studio rig. */}
      <Environment resolution={64} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" color="#3a63ff" intensity={2.2} position={[-8, 4, 0]} rotation-y={Math.PI / 2} scale={[10, 5, 1]} />
        <Lightformer form="rect" color="#2dd4c8" intensity={1.6} position={[8, 4, 0]} rotation-y={-Math.PI / 2} scale={[10, 5, 1]} />
        <Lightformer form="ring" color="#dce6ff" intensity={2.4} position={[0, 7, 0]} rotation-x={Math.PI / 2} scale={6} />
      </Environment>
    </>
  );
}
