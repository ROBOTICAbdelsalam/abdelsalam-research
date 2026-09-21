"use client";

import { useState } from "react";
import { Activity, Copy, RotateCcw, Trash2 } from "lucide-react";
import { SYSTEM_STATUS_META } from "@/lib/ai-lab/statusMeta";
import { getActivityByType, buildSessionSummaryText } from "@/lib/ai-lab/labOperations";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useAgentLab } from "./AgentLabProvider";

// The Operations Console's compact status area (Phase 9 §4) — every number
// here is read straight from the SAME state the rest of the lab already
// uses (agents.length, activities.length, …), never a separately tracked
// counter. No health score, no percentage: just what's actually true this
// session (spec §15/§16 — "communicate state, not manufacture quantitative
// credibility").
export function LabOperationsHeader() {
  const {
    agents,
    tasks,
    activities,
    messages,
    systemStatus,
    activeTaskId,
    resetSession,
    clearTaskHistory,
    setSelectedAgentId,
    setSelectedKnowledgeNodeId,
    setSelectedResearchId,
    setSelectedProjectId,
  } = useAgentLab();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy Session Log");
  const shouldReduceMotion = useReducedMotion();

  const statusMeta = SYSTEM_STATUS_META[systemStatus];
  const knowledgeLinks = getActivityByType(activities, "knowledge").length;
  const activeTaskCount = activeTaskId && systemStatus === "processing" ? 1 : 0;

  function resetView() {
    setSelectedAgentId(null);
    setSelectedKnowledgeNodeId(null);
    setSelectedResearchId(null);
    setSelectedProjectId(null);
  }

  function handleResetSession() {
    if (!confirmingReset) {
      setConfirmingReset(true);
      return;
    }
    resetSession();
    setConfirmingReset(false);
  }

  async function copySessionLog() {
    const text = buildSessionSummaryText({ agents, tasks, activities, messages });
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copied");
    } catch {
      setCopyLabel("Copy failed");
    }
    setTimeout(() => setCopyLabel("Copy Session Log"), shouldReduceMotion ? 0 : 2000);
  }

  return (
    <div className="rounded-2xl border border-border-strong bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-foreground">
          <Activity size={14} className="text-accent" aria-hidden />
          Lab Operations
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
          style={{ color: statusMeta.hex }}
          role="status"
          aria-live="polite"
        >
          <span
            className="h-1.5 w-1.5 rounded-full motion-safe:animate-node-pulse"
            style={{ backgroundColor: statusMeta.hex }}
            aria-hidden
          />
          {statusMeta.label}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 font-mono text-[11px] uppercase tracking-wide text-muted sm:grid-cols-4">
        <div>
          <dt className="text-muted/70">Agents</dt>
          <dd className="mt-0.5 text-lg text-foreground normal-case">{agents.length}</dd>
        </div>
        <div>
          <dt className="text-muted/70">Active Task</dt>
          <dd className="mt-0.5 text-lg text-foreground normal-case">{activeTaskCount}</dd>
        </div>
        <div>
          <dt className="text-muted/70">Events</dt>
          <dd className="mt-0.5 text-lg text-foreground normal-case">{activities.length}</dd>
        </div>
        <div>
          <dt className="text-muted/70">Knowledge Links</dt>
          <dd className="mt-0.5 text-lg text-foreground normal-case">{knowledgeLinks}</dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={resetView}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <RotateCcw size={11} aria-hidden />
          Reset View
        </button>
        <button
          type="button"
          onClick={() => clearTaskHistory()}
          disabled={systemStatus === "processing" || tasks.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={11} aria-hidden />
          Clear Task History
        </button>
        <button
          type="button"
          onClick={handleResetSession}
          onBlur={() => setConfirmingReset(false)}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors"
          style={{
            borderColor: confirmingReset ? "#e0574d" : "var(--border)",
            color: confirmingReset ? "#e0574d" : "var(--muted)",
          }}
        >
          {confirmingReset ? "Confirm Reset Session?" : "Reset Lab Session"}
        </button>
        <button
          type="button"
          onClick={copySessionLog}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-trace/30 bg-trace-soft px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-trace transition-colors hover:border-trace"
        >
          <Copy size={11} aria-hidden />
          {copyLabel}
        </button>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted/70">
        Local simulation, session-only — nothing here is persisted, and no real agents, models or external systems
        are involved.
      </p>
    </div>
  );
}
