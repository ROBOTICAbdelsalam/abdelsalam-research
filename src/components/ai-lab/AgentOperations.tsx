"use client";

import { STATUS_META } from "@/lib/ai-lab/statusMeta";
import { useAgentLab } from "./AgentLabProvider";

// A compact operations-console view of the six agents (Phase 9 §18) — a
// row list, not the AgentRoster's card grid, so it reads as a control-room
// status board rather than a duplicate of the existing roster. Status,
// current task and last activity all come straight from the same Agent
// records AgentRoster/AgentInfoPanel already read. Deliberately no
// ranking, ordering-by-activity, percentage bar or "best agent" — every
// agent is listed in the same fixed order and treated as an equal member
// of the simulated workforce.
export function AgentOperations() {
  const { agents, selectedAgentId, setSelectedAgentId } = useAgentLab();

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Agent Operations</p>
      <div className="mt-3 space-y-1">
        {agents.map((agent) => {
          const status = STATUS_META[agent.status];
          const selected = selectedAgentId === agent.id;
          return (
            <button
              key={agent.id}
              type="button"
              onClick={() => setSelectedAgentId(selected ? null : agent.id)}
              aria-pressed={selected}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-background"
              style={{ backgroundColor: selected ? "var(--background)" : undefined }}
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full motion-safe:animate-node-pulse"
                style={{ backgroundColor: status.hex }}
                aria-hidden
              />
              <span className="w-32 shrink-0 truncate text-xs font-medium text-foreground">{agent.name}</span>
              <span className="w-20 shrink-0 font-mono text-[10px] uppercase tracking-wide" style={{ color: status.hex }}>
                {status.label}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-muted">{agent.currentTask.title}</span>
              <span className="hidden shrink-0 font-mono text-[10px] text-muted/60 sm:block">
                {agent.lastActivity.message}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
