"use client";

import { useCallback } from "react";
import { PREPROCESSING, EEG_ACQUISITION } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { DESK_TOP_Y, Workstation } from "../environment/LabFurniture";
import { SIGNAL_PROCESSING_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { drawBackdrop, drawChrome, drawEpochGrid, drawWaveform, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";

// B. SIGNAL PROCESSING STATION — a real desk with three monitors: raw EEG,
// filtered EEG (the thesis's documented 1–40 Hz band-pass), and a combined
// ICA-review / epoching readout (with the documented 29 valid epochs).

export function SignalProcessingStation() {
  const { stage } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "preprocessing";

  const drawRaw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "RAW EEG", "Unfiltered", PANEL.accent);
    drawWaveform(ctx, w, h, { top: h * 0.2, bottom: h * 0.95, channels: 5, color: PANEL.accent, phase: t * 2.4, amplitude: h * 0.05, seed: 5, jitter: 1.6 });
  }, []);

  const drawFiltered = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "FILTERED EEG", `${PREPROCESSING.filterBandHz[0]}–${PREPROCESSING.filterBandHz[1]} Hz band-pass`, PANEL.cyan);
    drawWaveform(ctx, w, h, { top: h * 0.2, bottom: h * 0.95, channels: 5, color: PANEL.cyan, phase: t * 1.7, amplitude: h * 0.026, seed: 5, jitter: 0.55 });
  }, []);

  const drawIcaEpoch = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "ICA REVIEW", undefined, PANEL.amber);
    drawWaveform(ctx, w, h * 0.5, { top: h * 0.19, bottom: h * 0.46, channels: 3, color: PANEL.amber, phase: t * 1.3, amplitude: h * 0.03, seed: 8, jitter: 0.7 });
    ctx.strokeStyle = PANEL.border;
    ctx.beginPath();
    ctx.moveTo(w * 0.035, h * 0.51);
    ctx.lineTo(w * 0.965, h * 0.51);
    ctx.stroke();
    ctx.fillStyle = PANEL.cyan;
    ctx.font = `600 ${Math.round(h * 0.05)}px ui-monospace, monospace`;
    ctx.fillText(`EPOCHING — ${EEG_ACQUISITION.validEpochs} VALID`, w * 0.035, h * 0.6);
    drawEpochGrid(ctx, w, h, { top: h * 0.65, total: 32, valid: EEG_ACQUISITION.validEpochs, color: PANEL.cyan, seed: 9 });
  }, []);

  return (
    <StationZone id="signal-processing" position={SIGNAL_PROCESSING_POSITION}>
      <Workstation />
      <Screen size={[0.46, 0.3]} position={[-0.62, DESK_TOP_Y + 0.3, -0.28]} draw={drawRaw} intervalMs={100} frozen={reducedMotion} glow={PANEL.accent} deskY={DESK_TOP_Y} />
      <Screen size={[0.46, 0.3]} position={[0, DESK_TOP_Y + 0.32, -0.28]} draw={drawFiltered} intervalMs={100} frozen={reducedMotion} glow={PANEL.cyan} deskY={DESK_TOP_Y} />
      <Screen size={[0.46, 0.3]} position={[0.62, DESK_TOP_Y + 0.3, -0.28]} draw={drawIcaEpoch} intervalMs={220} frozen={reducedMotion} glow={PANEL.amber} deskY={DESK_TOP_Y} />
      <Nameplate text="Signal Processing" sub="Filter · ICA · epoching" position={[0, 1.85, 0.55]} accent={active ? "#2dd4c8" : "#5b9dff"} />
    </StationZone>
  );
}
