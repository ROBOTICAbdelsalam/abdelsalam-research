"use client";

import { useCallback } from "react";
import { GESTURES, HONESTY_LABELS, ROS_STACK } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { DESK_TOP_Y, Workstation } from "../environment/LabFurniture";
import { GAZEBO_POSITION } from "../layout";
import { Nameplate } from "../Nameplate";
import { Screen } from "../Screen";
import { drawBackdrop, drawChrome, drawKeyValueRows, PANEL } from "../screenTextures";
import { StationZone } from "../StationZone";

// G. GAZEBO ROBOT SIMULATION STATION — a monitor reading the simulated
// robot's joint/scene state, paired with a small schematic diorama (ground
// grid, palm + five finger chains, a couple of graspable primitives). The
// physical five-finger hand itself stands ahead, at its own robotics
// workcell — this monitor is the operator's read on that simulation,
// explicitly labeled as a WebGL representation, never as a live Gazebo
// connection.

const JOINTS_PER_FINGER = 3;

function drawHandSchematic(ctx: CanvasRenderingContext2D, w: number, h: number, top: number, bottom: number, color: string) {
  const cx = w * 0.5;
  const palmY = bottom - (bottom - top) * 0.22;
  const palmW = w * 0.26;
  const palmH = (bottom - top) * 0.3;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.globalAlpha = 0.85;
  ctx.strokeRect(cx - palmW / 2, palmY - palmH, palmW, palmH);

  const spread = [-1.6, -0.85, 0, 0.85, 1.6];
  spread.forEach((s, i) => {
    const baseX = cx + s * (palmW / 3.6);
    const len = i === 0 ? palmH * 0.55 : palmH * (0.85 + (i === 2 ? 0.18 : 0));
    let x = baseX;
    let y = palmY - palmH;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 1; j <= JOINTS_PER_FINGER; j++) {
      y -= len / JOINTS_PER_FINGER;
      x += i === 0 ? -6 : 0;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    y = palmY - palmH;
    x = baseX;
    for (let j = 0; j <= JOINTS_PER_FINGER; j++) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
      y -= len / JOINTS_PER_FINGER;
      x += i === 0 && j < JOINTS_PER_FINGER ? -6 : 0;
    }
  });
  ctx.globalAlpha = 1;

  ctx.strokeStyle = PANEL.border;
  ctx.lineWidth = 1;
  const gy = bottom - 2;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i * (w * 0.06), gy);
    ctx.lineTo(cx + i * (w * 0.06) * 0.4, gy - (bottom - top) * 0.06);
    ctx.stroke();
  }
  ctx.fillStyle = PANEL.muted;
  ctx.globalAlpha = 0.7;
  ctx.fillRect(cx - palmW * 1.4, gy - 10, 8, 10);
  ctx.beginPath();
  ctx.arc(cx + palmW * 1.35, gy - 6, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function GazeboStation() {
  const { stage, phase, command } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "gazebo" || stage === "robot";
  const label = GESTURES.find((g) => g.id === command)?.label ?? command;

  const robotState =
    phase === "EMERGENCY_STOP"
      ? "STOPPED"
      : phase === "EXECUTING" || phase === "COMMAND_ACCEPTED"
        ? "EXECUTING"
        : phase === "COMPLETED"
          ? "COMPLETED"
          : "IDLE";

  const drawSim = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    drawBackdrop(ctx, w, h);
    drawChrome(ctx, w, h, "GAZEBO / ROBOT SIMULATION", HONESTY_LABELS.gazebo, PANEL.cyan);
    drawHandSchematic(ctx, w, h, h * 0.18, h * 0.98, PANEL.cyan);
  }, []);

  const drawState = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "SIMULATION STATE", ROS_STACK.simulator, PANEL.accent);
      drawKeyValueRows(ctx, w, h, h * 0.2, [
        { label: "ROBOT STATE", value: robotState, color: robotState === "EXECUTING" ? PANEL.cyan : robotState === "STOPPED" ? PANEL.danger : PANEL.text },
        { label: "COMMAND", value: label.toUpperCase() },
        { label: "JOINTS TRACKED", value: "5 fingers × 3" },
      ]);
    },
    [robotState, label],
  );

  return (
    <StationZone id="gazebo" position={GAZEBO_POSITION}>
      <Workstation />
      <Screen size={[0.52, 0.34]} position={[-0.35, DESK_TOP_Y + 0.32, -0.28]} draw={drawSim} intervalMs={0} frozen={reducedMotion} glow={PANEL.cyan} deskY={DESK_TOP_Y} />
      <Screen size={[0.52, 0.34]} position={[0.35, DESK_TOP_Y + 0.32, -0.28]} draw={drawState} intervalMs={0} frozen={reducedMotion} glow={PANEL.accent} deskY={DESK_TOP_Y} />
      <Nameplate text="Gazebo Simulation" sub={ROS_STACK.simulator} position={[0, 1.85, 0.55]} accent={active ? "#2dd4c8" : "#5b9dff"} />
    </StationZone>
  );
}
