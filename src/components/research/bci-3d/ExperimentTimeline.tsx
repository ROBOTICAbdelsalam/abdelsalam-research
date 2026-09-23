"use client";

import { PIPELINE_STAGES } from "@/data/bci-experiment";
import { cn } from "@/lib/utils";
import { useBciExperiment } from "./BCIExperimentProvider";
import { stageIndex } from "./state";

// A compact numbered-circle stepper — REBUILT for the HUD overlay pass.
// Previously a full-width row of labeled pill badges sitting in its own
// block above the canvas; now small enough to live inside the lab
// viewport's top overlay bar alongside the phase badge, so the 3D
// laboratory stays the dominant visual element (the whole point of this
// pass) rather than the pipeline indicator claiming its own strip of page
// height. Each stage's full name is still available (via `title`, and via
// the DOM screen-reader text), just not rendered inline anymore — reading
// it doesn't require covering more of the lab.

export function ExperimentTimeline() {
  const { stage, phase } = useBciExperiment();
  const currentIndex = stageIndex(stage);
  const rejected = phase === "REJECTED";

  return (
    <ol className="flex shrink-0 items-center" aria-label="Experiment pipeline stages">
      {PIPELINE_STAGES.map((s, i) => {
        const isCurrent = s.index - 1 === currentIndex;
        const isPast = currentIndex >= 0 && s.index - 1 < currentIndex;
        const isSkipped = rejected && s.index - 1 > currentIndex;
        return (
          <li key={s.id} className="flex items-center">
            <span
              title={s.label}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[8px] transition-colors sm:h-6 sm:w-6 sm:text-[9px]",
                isCurrent && !rejected && "border-accent bg-accent-soft text-accent",
                isCurrent && rejected && "border-[#e0575a66] text-[#e0575a]",
                !isCurrent && isPast && "border-border-strong text-foreground/70",
                !isCurrent && !isPast && "border-border text-muted/50",
                isSkipped && "opacity-40",
              )}
            >
              {s.code}
            </span>
            {i < PIPELINE_STAGES.length - 1 && <span className={cn("h-px w-1.5 shrink-0 sm:w-2", isPast ? "bg-border-strong" : "bg-border")} />}
          </li>
        );
      })}
    </ol>
  );
}
