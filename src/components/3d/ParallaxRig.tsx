"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type { PerspectiveCamera } from "three";
import { CAMERA, CAMERA_DISTANCE, CAMERA_TARGET_Y } from "./sceneConfig";

// Very light camera parallax: the camera drifts a couple of degrees around the
// AI Core following the (smoothed) pointer, then eases back to the exact
// reference framing when the pointer leaves. Never spins, never drifts on its own.

const MAX_YAW = (2.6 * Math.PI) / 180;
const MAX_PITCH = (1.3 * Math.PI) / 180;
const BASE_PITCH = (CAMERA.pitchDeg * Math.PI) / 180;

// Orbits the camera around the AI Core by (yaw, pitch) offsets from the reference pose.
function orbitCamera(camera: PerspectiveCamera, yaw: number, pitch: number) {
  const total = BASE_PITCH + pitch;
  camera.position.set(
    Math.sin(yaw) * Math.cos(total) * CAMERA_DISTANCE,
    CAMERA_TARGET_Y + Math.sin(total) * CAMERA_DISTANCE,
    Math.cos(yaw) * Math.cos(total) * CAMERA_DISTANCE,
  );
  camera.lookAt(0, CAMERA_TARGET_Y, 0);
  camera.updateMatrixWorld();
}

export type PointerState = { x: number; y: number; active: boolean };

export function ParallaxRig({ pointer, enabled }: { pointer: MutableRefObject<PointerState>; enabled: boolean }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const invalidate = useThree((state) => state.invalidate);

  const smoothed = useRef({ yaw: 0, pitch: 0 });

  useFrame((_, delta) => {
    const p = pointer.current;
    const targetYaw = enabled && p.active ? p.x * MAX_YAW : 0;
    const targetPitch = enabled && p.active ? -p.y * MAX_PITCH : 0;
    const k = Math.min(1, delta * 3.2);
    const state = smoothed.current;
    state.yaw += (targetYaw - state.yaw) * k;
    state.pitch += (targetPitch - state.pitch) * k;
    const { yaw, pitch } = state;

    orbitCamera(camera, yaw, pitch);
    if (Math.abs(yaw - targetYaw) > 0.0004 || Math.abs(pitch - targetPitch) > 0.0004) invalidate();
  });

  return null;
}
