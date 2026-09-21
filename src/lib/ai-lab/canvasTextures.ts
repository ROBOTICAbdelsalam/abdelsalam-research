import * as THREE from "three";
import type { AgentDomain } from "./types";
import { LAB_COLORS } from "./colors";

// Procedural (canvas-drawn) monitor content — no external image assets.
// Each domain gets a distinct, simple motif per the Phase 2 spec. Textures
// are generated once per mount (see AgentMonitor's useMemo) rather than
// redrawn every frame, except the EEG waveform, which is intentionally
// re-drawn on a slow interval to feel like a live-ish signal.

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = LAB_COLORS.background;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = LAB_COLORS.border;
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawNeuralNetwork(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const layers = [3, 5, 4, 2];
  const xs = layers.map((_, i) => 28 + (i * (w - 56)) / (layers.length - 1));
  const nodePositions = layers.map((count, i) =>
    Array.from({ length: count }, (_, j) => ({
      x: xs[i],
      y: 20 + (j * (h - 40)) / Math.max(count - 1, 1),
    }))
  );

  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  for (let i = 0; i < nodePositions.length - 1; i++) {
    for (const a of nodePositions[i]) {
      for (const b of nodePositions[i + 1]) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  for (const layer of nodePositions) {
    for (const n of layer) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawRoboticsSchematic(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const base = { x: w * 0.22, y: h * 0.82 };
  const joints = [
    base,
    { x: w * 0.32, y: h * 0.45 },
    { x: w * 0.62, y: h * 0.32 },
    { x: w * 0.82, y: h * 0.55 },
  ];
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(joints[0].x, joints[0].y);
  for (const j of joints.slice(1)) ctx.lineTo(j.x, j.y);
  ctx.stroke();

  ctx.fillStyle = color;
  for (const j of joints) {
    ctx.beginPath();
    ctx.arc(j.x, j.y, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(joints[3].x, joints[3].y, 14, 0.6, 5.4);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function drawEEGWaveform(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  phase: number
) {
  const channels = 3;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  for (let c = 0; c < channels; c++) {
    const baseline = (h / (channels + 1)) * (c + 1);
    ctx.globalAlpha = 0.55 + c * 0.15;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const t = x / w;
      const y =
        baseline +
        Math.sin(t * 26 + phase * (1 + c * 0.3)) * (4 + c) +
        Math.sin(t * 61 + phase * 1.7) * 2.2;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawDataCharts(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const rand = seededRandom(7);
  const barCount = 8;
  const barW = (w - 24) / barCount - 4;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.65;
  for (let i = 0; i < barCount; i++) {
    const barH = 10 + rand() * (h * 0.45);
    const x = 12 + i * ((w - 24) / barCount);
    ctx.fillRect(x, h * 0.62 - barH, barW, barH);
  }
  ctx.globalAlpha = 1;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 8) {
    const t = x / w;
    const y = h * 0.85 - Math.sin(t * 9) * 10 - t * 14;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawAutomationFlow(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const nodes = [
    { x: w * 0.16, y: h * 0.5 },
    { x: w * 0.42, y: h * 0.25 },
    { x: w * 0.42, y: h * 0.75 },
    { x: w * 0.68, y: h * 0.5 },
    { x: w * 0.9, y: h * 0.5 },
  ];
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 3],
    [3, 4],
  ];
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  for (const [a, b] of edges) {
    ctx.beginPath();
    ctx.moveTo(nodes[a].x, nodes[a].y);
    ctx.lineTo(nodes[b].x, nodes[b].y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = color;
  for (const n of nodes) {
    ctx.fillRect(n.x - 6, n.y - 6, 12, 12);
  }
}

function drawSoftwareArchitecture(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  const rand = seededRandom(3);
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1.5;
  const lineCount = 7;
  for (let i = 0; i < lineCount; i++) {
    const y = 14 + i * ((h - 28) / lineCount);
    const width = w * (0.25 + rand() * 0.55);
    const indent = rand() > 0.6 ? 22 : 8;
    ctx.beginPath();
    ctx.moveTo(indent, y);
    ctx.lineTo(indent + width, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

const DRAW_BY_DOMAIN: Record<
  AgentDomain,
  (ctx: CanvasRenderingContext2D, w: number, h: number, color: string) => void
> = {
  "artificial-intelligence": drawNeuralNetwork,
  robotics: drawRoboticsSchematic,
  "brain-computer-interfaces": (ctx, w, h, color) => drawEEGWaveform(ctx, w, h, color, 0),
  "data-science": drawDataCharts,
  automation: drawAutomationFlow,
  "software-engineering": drawSoftwareArchitecture,
};

export function createAgentScreenTexture(domain: AgentDomain, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawBackdrop(ctx, canvas.width, canvas.height);
  DRAW_BY_DOMAIN[domain](ctx, canvas.width, canvas.height, color);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function createEEGTexture(color: string, phase: number) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawBackdrop(ctx, canvas.width, canvas.height);
  drawEEGWaveform(ctx, canvas.width, canvas.height, color, phase);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// The Research Center's display panel (Phase 7) — a compact, technical
// readout of the one real research item this site documents, drawn the
// same procedural way as every other screen in the lab (no external image,
// no literal "book" or "paper" texture). `status`/`focusAreas` are passed
// in from data/ai-lab-research.ts so this never drifts from the real data.
export function createResearchDisplayTexture(title: string, status: string, focusAreas: string[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 384;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawBackdrop(ctx, canvas.width, canvas.height);

  ctx.fillStyle = "#2dd4c8";
  ctx.font = "500 12px monospace";
  ctx.fillText("RESEARCH INTELLIGENCE", 18, 30);

  ctx.strokeStyle = LAB_COLORS.borderStrong;
  ctx.beginPath();
  ctx.moveTo(18, 42);
  ctx.lineTo(canvas.width - 18, 42);
  ctx.stroke();

  ctx.fillStyle = LAB_COLORS.foreground;
  ctx.font = "600 15px monospace";
  wrapText(ctx, title.toUpperCase(), 18, 70, canvas.width - 36, 20, 4);

  ctx.fillStyle = LAB_COLORS.muted;
  ctx.font = "500 11px monospace";
  wrapText(ctx, status, 18, 168, canvas.width - 36, 16, 2);

  ctx.fillStyle = "#2dd4c8";
  ctx.font = "500 11px monospace";
  ctx.fillText("FOCUS AREAS", 18, 220);

  ctx.fillStyle = LAB_COLORS.muted;
  ctx.font = "500 12px monospace";
  focusAreas.slice(0, 4).forEach((area, i) => {
    const y = 246 + i * 26;
    ctx.fillStyle = "#2dd4c8";
    ctx.beginPath();
    ctx.arc(24, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = LAB_COLORS.muted;
    ctx.fillText(area, 36, y);
  });

  ctx.strokeStyle = LAB_COLORS.borderStrong;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

// The Project Center's schematic display (Phase 8) — an engineering-
// workbench readout: project title, category and its real technologies,
// drawn the same procedural way as every other screen in the lab. Gold
// accent instead of Research's teal, so the two read as visually distinct
// stations at a glance.
export function createProjectDisplayTexture(title: string, category: string, technologies: string[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawBackdrop(ctx, canvas.width, canvas.height);

  ctx.fillStyle = "#d4b94a";
  ctx.font = "500 12px monospace";
  ctx.fillText("PROJECT WORKSPACE", 18, 30);

  ctx.strokeStyle = LAB_COLORS.borderStrong;
  ctx.beginPath();
  ctx.moveTo(18, 42);
  ctx.lineTo(canvas.width - 18, 42);
  ctx.stroke();

  ctx.fillStyle = LAB_COLORS.foreground;
  ctx.font = "600 15px monospace";
  wrapText(ctx, title.toUpperCase(), 18, 70, canvas.width - 36, 20, 3);

  ctx.fillStyle = LAB_COLORS.muted;
  ctx.font = "500 11px monospace";
  wrapText(ctx, category, 18, 140, canvas.width - 36, 16, 2);

  ctx.fillStyle = "#d4b94a";
  ctx.font = "500 11px monospace";
  ctx.fillText("TECHNOLOGIES", 18, 192);

  ctx.fillStyle = LAB_COLORS.muted;
  ctx.font = "500 12px monospace";
  technologies.slice(0, 4).forEach((tech, i) => {
    const y = 218 + i * 24;
    ctx.fillStyle = "#d4b94a";
    ctx.beginPath();
    ctx.arc(24, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = LAB_COLORS.muted;
    ctx.fillText(tech, 36, y);
  });

  ctx.strokeStyle = LAB_COLORS.borderStrong;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) {
  const words = text.split(" ");
  let line = "";
  let lineCount = 0;
  let cursorY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, cursorY);
      line = word;
      cursorY += lineHeight;
      lineCount += 1;
      if (lineCount >= maxLines - 1) {
        const rest = words.slice(words.indexOf(word)).join(" ");
        ctx.fillText(rest.length > 40 ? `${rest.slice(0, 40)}…` : rest, x, cursorY);
        return;
      }
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, cursorY);
}

export function createCommandDisplayTexture(agentLabels: string[], mode: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 288;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  drawBackdrop(ctx, canvas.width, canvas.height);

  ctx.fillStyle = LAB_COLORS.foreground;
  ctx.font = "600 20px monospace";
  ctx.fillText("ABD AI LAB — COMMAND CENTER", 20, 34);

  ctx.fillStyle = "#2dd4c8";
  ctx.font = "500 14px monospace";
  ctx.fillText(`MODE — ${mode.toUpperCase()}`, 20, 60);

  const cols = 2;
  agentLabels.forEach((label, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = 24 + col * (canvas.width / cols);
    const y = 100 + row * 44;
    ctx.fillStyle = "#3ecf8e";
    ctx.beginPath();
    ctx.arc(x, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = LAB_COLORS.muted;
    ctx.font = "500 13px monospace";
    ctx.fillText(label.toUpperCase(), x + 14, y);
  });

  ctx.strokeStyle = LAB_COLORS.borderStrong;
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
