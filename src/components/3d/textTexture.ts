"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

// Canvas-drawn text for the in-scene annotations (ring labels, the AI CORE
// plate). Uses the site's own fonts, redrawn once webfonts have loaded, so
// the labels read as part of the same typography system.

export function resolveFontFamily(cssVar: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
  return value ? `${value}, ${fallback}` : fallback;
}

export type SpacedTextSpec = {
  text: string;
  family: string;
  size: number;
  weight?: number;
  /** Extra tracking between glyphs, in px. */
  spacing?: number;
  color: string;
  glow?: string;
  glowBlur?: number;
};

/** Draws horizontally-centred, letter-spaced text (canvas letterSpacing isn't universally supported). */
export function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spec: SpacedTextSpec,
) {
  ctx.save();
  ctx.font = `${spec.weight ?? 600} ${spec.size}px ${spec.family}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  const spacing = spec.spacing ?? 0;
  const chars = [...spec.text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.fillStyle = spec.color;
  if (spec.glow) {
    ctx.shadowColor = spec.glow;
    ctx.shadowBlur = spec.glowBlur ?? 18;
  }
  chars.forEach((c, i) => {
    ctx.fillText(c, x, cy);
    x += widths[i] + spacing;
  });
  ctx.restore();
}

function paintTexture(
  texture: THREE.CanvasTexture,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const canvas = texture.image as HTMLCanvasElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx, canvas.width, canvas.height);
  texture.needsUpdate = true;
}

/**
 * A CanvasTexture painted by `draw`. `draw` must be referentially stable
 * (module-level or memoised) — it is re-run once fonts are ready.
 */
export function useCanvasTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
) {
  const invalidate = useThree((state) => state.invalidate);

  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [width, height]);

  useEffect(() => {
    let cancelled = false;
    const paint = () => {
      paintTexture(texture, draw);
      invalidate();
    };
    paint();
    document.fonts?.ready.then(() => {
      if (!cancelled) paint();
    });
    return () => {
      cancelled = true;
    };
  }, [texture, draw, invalidate]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}
