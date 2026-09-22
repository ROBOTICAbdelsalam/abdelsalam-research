"use client";

import * as THREE from "three";
import { mulberry32 } from "@/components/3d/random";
import { GlbProp } from "../assets/AssetLoader";

// Real, licensed furniture (CC0, Poly Haven — see src/data/bci-assets.ts)
// with procedural fallbacks sized to match each real asset's own real-world
// footprint, so a missing/blocked GLB swaps in without anything else in a
// station needing to move. Desk top height/footprint are exported as
// constants so every station (and Screen.tsx's monitor-stand math) can
// agree on where the real desk's surface actually is.

const DESK_PATH = "/models/laboratory/metal_office_desk/metal_office_desk_1k.gltf";
const STOOL_PATH = "/models/laboratory/metal_stool_02/metal_stool_02_1k.gltf";
const RACK_PATH = "/models/laboratory/steel_frame_shelves_02/steel_frame_shelves_02_1k.gltf";

export const DESK_TOP_Y = 0.79;
export const DESK_WIDTH = 2.0;
export const DESK_DEPTH = 0.95;

function ProceduralDesk() {
  return (
    <group>
      <mesh position={[0, DESK_TOP_Y, 0]} castShadow receiveShadow>
        <boxGeometry args={[DESK_WIDTH, 0.045, DESK_DEPTH]} />
        <meshStandardMaterial color="#1c2027" roughness={0.35} metalness={0.55} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * DESK_WIDTH) / 2.28, DESK_TOP_Y / 2, 0]} castShadow>
          <boxGeometry args={[0.05, DESK_TOP_Y, DESK_DEPTH * 0.86]} />
          <meshStandardMaterial color="#2a2f38" roughness={0.4} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, DESK_TOP_Y - 0.18, 0]}>
        <boxGeometry args={[DESK_WIDTH * 0.92, 0.02, DESK_DEPTH * 0.7]} />
        <meshStandardMaterial color="#14171d" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}

function ProceduralStool() {
  return (
    <group>
      <mesh position-y={0.44} castShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.03, 24]} />
        <meshStandardMaterial color="#2a2f38" roughness={0.5} metalness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[Math.cos((i / 4) * Math.PI * 2) * 0.17, 0.21, Math.sin((i / 4) * Math.PI * 2) * 0.17]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 0.42, 8]} />
          <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}
      <mesh position-y={0.12} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.17, 0.01, 8, 20]} />
        <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  );
}

function ProceduralRack() {
  const leds = mulberry32(7);
  return (
    <group>
      <mesh position-y={1.07} castShadow receiveShadow>
        <boxGeometry args={[0.56, 2.13, 0.5]} />
        <meshStandardMaterial color="#14171d" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[0, 1.07, 0.252]}>
        <boxGeometry args={[0.5, 2.05, 0.006]} />
        <meshStandardMaterial color="#0e1014" roughness={0.6} metalness={0.3} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const color = leds() > 0.7 ? "#e0a23d" : leds() > 0.5 ? "#5cf2a8" : "#232a36";
        return (
          <mesh key={i} position={[-0.19 + (i % 2) * 0.38, 1.7 - Math.floor(i / 2) * 0.18, 0.256]}>
            <boxGeometry args={[0.03, 0.012, 0.004]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={color === "#232a36" ? 0 : 1.2} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}

export function LabDesk({ position, rotationY }: { position?: [number, number, number]; rotationY?: number }) {
  return <GlbProp path={DESK_PATH} position={position} rotationY={rotationY} fallback={<ProceduralDesk />} />;
}

export function LabStool({ position, rotationY }: { position?: [number, number, number]; rotationY?: number }) {
  return <GlbProp path={STOOL_PATH} position={position} rotationY={rotationY} fallback={<ProceduralStool />} />;
}

export function EquipmentRack({ position, rotationY }: { position?: [number, number, number]; rotationY?: number }) {
  return <GlbProp path={RACK_PATH} position={position} rotationY={rotationY} fallback={<ProceduralRack />} />;
}

// Small desk clutter — keyboard, mouse, a floor cable — positioned relative
// to a desk's own local origin (base-center, per the GLB's real pivot).
export function DeskClutter({ position = [0.5, DESK_TOP_Y, -0.15] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.007, 0]} castShadow>
        <boxGeometry args={[0.34, 0.014, 0.12]} />
        <meshStandardMaterial color="#181b21" roughness={0.6} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.0145, 0]}>
        <boxGeometry args={[0.3, 0.001, 0.095]} />
        <meshStandardMaterial color="#0e1014" roughness={0.7} />
      </mesh>
      <mesh position={[0.24, 0.012, 0.06]} rotation={[0, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.03, 4, 8]} />
        <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh position={[-0.05, -DESK_TOP_Y / 2 - 0.02, -0.02]} rotation={[0.14, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, DESK_TOP_Y - 0.02, 6]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

// A small, warm-lit desk lamp — deliberately not blue, per the lighting
// rebuild notes ("do not make everything blue"). Position relative to the
// same desk-local origin as DeskClutter.
export function DeskLamp({ position = [-0.78, DESK_TOP_Y, -0.32] as [number, number, number] }) {
  return (
    <group position={position}>
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
      <pointLight position={[0.11, 0.24, 0]} color="#e8a34a" intensity={9} distance={1.6} decay={2} />
    </group>
  );
}

// A complete, dressed workstation — desk + clutter + lamp + seating —
// composed once here so every wall-row station (Signal Processing, Feature
// Extraction, CNN-LSTM, Adaptive Decision, ROS 2, Gazebo) gets identical
// dressing without repeating it six times. Stations still own their own
// Screens/Nameplate, positioned in the same local frame.
export function Workstation({ stool = true }: { stool?: boolean }) {
  return (
    <group>
      <LabDesk />
      <DeskClutter />
      <DeskLamp />
      {stool && <LabStool position={[0, 0, 0.92]} rotationY={Math.PI} />}
    </group>
  );
}
