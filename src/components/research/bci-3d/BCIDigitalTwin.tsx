"use client";

import dynamic from "next/dynamic";
import { Component, useRef, useState, type ReactNode } from "react";
import { useInView, useHydrated, useIdle, usePageVisible } from "@/components/3d/hooks";
import { useIsDesktop } from "@/lib/ai-lab/useIsDesktop";
import { useWebglSupport } from "@/lib/ai-lab/useWebglSupport";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HONESTY_LABELS } from "@/data/bci-experiment";
import { BCIExperimentProvider, useBciExperiment } from "./BCIExperimentProvider";
import { BCIInfoPanel } from "./BCIInfoPanel";
import { ExperimentControls } from "./ExperimentControls";
import { ExperimentTimeline } from "./ExperimentTimeline";
import { RunReadout } from "./RunReadout";
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

// The stage's own top overlay: a phase badge + the compact pipeline
// stepper on the left, the honesty label on the right — one slim bar
// instead of two separate floating badges, so the top of the laboratory
// stays mostly clear.
function TopBar() {
  const { phase } = useBciExperiment();
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2 sm:p-3">
      <div className="pointer-events-auto flex max-w-[75%] items-center gap-2 overflow-x-auto rounded-full border border-border-strong bg-surface/90 px-2.5 py-1.5 backdrop-blur">
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.12em] text-accent sm:text-[10px]">{phase.replace(/_/g, " ")}</span>
        <span className="h-4 w-px shrink-0 bg-border" aria-hidden />
        <ExperimentTimeline />
      </div>
      <div className="pointer-events-none shrink-0 rounded-full border border-border-strong bg-surface/85 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-muted backdrop-blur sm:px-2.5 sm:text-[9px]">
        {HONESTY_LABELS.digitalTwin}
      </div>
    </div>
  );
}

// REBUILT again for the image-based diorama pass. The 3D layer itself is
// now a layered reconstruction of public/images/bci-lab-overview.jpg (see
// BCILabScene.tsx / imagescene/ImageDiorama.tsx) — its resting "overview"
// framing is, by construction, that same photo — so there is no longer a
// reason to gate it behind a separate static-preview step: this mounts
// the same way every earlier revision of this section did, once
// hydrated/WebGL-capable/idle/in-view. The container is wide (not the
// old squarer aspect) because the source photo is itself a wide,
// panoramic single frame (EEG left, Core center, hand right) — a taller
// container would crop the two flanking hero elements off-screen.
//
// `lg:aspect-[8/3]` is intentionally NOT reduced further (a UI-scale pass
// tried 21/10 here and it visibly cropped the EEG participant — caught by
// screenshot and reverted). The backdrop plane in ImageDiorama.tsx has a
// safety margin, but it only helps when the camera's position/target
// drift off-center during a transition; at this resting, dead-center
// "overview" framing, the margin does nothing, and the actual no-crop
// aspect floor works out to the source photo's own ~2.73:1 — a hair above
// 8/3 already. Every desktop-height gain since has come from the
// container growing wider at this same aspect, not from a shorter one.
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
      className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border-strong bg-[#05070a] sm:aspect-[16/9] lg:aspect-[8/3]"
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

          <TopBar />

          {reducedMotion ? null : (
            <div className="pointer-events-none absolute right-3 top-12 z-10 hidden rounded-full border border-border-strong bg-surface/80 px-2 py-1 text-[9px] text-muted backdrop-blur sm:top-14 md:block">
              Drag · scroll · click a station
            </div>
          )}

          {/* Bottom-anchored stack: a focused-station card (if any) sits
              above the control bars in normal flow — never independently
              positioned, so they can't overlap. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-2 p-2 sm:p-3">
            <BCIInfoPanel />
            <RunReadout />
            <div className="pointer-events-none w-full">
              <ExperimentControls />
            </div>
          </div>
        </SceneBoundary>
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
      <div className="mt-5">
        <Stage />
      </div>
    </BCIExperimentProvider>
  );
}
