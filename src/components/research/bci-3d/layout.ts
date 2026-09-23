import type { PipelineStageId } from "@/data/bci-experiment";

// Spatial layout for the BCI digital-twin laboratory — REBUILT again for
// the zone-based realism pass. The previous version put every workstation
// in a single straight row along one wall (technically "not a corridor,
// not a ring of platforms", but still visually just a row of identical
// desks — the single biggest complaint about that version). This version
// lays out a real floor plan with distinct AREAS, matching how an actual
// lab would be organized by function, not by pipeline index:
//
//   BACK-LEFT:    EEG acquisition room (its own alcove, partitioned off)
//   BACK-CENTER:  AI/BCI cluster — four workstations facing inward around
//                 the central brain visualization, not a row
//   MID-FLOOR:    ROS 2 + Gazebo robotics control area
//   FRONT:        the robotics workcell (the physical robotic hand)
//
// A visitor's camera path (EEG → AI → Adaptive → ROS2 → Robot) now moves
// through physically different regions of one coherent room, not along a
// single wall. Units are meters, Y up, floor at y = 0.

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

// --- EEG room (back-left alcove) ---
export const EEG_POSITION: Vec3 = [-6.8, 0, -8.8];

// --- AI/BCI cluster (back-center): four desks in two rows, ALL facing +Z
// (the open floor a visitor approaches from) — the central brain sits in
// the gap between the rows as a landmark, not something the desks turn to
// face. (An earlier version rotated the front row 180° to face the core;
// that put their screens/nameplates back-to-camera from every normal
// viewing angle, which — since a flat plane's texture reads mirrored from
// behind even with double-sided rendering — made their labels illegible.
// Keeping every desk on a consistent, camera-facing orientation avoids
// that outright rather than trying to author two-sided nameplate/screen
// textures.) ---
export const CORE_POSITION: Vec3 = [2.8, 0, -7.0];
export const SIGNAL_PROCESSING_POSITION: Vec3 = [0.3, 0, -8.6];
export const FEATURE_EXTRACTION_POSITION: Vec3 = [5.3, 0, -8.6];
export const CNN_LSTM_POSITION: Vec3 = [0.3, 0, -5.4];
export const ADAPTIVE_DECISION_POSITION: Vec3 = [5.3, 0, -5.4];

// --- Robotics control area (mid-floor): ROS 2 and Gazebo face each other
// across the aisle, with a small equipment rack between them. ---
export const ROS2_POSITION: Vec3 = [-2.6, 0, -1.8];
export const GAZEBO_POSITION: Vec3 = [2.6, 0, -1.8];

// --- Robotics workcell (front): the physical robotic hand, closest to a
// visitor entering the room. ---
export const HAND_POSITION: Vec3 = [0, 0, 4.2];

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

// Per-station yaw, applied to the whole StationZone group (desk, screens,
// lamp, stool and nameplate rotate together as one rigid assembly — see
// StationZone.tsx). Every current station keeps its default +Z facing;
// this stays as an explicit, empty override point rather than being
// deleted, since a future zone reshuffle will likely need it again.
export const STATION_YAW: Partial<Record<StationId, number>> = {};

export const ROOM = {
  halfWidth: 10,
  halfDepth: 10.5,
  centerZ: -1.2,
  wallHeight: 3.4,
} as const;

// Yaw (radians) so a group's default forward (-Z) faces a point. Used by
// the central core and any other object that needs to aim at a specific
// point rather than using a fixed station yaw.
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

// Human eye-level shots — a visitor standing inside the lab, moving
// between its distinct areas, not a drone or a strategy-game overhead
// view. BCICameraRig's hard target/position clamp (see that file) is the
// actual safety net for free orbit/pan/zoom, so these just need to be
// reasonable starting points inside ROOM's bounds.
export const CAMERA_SHOTS: Record<CameraMode, CameraShot> = {
  overview: { position: [7.6, 3.4, 7.4], target: [0, 1.3, -4] },
  eeg: { position: [-4.3, 1.95, -6.6], target: [-6.8, 1.4, -8.6] },
  ai: { position: [2.8, 2.9, -2.9], target: [2.8, 1.4, -7.0] },
  adaptive: { position: [4.0, 2.0, -3.1], target: [5.3, 1.35, -5.4] },
  ros2: { position: [-3.6, 2.0, 0.9], target: [-2.6, 1.35, -1.8] },
  robot: { position: [0, 2.2, 7.4], target: [0, 1.3, 4.2] },
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
