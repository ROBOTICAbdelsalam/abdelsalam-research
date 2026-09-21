"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { getAssetMaterials } from "./assetMaterials";
import { nodeHighlight } from "./interaction";
import { timeUniform } from "./materials";
import { useSceneSettings } from "./sceneContext";
import { nodeScale, type SystemLayout } from "./sceneConfig";

// Automation: a quadruped robot (as in the reference — not a wheeled AMR),
// standing on the deck in a three-quarter pose toward the viewer's left.
// Procedural stand-in with real joint hierarchy (hip → thigh → knee → shin),
// swapped for an optimised GLB where a suitable one is available.

function Leg({ hip, thigh, shin, radius, front, legRef }: { hip: [number, number, number]; thigh: number; shin: number; radius: number; front: boolean; legRef: (group: Group | null) => void }) {
  const m = getAssetMaterials();
  // Front knees bend back, rear knees bend forward — the stance of a Spot-style robot.
  const dir = front ? 1 : -1;
  return (
    <group position={hip}>
      <mesh material={m.darkJoint} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[radius * 1.35, radius * 1.35, radius * 2.6, 20]} />
      </mesh>
      <group ref={legRef} rotation-z={dir * 0.32}>
        <mesh material={m.white} position-y={-thigh / 2}>
          <capsuleGeometry args={[radius, thigh - radius * 2, 6, 16]} />
        </mesh>
        <group position-y={-thigh} rotation-z={-dir * 0.78}>
          <mesh material={m.darkJoint} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[radius * 1.15, radius * 1.15, radius * 2.2, 20]} />
          </mesh>
          <mesh material={m.blackMatte} position-y={-shin / 2}>
            <capsuleGeometry args={[radius * 0.82, shin - radius * 1.6, 6, 16]} />
          </mesh>
          <mesh material={m.silver} position-y={-shin}>
            <sphereGeometry args={[radius * 0.9, 16, 12]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export function AutomationRobot({ system }: { system: SystemLayout }) {
  const { u, v } = useMemo(() => nodeScale(system), [system]);
  const m = getAssetMaterials();
  const { reducedMotion } = useSceneSettings();
  const root = useRef<Group>(null);
  const gimbal = useRef<Group>(null);
  const legs = useRef<(Group | null)[]>([]);

  // Idle: the body breathes and sways, the legs shift their weight, and the
  // top sensor gimbal keeps scanning.
  useFrame(() => {
    if (reducedMotion) return;
    const t = timeUniform.value * (1 + nodeHighlight.automation.value * 1.2);
    if (root.current) {
      root.current.position.y = 0.012 * Math.sin(t * 1.6);
      root.current.rotation.y = Math.PI + 0.55 + 0.06 * Math.sin(t * 0.5);
    }
    if (gimbal.current) gimbal.current.rotation.y = t * 0.9;
    legs.current.forEach((leg, i) => {
      if (leg) leg.rotation.z = (i < 2 ? 0.32 : -0.32) + 0.045 * Math.sin(t * 1.6 + i * 1.57);
    });
  });

  const length = 132 * u;
  const bodyH = 44 * v;
  const width = 56 * u;
  const legR = 9 * u;
  const thigh = 48 * v;
  const shin = 50 * v;
  const standH = thigh * 0.85 + shin * 0.72;

  const bodyGeometry = useMemo(() => new RoundedBoxGeometry(length, bodyH, width, 4, bodyH * 0.28), [length, bodyH, width]);
  const headGeometry = useMemo(() => new RoundedBoxGeometry(width * 0.62, bodyH * 0.9, width * 0.7, 4, bodyH * 0.22), [width, bodyH]);

  return (
    // Left of the deck centre, nose toward the camera's left.
    <group ref={root} position={[-40 * u, 0, 0]} rotation-y={Math.PI + 0.55}>
      <group position-y={standH + bodyH / 2}>
        <mesh geometry={bodyGeometry} material={m.white} />
        <mesh material={m.darkJoint} position-y={bodyH * 0.5 + 0.004} scale={[0.6, 1, 0.5]}>
          <boxGeometry args={[length, 0.02, width]} />
        </mesh>
        {/* Sensor head. */}
        <mesh geometry={headGeometry} material={m.darkJoint} position={[length / 2 + width * 0.2, bodyH * 0.06, 0]} />
        <mesh material={m.glowCyan} position={[length / 2 + width * 0.51, bodyH * 0.08, 0]} rotation-y={Math.PI / 2}>
          <circleGeometry args={[bodyH * 0.2, 20]} />
        </mesh>
        <mesh material={m.glowAmber} position={[-length / 2 - 0.004, bodyH * 0.1, 0]} rotation-y={-Math.PI / 2}>
          <circleGeometry args={[bodyH * 0.11, 12]} />
        </mesh>
        {/* Top mast with a two-armed sensor gimbal, as in the reference. */}
        <mesh material={m.darkJoint} position={[-length * 0.1, bodyH * 0.5 + 0.07, 0]}>
          <cylinderGeometry args={[legR * 0.35, legR * 0.5, 0.14, 12]} />
        </mesh>
        <group ref={gimbal} position={[-length * 0.1, bodyH * 0.5 + 0.16, 0]}>
          <mesh material={m.silver}>
            <boxGeometry args={[legR * 0.7, legR * 0.5, width * 0.9]} />
          </mesh>
          {[-1, 1].map((side) => (
            <group key={side} position={[0, legR * 0.3, side * width * 0.46]}>
              <mesh material={m.darkJoint}>
                <cylinderGeometry args={[legR * 0.5, legR * 0.5, legR * 0.8, 12]} />
              </mesh>
              <mesh material={m.glowBlue} position-y={legR * 0.42} rotation-x={-Math.PI / 2}>
                <ringGeometry args={[legR * 0.22, legR * 0.42, 16]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>

      {/* Legs. */}
      {([
        [length * 0.36, width * 0.5, true],
        [length * 0.36, -width * 0.5, true],
        [-length * 0.36, width * 0.5, false],
        [-length * 0.36, -width * 0.5, false],
      ] as const).map(([x, z, front], i) => (
        <Leg
          key={i}
          hip={[x, standH + bodyH * 0.35, z]}
          thigh={thigh}
          shin={shin}
          radius={legR}
          front={front}
          legRef={(group) => {
            legs.current[i] = group;
          }}
        />
      ))}
    </group>
  );
}
