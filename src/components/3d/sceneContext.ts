"use client";

import { createContext, useContext } from "react";
import type { SystemId } from "./sceneConfig";
import type { SceneMode } from "./sceneView";

// Settings every scene component needs. Provided *inside* the Canvas (React
// context does not cross the R3F reconciler boundary on its own).
export type SceneSettings = {
  mode: SceneMode;
  reducedMotion: boolean;
  /** Reports which system the pointer is over (or null). */
  onHover: (id: SystemId | null) => void;
};

export const SceneSettingsContext = createContext<SceneSettings>({
  mode: "full",
  reducedMotion: false,
  onHover: () => {},
});

export function useSceneSettings() {
  return useContext(SceneSettingsContext);
}
