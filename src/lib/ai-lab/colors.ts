import type { SignalTone } from "@/components/ui/SignalNode";
import type { AgentDomain } from "./types";

// The 3D laboratory always renders in the site's dark "control room"
// palette (see globals.css `:root.dark`), regardless of the page's
// light/dark toggle — a research lab reads as a dark, screen-lit space by
// nature, and re-generating GPU textures on every theme toggle isn't worth
// the complexity for what's meant to be an immersive, self-contained scene.
export const LAB_COLORS = {
  background: "#08090b",
  surface: "#101215",
  surfaceRaised: "#16181c",
  foreground: "#f2f3f5",
  muted: "#9aa0aa",
  border: "#1e2126",
  borderStrong: "#2a2e35",
} as const;

export const TONE_HEX: Record<SignalTone, string> = {
  accent: "#5b84ff",
  trace: "#2dd4c8",
  violet: "#9b8aff",
  amber: "#e0a23d",
  gold: "#d4b94a",
  "signal-green": "#3ecf8e",
};

// Each agent domain already owns one fixed tone (see data/ai-lab.ts) — the
// Knowledge Brain (Phase 6) reuses this same mapping so a concept's color
// always agrees with the specialist it's grounded in, instead of inventing
// a second, unrelated color system for knowledge categories.
export const DOMAIN_TONE: Record<AgentDomain, SignalTone> = {
  "artificial-intelligence": "accent",
  robotics: "signal-green",
  "brain-computer-interfaces": "trace",
  "data-science": "violet",
  automation: "amber",
  "software-engineering": "gold",
};

// LAB_COLORS.surface/surfaceRaised above are the site's UI tokens — tuned
// to sit near-black behind text on a screen, not to be lit by a 3D light
// rig. A physical surface with that little albedo reads as a black
// silhouette under any reasonable light, no matter how bright the lights
// are. MATERIAL is a separate, visibly-lit graphite palette for meshes
// (desks, walls, panels) that still needs to look dark and industrial once
// illuminated — background/void colors stay on LAB_COLORS.
export const MATERIAL = {
  floor: "#1c1f25",
  gridLine: "#333944",
  gridLineStrong: "#454c58",
  desk: "#454a54",
  deskAccent: "#5b616d",
  wall: "#23262d",
  beam: "#666c78",
} as const;
