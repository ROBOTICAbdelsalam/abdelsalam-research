"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GestureId } from "@/data/bci-experiment";
import { useBciExperiment } from "../BCIExperimentProvider";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { HAND_POSITION } from "../layout";

// ROBOTIC HAND — CINEMATIC FINGER RIG. The source photo has no
// independently modeled fingers to animate (a single baked photograph,
// left untouched per this pass's brief), so this is the lightweight
// interactive foreground representation the brief explicitly allows for
// the hand interaction only: five abstract finger segments fanned from a
// palm point, sat directly over the robotic hand's on-image position
// (HAND_POSITION — the same anchor the rest of the scene already treats
// as "the hand," e.g. ImageDiorama's HandStateGlow). It only appears
// while a run is actually executing an accepted command; at rest, and on
// a rejected command, the run's stage never reaches "robot" (see
// state.ts's buildRunSequence — a rejected run stops at the confidence
// gate), so this component simply never has a reason to show itself and
// the photo's own hand is all that's ever seen — "the hand doesn't move
// on a rejected gesture" is true by construction, not a rule enforced
// here.

const HAND_Z = 0.34;
const REST_OPENNESS = 0.55; // resting spread — not fisted, not fully splayed
const FOLD_ANGLE = (68 * Math.PI) / 180; // how far a fully curled finger folds back toward the palm
const EXTEND_MS = 900; // one finger's own ease-in/out duration once its stagger elapses

const EXECUTING_COLOR = new THREE.Color("#63e0d3");
const GREEN = new THREE.Color("#5cf2a8");
const RED = new THREE.Color("#e0575a");

type FingerName = "thumb" | "index" | "middle" | "ring" | "little";

// Staggered thumb → index → middle → ring → little, per the brief.
const FINGERS: readonly { name: FingerName; angleDeg: number; length: number; radius: number; staggerMs: number }[] = [
  { name: "thumb", angleDeg: -52, length: 0.62, radius: 0.1, staggerMs: 0 },
  { name: "index", angleDeg: -22, length: 0.82, radius: 0.085, staggerMs: 130 },
  { name: "middle", angleDeg: 0, length: 0.9, radius: 0.085, staggerMs: 260 },
  { name: "ring", angleDeg: 22, length: 0.82, radius: 0.085, staggerMs: 390 },
  { name: "little", angleDeg: 46, length: 0.64, radius: 0.075, staggerMs: 520 },
];

// Target openness per finger (0 = curled into the palm, 1 = fully
// extended) for each command in the gesture vocabulary. OPEN_HAND
// extends every finger, CLOSE_HAND curls every finger, the rest are
// sensible poses for the other commands this same demo can accept.
// PINCH_GRIP/POINT never actually reach this component in practice — see
// GESTURES in src/data/bci-experiment.ts, their fixed demo confidence
// never clears LIVE_GATE_THRESHOLD — but get real targets in case that
// ever changes rather than being left undefined.
const FINGER_TARGETS: Record<GestureId, Record<FingerName, number>> = {
  REST: { thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, little: 0.5 },
  OPEN_HAND: { thumb: 1, index: 1, middle: 1, ring: 1, little: 1 },
  CLOSE_HAND: { thumb: 0.08, index: 0.05, middle: 0.05, ring: 0.05, little: 0.05 },
  PINCH_GRIP: { thumb: 0.35, index: 0.35, middle: 1, ring: 1, little: 1 },
  POWER_GRIP: { thumb: 0.15, index: 0.1, middle: 0.1, ring: 0.1, little: 0.1 },
  POINT: { thumb: 0.2, index: 1, middle: 0.1, ring: 0.1, little: 0.1 },
};

function smoothstep(t: number) {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

export function HandRig() {
  const { phase, accepted, command, progressRef } = useBciExperiment();
  const reducedMotion = useReducedMotion();

  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const materialRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const palmMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const enteredRobotAtRef = useRef(0);
  const wasAtRobotRef = useRef(false);

  useFrame(() => {
    const stage = progressRef.current.stage;
    const atRobotStage = stage === "robot";
    if (atRobotStage && !wasAtRobotRef.current) enteredRobotAtRef.current = performance.now();
    wasAtRobotRef.current = atRobotStage;

    const completedAccepted = phase === "COMPLETED" && accepted;
    const visible = (phase === "EXECUTING" && atRobotStage) || completedAccepted;
    const targets = FINGER_TARGETS[command];
    const elapsedAtStage = performance.now() - enteredRobotAtRef.current;

    const color = phase === "EMERGENCY_STOP" ? RED : completedAccepted ? GREEN : EXECUTING_COLOR;
    const targetOpacity = visible ? 0.85 : 0;
    const colorRate = reducedMotion ? 1 : 0.15;
    const opacityRate = reducedMotion ? 1 : 0.12;

    if (palmMaterialRef.current) {
      palmMaterialRef.current.color.lerp(color, colorRate);
      palmMaterialRef.current.opacity = THREE.MathUtils.lerp(palmMaterialRef.current.opacity, targetOpacity, opacityRate);
    }

    FINGERS.forEach((finger, i) => {
      const group = groupRefs.current[i];
      const material = materialRefs.current[i];
      if (!group || !material) return;

      let openness = REST_OPENNESS;
      if (completedAccepted) {
        openness = targets[finger.name];
      } else if (atRobotStage) {
        const local = elapsedAtStage - finger.staggerMs;
        const t = reducedMotion ? 1 : smoothstep(local / EXTEND_MS);
        openness = THREE.MathUtils.lerp(REST_OPENNESS, targets[finger.name], t);
      }

      const baseAngle = (finger.angleDeg * Math.PI) / 180;
      group.rotation.z = baseAngle + FOLD_ANGLE * (1 - openness);
      const lengthScale = THREE.MathUtils.lerp(0.42, 1, openness);
      group.scale.set(1, lengthScale, 1);

      material.color.lerp(color, colorRate);
      material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, opacityRate);
    });
  });

  return (
    <group position={[HAND_POSITION[0], HAND_POSITION[1], HAND_Z]}>
      <mesh>
        <circleGeometry args={[0.3, 24]} />
        <meshBasicMaterial
          ref={(m) => {
            palmMaterialRef.current = m;
          }}
          color="#aab3bd"
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {FINGERS.map((finger, i) => (
        <group key={finger.name} ref={(el) => (groupRefs.current[i] = el)} rotation-z={(finger.angleDeg * Math.PI) / 180}>
          <mesh position={[0, finger.length / 2, 0]}>
            <capsuleGeometry args={[finger.radius, Math.max(0.05, finger.length - finger.radius * 2), 4, 8]} />
            <meshBasicMaterial
              ref={(m) => {
                materialRefs.current[i] = m;
              }}
              color="#aab3bd"
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
