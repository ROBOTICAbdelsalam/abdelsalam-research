import type { SystemId } from "./sceneConfig";

// Mutable, allocation-free state shared between the scene's components. Held
// as plain `{ value }` objects (like shader uniforms) so highlights and the
// PERCEIVE → LEARN → DECIDE → ACT cycle can animate every frame without
// triggering React re-renders.

export type Stage = "perceive" | "learn" | "decide" | "act";
export const STAGES: readonly Stage[] = ["perceive", "learn", "decide", "act"];

/** 0..1 — how "lit" each system is by hover / focus (smoothed). */
export const nodeHighlight: Record<SystemId, { value: number }> = {
  aiml: { value: 0 },
  robotics: { value: 0 },
  data: { value: 0 },
  sensors: { value: 0 },
  hmi: { value: 0 },
  automation: { value: 0 },
};

/** 0..1 — how active each stage of the cycle currently is. */
export const stageActivity: Record<Stage, { value: number }> = {
  perceive: { value: 0 },
  learn: { value: 0 },
  decide: { value: 0 },
  act: { value: 0 },
};

/** Which stage of the cycle each system belongs to. */
export const STAGE_OF_SYSTEM: Record<SystemId, Stage> = {
  sensors: "perceive",
  data: "perceive",
  hmi: "perceive",
  aiml: "learn",
  robotics: "act",
  automation: "act",
};

export type Activity = { value: number };
