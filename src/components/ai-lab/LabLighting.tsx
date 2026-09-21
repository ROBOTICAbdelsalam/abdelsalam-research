"use client";

import { TONE_HEX } from "@/lib/ai-lab/colors";

// A small, deliberate lighting rig rather than "everything glows": one key
// directional light for depth/contrast (with the only shadow map in the
// scene), soft ambient/hemisphere fill so shadows don't crush to black,
// and two low-intensity accent point lights (blue + teal) that read as the
// room's own instrumentation rather than stage lighting.
export function LabLighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <hemisphereLight args={["#3a4358", "#0a0c10", 0.85]} />

      <directionalLight
        position={[8, 14, 6]}
        intensity={2.4}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />
      <directionalLight position={[-9, 8, -4]} intensity={0.6} />

      <pointLight position={[0, 3.5, 0]} color={TONE_HEX.accent} intensity={18} distance={14} decay={2} />
      <pointLight position={[0, 2.5, -10.4]} color={TONE_HEX.trace} intensity={12} distance={10} decay={2} />
      <pointLight position={[0, 2.5, 10.4]} color={TONE_HEX.accent} intensity={10} distance={10} decay={2} />
    </>
  );
}
