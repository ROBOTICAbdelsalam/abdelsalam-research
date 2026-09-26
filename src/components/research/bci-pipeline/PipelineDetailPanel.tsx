"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SignalTone } from "@/components/ui/SignalNode";
import type { PipelineNode } from "@/data/bci-pipeline";

// One shared detail panel for the whole pipeline — the same pattern
// BCIInfoPanel already uses for the 3D digital twin's station focus
// (one panel, driven by whichever id is selected) rather than a
// per-node popover.
const FIELD_ROWS: readonly { key: keyof PipelineNode; label: string }[] = [
  { key: "input", label: "Input" },
  { key: "processing", label: "Processing" },
  { key: "output", label: "Output" },
];

export function PipelineDetailPanel({
  node,
  tone,
  highlightFile,
  onClose,
}: {
  node: PipelineNode | null;
  tone: SignalTone;
  highlightFile?: string;
  onClose: () => void;
}) {
  if (!node) return null;
  const color = `var(--${tone})`;

  return (
    <div
      id="bci-pipeline-detail"
      role="region"
      aria-label={`${node.title} details`}
      className="mt-6 rounded-2xl border border-border-strong bg-surface p-6 md:p-8"
      style={{ borderColor: `${color}55` }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide"
            style={{ borderColor: color, color }}
          >
            {node.code}
          </span>
          <h3 className="font-display text-xl font-medium tracking-tight">{node.title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lab details"
          className="shrink-0 text-muted transition-colors hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{node.purpose}</p>

      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {FIELD_ROWS.filter((row) => node[row.key]).map((row) => (
          <div key={row.key}>
            <dt className="font-mono text-[10px] uppercase tracking-wide text-muted">{row.label}</dt>
            <dd className="mt-1 text-sm text-foreground/90">{node[row.key] as string}</dd>
          </div>
        ))}
      </dl>

      {node.technology && node.technology.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Related Technology</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {node.technology.map((tech) => (
              <span key={tech} className="rounded-full border border-border px-3 py-1 text-xs text-foreground/90">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.script && (
        <p className="mt-5 font-mono text-xs text-muted">
          <span className="uppercase tracking-wide text-muted/70">Script — </span>
          <span className="text-accent">{node.script}</span>
        </p>
      )}

      {node.subSteps && node.subSteps.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wide text-muted mb-2">{node.title} — Steps</p>
          <ol className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {node.subSteps.map((step, i) => {
              const isHighlighted = highlightFile === step.file;
              return (
                <li
                  key={step.file}
                  className={cn("flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2.5", isHighlighted && "bg-accent-soft")}
                  style={isHighlighted ? { borderColor: color } : undefined}
                >
                  <span className={cn("text-sm", isHighlighted ? "font-medium text-accent" : "text-foreground/90")}>
                    <span className="mr-2 font-mono text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
                    {step.label}
                  </span>
                  <span className="font-mono text-[11px] text-muted">{step.file}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
