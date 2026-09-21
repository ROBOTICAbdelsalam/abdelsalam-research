"use client";

import type { AgentStatus } from "@/lib/ai-lab/types";
import { STATUS_META } from "@/lib/ai-lab/statusMeta";
import { useAgentLab } from "./AgentLabProvider";

const DEMO_STATUSES: AgentStatus[] = ["idle", "waiting", "thinking", "working", "completed", "error"];

// Development-only demo control (Phase 3 spec §23): lets you manually force
// an agent's status while testing the state-driven visuals, instead of
// waiting on the ambient simulation ticker. `AgentDevControls` itself calls
// no hooks, so the NODE_ENV check can early-return before the hook-using
// panel ever mounts — and since Next.js replaces `process.env.NODE_ENV`
// with a literal at build time, production bundles dead-code-eliminate
// this entire branch. No visitor on the live site ever sees this.
export function AgentDevControls() {
  if (process.env.NODE_ENV !== "development") return null;
  return <AgentDevControlsPanel />;
}

function AgentDevControlsPanel() {
  const { agents, selectedAgentId, setSelectedAgentId, setAgentStatus } = useAgentLab();
  const target = agents.find((a) => a.id === selectedAgentId) ?? agents[0];

  return (
    <div className="pointer-events-auto fixed bottom-4 right-4 z-50 w-56 rounded-xl border border-dashed border-amber bg-surface/95 p-3 shadow-lg backdrop-blur">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber">Dev — Simulation Controls</p>
      <label className="mt-2 block">
        <span className="sr-only">Target agent</span>
        <select
          value={target.id}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="w-full rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] text-foreground"
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </label>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {DEMO_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setAgentStatus(target.id, status)}
            className="rounded-full border px-2 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors"
            style={{
              borderColor: target.status === status ? STATUS_META[status].hex : "var(--border)",
              color: target.status === status ? STATUS_META[status].hex : "var(--muted)",
            }}
          >
            {STATUS_META[status].label}
          </button>
        ))}
      </div>
    </div>
  );
}
