"use client";

import { useCallback, useMemo } from "react";
import { GESTURES, HONESTY_LABELS } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Cable } from "../Cable";
import { useBciExperiment } from "../BCIExperimentProvider";
import { HAND_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { drawBackdrop, drawChrome, drawKeyValueRows, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";
import { RoboticHand } from "./RoboticHand";

const STEEL = { color: "#8d95a3", metalness: 0.9, roughness: 0.22 } as const;

// H. ROBOTICS WORKCELL — a real rectangular workbench (no licensed
// "robotics workbench" GLB fit a premium-lab brief; every candidate
// checked was rusted/worn shop furniture, so this stays procedural — see
// src/data/bci-assets.ts), a mounting plate the hand is bolted to, a small
// parts tray, and a compact robot-state readout. The physical stand-in for
// "GAZEBO / ROBOT SIMULATION", explicitly labeled as such right at the
// prop — not only on the paired Gazebo desk elsewhere in the room.

const BENCH_TOP_Y = 0.86;

function Workbench() {
  return (
    <group>
      {/* Benchtop. */}
      <mesh position-y={BENCH_TOP_Y} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.05, 0.75]} />
        <meshStandardMaterial color="#1c2027" roughness={0.4} metalness={0.55} />
      </mesh>
      {/* Undershelf. */}
      <mesh position-y={0.32}>
        <boxGeometry args={[1.18, 0.03, 0.62]} />
        <meshStandardMaterial color="#14171d" roughness={0.55} metalness={0.4} />
      </mesh>
      {/* Legs. */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}-${z}`} position={[x * 0.6, BENCH_TOP_Y / 2, z * 0.33]} castShadow>
            <boxGeometry args={[0.05, BENCH_TOP_Y, 0.05]} />
            <meshStandardMaterial color="#2a2f38" roughness={0.4} metalness={0.7} />
          </mesh>
        )),
      )}
      {/* Mounting plate the hand is bolted to, with real bolt heads around
          its rim rather than an implied fastening. */}
      <mesh position={[0.05, BENCH_TOP_Y + 0.028, -0.05]} castShadow>
        <cylinderGeometry args={[0.13, 0.13, 0.03, 20]} />
        <meshStandardMaterial color="#3a4150" roughness={0.35} metalness={0.7} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[0.05 + Math.cos(a) * 0.112, BENCH_TOP_Y + 0.045, -0.05 + Math.sin(a) * 0.112]}>
            <cylinderGeometry args={[0.006, 0.006, 0.014, 6]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        );
      })}

      {/* Small controller box — the hand's local control/power unit,
          separate from the ROS2 desk's control station across the room. */}
      <group position={[0.4, BENCH_TOP_Y, -0.22]}>
        <mesh position-y={0.045} castShadow receiveShadow>
          <boxGeometry args={[0.16, 0.09, 0.13]} />
          <meshStandardMaterial color="#181b21" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh position={[-0.05, 0.075, 0.066]}>
          <boxGeometry args={[0.014, 0.008, 0.004]} />
          <meshStandardMaterial color="#5cf2a8" emissive="#5cf2a8" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        <mesh position={[0.02, 0.075, 0.066]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.012, 0.012, 0.02, 12]} />
          <meshStandardMaterial color="#2a2f38" roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
      <Cable from={[0.12, BENCH_TOP_Y + 0.14, -0.12]} to={[0.36, BENCH_TOP_Y + 0.09, -0.2]} sag={0.02} radius={0.007} />
      {/* Small parts tray: a hex-bolt-like part and a chamfered block. */}
      <mesh position={[-0.48, BENCH_TOP_Y + 0.03, 0.18]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshStandardMaterial color="#3a4150" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[-0.48, BENCH_TOP_Y + 0.065, 0.18]} castShadow>
        <boxGeometry args={[0.07, 0.012, 0.07]} />
        <meshStandardMaterial color="#4a5160" roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0.42, BENCH_TOP_Y + 0.045, 0.2]} castShadow>
        <cylinderGeometry args={[0.045, 0.045, 0.11, 6]} />
        <meshStandardMaterial color="#4a5160" roughness={0.35} metalness={0.65} />
      </mesh>
      {/* Small, contained simulation-grid tile beneath the mounting plate —
          the one place in the room the grid motif survives, per the
          realism pass's "grid may exist subtly as part of the robotics
          environment, but must not dominate the lab". */}
      <gridHelper args={[0.34, 6, "#2dd4c8", "#193a3a"]} position={[0.05, BENCH_TOP_Y + 0.044, -0.05]} />

      {/* Physical emergency-stop button — a mushroom-cap red button on a
          yellow base, mounted on the bench's front edge. The HUD's own
          E-Stop control drives the actual state machine; this is the
          workcell's physical safety hardware a real robotics bench would
          have, per the realism pass's workcell requirements. */}
      <group position={[-0.58, BENCH_TOP_Y + 0.025, 0.3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.014, 16]} />
          <meshStandardMaterial color="#e0a23d" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position-y={0.014} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.012, 16]} />
          <meshStandardMaterial color="#1c2027" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position-y={0.026} castShadow>
          <sphereGeometry args={[0.018, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#c23b3f" roughness={0.4} metalness={0.15} />
        </mesh>
      </group>
    </group>
  );
}

// Hazard-stripe floor marking — a real robotics workcell's safety
// boundary, built from alternating yellow/black tape segments around the
// bench footprint rather than a literal fence (which would block camera
// sightlines this close to the hand).
function SafetyBoundary() {
  const segments = useMemo(() => {
    const w = 2.1;
    const d = 1.7;
    const half = { w: w / 2, d: d / 2 };
    const perimeter: { pos: [number, number]; len: number; rot: number }[] = [
      { pos: [0, -half.d], len: w, rot: 0 },
      { pos: [0, half.d], len: w, rot: 0 },
      { pos: [-half.w, 0], len: d, rot: Math.PI / 2 },
      { pos: [half.w, 0], len: d, rot: Math.PI / 2 },
    ];
    const out: { x: number; z: number; rot: number; color: string }[] = [];
    perimeter.forEach(({ pos, len, rot }) => {
      const step = 0.24;
      const count = Math.round(len / step);
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count - 0.5;
        const dx = rot === 0 ? t * len : 0;
        const dz = rot === 0 ? 0 : t * len;
        out.push({ x: pos[0] + dx, z: pos[1] + dz, rot, color: i % 2 === 0 ? "#e0a23d" : "#14171d" });
      }
    });
    return out;
  }, []);

  return (
    <group position-y={0.004}>
      {segments.map((s, i) => (
        <mesh key={i} position={[s.x, 0, s.z]} rotation={[-Math.PI / 2, 0, s.rot]}>
          <planeGeometry args={[0.2, 0.09]} />
          <meshStandardMaterial color={s.color} roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

export function RoboticWorkbench() {
  const { stage, phase, command } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "robot" || stage === "gazebo";
  const label = GESTURES.find((g) => g.id === command)?.label ?? command;

  const robotState =
    phase === "EMERGENCY_STOP" ? "STOPPED" : phase === "EXECUTING" || phase === "COMMAND_ACCEPTED" ? "EXECUTING" : phase === "COMPLETED" ? "COMPLETED" : "IDLE";

  const drawState = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "ROBOT STATE", HONESTY_LABELS.digitalTwin, PANEL.cyan);
      drawKeyValueRows(ctx, w, h, h * 0.22, [
        { label: "STATE", value: robotState, color: robotState === "EXECUTING" ? PANEL.cyan : robotState === "STOPPED" ? PANEL.danger : PANEL.text },
        { label: "GESTURE", value: label.toUpperCase() },
        { label: "JOINTS", value: "5 × 3" },
      ]);
    },
    [robotState, label],
  );

  return (
    <StationZone id="hand" position={HAND_POSITION} size={[2.4, 2.2, 2.0]}>
      <Workbench />
      <SafetyBoundary />
      <group position={[0.05, BENCH_TOP_Y + 0.06, -0.05]}>
        <RoboticHand />
      </group>
      <Screen
        size={[0.4, 0.28]}
        position={[0.5, BENCH_TOP_Y + 0.32, -0.3]}
        rotation={[0, -0.5, 0]}
        draw={drawState}
        intervalMs={0}
        frozen={reducedMotion}
        glow={PANEL.cyan}
        deskY={BENCH_TOP_Y}
      />
      <Nameplate text="Robotic Hand" sub={`Gesture: ${label}`} position={[0, 1.95, 0.42]} accent={active ? "#2dd4c8" : "#5b9dff"} />
      <Nameplate text={HONESTY_LABELS.gazebo} position={[0, 1.68, 0.42]} width={1.85} color="#eaf1ff" accent="#2dd4c8" />
    </StationZone>
  );
}
