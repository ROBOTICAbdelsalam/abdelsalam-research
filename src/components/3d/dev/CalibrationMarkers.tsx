"use client";

import { CAMERA, SYSTEM_LAYOUT } from "../sceneConfig";

// DEV ONLY (`?heromarks`): wire sphere + platform rings at every reference
// anchor, to check the calibration against the overlay (`?heroref=0.5`).
export default function CalibrationMarkers() {
  return (
    <group>
      <mesh position={[0, CAMERA.sphereHeight, 0]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshBasicMaterial color="#22d3ee" wireframe />
      </mesh>
      {SYSTEM_LAYOUT.map((system) => (
        <group key={system.id} position={system.position}>
          <mesh rotation-x={-Math.PI / 2}>
            <ringGeometry args={[system.radius * 0.94, system.radius, 64]} />
            <meshBasicMaterial color={system.tint} />
          </mesh>
          <mesh rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.08, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
