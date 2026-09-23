"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneQuality } from "./sceneQuality";

// A physical research-monitor prop: dark graphite bezel + glass screen
// driven by a canvas texture, redrawn on a throttled interval rather than
// every frame (same imperative-canvas technique as
// src/lib/ai-lab/canvasTextures.ts, generalized into a reusable primitive
// so every station in this lab can carry its own live readout cheaply).
//
// Two independent reasons trigger a redraw:
//  - a timer, for continuously time-animated content (waveforms) — only
//    runs when `intervalMs > 0`;
//  - `draw`'s identity changing, for state-driven content (confidence
//    bars, key/value readouts) that only needs to repaint when the
//    station's actual data changes, not on a clock. This also covers the
//    very first paint. `frozen` (reduced motion) suppresses the timer but
//    never suppresses a real data change.

export type ScreenDraw = (ctx: CanvasRenderingContext2D, w: number, h: number, elapsed: number) => void;

function markTextureDirty(texture: THREE.CanvasTexture) {
  texture.needsUpdate = true;
}

export type ScreenProps = {
  /** World-space panel size [width, height]. */
  size: readonly [number, number];
  position?: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  draw: ScreenDraw;
  /** Canvas pixel resolution. Kept modest — these are readouts, not photos. */
  resolution?: readonly [number, number];
  /** Timer redraw throttle in ms. <= 0 means "only redraw when `draw` changes". */
  intervalMs?: number;
  /** Suppresses the timer (reduced motion) — data-driven redraws still happen. */
  frozen?: boolean;
  bezelColor?: string;
  glow?: string;
  /**
   * The desk surface's Y, in the same local space as `position`. When given,
   * a monitor stand (pole + foot) is drawn rooting the screen to that
   * surface — without it, a monitor mounted above desk height reads as
   * floating, which is exactly the "schematic" look this pass is fixing.
   */
  deskY?: number;
};

export function Screen({
  size,
  position,
  rotation,
  draw,
  resolution = [512, 320],
  intervalMs = 140,
  frozen = false,
  bezelColor = "#1a1e26",
  glow = "#2a5cff",
  deskY,
}: ScreenProps) {
  const canvas = useMemo(() => {
    const el = document.createElement("canvas");
    el.width = resolution[0];
    el.height = resolution[1];
    return el;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resolution is effectively static per screen instance
  }, []);
  const ctx = useMemo(() => canvas.getContext("2d"), [canvas]);
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 2;
    return tex;
  }, [canvas]);

  const { mobile } = useSceneQuality();
  const effectiveInterval = intervalMs > 0 && mobile ? intervalMs * 1.8 : intervalMs;

  const lastDrawFn = useRef<ScreenDraw | null>(null);
  const accum = useRef(0);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    if (!ctx) return;
    elapsed.current += delta;
    const fnChanged = lastDrawFn.current !== draw;
    accum.current += delta * 1000;
    const dueByTimer = !frozen && effectiveInterval > 0 && accum.current >= effectiveInterval;
    if (!fnChanged && !dueByTimer) return;
    accum.current = 0;
    lastDrawFn.current = draw;
    draw(ctx, canvas.width, canvas.height, elapsed.current);
    markTextureDirty(texture);
  });

  useEffect(
    () => () => {
      texture.dispose();
    },
    [texture],
  );

  const [w, h] = size;
  const bezel = Math.min(w, h) * 0.045;

  // Stand geometry, in this group's local space (origin = screen center):
  // the desk surface sits at `poleBottom`, the bezel's bottom edge at
  // `poleTop` — a thin pole plus a small foot disc between the two.
  const screenY = position?.[1] ?? 0;
  const poleBottom = deskY !== undefined ? deskY - screenY : undefined;
  const poleTop = -(h / 2 + bezel);
  const poleHeight = poleBottom !== undefined ? poleTop - poleBottom : 0;
  const showStand = poleBottom !== undefined && poleHeight > 0.02;

  return (
    <group position={position as [number, number, number]} rotation={rotation as [number, number, number]}>
      {showStand && (
        <group>
          <mesh position={[0, (poleTop + (poleBottom as number)) / 2, -bezel * 0.4]}>
            <cylinderGeometry args={[bezel * 0.4, bezel * 0.55, poleHeight, 10]} />
            <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, poleBottom, -bezel * 0.4]}>
            <cylinderGeometry args={[bezel * 1.7, bezel * 1.9, bezel * 0.4, 18]} />
            <meshStandardMaterial color="#181b21" roughness={0.5} metalness={0.5} />
          </mesh>
        </group>
      )}
      {/* Thin-bezel panel — narrower depth than before (a real monitor
          reads as slim, not a uniform slab). This is a proportion change
          only, not extra geometry: Screen.tsx is instantiated ~14 times
          across the lab, so any *added* mesh here has an outsized scene-
          wide cost; a rear-housing hump and tilt hinge were tried and
          reverted for exactly that reason — see the realism-pass notes. */}
      <mesh>
        <boxGeometry args={[w + bezel * 2, h + bezel * 2, bezel * 0.6]} />
        <meshStandardMaterial color={bezelColor} roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Content faces local -Z, matching the site's "-Z is forward" convention
          (see layout.ts `facing()`) — every station rotates its desk group
          to aim -Z at the point it should face. Double-sided on top of that:
          with free orbit/pan, a visitor can end up on either side of a
          desk, and a monitor that goes black from "behind" reads as broken,
          not as physically accurate — legible from both sides is the more
          honest choice for an explorable scene. */}
      <mesh position={[0, 0, -(bezel * 0.3 + 0.002)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={texture} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0, -(bezel * 0.3 + 0.001)]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w + bezel * 0.35, h + bezel * 0.35]} />
        <meshBasicMaterial color={glow} transparent opacity={0.05} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
