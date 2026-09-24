import type { PipelineStageId } from "@/data/bci-experiment";

// Spatial layout — REBUILT for the image-based diorama pass. The BCI
// digital twin's 3D scene is no longer a procedural room; it's a shallow,
// layered reconstruction of public/images/bci-lab-overview.jpg itself (see
// imagescene/ImageDiorama.tsx). Every coordinate below describes a point in
// THAT scene's coordinate system, not a floor plan:
//
//   - The image is mapped onto a backdrop plane centered at world (0, 1.8,
//     0), sized from the image's own pixel aspect ratio so it reads at
//     true, undistorted proportions.
//   - Each station position is that station's on-image center, converted
//     from the pixel coordinates of its label in the source photo into
//     this same world space (see IMAGE_TO_WORLD below) — so a hotspot
//     sitting at a station's position is, by construction, positioned
//     exactly over that content in the photo.
//   - The camera sits in front of the plane, at a resting distance chosen
//     so the backdrop fills the frame at its full height; hotspot camera
//     shots are a subtle dolly/pan toward that station's position, not a
//     full re-framing — this is meant to read as "the same photo, gently
//     pushed toward one area," never as a different composition.
//
// Units are meters, Y up. There is no floor and no walls in this scene —
// ROOM below exists only to give BCICameraRig's existing room-bounds
// clamp (untouched, reused as-is) a safety box tight around this shallow
// diorama instead of an actual floor plan.

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

// --- The backdrop plane's own geometry — derived from the source image's
// actual pixel dimensions (1672×607), not guessed. Every other constant in
// this file is derived from these three numbers. ---
export const IMAGE_ASPECT = 1672 / 607;
export const PLANE_HALF_HEIGHT = 3.0;
export const PLANE_HALF_WIDTH = PLANE_HALF_HEIGHT * IMAGE_ASPECT;
export const PLANE_CENTER_Y = 1.8;
export const CAMERA_REST_Z = 6.5;

// Converts a pixel coordinate in the 1672×607 source photo into this
// scene's world (x, y) at the backdrop plane's own Z=0 — the single
// source of truth every station position below was computed from.
export function imageToWorld(px: number, py: number): readonly [number, number] {
  const u = px / 1672;
  const v = 1 - py / 607;
  const x = (u - 0.5) * 2 * PLANE_HALF_WIDTH;
  const y = PLANE_CENTER_Y + (v - 0.5) * 2 * PLANE_HALF_HEIGHT;
  return [x, y] as const;
}

// Station positions — each is that station's on-image content center
// (see the file header), z=0 (on the backdrop plane itself; hotspot hit
// volumes sit slightly in front of it, see Hotspots.tsx).
export const EEG_POSITION: Vec3 = [-5.99, 3.07, 0];
export const SIGNAL_PROCESSING_POSITION: Vec3 = [-2.58, 3.0, 0];
export const FEATURE_EXTRACTION_POSITION: Vec3 = [0.11, 2.48, 0];
export const CNN_LSTM_POSITION: Vec3 = [2.66, 3.22, 0];
export const ADAPTIVE_DECISION_POSITION: Vec3 = [4.8, 3.22, 0];
export const ROS2_POSITION: Vec3 = [-4.39, 0.43, 0];
export const GAZEBO_POSITION: Vec3 = [2.61, 0.95, 0];
export const HAND_POSITION: Vec3 = [6.0, 0.34, 0];

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

// Pipeline-flow order — the sequence a run visits these stations in,
// used only by the cinematic data-flow overlay (imagescene/PipelineFlow)
// to draw the connecting signal path and know which segment is "in
// flight". Matches STATION_POSITIONS' own insertion order above (which
// already matches pipeline order); kept as its own explicit list so that
// intent reads clearly even if the object's key order ever changes.
export const STATION_FLOW_ORDER: readonly StationId[] = [
  "eeg",
  "signal-processing",
  "feature-extraction",
  "cnn-lstm",
  "adaptive-decision",
  "ros2",
  "gazebo",
  "hand",
];

