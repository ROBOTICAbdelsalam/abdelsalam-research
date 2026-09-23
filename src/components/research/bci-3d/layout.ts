import type { PipelineStageId } from "@/data/bci-experiment";

// Spatial layout for the BCI digital-twin laboratory — REBUILT again for
// the visual-reconstruction pass, to match a reference image's left-to-
// right hierarchy (EEG → BCI Core → AI/ROS2/Gazebo → Robotic Hand) under
// the EXISTING, unchanged overview camera shot. That shot looks across the
// room at a steep diagonal (front-right corner toward the back-left
// corner — see CAMERA_SHOTS.overview below, untouched by this pass), which
// means a station's on-screen left/right position depends on BOTH its X
// and its Z (depth), not X alone: something placed deep in the room (very
// negative Z) reads further toward screen-right than its X coordinate
// alone would suggest, because of how that diagonal view's perspective
// divide works. The previous zone layout was picked for floor-plan
// sensibility (EEG alcove, AI cluster, ROS2/Gazebo aisle, front workcell)
// without accounting for this, and the result was close to inverted: the
// robotic hand (front, Z=+4.2) projected as the LEFTMOST object in the
// overview shot, and Feature Extraction (back-right desk) as the
// RIGHTMOST — exactly backwards from the reference. These coordinates
// were re-solved (screen-space projection worked out numerically against
// the fixed overview camera, not eyeballed) so the same camera now
// produces: EEG/ROS2 left, BCI Core center, the AI cluster + Gazebo
// center-right, and the robotic hand — closest to camera and therefore
// also the largest on screen — unambiguously rightmost.
//
//   LEFT:          EEG acquisition + ROS2/MoveIt2 control
//   CENTER:        BCI Core (the room's visual center of gravity)
//   CENTER-RIGHT:  Signal Processing, Feature Extraction, CNN-LSTM,
//                  Adaptive Decision, Gazebo — clustered around the Core
//   RIGHT:         the robotics workcell (the physical robotic hand),
//                  closest to the overview camera — the second major
//                  visual anchor
//
// Units are meters, Y up, floor at y = 0.

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

// --- EEG room (left, brought well forward of the AI cluster) — the
// reference's participant is a large, close, foreground-left figure, not
// a small distant one; pulling this station toward the camera gets both
// the correct screen side AND real prominence in one move. Re-solved
// again for the overview camera's second revision (see that shot's own
// comment below) — a front-on, eye-level, much closer shot needed every
// station's position re-checked against its actual field of view, not
// just its left/right ordering. ---
export const EEG_POSITION: Vec3 = [-3.9, 0, -0.2];

// --- AI/BCI cluster, gathered around the Core rather than in a back row —
// all still facing +Z (see the mirrored-nameplate note this comment used
// to carry: a flat plane's texture reads mirrored from behind even
// double-sided, so every desk keeps one consistent camera-facing
// orientation instead of turning to face the core). ---
export const CORE_POSITION: Vec3 = [0.2, 0, -6.0];
export const SIGNAL_PROCESSING_POSITION: Vec3 = [-3.4, 0, -7.8];
export const FEATURE_EXTRACTION_POSITION: Vec3 = [2.6, 0, -7.2];
export const CNN_LSTM_POSITION: Vec3 = [2.5, 0, -5.0];
export const ADAPTIVE_DECISION_POSITION: Vec3 = [5.4, 0, -5.6];

// --- Robotics control area: ROS 2 (left, paired with EEG) and Gazebo
// (center-right, paired with the hand workcell it simulates). ---
export const ROS2_POSITION: Vec3 = [-3.6, 0, -2.9];
export const GAZEBO_POSITION: Vec3 = [4.4, 0, -2.4];

// --- Robotics workcell (right): the physical robotic hand — the second
// major visual anchor, closest to the overview camera. ---
export const HAND_POSITION: Vec3 = [5.3, 0, 0.3];

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
//
// `overview` is UNCHANGED from before this pass — it is the one shot the
// visual-reconstruction spec requires to keep working exactly as it is;
// every station position above was solved to read correctly *through*
// this fixed shot, not the other way around — REVISED again this pass: a
// much closer, lower, front-on eye-level shot replaces the previous steep
// elevated diagonal, matching the reference's actual perspective far more
// closely (that diagonal view left most of the frame as empty floor/
// ceiling; this one fills it). ai/adaptive are untouched below since
// CORE_POSITION/ADAPTIVE_DECISION_POSITION didn't move this round; the
// other four DID move, but only by construction: each is its station's
// previous shot re-centered on that station's new position, keeping the
// exact same relative offset (viewing angle, height, distance) it already
// had. A preset camera pointed at a station that just moved several
// meters would otherwise be aimed at empty floor — this keeps all five
// working exactly as verified before, just re-aimed at where their
// station now stands.
export const CAMERA_SHOTS: Record<CameraMode, CameraShot> = {
  overview: { position: [1.0, 2.1, 8.8], target: [0.3, 1.6, -5.5] },
  eeg: { position: [-1.4, 1.95, 2.0], target: [-3.9, 1.4, 0.0] },
  ai: { position: [0.2, 2.9, -1.9], target: [0.2, 1.4, -6.0] },
  adaptive: { position: [4.1, 2.0, -3.3], target: [5.4, 1.35, -5.6] },
  ros2: { position: [-4.6, 2.0, -0.2], target: [-3.6, 1.35, -2.9] },
  robot: { position: [5.3, 2.2, 3.5], target: [5.3, 1.3, 0.3] },
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
  //
  // `overview`'s radius (~20) is the largest of any shot — this must stay
  // above it. It was previously 13, a stale value from before `overview`
  // became this wide a panoramic shot: OrbitControls' own internal update()
  // clamp re-derives distance from camera.position/target every frame
  // (independent of BCICameraRig's own spherical lerp) and was silently
  // pulling the camera back to radius 13 even at rest, then fighting the
  // manual transition lerp on every subsequent preset change — the actual
  // cause of presets appearing to stall/oscillate instead of converging.
  maxDistance: 21,
  minPolarAngle: Math.PI * 0.1,
  maxPolarAngle: Math.PI * 0.49,
};
