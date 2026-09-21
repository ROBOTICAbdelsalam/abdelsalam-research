"use client";

import { getLastActivityOfType, getLastCompletedTask } from "@/lib/ai-lab/labOperations";
import { useAgentLab } from "./AgentLabProvider";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function Row({ label, value, timestamp }: { label: string; value: string; timestamp?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">{label}</span>
      <span className="min-w-0 flex-1 truncate text-right text-xs text-foreground">{value}</span>
      {timestamp && <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted/60">{formatTime(timestamp)}</span>}
    </div>
  );
}

// A compact derived summary (Phase 9 §17) — six facts read straight off
// the existing activities/tasks arrays, no duplicate event store. The
// knowledge/research/project rows show the most recent matching activity
// log line as plain text; only "Current Task" and "Last Completed Task"
// map onto real Task records worth navigating to, so only those two are
// interactive.
export function ActivitySummary() {
  const { tasks, activities, activeTaskId, viewTask } = useAgentLab();

  const latest = activities[activities.length - 1];
  const currentTask = tasks.find((t) => t.id === activeTaskId) ?? null;
  const lastCompleted = getLastCompletedTask(tasks);
  const lastKnowledge = getLastActivityOfType(activities, "knowledge");
  const lastResearch = getLastActivityOfType(activities, "research");
  const lastProject = getLastActivityOfType(activities, "project");

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Activity Summary</p>
      <div className="mt-2 divide-y divide-border">
        <Row label="Latest Activity" value={latest ? latest.message : "No activity yet"} timestamp={latest?.timestamp} />
        {currentTask ? (
          <button type="button" onClick={() => viewTask(currentTask.id)} className="block w-full text-left">
            <Row label="Current Task" value={currentTask.title} />
          </button>
        ) : (
          <Row label="Current Task" value="None — idle" />
        )}
        {lastCompleted ? (
          <button type="button" onClick={() => viewTask(lastCompleted.id)} className="block w-full text-left">
            <Row label="Last Completed Task" value={lastCompleted.title} />
          </button>
        ) : (
          <Row label="Last Completed Task" value="None yet" />
        )}
        <Row label="Last Knowledge Activation" value={lastKnowledge ? lastKnowledge.message : "None yet"} />
        <Row label="Last Research Activation" value={lastResearch ? lastResearch.message : "None yet"} />
        <Row label="Last Project Activation" value={lastProject ? lastProject.message : "None yet"} />
      </div>
    </div>
  );
}
