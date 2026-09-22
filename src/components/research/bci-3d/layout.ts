// Spatial layout for the BCI digital-twin laboratory. One shared config so
// positions aren't scattered across station components — mirrors the
// convention in src/lib/ai-lab/layout.ts. Units are meters-ish, Y up, floor
// at y = 0.
//
// Composition: a straight pipeline spine along +Z, not a random scatter.
// The EEG participant sits at the back (-Z); signal processing and feature
// extraction form a left/right pair midway; the CNN-LSTM and adaptive gate
// form the next pair; the central BCI core sits on the spine between the
// AI stages and the robotics stages; ROS 2 and Gazebo form the final pair;
// the five-finger robotic hand — the experiment's physical outcome — stands
// alone at the front, closest to the default camera.

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

export const EEG_POSITION: Vec3 = [-2.1, 0, -11.2];
export const SIGNAL_PROCESSING_POSITION: Vec3 = [-3.6, 0, -7.3];
export const FEATURE_EXTRACTION_POSITION: Vec3 = [3.6, 0, -7.3];
export const CNN_LSTM_POSITION: Vec3 = [-3.6, 0, -3.2];
export const ADAPTIVE_DECISION_POSITION: Vec3 = [3.6, 0, -3.2];
export const CORE_POSITION: Vec3 = [0, 0, 0.6];
export const ROS2_POSITION: Vec3 = [-3.6, 0, 5.0];
export const GAZEBO_POSITION: Vec3 = [3.6, 0, 5.0];
export const HAND_POSITION: Vec3 = [0, 0, 9.6];

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
  halfWidth: 8.6,
  halfDepth: 13.4,
  centerZ: -0.6,
  wallHeight: 6,
} as const;

// Yaw (radians) so a group's default forward (-Z) faces a point.
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

// Keeps enough surrounding context visible per station — never a tight
// crop on a single desk.
export const CAMERA_SHOTS: Record<CameraMode, CameraShot> = {
  overview: { position: [7.5, 5.4, 10.8], target: [0, 1.3, -2] },
  eeg: { position: [2.6, 2.9, -6.3], target: [-1.6, 1.55, -10.6] },
  ai: { position: [7.4, 5.1, -2.6], target: [0, 1.7, -5.6] },
  adaptive: { position: [6.6, 3.3, -1.1], target: [3.0, 1.35, -3.5] },
  ros2: { position: [-6.6, 3.4, 7.3], target: [-3.2, 1.35, 5.2] },
  robot: { position: [4.6, 3.4, 11.8], target: [0, 1.7, 9.4] },
};

export const CAMERA_LIMITS = {
  minDistance: 5.5,
  maxDistance: 21,
  minPolarAngle: Math.PI * 0.08,
  maxPolarAngle: Math.PI * 0.49,
};
