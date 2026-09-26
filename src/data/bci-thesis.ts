// Case-study content for the Hybrid-Adaptive BCI project page
// (/projects/hybrid-adaptive-bci), sourced from the thesis repository:
// https://github.com/ROBOTICAbdelsalam/-Hybrid-Adaptive-BCI-Thesis-
//
// Every fact below is traceable to README.md, docs/ARCHITECTURE.md,
// docs/PROJECT_REPORT.md, docs/USER_GUIDE.md or docs/Lab*.md in that
// repository — fetched and, where the same fact appears in more than one
// document, cross-checked (e.g. the CSP feature count is independently
// confirmed both by PROJECT_REPORT.md's "four log-variance features" and
// Lab10_02_Train_CSP.md's own output shape "(29, 4)"; the 43-test total
// in PROJECT_REPORT.md reconciles with ARCHITECTURE.md's "33 unit/
// structural tests" + USER_GUIDE.md's per-package breakdown (11+8+6+3+5
// = 33) plus 3 ROS2-runtime-only tests and 7 AI tests).
//
// This file is deliberately separate from src/data/bci-experiment.ts,
// which remains the single source of truth for the INTERACTIVE digital
// twin's own state machine (phases, tick durations, demo confidence
// values, honesty labels) — nothing here changes that file's meaning,
// and the adaptive-gate numbers used on this page are imported from it
// rather than restated, so the two can never drift apart. This file
// holds case-study CONTENT: the research narrative, results, validation
// matrix and repository facts that sit around that interactive
// component on the project page.
//
// Nothing here is invented. Where the repository doesn't document a
// number, it is simply not included.

export const REPO_URL = "https://github.com/ROBOTICAbdelsalam/-Hybrid-Adaptive-BCI-Thesis-";

export const REPO_LINKS = {
  repository: REPO_URL,
  readme: `${REPO_URL}/blob/main/README.md`,
  architecture: `${REPO_URL}/blob/main/docs/ARCHITECTURE.md`,
  projectReport: `${REPO_URL}/blob/main/docs/PROJECT_REPORT.md`,
  userGuide: `${REPO_URL}/blob/main/docs/USER_GUIDE.md`,
} as const;

export const THESIS_META = {
  title: "Hybrid-Adaptive BCI",
  subtitle: "Robotic Hand Control System",
  description:
    "An end-to-end Brain–Computer Interface pipeline that transforms EEG motor-imagery signals into semantic robotic commands through adaptive AI and a robot-independent ROS2 architecture.",
  institution: "JAMK University of Applied Sciences, Finland",
  degree: "Master's Thesis in Robotics",
  author: "Mohamed Abdelsalam",
  supervisor: "Prof. Olli Väänänen",
  version: "v1.0",
  license: "MIT",
  metadataTags: [
    "MASTER'S THESIS",
    "JAMK UNIVERSITY OF APPLIED SCIENCES",
    "ROBOTICS",
    "BRAIN–COMPUTER INTERFACE",
    "ARTIFICIAL INTELLIGENCE",
    "ROS2",
  ] as const,
};

// ---------------------------------------------------------------------
// 03 RESEARCH OVERVIEW — three pillars
// ---------------------------------------------------------------------
export type ResearchPillar = { title: string; items: readonly string[] };

export const RESEARCH_PILLARS: readonly ResearchPillar[] = [
  {
    title: "Neuroscience",
    items: ["EEG", "Signal processing", "Filtering", "ICA", "Epoching", "CSP"],
  },
  {
    title: "Artificial Intelligence",
    items: ["Machine learning", "CNN", "LSTM", "CNN-LSTM", "Adaptive threshold", "Real-time prediction"],
  },
  {
    title: "Robotics",
    items: ["ROS2 Jazzy", "Robot abstraction", "ros2_control", "Gazebo Harmonic", "MoveIt2", "Robotic hand"],
  },
];

// ---------------------------------------------------------------------
// 04 SYSTEM PIPELINE — the full brain-to-robot chain, README's own
// diagram plus ARCHITECTURE.md's robotics-side detail, in one ordered
// list.
// ---------------------------------------------------------------------
export type PipelineStep = { label: string; detail: string };

