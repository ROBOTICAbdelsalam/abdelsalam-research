// Documented facts about the Hybrid-Adaptive BCI thesis pipeline, as supplied
// by the thesis author for the interactive digital-twin visualization on
// /projects/hybrid-adaptive-bci (see src/components/research/bci-3d/).
//
// This file is the single source of truth for every number and label the 3D
// experience and its surrounding UI display — nothing thesis-specific is
// hard-coded in the components themselves. It intentionally does NOT restate
// or alter src/data/featured-research.ts, which remains the canonical
// research write-up and keeps its own "no unverified results" stance;
// this file adds pipeline/methodology facts (acquisition config, protocol
// values, package names) rather than performance results.
//
// Honesty contract (non-negotiable — see every *_LABEL constant below):
// this website renders a WebGL digital twin of the thesis pipeline. It does
// not acquire live EEG, does not hold a live ROS 2/Gazebo connection, and
// performs no autonomous inference or online retraining. Every label that
// could be misread as a live system says so explicitly.

export const EEG_ACQUISITION = {
  channels: 64,
  sampleRateHz: 160,
  validEpochs: 29,
} as const;

export const PREPROCESSING = {
  filterBandHz: [1, 40] as const,
  steps: ["1–40 Hz band-pass filter", "ICA review", "Epoching"] as const,
};

export const MODEL_NAME = "CNN-LSTM";

export const SIMULATED_RUN = {
  windows: 5,
  windowSeconds: 1,
} as const;

// The fixed real-time acceptance gate used for the interactive demo below
// (documented as the "Lab 14" simulated real-time gate). This is distinct
// from the adaptive layer's cold-start protocol (ADAPTIVE_LAYER_STATE) —
// the demo's per-command confidence is checked against this fixed value,
// not against the cold-start threshold, which governs when the online
// classifier itself is allowed to update, not any single prediction.
export const LIVE_GATE_THRESHOLD = 0.75;

// The adaptive layer's own documented state — a fact panel, not something
// the interactive demo below drives or changes. Never implies retraining
// has happened: fewer than ten feedback samples exist, so the classifier is
// still in its conservative cold-start regime.
export const ADAPTIVE_LAYER_STATE = {
  coldStartThreshold: 0.9,
  coldStartMinSamples: 10,
  feedbackSamples: 3,
  feedbackAccuracy: 1.0,
  samplesRemaining: 7,
  status: "WAITING" as const,
};

export const ROS_STACK = {
  distro: "ROS 2 Jazzy",
  simulator: "Gazebo Harmonic",
  motionPlanning: "MoveIt2",
  controlStack: "ros2_control",
  packageCount: 6,
};

export type GestureId =
  | "REST"
  | "OPEN_HAND"
  | "CLOSE_HAND"
  | "PINCH_GRIP"
  | "POWER_GRIP"
  | "POINT";

export type GestureDef = {
  id: GestureId;
  label: string;
  /**
   * Deterministic demo confidence for this command (0..1) — chosen so the
   * six commands reliably demonstrate both the ACCEPT and NO ACTION paths
   * against LIVE_GATE_THRESHOLD, rather than depending on randomness for
   * QA and screenshots. Not a claimed model accuracy figure.
   */
  demoConfidence: number;
};

export const GESTURES: readonly GestureDef[] = [
  { id: "REST", label: "Rest", demoConfidence: 0.91 },
  { id: "OPEN_HAND", label: "Open Hand", demoConfidence: 0.88 },
  { id: "CLOSE_HAND", label: "Close Hand", demoConfidence: 0.83 },
  { id: "PINCH_GRIP", label: "Pinch Grip", demoConfidence: 0.72 },
  { id: "POWER_GRIP", label: "Power Grip", demoConfidence: 0.79 },
  { id: "POINT", label: "Point", demoConfidence: 0.68 },
];

export type PipelineStageId =
  | "eeg"
  | "preprocessing"
  | "features"
  | "cnn-lstm"
  | "adaptive-gate"
  | "ros2"
  | "moveit2"
  | "gazebo"
  | "robot";

export type PipelineStage = {
  id: PipelineStageId;
  index: number;
  code: string;
  label: string;
};

export const PIPELINE_STAGES: readonly PipelineStage[] = [
  { id: "eeg", index: 1, code: "01", label: "EEG" },
  { id: "preprocessing", index: 2, code: "02", label: "Preprocessing" },
  { id: "features", index: 3, code: "03", label: "Features" },
  { id: "cnn-lstm", index: 4, code: "04", label: "CNN-LSTM" },
  { id: "adaptive-gate", index: 5, code: "05", label: "Adaptive Gate" },
  { id: "ros2", index: 6, code: "06", label: "ROS2" },
  { id: "moveit2", index: 7, code: "07", label: "MoveIt2" },
  { id: "gazebo", index: 8, code: "08", label: "Gazebo" },
  { id: "robot", index: 9, code: "09", label: "Robot" },
];

// Wording used anywhere the UI could otherwise be misread as describing a
// live backend. See "Honesty contract" above — every one of these renders
// verbatim somewhere in the experience.
export const HONESTY_LABELS = {
  eegInput: "EEG INPUT — SIMULATED STREAM",
  digitalTwin: "DIGITAL TWIN — WEBGL REPRESENTATION",
  ros2: "ROS 2 PIPELINE — SIMULATED",
  gazebo: "GAZEBO / ROBOT SIMULATION — WEBGL REPRESENTATION",
  researchPrototype: "RESEARCH PROTOTYPE, NOT A LIVE BACKEND",
  // The static concept image shown before a visitor launches the live
  // WebGL scene — distinct from `digitalTwin` above so it's never mistaken
  // for the interactive representation itself.
  conceptPreview: "CONCEPT PREVIEW — STATIC IMAGE, NOT THE LIVE 3D SCENE",
} as const;
