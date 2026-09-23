"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { BCICameraRig } from "./BCICameraRig";
import { CAMERA_SHOTS } from "./layout";
import { ImageDiorama } from "./imagescene/ImageDiorama";

export type BCILabSceneProps = {
  active: boolean;
  mobile: boolean;
  dprMax: number;
  onReady: () => void;
};

// The BCI Digital Twin's Canvas — REBUILT for the image-based diorama
// pass. `active`/`mobile`/`dprMax`/`onReady` keep the exact same contract
// BCIDigitalTwin.tsx already calls this with (the caller still must pass
// `mobile` to satisfy BCILabSceneProps); only what's inside changed. This
// scene has no per-device geometry to vary, so `mobile` itself isn't
// needed inside — it's simply not destructured. No fog, no scene
// lighting: every visible layer is an unlit (`meshBasicMaterial`) crop of
// the source photo (see ImageDiorama.tsx for why — a dynamic light
// striking a baked-lit photo shifts its colors in a way that reads as
// wrong, not as "lit"), so there is nothing here for a light or fog
// volume to meaningfully affect.
export function BCILabScene({ active, dprMax, onReady }: BCILabSceneProps) {
  // Adaptive pixel ratio: PerformanceMonitor reports sustained frame drops
  // via onDecline/onIncline; the actual DPR step lives here, fed into the
  // Canvas's own dpr range (matching the Hero scene's proven pattern) —
  // kept even though this scene is far lighter than the old procedural
  // room, since it costs nothing idle and is free insurance on low-end
  // devices.
  const [dprFactor, setDprFactor] = useState(1);

  return (
    <Canvas
      dpr={[1, Math.max(1, dprMax * dprFactor)]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: CAMERA_SHOTS.overview.position as unknown as [number, number, number], fov: 50, near: 0.1, far: 30 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x05070a, 1);
        requestAnimationFrame(onReady);
      }}
      style={{ position: "absolute", inset: 0, borderRadius: "inherit" }}
    >
      <PerformanceMonitor onDecline={() => setDprFactor(0.67)} onIncline={() => setDprFactor(1)} flipflops={3} />
      <ImageDiorama />
      <BCICameraRig />
    </Canvas>
  );
}
