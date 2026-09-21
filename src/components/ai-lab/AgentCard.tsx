"use client";

import type { LucideIcon } from "lucide-react";
import type { Agent } from "@/lib/ai-lab/types";
import { STATUS_META } from "@/lib/ai-lab/statusMeta";
import { SignalNode } from "@/components/ui/SignalNode";
import { Reveal } from "@/components/ui/Reveal";

export function AgentCard({
  agent,
  icon: Icon,
  selected,
  onSelect,
  delay = 0,
}: {
  agent: Agent;
  icon: LucideIcon;
  selected: boolean;
  onSelect: () => void;
  delay?: number;
}) {
  const status = STATUS_META[agent.status];

  return (
    <Reveal delay={delay} className="h-full">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${agent.name} — ${status.label}`}
        className="group relative flex h-full w-full flex-col rounded-2xl border bg-surface p-6 text-left transition-colors duration-300"
        style={{ borderColor: selected ? `var(--${agent.tone})` : "var(--border)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <SignalNode icon={Icon} tone={agent.tone} size={40} />
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-muted"
            title={status.description}
          >
            <span
              className="h-1.5 w-1.5 rounded-full motion-safe:animate-node-pulse"
              style={{ backgroundColor: status.hex }}
              aria-hidden
            />
            {status.label}
          </span>
        </div>

        <h3 className="mt-5 font-display text-lg font-medium tracking-tight">
          {agent.name}
        </h3>
        <p className="mt-1 font-mono text-xs uppercase tracking-[0.1em] text-muted">
          {agent.role}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{agent.summary}</p>

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/70">Current Task</p>
          <p className="mt-1 text-xs text-foreground">{agent.currentTask.title}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${agent.currentTask.progress}%`, backgroundColor: `var(--${agent.tone})` }}
              />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-muted">{agent.currentTask.progress}%</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {agent.focusAreas.map((area) => (
            <span
              key={area}
              className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {area}
            </span>
          ))}
        </div>

        <ul className="relative mt-4 flex flex-col gap-1.5">
          {agent.skills.map((skill) => (
            <li key={skill} className="flex items-center gap-2 font-mono text-xs text-muted">
              <span
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: `var(--${agent.tone})` }}
                aria-hidden
              />
              {skill}
            </li>
          ))}
        </ul>
      </button>
    </Reveal>
  );
}
