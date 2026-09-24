"use client";

import { GESTURES, LIVE_GATE_THRESHOLD } from "@/data/bci-experiment";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { stageIndex } from "./state";

// The confidence-gate and post-run readout — a small DOM strip that
// turns the adaptive gate's decision, and an accepted run's downstream
// hand-off, into explicit text. Driven entirely by the existing state
// machine's own reactive fields (confidence/accepted/phase/stage — see
// BCIExperimentProvider.tsx), never by a timer of its own: the three
// completion chips below light up as `stage`/`phase` actually advance,
// not on a canned delay, so they stay correct even if the run's own
// timing (state.ts) is retuned later.

function fmt(n: number) {
  return n.toFixed(2);
}

export function RunReadout() {
  const { phase, stage, confidence, accepted, command } = useBciExperiment();
  const reducedMotion = useReducedMotion();

  // Nothing to report before the gate has actually run (Start sets
  // confidence/accepted immediately, but revealing the decision before
  // stage 04/05 have visually played out would spoil the sequence), and
  // nothing to report once Emergency Stop has voided the run — the big
  // red EMERGENCY STOP phase badge and STOPPED status row already say
  // everything that matters, and a lingering "Accept" readout beside
  // them would read as contradictory.
  if (confidence === null || accepted === null) return null;
  if (phase === "IDLE" || phase === "PROCESSING" || phase === "PREDICTING" || phase === "EMERGENCY_STOP") return null;

  const gestureLabel = GESTURES.find((g) => g.id === command)?.label ?? command;
  const chipTransition = reducedMotion ? "" : "transition-all duration-400 ease-out";

  if (!accepted) {
    return (
      <div className="pointer-events-none w-full max-w-xs rounded-xl border border-[#e0575a4d] bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{gestureLabel}</span>
          <span className="rounded-full border border-[#e0575a66] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#e0575a]">
            Rejected
          </span>
        </div>
        <p className="mt-1.5 font-mono text-[10px] text-muted">
          Confidence {fmt(confidence)} {"<"} Threshold {fmt(LIVE_GATE_THRESHOLD)}
        </p>
        <p className="mt-1 text-[10px] text-muted/80">Below the gate — no command issued, hand unchanged.</p>
      </div>
    );
  }

  // Chips are gated on real phase/stage progression, not on `accepted`
  // alone — `accepted` (and `confidence`) are set the instant Start is
  // pressed (see BCIExperimentProvider's start()), well before the run
  // has actually reached each of these milestones.
  const commandAccepted = phase === "COMMAND_ACCEPTED" || phase === "EXECUTING" || phase === "COMPLETED";
  const ros2Executed = phase === "COMPLETED" || (phase === "EXECUTING" && stageIndex(stage) > stageIndex("moveit2"));
  const robotCompleted = phase === "COMPLETED";

  const steps = [
    { key: "accepted", label: "Command Accepted", lit: commandAccepted },
    { key: "ros2", label: "ROS 2 Executed", lit: ros2Executed },
    { key: "completed", label: "Robot Completed", lit: robotCompleted },
  ];

  return (
    <div className="pointer-events-none w-full max-w-sm rounded-xl border border-border-strong bg-surface/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{gestureLabel}</span>
        <span className="rounded-full border border-signal-green/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-signal-green">
          Accept
        </span>
      </div>
      <p className="mt-1.5 font-mono text-[10px] text-muted">
        Confidence {fmt(confidence)} {"≥"} Threshold {fmt(LIVE_GATE_THRESHOLD)}
      </p>
      <div className="mt-2 hidden flex-wrap items-center gap-1.5 sm:flex">
        {steps.map((step, i) => (
          <span key={step.key} className="flex items-center gap-1.5">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide",
                chipTransition,
                step.lit ? "border-signal-green/40 bg-signal-green-soft text-signal-green opacity-100" : "border-border text-muted/40 opacity-50",
              )}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-muted/40" aria-hidden>
                →
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
