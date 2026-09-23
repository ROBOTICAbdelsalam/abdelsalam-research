"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ROOM } from "../layout";
import { GlbProp } from "../assets/AssetLoader";
import { EquipmentRack, GlassPartition, LabPlant } from "./LabFurniture";

// The physical room shell — REBUILT again for the visual-reconstruction
// pass's new zone layout (see layout.ts's header comment for why the
// positions moved). Fixture positions now match the new zones; the old
// single opaque EEG partition wall is replaced with glass-walled "clean
// room" partitions set back near the side walls — visible depth behind
// the working floor rather than a divider that blocks it, per the
// reference's background treatment — plus scattered plants and an extra
// equipment rack for the density the reference's background carries.
// Still: a plain rough-industrial floor with no grid, matte painted
// walls, and physical ceiling fixtures a visitor could point to.

const FLOOR_COLOR = "#0e1013";
const WALL_COLOR = "#1a1e26";

export function RealisticLab() {
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(ROOM.halfWidth * 2, ROOM.halfDepth * 2), []);

  // Ceiling fixtures placed over each zone rather than a uniform grid —
  // EEG, ROS2, the AI cluster around the Core, Gazebo, and the robotics
  // workcell, plus fill fixtures over the open floor between them. Kept in
  // sync with layout.ts's current station positions.
  const fixtures: [number, number][] = [
    [-8.3, 3.2],
    [-5.2, 0.4],
    [-3.4, -7.8],
    [0.2, -6.0],
    [2.6, -7.2],
    [2.6, -4.2],
    [5.4, -5.6],
    [4.6, -1.2],
    [8.5, 1.0],
    [8.5, -2.5],
    [-1.5, -3.5],
    [0, -1.5],
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

      {/* Glass "clean room" partitions near the back wall, left and right —
          the reference's background depth cue: a dimly lit room visible
          beyond glass rather than a blank painted wall. Set well back so
          they never cross a camera preset's sightline to its own station,
          and positioned asymmetrically (left near EEG, right past the
          hand) to bracket the whole floor rather than centering on one
          zone. */}
      <GlassPartition position={[-7.4, 0, -10.1]} width={4.6} height={2.7} />
      <GlassPartition position={[9.0, 0, -6.5]} rotationY={Math.PI / 2} width={6.2} height={2.7} />
      {/* A little equipment glimpsed behind the glass, so it reads as an
          occupied room rather than an empty glass box. Both partitions'
          Z-ranges stay well clear of the hand workcell (z ≈ 1.0) and
          Gazebo (z ≈ -1.2) so neither crosses a working station. */}
      <EquipmentRack position={[-8.6, 0, -9.8]} rotationY={0.3} />
      <LabPlant position={[-6.0, 0, -9.9]} scale={1.3} />
      <LabPlant position={[9.5, 0, -9.0]} scale={1.4} />
      <LabPlant position={[9.5, 0, -4.5]} scale={1.2} />
      {/* Plants and small equipment on the working floor itself, near
          station edges — not just behind the glass — per the reference's
          background-density notes. */}
      <LabPlant position={[-9.0, 0, -4.0]} scale={1.1} />
      <LabPlant position={[7.0, 0, -8.2]} scale={1.15} />
      <LabPlant position={[-0.3, 0, -1.5]} scale={1.0} />

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
      <EquipmentRack position={[-6.9, 0, -1.4]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[-ROOM.halfWidth + 0.35, 0, -9]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[ROOM.halfWidth - 0.35, 0, -1.0]} rotationY={-Math.PI / 2} />
    </group>
  );
}
