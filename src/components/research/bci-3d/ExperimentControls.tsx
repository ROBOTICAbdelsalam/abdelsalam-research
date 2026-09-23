"use client";

import { AlertOctagon, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CAMERA_MODES } from "./layout";
import { GESTURE_LIST, useBciExperiment } from "./BCIExperimentProvider";

// Compact HUD control bars — REBUILT for the overlay pass. Previously a
// large permanent sidebar card (command pills, run buttons, camera pills,
// a system-status grid) sitting beside the canvas at equal visual weight
// to the laboratory itself. That's exactly the "small canvas surrounded by
// a large sidebar" this pass removes: every control below is small enough
// to sit as a floating bar over the bottom of the 3D viewport (see
// BCIDigitalTwin.tsx), so the lab stays the dominant, immediately-visible
// element and the UI reads as secondary. Command/camera selection moved
// from a full row of pill buttons each to a single compact native <select>
// — same functionality and full keyboard operability, far smaller
// footprint, which is the only way six-plus-six options fit into a bar
// that isn't supposed to cover the laboratory.

const DANGER = "#e0575a";

const STATUS_COLOR: Record<string, string> = {
  READY: "var(--signal-green)",
  BUSY: "var(--amber)",
  EXECUTING: "var(--trace)",
  COMPLETED: "var(--trace)",
  IDLE: "var(--muted)",
  STOPPED: DANGER,
};

function HudButton({
  onClick,
  disabled,
  variant = "outline",
  icon,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: "outline" | "primary" | "danger";
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      style={variant === "danger" ? { borderColor: `${DANGER}66`, color: DANGER } : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        variant === "outline" && "border-border-strong text-foreground hover:border-accent hover:text-accent",
        variant === "primary" && "border-transparent bg-foreground text-background hover:opacity-90",
        variant === "danger" && "hover:bg-[#e0575a1a]",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function HudSelect<T extends string>({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: T;
  disabled?: boolean;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex items-center gap-1 rounded-full border border-border bg-surface/60 py-1 pl-2.5 pr-1.5 text-[10px] uppercase tracking-wide text-muted">
      <span className="hidden font-mono sm:inline">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        aria-label={label}
        className="rounded-full bg-transparent py-0.5 pl-1 pr-1 font-mono text-[10px] uppercase tracking-wide text-foreground outline-none disabled:opacity-40"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-surface text-foreground">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ExperimentControls() {
  const { phase, statusText, command, running, paused, systemStatus, cameraMode, selectCommand, setCameraMode, start, pause, resume, reset, emergencyStop } =
    useBciExperiment();

  const canSelectCommand = !running;
  const canStart = phase === "IDLE" || phase === "COMPLETED" || phase === "REJECTED";
  const canEmergencyStop = running || paused;

  return (
    <div className="pointer-events-auto flex flex-col gap-1.5">
      {/* Action bar: run controls + compact command/camera selectors. */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-border-strong bg-surface/95 p-1.5 shadow-lg backdrop-blur">
        {!paused ? (
          <HudButton onClick={start} disabled={!canStart} variant="primary" icon={<Play size={14} aria-hidden />} label="Start" />
        ) : (
          <HudButton onClick={resume} variant="primary" icon={<Play size={14} aria-hidden />} label="Resume" />
        )}
        <HudButton onClick={pause} disabled={!running || paused} icon={<Pause size={14} aria-hidden />} label="Pause" />
        <HudButton onClick={reset} icon={<RotateCcw size={14} aria-hidden />} label="Reset" />
        <HudButton onClick={emergencyStop} disabled={!canEmergencyStop} variant="danger" icon={<AlertOctagon size={14} aria-hidden />} label="E-Stop" />
        <span className="mx-0.5 hidden h-5 w-px bg-border sm:block" />
        <HudSelect label="Command" value={command} disabled={!canSelectCommand} options={GESTURE_LIST} onChange={selectCommand} />
        <HudSelect label="Camera" value={cameraMode} options={CAMERA_MODES} onChange={setCameraMode} />
      </div>

      {/* Status bar: phase + live status text + a compact system-status
          strip. Hidden below `sm:` — the phase badge already lives in the
          top bar (see BCIDigitalTwin.tsx's TopBar), and on the smallest
          screens every extra row of HUD chrome is height the actual
          laboratory doesn't get, which is the one thing this pass is
          trying to protect. */}
      <div className="hidden flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-border bg-surface/85 px-3 py-1.5 backdrop-blur sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-accent">{phase.replace(/_/g, " ")}</span>
        <span className="text-[11px] text-muted">{statusText}</span>
        <span className="ml-auto flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {systemStatus.map((row) => (
            <span key={row.id} className="flex items-center gap-1 text-[10px]" title={`${row.label}: ${row.value}`}>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[row.value] ?? "var(--muted)" }} aria-hidden />
              <span className="hidden text-muted md:inline">{row.label}</span>
              <span className="font-mono font-medium" style={{ color: STATUS_COLOR[row.value] ?? "var(--foreground)" }}>
                {row.value}
              </span>
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}
