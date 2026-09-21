"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { CAMERA_DEFAULT, type Vec3 } from "@/lib/ai-lab/layout";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type CameraFocus = { position: Vec3; target: Vec3 } | null;

// Camera Focus Foundation (spec §23): OVERVIEW by default, smoothly lerping
// to an AGENT FOCUS or KNOWLEDGE FOCUS shot when `focus` is set, and back
// again when it's cleared (the page's "Reset View" control clears it). The
// user can still orbit freely around whichever point is currently active —
// this only drives where that point *is*, not full manual camera control.
export function CameraRig({ focus }: { focus: CameraFocus }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const shouldReduceMotion = useReducedMotion();

  const desiredTarget = useRef(new THREE.Vector3(...CAMERA_DEFAULT.target));
  const currentOffset = useRef(new THREE.Vector3());
  const desiredOffset = useRef(new THREE.Vector3());
  const currentSpherical = useRef(new THREE.Spherical());
  const desiredSpherical = useRef(new THREE.Spherical());

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const targetPoint = focus ? focus.target : CAMERA_DEFAULT.target;
    const positionPoint = focus ? focus.position : CAMERA_DEFAULT.position;
    desiredTarget.current.set(...targetPoint);

    const lerpFactor = shouldReduceMotion ? 1 : 0.07;
    controls.target.lerp(desiredTarget.current, lerpFactor);

    // Interpolate in spherical coordinates around the orbit target, not in
    // raw cartesian space. OrbitControls clamps radius and polar angle
    // independently (minDistance/minPolarAngle etc.), and a shot that
    // swings the camera to a very different direction — like the default
    // overview to the Knowledge Focus shot, on opposite sides of the AI
    // Core — can lerp the cartesian offset vector into an intermediate
    // direction whose radius AND polar angle both land just past a clamp
    // floor. Re-clamping then reconstructs almost exactly the same
    // direction the lerp started from, so the camera gets pinned at the
    // clamp forever instead of ever reaching a perfectly valid final shot.
    // Lerping radius/phi/theta as independent scalars can't cut that
    // corner: each one moves monotonically toward its own target value.
    currentOffset.current.copy(camera.position).sub(controls.target);
    currentSpherical.current.setFromVector3(currentOffset.current);

    desiredOffset.current.set(...positionPoint).sub(desiredTarget.current);
    desiredSpherical.current.setFromVector3(desiredOffset.current);

    currentSpherical.current.radius = THREE.MathUtils.lerp(
      currentSpherical.current.radius,
      desiredSpherical.current.radius,
      lerpFactor
    );
    currentSpherical.current.phi = THREE.MathUtils.lerp(
      currentSpherical.current.phi,
      desiredSpherical.current.phi,
      lerpFactor
    );
    // Shortest-path lerp for the azimuthal angle so a >180° gap doesn't
    // spin the long way around.
    const thetaGap = THREE.MathUtils.euclideanModulo(
      desiredSpherical.current.theta - currentSpherical.current.theta + Math.PI,
      Math.PI * 2
    ) - Math.PI;
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
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={7}
      maxDistance={30}
      minPolarAngle={Math.PI * 0.12}
      maxPolarAngle={Math.PI * 0.49}
      target={CAMERA_DEFAULT.target}
    />
  );
}
