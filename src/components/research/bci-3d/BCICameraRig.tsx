"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { CAMERA_LIMITS, CAMERA_SHOTS } from "./layout";

// Smooth camera-preset transitions with free orbit/pan/zoom in between —
// same spherical-lerp technique as the AI Lab's CameraRig (see
// src/components/ai-lab/CameraRig.tsx: lerping the offset in spherical
// coordinates, not cartesian, avoids OrbitControls' distance/polar clamps
// pinning a long transition partway through). Pan is enabled here (the AI
// Lab disables it) since this experience's interaction list explicitly
// includes pan.
export function BCICameraRig() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const { cameraMode } = useBciExperiment();
  const reducedMotion = useReducedMotion();

  const desiredTarget = useRef(new THREE.Vector3(...CAMERA_SHOTS.overview.target));
  const currentOffset = useRef(new THREE.Vector3());
  const desiredOffset = useRef(new THREE.Vector3());
  const currentSpherical = useRef(new THREE.Spherical());
  const desiredSpherical = useRef(new THREE.Spherical());

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const shot = CAMERA_SHOTS[cameraMode];
    desiredTarget.current.set(...shot.target);

    const lerpFactor = reducedMotion ? 1 : 0.06;
    controls.target.lerp(desiredTarget.current, lerpFactor);

    currentOffset.current.copy(camera.position).sub(controls.target);
    currentSpherical.current.setFromVector3(currentOffset.current);

    desiredOffset.current.set(...shot.position).sub(desiredTarget.current);
    desiredSpherical.current.setFromVector3(desiredOffset.current);

    currentSpherical.current.radius = THREE.MathUtils.lerp(currentSpherical.current.radius, desiredSpherical.current.radius, lerpFactor);
    currentSpherical.current.phi = THREE.MathUtils.lerp(currentSpherical.current.phi, desiredSpherical.current.phi, lerpFactor);
    const thetaGap =
      THREE.MathUtils.euclideanModulo(desiredSpherical.current.theta - currentSpherical.current.theta + Math.PI, Math.PI * 2) - Math.PI;
    currentSpherical.current.theta += thetaGap * lerpFactor;
    currentSpherical.current.makeSafe();

    currentOffset.current.setFromSpherical(currentSpherical.current);
    camera.position.copy(controls.target).add(currentOffset.current);
    controls.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan
      panSpeed={0.6}
      enableDamping
      dampingFactor={0.08}
      minDistance={CAMERA_LIMITS.minDistance}
      maxDistance={CAMERA_LIMITS.maxDistance}
      minPolarAngle={CAMERA_LIMITS.minPolarAngle}
      maxPolarAngle={CAMERA_LIMITS.maxPolarAngle}
      target={CAMERA_SHOTS.overview.target}
    />
  );
}
