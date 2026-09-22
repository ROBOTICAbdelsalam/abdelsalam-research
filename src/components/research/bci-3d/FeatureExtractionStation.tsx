"use client";

import { useCallback } from "react";
import { GESTURES } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "./BCIExperimentProvider";
import { Desk } from "./Desk";
import { CORE_POSITION, facing, FEATURE_EXTRACTION_POSITION } from "./layout";
import { Nameplate } from "./Nameplate";
import { Screen } from "./Screen";
import { drawBackdrop, drawChrome, drawHeatmap, drawScatter, PANEL } from "./screenTextures";
import { StationShell } from "./StationShell";

// C. FEATURE EXTRACTION / CSP STATION — a two-monitor analysis desk: a CSP
// spatial-pattern heatmap and a log-variance feature-space scatter, the
// scatter highlighting the currently selected command's class cluster.

const YAW = facing(FEATURE_EXTRACTION_POSITION, CORE_POSITION);
const CLASS_COLORS = [PANEL.accent, PANEL.cyan, PANEL.amber, "#8b7bff", "#5cf2a8", "#e0575a"];

export function FeatureExtractionStation() {
  const { stage, command } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "features";
  const activeClass = Math.max(0, GESTURES.findIndex((g) => g.id === command));

  const drawCsp = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "CSP — SPATIAL PATTERNS", "Common Spatial Patterns", PANEL.accent);
    drawHeatmap(ctx, w, h, { top: h * 0.2, bottom: h * 0.95, color: PANEL.accent, seed: 12, cols: 8, rows: 5 });
  }, []);

  const drawScatterPlot = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "LOG-VARIANCE FEATURES", "Feature space", PANEL.cyan);
      drawScatter(ctx, w, h, { top: h * 0.2, bottom: h * 0.95, colors: CLASS_COLORS, seed: 13, highlight: activeClass });
    },
    [activeClass],
  );

  return (
    <StationShell id="feature-extraction" position={FEATURE_EXTRACTION_POSITION} radius={1.5} active={active} tint={PANEL.accent}>
      <group rotation-y={YAW}>
        <Desk width={1.4} depth={0.62} />
        <Screen size={[0.56, 0.38]} position={[-0.35, 1.12, 0]} draw={drawCsp} intervalMs={0} frozen={reducedMotion} glow={PANEL.accent} deskY={0.78} />
        <Screen size={[0.56, 0.38]} position={[0.35, 1.12, 0]} draw={drawScatterPlot} intervalMs={0} frozen={reducedMotion} glow={PANEL.cyan} deskY={0.78} />
      </group>
      <Nameplate text="Feature Extraction" sub="CSP · log-variance" position={[0, 1.85, 1.3]} />
    </StationShell>
  );
}
