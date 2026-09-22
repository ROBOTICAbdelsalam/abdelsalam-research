"use client";

import { useCallback } from "react";
import * as THREE from "three";
import { drawSpacedText, resolveFontFamily, useCanvasTexture } from "@/components/3d/textTexture";

// A small physical name plate — the station's label, rendered as crisp
// canvas text (same helper the Hero core uses for its ring labels) rather
// than a floating HTML tag, so it reads as part of the 3D object.

export function Nameplate({
  text,
  sub,
  position,
  width = 1.15,
  color = "#eaf1ff",
  accent = "#5b9dff",
}: {
  text: string;
  sub?: string;
  position: readonly [number, number, number];
  width?: number;
  color?: string;
  accent?: string;
}) {
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = "rgba(8,10,14,0.88)";
      const r = h * 0.16;
      ctx.beginPath();
      ctx.roundRect(4, 4, w - 8, h - 8, r);
      ctx.fill();
      ctx.strokeStyle = "rgba(91,157,255,0.35)";
      ctx.lineWidth = 3;
      ctx.stroke();
      drawSpacedText(ctx, w / 2, sub ? h * 0.4 : h / 2, {
        text: text.toUpperCase(),
        family: resolveFontFamily("--font-jetbrains-mono", "ui-monospace, monospace"),
        size: h * 0.24,
        weight: 700,
        spacing: h * 0.02,
        color,
      });
      if (sub) {
        drawSpacedText(ctx, w / 2, h * 0.72, {
          text: sub,
          family: resolveFontFamily("--font-inter", "system-ui, sans-serif"),
          size: h * 0.15,
          weight: 500,
          color: accent,
        });
      }
    },
    [text, sub, color, accent],
  );
  const texture = useCanvasTexture(384, sub ? 108 : 84, draw);
  const height = width * (sub ? 108 / 384 : 84 / 384);

  return (
    <mesh position={position as unknown as [number, number, number]} renderOrder={6}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
