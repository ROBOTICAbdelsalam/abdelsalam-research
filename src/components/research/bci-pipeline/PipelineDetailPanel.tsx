"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { SignalTone } from "@/components/ui/SignalNode";
import type { PipelineNode, PipelineVisual } from "@/data/bci-pipeline";

// One shared detail panel for the whole pipeline — the same pattern
// BCIInfoPanel already uses for the 3D digital twin's station focus
// (one panel, driven by whichever id is selected) rather than a
// per-node popover.
const FIELD_ROWS: readonly { key: keyof PipelineNode; label: string }[] = [
  { key: "input", label: "Input" },
  { key: "processing", label: "Processing" },
  { key: "output", label: "Output" },
];

// The same figure the clicked node shows, just larger — "may show a
// larger version of the same figure", not a separate gallery. Real
// figures get their own caption line spelling out that it's a real
// project figure vs. an illustrative diagram, since a bigger image
// removes the small-thumbnail visual cue that distinguished them.
function DetailFigure({ visual, tone }: { visual: PipelineVisual; tone: SignalTone }) {
  const color = `var(--${tone})`;
  const isReal = visual.kind === "experimental" || "src" in visual;

  return (
    <div className="mt-5 max-w-md">
      {"src" in visual ? (
        <span className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-[#05070a]">
          <Image src={visual.src} alt={visual.alt} fill sizes="420px" className="object-contain" loading="lazy" />
        </span>
      ) : (
        <span
          className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border"
          style={{ borderColor: `${color}33`, backgroundColor: `${color}0d` }}
        >
          <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{visual.alt}</span>
        </span>
      )}
      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wide text-muted/70">
        {isReal ? "Real project figure" : "Illustrative diagram — no experimental result"} · {visual.alt}
      </p>
    </div>
  );
}

export function PipelineDetailPanel({
  node,
  tone,
  visual,
  highlightFile,
  onClose,
}: {
  node: PipelineNode | null;
  tone: SignalTone;
  visual?: PipelineVisual;
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

      {visual && <DetailFigure visual={visual} tone={tone} />}

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
