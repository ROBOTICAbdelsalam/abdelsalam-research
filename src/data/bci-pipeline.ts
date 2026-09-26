// The detailed Lab 01–14 + ROS2 execution pipeline shown on the BCI case
// study page (src/components/research/bci-pipeline/). Every script
// filename below was fetched directly from the thesis repository's own
// `labs/` and `ros2_workspace/src/` directory listings — nothing here is
// guessed or renamed. Every fact (dataset numbers, CSP/model results,
// adaptive threshold, ROS2 packages/topics) is imported from
// bci-thesis.ts / bci-experiment.ts rather than restated, so this file
// can never drift from the case study or the interactive digital twin.
//
// Where the repository doesn't give a per-script figure/visualization,
// that field is simply left out — nothing here is invented.

import {
  EEG_DATASET,
  EEG_PREPROCESSING_STEPS,
  CSP_FACTS,
  MODEL_RESULTS,
  DEPLOYED_MODEL,
  ROS2_PACKAGES,
  GAZEBO_MOVEIT_FACTS,
  REPO_FACTS,
} from "./bci-thesis";
import { ADAPTIVE_LAYER_STATE, LIVE_GATE_THRESHOLD } from "./bci-experiment";

export type PipelineGroupId =
  | "environment-eeg"
  | "signal-preprocessing"
  | "feature-engineering"
  | "classical-ml"
  | "deep-learning"
  | "adaptive-ai"
  | "real-time-system"
  | "ros2-control";

export type PipelineGroup = { id: PipelineGroupId; label: string };

export const PIPELINE_GROUPS: readonly PipelineGroup[] = [
  { id: "environment-eeg", label: "01 · Environment & EEG Data" },
  { id: "signal-preprocessing", label: "02 · Signal Preprocessing" },
  { id: "feature-engineering", label: "03 · Feature Engineering" },
  { id: "classical-ml", label: "04 · Classical ML" },
  { id: "deep-learning", label: "05 · Deep Learning" },
  { id: "adaptive-ai", label: "06 · Adaptive AI" },
  { id: "real-time-system", label: "07 · Real-Time System" },
  { id: "ros2-control", label: "08 · ROS2 Robot Control" },
];

export type PipelineSubStep = { label: string; file: string };
export type PipelineNodeKind = "lab" | "ros2" | "demo";

export type PipelineNode = {
  id: string;
  group: PipelineGroupId;
  code: string;
  title: string;
  kind: PipelineNodeKind;
  purpose: string;
  input?: string;
  processing?: string;
  output?: string;
  technology?: readonly string[];
  script?: string;
  subSteps?: readonly PipelineSubStep[];
};

const modelLine = (names: readonly string[]) =>
  MODEL_RESULTS.filter((m) => names.includes(m.model))
    .map((m) => `${m.model} ${m.accuracy.toFixed(2)}`)
    .join(" · ");

