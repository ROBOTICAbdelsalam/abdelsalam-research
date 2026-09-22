"use client";

import { useCallback } from "react";
import { EEG_ACQUISITION, HONESTY_LABELS } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { DESK_TOP_Y, DeskClutter, DeskLamp, LabDesk } from "../environment/LabFurniture";
import { useBciExperiment } from "../BCIExperimentProvider";
import { EEG_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { drawBackdrop, drawChrome, drawKeyValueRows, drawWaveform, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";
import { EEGAmplifier } from "./EEGAmplifier";
import { EEGParticipant } from "./EEGParticipant";

// A. EEG WORKBENCH — a real desk (GLB) with an amplifier, a monitor, and
// the seated participant in front of it, all standing directly on the lab
// floor. The stream is a standing simulated instrument — always animating,
// independent of the pipeline's current stage — labeled unambiguously as
// simulated per the honesty contract.

export function EEGWorkbench() {
  const { stage } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "eeg";

  const drawMonitor = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "EEG ACQUISITION", HONESTY_LABELS.eegInput, PANEL.cyan);
    drawKeyValueRows(ctx, w, h, h * 0.19, [
      { label: "CHANNELS", value: String(EEG_ACQUISITION.channels), color: PANEL.cyan },
      { label: "SAMPLE RATE", value: `${EEG_ACQUISITION.sampleRateHz} Hz`, color: PANEL.cyan },
    ]);
    drawWaveform(ctx, w, h * 0.62, {
      top: h * 0.66,
      bottom: h * 0.98,
      channels: 6,
      color: PANEL.cyan,
      phase: t * 2.1,
      amplitude: h * 0.028,
      seed: 4,
    });
  }, []);

  return (
    <StationZone id="eeg" position={EEG_POSITION} size={[2.6, 2.2, 2.6]}>
      <LabDesk />
      <DeskClutter position={[0.55, DESK_TOP_Y, 0.08]} />
      <EEGAmplifier position={[-0.62, DESK_TOP_Y, -0.16]} />
      <DeskLamp position={[0.82, DESK_TOP_Y, -0.32]} />
      <Screen
        size={[0.58, 0.38]}
        position={[-0.08, DESK_TOP_Y + 0.35, -0.3]}
        draw={drawMonitor}
        intervalMs={90}
        frozen={reducedMotion}
        glow={PANEL.cyan}
        deskY={DESK_TOP_Y}
      />
      <group position={[0, 0, 0.95]}>
        <EEGParticipant />
      </group>
      <Nameplate text="EEG Station" sub="Motor imagery · rear view" position={[0, 1.85, 0.55]} accent={active ? "#2dd4c8" : "#5b9dff"} />
    </StationZone>
  );
}
