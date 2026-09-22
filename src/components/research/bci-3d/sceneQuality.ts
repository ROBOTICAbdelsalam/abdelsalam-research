"use client";

import { createContext, useContext } from "react";

// Minimal, feature-local quality context (mirrors the pattern in
// src/components/3d/sceneContext.ts) — lets leaf components like Screen
// scale their own cost down on the simplified mobile tier without each
// station needing to thread the flag through by hand.
export type SceneQuality = { mobile: boolean };

export const SceneQualityContext = createContext<SceneQuality>({ mobile: false });

export function useSceneQuality() {
  return useContext(SceneQualityContext);
}
