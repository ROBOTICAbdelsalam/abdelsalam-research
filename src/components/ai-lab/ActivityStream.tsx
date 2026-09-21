"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { ActivityType } from "@/lib/ai-lab/types";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useAgentLab } from "./AgentLabProvider";

const TYPE_LABEL: Record<ActivityType, string> = {
  system: "System",
  orchestrator: "Orchestrator",
  agent: "Agent",
  communication: "Comms",
  knowledge: "Knowledge",
  research: "Research",
  project: "Project",
  task: "Task",
  result: "Result",
};

const TYPE_TONE: Record<ActivityType, string> = {
  system: "var(--muted)",
  orchestrator: "var(--accent)",
  agent: "var(--trace)",
  communication: "var(--violet)",
  knowledge: "var(--gold)",
  research: "var(--trace)",
  project: "var(--gold)",
  task: "var(--amber)",
  result: "var(--signal-green)",
};

type FilterKey = "all" | "tasks" | "agents" | "communication" | "knowledge" | "research" | "project" | "system";

const FILTERS: { key: FilterKey; label: string; types: ActivityType[] | null }[] = [
  { key: "all", label: "All", types: null },
  { key: "tasks", label: "Tasks", types: ["task", "result"] },
  { key: "agents", label: "Agents", types: ["agent"] },
  { key: "communication", label: "Communication", types: ["communication"] },
  { key: "knowledge", label: "Knowledge", types: ["knowledge"] },
  { key: "research", label: "Research", types: ["research"] },
  { key: "project", label: "Project", types: ["project"] },
  { key: "system", label: "System", types: ["system", "orchestrator"] },
];

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString(undefined, { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// A compact, read-only log of what the orchestrator/agents have done this
// session (spec §15/§16, upgraded in Phase 5 with communication events) —
// newest first, capped by the orchestrator at 60 entries so this never
// grows unbounded within a session.
export function ActivityStream() {
  const { activities, agents } = useAgentLab();
  const [filter, setFilter] = useState<FilterKey>("all");
  const shouldReduceMotion = useReducedMotion();

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const filtered = activeFilter.types
    ? activities.filter((a) => activeFilter.types!.includes(a.type))
    : activities;
  const ordered = [...filtered].reverse();

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Activity Stream</p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter activity by category">
        {FILTERS.map((item) => {
          const active = item.key === filter;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={active}
              className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-3 max-h-64 space-y-2.5 overflow-y-auto pr-1" aria-live="polite">
        {ordered.length === 0 && <p className="text-xs text-muted">No activity yet — submit a command to begin.</p>}
        {ordered.map((activity) => {
          const agent = activity.agentId ? agents.find((a) => a.id === activity.agentId) : undefined;
          const source = agent ? agent.name.toUpperCase() : TYPE_LABEL[activity.type].toUpperCase();
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
              className="flex items-start gap-3 text-xs"
            >
              <span className="shrink-0 font-mono tabular-nums text-muted/60">{formatTime(activity.timestamp)}</span>
              <span
                className="shrink-0 font-mono font-semibold uppercase tracking-wide"
                style={{ color: TYPE_TONE[activity.type] }}
              >
                {source}
              </span>
              <span className="text-muted">{activity.message}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
