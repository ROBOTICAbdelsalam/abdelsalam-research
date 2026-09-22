"use client";

import { AlertOctagon, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAMERA_MODES } from "./layout";
import { GESTURE_LIST, useBciExperiment } from "./BCIExperimentProvider";

const DANGER = "#e0575a";

function Pill({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40",
        active ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:border-accent/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

const STATUS_COLOR: Record<string, string> = {
  READY: "var(--signal-green)",
  BUSY: "var(--amber)",
  EXECUTING: "var(--trace)",
  COMPLETED: "var(--trace)",
  IDLE: "var(--muted)",
  STOPPED: DANGER,
};

export function ExperimentControls() {
  const { phase, statusText, command, running, paused, systemStatus, cameraMode, selectCommand, setCameraMode, start, pause, resume, reset, emergencyStop } =
    useBciExperiment();

  const canSelectCommand = !running;
  const canStart = phase === "IDLE" || phase === "COMPLETED" || phase === "REJECTED";
  const canEmergencyStop = running || paused;

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5">
      {/* Status line */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent">{phase.replace(/_/g, " ")}</span>
        <span className="text-xs text-muted">{statusText}</span>
      </div>

      {/* Command vocabulary */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Command</p>
        <div className="flex flex-wrap gap-2">
          {GESTURE_LIST.map((g) => (
            <Pill key={g.id} active={command === g.id} disabled={!canSelectCommand} onClick={() => selectCommand(g.id)}>
              {g.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Run controls */}
      <div className="flex flex-wrap items-center gap-2">
        {!paused ? (
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform disabled:cursor-not-allowed disabled:opacity-40 motion-safe:hover:scale-[1.02]"
          >
            <Play size={15} aria-hidden /> Start Experiment
          </button>
        ) : (
          <button
            type="button"
            onClick={resume}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform motion-safe:hover:scale-[1.02]"
          >
            <Play size={15} aria-hidden /> Resume
          </button>
        )}
        <button
          type="button"
          onClick={pause}
          disabled={!running || paused}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Pause size={15} aria-hidden /> Pause
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          <RotateCcw size={15} aria-hidden /> Reset
        </button>
        <button
          type="button"
          onClick={emergencyStop}
          disabled={!canEmergencyStop}
          style={{ borderColor: `${DANGER}66`, color: DANGER }}
          className="ml-auto inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[#e0575a1a]"
        >
          <AlertOctagon size={15} aria-hidden /> Emergency Stop
        </button>
      </div>

      {/* Camera modes */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Camera</p>
        <div className="flex flex-wrap gap-2">
          {CAMERA_MODES.map((mode) => (
            <Pill key={mode.id} active={cameraMode === mode.id} onClick={() => setCameraMode(mode.id)}>
              {mode.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* System status */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">System Status</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
          {systemStatus.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted">{row.label}</span>
              <span className="font-mono font-medium" style={{ color: STATUS_COLOR[row.value] ?? "var(--foreground)" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
