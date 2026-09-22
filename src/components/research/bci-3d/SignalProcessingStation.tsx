"use client";

import { useCallback } from "react";
import { PREPROCESSING, EEG_ACQUISITION } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { Desk } from "./Desk";
import { CORE_POSITION, facing, SIGNAL_PROCESSING_POSITION } from "./layout";
import { Nameplate } from "./Nameplate";
import { Screen } from "./Screen";
import { drawBackdrop, drawChrome, drawEpochGrid, drawWaveform, PANEL } from "./screenTextures";
import { StationShell } from "./StationShell";

// B. SIGNAL PROCESSING STATION — a three-monitor workstation: raw EEG,
// filtered EEG (the thesis's documented 1–40 Hz band-pass), and a combined
// ICA-review / epoching readout (with the documented 29 valid epochs).

const YAW = facing(SIGNAL_PROCESSING_POSITION, CORE_POSITION);

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
    <StationShell id="signal-processing" position={SIGNAL_PROCESSING_POSITION} radius={1.5} active={active} tint={PANEL.accent}>
      <group rotation-y={YAW}>
        <Desk width={1.7} depth={0.62} />
        <Screen size={[0.5, 0.34]} position={[-0.58, 1.1, 0]} draw={drawRaw} intervalMs={100} frozen={reducedMotion} glow={PANEL.accent} deskY={0.78} />
        <Screen size={[0.5, 0.34]} position={[0, 1.14, 0]} draw={drawFiltered} intervalMs={100} frozen={reducedMotion} glow={PANEL.cyan} deskY={0.78} />
        <Screen size={[0.5, 0.34]} position={[0.58, 1.1, 0]} draw={drawIcaEpoch} intervalMs={220} frozen={reducedMotion} glow={PANEL.amber} deskY={0.78} />
      </group>
      <Nameplate text="Signal Processing" sub="Filter · ICA · epoching" position={[0, 1.85, 1.3]} />
    </StationShell>
  );
}
