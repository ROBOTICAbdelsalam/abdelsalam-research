"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useWebglSupport } from "@/lib/ai-lab/useWebglSupport";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Reveal } from "@/components/ui/Reveal";
import { HeroVisual } from "@/components/sections/HeroVisual";
import {
  useElementSize,
  useHydrated,
  useIdle,
  useInView,
  usePageVisible,
  useSceneMode,
} from "./hooks";
import type { PointerState } from "./ParallaxRig";
import { CARD_RECTS, SYSTEMS, type SystemId } from "./sceneConfig";
import { computeView } from "./sceneView";
import { SystemCards } from "./SystemCards";

// three / R3F / drei are only fetched on the client, after first paint and
// once the stage is near the viewport — never as part of the initial bundle.
const IntelligentSystemsScene = dynamic(
  () => import("./IntelligentSystemsScene").then((mod) => mod.IntelligentSystemsScene),
  { ssr: false },
);

// Dev-only reference overlay. `process.env.NODE_ENV` is inlined at build time,
// so this branch (and the overlay chunk) is dead-code-eliminated in production.
const ReferenceOverlay =
  process.env.NODE_ENV === "production"
    ? null
    : dynamic(() => import("./dev/ReferenceOverlay"), { ssr: false });

// One element, two placements:
//  • below `lg` — an ordinary in-flow dark stage under the Hero copy;
//  • `lg` and up — pulled out of flow and bled across the right ~64% of the
//    Hero, *behind* the copy (which sits at z-10). In dark mode it dissolves
//    into the page via a mask; in light mode the same dark scene is clipped
//    to a rounded dark panel that starts to the right of the copy.
const STAGE_CLASS = [
  "relative w-full aspect-[5/4] sm:aspect-[16/11] overflow-hidden rounded-3xl border border-border-strong bg-[#050914]",
  "lg:absolute lg:inset-y-[-3.5rem] lg:right-[calc(50%-50vw)] lg:z-0 lg:aspect-auto lg:w-[64vw] lg:rounded-none lg:border-0",
  "lg:[clip-path:inset(0_0_0_24%_round_2.5rem_0_0_2.5rem)]",
  "dark:lg:bg-transparent dark:lg:[clip-path:none]",
  "dark:lg:[mask-image:linear-gradient(to_right,transparent,#000_20%),linear-gradient(to_bottom,transparent,#000_9%,#000_91%,transparent)]",
  "dark:lg:[mask-composite:intersect] dark:lg:[-webkit-mask-composite:source-in]",
].join(" ");

class SceneBoundary extends Component<
  { onError: () => void; children: ReactNode },
  { failed: boolean }
> {
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

export function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const webgl = useWebglSupport();
  const reducedMotion = useReducedMotion();
  const mode = useSceneMode();
  const idle = useIdle();
  const inView = useInView(rootRef, "200px");
  const pageVisible = usePageVisible();
  const size = useElementSize(rootRef);

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  // What is highlighted: whatever the pointer is over in the 3D scene, else
  // the card region under the pointer.
  const [objectHover, setObjectHover] = useState<SystemId | null>(null);
  const [cardHover, setCardHover] = useState<SystemId | null>(null);
  const hovered = objectHover ?? cardHover;
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });
  const onHover = useCallback((id: SystemId | null) => setObjectHover(id), []);

  // Mount the canvas once (WebGL present, browser idle, stage near the
  // viewport). After that it stays mounted and is merely paused when hidden.
  if (!mounted && hydrated && webgl && idle && inView) setMounted(true);

  const view = useMemo(
    () => (size.width > 0 && size.height > 0 ? computeView(size.width, size.height, mode) : null),
    [size.width, size.height, mode],
  );

  // No WebGL, or the scene crashed: fall back to the original 2D visual so
  // the Hero is never left with an empty area.
  const showCards = mode === "full" || mode === "compact";

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = rootRef.current;
    if (!el || !view) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointer.current = { x: (x / rect.width) * 2 - 1, y: (y / rect.height) * 2 - 1, active: true };
    if (!showCards) return;
    // The panels sit under the canvas, so hit-test their reference rectangles.
    const rx = view.rx + x / view.scale;
    const ry = view.ry + y / view.scale;
    const over = SYSTEMS.find((system) => {
      const c = CARD_RECTS[system.id];
      return rx >= c.x - 6 && rx <= c.x + c.w + 6 && ry >= c.y - 6 && ry <= c.y + c.h + 6;
    });
    setCardHover(over ? over.id : null);
  };

  const handlePointerLeave = () => {
    pointer.current = { ...pointer.current, active: false };
    setCardHover(null);
  };

  if ((hydrated && !webgl) || failed) {
    return (
      <Reveal delay={0.15} className="lg:pl-6">
        <HeroVisual />
      </Reveal>
    );
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Interactive 3D scene: a central AI core connected to AI/ML, Robotics, Data, Sensors, Human–Machine Interaction and Automation systems"
      data-hero-scene
      data-ready={ready}
      className={STAGE_CLASS}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* Poster shown until the canvas has drawn its first frame. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: ready ? 0 : 1,
          background:
            "radial-gradient(ellipse 38% 34% at 62% 44%, rgba(46,120,255,0.28), transparent 70%), radial-gradient(ellipse 60% 50% at 60% 70%, rgba(20,60,140,0.22), transparent 75%)",
        }}
      />

      {view && (
        <SystemCards view={view} mode={mode} hovered={hovered} />
      )}

      {/* Where the panels are hidden (tablet / mobile) the systems are still listed for assistive tech. */}
      {!showCards && (
        <ul className="sr-only">
          {SYSTEMS.map((system) => (
            <li key={system.id}>
              {system.title} — {system.subtitle}: {system.bullets.join(", ")}
            </li>
          ))}
        </ul>
      )}

      {mounted && view && (
        <SceneBoundary onError={() => setFailed(true)}>
          <div
            aria-hidden
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: ready ? 1 : 0 }}
          >
            <IntelligentSystemsScene
              view={view}
              mode={mode}
              active={inView && pageVisible && !reducedMotion}
              reducedMotion={reducedMotion}
              dprMax={mode === "mobile" ? 1.25 : 1.5}
              onReady={() => setReady(true)}
              hovered={hovered}
              onHover={onHover}
              pointer={pointer}
            />
          </div>
          {ReferenceOverlay && <ReferenceOverlay view={view} />}
        </SceneBoundary>
      )}
    </div>
  );
}
