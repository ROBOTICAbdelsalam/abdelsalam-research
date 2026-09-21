"use client";

import { useMemo, useRef, type MutableRefObject, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { getAssetMaterials } from "./assetMaterials";
import { setSlot } from "./imperative";
import { nodeHighlight } from "./interaction";
import { timeUniform } from "./materials";
import { useSceneSettings } from "./sceneContext";
import { nodeScale, type SystemLayout } from "./sceneConfig";

// Procedural 6-axis industrial arm on the Robotics deck, posed as in the
// reference: an inverted "U" — base on the right, upper arm rising up and
// over to the left, forearm dropping back down to a tool pointing at the
// deck. Built as a real joint hierarchy (each segment is a child of the
// previous joint) so the idle animation can articulate it.
//
// Joint positions below are pixels measured off the reference, relative to
// the arm's base (x right, y up), converted to world units for this node.

const JOINTS_PX: [number, number][] = [
  [0, 0], // base
  [5, 75], // shoulder
  [-85, 135], // elbow (top of the arch)
  [-93, 65], // wrist
  [-70, 8], // tool tip
];
const LINK_RADIUS_PX = [22, 20, 16, 12];
const SWAY = [0.09, 0.13, 0.16, 0.2];

type Segment = { length: number; angle: number; radius: number };

function buildSegments(u: number, v: number): Segment[] {
  const segments: Segment[] = [];
  let previous = 0;
  for (let i = 0; i < JOINTS_PX.length - 1; i++) {
    const dx = (JOINTS_PX[i + 1][0] - JOINTS_PX[i][0]) * u;
    const dy = (JOINTS_PX[i + 1][1] - JOINTS_PX[i][1]) * v;
    const absolute = Math.atan2(-dx, dy); // angle from +y, CCW-positive about z
    segments.push({ length: Math.hypot(dx, dy), angle: absolute - previous, radius: LINK_RADIUS_PX[i] * u });
    previous = absolute;
  }
  return segments;
}

function Joint({ radius, ring = true }: { radius: number; ring?: boolean }) {
  const m = getAssetMaterials();
  return (
    <group>
      <mesh material={m.darkJoint} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[radius * 1.18, radius * 1.18, radius * 2.3, 28]} />
      </mesh>
      {ring && (
        <mesh material={m.glowBlue} rotation-x={Math.PI / 2} position-z={radius * 1.18}>
          <torusGeometry args={[radius * 0.82, radius * 0.07, 8, 32]} />
        </mesh>
      )}
    </group>
  );
}

function Chain({ segments, refs, index = 0 }: { segments: Segment[]; refs: MutableRefObject<(Group | null)[]>; index?: number }): ReactNode {
  const m = getAssetMaterials();
  const segment = segments[index];
  if (!segment) {
    // Tool flange + two-finger gripper.
    const r = segments[segments.length - 1].radius;
    return (
      <group>
        <mesh material={m.silver}>
          <cylinderGeometry args={[r * 1.1, r * 1.1, r * 0.5, 20]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} material={m.darkJoint} position={[side * r * 0.7, -r * 0.9, 0]}>
            <boxGeometry args={[r * 0.4, r * 1.6, r * 0.6]} />
          </mesh>
        ))}
      </group>
    );
  }
  return (
    <group
      ref={(group) => {
        setSlot(refs.current, index, group);
      }}
      rotation-z={segment.angle}
    >
      <Joint radius={segment.radius} />
      <mesh material={index < 2 ? m.white : m.silver} position-y={segment.length / 2}>
        <capsuleGeometry args={[segment.radius, Math.max(segment.length - segment.radius * 2, 0.01), 8, 20]} />
      </mesh>
      <group position-y={segment.length}>
        <Chain segments={segments} refs={refs} index={index + 1} />
      </group>
    </group>
  );
}

export function RobotArm({ system }: { system: SystemLayout }) {
  const { u, v } = useMemo(() => nodeScale(system), [system]);
  const segments = useMemo(() => buildSegments(u, v), [u, v]);
  const m = getAssetMaterials();
  const baseR = 24 * u;
  const { reducedMotion } = useSceneSettings();
  const refs = useRef<(Group | null)[]>([]);

  // Slow, small articulation of every joint; quicker when the node is hovered.
  useFrame(() => {
    if (reducedMotion) return;
    const t = timeUniform.value * (1 + nodeHighlight.robotics.value * 1.2);
    segments.forEach((segment, i) => {
      const joint = refs.current[i];
      if (joint) joint.rotation.z = segment.angle + SWAY[i] * Math.sin(t * 0.55 + i * 1.3);
    });
  });

  return (
    // The arm's base sits slightly right of and behind the deck centre.
    <group position={[15 * u, 0, -system.radius * 0.22]}>
      <mesh material={m.darkJoint} position-y={0.03}>
        <cylinderGeometry args={[baseR * 1.35, baseR * 1.5, 0.06, 40]} />
      </mesh>
      <mesh material={m.blackMatte} position-y={0.14}>
        <cylinderGeometry args={[baseR, baseR * 1.15, 0.22, 32]} />
      </mesh>
      <group position-y={0.22}>
        <Chain segments={segments} refs={refs} />
      </group>
    </group>
  );
}
