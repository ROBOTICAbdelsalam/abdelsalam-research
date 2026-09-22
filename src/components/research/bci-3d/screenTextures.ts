import { mulberry32 } from "@/components/3d/random";
import { resolveFontFamily } from "@/components/3d/textTexture";
import type { GestureDef, GestureId } from "@/data/bci-experiment";

// Canvas-drawn monitor content for the BCI lab — same imperative-canvas
// technique as src/lib/ai-lab/canvasTextures.ts (plain 2D context, no
// external images), specialized to this pipeline's own stages instead of
// reusing the AI Lab's generic per-domain motifs. Every function here draws
// into an already-cleared canvas; Screen.tsx owns the texture lifecycle.

export const PANEL = {
  bg: "#0a0d12",
  grid: "#141922",
  border: "#232a36",
  text: "#c7d0e0",
  muted: "#6c7688",
  accent: "#5b9dff",
  cyan: "#2dd4c8",
  amber: "#e0a23d",
  danger: "#e0575a",
} as const;

function mono(size: number, weight = 500) {
  return `${weight} ${size}px ${resolveFontFamily("--font-jetbrains-mono", "ui-monospace, monospace")}`;
}

export function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = PANEL.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = PANEL.grid;
  ctx.lineWidth = 1;
  const step = Math.max(16, Math.round(w / 24));
  for (let x = 0; x <= w; x += step) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
    ctx.stroke();
  }
}

export function drawChrome(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  title: string,
  footer?: string,
  accent: string = PANEL.accent,
) {
  ctx.fillStyle = accent;
  ctx.font = mono(Math.round(h * 0.052), 600);
  ctx.fillText(title, w * 0.035, h * 0.09);
  ctx.strokeStyle = PANEL.border;
  ctx.beginPath();
  ctx.moveTo(w * 0.035, h * 0.13);
  ctx.lineTo(w * 0.965, h * 0.13);
  ctx.stroke();
  if (footer) {
    ctx.fillStyle = PANEL.muted;
    ctx.font = mono(Math.round(h * 0.038));
    ctx.fillText(footer, w * 0.035, h * 0.965);
  }
  ctx.strokeStyle = PANEL.border;
  ctx.strokeRect(1, 1, w - 2, h - 2);
}

export function drawWaveform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { top: number; bottom: number; channels: number; color: string; phase: number; amplitude: number; seed: number; jitter?: number },
) {
  const { top, bottom, channels, color, phase, amplitude, seed, jitter = 1 } = opts;
  const rand = mulberry32(seed);
  const rowH = (bottom - top) / channels;
  ctx.lineWidth = 1.3;
  for (let c = 0; c < channels; c++) {
    const baseline = top + rowH * (c + 0.5);
    const f1 = 18 + rand() * 10;
    const f2 = 48 + rand() * 30;
    const noise = rand() * 0.6 + 0.4;
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.5 + (c % 3) * 0.14;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const t = x / w;
      const y =
        baseline +
        Math.sin(t * f1 + phase * (1 + c * 0.15)) * amplitude * 0.7 +
        Math.sin(t * f2 + phase * 1.9 + c) * amplitude * 0.3 * noise * jitter;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

export function drawEpochGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { top: number; total: number; valid: number; color: string; seed: number },
) {
  const { top, total, valid, color, seed } = opts;
  const rand = mulberry32(seed);
  const cols = 10;
  const rows = Math.ceil(total / cols);
  const pad = w * 0.035;
  const cellW = (w - pad * 2) / cols - 4;
  const cellH = Math.min(14, ((h - top) - 8) / rows - 4);
  let drawnValid = 0;
  for (let i = 0; i < total; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (cellW + 4);
    const y = top + row * (cellH + 4);
    const isValid = drawnValid < valid && rand() > 0.12;
    if (isValid) drawnValid++;
    ctx.fillStyle = isValid ? color : PANEL.border;
    ctx.globalAlpha = isValid ? 0.85 : 0.5;
    ctx.fillRect(x, y, cellW, cellH);
  }
  ctx.globalAlpha = 1;
}

export function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { top: number; bottom: number; color: string; seed: number; cols?: number; rows?: number },
) {
  const { top, bottom, color, seed, cols = 8, rows = 6 } = opts;
  const rand = mulberry32(seed);
  const pad = w * 0.06;
  const cw = (w - pad * 2) / cols;
  const ch = (bottom - top) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = rand();
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.12 + v * 0.75;
      ctx.fillRect(pad + c * cw, top + r * ch, cw - 1.5, ch - 1.5);
    }
  }
  ctx.globalAlpha = 1;
}