export const SYSTEM_PIPELINE: readonly PipelineStep[] = [
  { label: "EEG", detail: "64-channel acquisition, EEGBCI dataset" },
  { label: "Preprocessing", detail: "1–40 Hz FIR band-pass · ICA · epoching" },
  { label: "CSP Feature Extraction", detail: "4 components, log-variance features" },
  { label: "CNN/LSTM", detail: "Deployed CNN-LSTM classifier" },
  { label: "Adaptive Threshold", detail: "Confidence-gated acceptance (Lab 13)" },
  { label: "Real-Time Prediction", detail: "realtime_predictions.csv (Lab 14)" },
  { label: "ROS2 Bridge", detail: "bci_bridge → /bci/command" },
  { label: "Robot Abstraction", detail: "bci_robot_abstraction → robot_node" },
  { label: "ros2_control", detail: "Hand trajectory adapter → controllers" },
  { label: "Gazebo Harmonic", detail: "Simulated robotic-hand runtime" },
  { label: "MoveIt2", detail: "Motion planning to named gesture states" },
  { label: "Robotic Hand", detail: "Five-finger simulated end effector" },
];

// ---------------------------------------------------------------------
// 05 EEG SIGNAL PROCESSING
// ---------------------------------------------------------------------
export const EEG_DATASET = {
  dataset: "EEGBCI subject 1, run 4",
  epochs: 29,
  channels: 64,
  sampleRateHz: 160,
  classes: 3,
} as const;

export const EEG_PREPROCESSING_STEPS = ["1–40 Hz FIR band-pass", "ICA", "Epoching", "CSP"] as const;

export const EEG_SIGNAL_FLOW = ["Raw EEG", "Filtering", "ICA", "Epoching", "CSP"] as const;

// ---------------------------------------------------------------------
// 06 CSP FEATURE EXTRACTION
// ---------------------------------------------------------------------
export const CSP_FACTS = {
  components: 4,
  featureType: "Log-variance features",
  fitScope: "Fitted on training epochs only",
  leakageNote:
    "CSP is fit exclusively on the training split, then applied unchanged to validation/test epochs — the fitted spatial filters never see held-out data, which is what makes the resulting features leakage-free.",
} as const;

// ---------------------------------------------------------------------
// 07 AI CLASSIFICATION — exact documented results
// ---------------------------------------------------------------------
export type ModelResult = { model: string; accuracy: number; deployed?: boolean };

export const MODEL_RESULTS: readonly ModelResult[] = [
  { model: "SVM", accuracy: 0.33 },
  { model: "Random Forest", accuracy: 0.5 },
  { model: "XGBoost", accuracy: 0.33 },
  { model: "CNN", accuracy: 0.5 },
  { model: "LSTM", accuracy: 0.5 },
  { model: "CNN-LSTM", accuracy: 0.67, deployed: true },
];

export const RESULTS_LABEL = "6-sample test set · single subject · post-leakage-fix scientific validation";

export const RESULTS_QUOTE =
  "These numbers are low but trustworthy — they are the true difficulty of a 29-epoch, single-subject dataset.";

export const DEPLOYED_MODEL = {
  name: "CNN-LSTM",
  sizeKB: 356,
  inference: "Sub-millisecond per window on CPU",
  architecture: [
    "Input layer",
    "Conv1D (32 filters)",
    "MaxPooling1D",
    "LSTM (64 units)",
    "Dropout (30%)",
    "Dense hidden layer (32 neurons)",
    "Softmax output",
  ],
  training: {
    optimizer: "Adam",
    callbacks: ["EarlyStopping", "ModelCheckpoint", "ReduceLROnPlateau"],
  },
} as const;

// ---------------------------------------------------------------------
// 09 ROS2 ARCHITECTURE
// ---------------------------------------------------------------------
export type Ros2Package = { name: string; responsibility: string };

