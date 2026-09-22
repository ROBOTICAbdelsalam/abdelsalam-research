"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createSignalMaterial } from "@/components/3d/materials";
import { useBciExperiment } from "./BCIExperimentProvider";
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
  type Vec3,
} from "./layout";
import type { PipelineStageId } from "@/data/bci-experiment";

// The engineered signal path: one straight spine along the pipeline's Z
// axis (the "always connected" backbone, softly and constantly animated)
// plus a short rib out to each off-spine station, which brightens while
// that station's pipeline stage is the active one. Subtle by design —
// section 18's "current stage illuminates, previous stages stay visible but
// less prominent" — not a web of giant lines.

const SPINE_Y = 0.22;
const RIB_Y = 0.22;
const TINT = "#3fb6ff";
const RESTING_RIB_INTENSITY = 0.28;
const ACTIVE_RIB_INTENSITY = 2.4;

type Rib = { position: Vec3; stage: PipelineStageId | PipelineStageId[] };

const RIBS: Rib[] = [
  { position: SIGNAL_PROCESSING_POSITION, stage: "preprocessing" },
  { position: FEATURE_EXTRACTION_POSITION, stage: "features" },
  { position: CNN_LSTM_POSITION, stage: "cnn-lstm" },
  { position: ADAPTIVE_DECISION_POSITION, stage: "adaptive-gate" },
  { position: ROS2_POSITION, stage: ["ros2", "moveit2"] },
  { position: GAZEBO_POSITION, stage: "gazebo" },
];

export function DataFlow() {
  const { stage } = useBciExperiment();

  const spineCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          new THREE.Vector3(EEG_POSITION[0] * 0.15, SPINE_Y, EEG_POSITION[2]),
          new THREE.Vector3(0, SPINE_Y, SIGNAL_PROCESSING_POSITION[2]),
          new THREE.Vector3(0, SPINE_Y, CNN_LSTM_POSITION[2]),
          new THREE.Vector3(0, SPINE_Y, CORE_POSITION[2]),
          new THREE.Vector3(0, SPINE_Y, ROS2_POSITION[2]),
          new THREE.Vector3(0, SPINE_Y, HAND_POSITION[2] - 0.6),
        ],
        false,
        "centripetal",
      ),
    [],
  );

  const spine = useMemo(() => {
    const geometry = new THREE.TubeGeometry(spineCurve, 48, 0.02, 6, false);
    const intensity = { value: 0.55 };
    const material = createSignalMaterial({ color: TINT, direction: 1, speed: 0.11, pulses: 5, opacity: 0.55, intensity });
    return { geometry, material };
  }, [spineCurve]);

  const ribs = useMemo(
    () =>
      RIBS.map((rib) => {
        const curve = new THREE.CatmullRomCurve3(
          [new THREE.Vector3(0, RIB_Y, rib.position[2]), new THREE.Vector3(rib.position[0] * 0.92, RIB_Y, rib.position[2])],
          false,
        );
        const geometry = new THREE.TubeGeometry(curve, 24, 0.016, 6, false);
        const intensity = { value: RESTING_RIB_INTENSITY };
        const material = createSignalMaterial({ color: TINT, direction: 1, speed: 0.24, pulses: 2, opacity: 0.7, intensity });
        return { rib, geometry, material, intensity };
      }),
    [],
  );

  useEffect(() => {
    ribs.forEach(({ rib, intensity }) => {
      const stages = Array.isArray(rib.stage) ? rib.stage : [rib.stage];
      intensity.value = stage && stages.includes(stage) ? ACTIVE_RIB_INTENSITY : RESTING_RIB_INTENSITY;
    });
  }, [stage, ribs]);

  useEffect(
    () => () => {
      spine.geometry.dispose();
      spine.material.dispose();
      ribs.forEach(({ geometry, material }) => {
        geometry.dispose();
        material.dispose();
      });
    },
    [spine, ribs],
  );

  return (
    <group>
      <mesh geometry={spine.geometry} material={spine.material} renderOrder={2} frustumCulled={false} />
      {ribs.map(({ geometry, material }, i) => (
        <mesh key={i} geometry={geometry} material={material} renderOrder={2} frustumCulled={false} />
      ))}
    </group>
  );
}
