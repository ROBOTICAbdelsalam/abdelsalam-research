"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ROOM } from "../layout";
import { GlbProp } from "../assets/AssetLoader";
import { EquipmentRack } from "./LabFurniture";

// The physical room shell — REBUILT again for the zone-based layout. Adds
// a partial partition wall between the EEG room and the AI/BCI cluster (so
// the EEG area reads as its own alcove, not just another spot along an
// open floor — see layout.ts's zone plan), and repositions every wall
// fixture/rack for the new floor plan. Still: a plain rough-industrial
// floor with no grid, matte painted walls, and physical ceiling fixtures a
// visitor could point to.

const FLOOR_COLOR = "#0e1013";
const WALL_COLOR = "#1a1e26";

export function RealisticLab() {
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(ROOM.halfWidth * 2, ROOM.halfDepth * 2), []);

  // Ceiling fixtures placed over each zone rather than a uniform grid —
  // EEG room, the four cluster desks (two fixtures), the ROS2/Gazebo
  // aisle, and the robotics workcell, plus two general-fill fixtures over
  // the open floor between zones.
  const fixtures: [number, number][] = [
    [-6.8, -8.6],
    [0.8, -7.8],
    [5.0, -7.8],
    [-2.6, -1.6],
    [2.6, -1.6],
    [0, 4.0],
    [-6, -3.2],
    [6.5, -5],
    [0, 0.8],
  ];

  return (
    <group>
      <mesh geometry={floorGeometry} rotation-x={-Math.PI / 2} position={[0, 0, ROOM.centerZ]} receiveShadow>
        {/* Rough industrial floor (section 18) — deliberately low metalness
            so it reads as sealed concrete/epoxy, not a mirror. */}
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.62} metalness={0.12} />
      </mesh>

      {/* Perimeter walls — matte painted surface, not bare graphite. */}
      <mesh position={[0, ROOM.wallHeight / 2, ROOM.centerZ - ROOM.halfDepth]}>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.88} metalness={0.03} />
      </mesh>
      <mesh position={[0, ROOM.wallHeight / 2, ROOM.centerZ + ROOM.halfDepth]}>
        <boxGeometry args={[ROOM.halfWidth * 2, ROOM.wallHeight, 0.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.88} metalness={0.03} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * ROOM.halfWidth, ROOM.wallHeight / 2, ROOM.centerZ]}>
          <boxGeometry args={[0.2, ROOM.wallHeight, ROOM.halfDepth * 2]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.88} metalness={0.03} />
        </mesh>
      ))}

      {/* Partition between the EEG room and the AI/BCI cluster — a real
          divider (not full height, not full depth), so the EEG area reads
          as its own alcove rather than just another spot on an open floor.
          Kept short and tucked against the back wall specifically so it
          doesn't crowd the EEG camera preset, which sits well forward of
          it (z ≈ -6.6) — the divider only needs to read as a boundary near
          the back of both alcoves, not run the full depth of the room. */}
      <mesh position={[-3.3, 1.05, -10.0]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 2.1, 3.2]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.8} metalness={0.06} />
      </mesh>
      <mesh position={[-3.3, 2.14, -10.0]}>
        <boxGeometry args={[0.18, 0.03, 3.2]} />
        <meshStandardMaterial color="#3a4150" roughness={0.35} metalness={0.75} />
      </mesh>

      {/* Low skirting strip, brushed aluminum, ties the walls to the floor. */}
      {[-1, 1].map((side) => (
        <mesh key={`skirt-${side}`} position={[side * (ROOM.halfWidth - 0.02), 0.06, ROOM.centerZ]}>
          <boxGeometry args={[0.04, 0.12, ROOM.halfDepth * 2]} />
          <meshStandardMaterial color="#4a5160" roughness={0.3} metalness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.06, ROOM.centerZ - ROOM.halfDepth + 0.02]}>
        <boxGeometry args={[ROOM.halfWidth * 2, 0.12, 0.04]} />
        <meshStandardMaterial color="#4a5160" roughness={0.3} metalness={0.85} />
      </mesh>

      {/* Recessed ceiling fixtures: a housing plus an emissive diffuser
          panel — an actual light source object, not a disembodied glow. */}
      {fixtures.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, ROOM.wallHeight - 0.06, z]}>
          <mesh>
            <boxGeometry args={[1.1, 0.08, 0.34]} />
            <meshStandardMaterial color="#2a2f38" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh position-y={-0.045}>
            <boxGeometry args={[0.98, 0.02, 0.26]} />
            <meshStandardMaterial color="#eef4ff" emissive="#cfe0ff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Real wall detail: a clock and a power/breaker panel (both CC0
          GLBs — src/data/bci-assets.ts), plus equipment racks near the
          ROS2/robotics control aisle and against the side walls for depth. */}
      <GlbProp
        path="/models/laboratory/wall_clock/wall_clock_1k.gltf"
        position={[0, 2.55, ROOM.centerZ - ROOM.halfDepth + 0.11]}
        rotationY={Math.PI}
        fallback={
          <mesh position={[0, 2.55, ROOM.centerZ - ROOM.halfDepth + 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.03, 24]} />
            <meshStandardMaterial color="#eef2f8" roughness={0.4} />
          </mesh>
        }
      />
      <GlbProp
        path="/models/laboratory/power_box_01/power_box_01_1k.gltf"
        position={[ROOM.halfWidth - 0.13, 1.55, -2.4]}
        rotationY={-Math.PI / 2}
        fallback={
          <mesh position={[ROOM.halfWidth - 0.13, 1.55, -2.4]}>
            <boxGeometry args={[0.09, 0.5, 0.5]} />
            <meshStandardMaterial color="#8a919c" roughness={0.5} metalness={0.3} />
          </mesh>
        }
      />

      {/* One rack right at the robotics control aisle (the "small rack"
          section 06 calls for), plus two against the perimeter for depth. */}
      <EquipmentRack position={[-4.4, 0, -1.5]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[-ROOM.halfWidth + 0.35, 0, -9]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[ROOM.halfWidth - 0.35, 0, -6.5]} rotationY={-Math.PI / 2} />
    </group>
  );
}
