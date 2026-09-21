"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { WithAsset } from "./AssetBoundary";
import { BrainHologram } from "./BrainHologram";
import { Brain } from "./core/Brain";
import { NeuralLattice } from "./core/NeuralLattice";
import { GlowRing } from "./GlowRing";
import { nodeHighlight } from "./interaction";
import { timeUniform } from "./materials";
import { useSceneSettings } from "./sceneContext";
import { nodeScale, type SystemLayout } from "./sceneConfig";
import { SoftGlow } from "./SoftGlow";

// AI / ML: a blue hologram brain hovering over its deck, wrapped in a small
// neural lattice and ringed by a slow orbit — the reference's "learning" node.
// The brain is an anatomical GLB; if it can't load, the procedural brain
// stands in.

export function AIMLNode({ system }: { system: SystemLayout }) {
  const { u, v } = useMemo(() => nodeScale(system), [system]);
  const brainWidth = 128 * u;
  const lift = 70 * v;

  const { reducedMotion } = useSceneSettings();
  const spin = useRef<Group>(null);

  // The hologram sweeps slowly through a quarter turn and back.
  useFrame(() => {
    if (reducedMotion || !spin.current) return;
    const t = timeUniform.value * (1 + nodeHighlight.aiml.value * 1.6);
    spin.current.rotation.y = Math.PI / 2 - 0.35 + 0.7 * Math.sin(t * 0.28);
  });

  const procedural = <Brain palette="hologram" detail={0.7} scale={brainWidth / 1.2} />;

  return (
    <group position={[system.radius * 0.1, 0, 0]}>
      <SoftGlow color="#3a86ff" opacity={0.4} scale={brainWidth * 2.2} position={[0, lift, -0.1]} />
      <group position-y={lift}>
        <WithAsset fallback={procedural}>
          {/* Long axis along x: a lateral, three-quarter view toward the camera. */}
          <group ref={spin} scale={brainWidth * 1.05} rotation-y={Math.PI / 2 - 0.35}>
            <BrainHologram />
          </group>
        </WithAsset>
        <group scale={brainWidth * 0.82}>
          <NeuralLattice count={60} radius={0.8} color="#bfe6ff" linkColor="#5cb0ff" linkDistance={0.5} seed={9} spin={0.08} />
        </group>
      </group>
      {/* Light stem + orbit ring under the brain. */}
      <mesh position-y={lift * 0.5}>
        <cylinderGeometry args={[0.012, 0.012, lift, 6]} />
        <meshBasicMaterial color="#7cc4ff" transparent opacity={0.6} toneMapped={false} />
      </mesh>
      <GlowRing radius={brainWidth * 0.62} y={lift * 0.32} color="#8b7bff" width={0.06} core={0.16} opacity={0.75} dashes={2} speed={0.1} />
    </group>
  );
}
