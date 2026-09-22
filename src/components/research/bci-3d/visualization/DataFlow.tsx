"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createSignalMaterial } from "@/components/3d/materials";
import { useBciExperiment } from "../BCIExperimentProvider";
import {
  ADAPTIVE_DECISION_POSITION,
  CNN_LSTM_POSITION,
  CORE_POSITION,
  DESK_ROW_Z,
  EEG_POSITION,
  FEATURE_EXTRACTION_POSITION,
  GAZEBO_POSITION,
  HAND_POSITION,
  ROS2_POSITION,
  SIGNAL_PROCESSING_POSITION,
} from "../layout";
import type { PipelineStageId } from "@/data/bci-experiment";

// The engineered signal path — REBUILT for the new left-to-right layout.
// Previously a front-to-back spine with short ribs out to each off-axis
// station; now the desk row itself IS the pipeline order (EEG through
// Gazebo, physically left to right), so one continuous path runs along the
// desk row and curves forward to the robotic hand — no separate ribs
// needed for those seven stations. The only branch is a short rib out to
// the central BCI visualization, which sits forward of the row rather than
// on it. Segments brighten while their pipeline stage is the active one
// (section 22: "current stage illuminates, previous stages stay visible
// but less prominent") — still subtle, not a glowing circuit-board floor.

const PATH_Y = 0.14;
const TINT = "#3fb6ff";
const RESTING_INTENSITY = 0.28;
const ACTIVE_INTENSITY = 2.4;

type Segment = { stage: PipelineStageId | PipelineStageId[]; from: readonly [number, number, number]; to: readonly [number, number, number] };

const ROW_FRONT = DESK_ROW_Z + 1.3; // just in front of the desk row, where the path actually runs

const SEGMENTS: Segment[] = [
  { stage: "eeg", from: [EEG_POSITION[0], PATH_Y, ROW_FRONT], to: [SIGNAL_PROCESSING_POSITION[0], PATH_Y, ROW_FRONT] },
  { stage: "preprocessing", from: [SIGNAL_PROCESSING_POSITION[0], PATH_Y, ROW_FRONT], to: [FEATURE_EXTRACTION_POSITION[0], PATH_Y, ROW_FRONT] },
  { stage: "features", from: [FEATURE_EXTRACTION_POSITION[0], PATH_Y, ROW_FRONT], to: [CNN_LSTM_POSITION[0], PATH_Y, ROW_FRONT] },
  { stage: "cnn-lstm", from: [CNN_LSTM_POSITION[0], PATH_Y, ROW_FRONT], to: [ADAPTIVE_DECISION_POSITION[0], PATH_Y, ROW_FRONT] },
  { stage: "adaptive-gate", from: [ADAPTIVE_DECISION_POSITION[0], PATH_Y, ROW_FRONT], to: [ROS2_POSITION[0], PATH_Y, ROW_FRONT] },
  { stage: "ros2", from: [ROS2_POSITION[0], PATH_Y, ROW_FRONT], to: [GAZEBO_POSITION[0], PATH_Y, ROW_FRONT] },
  {
    stage: ["moveit2", "gazebo"],
    from: [GAZEBO_POSITION[0], PATH_Y, ROW_FRONT],
    to: [HAND_POSITION[0], PATH_Y, HAND_POSITION[2] - 1.2],
  },
  { stage: "robot", from: [HAND_POSITION[0], PATH_Y, HAND_POSITION[2] - 1.2], to: [HAND_POSITION[0], PATH_Y, HAND_POSITION[2] - 0.4] },
];

// The one branch off the main path: EEG→AI territory down to the core.
const CORE_RIB: Segment = {
  stage: ["preprocessing", "features", "cnn-lstm"],
  from: [CNN_LSTM_POSITION[0] - 0.6, PATH_Y, ROW_FRONT],
  to: [CORE_POSITION[0], PATH_Y, CORE_POSITION[2]],
};

export function DataFlow() {
  const { stage } = useBciExperiment();

  const segments = useMemo(
    () =>
      [...SEGMENTS, CORE_RIB].map((seg) => {
        const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(...seg.from), new THREE.Vector3(...seg.to)], false);
        const geometry = new THREE.TubeGeometry(curve, 20, 0.018, 6, false);
        const intensity = { value: RESTING_INTENSITY };
        const material = createSignalMaterial({ color: TINT, direction: 1, speed: 0.16, pulses: 3, opacity: 0.62, intensity });
        return { seg, geometry, material, intensity };
      }),
    [],
  );

  useEffect(() => {
    segments.forEach(({ seg, intensity }) => {
      const stages = Array.isArray(seg.stage) ? seg.stage : [seg.stage];
      intensity.value = stage && stages.includes(stage) ? ACTIVE_INTENSITY : RESTING_INTENSITY;
    });
  }, [stage, segments]);

  useEffect(
    () => () => {
      segments.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [segments],
  );

  return (
    <group>
      {segments.map(({ geometry, material }, i) => (
        <mesh key={i} geometry={geometry} material={material} renderOrder={2} frustumCulled={false} />
      ))}
    </group>
  );
}
