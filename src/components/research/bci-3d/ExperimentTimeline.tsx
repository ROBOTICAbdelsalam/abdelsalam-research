"use client";

import { PIPELINE_STAGES } from "@/data/bci-experiment";
import { cn } from "@/lib/utils";
import { useBciExperiment } from "./BCIExperimentProvider";
import { stageIndex } from "./state";

// Section 20 — the whole pipeline, always visible, current stage
// highlighted, so the visitor can follow the run without reading the
// thesis first.
export function ExperimentTimeline() {
  const { stage, phase } = useBciExperiment();
  const currentIndex = stageIndex(stage);
  const rejected = phase === "REJECTED";

  return (
    <ol className="flex flex-wrap gap-1.5" aria-label="Experiment pipeline stages">
      {PIPELINE_STAGES.map((s) => {
        const isCurrent = s.index - 1 === currentIndex;
        const isPast = currentIndex >= 0 && s.index - 1 < currentIndex;
        const isSkipped = rejected && s.index - 1 > currentIndex; // ROS2 → Robot never ran on a rejected command
        return (
          <li
            key={s.id}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors",
              isCurrent && !rejected && "border-accent bg-accent-soft text-accent",
              isCurrent && rejected && "border-[#e0575a66] text-[#e0575a]",
              !isCurrent && isPast && "border-border-strong text-foreground/70",
              !isCurrent && !isPast && "border-border text-muted/60",
              isSkipped && "opacity-40",
            )}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="text-border-strong">{s.code}</span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}
