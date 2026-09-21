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

// Pan-tilt perception unit on the Sensors deck: a slatted drum base with a
// silver band, a neck and yoke, and a camera head with a large blue-ringed
// lens and a smaller secondary lens, turned to face the viewer's left.

export function SensorModule({ system }: { system: SystemLayout }) {
  const { u, v } = useMemo(() => nodeScale(system), [system]);
  const m = getAssetMaterials();
  const { reducedMotion } = useSceneSettings();
  const head = useRef<Group>(null);

  // Pan the camera head back and forth as if scanning the scene.
  useFrame(() => {
    if (reducedMotion || !head.current) return;
    const t = timeUniform.value * (1 + nodeHighlight.sensors.value * 1.5);
    head.current.rotation.y = -0.15 + 0.55 * Math.sin(t * 0.32);
  });

  const drumR = 42 * u;
  const drumH = 50 * v;
  const neckH = 30 * v;
  const headW = 74 * u;
  const headH = 50 * v;
  const headD = 58 * u;

  const headGeometry = useMemo(() => new RoundedBoxGeometry(headW, headH, headD, 4, headH * 0.16), [headW, headH, headD]);

  return (
    // Left/back of the deck; the whole unit yawed toward the camera's left.
    <group position={[-38 * u, 0, -40 * u * 0.6]} rotation-y={0.55}>
      {/* Drum base. */}
      <mesh material={m.blackMatte} position-y={drumH / 2}>
        <cylinderGeometry args={[drumR, drumR * 1.04, drumH, 48]} />
      </mesh>
      <mesh material={m.silver} position-y={drumH * 0.86}>
        <cylinderGeometry args={[drumR * 1.02, drumR * 1.02, drumH * 0.14, 48]} />
      </mesh>
      <mesh material={m.glowCyan} position-y={drumH * 0.44} rotation-x={Math.PI / 2}>
        <torusGeometry args={[drumR * 1.005, 0.012, 6, 64]} />
      </mesh>
      {/* Neck. */}
      <mesh material={m.silver} position-y={drumH + neckH / 2}>
        <cylinderGeometry args={[drumR * 0.14, drumR * 0.17, neckH, 16]} />
      </mesh>
      {/* Head. */}
      <group ref={head} position-y={drumH + neckH + headH * 0.55} rotation-y={-0.15}>
        <mesh geometry={headGeometry} material={m.blackMatte} />
        <mesh material={m.white} position={[0, headH * 0.56, 0]}>
          <boxGeometry args={[headW * 0.78, headH * 0.08, headD * 0.7]} />
        </mesh>
        {/* Main lens: housing, glass, glowing ring. */}
        <group position={[0, headH * 0.02, headD / 2]} rotation-x={Math.PI / 2}>
          <mesh material={m.darkJoint} position-y={headD * 0.1}>
            <cylinderGeometry args={[headH * 0.36, headH * 0.4, headD * 0.24, 32]} />
          </mesh>
          <mesh material={m.glassLens} position-y={headD * 0.23}>
            <cylinderGeometry args={[headH * 0.3, headH * 0.3, 0.02, 32]} />
          </mesh>
          <mesh material={m.glowBlue} position-y={headD * 0.235} rotation-x={Math.PI / 2}>
            <torusGeometry args={[headH * 0.33, 0.014, 8, 40]} />
          </mesh>
        </group>
        {/* Secondary lens + indicator. */}
        <mesh material={m.glassLens} position={[headW * 0.32, headH * 0.22, headD / 2 + 0.005]}>
          <circleGeometry args={[headH * 0.09, 20]} />
        </mesh>
        <mesh material={m.glowBlue} position={[headW * 0.32, headH * 0.22, headD / 2 + 0.008]}>
          <ringGeometry args={[headH * 0.1, headH * 0.125, 24]} />
        </mesh>
        <mesh material={m.glowAmber} position={[-headW * 0.36, headH * 0.3, headD / 2 + 0.005]}>
          <circleGeometry args={[headH * 0.035, 10]} />
        </mesh>
      </group>
    </group>
  );
}
