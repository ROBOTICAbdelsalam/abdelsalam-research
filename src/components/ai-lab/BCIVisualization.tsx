"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { MeshStandardMaterial } from "three";
import { drawEEGWaveform } from "@/lib/ai-lab/canvasTextures";
import { LAB_COLORS, MATERIAL, TONE_HEX } from "@/lib/ai-lab/colors";
import { useReducedMotion } from "@/lib/useReducedMotion";

const REDRAW_INTERVAL = 0.15;

function createPanel() {
  const canvas = document.createElement("canvas");
  canvas.width = 220;
  canvas.height = 110;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  if (ctx) {
    ctx.fillStyle = LAB_COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawEEGWaveform(ctx, canvas.width, canvas.height, TONE_HEX.trace, 0);
    texture.needsUpdate = true;
  }
  return { canvas, ctx, texture };
}

// A small freestanding EEG panel near the BCI Researcher's workstation —
// distinct from that agent's desk monitor, reinforcing the
// brain-computer-interface research context (Phase 2 spec §27) without
// implying live hardware: it's a slowly evolving abstract waveform, redrawn
// on a throttled interval rather than every frame.
//
// The texture is never passed through JSX props (which would mean reading
// a mutated value during render); instead it's attached imperatively via a
// material ref once, in an effect, since it needs to be mutated in place
// on every redraw — the same reason event handlers set `el.value` directly
// instead of routing it back through React state.
export function BCIVisualization({ position }: { position: [number, number, number] }) {
  const shouldReduceMotion = useReducedMotion();
  const elapsedRef = useRef(0);
  const phaseRef = useRef(0);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const panelRef = useRef<ReturnType<typeof createPanel> | null>(null);

  useEffect(() => {
    const panel = createPanel();
    panelRef.current = panel;
    const material = materialRef.current;
    if (material) {
      material.map = panel.texture;
      material.emissiveMap = panel.texture;
      material.needsUpdate = true;
    }
  }, []);

  useFrame((_, delta) => {
    const panel = panelRef.current;
    if (shouldReduceMotion || !panel?.ctx) return;
    elapsedRef.current += delta;
    if (elapsedRef.current < REDRAW_INTERVAL) return;
    elapsedRef.current = 0;
    phaseRef.current += 0.6;
    panel.ctx.fillStyle = LAB_COLORS.background;
    panel.ctx.fillRect(0, 0, panel.canvas.width, panel.canvas.height);
    drawEEGWaveform(panel.ctx, panel.canvas.width, panel.canvas.height, TONE_HEX.trace, phaseRef.current);
    panel.texture.needsUpdate = true;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1.1, 8]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.68, 0.4, 0.03]} />
        <meshStandardMaterial color={MATERIAL.deskAccent} roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.15, 0.02]}>
        <planeGeometry args={[0.6, 0.32]} />
        <meshStandardMaterial
          ref={materialRef}
          emissive="#ffffff"
          emissiveIntensity={0.9}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
