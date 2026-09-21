"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { stageActivity } from "./interaction";
import { timeUniform } from "./materials";
import { useSceneSettings } from "./sceneContext";
import { CORE } from "./sceneConfig";
import { Brain } from "./core/Brain";
import { CorePedestal } from "./core/CorePedestal";
import { CoreRings } from "./core/CoreRings";
import { GlassSphere } from "./core/GlassSphere";
import { NeuralLattice } from "./core/NeuralLattice";
import { SoftGlow } from "./SoftGlow";

// The visual centre of the scene: a glass sphere holding a folded brain and a
// luminous neural network, ringed by the PERCEIVE · LEARN · DECIDE · ACT
// orbit, on a tiered technical pedestal with the AI CORE plate.
export function AICore() {
  const { mode, reducedMotion } = useSceneSettings();
  const brain = useRef<Group>(null);

  // The brain slowly turns a few degrees each way inside the glass.
  useFrame(() => {
    if (reducedMotion || !brain.current) return;
    brain.current.rotation.y = 0.2 * Math.sin(timeUniform.value * 0.25);
  });
  const light = mode === "mobile" || mode === "tablet";

  return (
    <group>
      <CorePedestal />
      <CoreRings />
      <group position-y={CORE.centerY}>
        <SoftGlow color="#2f7dff" opacity={0.45} scale={2.5} renderOrder={1} activity={stageActivity.decide} gain={0.3} />
        <group ref={brain}>
          <Brain palette="core" detail={light ? 0.6 : 1} position={[0, 0.02, 0]} scale={1.1} />
        </group>
        <NeuralLattice count={light ? 110 : 190} linkDistance={0.42} />
        <GlassSphere radius={CORE.sphereRadius} />
      </group>
    </group>
  );
}
