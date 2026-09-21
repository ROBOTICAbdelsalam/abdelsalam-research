"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { buildBrainGeometries } from "./brainGeometry";

// Procedural brain (stand-in / fallback for a GLB anatomical brain). Shaded
// by a small custom shader: a left→right colour sweep (blue → violet →
// magenta/orange in the core; all-blue hologram in the AI/ML node), sulci
// darkened via the per-vertex fold value, and a fresnel rim.

export type BrainPalette = "core" | "hologram";

const PALETTES: Record<BrainPalette, { left: string; mid: string; right: string; rim: string; holo: boolean }> = {
  core: { left: "#1b6dff", mid: "#8a5cff", right: "#ff7d5c", rim: "#7fd8ff", holo: false },
  hologram: { left: "#2f8cff", mid: "#4fa8ff", right: "#7cc4ff", rim: "#bfe9ff", holo: true },
};

const vertex = /* glsl */ `
  attribute float aFold;
  varying vec3 vN;
  varying vec3 vV;
  varying float vX;
  varying float vFold;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vX = position.x;
    vFold = aFold;
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uLeft, uMid, uRight, uRim;
  uniform float uHolo;
  varying vec3 vN;
  varying vec3 vV;
  varying float vX;
  varying float vFold;
  void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(vV);
    float t = clamp((vX + 0.65) / 1.3, 0.0, 1.0);
    vec3 base = t < 0.5
      ? mix(uLeft, uMid, smoothstep(0.12, 0.5, t))
      : mix(uMid, uRight, smoothstep(0.5, 0.95, t));
    float diff = 0.42 + 0.58 * max(dot(N, normalize(vec3(-0.35, 0.55, 0.75))), 0.0);
    float crest = mix(0.16, 1.28, pow(vFold, 0.85));
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    float spec = pow(max(dot(N, normalize(vec3(-0.3, 0.6, 0.8) + V)), 0.0), 26.0);
    vec3 col = base * diff * crest + base * 0.26 + uRim * rim * 0.85 + vec3(pow(vFold, 6.0) * 0.16) + vec3(0.7, 0.9, 1.0) * spec * 0.5 * vFold;
    float alpha = uHolo > 0.5 ? clamp(0.14 + rim * 0.85 + vFold * 0.16, 0.0, 1.0) : 1.0;
    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

function createBrainMaterial(palette: BrainPalette) {
  const p = PALETTES[palette];
  return new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    transparent: p.holo,
    depthWrite: !p.holo,
    blending: p.holo ? THREE.AdditiveBlending : THREE.NormalBlending,
    uniforms: {
      uLeft: { value: new THREE.Color(p.left) },
      uMid: { value: new THREE.Color(p.mid) },
      uRight: { value: new THREE.Color(p.right) },
      uRim: { value: new THREE.Color(p.rim) },
      uHolo: { value: p.holo ? 1 : 0 },
    },
  });
}

type BrainProps = {
  palette?: BrainPalette;
  /** Mesh density multiplier (lower on small screens). */
  detail?: number;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export function Brain({ palette = "core", detail = 1, scale = 1, position, rotation }: BrainProps) {
  const geometries = useMemo(() => buildBrainGeometries(detail), [detail]);
  const material = useMemo(() => createBrainMaterial(palette), [palette]);

  useEffect(
    () => () => {
      Object.values(geometries).forEach((g) => g.dispose());
    },
    [geometries],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometries.left} material={material} />
      <mesh geometry={geometries.right} material={material} />
      <mesh geometry={geometries.cerebellum} material={material} />
      <mesh geometry={geometries.stem} material={material} />
    </group>
  );
}
