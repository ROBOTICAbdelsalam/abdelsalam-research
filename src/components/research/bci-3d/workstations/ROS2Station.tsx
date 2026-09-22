"use client";

import { useCallback } from "react";
import { HONESTY_LABELS, ROS_STACK } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { DESK_TOP_Y, Workstation } from "../environment/LabFurniture";
import { ROS2_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { drawBackdrop, drawChrome, drawLogLines, drawPipelineChain, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";

// F. ROS 2 / ROBOT CONTROL STATION — the command's path from a normalized
// gesture down to the robot-specific control stack. The dashed line marks
// the abstraction boundary: everything left of it is robot-independent
// (produced by the AI side), everything right of it is where a specific
// robot's adapter and controllers take over.

const CHAIN = ["BCI CMD", "ABSTRACTION", "ADAPTER", "ROS2_CONTROL", "MOVEIT2"];
const BOUNDARY_AFTER = 1; // dashed line drawn after index 1 (ABSTRACTION)

function drawBoundary(ctx: CanvasRenderingContext2D, w: number, h: number, top: number, bottom: number) {
  const pad = w * 0.05;
  const boxSpan = (w - pad * 2) / CHAIN.length;
  const x = pad + boxSpan * (BOUNDARY_AFTER + 1) - 5;
  ctx.strokeStyle = PANEL.amber;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, bottom);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = PANEL.amber;
  ctx.font = `600 ${Math.round(h * 0.032)}px ui-monospace, monospace`;
  ctx.textAlign = "center";
  ctx.fillText("ROBOT-SPECIFIC ↓", x, top - 4);
  ctx.textAlign = "left";
}

export function ROS2Station() {
  const { stage } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "ros2" || stage === "moveit2";

  const drawChain = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "ROBOT ABSTRACTION", "Normalized gesture → robot-specific control", PANEL.accent);
      const idx = stage === "ros2" ? Math.floor(t * 2) % 3 + 1 : stage === "moveit2" ? 4 : -1;
      const top = h * 0.4;
      const bottom = h * 0.62;
      drawPipelineChain(ctx, w, h, top, bottom, CHAIN, idx, PANEL.accent);
      drawBoundary(ctx, w, h, top - 4, bottom + 4);
    },
    [stage],
  );

  const drawLog = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "ROS 2 STACK", HONESTY_LABELS.ros2, PANEL.cyan);
      drawLogLines(ctx, w, h, h * 0.2, [
        { text: ROS_STACK.distro, active: stage === "ros2" },
        { text: `${ROS_STACK.packageCount} ROS 2 packages`, active: stage === "ros2" },
        { text: ROS_STACK.controlStack, active: stage === "ros2" },
        { text: `${ROS_STACK.motionPlanning} motion planning`, active: stage === "moveit2" },
        { text: `Sim target: ${ROS_STACK.simulator}`, active: stage === "gazebo" },
      ], PANEL.cyan);
    },
    [stage],
  );

  return (
    <StationZone id="ros2" position={ROS2_POSITION}>
      <Workstation />
      <Screen size={[0.52, 0.32]} position={[-0.35, DESK_TOP_Y + 0.31, -0.28]} draw={drawChain} intervalMs={110} frozen={reducedMotion} glow={PANEL.accent} deskY={DESK_TOP_Y} />
      <Screen size={[0.52, 0.34]} position={[0.35, DESK_TOP_Y + 0.32, -0.28]} draw={drawLog} intervalMs={0} frozen={reducedMotion} glow={PANEL.cyan} deskY={DESK_TOP_Y} />
      <Nameplate text="ROS 2 Control" sub={`${ROS_STACK.distro} · ${ROS_STACK.controlStack}`} position={[0, 1.85, 0.55]} accent={active ? "#2dd4c8" : "#5b9dff"} />
    </StationZone>
  );
}
