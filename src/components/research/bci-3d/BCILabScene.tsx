"use client";

import { useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { timeUniform } from "@/components/3d/materials";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { BCICameraRig } from "./BCICameraRig";
import { BCICore } from "./BCICore";
import { AdaptiveDecisionStation } from "./AdaptiveDecisionStation";
import { CNNLSTMStation } from "./CNNLSTMStation";
import { DataFlow } from "./DataFlow";
import { EEGStation } from "./EEGStation";
import { FeatureExtractionStation } from "./FeatureExtractionStation";
import { GazeboStation } from "./GazeboStation";
import { CAMERA_SHOTS } from "./layout";
import { LabEnvironment, LabLighting } from "./LabEnvironment";
import { ROS2Station } from "./ROS2Station";
import { RoboticHand } from "./RoboticHand";
import { SceneQualityContext } from "./sceneQuality";
import { SignalProcessingStation } from "./SignalProcessingStation";

export type BCILabSceneProps = {
  active: boolean;
  mobile: boolean;
  dprMax: number;
  onReady: () => void;
};

// One shared clock for every shader in the scene (the same singleton the
// Hero's 3D module uses — an intentionally shared, low-level rendering
// utility; the two features never mount on the same page, so there is no
// cross-talk in practice, only one fewer clock implementation to maintain).
function Clock({ animate }: { animate: boolean }) {
  useFrame((_, delta) => {
    if (animate) timeUniform.value += delta;
  });
  return null;
}

// Tints the room's practical lighting briefly toward red while stopped —
// a physical, readable signal for EMERGENCY_STOP beyond the DOM status text.
function EmergencyTint() {
  const { phase } = useBciExperiment();
  const stopped = phase === "EMERGENCY_STOP";
  return stopped ? <pointLight position={[0, 3, 2]} color="#e0575a" intensity={42} distance={16} decay={2} /> : null;
}

export function BCILabScene({ active, mobile, dprMax, onReady }: BCILabSceneProps) {
  const reducedMotion = useReducedMotion();
  const quality = useMemo(() => ({ mobile }), [mobile]);
  // Adaptive pixel ratio: PerformanceMonitor reports sustained frame drops
  // via onDecline/onIncline; the actual DPR step lives here, fed into the
  // Canvas's own dpr range (matching the Hero scene's proven pattern).
  const [dprFactor, setDprFactor] = useState(1);

  return (
    <Canvas
      shadows={!mobile}
      dpr={[1, Math.max(1, dprMax * dprFactor)]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: CAMERA_SHOTS.overview.position as unknown as [number, number, number], fov: 47, near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x05070a, 1);
        requestAnimationFrame(onReady);
      }}
      style={{ position: "absolute", inset: 0, borderRadius: "inherit" }}
    >
      <SceneQualityContext.Provider value={quality}>
        <PerformanceMonitor onDecline={() => setDprFactor(0.67)} onIncline={() => setDprFactor(1)} flipflops={3} />
        <Clock animate={!reducedMotion} />
        <fog attach="fog" args={["#05070a", 16, 34]} />
        <LabLighting />
        <EmergencyTint />
        <LabEnvironment />
        <DataFlow />
        <BCICore />
        <EEGStation />
        <SignalProcessingStation />
        <FeatureExtractionStation />
        <CNNLSTMStation />
        <AdaptiveDecisionStation />
        <ROS2Station />
        <GazeboStation />
        <RoboticHand />
        <BCICameraRig />
      </SceneQualityContext.Provider>
    </Canvas>
  );
}