// Which on-image station a given pipeline stage's processing visually
// belongs to — used by the same cinematic overlay to know which station
// to highlight/animate for the run's current stage. ROS2 and MoveIt2
// both read as the same ROS2 station on the backdrop; there's no
// separate MoveIt2 signage in the source photo.
export const STAGE_TO_STATION: Record<PipelineStageId, StationId> = {
  eeg: "eeg",
  preprocessing: "signal-processing",
  features: "feature-extraction",
  "cnn-lstm": "cnn-lstm",
  "adaptive-gate": "adaptive-decision",
  ros2: "ros2",
  moveit2: "ros2",
  gazebo: "gazebo",
  robot: "hand",
};

// A tight safety box around the diorama, just for BCICameraRig's existing
// room-bounds clamp (that file's own code is unchanged — only these
// numbers are new). No floor/walls are rendered; this purely keeps free
// orbit/pan/zoom from wandering past the backdrop's edges into empty
// space.
export const ROOM = {
  halfWidth: 8.0,
  halfDepth: 5.5,
  centerZ: 4.5,
  wallHeight: 5.0,
} as const;

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

// `overview` rests exactly square-on to the backdrop, at the distance
// that fills the frame by height — the composition visitors land on is,
// by construction, the source photo itself. Every other shot is a subtle
// pull (target moves 45% of the way to the station, camera position only
// 15% of the way, and only slightly closer in Z) — a gentle push toward
// that area, not a different photo. These pull fractions were tuned down
// from an initial, more aggressive pass: at 60%/25% the "robot" shot's
// angled pan (position and target disagree in X, so the camera looks
// across the backdrop rather than straight at it) pushed the frustum far
// enough that the backdrop plane's own edge became visible as a sliver of
// void at the frame's border — a real, visible bug, caught by actually
// screenshotting the preset rather than trusting the straight-on
// projection math alone.
export const CAMERA_SHOTS: Record<CameraMode, CameraShot> = {
  overview: { position: [0, PLANE_CENTER_Y, CAMERA_REST_Z], target: [0, PLANE_CENTER_Y, 0] },
  eeg: { position: [-0.9, 1.99, 5.7], target: [-2.7, 2.37, 0] },
  ai: { position: [0.01, 1.97, 5.7], target: [0.03, 2.29, 0] },
  adaptive: { position: [0.72, 2.01, 5.7], target: [2.16, 2.44, 0] },
  ros2: { position: [-0.66, 1.6, 5.7], target: [-1.98, 1.18, 0] },
  robot: { position: [0.65, 1.63, 5.7], target: [1.94, 1.28, 0] },
};

// Which camera preset the guided tour switches to while a given pipeline
// stage is active (start drives the camera through the stations in
// pipeline order) — unchanged in meaning from the procedural-room version.
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
  minDistance: 3.0,
  maxDistance: 9.0,
  // A shallow diorama, not a walkable room — orbit stays close to a
  // frontal view of the backdrop (roughly ±22° from horizontal) so free
  // orbit can never swing around to an angle that shows the plane's edge
  // or empty space behind it.
  minPolarAngle: Math.PI * 0.4,
  maxPolarAngle: Math.PI * 0.62,
  // Bug fix (texture-stretching report): every visible layer here is a
  // flat, paper-thin plane with nothing behind it — there is no "side" or
  // "back" to this diorama. Unlike minPolarAngle/maxPolarAngle above,
  // azimuth had no limit at all, so a normal orbit drag could swing the
  // camera toward edge-on to those planes (severe perspective stretching
  // — the reported "stretched bands") and, taken further, fully behind
  // them (backface-culled to black, since every layer uses the default
  // front-side-only material). Reproduced directly: dragging past ~±35°
  // from center turns the backdrop into long horizontal streaks; past
  // roughly ±60-70° it goes solid black but for the pipeline-flow lines
  // (Line materials aren't face-culled the way the image planes are).
  // ±32° keeps every CAMERA_SHOTS preset's own azimuth (the widest is
  // "eeg" at ~17.5°) comfortably inside the bound with room to spare for
  // free exploration, while staying well short of where stretching
  // starts — the same kind of hard safety clamp minPolarAngle/
  // maxPolarAngle already are, just for the other axis.
  minAzimuthAngle: -Math.PI * 0.178,
  maxAzimuthAngle: Math.PI * 0.178,
};
