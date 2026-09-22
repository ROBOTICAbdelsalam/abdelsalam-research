import { GESTURES, LIVE_GATE_THRESHOLD, PIPELINE_STAGES, type GestureId, type PipelineStageId } from "@/data/bci-experiment";

// Typed state machine for the interactive run. Kept as plain types + pure
// functions (no React here) so the sequencing logic is easy to reason about
// and test independently of the provider that schedules it.

export type ExperimentPhase =
  | "IDLE"
  | "PROCESSING"
  | "PREDICTING"
  | "WAITING_FOR_CONFIDENCE"
  | "COMMAND_ACCEPTED"
  | "EXECUTING"
  | "COMPLETED"
  | "REJECTED"
  | "EMERGENCY_STOP";

export type ExperimentTick = {
  phase: ExperimentPhase;
  stage: PipelineStageId;
  durationMs: number;
  /** Short present-tense status line shown in the control bar while this tick is active. */
  status: string;
};

const stageDuration = (stage: PipelineStageId, ms: number, status: string): ExperimentTick => ({
  phase: "PROCESSING",
  stage,
  durationMs: ms,
  status,
});

/**
 * Builds the full tick sequence for one run, given whether the selected
 * command's demo confidence clears LIVE_GATE_THRESHOLD. Rejected runs stop
 * at the confidence gate — the hand never moves on a rejected command.
 */
export function buildRunSequence(accepted: boolean): ExperimentTick[] {
  const ticks: ExperimentTick[] = [
    stageDuration("eeg", 1100, "Streaming EEG window (simulated)"),
    stageDuration("preprocessing", 1000, "Filtering 1–40 Hz · ICA review · epoching"),
    stageDuration("features", 1000, "CSP + log-variance feature extraction"),
    { phase: "PREDICTING", stage: "cnn-lstm", durationMs: 1300, status: "CNN-LSTM inference" },
    {
      phase: "WAITING_FOR_CONFIDENCE",
      stage: "adaptive-gate",
      durationMs: 900,
      status: "Checking confidence against the gate",
    },
  ];

  if (!accepted) {
    ticks.push({
      phase: "REJECTED",
      stage: "adaptive-gate",
      durationMs: 2200,
      status: "Below threshold — no command issued",
    });
    return ticks;
  }

  ticks.push(
    { phase: "COMMAND_ACCEPTED", stage: "adaptive-gate", durationMs: 500, status: "Command accepted" },
    { phase: "EXECUTING", stage: "ros2", durationMs: 850, status: "Robot abstraction → adapter → ros2_control" },
    { phase: "EXECUTING", stage: "moveit2", durationMs: 850, status: "MoveIt2 motion planning" },
    { phase: "EXECUTING", stage: "gazebo", durationMs: 750, status: "Gazebo Harmonic simulation step" },
    { phase: "EXECUTING", stage: "robot", durationMs: 1300, status: "Robotic hand executing gesture" },
    { phase: "COMPLETED", stage: "robot", durationMs: 2200, status: "Gesture complete" },
  );
  return ticks;
}

export function resolveConfidence(command: GestureId) {
  const gesture = GESTURES.find((g) => g.id === command) ?? GESTURES[0];
  const confidence = gesture.demoConfidence;
  return { confidence, accepted: confidence >= LIVE_GATE_THRESHOLD };
}

export const STAGE_ORDER: readonly PipelineStageId[] = PIPELINE_STAGES.map((s) => s.id);

export function stageIndex(stage: PipelineStageId | null): number {
  if (!stage) return -1;
  return STAGE_ORDER.indexOf(stage);
}

/** Per-station "system status" readout — READY unless mid-run or stopped. */
export type SystemStatusRow = { id: string; label: string; value: string };

export function systemStatus(phase: ExperimentPhase): SystemStatusRow[] {
  const busy = phase !== "IDLE" && phase !== "COMPLETED" && phase !== "REJECTED" && phase !== "EMERGENCY_STOP";
  const stopped = phase === "EMERGENCY_STOP";
  const robotState = stopped
    ? "STOPPED"
    : phase === "EXECUTING" || phase === "COMPLETED"
      ? phase === "COMPLETED"
        ? "COMPLETED"
        : "EXECUTING"
      : "IDLE";
  return [
    { id: "eeg", label: "EEG Input", value: stopped ? "STOPPED" : "READY" },
    { id: "model", label: "AI Model", value: stopped ? "STOPPED" : busy ? "BUSY" : "READY" },
    { id: "gate", label: "Adaptive Gate", value: stopped ? "STOPPED" : "READY" },
    { id: "ros2", label: "ROS 2", value: stopped ? "STOPPED" : "READY" },
    { id: "gazebo", label: "Gazebo", value: stopped ? "STOPPED" : "READY" },
    { id: "robot", label: "Robot", value: robotState },
  ];
}
