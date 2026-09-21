import type { AgentStatus, SystemStatus, TaskStatus } from "./types";
import { TONE_HEX } from "./colors";

export type StatusMeta = {
  label: string;
  description: string;
  hex: string;
};

// Single source of truth for what each AgentStatus means and looks like —
// consumed by both the 3D layer (AgentStatusLight, AgentMonitor) and the 2D
// layer (AgentCard, AgentInfoPanel) so the two never drift out of sync.
// "error" uses a small red that isn't otherwise in the lab's palette — a
// near-universal status convention, not a decorative color choice.
export const STATUS_META: Record<AgentStatus, StatusMeta> = {
  idle: {
    label: "Idle",
    description: "Available — not currently assigned to a task.",
    hex: TONE_HEX.trace,
  },
  waiting: {
    label: "Waiting",
    description: "Waiting on input or another agent before continuing.",
    hex: TONE_HEX.amber,
  },
  thinking: {
    label: "Thinking",
    description: "Reasoning about the current task.",
    hex: TONE_HEX.violet,
  },
  working: {
    label: "Working",
    description: "Actively executing the current task.",
    hex: TONE_HEX.accent,
  },
  completed: {
    label: "Completed",
    description: "Just finished a task — returning to idle shortly.",
    hex: TONE_HEX["signal-green"],
  },
  error: {
    label: "Error",
    description: "Task hit an issue and paused for review.",
    hex: "#e0574d",
  },
};

export type SystemStatusMeta = {
  label: string;
  hex: string;
};

// The lab-wide (not per-agent) status readout — Phase 4's Command Center
// badge and Phase 9's Operations Console header both read this same map,
// so "processing" always means the same label/color everywhere it appears.
export const SYSTEM_STATUS_META: Record<SystemStatus, SystemStatusMeta> = {
  ready: { label: "Idle", hex: "var(--muted)" },
  processing: { label: "Simulation Running", hex: "var(--accent)" },
  completed: { label: "Completed", hex: "var(--signal-green)" },
  error: { label: "Simulation Error", hex: "#e0574d" },
};

// TaskStatus and AgentStatus overlap for everything except "queued"/
// "failed" — this borrows STATUS_META's own hex for the shared states so
// the two never disagree on what "thinking"/"working"/"completed" looks
// like, and gives the two task-only states their own small entries rather
// than growing STATUS_META to cover a type it isn't really about. Used by
// TaskHistory, LabLiveState and TaskDetailPanel alike.
export const TASK_STATUS_META: Record<TaskStatus, SystemStatusMeta> = {
  queued: { label: "Queued", hex: "var(--muted)" },
  thinking: { label: STATUS_META.thinking.label, hex: STATUS_META.thinking.hex },
  working: { label: STATUS_META.working.label, hex: STATUS_META.working.hex },
  completed: { label: STATUS_META.completed.label, hex: STATUS_META.completed.hex },
  failed: { label: "Failed", hex: "#e0574d" },
};
