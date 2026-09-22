"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { ROOM } from "../layout";

// Lighting recalibrated for the realism pass's much shorter room (a real
// ~3.4m institutional ceiling, not the previous 6m warehouse height) — the
// old point-light intensities (70-90) were tuned for a ~4.6m throw from
// ceiling to desk; at this room's ~2.2m throw the same illuminance needs
// roughly (2.2/4.6)² ≈ 1/4.4 of the intensity. Ambient/hemisphere/
// directional values are distance-independent and carry over unchanged.
//
// Base fill stays a muted, mostly neutral cool gray rather than saturated
// blue — the blue/cyan accents (fixture diffusers, Lightformers, DataFlow,
// station emissives) do the "scientific lab" color work; a warm practical
// kicker near the EEG end keeps the room from reading as monochrome
// (section 19/20's "do not make everything blue").

export function LabLighting() {
  return (
    <>
      <ambientLight intensity={0.34} color="#3d4a66" />
      <hemisphereLight args={["#3c5170", "#0a0b0d", 0.4]} />

      {/* Recessed ceiling fixtures — matches RealisticLab's physical
          fixture housings 1:1 in X/Z so every glowing panel has a light
          source directly behind it. */}
      {[-9, -4.5, 0, 4.5, 9].map((x) =>
        [-4.5, 1.5].map((z) => (
          <pointLight key={`${x}-${z}`} position={[x, ROOM.wallHeight - 0.3, z]} color="#dce6ff" intensity={20} distance={8} decay={2} />
        )),
      )}

      {/* Cool key light — the room's one shadow-casting light, sized to the
          new (wide, shallow) floor plan in BCILabScene's directional-light
          shadow-camera props. */}
      <directionalLight position={[4, 6, 6]} intensity={1.05} color="#a9c3ff" castShadow shadow-mapSize={[1024, 1024]} />

      {/* Warm practical kicker near the EEG end — the room's main non-blue
          accent besides each desk's own lamp. */}
      <pointLight position={[-9.5, 2.2, -3.5]} color="#e0a23d" intensity={9} distance={7} decay={2} />

      {/* A small, cheap synthetic environment (one baked frame) so
          metallic PBR surfaces — the real desk/stool/rack GLBs included —
          have something restrained to reflect. */}
      <Environment resolution={64} frames={1} environmentIntensity={0.5}>
        <Lightformer form="rect" color="#3a63ff" intensity={2} position={[-10, 3, 0]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="rect" color="#2dd4c8" intensity={1.4} position={[10, 3, 0]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} />
        <Lightformer form="ring" color="#dce6ff" intensity={2} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={5} />
      </Environment>
    </>
  );
}