export const PIPELINE_NODES: readonly PipelineNode[] = [
  // ---- 01 Environment & EEG Data (Labs 01–06, each a standalone script) ----
  {
    id: "lab01",
    group: "environment-eeg",
    code: "01",
    title: "Environment Setup",
    kind: "lab",
    purpose: "Set up the Python environment and pinned dependencies the whole pipeline runs on.",
    processing: "Python 3.12 virtual environment · requirements.txt",
    output: "Configured local pipeline environment",
    technology: ["Python 3.12"],
    script: "labs/lab01_setup.py",
  },
  {
    id: "lab02",
    group: "environment-eeg",
    code: "02",
    title: "Load EEG Dataset",
    kind: "lab",
    purpose: "Load the motor-imagery EEG recording used throughout the pipeline.",
    input: EEG_DATASET.dataset,
    processing: "MNE-Python dataset loading",
    output: "Raw EEG object in memory",
    technology: ["MNE-Python"],
    script: "labs/lab02_load_eeg.py",
  },
  {
    id: "lab03",
    group: "environment-eeg",
    code: "03",
    title: "Read EDF Recording",
    kind: "lab",
    purpose: "Parse the dataset's EDF-format recording into MNE's raw data structure.",
    input: "EDF recording file",
    processing: "EDF parsing",
    output: `${EEG_DATASET.channels}-channel raw signal @ ${EEG_DATASET.sampleRateHz} Hz`,
    technology: ["MNE-Python"],
    script: "labs/lab03_read_edf.py",
  },
  {
    id: "lab04",
    group: "environment-eeg",
    code: "04",
    title: "Visualize Raw Signal",
    kind: "lab",
    purpose: "Inspect the raw multi-channel EEG signal before any processing.",
    input: "Raw EEG (Lab 03)",
    processing: "Multi-channel raw signal plotting",
    output: "Visual raw-signal inspection",
    technology: ["MNE-Python", "Matplotlib"],
    script: "labs/lab04_plot_raw.py",
  },
  {
    id: "lab05",
    group: "environment-eeg",
    code: "05",
    title: "Dataset Info",
    kind: "lab",
    purpose: "Summarize the dataset's channels, sample rate and class structure.",
    input: "Raw EEG (Lab 03)",
    processing: "Dataset metadata summary",
    output: `${EEG_DATASET.channels} channels · ${EEG_DATASET.sampleRateHz} Hz · ${EEG_DATASET.classes} classes`,
    technology: ["MNE-Python"],
    script: "labs/lab05_dataset_info.py",
  },
  {
    id: "lab06",
    group: "environment-eeg",
    code: "06",
    title: "Band-Pass Filter",
    kind: "lab",
    purpose: "Apply the FIR band-pass filter ahead of artifact removal.",
    input: "Raw EEG (Lab 03)",
    processing: EEG_PREPROCESSING_STEPS[0],
    output: "Filtered EEG signal",
    technology: ["MNE-Python", "SciPy"],
    script: "labs/lab06_filter_eeg.py",
  },

  // ---- 02 Signal Preprocessing (Lab 07 ICA, Lab 08 Epoching) ----
  {
    id: "lab07",
    group: "signal-preprocessing",
    code: "07",
    title: "ICA / Artifact Removal",
    kind: "lab",
    purpose: "Identify and remove artifact components (eye blinks, muscle noise) via Independent Component Analysis.",
    input: "Filtered EEG (Lab 06)",
    processing: "ICA fit → component visualization → manual + automatic artifact detection/removal → before/after comparison",
    output: "Artifact-cleaned EEG",
    technology: ["MNE-Python", "ICA"],
    subSteps: [
      { label: "ICA Training", file: "labs/lab07_01_ica_fit.py" },
      { label: "ICA Components Visualization", file: "labs/lab07_02_plot_ica.py" },
      { label: "Manual Component Selection", file: "labs/lab07_03_manual_component_selection.py" },
      { label: "Automatic Artifact Detection", file: "labs/lab07_04_auto_component_detection.py" },
      { label: "Manual Artifact Removal", file: "labs/lab07_05_artifact_removal.py" },
      { label: "Automatic Artifact Removal", file: "labs/lab07_06_auto_artifact_removal.py" },
      { label: "Before / After Comparison", file: "labs/lab07_07_before_after_comparison.py" },
    ],
  },
  {
    id: "lab08",
    group: "signal-preprocessing",
    code: "08",
    title: "Epoch Processing",
    kind: "lab",
    purpose: "Segment the cleaned continuous signal into labeled, quality-checked epochs.",
    input: "ICA-cleaned EEG (Lab 07)",
    processing: "Event extraction → epoch creation → baseline correction → quality check",
    output: `${EEG_DATASET.epochs} processed epochs`,
    technology: ["MNE-Python"],
    subSteps: [
      { label: "Event Extraction", file: "labs/lab08_01_event_extraction.py" },
      { label: "Epoch Creation", file: "labs/lab08_02_epoch_creation.py" },
      { label: "Baseline Correction", file: "labs/lab08_03_baseline_correction.py" },
      { label: "Epoch Visualization", file: "labs/lab08_04_epoch_visualization.py" },
      { label: "Epoch Quality Check", file: "labs/lab08_05_epoch_quality_check.py" },
      { label: "Save Processed Epochs", file: "labs/lab08_06_save_processed_epochs.py" },
      { label: "Epoch Summary Report", file: "labs/lab08_07_epoch_summary_report.py" },
    ],
  },

  // ---- 03 Feature Engineering (Lab 09 features, Lab 10 CSP) ----
  {
    id: "lab09",
    group: "feature-engineering",
    code: "09",
    title: "Feature Extraction",
    kind: "lab",
    purpose: "Extract time-domain, frequency-domain and statistical features from each epoch.",
    input: "Processed epochs (Lab 08)",
    processing: "Time-domain → frequency-domain → PSD → band power → statistical features → feature selection",
    output: "Per-epoch feature set",
    technology: ["MNE-Python", "SciPy", "NumPy"],
    subSteps: [
      { label: "Time-Domain Features", file: "labs/lab09_01_time_domain_features.py" },
      { label: "Frequency-Domain Features", file: "labs/lab09_02_frequency_domain_features.py" },
      { label: "Power Spectral Density", file: "labs/lab09_03_power_spectral_density.py" },
      { label: "Band Power Extraction", file: "labs/lab09_04_band_power_extraction.py" },
      { label: "Statistical Features", file: "labs/lab09_05_statistical_features.py" },
      { label: "Feature Selection", file: "labs/lab09_06_feature_selection.py" },
      { label: "Feature Summary Report", file: "labs/lab09_07_feature_summary_report.py" },
    ],
  },
  {
    id: "lab10",
    group: "feature-engineering",
    code: "10",
    title: "CSP Feature Engineering",
    kind: "lab",
    purpose: "Fit Common Spatial Patterns on the training split only, then transform every epoch into CSP log-variance features.",
    input: "Processed epochs (Lab 08)",
    processing: `${CSP_FACTS.fitScope} → ${CSP_FACTS.featureType}`,
    output: `${CSP_FACTS.components} CSP components per epoch`,
    technology: ["MNE-Python (CSP)"],
    subSteps: [
      { label: "CSP Theory", file: "labs/lab10_01_csp_theory.py" },
      { label: "Train CSP", file: "labs/lab10_02_train_csp.py" },
      { label: "Transform EEG Signals", file: "labs/lab10_03_transform_eeg_signals.py" },
      { label: "CSP Feature Analysis", file: "labs/lab10_04_csp_feature_analysis.py" },
      { label: "Save CSP Features", file: "labs/lab10_05_save_csp_features.py" },
      { label: "CSP Report", file: "labs/lab10_06_csp_report.py" },
    ],
  },

  // ---- 04 Classical ML (Lab 11) ----
  {
    id: "lab11",
    group: "classical-ml",
    code: "11",
    title: "Classical Machine Learning",
    kind: "lab",
    purpose: "Train and compare classical baselines against the leakage-free CSP features.",
    input: "CSP features (Lab 10)",
    processing: "Train/test split → SVM · Random Forest · XGBoost → model comparison → performance evaluation",
    output: modelLine(["SVM", "Random Forest", "XGBoost"]),
    technology: ["scikit-learn", "XGBoost"],
    subSteps: [
      { label: "Dataset Preparation", file: "labs/lab11_01_dataset_preparation.py" },
      { label: "Create Labels", file: "labs/lab11_02_create_labels.py" },
      { label: "Train / Test Split", file: "labs/lab11_03_train_test_split.py" },
      { label: "SVM Classifier", file: "labs/lab11_04_svm_classifier.py" },
      { label: "Random Forest", file: "labs/lab11_05_random_forest.py" },
      { label: "XGBoost Classifier", file: "labs/lab11_06_xgboost_classifier.py" },
      { label: "Model Comparison", file: "labs/lab11_07_model_comparison.py" },
      { label: "Performance Evaluation", file: "labs/lab11_08_performance_evaluation.py" },
      { label: "Save Best Model", file: "labs/lab11_09_save_best_model.py" },
      { label: "Save CSP Model", file: "labs/lab11_10_save_csp_model.py" },
    ],
  },

  // ---- 05 Deep Learning (Lab 12) ----
  {
    id: "lab12",
    group: "deep-learning",
    code: "12",
    title: "Deep Learning",
    kind: "lab",
    purpose: "Train and compare CNN, LSTM and the deployed hybrid CNN-LSTM classifier.",
    input: "CSP features (Lab 10)",
    processing: "CNN → LSTM → CNN-LSTM → model comparison → performance evaluation",
    output: `${modelLine(["CNN", "LSTM", "CNN-LSTM"])} · deployed: ${DEPLOYED_MODEL.name} (≈${DEPLOYED_MODEL.sizeKB} KB)`,
    technology: ["TensorFlow", "Keras"],
    subSteps: [
      { label: "Dataset Preparation", file: "labs/lab12_01_dataset_preparation.py" },
      { label: "CNN Classifier", file: "labs/lab12_02_cnn_classifier.py" },
      { label: "LSTM Classifier", file: "labs/lab12_03_lstm_classifier.py" },
      { label: "CNN-LSTM Classifier", file: "labs/lab12_04_cnn_lstm_classifier.py" },
      { label: "Model Comparison", file: "labs/lab12_05_model_comparison.py" },
      { label: "Performance Evaluation", file: "labs/lab12_06_performance_evaluation.py" },
      { label: "Save Best Model", file: "labs/lab12_07_save_best_model.py" },
    ],
  },

  // ---- 06 Adaptive AI (Lab 13) ----
  {
    id: "lab13",
    group: "adaptive-ai",
    code: "13",
    title: "Adaptive AI",
    kind: "lab",
    purpose: "Maintain a confidence-gated, cold-start-aware adaptive threshold from accumulated feedback.",
    input: "Deployed model predictions (Lab 12)",
    processing: "User feedback → adaptive threshold → online learning → adaptive classifier update → performance adaptation",
    output: `Cold-start threshold ${ADAPTIVE_LAYER_STATE.coldStartThreshold.toFixed(2)} · status ${ADAPTIVE_LAYER_STATE.status}`,
    technology: ["NumPy", "SciPy"],
    subSteps: [
      { label: "User Feedback Integration", file: "labs/lab13_01_user_feedback.py" },
      { label: "Adaptive Threshold", file: "labs/lab13_02_adaptive_threshold.py" },
      { label: "Online Learning", file: "labs/lab13_03_online_learning.py" },
      { label: "Adaptive Classifier Update", file: "labs/lab13_04_adaptive_classifier_update.py" },
      { label: "Performance Adaptation", file: "labs/lab13_05_performance_adaptation.py" },
      { label: "Adaptive AI Report", file: "labs/lab13_06_adaptive_ai_report.py" },
    ],
  },

  // ---- 07 Real-Time System (Lab 14) ----
  {
    id: "lab14",
    group: "real-time-system",
    code: "14",
    title: "Real-Time System",
    kind: "lab",
    purpose: "Simulate a live EEG stream through preprocessing, online CSP and the deployed model to produce timestamped predictions and commands.",
    input: "Simulated EEG stream",
    processing: "Real-time preprocessing → online CSP → real-time prediction → command generation → performance monitoring",
    output: "realtime_predictions.csv / realtime_commands.csv",
    technology: ["Python", "Pandas"],
    subSteps: [
      { label: "Live EEG Streaming (Simulated)", file: "labs/lab14_01_live_eeg_streaming.py" },
      { label: "Real-Time Preprocessing", file: "labs/lab14_02_real_time_preprocessing.py" },
      { label: "Online CSP Feature Extraction", file: "labs/lab14_03_online_csp_feature_extraction.py" },
      { label: "Real-Time Prediction", file: "labs/lab14_04_real_time_prediction.py" },
      { label: "Command Generation", file: "labs/lab14_05_command_generation.py" },
      { label: "Performance Monitoring", file: "labs/lab14_06_performance_monitoring.py" },
      { label: "Real-Time System Report", file: "labs/lab14_07_real_time_system_report.py" },
    ],
  },

  // ---- 08 ROS2 Robot Control ----
  {
    id: "ros2-bridge",
    group: "ros2-control",
    code: "BCI",
    title: "BCI Bridge",
    kind: "ros2",
    purpose: ROS2_PACKAGES.find((p) => p.name === "bci_bridge")!.responsibility,
    input: "realtime_predictions.csv (Lab 14, file seam)",
    output: `/bci/command · gated at ${LIVE_GATE_THRESHOLD.toFixed(2)}`,
    technology: ["ROS2 Jazzy", "rclpy"],
    script: "ros2_workspace/src/bci_bridge",
  },
  {
    id: "ros2-abstraction",
    group: "ros2-control",
    code: "ABS",
    title: "Robot Abstraction",
    kind: "ros2",
    purpose: ROS2_PACKAGES.find((p) => p.name === "bci_robot_abstraction")!.responsibility,
    input: "/bci/command",
    output: "/bci/joint_targets (normalised)",
    technology: ["ROS2 Jazzy"],
    script: "ros2_workspace/src/bci_robot_abstraction",
  },
  {
    id: "ros2-bringup",
    group: "ros2-control",
    code: "BRG",
    title: "ROS2 Bringup",
    kind: "ros2",
    purpose: ROS2_PACKAGES.find((p) => p.name === "bci_bringup")!.responsibility,
    input: "/bci/joint_targets",
    output: "/hand_controller/joint_trajectory (radians)",
    technology: ["ROS2 Jazzy"],
    script: "ros2_workspace/src/bci_bringup",
  },
  {
    id: "ros2-control-layer",
    group: "ros2-control",
    code: "CTL",
    title: "ROS2 Control",
    kind: "ros2",
    purpose: "Drive the hand's joints from the incoming trajectory via ros2_control's controller framework.",
    input: "/hand_controller/joint_trajectory",
    processing: GAZEBO_MOVEIT_FACTS.controllers.join(" · "),
    technology: [GAZEBO_MOVEIT_FACTS.controlFramework],
  },
  {
    id: "ros2-gazebo",
    group: "ros2-control",
    code: "GZB",
    title: "Gazebo Simulation",
    kind: "ros2",
    purpose: "Simulate the robotic hand's physical response to the commanded trajectory.",
    technology: [GAZEBO_MOVEIT_FACTS.simulator],
  },
  {
    id: "ros2-moveit2",
    group: "ros2-control",
    code: "MVT",
    title: "MoveIt2",
    kind: "ros2",
    purpose: "Plan motion to one of the hand's named gesture states.",
    output: `${GAZEBO_MOVEIT_FACTS.planningGroup} · ${GAZEBO_MOVEIT_FACTS.namedStates} named states`,
    technology: [GAZEBO_MOVEIT_FACTS.planner, GAZEBO_MOVEIT_FACTS.planningLibrary],
  },
  {
    id: "ros2-state",
    group: "ros2-control",
    code: "MON",
    title: "Robot State Monitoring",
    kind: "ros2",
    purpose: "Publish robot feedback for any monitoring client.",
    output: "/bci/robot_state",
    technology: ["ROS2 Jazzy"],
  },
  {
    id: "ros2-robot-control",
    group: "ros2-control",
    code: "EXE",
    title: "Robot Control",
    kind: "ros2",
    purpose: "Execute the planned trajectory on the simulated robotic hand.",
    technology: ["ros2_control", GAZEBO_MOVEIT_FACTS.simulator],
  },

  // ---- End-to-end demo ----
  {
    id: "demo",
    group: "ros2-control",
    code: "E2E",
    title: "End-to-End Demo",
    kind: "demo",
    purpose:
      "Chains every stage above into one command → decision → simulated motion path — a bundled, high-confidence prediction, not a live-EEG-to-hardware demonstration.",
    output: `${REPO_FACTS.status} — ${REPO_FACTS.statusDetail}`,
  },
];

