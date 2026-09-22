import type { PipelineStageId } from "@/data/bci-experiment";

// Spatial layout for the BCI digital-twin laboratory — REBUILT for the
// realism pass (see the physical-lab rebuild notes). Previous layout: a
// front-to-back "pipeline spine" with stations as isolated glowing circular
// pads. New layout: a real open-plan lab room, workstations against one
// back wall in pipeline left-to-right order (matching a visitor's natural
// reading direction), a central BCI visualization as a walk-up landmark on
// the open floor, and a separate robotics workcell island — not a corridor,
// not a ring of platforms. Units are meters, Y up, floor at y = 0.

export type Vec3 = readonly [number, number, number];

export type StationId =
  | "eeg"
  | "signal-processing"
  | "feature-extraction"
  | "cnn-lstm"
  | "adaptive-decision"
  | "ros2"
  | "gazebo"
  | "hand";

// Desk-row stations sit against the back wall (z = DESK_ROW_Z), left to
// right in pipeline order. Desks are real-world-scale (the Metal Office
// Desk GLB is 2m wide), so a 3m pitch gives a 1m walking gap between them.
export const DESK_ROW_Z = -7.0;
const DESK_PITCH = 3.0;
const DESK_ROW_X0 = -10.5; // EEG desk's x; each later station adds DESK_PITCH

export const EEG_POSITION: Vec3 = [DESK_ROW_X0, 0, DESK_ROW_Z];
export const SIGNAL_PROCESSING_POSITION: Vec3 = [DESK_ROW_X0 + DESK_PITCH, 0, DESK_ROW_Z];
export const FEATURE_EXTRACTION_POSITION: Vec3 = [DESK_ROW_X0 + DESK_PITCH * 2, 0, DESK_ROW_Z];
export const CNN_LSTM_POSITION: Vec3 = [DESK_ROW_X0 + DESK_PITCH * 3, 0, DESK_ROW_Z];
export const ADAPTIVE_DECISION_POSITION: Vec3 = [DESK_ROW_X0 + DESK_PITCH * 4, 0, DESK_ROW_Z];
export const ROS2_POSITION: Vec3 = [DESK_ROW_X0 + DESK_PITCH * 5, 0, DESK_ROW_Z];
export const GAZEBO_POSITION: Vec3 = [DESK_ROW_X0 + DESK_PITCH * 6, 0, DESK_ROW_Z];

// The central BCI visualization: a walk-up landmark on the open floor,
// roughly centered over the desk row, well forward of the wall.
export const CORE_POSITION: Vec3 = [-2.5, 0, -2.4];

// The robotics workcell: a separate island to the right, off the wall row
// entirely — "FAR RIGHT: robotic hand / robot workcell".
export const HAND_POSITION: Vec3 = [9.6, 0, 1.4];

export const STATION_POSITIONS: Record<StationId, Vec3> = {
  eeg: EEG_POSITION,
  "signal-processing": SIGNAL_PROCESSING_POSITION,
  "feature-extraction": FEATURE_EXTRACTION_POSITION,
  "cnn-lstm": CNN_LSTM_POSITION,
  "adaptive-decision": ADAPTIVE_DECISION_POSITION,
  ros2: ROS2_POSITION,
  gazebo: GAZEBO_POSITION,
  hand: HAND_POSITION,
};

export const ROOM = {
  halfWidth: 12.6,
  halfDepth: 8.2,
  centerZ: -1.0,
  // A real institutional-lab ceiling height, not a warehouse — see the
  // lighting rebuild for how fixture intensities were recalibrated to this
  // much shorter throw distance than the previous 6m version.
  wallHeight: 3.4,
} as const;

// Yaw (radians) so a group's default forward (-Z) faces a point. Still used
// by the central core and the robotics workcell (which face inward, toward
// the room, from off-wall positions) — the desk-row stations no longer need
// it, since they all face the same way (+Z, into the room) by construction.
export function facing(from: Vec3, to: Vec3) {
  return Math.atan2(from[0] - to[0], from[2] - to[2]);
}

export type CameraMode = "overview" | "eeg" | "ai" | "adaptive" | "ros2" | "robot";

export const CAMERA_MODES: readonly { id: CameraMode; label: string }[] = [
  { id: "overview", label: "Lab Overview" },
  { id: "eeg", label: "EEG Focus" },
  { id: "ai", label: "AI Focus" },
  { id: "adaptive", label: "Adaptive Decision" },
  { id: "ros2", label: "ROS2 Focus" },
  { id: "robot", label: "Robot Focus" },
];

export type CameraShot = { position: Vec3; target: Vec3 };

// Human eye-level shots — a visitor standing inside the lab, not a drone or
// a strategy-game overhead view. Kept comfortably inside ROOM's bounds;
// BCICameraRig's hard target/position clamp is the actual safety net for
// free orbit/pan/zoom (see that file), so these don't need the exhaustive
// per-azimuth derivation the previous corridor layout required — this room
// is wide and shallow, not long and narrow, so the clamp alone is enough.
export const CAMERA_SHOTS: Record<CameraMode, CameraShot> = {
  overview: { position: [-1, 2.5, 6.2], target: [-1, 1.35, -3.2] },
  eeg: { position: [-8.6, 1.95, -3.1], target: [DESK_ROW_X0, 1.35, DESK_ROW_Z - 0.6] },
  ai: {
    position: [DESK_ROW_X0 + DESK_PITCH * 2, 2.1, -1.6],
    target: [DESK_ROW_X0 + DESK_PITCH * 2, 1.35, DESK_ROW_Z - 0.3],
  },
  adaptive: {
    position: [ADAPTIVE_DECISION_POSITION[0] - 1.2, 2.0, -1.9],
    target: [ADAPTIVE_DECISION_POSITION[0], 1.35, DESK_ROW_Z - 0.3],
  },
  ros2: {
    position: [ROS2_POSITION[0] - 0.8, 2.1, -1.6],
    target: [ROS2_POSITION[0], 1.35, DESK_ROW_Z - 0.3],
  },
  robot: { position: [7.8, 2.1, 3.6], target: [HAND_POSITION[0], 1.3, HAND_POSITION[2]] },
};

// Which camera preset the guided tour switches to while a given pipeline
// stage is active (section 19 — start drives the camera through the
// stations in pipeline order).
export const STAGE_CAMERA: Record<PipelineStageId, CameraMode> = {
  eeg: "eeg",
  preprocessing: "ai",
  features: "ai",
  "cnn-lstm": "ai",
  "adaptive-gate": "adaptive",
  ros2: "ros2",
  moveit2: "ros2",
  gazebo: "robot",
  robot: "robot",
};

export const CAMERA_LIMITS = {
  minDistance: 1.8,
  // Comfortably above every preset's own baseline radius so settling into
  // free orbit right after a guided transition never causes a re-clamp
  // jump. The room's hard position/target clamp (BCICameraRig) is what
  // actually keeps the camera inside the walls at this distance.
  maxDistance: 13,
  minPolarAngle: Math.PI * 0.1,
  maxPolarAngle: Math.PI * 0.49,
};
