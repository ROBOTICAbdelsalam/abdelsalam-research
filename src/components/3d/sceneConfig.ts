import * as THREE from "three";

// ---------------------------------------------------------------------------
// Reference-frame calibration.
//
// The target composition is a single 1536×1024 render. Instead of eyeballing
// world positions, the scene is built around a *calibrated reference camera*
// (fixed FOV / pitch / distance) and every anchor below is a pixel measured
// off that reference. World positions are then solved by inverse-projecting
// those pixels onto each platform's plane — so the 3D scene lines up with the
// reference by construction, at any canvas size (a canvas is just a
// sub-rectangle of the reference frame; see sceneView.ts).
// ---------------------------------------------------------------------------

export const REF = { w: 1536, h: 1024 } as const;

export const CAMERA = {
  fov: 34,
  pitchDeg: 27,
  near: 0.1,
  far: 120,
  // The glass sphere is the calibration standard: 1 world unit of radius
  // measures 135px in the reference at its centre (948, 420).
  sphere: { px: 948, py: 420, rpx: 135 },
  // Height of the sphere centre above the floor, tuned so the pedestal's
  // floor centre lands at ~(948, 708) as in the reference.
  sphereHeight: 2.62,
} as const;

// The reference camera looks at the sphere centre; the sphere is *off* the
// frame centre in the reference, so the frame is shifted (off-axis) by this.
export const CAMERA_TARGET_Y = CAMERA.sphereHeight;

const FRAME_SHIFT = {
  x: CAMERA.sphere.px - REF.w / 2,
  y: CAMERA.sphere.py - REF.h / 2,
} as const;

const HALF_FOV_TAN = Math.tan(THREE.MathUtils.degToRad(CAMERA.fov / 2));
const PITCH = THREE.MathUtils.degToRad(CAMERA.pitchDeg);
// Distance so a radius-1 sphere spans `rpx` reference pixels.
export const CAMERA_DISTANCE = REF.h / 2 / HALF_FOV_TAN / CAMERA.sphere.rpx;

export type ReferenceCamera = THREE.PerspectiveCamera & { manual: boolean };

/** Builds the calibrated camera. `manual` stops R3F from overriding the projection. */
export function buildReferenceCamera(): ReferenceCamera {
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, REF.w / REF.h, CAMERA.near, CAMERA.far);
  camera.position.set(
    0,
    CAMERA.sphereHeight + CAMERA_DISTANCE * Math.sin(PITCH),
    CAMERA_DISTANCE * Math.cos(PITCH),
  );
  camera.lookAt(0, CAMERA.sphereHeight, 0);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();
  return Object.assign(camera, { manual: true });
}

/**
 * Points the camera at the rectangle of the reference frame that a canvas
 * covers: (rx, ry) is the reference-pixel position of the canvas' top-left,
 * (rw, rh) its size in reference pixels.
 */
export function applyReferenceView(
  camera: THREE.PerspectiveCamera,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
) {
  camera.aspect = REF.w / REF.h;
  camera.setViewOffset(REF.w, REF.h, rx - FRAME_SHIFT.x, ry - FRAME_SHIFT.y, rw, rh);
  camera.updateProjectionMatrix();
}

// A throwaway camera used only to solve reference pixels → world positions.
const solverCamera = buildReferenceCamera();

/** World-space point under reference pixel (px, py) on the horizontal plane y = height. */
export function refToWorld(px: number, py: number, height: number): THREE.Vector3 {
  const ndc = new THREE.Vector3(
    (px - FRAME_SHIFT.x - REF.w / 2) / (REF.w / 2),
    -((py - FRAME_SHIFT.y - REF.h / 2) / (REF.h / 2)),
    0.5,
  ).unproject(solverCamera);
  const dir = ndc.sub(solverCamera.position).normalize();
  const t = (height - solverCamera.position.y) / dir.y;
  return solverCamera.position.clone().add(dir.multiplyScalar(t));
}

/** Reference pixels per world unit at a given view depth (for sizing from reference measurements). */
export function refPixelsPerUnitAt(point: THREE.Vector3): number {
  const forward = new THREE.Vector3(0, -Math.sin(PITCH), -Math.cos(PITCH));
  const depth = point.clone().sub(solverCamera.position).dot(forward);
  return REF.h / 2 / HALF_FOV_TAN / depth;
}

// ---------------------------------------------------------------------------
// The six systems. `ref` is the centre of each platform's top face in the
// reference (px); `height` is the platform top's height above the floor in
// world units; `widthPx` is the platform's measured width in the reference.
// AI/ML and Robotics sit on tall columns (as in the reference); the four
// front/side systems sit on low discs.
// ---------------------------------------------------------------------------

export type SystemId = "aiml" | "robotics" | "data" | "sensors" | "hmi" | "automation";

