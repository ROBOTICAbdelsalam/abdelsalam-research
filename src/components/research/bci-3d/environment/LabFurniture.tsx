"use client";

import * as THREE from "three";
import { mulberry32 } from "@/components/3d/random";
import { GlbProp } from "../assets/AssetLoader";
import { Cable } from "../Cable";

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
      {/* Mousepad — the mouse sits ON something, not directly on the desk. */}
      <mesh position={[0.24, 0.002, 0.06]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.14, 0.1]} />
        <meshStandardMaterial color="#101216" roughness={0.85} />
      </mesh>
      <mesh position={[0.24, 0.012, 0.06]} rotation={[0, 0.25, 0]} castShadow>
        <capsuleGeometry args={[0.018, 0.03, 4, 8]} />
        <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.25} />
      </mesh>
      <Cable from={[-0.16, 0.007, 0]} to={[-0.05, -DESK_TOP_Y + 0.03, -0.05]} sag={0.02} bow={[-0.03, 0, 0]} radius={0.005} />
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

// Three small procedural props, one per station that needs a visibly
// different silhouette from the generic desk-and-monitor bundle — part of
// the realism pass's "not six identical desks" fix. Positioned relative to
// their station's own local origin (the desk's base-center), so a station
// just places one as a sibling of <Workstation/>.

// A GPU/workstation tower — the CNN-LSTM desk's deep-learning rig, sitting
// on the floor beside the kneehole with vent slats and a status LED strip.
export function GpuTower({ position = [-0.85, 0, 0.15] as [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.24} castShadow receiveShadow>
        <boxGeometry args={[0.19, 0.48, 0.42]} />
        <meshStandardMaterial color="#15171d" roughness={0.4} metalness={0.5} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0.096, 0.1 + i * 0.07, 0.1]}>
          <boxGeometry args={[0.004, 0.012, 0.24]} />
          <meshStandardMaterial color="#0a0b0e" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.096, 0.44, -0.1]}>
        <boxGeometry args={[0.004, 0.01, 0.2]} />
        <meshStandardMaterial color="#2dd4c8" emissive="#2dd4c8" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      <pointLight position={[0.14, 0.44, -0.1]} color="#2dd4c8" intensity={2.4} distance={0.6} decay={2} />
    </group>
  );
}

// A control console — an angled panel with indicator buttons, giving the
// Adaptive Decision station a monitoring-console silhouette rather than
// another flat desk.
export function ControlConsole({ position = [0.86, 0, 0.05] as [number, number, number], rotationY = 0 }) {
  const leds = ["#5cf2a8", "#e0a23d", "#5cf2a8", "#2dd4c8", "#5cf2a8", "#e0575a"];
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-y={0.09} castShadow>
        <boxGeometry args={[0.05, 0.18, 0.22]} />
        <meshStandardMaterial color="#1c2027" roughness={0.45} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.19, 0]} rotation={[-0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.02, 0.22]} />
        <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.55} />
      </mesh>
      {leds.map((color, i) => (
        <mesh key={i} position={[-0.12 + (i % 3) * 0.12, 0.225 + Math.floor(i / 3) * 0.05, 0.07 - Math.floor(i / 3) * 0.03]} rotation={[-0.5, 0, 0]}>
          <circleGeometry args={[0.012, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// A small network switch / patch panel — the ROS 2 area's "control room"
// detail, a row of blinking port LEDs.
// A compact fanless industrial PC — the ROS 2 workstation's actual
// controller, distinct from the network switch beside it: a squat
// vented enclosure with a single power LED, standing on the desk rather
// than implied by the monitor alone.
export function IndustrialComputer({ position = [0, 0, 0] as [number, number, number], rotationY = 0 }) {
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position-y={0.055} castShadow receiveShadow>
        <boxGeometry args={[0.14, 0.11, 0.16]} />
        <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.55} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.055 + i * 0.022, 0.055, 0.081]}>
          <boxGeometry args={[0.006, 0.08, 0.004]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0.05, 0.02, 0.081]}>
        <circleGeometry args={[0.006, 10]} />
        <meshStandardMaterial color="#5cf2a8" emissive="#5cf2a8" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function NetworkSwitch({ position = [0, 0, 0] as [number, number, number], rotationY = 0 }) {
  const ports = mulberry32(21);
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh castShadow>
        <boxGeometry args={[0.34, 0.045, 0.2]} />
        <meshStandardMaterial color="#181b21" roughness={0.45} metalness={0.45} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const color = ports() > 0.35 ? "#5cf2a8" : "#232a36";
        return (
          <mesh key={i} position={[-0.14 + i * 0.04, 0.024, 0.07]}>
            <boxGeometry args={[0.02, 0.006, 0.006]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={color === "#232a36" ? 0 : 1.4} toneMapped={false} />
          </mesh>
        );
      })}
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
