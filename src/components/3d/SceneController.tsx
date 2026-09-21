"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { STAGES, STAGE_OF_SYSTEM, nodeHighlight, stageActivity, type Stage } from "./interaction";
import type { SystemId } from "./sceneConfig";
import { SIGNAL_PATHS, signalIntensity } from "./signalPaths";

// Drives the shared, allocation-free state every frame:
//  • smooths per-system hover highlights;
//  • runs the PERCEIVE → LEARN → DECIDE → ACT cycle (each stage swells in
//    turn, lighting its signal paths and its label on the core's ring);
//  • composes the final intensity of every signal path.
// With reduced motion the cycle is frozen at a gentle, even level.

const CYCLE_SECONDS = 9.6;

function stageValue(phase: number, index: number) {
  // Distance on the 4-stage loop from the stage's centre, mapped to a soft bump.
  let d = Math.abs(phase - (index + 0.5));
  d = Math.min(d, 4 - d);
  return Math.max(0, 1 - d * 1.15);
}

export function SceneController({ hovered, reducedMotion }: { hovered: SystemId | null; reducedMotion: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const time = useRef(0);

  useEffect(() => {
    invalidate();
  }, [hovered, invalidate]);

  useFrame((_, delta) => {
    let settling = false;

    (Object.keys(nodeHighlight) as SystemId[]).forEach((id) => {
      const target = hovered === id ? 1 : 0;
      const value = nodeHighlight[id].value;
      const next = value + (target - value) * Math.min(1, delta * 7);
      if (Math.abs(next - target) > 0.004) settling = true;
      nodeHighlight[id].value = Math.abs(next - target) <= 0.004 ? target : next;
    });

    if (reducedMotion) {
      STAGES.forEach((stage) => (stageActivity[stage].value = 0.3));
    } else {
      time.current += delta;
      const phase = ((time.current % CYCLE_SECONDS) / CYCLE_SECONDS) * 4;
      STAGES.forEach((stage, i) => (stageActivity[stage].value = stageValue(phase, i)));
    }

    const anyHover = hovered !== null;
    SIGNAL_PATHS.forEach((def) => {
      const stage: Stage = STAGE_OF_SYSTEM[def.id];
      const highlight = nodeHighlight[def.id].value;
      const dim = anyHover ? 1 - 0.35 * (1 - highlight) : 1;
      signalIntensity[def.id].value = (0.72 + stageActivity[stage].value * 0.85) * (1 + highlight * 1.4) * dim;
    });

    if (settling) invalidate();
  });

  return null;
}
