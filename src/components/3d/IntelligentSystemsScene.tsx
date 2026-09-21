"use client";

import { lazy, Suspense, useLayoutEffect, useMemo, useState, type MutableRefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import type { PerspectiveCamera } from "three";
import { AICore } from "./AICore";
import { Backdrop } from "./Backdrop";
import { Floor } from "./Floor";
import { SceneLighting } from "./SceneLighting";
import { ParallaxRig, type PointerState } from "./ParallaxRig";
import { SceneController } from "./SceneController";
import { SignalNetwork } from "./SignalNetwork";
import { SystemNode } from "./SystemNode";
import { pointScaleUniform, timeUniform } from "./materials";
import { REF, CAMERA, SYSTEM_LAYOUT, applyReferenceView, buildReferenceCamera, type SystemId } from "./sceneConfig";
import { SceneSettingsContext } from "./sceneContext";
import { isSystemVisible, type SceneMode, type SceneView } from "./sceneView";

// Dev-only calibration markers (`?heromarks`), tree-shaken from production.
const CalibrationMarkers =
  process.env.NODE_ENV === "production" ? null : lazy(() => import("./dev/CalibrationMarkers"));

export type IntelligentSystemsSceneProps = {
  view: SceneView;
  mode: SceneMode;
  /** Whether the frame loop should run (false when off-screen, tab hidden, or reduced motion). */
  active: boolean;
  reducedMotion: boolean;
  dprMax: number;
  onReady: () => void;
  /** System currently highlighted (pointer over a node or its card, or keyboard focus). */
  hovered: SystemId | null;
  onHover: (id: SystemId | null) => void;
  pointer: MutableRefObject<PointerState>;
};

const HALF_FOV_TAN = Math.tan((CAMERA.fov * Math.PI) / 360);

// Re-aims the shared reference camera whenever the canvas is resized, keeps
// point-sprite sizing in step with the canvas scale, and asks for a frame
// (the loop is on-demand while paused).
function ViewSync({ camera, view }: { camera: PerspectiveCamera; view: SceneView }) {
  const invalidate = useThree((state) => state.invalidate);
  const dpr = useThree((state) => state.viewport.dpr);
  useLayoutEffect(() => {
    applyReferenceView(camera, view.rx, view.ry, view.rw, view.rh);
    pointScaleUniform.value = (REF.h / 2 / HALF_FOV_TAN) * view.scale * dpr;
    invalidate();
  }, [camera, view, dpr, invalidate]);
  return null;
}

// One shared clock for every shader; frozen (at a pleasing phase) when idle.
function Clock({ animate }: { animate: boolean }) {
  useFrame((_, delta) => {
    if (animate) timeUniform.value += delta;
  });
  return null;
}

export function IntelligentSystemsScene({
  view,
  mode,
  active,
  reducedMotion,
  dprMax,
  onReady,
  hovered,
  onHover,
  pointer,
}: IntelligentSystemsSceneProps) {
  // One camera for the lifetime of the canvas; its projection is owned by us
  // (manual), not R3F, so the reference framing can never be overridden.
  const camera = useMemo(() => buildReferenceCamera(), []);
  const settings = useMemo(() => ({ mode, reducedMotion, onHover }), [mode, reducedMotion, onHover]);
  // Adaptive resolution: if frame times slip, step the pixel ratio down (never below 1).
  const [quality, setQuality] = useState(1);
  const [showMarkers] = useState(
    () => process.env.NODE_ENV !== "production" && new URLSearchParams(window.location.search).has("heromarks"),
  );

  return (
    <Canvas
      camera={camera}
      dpr={[1, Math.max(1, dprMax * quality)]}
      frameloop={active ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        requestAnimationFrame(onReady);
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      <SceneSettingsContext.Provider value={settings}>
        <ViewSync camera={camera} view={view} />
        <PerformanceMonitor onDecline={() => setQuality(0.67)} onIncline={() => setQuality(1)} flipflops={3} />
        <Clock animate={!reducedMotion} />
        <SceneController hovered={hovered} reducedMotion={reducedMotion} />
        <ParallaxRig pointer={pointer} enabled={!reducedMotion && mode !== "mobile"} />
        <SceneLighting />
        <Backdrop count={mode === "mobile" ? 4 : undefined} />
        <Floor />
        <AICore />
        <SignalNetwork />
        {SYSTEM_LAYOUT.filter((system) => isSystemVisible(mode, system.id)).map((system) => (
          <SystemNode key={system.id} system={system} />
        ))}
        {CalibrationMarkers && showMarkers && (
          <Suspense fallback={null}>
            <CalibrationMarkers />
          </Suspense>
        )}
      </SceneSettingsContext.Provider>
    </Canvas>
  );
}
