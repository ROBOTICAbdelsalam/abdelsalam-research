"use client";

import { BrainCircuit, Bot, Antenna, Database, Cog, Terminal, Boxes } from "lucide-react";
import type { AgentDomain } from "@/lib/ai-lab/types";
import { labMeta } from "@/data/ai-lab";
import { STATUS_META } from "@/lib/ai-lab/statusMeta";
import { useAgentLab } from "./AgentLabProvider";

const domainIcons: Record<AgentDomain, typeof BrainCircuit> = {
  "artificial-intelligence": BrainCircuit,
  robotics: Bot,
  "brain-computer-interfaces": Antenna,
  "data-science": Database,
  automation: Cog,
  "software-engineering": Terminal,
};

const MESSAGE: Record<"mobile" | "webgl", string> = {
  mobile: "Optimized for desktop — a simplified view is shown here. The full 3D laboratory is available on a larger screen.",
  webgl: "This browser doesn't support WebGL, so a simplified view is shown instead of the 3D laboratory.",
};

// A professional 2D stand-in for the 3D scene — used on smaller viewports
// and when WebGL is unavailable (spec §31–32). It still communicates the
// same core facts as the 3D room: the AI Core, the six agents, and the
// simulation mode — never just an unsupported-browser notice.
export function WebGLFallback({ reason }: { reason: "mobile" | "webgl" }) {
  const { agents } = useAgentLab();

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-foreground">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--trace)" }} aria-hidden />
          ABD AI LAB
        </span>
        <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          Mode — {labMeta.mode}
        </span>
      </div>

      <div className="flex flex-col items-center gap-8 bg-grid px-6 py-12">
        <div className="flex flex-col items-center gap-3">
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full border motion-safe:animate-pulse-slow"
            style={{ borderColor: "var(--accent)" }}
          >
            <Boxes size={28} className="text-accent" strokeWidth={1.5} aria-hidden />
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">AI Core</p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {agents.map((agent) => {
            const Icon = domainIcons[agent.domain];
            const status = STATUS_META[agent.status];
            return (
              <div
                key={agent.id}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center"
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg border"
                  style={{ borderColor: `var(--${agent.tone})`, backgroundColor: `var(--${agent.tone}-soft)` }}
                >
                  <Icon size={16} style={{ color: `var(--${agent.tone})` }} strokeWidth={1.75} aria-hidden />
                </span>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
                  {agent.name}
                </p>
                <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-muted">
                  <span className="h-1 w-1 rounded-full" style={{ backgroundColor: status.hex }} aria-hidden />
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>

        <p className="max-w-md text-center text-xs leading-relaxed text-muted">
          {MESSAGE[reason]} Select an agent in the roster below for details.
        </p>
      </div>
    </div>
  );
}