export function drawScatter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { top: number; bottom: number; colors: string[]; seed: number; highlight: number },
) {
  const { top, bottom, colors, seed, highlight } = opts;
  const rand = mulberry32(seed);
  const cx = w * 0.5;
  const cy = (top + bottom) / 2;
  const rx = w * 0.42;
  const ry = (bottom - top) * 0.42;
  colors.forEach((color, ci) => {
    const angle = (ci / colors.length) * Math.PI * 2;
    const clusterX = cx + Math.cos(angle) * rx * 0.55;
    const clusterY = cy + Math.sin(angle) * ry * 0.55;
    const n = ci === highlight ? 16 : 9;
    for (let i = 0; i < n; i++) {
      const px = clusterX + (rand() - 0.5) * rx * 0.55;
      const py = clusterY + (rand() - 0.5) * ry * 0.55;
      ctx.fillStyle = color;
      ctx.globalAlpha = ci === highlight ? 0.95 : 0.35;
      ctx.beginPath();
      ctx.arc(px, py, ci === highlight ? 3.2 : 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
}

export function drawConfidenceBars(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  opts: { top: number; bottom: number; gestures: readonly GestureDef[]; activeId: GestureId | null; confidence: number | null; threshold: number },
) {
  const { top, bottom, gestures, activeId, confidence, threshold } = opts;
  const rowH = (bottom - top) / gestures.length;
  const barX = w * 0.32;
  const barMaxW = w * 0.6;
  gestures.forEach((g, i) => {
    const y = top + rowH * i + rowH * 0.5;
    const isActive = g.id === activeId;
    const value = isActive && confidence !== null ? confidence : 0.08 + ((i * 37) % 13) / 100;
    ctx.fillStyle = PANEL.text;
    ctx.font = mono(Math.round(rowH * 0.34));
    ctx.fillText(g.label, w * 0.035, y + rowH * 0.12);
    ctx.fillStyle = PANEL.border;
    ctx.fillRect(barX, y - rowH * 0.16, barMaxW, rowH * 0.32);
    ctx.fillStyle = isActive ? (value >= threshold ? PANEL.cyan : PANEL.danger) : PANEL.muted;
    ctx.globalAlpha = isActive ? 1 : 0.5;
    ctx.fillRect(barX, y - rowH * 0.16, barMaxW * value, rowH * 0.32);
    ctx.globalAlpha = 1;
  });
  const gateX = barX + barMaxW * threshold;
  ctx.strokeStyle = PANEL.amber;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(gateX, top);
  ctx.lineTo(gateX, bottom);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawKeyValueRows(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: number,
  rows: { label: string; value: string; color?: string }[],
) {
  const rowH = Math.min(46, (h - top - h * 0.06) / rows.length);
  rows.forEach((row, i) => {
    const y = top + i * rowH;
    ctx.fillStyle = PANEL.muted;
    ctx.font = mono(Math.round(rowH * 0.4));
    ctx.fillText(row.label, w * 0.035, y + rowH * 0.42);
    ctx.fillStyle = row.color ?? PANEL.text;
    ctx.font = mono(Math.round(rowH * 0.5), 700);
    ctx.fillText(row.value, w * 0.035, y + rowH * 0.82);
  });
}

export function drawPipelineChain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: number,
  bottom: number,
  labels: string[],
  activeIndex: number,
  color: string,
) {
  const n = labels.length;
  const pad = w * 0.05;
  const boxW = (w - pad * 2) / n - 10;
  const y = (top + bottom) / 2;
  const boxH = Math.min(30, bottom - top);
  labels.forEach((label, i) => {
    const x = pad + i * ((w - pad * 2) / n);
    const active = i === activeIndex;
    ctx.fillStyle = active ? color : PANEL.grid;
    ctx.strokeStyle = active ? color : PANEL.border;
    ctx.globalAlpha = active ? 0.28 : 1;
    ctx.fillRect(x, y - boxH / 2, boxW, boxH);
    ctx.globalAlpha = 1;
    ctx.strokeRect(x, y - boxH / 2, boxW, boxH);
    ctx.fillStyle = active ? color : PANEL.muted;
    ctx.font = mono(Math.round(boxH * 0.34), active ? 700 : 500);
    ctx.textAlign = "center";
    ctx.fillText(label, x + boxW / 2, y + boxH * 0.14);
    ctx.textAlign = "left";
    if (i < n - 1) {
      ctx.strokeStyle = PANEL.border;
      ctx.beginPath();
      ctx.moveTo(x + boxW, y);
      ctx.lineTo(x + boxW + 10, y);
      ctx.stroke();
    }
  });
}

export function drawLogLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: number,
  lines: { text: string; active?: boolean }[],
  color: string,
) {
  const rowH = Math.min(24, (h - top - h * 0.05) / lines.length);
  lines.forEach((line, i) => {
    const y = top + i * rowH + rowH * 0.7;
    ctx.fillStyle = line.active ? color : PANEL.muted;
    ctx.font = mono(Math.round(rowH * 0.5), line.active ? 700 : 500);
    const prefix = line.active ? "▶ " : "  ";
    ctx.fillText(prefix + line.text, w * 0.035, y);
  });
}
