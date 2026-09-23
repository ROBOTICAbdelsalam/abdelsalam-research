"use client";

import { X } from "lucide-react";
import { EEG_ACQUISITION, HONESTY_LABELS, MODEL_NAME, ROS_STACK } from "@/data/bci-experiment";
import { useBciExperiment } from "./BCIExperimentProvider";
import type { CameraMode, StationId } from "./layout";

const STATION_INFO: Record<StationId, { title: string; body: string; camera: CameraMode }> = {
  eeg: {
    title: "EEG Station",
    body: `Seated participant wearing a ${EEG_ACQUISITION.channels}-channel EEG cap, sampled at ${EEG_ACQUISITION.sampleRateHz} Hz. ${HONESTY_LABELS.eegInput}.`,
    camera: "eeg",
  },
  "signal-processing": {
    title: "Signal Processing",
    body: "Raw EEG is band-pass filtered (1–40 Hz), reviewed with ICA to reject artifact components, then epoched ahead of feature extraction.",
    camera: "ai",
  },
  "feature-extraction": {
    title: "Feature Extraction / CSP",
    body: "Common Spatial Patterns and log-variance features are computed from each epoch, feeding both the CNN-LSTM classifier and the classical baseline.",
    camera: "ai",
  },
  "cnn-lstm": {
    title: "CNN-LSTM Classification",
    body: `The deployed model (${MODEL_NAME}) decodes motor-imagery intent into class probabilities across the six-gesture vocabulary.`,
    camera: "ai",
  },
  "adaptive-decision": {
    title: "Adaptive Decision",
    body: "A confidence gate decides ACCEPT or NO ACTION for this run. The adaptive layer's own cold-start bookkeeping is shown separately and isn't changed by this demo.",
    camera: "adaptive",
  },
  ros2: {
    title: "ROS 2 Control",
    body: `${ROS_STACK.distro} node graph: a robot-independent command crosses into ${ROS_STACK.controlStack} and ${ROS_STACK.motionPlanning} after the abstraction boundary. ${HONESTY_LABELS.ros2}.`,
    camera: "ros2",
  },
  gazebo: {
    title: "Gazebo Simulation",
    body: `Simulated in ${ROS_STACK.simulator} before any hardware deployment. ${HONESTY_LABELS.gazebo}.`,
    camera: "robot",
  },
  hand: {
    title: "Robotic Hand",
    body: `The simulated five-finger hand executes the accepted gesture. ${HONESTY_LABELS.digitalTwin}.`,
    camera: "robot",
  },
};

export function BCIInfoPanel() {
  const { focusedStation, focusStation, setCameraMode } = useBciExperiment();
  if (!focusedStation) return null;
  const info = STATION_INFO[focusedStation];

  // Deliberately NOT self-positioned (no `absolute`) — REBUILT for the HUD
  // overlay pass. It's now a normal-flow child of the same bottom-anchored
  // flex column as the control bars (see BCIDigitalTwin.tsx's Stage), so
  // when a station is focused this card simply stacks above the controls
  // instead of both being independently `absolute`-positioned and risking
  // overlap at the bottom of the viewport.
  return (
    <div className="pointer-events-auto w-full max-w-xs rounded-xl border border-border-strong bg-surface/95 p-4 shadow-lg backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <h4 className="font-display text-sm font-medium tracking-tight">{info.title}</h4>
        <button
          type="button"
          onClick={() => focusStation(null)}
          aria-label="Close"
          className="shrink-0 text-muted transition-colors hover:text-foreground"
        >
          <X size={15} />
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">{info.body}</p>
      <button
        type="button"
        onClick={() => setCameraMode(info.camera)}
        className="mt-3 rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-accent transition-colors hover:border-accent"
      >
        Focus camera
      </button>
    </div>
  );
}
