"use client";

import { useCallback } from "react";
import { GESTURES, LIVE_GATE_THRESHOLD, MODEL_NAME } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { DESK_TOP_Y, Workstation } from "../environment/LabFurniture";
import { CNN_LSTM_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { stageIndex } from "../state";
import { drawBackdrop, drawChrome, drawConfidenceBars, drawPipelineChain, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";

// D. CNN-LSTM CLASSIFICATION STATION — the deployed model (CNN-LSTM; no
// other architecture is shown as deployed). One monitor traces
// Input → CNN → LSTM → Classification → Confidence; the other shows the six
// gesture classes' probabilities, the selected command highlighted.

const CHAIN = ["INPUT", "CNN", "LSTM", "CLASS", "CONF"];

export function CNNLSTMStation() {
  const { stage, command, confidence } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "cnn-lstm";
  const passed = stageIndex(stage) > stageIndex("cnn-lstm");

  const drawChain = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "CNN-LSTM CLASSIFICATION", `Deployed model: ${MODEL_NAME}`, PANEL.accent);
      const activeIndex = active ? Math.floor(t * 1.6) % CHAIN.length : passed ? CHAIN.length - 1 : -1;
      drawPipelineChain(ctx, w, h, h * 0.42, h * 0.68, CHAIN, activeIndex, PANEL.accent);
    },
    [active, passed],
  );

  const drawBars = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "CLASS PROBABILITIES", "Six-gesture vocabulary", PANEL.cyan);
      drawConfidenceBars(ctx, w, h, { top: h * 0.2, bottom: h * 0.94, gestures: GESTURES, activeId: command, confidence, threshold: LIVE_GATE_THRESHOLD });
    },
    [command, confidence],
  );

  return (
    <StationZone id="cnn-lstm" position={CNN_LSTM_POSITION}>
      <Workstation />
      <Screen size={[0.52, 0.3]} position={[-0.35, DESK_TOP_Y + 0.3, -0.28]} draw={drawChain} intervalMs={90} frozen={reducedMotion} glow={PANEL.accent} deskY={DESK_TOP_Y} />
      <Screen size={[0.52, 0.34]} position={[0.35, DESK_TOP_Y + 0.32, -0.28]} draw={drawBars} intervalMs={200} frozen={reducedMotion} glow={PANEL.cyan} deskY={DESK_TOP_Y} />
      <Nameplate text="CNN-LSTM" sub="Motor-imagery classification" position={[0, 1.85, 0.55]} accent={active ? "#2dd4c8" : "#5b9dff"} />
    </StationZone>
  );
}