export const ROS2_PACKAGES: readonly Ros2Package[] = [
  { name: "bci_interfaces", responsibility: "BCICommand / RobotState messages + ExecuteGesture service — the robot-independent vocabulary" },
  { name: "bci_bridge", responsibility: "Reads the AI pipeline's Lab 13/14 outputs, gates by confidence, publishes BCICommand" },
  { name: "bci_robot_abstraction", responsibility: "RobotInterface contract, gesture library, robot registry, robot_node" },
  { name: "bci_hand_description", responsibility: "URDF/Xacro, ros2_control, Gazebo launch" },
  { name: "bci_hand_moveit_config", responsibility: "MoveIt2 planning group + six named gesture states" },
  { name: "bci_bringup", responsibility: "Hand trajectory adapter + full-system launch" },
];

export type Ros2FlowStep = { label: string; detail?: string };

export const ROS2_FLOW: readonly Ros2FlowStep[] = [
  { label: "realtime_predictions", detail: "AI pipeline output (file seam)" },
  { label: "bci_bridge", detail: "confidence gate" },
  { label: "/bci/command", detail: "BCICommand" },
  { label: "robot_node", detail: "bci_robot_abstraction" },
  { label: "/bci/joint_targets", detail: "normalised, Float64MultiArray" },
  { label: "hand trajectory adapter", detail: "bci_bringup" },
  { label: "/hand_controller/joint_trajectory", detail: "radians" },
  { label: "ros2_control", detail: "joint_trajectory_controller" },
  { label: "Gazebo Harmonic", detail: "+ MoveIt2 planning" },
];

export type Ros2Topic = { topic: string; type: string; direction: string };

export const ROS2_TOPICS: readonly Ros2Topic[] = [
  { topic: "/bci/command", type: "bci_interfaces/BCICommand", direction: "bridge → robot_node" },
  { topic: "/bci/robot_state", type: "bci_interfaces/RobotState", direction: "robot_node → monitors" },
  { topic: "/bci/joint_targets", type: "std_msgs/Float64MultiArray", direction: "robot_node → hand adapter" },
  { topic: "/bci/execute_gesture", type: "bci_interfaces/ExecuteGesture", direction: "any client → robot_node" },
  { topic: "/hand_controller/joint_trajectory", type: "trajectory_msgs/JointTrajectory", direction: "hand adapter → ros2_control" },
];

// Robot-independence — the seam is explicit and deliberate: everything
// above /bci/command speaks only in semantic gestures; a new robot is a
// registry entry plus its own RobotInterface implementation, with zero
// edits to the EEG/AI pipeline, the bridge, or the interface contract.
export const ROBOT_INDEPENDENCE = {
  statement:
    "Above /bci/command everything is semantic — a gesture id plus a confidence. The AI pipeline and the bridge never know what a \"hand\" is. robot_node selects a concrete robot from a registry via a single robot_type parameter and calls RobotInterface.execute_gesture(); it still contains no hand-specific code. The hand trajectory adapter, in bci_bringup, is the only place that knows the hand's radian range and controller topic.",
  addRobotSteps: [
    "Implement the contract — a new RobotInterface subclass",
    "Register it in the robot registry",
    "Select it at launch via the robot_type parameter",
  ],
  // Named in README.md as robots the architecture is designed to support
  // later — not implemented today. Presented here strictly as candidate
  // extensions, matching how the repository itself frames them.
  candidateRobots: ["UR5e", "Franka Panda", "KUKA iiwa"] as const,
  candidateRobotsNote:
    "These are documented as future extension targets, not implemented robots — adding one is a registry entry and a new RobotInterface subclass, with no change to the EEG/AI pipeline.",
};

// ---------------------------------------------------------------------
// 10 ROBOTIC HAND
// ---------------------------------------------------------------------
export const ROBOTIC_HAND_SPEC = {
  fingers: 5,
  jointsPerFinger: 1,
  jointType: "Revolute",
  rangeRad: [0, 1.4] as const,
} as const;

