"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
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

// The default, pre-launch view: a static concept image of the laboratory
// (public/images/bci-lab-overview.jpg — the site owner's own commissioned
// reference render, cropped to remove its baked-in mockup UI; not a
// third-party asset, so it isn't in public/models/CREDITS.md, which is
// scoped to licensed 3D models) with a clear "this is a still image" label
// and a single call to action that reveals the real, interactive WebGL
// scene. Nothing here needs WebGL/Three.js at all, so none of that ships
// to the page until a visitor actually asks for it — the section is now
// cheaper by default than it was before this existed, not more expensive.
function StaticHero({ onLaunch }: { onLaunch: () => void }) {
  return (
    <div className="absolute inset-0">
      <Image
        src="/images/bci-lab-overview.jpg"
        alt="Concept rendering of the Hybrid-Adaptive BCI research laboratory: EEG acquisition, the BCI Core, AI processing stations, ROS 2, Gazebo simulation and the robotic hand workcell"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#05070a] from-0% via-[#05070a]/75 via-30% to-transparent to-70%"
        aria-hidden
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-2 sm:p-3">
        <div className="pointer-events-none shrink-0 rounded-full border border-border-strong bg-surface/85 px-2 py-1 font-mono text-[8px] uppercase tracking-wide text-muted backdrop-blur sm:px-2.5 sm:text-[9px]">
          {HONESTY_LABELS.conceptPreview}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-start gap-2 p-3 sm:p-5">
        <p className="max-w-md font-mono text-[10px] uppercase tracking-[0.14em] text-muted sm:text-xs">
          Concept preview · click to explore the real interactive 3D digital twin
        </p>
        <button
          type="button"
          onClick={onLaunch}
          className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <span aria-hidden>▶</span>
          Launch Interactive 3D Lab
        </button>
      </div>
    </div>
  );
}

// REBUILT for the HUD overlay pass — the 3D laboratory is now the primary,
// dominant visual (section 1/7 of the pass), with every control living as
// a small floating bar over the viewport rather than a permanent sidebar
// of equal visual weight to the scene itself. See TopBar above and the
// bottom-anchored stack below; BCIInfoPanel and ExperimentControls share
// one flex column there so a focused-station card and the control bars
// never overlap.
//
// `launched` gates the whole WebGL path behind an explicit visitor action
// (StaticHero's button) — the static concept image above is the default
// view (see that component's own comment for why), and every hook below
// still runs unconditionally (React's rules of hooks), just folded into
// the existing `mounted` gate alongside `launched`.
function Stage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const webgl = useWebglSupport();
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotion();
  const idle = useIdle();
  const inView = useInView(rootRef, "200px");
  const pageVisible = usePageVisible();

  const [launched, setLaunched] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!mounted && launched && hydrated && webgl && idle && inView) setMounted(true);

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Interactive digital twin of the Hybrid-Adaptive BCI pipeline: EEG through signal processing, feature extraction, CNN-LSTM classification, an adaptive confidence gate, ROS 2, MoveIt2, Gazebo simulation and a simulated five-finger robotic hand"
      className={
        launched
          ? "relative aspect-square w-full overflow-hidden rounded-3xl border border-border-strong bg-[#05070a] sm:aspect-video lg:aspect-[16/10]"
          : // The static hero image is a wide, panoramic single frame (EEG
            // left, Core center, hand right) — the launched state's taller
            // 16:10-ish ratio would object-cover-crop the two flanking hero
            // elements almost entirely off-screen. Wider here, so the whole
            // composition the image was built to show stays visible.
            "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-border-strong bg-[#05070a] sm:aspect-[16/9] lg:aspect-[8/3]"
      }
    >
      {!launched && <StaticHero onLaunch={() => setLaunched(true)} />}

      {launched && ((hydrated && !webgl) || failed) && <WebGLFallback reason={failed ? "error" : "webgl"} />}

      {launched && !((hydrated && !webgl) || failed) && (
        <>
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
                <div className="pointer-events-none w-full">
                  <ExperimentControls />
                </div>
              </div>
            </SceneBoundary>
          )}
        </>
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
      <div className="mt-8">
        <Stage />
      </div>
    </BCIExperimentProvider>
  );
}
