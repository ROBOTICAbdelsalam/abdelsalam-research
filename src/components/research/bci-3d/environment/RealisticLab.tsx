"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { ROOM } from "../layout";
import { GlbProp } from "../assets/AssetLoader";
import { EquipmentRack } from "./LabFurniture";

// The physical room shell — REBUILT for the realism pass. Previous version:
// a huge room-spanning gridHelper over a near-mirror floor, with stations
// as separate glowing circular pads (see StationShell, now removed). This
// version: a plain rough-industrial floor with no grid at all, matte
// painted walls, a real institutional ceiling height, overhead light
// fixtures a visitor could actually point to, and physical wall detail
// (a real wall clock, a real power panel, equipment racks) instead of an
// empty void. Section 17: "no floating furniture, no giant empty black
// void, no giant glowing floor grid."

const FLOOR_COLOR = "#0e1013";
const WALL_COLOR = "#1a1e26";

export function RealisticLab() {
  const floorGeometry = useMemo(() => new THREE.PlaneGeometry(ROOM.halfWidth * 2, ROOM.halfDepth * 2), []);

  // Overhead strip-light fixtures, spread across the room's width to cover
  // the whole desk row plus the core/robot areas — physical fixtures a
  // visitor could point to, not an ambient glow with no source.
  const fixtureXs = [-9, -4.5, 0, 4.5, 9];
  const fixtureZs = [-4.5, 1.5];

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
      {fixtureZs.map((z) =>
        fixtureXs.map((x) => (
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
        )),
      )}

      {/* Real wall detail: a clock and a power/breaker panel (both CC0
          GLBs — src/data/bci-assets.ts), plus equipment racks against the
          side walls for depth. No procedural fallback text is needed here
          since both already have a plain-box fallback baked into their own
          components / GlbProp's default. */}
      <GlbProp
        path="/models/laboratory/wall_clock/wall_clock_1k.gltf"
        position={[-2.5, 2.55, ROOM.centerZ - ROOM.halfDepth + 0.11]}
        rotationY={Math.PI}
        fallback={
          <mesh position={[-2.5, 2.55, ROOM.centerZ - ROOM.halfDepth + 0.11]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.03, 24]} />
            <meshStandardMaterial color="#eef2f8" roughness={0.4} />
          </mesh>
        }
      />
      <GlbProp
        path="/models/laboratory/power_box_01/power_box_01_1k.gltf"
        position={[ROOM.halfWidth - 0.13, 1.55, 3.4]}
        rotationY={-Math.PI / 2}
        fallback={
          <mesh position={[ROOM.halfWidth - 0.13, 1.55, 3.4]}>
            <boxGeometry args={[0.09, 0.5, 0.5]} />
            <meshStandardMaterial color="#8a919c" roughness={0.5} metalness={0.3} />
          </mesh>
        }
      />

      <EquipmentRack position={[-ROOM.halfWidth + 0.35, 0, -5.6]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[-ROOM.halfWidth + 0.35, 0, 0.4]} rotationY={Math.PI / 2} />
      <EquipmentRack position={[ROOM.halfWidth - 0.35, 0, -3.2]} rotationY={-Math.PI / 2} />
    </group>
  );
}