// ---------------------------------------------------------------------
// 11 GAZEBO + MOVEIT2
// ---------------------------------------------------------------------
export const GAZEBO_MOVEIT_FACTS = {
  simulator: "Gazebo Harmonic",
  controlFramework: "ros2_control",
  controllers: ["joint_state_broadcaster", "joint_trajectory_controller"],
  planner: "MoveIt2",
  planningGroup: "Hand planning group",
  namedStates: 6,
  planningLibrary: "OMPL (joint-space planning)",
} as const;

// ---------------------------------------------------------------------
// 12 RESULTS
// ---------------------------------------------------------------------
export const RESULTS_STATEMENT =
  "The scientific contribution of v1.0 is a leakage-free, reproducible pipeline rather than a claim of high generalization performance.";

// ---------------------------------------------------------------------
// 13 ENGINEERING VALIDATION
// ---------------------------------------------------------------------
export const VALIDATION_TOTALS = {
  aiTests: 7,
  ros2Tests: 36,
  total: 43,
} as const;

export type ValidationHost = "dev" | "ci" | "ros2";
export type ValidationRow = { label: string; hosts: readonly ValidationHost[] };

// Trimmed from PROJECT_REPORT.md's full verification matrix to the
// categories that matter for a case-study reader — "hosts" lists every
// place that item is actually verified (development host, GitHub
// Actions CI, or the ROS2/Gazebo host), not a single collapsed badge.
export const VALIDATION_MATRIX: readonly ValidationRow[] = [
  { label: "AI pipeline validation (CSP + model predict)", hosts: ["dev", "ci"] },
  { label: "Leakage-free CSP fit (train-only)", hosts: ["dev", "ci"] },
  { label: "Validation/test separation (deep learning)", hosts: ["dev", "ci"] },
  { label: "Adaptive threshold + cold-start", hosts: ["dev", "ci"] },
  { label: "36 ROS2 unit/structural tests", hosts: ["dev", "ci", "ros2"] },
  { label: "URDF validation (expands, valid kinematic tree)", hosts: ["dev", "ci"] },
  { label: "Gesture consistency (SRDF ↔ abstraction ↔ URDF)", hosts: ["dev", "ci"] },
  { label: "colcon build", hosts: ["ci", "ros2"] },
  { label: "colcon test", hosts: ["ci", "ros2"] },
  { label: "Gazebo Harmonic spawn + controllers", hosts: ["ros2"] },
  { label: "MoveIt2 planning to named states", hosts: ["ros2"] },
  { label: "Live ROS2 transport", hosts: ["ros2"] },
];

export const VALIDATION_HOST_LABELS: Record<ValidationHost, string> = {
  dev: "Development host",
  ci: "GitHub Actions CI",
  ros2: "ROS2 host",
};

// ---------------------------------------------------------------------
// 14 LIMITATIONS
// ---------------------------------------------------------------------
export const LIMITATIONS = [
  "The current real-time path does not yet produce robotic motion from live EEG: available real-data prediction confidence remains below the adaptive acceptance threshold, so the gate correctly withholds a command rather than acting on an uncertain one.",
  "Bundled high-confidence demo predictions are used to exercise the complete motion path end-to-end (bridge → robot abstraction → ros2_control → Gazebo → MoveIt2), independent of that gating behavior.",
  "The evaluated classifier is trained and tested on a single-subject, 29-epoch dataset with a 6-sample test set — the results above are honestly small-sample, not a generalization claim.",
  "The trained EEG classifier currently distinguishes 3 motor-imagery classes from that dataset; the full 6-gesture robotic vocabulary is exercised through the bundled demo predictions, not yet driven end-to-end by the live 3-class classifier.",
] as const;

// ---------------------------------------------------------------------
// 15 FUTURE RESEARCH — every item traceable to PROJECT_REPORT.md
// Section 6. Its own "scale the data across EEGBCI subjects with
// subject-wise cross-validation" documents two distinct ideas in one
// sentence; they're split into two timeline steps below for clarity,
// citing the same source line.
// ---------------------------------------------------------------------
export type FutureResearchItem = { title: string; description: string };

