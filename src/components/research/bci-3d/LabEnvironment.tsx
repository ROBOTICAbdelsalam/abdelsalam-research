"use client";

import { useMemo } from "react";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { mulberry32 } from "@/components/3d/random";
import { ROOM } from "./layout";

// The physical shell: dark graphite floor and walls, a few overhead trusses
// with practical lights, brushed-aluminum skirting. Deliberately plain —
// every station supplies its own detail; the room just has to read as a
// real, dim research lab rather than a void.

const FLOOR_COLOR = "#0d0f13";
const WALL_COLOR = "#12151b";
const RACK_COLOR = "#14171d";

// A tall equipment rack — server/amplifier-style hardware standing against
// a side wall purely for background/midground depth (section 4's "the
// camera should clearly perceive foreground, midground, background"). No
// interaction, no per-frame cost: static geometry and static LED colors.
function EquipmentRack({ position, rotationY = 0 }: { position: readonly [number, number, number]; rotationY?: number }) {
  const leds = useMemo(() => {
    const random = mulberry32(Math.round((position[0] + position[2]) * 97));
    return Array.from({ length: 6 }, () => (random() > 0.72 ? "#e0a23d" : random() > 0.5 ? "#5cf2a8" : "#232a36"));
  }, [position]);

  return (
    <group position={position as unknown as [number, number, number]} rotation-y={rotationY}>
      <mesh position-y={0.95} castShadow receiveShadow>
        <boxGeometry args={[0.56, 1.9, 0.5]} />
        <meshStandardMaterial color={RACK_COLOR} roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[0, 0.95, 0.252]}>
        <boxGeometry args={[0.5, 1.82, 0.006]} />
        <meshStandardMaterial color="#0e1014" roughness={0.6} metalness={0.3} />
      </mesh>
      {leds.map((color, i) => (
        <mesh key={i} position={[-0.19 + (i % 2) * 0.38, 1.55 - Math.floor(i / 2) * 0.16, 0.256]}>
          <boxGeometry args={[0.03, 0.012, 0.004]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={color === "#232a36" ? 0 : 1.2} toneMapped={false} />
        </mesh>
      ))}
      {/* Brushed-aluminum kick strip at the base, tying it to the floor. */}
      <mesh position-y={0.03}>
        <boxGeometry args={[0.58, 0.06, 0.52]} />
        <meshStandardMaterial color="#3a4150" roughness={0.35} metalness={0.75} />
      </mesh>
    </group>
  );
}

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
        {/* Slightly reflective, not mirror-like (section 21) — enough
            metalness for the synthetic IBL to leave a soft sheen, without
            the floor reading as wet glass. */}
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.46} metalness={0.22} />
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

      {/* Equipment racks against the side walls — background/midground
          hardware giving the room real depth instead of bare walls. */}
      <EquipmentRack position={[-7.7, 0, -7.5]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[7.7, 0, -1]} rotationY={-Math.PI / 2} />
      <EquipmentRack position={[-7.7, 0, 3.6]} rotationY={Math.PI / 2} />

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
      {/* Ambient/hemisphere fill kept a muted, mostly neutral cool gray —
          the blue/cyan accents (truss strips, lightformers, the amber
          kicker's contrast partner) do the "scientific lab" color work;
          the base fill deliberately isn't saturated blue (section 20). */}
      <ambientLight intensity={0.32} color="#3d4a66" />
      <hemisphereLight args={["#3c5170", "#0a0b0d", 0.42]} />
      {/* Soft overhead practicals along the pipeline spine. */}
      {[-9, -3, 3, 9].map((z) => (
        <pointLight key={z} position={[0, ROOM.wallHeight - 0.6, z]} color="#dce6ff" intensity={75} distance={16} decay={2} />
      ))}
      {/* Cool key light from the front — the room's one shadow-casting
          light, sized to the pipeline spine so grounded objects (desks,
          the participant, the hand) read with real contact shadows instead
          of floating. Gentle amber kicker from the back for warmth. */}
      <directionalLight
        position={[8, 9, 10]}
        intensity={1.1}
        color="#a9c3ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-11}
        shadow-camera-right={11}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0015}
      />
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
