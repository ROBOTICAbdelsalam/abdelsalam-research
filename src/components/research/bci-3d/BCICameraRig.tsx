"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { CAMERA_LIMITS, CAMERA_SHOTS, ROOM } from "./layout";

// How far inside the walls the camera/target are kept — the room is
// irregular and off-center (see ROOM in layout.ts), so no single
// azimuth-independent maxDistance can guarantee every orbit angle stays
// inside it; this hard rectangular clamp is what actually does (see the
// realism pass notes on CAMERA_LIMITS.maxDistance).
const WALL_MARGIN = 0.55;
const X_MIN = -ROOM.halfWidth + WALL_MARGIN;
const X_MAX = ROOM.halfWidth - WALL_MARGIN;
const Z_MIN = ROOM.centerZ - ROOM.halfDepth + WALL_MARGIN;
const Z_MAX = ROOM.centerZ + ROOM.halfDepth - WALL_MARGIN;
const Y_MIN = 0.25;
const Y_MAX = ROOM.wallHeight - 0.4;
const ROOM_CLAMP_MIN = new THREE.Vector3(X_MIN, Y_MIN, Z_MIN);
const ROOM_CLAMP_MAX = new THREE.Vector3(X_MAX, Y_MAX, Z_MAX);

// Smooth camera-preset transitions with free orbit/pan/zoom in between —
// same spherical-lerp technique as the AI Lab's CameraRig (see
// src/components/ai-lab/CameraRig.tsx: lerping the offset in spherical
// coordinates, not cartesian, avoids OrbitControls' distance/polar clamps
// pinning a long transition partway through). Pan is enabled here (the AI
// Lab disables it) since this experience's interaction list explicitly
// includes pan.
//
// The correction only runs for a bounded window right after `cameraMode`
// changes (TRANSITION_MS) — earlier versions ran it every frame forever,
// which meant any manual drag/scroll got silently pulled back toward the
// active preset within a second or two. Section 19 explicitly promises
// free orbit/pan/zoom once the guided tour settles ("explore lab"), so the
// rig has to actually let go once a transition finishes.
const TRANSITION_MS = 1300;

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

  const lastMode = useRef(cameraMode);
  const transitionEndAt = useRef(0);

  useEffect(() => {
    if (lastMode.current !== cameraMode) {
      lastMode.current = cameraMode;
      transitionEndAt.current = performance.now() + TRANSITION_MS;
    }
  }, [cameraMode]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (performance.now() < transitionEndAt.current) {
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
    }
    // Outside a transition window, OrbitControls owns the camera outright —
    // this call only applies damping, never pulls position/target back.
    controls.update();

    // Hard safety net, every frame: keep both the orbit target (which
    // `enablePan` lets a user drag anywhere) and the camera itself
    // (however it got wherever it is) inside the room. `target` is
    // persistent state OrbitControls carries frame to frame, so clamping
    // it here sticks cleanly; clamping camera.position is a cheap belt-
    // and-suspenders on top, since the alternative — a user orbiting or
    // zooming through a wall into an unlit void — is a much worse failure
    // than a camera that stops translating right at the wall.
    controls.target.clamp(ROOM_CLAMP_MIN, ROOM_CLAMP_MAX);
    camera.position.clamp(ROOM_CLAMP_MIN, ROOM_CLAMP_MAX);
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
