"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Activity } from "./interaction";
import { setOpacity } from "./imperative";

// One shared radial-gradient texture for every glow sprite in the scene.
let sharedTexture: THREE.CanvasTexture | null = null;

function getGlowTexture() {
  if (!sharedTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(0.6, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    sharedTexture = new THREE.CanvasTexture(canvas);
    sharedTexture.colorSpace = THREE.SRGBColorSpace;
  }
  return sharedTexture;
}

type SoftGlowProps = {
  color?: string;
  opacity?: number;
  scale?: number;
  position?: [number, number, number];
  renderOrder?: number;
  /** Opacity becomes `opacity + gain × activity.value`, animated per frame. */
  activity?: Activity;
  gain?: number;
};

// A camera-facing additive halo — the cheap stand-in for bloom on the
// brightest things (the core's interior, signal nodes, backdrop bokeh).
export function SoftGlow({ color = "#3b82f6", opacity = 0.5, scale = 1, position, renderOrder = 1, activity, gain = 0.5 }: SoftGlowProps) {
  const material = useMemo(
    () =>
      new THREE.SpriteMaterial({
        map: getGlowTexture(),
        color,
        opacity,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [color, opacity],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    if (activity) setOpacity(material, opacity + gain * activity.value);
  });
  return <sprite material={material} position={position} scale={[scale, scale, 1]} renderOrder={renderOrder} />;
}
