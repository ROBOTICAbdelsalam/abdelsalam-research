"use client";

import { useCallback } from "react";
import { ADAPTIVE_LAYER_STATE, GESTURES, LIVE_GATE_THRESHOLD } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { ControlConsole, DESK_TOP_Y, Workstation } from "../environment/LabFurniture";
import { ADAPTIVE_DECISION_POSITION, STATION_YAW } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { drawBackdrop, drawChrome, drawKeyValueRows, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";

// E. ADAPTIVE DECISION STATION — two clearly separated readouts:
//  - the live confidence gate this demo actually drives (fixed 0.75 gate),
//    which decides ACCEPT vs NO ACTION for the run in progress;
//  - the adaptive layer's own documented cold-start state (3 feedback
//    samples, 0.90 threshold, WAITING), a static fact panel this demo does
//    not alter — it is never implied that retraining has happened here.

export function AdaptiveDecisionStation() {
  const { stage, phase, command, confidence, accepted } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "adaptive-gate";
  const label = GESTURES.find((g) => g.id === command)?.label ?? command;

  const status =
    phase === "COMMAND_ACCEPTED" || phase === "EXECUTING" || phase === "COMPLETED"
      ? "ACCEPT"
      : phase === "REJECTED"
        ? "NO ACTION"
        : "—";

  const drawGate = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "CONFIDENCE GATE", "Live demo — fixed real-time gate", PANEL.accent);
      drawKeyValueRows(ctx, w, h, h * 0.2, [
        { label: "CONFIDENCE", value: confidence !== null ? confidence.toFixed(2) : "—" },
        { label: "THRESHOLD", value: LIVE_GATE_THRESHOLD.toFixed(2) },
        { label: "STATUS", value: status, color: status === "ACCEPT" ? PANEL.cyan : status === "NO ACTION" ? PANEL.danger : PANEL.muted },
        { label: "COMMAND", value: accepted === false ? "—" : label.toUpperCase() },
      ]);
    },
    [confidence, status, accepted, label],
  );

  const drawAdaptive = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "ADAPTIVE LAYER — COLD START", "Documented state · not driven by this demo", PANEL.amber);
    drawKeyValueRows(ctx, w, h, h * 0.2, [
      { label: "FEEDBACK SAMPLES", value: `${ADAPTIVE_LAYER_STATE.feedbackSamples} / ${ADAPTIVE_LAYER_STATE.coldStartMinSamples}` },
      { label: "FEEDBACK ACCURACY", value: ADAPTIVE_LAYER_STATE.feedbackAccuracy.toFixed(2) },
      { label: "COLD-START THRESHOLD", value: ADAPTIVE_LAYER_STATE.coldStartThreshold.toFixed(2) },
      { label: "STATUS", value: `${ADAPTIVE_LAYER_STATE.status} — ${ADAPTIVE_LAYER_STATE.samplesRemaining} more needed`, color: PANEL.amber },
    ]);
  }, []);

  return (
    <StationZone id="adaptive-decision" position={ADAPTIVE_DECISION_POSITION} rotationY={STATION_YAW["adaptive-decision"] ?? 0}>
      <Workstation />
      <ControlConsole />
      <Screen size={[0.52, 0.34]} position={[-0.35, DESK_TOP_Y + 0.32, -0.28]} draw={drawGate} intervalMs={140} frozen={reducedMotion} glow={PANEL.accent} deskY={DESK_TOP_Y} />
      <Screen size={[0.52, 0.34]} position={[0.35, DESK_TOP_Y + 0.32, -0.28]} draw={drawAdaptive} intervalMs={0} frozen={reducedMotion} glow={PANEL.amber} deskY={DESK_TOP_Y} />
      <Nameplate text="Adaptive Decision" sub="Confidence gate · cold start" position={[0, 1.85, 0.55]} accent={active ? "#2dd4c8" : "#5b9dff"} />
    </StationZone>
  );
}