export const FUTURE_RESEARCH: readonly FutureResearchItem[] = [
  { title: "Multi-Subject Training", description: "Scale training data across EEGBCI subjects (109 available) instead of a single subject." },
  { title: "Subject-Wise Cross-Validation", description: "Validate with a subject-wise split, the proper protocol for generalization claims." },
  { title: "Live EEG Prediction Topic", description: "Replace CSV replay with inference running directly on a live EEG stream." },
  { title: "Causal Streaming Filtering", description: "Replace offline filtering with causal real-time filtering (streaming lfilter with carried state)." },
  { title: "UR5e / Franka Panda Extension", description: "Add a second robot to demonstrate the abstraction layer on an industrial arm." },
  { title: "Collision-Aware Planning", description: "Use MoveIt2 planning scenes for collision-aware grasp tasks." },
  { title: "Physical Robotic-Hand Bridge", description: "Replace the Gazebo controller with a real hand's driver behind the same interface." },
  { title: "True Online Adaptive Learning", description: "Deploy online fine-tuning on accumulated user feedback, beyond the current threshold adaptation." },
  { title: "Larger Gesture Vocabulary", description: "Extend the trained classifier beyond 3 classes to drive all 6 supported gestures directly." },
];

// ---------------------------------------------------------------------
// 16 TECHNOLOGY STACK — layered cards, matching README's own table.
// ---------------------------------------------------------------------
export type TechLayer = { title: string; items: readonly string[] };

export const TECH_LAYERS: readonly TechLayer[] = [
  { title: "EEG / Signal Processing", items: ["MNE-Python", "SciPy", "NumPy"] },
  { title: "Feature Extraction", items: ["MNE CSP"] },
  { title: "Machine Learning", items: ["scikit-learn", "XGBoost"] },
  { title: "Deep Learning", items: ["TensorFlow", "Keras", "CNN", "LSTM", "CNN-LSTM"] },
  { title: "Robotics", items: ["ROS2 Jazzy", "ros2_control"] },
  { title: "Simulation", items: ["Gazebo Harmonic"] },
  { title: "Motion Planning", items: ["MoveIt2"] },
];

// ---------------------------------------------------------------------
// 17 REPOSITORY STRUCTURE (for context in the Repository section)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// Page navigation — every section after the Hero (which needs no anchor
// of its own since visitors already start there), in document order.
// ---------------------------------------------------------------------
export const CASE_STUDY_SECTIONS = [
  { id: "digital-twin", title: "Digital Twin" },
  { id: "research-overview", title: "Research Overview" },
  { id: "system-pipeline", title: "System Pipeline" },
  { id: "eeg-signal-processing", title: "EEG Signal Processing" },
  { id: "csp-feature-extraction", title: "CSP Feature Extraction" },
  { id: "ai-classification", title: "AI Classification" },
  { id: "adaptive-decision", title: "Adaptive Decision" },
  { id: "ros2-architecture", title: "ROS2 Architecture" },
  { id: "robotic-hand", title: "Robotic Hand" },
  { id: "gazebo-moveit2", title: "Gazebo + MoveIt2" },
  { id: "results", title: "Results" },
  { id: "validation", title: "Engineering Validation" },
  { id: "limitations", title: "Limitations" },
  { id: "future-research", title: "Future Research" },
  { id: "technology-stack", title: "Technology Stack" },
  { id: "repository", title: "Repository" },
  { id: "author", title: "Author" },
] as const;

export const REPO_FACTS = {
  status: "v1.0 — complete",
  statusDetail:
    "EEG→AI→ROS2→robotic-hand pipeline implemented across six ROS2 packages plus the Labs 01–14 AI pipeline.",
  license: "MIT",
  labs: "Labs 01–14 (Python): EEG loading, filtering, ICA, epoching, feature extraction, CSP, classical ML, deep learning, adaptive AI, real-time prediction/command pipeline.",
  seam: "The AI pipeline and the ROS2 workspace meet at one seam — the bridge reads the AI pipeline's own output files — so the AI code is never modified by the robotics code.",
} as const;