export type SystemDef = {
  id: SystemId;
  title: string;
  subtitle: string;
  bullets: readonly string[];
  ref: readonly [number, number];
  height: number;
  widthPx: number;
  /** Height of the prop standing on the deck, in reference pixels — sizes the pointer hit-volume. */
  propHeightPx: number;
  // Accent tint for edge rings / rim light — applied at low intensity; the
  // reference itself is predominantly blue with amber accents.
  tint: string;
};

export const SYSTEMS: readonly SystemDef[] = [
  {
    id: "aiml",
    title: "AI / ML",
    subtitle: "Intelligence",
    bullets: ["Deep Learning", "Computer Vision", "NLP / LLMs", "Reinforcement Learning"],
    ref: [767, 290],
    height: 2.3,
    widthPx: 185,
    propHeightPx: 140,
    tint: "#8b7bff",
  },
  {
    id: "robotics",
    title: "ROBOTICS",
    subtitle: "Action",
    bullets: ["ROS2", "Control & Kinematics", "Simulation (Gazebo)", "Perception & Navigation"],
    ref: [1285, 345],
    height: 2.25,
    widthPx: 225,
    propHeightPx: 170,
    tint: "#34d399",
  },
  {
    id: "data",
    title: "DATA",
    subtitle: "Insight",
    bullets: ["Data Engineering", "ETL / ELT", "Cloud & Databricks", "Analytics & Insights"],
    ref: [630, 530],
    height: 0.4,
    widthPx: 220,
    propHeightPx: 145,
    tint: "#3b82f6",
  },
  {
    id: "sensors",
    title: "SENSORS",
    subtitle: "Perception",
    bullets: ["Perception", "Sensor Fusion", "Computer Vision", "Real-time Systems"],
    ref: [1356, 585],
    height: 0.5,
    widthPx: 260,
    propHeightPx: 145,
    tint: "#22d3ee",
  },
  {
    id: "hmi",
    title: "HUMAN–MACHINE INTERACTION",
    subtitle: "Brain-computer interfaces",
    bullets: ["Brain-Computer Interfaces", "EEG Signal Processing", "Adaptive AI", "Assistive Systems"],
    ref: [590, 790],
    height: 0.3,
    widthPx: 275,
    propHeightPx: 245,
    tint: "#38bdf8",
  },
  {
    id: "automation",
    title: "AUTOMATION",
    subtitle: "Efficiency & Impact",
    bullets: ["Autonomous Systems", "AI Agents", "Real-world Deployment", "Efficiency & Impact"],
    ref: [1280, 810],
    height: 0.3,
    widthPx: 345,
    propHeightPx: 140,
    tint: "#f59e0b",
  },
];

/** Glass HUD card rectangles in the reference frame (x, y, width, height). */
export type CardRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Fractions of the card width kept clear of text (where a 3D object overlaps the panel, as in the reference). */
  clearLeft?: number;
  clearRight?: number;
};

export const CARD_RECTS: Record<SystemId, CardRect> = {
  aiml: { x: 590, y: 120, w: 285, h: 150, clearRight: 0.55 },
  robotics: { x: 1020, y: 165, w: 155, h: 135 },
  data: { x: 480, y: 365, w: 155, h: 160, clearRight: 0.08 },
  sensors: { x: 1291, y: 435, w: 220, h: 160, clearLeft: 0.34 },
  hmi: { x: 395, y: 615, w: 290, h: 155, clearRight: 0.5 },
  automation: { x: 1265, y: 655, w: 200, h: 165, clearLeft: 0.27 },
};

export type SystemLayout = SystemDef & {
  position: THREE.Vector3;
  /** Platform radius in world units, derived from the measured reference width. */
  radius: number;
};

export const SYSTEM_LAYOUT: readonly SystemLayout[] = SYSTEMS.map((system) => {
  const position = refToWorld(system.ref[0], system.ref[1], system.height);
  return {
    ...system,
    position,
    radius: system.widthPx / 2 / refPixelsPerUnitAt(position),
  };
});

/**
 * World units per reference pixel at a system's platform — `u` horizontally,
 * `v` vertically (accounts for the camera pitch foreshortening). Lets each
 * system's props be dimensioned straight from pixels measured off the
 * reference.
 */
export function nodeScale(system: SystemLayout) {
  const perPixel = 1 / refPixelsPerUnitAt(system.position);
  return { u: perPixel, v: perPixel / Math.cos(PITCH) };
}

// The AI Core, in world units (glass sphere radius = 1). Proportions are
// measured off the reference: ring ≈ 1.83× the sphere radius, pedestal base
// ≈ 1.35×, pedestal about as tall as the sphere is wide.
export const CORE = {
  sphereRadius: 1,
  centerY: CAMERA.sphereHeight,
  ringRadius: 1.83,
  ringY: CAMERA.sphereHeight - 0.5,
  base: { radius: 1.36, top: 0.42 },
  tier2: { radius: 1.16, top: 0.68 },
  tier1: { radius: 0.96, top: 0.95 },
  plate: { radius: 0.64, top: 1.45 },
} as const;

export const SCENE_COLORS = {
  background: "#050914",
  floor: "#070c1a",
} as const;
