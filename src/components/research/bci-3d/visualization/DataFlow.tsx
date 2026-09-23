"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createSignalMaterial } from "@/components/3d/materials";
import { useBciExperiment } from "../BCIExperimentProvider";
import {
  ADAPTIVE_DECISION_POSITION,
  CNN_LSTM_POSITION,
  CORE_POSITION,
  EEG_POSITION,
  FEATURE_EXTRACTION_POSITION,
  GAZEBO_POSITION,
  HAND_POSITION,
  ROS2_POSITION,
  SIGNAL_PROCESSING_POSITION,
} from "../layout";
import type { PipelineStageId } from "@/data/bci-experiment";

// The engineered signal path — REBUILT again for the zone-based layout.
// The stations no longer sit in one line, so the path now genuinely routes
// through the room's distinct areas in pipeline order: EEG room → across
// the AI/BCI cluster → down into the ROS 2/Gazebo control aisle → out to
// the robotics workcell — a conduit connecting real locations, not an
// abstract spine. One rib branches off the cluster to the central core.
// Segments brighten while their pipeline stage is the active one (section
// 22: "current stage illuminates, previous stages stay visible but less
// prominent") — still subtle, not a glowing circuit-board floor.

const PATH_Y = 0.13;
const TINT = "#3fb6ff";
const RESTING_INTENSITY = 0.28;
const ACTIVE_INTENSITY = 2.4;

type Segment = { stage: PipelineStageId | PipelineStageId[]; points: readonly (readonly [number, number, number])[] };

const at = (p: readonly [number, number, number]): [number, number, number] => [p[0], PATH_Y, p[2]];

const SEGMENTS: Segment[] = [
  { stage: "eeg", points: [at(EEG_POSITION), at(SIGNAL_PROCESSING_POSITION)] },
  { stage: "preprocessing", points: [at(SIGNAL_PROCESSING_POSITION), at(FEATURE_EXTRACTION_POSITION)] },
  { stage: "features", points: [at(FEATURE_EXTRACTION_POSITION), at(CNN_LSTM_POSITION)] },
  { stage: "cnn-lstm", points: [at(CNN_LSTM_POSITION), at(ADAPTIVE_DECISION_POSITION)] },
  {
    stage: "adaptive-gate",
    points: [at(ADAPTIVE_DECISION_POSITION), [ADAPTIVE_DECISION_POSITION[0], PATH_Y, -3.2], [ROS2_POSITION[0], PATH_Y, -3.2], at(ROS2_POSITION)],
  },
  { stage: "ros2", points: [at(ROS2_POSITION), at(GAZEBO_POSITION)] },
  {
    stage: ["moveit2", "gazebo"],
    points: [at(GAZEBO_POSITION), [GAZEBO_POSITION[0], PATH_Y, 1.8], [HAND_POSITION[0], PATH_Y, 1.8]],
  },
  { stage: "robot", points: [[HAND_POSITION[0], PATH_Y, 1.8], at(HAND_POSITION)] },
];

// The one branch off the main path: the AI cluster down to the core.
const CORE_RIB: Segment = {
  stage: ["preprocessing", "features", "cnn-lstm"],
  points: [[CNN_LSTM_POSITION[0], PATH_Y, CNN_LSTM_POSITION[2] - 0.6], at(CORE_POSITION)],
};

export function DataFlow() {
  const { stage } = useBciExperiment();

  const segments = useMemo(
    () =>
      [...SEGMENTS, CORE_RIB].map((seg) => {
        const curve = new THREE.CatmullRomCurve3(seg.points.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.15);
        const geometry = new THREE.TubeGeometry(curve, Math.max(16, seg.points.length * 10), 0.018, 6, false);
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
