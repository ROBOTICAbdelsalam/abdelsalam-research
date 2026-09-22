"use client";

import dynamic from "next/dynamic";
import { Component, useRef, useState, type ReactNode } from "react";
import { useInView, useHydrated, useIdle, usePageVisible } from "@/components/3d/hooks";
import { useIsDesktop } from "@/lib/ai-lab/useIsDesktop";
import { useWebglSupport } from "@/lib/ai-lab/useWebglSupport";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HONESTY_LABELS } from "@/data/bci-experiment";
import { BCIExperimentProvider } from "./BCIExperimentProvider";
import { BCIInfoPanel } from "./BCIInfoPanel";
import { ExperimentControls } from "./ExperimentControls";
import { ExperimentTimeline } from "./ExperimentTimeline";
import { WebGLFallback } from "./WebGLFallback";

// three / R3F / drei only ship on the client, after first paint, once the
// section is near the viewport — same lazy-loading contract as the Hero's
// 3D module (see src/components/3d/HeroScene.tsx).
const BCILabScene = dynamic(() => import("./BCILabScene").then((mod) => mod.BCILabScene), { ssr: false });

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Stage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const webgl = useWebglSupport();
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotion();
  const idle = useIdle();
  const inView = useInView(rootRef, "200px");
  const pageVisible = usePageVisible();

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!mounted && hydrated && webgl && idle && inView) setMounted(true);

  if ((hydrated && !webgl) || failed) {
    return <WebGLFallback reason={failed ? "error" : "webgl"} />;
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Interactive digital twin of the Hybrid-Adaptive BCI pipeline: EEG through signal processing, feature extraction, CNN-LSTM classification, an adaptive confidence gate, ROS 2, MoveIt2, Gazebo simulation and a simulated five-finger robotic hand"
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border-strong bg-[#05070a] sm:aspect-video lg:aspect-[16/10]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Loading laboratory…</span>
      </div>

      {mounted && (
        <SceneBoundary onError={() => setFailed(true)}>
          <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: ready ? 1 : 0 }}>
            <BCILabScene
              active={inView && pageVisible}
              mobile={!isDesktop}
              dprMax={isDesktop ? 2 : 1.5}
              onReady={() => setReady(true)}
            />
          </div>
          <BCIInfoPanel />
        </SceneBoundary>
      )}

      <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-border-strong bg-surface/85 px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-muted backdrop-blur">
        {HONESTY_LABELS.digitalTwin}
      </div>
      {reducedMotion ? null : (
        <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-border-strong bg-surface/85 px-3 py-1 text-[10px] text-muted backdrop-blur">
          Drag to orbit · scroll to zoom · click a station
        </div>
      )}
    </div>
  );
}

export function BCIDigitalTwin() {
  return (
    <BCIExperimentProvider>
      <SectionHeading
        eyebrow="Interactive 3D Experiment"
        title="Explore the EEG-to-robotic-hand pipeline"
        subtitle="A real-time WebGL digital twin of the implemented thesis pipeline — a research prototype, not a live backend. Select a command, start the experiment, and follow it through preprocessing, classification, the adaptive confidence gate, ROS 2 and Gazebo, to the simulated robotic hand."
      />
      <div className="mt-10 flex flex-col gap-6">
        <ExperimentTimeline />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
          <Stage />
          <ExperimentControls />
        </div>
      </div>
    </BCIExperimentProvider>
  );
}
