"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CORE } from "../sceneConfig";
import { GlowRing } from "../GlowRing";
import { stageActivity, type Stage } from "../interaction";
import { useSceneSettings } from "../sceneContext";
import { drawSpacedText, resolveFontFamily, useCanvasTexture } from "../textTexture";

// The layered orbital rings around the sphere, with the four stage labels of
// the site's own headline — PERCEIVE · LEARN · DECIDE · ACT — set *on* the
// main ring, as in the reference: PERCEIVE / LEARN on the far arc, DECIDE /
// ACT on the near arc. The label ring stays fixed (so the labels sit exactly
// where the reference has them); the finer rings drift slowly around it.

const LABEL_HEIGHT = 0.23;
const PX_PER_CHAR = 62;
const CANVAS_H = 128;
const WORLD_PER_PX = LABEL_HEIGHT / CANVAS_H;

// Angles in the XZ plane, φ from +x toward +z (toward the camera).
const LABELS: { text: string; angle: number; stage: Stage }[] = [
  { text: "PERCEIVE", angle: (-3 * Math.PI) / 4, stage: "perceive" },
  { text: "LEARN", angle: -Math.PI / 4, stage: "learn" },
  { text: "DECIDE", angle: (3 * Math.PI) / 4, stage: "decide" },
  { text: "ACT", angle: Math.PI / 4, stage: "act" },
];

function buildArcGeometry(radius: number, y: number, centre: number, arcLength: number, flipU: boolean, segments = 30) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const phi = centre + (t - 0.5) * arcLength;
    const x = Math.cos(phi) * radius;
    const z = Math.sin(phi) * radius;
    const u = flipU ? 1 - t : t;
    positions.push(x, y - LABEL_HEIGHT / 2, z, x, y + LABEL_HEIGHT / 2, z);
    uvs.push(u, 0, u, 1);
  }
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

function ArcLabel({ text, angle, radius, y, stage }: { text: string; angle: number; radius: number; y: number; stage: Stage }) {
  const width = PX_PER_CHAR * text.length + 90;
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) =>
      drawSpacedText(ctx, w / 2, h / 2, {
        text,
        family: resolveFontFamily("--font-space-grotesk", "system-ui, sans-serif"),
        size: 84,
        weight: 700,
        spacing: 12,
        color: "#f2fdff",
        glow: "#22d3ee",
        glowBlur: 30,
      }),
    [text],
  );
  const texture = useCanvasTexture(width, CANVAS_H, draw);

  // Read left→right on screen: along +φ on the far arc, along −φ on the near arc.
  const geometry = useMemo(
    () => buildArcGeometry(radius, y, angle, (width * WORLD_PER_PX) / radius, Math.sin(angle) > 0),
    [radius, y, angle, width],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  // The label brightens while its stage of the cycle is active.
  const material = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(() => {
    if (material.current) material.current.opacity = 0.5 + 0.5 * stageActivity[stage].value;
  });

  return (
    <mesh geometry={geometry} renderOrder={6} frustumCulled={false}>
      <meshBasicMaterial
        ref={material}
        map={texture}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

export function CoreRings() {
  const { reducedMotion } = useSceneSettings();
  const inner = useRef<THREE.Group>(null);
  const amber = useRef<THREE.Group>(null);
  const outer = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (reducedMotion) return;
    if (inner.current) inner.current.rotation.y += delta * 0.09;
    if (amber.current) amber.current.rotation.y -= delta * 0.06;
    if (outer.current) outer.current.rotation.y += delta * 0.03;
  });

  const y = CORE.ringY;

  return (
    <group>
      {/* Label ring — fixed. */}
      <GlowRing radius={CORE.ringRadius} y={y} color="#38bdf8" width={0.11} core={0.12} opacity={0.85} dashes={2} speed={0.05} activity={stageActivity.decide} gain={0.25} />
      {LABELS.map((label) => (
        <ArcLabel key={label.text} text={label.text} angle={label.angle} radius={CORE.ringRadius} y={y + 0.02} stage={label.stage} />
      ))}

      {/* Close inner ring hugging the sphere. */}
      <group ref={inner}>
        <GlowRing radius={1.34} y={y + 0.14} color="#bfeaff" width={0.07} core={0.14} opacity={0.85} dashes={3} speed={0.08} tilt={[0.05, 0, -0.04]} />
      </group>

      {/* Amber accent arcs. */}
      <group ref={amber}>
        <GlowRing radius={2.12} y={y - 0.06} color="#f59e0b" width={0.08} core={0.14} opacity={0.85} arcStart={0.4} arcLength={1.7} tilt={[0.07, 0, -0.05]} />
        <GlowRing radius={2.12} y={y - 0.06} color="#f59e0b" width={0.08} core={0.14} opacity={0.7} arcStart={3.7} arcLength={1.2} tilt={[0.07, 0, -0.05]} />
      </group>

      {/* Faint outer orbit. */}
      <group ref={outer}>
        <GlowRing radius={2.55} y={y - 0.3} color="#3b82f6" width={0.07} core={0.14} opacity={0.4} dashes={4} speed={0.04} tilt={[-0.04, 0, 0.03]} />
      </group>
    </group>
  );
}
