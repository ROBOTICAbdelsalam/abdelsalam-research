import * as THREE from "three";
import { CORE, SYSTEM_LAYOUT, type SystemId } from "./sceneConfig";

// The engineered network linking every system to the AI Core. Each path is a
// smooth curve from its system's deck rim (u = 0) down and across the floor
// into the pedestal's second tier (u = 1). Direction says which way energy
// flows, following the site's own headline:
//   PERCEIVE  Sensors → AI Core          (and Data / EEG feeding in)
//   LEARN     AI Core → AI/ML
//   ACT       AI Core → Robotics / Automation
// DECIDE is the core's own internal beat and lives on the label ring.

export type SignalStage = "perceive" | "learn" | "act" | "data" | "bci";

export type SignalPathDef = {
  id: SystemId;
  stage: SignalStage;
  curve: THREE.CatmullRomCurve3;
  /** +1 = toward the core, −1 = away from it. */
  direction: 1 | -1;
  color: string;
  /** Visual weight: the BCI feed is the brightest, per the reference. */
  weight: number;
  /** Curve start / end, for node glows. */
  start: THREE.Vector3;
  end: THREE.Vector3;
};

const STYLE: Record<SystemId, { stage: SignalStage; direction: 1 | -1; color: string; weight: number; bend: number }> = {
  sensors: { stage: "perceive", direction: 1, color: "#3fdcff", weight: 1, bend: 1 },
  data: { stage: "data", direction: 1, color: "#4aa8ff", weight: 1, bend: -1 },
  hmi: { stage: "bci", direction: 1, color: "#5ccbff", weight: 1.35, bend: 1 },
  aiml: { stage: "learn", direction: -1, color: "#8aa6ff", weight: 1, bend: -1 },
  robotics: { stage: "act", direction: -1, color: "#57dcc4", weight: 1, bend: 1 },
  automation: { stage: "act", direction: -1, color: "#7fd0ff", weight: 1.1, bend: -1 },
};

export const SIGNAL_PATHS: readonly SignalPathDef[] = SYSTEM_LAYOUT.map((system) => {
  const style = STYLE[system.id];
  const towardCore = new THREE.Vector3(-system.position.x, 0, -system.position.z).normalize();
  const side = new THREE.Vector3(-towardCore.z, 0, towardCore.x); // perpendicular in the floor plane
  const raised = system.height > 1;

  const start = system.position.clone().addScaledVector(towardCore, system.radius * 0.9);
  start.y = system.height + 0.04;
  const end = towardCore.clone().multiplyScalar(-(CORE.tier2.radius - 0.06));
  end.y = CORE.tier2.top - 0.04;
  // `end` sits on the core's side facing this system.
  end.multiplyScalar(-1).setY(CORE.tier2.top - 0.04);
  end.x = -towardCore.x * (CORE.tier2.radius - 0.06);
  end.z = -towardCore.z * (CORE.tier2.radius - 0.06);

  const span = start.distanceTo(end);
  const at = (t: number, y: number, lateral: number) =>
    new THREE.Vector3().lerpVectors(start, end, t).addScaledVector(side, lateral * span * style.bend).setY(y);

  const points = raised
    ? [
        start,
        start.clone().addScaledVector(towardCore, 0.25).setY(system.height - 0.85),
        at(0.5, 0.3, 0.06),
        at(0.8, 0.2, 0.03),
        end,
      ]
    : [start, at(0.3, 0.13, 0.07), at(0.62, 0.16, 0.06), at(0.86, 0.3, 0.02), end];

  return {
    id: system.id,
    stage: style.stage,
    direction: style.direction,
    color: style.color,
    weight: style.weight,
    start,
    end,
    curve: new THREE.CatmullRomCurve3(points, false, "centripetal"),
  };
});

/** Per-path highlight intensity (1 = resting). Mutated by hover / stage animation. */
export const signalIntensity: Record<SystemId, { value: number }> = {
  aiml: { value: 1 },
  robotics: { value: 1 },
  data: { value: 1 },
  sensors: { value: 1 },
  hmi: { value: 1 },
  automation: { value: 1 },
};
