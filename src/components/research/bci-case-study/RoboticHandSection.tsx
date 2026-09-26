"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { GESTURES, type GestureId } from "@/data/bci-experiment";
import { ROBOTIC_HAND_SPEC } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// A lightweight, static SVG gesture diagram — deliberately NOT the R3F
// scene (that stays scoped to the digital twin's own HandRig, see
// src/components/research/bci-3d/imagescene/HandRig.tsx). This is a
// standalone reference explorer for the documented gesture vocabulary,
// not a live simulation, so it carries no WebGL cost and no dependency
// on BCIExperimentProvider — selecting a gesture here never touches that
// state machine.
type FingerName = "thumb" | "index" | "middle" | "ring" | "little";

// Openness per finger, 0 = curled into the palm, 1 = fully extended —
// the same "REST / OPEN_HAND / CLOSE_HAND / ..." vocabulary documented
// in BCICommand.msg (see GESTURES in src/data/bci-experiment.ts),
// illustrated here as a simple schematic, not a physical simulation.
const FINGER_OPENNESS: Record<GestureId, Record<FingerName, number>> = {
  REST: { thumb: 0.5, index: 0.5, middle: 0.5, ring: 0.5, little: 0.5 },
  OPEN_HAND: { thumb: 1, index: 1, middle: 1, ring: 1, little: 1 },
  CLOSE_HAND: { thumb: 0.08, index: 0.05, middle: 0.05, ring: 0.05, little: 0.05 },
  PINCH_GRIP: { thumb: 0.35, index: 0.35, middle: 1, ring: 1, little: 1 },
  POWER_GRIP: { thumb: 0.15, index: 0.1, middle: 0.1, ring: 0.1, little: 0.1 },
  POINT: { thumb: 0.2, index: 1, middle: 0.1, ring: 0.1, little: 0.1 },
};

const FINGERS: readonly { name: FingerName; angleDeg: number; length: number }[] = [
  { name: "thumb", angleDeg: -52, length: 34 },
  { name: "index", angleDeg: -22, length: 46 },
  { name: "middle", angleDeg: 0, length: 50 },
  { name: "ring", angleDeg: 22, length: 46 },
  { name: "little", angleDeg: 46, length: 36 },
];

function GestureDiagram({ gesture }: { gesture: GestureId }) {
  const openness = FINGER_OPENNESS[gesture];
  return (
    <svg viewBox="-70 -80 140 100" className="h-40 w-40" role="img" aria-label={`Schematic hand pose for ${gesture.replace(/_/g, " ")}`}>
      <circle cx={0} cy={0} r={14} fill="var(--surface-raised)" stroke="var(--border-strong)" strokeWidth={1.5} />
      {FINGERS.map((finger) => {
        const t = openness[finger.name];
        const fold = 62 * (1 - t); // degrees folded back toward the palm when curled
        const angle = finger.angleDeg - 90 + (finger.angleDeg < 0 ? fold : finger.angleDeg > 0 ? -fold : 0);
        const len = finger.length * (0.45 + 0.55 * t);
        const rad = (angle * Math.PI) / 180;
        const x2 = Math.cos(rad) * len;
        const y2 = Math.sin(rad) * len;
        return (
          <line
            key={finger.name}
            x1={0}
            y1={0}
            x2={x2}
            y2={y2}
            stroke="var(--accent)"
            strokeWidth={7}
            strokeLinecap="round"
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

// 10 ROBOTIC HAND — the documented five-finger, single-joint-per-finger
// hand model, plus an interactive explorer over the six documented
// gestures (defined once in bci_interfaces/msg/BCICommand.msg per
// ARCHITECTURE.md, mirrored on this site as GESTURES).
export function RoboticHandSection() {
  const [selected, setSelected] = useState<GestureId>("OPEN_HAND");

  return (
    <section id="robotic-hand" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={10} title="Robotic Hand" />
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Fingers", value: String(ROBOTIC_HAND_SPEC.fingers) },
            { label: "Joints / Finger", value: `${ROBOTIC_HAND_SPEC.jointsPerFinger} revolute` },
            { label: "Range", value: `${ROBOTIC_HAND_SPEC.rangeRad[0]}–${ROBOTIC_HAND_SPEC.rangeRad[1]} rad` },
            { label: "Gestures", value: String(GESTURES.length) },
          ].map((fact) => (
            <div key={fact.label} className="rounded-xl border border-border bg-surface p-4 text-center">
              <p className="font-display text-lg font-medium tracking-tight">{fact.value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">{fact.label}</p>
            </div>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <div className="rounded-2xl border border-border-strong bg-surface p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-5">Gesture Explorer</p>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div
                role="group"
                aria-label="Select a gesture"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3"
              >
                {GESTURES.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={selected === g.id}
                    onClick={() => setSelected(g.id)}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors focus-visible:outline-2 focus-visible:outline-accent",
                      selected === g.id
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border text-muted hover:border-border-strong hover:text-foreground",
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col items-center gap-2">
                <GestureDiagram gesture={selected} />
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{selected.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