// ---------------------------------------------------------------------
// Visual QA correction (dense reference-diagram pass): the main pipeline
// must show every sub-lab as its own node — Lab 07.1, 07.2, … not one
// collapsed "Lab 07" card — matching the supplied reference image's
// row-based density. PIPELINE_NODES above is untouched (it stays the
// source of truth for each lab-family's purpose/input/processing/output/
// technology, still shown in the shared detail panel); this is a pure,
// derived flattening for what the main flow actually renders. A family
// with sub-steps contributes one VisualNode per sub-step (code becomes
// "07.1", "07.2", … from the family's own code); a family with none
// (Labs 01–06, every ROS2 stage, the demo) contributes exactly one.
export type VisualNode = {
  id: string;
  familyId: string;
  code: string;
  title: string;
  file?: string;
  group: PipelineGroupId;
  kind: PipelineNodeKind;
};

export const VISUAL_NODES: readonly VisualNode[] = PIPELINE_NODES.flatMap((node) => {
  if (!node.subSteps || node.subSteps.length === 0) {
    return [
      {
        id: node.id,
        familyId: node.id,
        code: node.code,
        title: node.title,
        file: node.script,
        group: node.group,
        kind: node.kind,
      },
    ];
  }
  return node.subSteps.map((step, i) => ({
    id: `${node.id}-${i + 1}`,
    familyId: node.id,
    code: `${node.code}.${i + 1}`,
    title: step.label,
    file: step.file,
    group: node.group,
    kind: node.kind,
  }));
});
