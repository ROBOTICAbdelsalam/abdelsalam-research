"use client";

import { motion } from "framer-motion";
import { FlaskConical, Network, Sparkles } from "lucide-react";
import type { SignalTone } from "@/components/ui/SignalNode";
import type { PipelineNodeKind } from "@/data/bci-pipeline";

const KIND_ICON = { lab: FlaskConical, ros2: Network, demo: Sparkles } as const;

// Compact, information-dense node — reference-image node shape (code +
// title + real filename in a short card), not the earlier tall
// icon-on-top chip. Kept short on purpose: many of these sit side by
// side in one row (Lab 11 alone is 10), so height directly limits how
// much of the pipeline is visible at once.
export function PipelineNodeChip({
  code,
  title,
  file,
  kind,
  tone,
  active,
  selected,
  reducedMotion,
  onSelect,
}: {
  code: string;
  title: string;
  file?: string;
  kind: PipelineNodeKind;
  tone: SignalTone;
  active: boolean;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}) {
  const Icon = KIND_ICON[kind];
  const color = `var(--${tone})`;
  const lit = active || selected;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-expanded={selected}
      aria-controls="bci-pipeline-detail"
      aria-label={`${code} ${title} — view lab details`}
      title={file ? `${code} ${title} — ${file}` : `${code} ${title}`}
      animate={{
        borderColor: lit ? color : `${color}40`,
        boxShadow: lit ? `0 0 0 1px ${color}55, 0 0 10px ${color}40` : "0 0 0 0 transparent",
      }}
      transition={{ duration: reducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ backgroundColor: `${color}0d` }}
      className="flex w-[132px] shrink-0 flex-col gap-1 rounded-lg border px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-accent sm:w-[142px]"
    >
      <span className="flex items-center gap-1.5">
        <Icon size={11} strokeWidth={1.75} style={{ color }} aria-hidden />
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color }}>
          {code}
        </span>
      </span>
      <span className="text-[11px] font-medium leading-tight text-foreground line-clamp-2">{title}</span>
      {file && <span className="truncate font-mono text-[8.5px] leading-tight text-muted/80">{file}</span>}
    </motion.button>
  );
}
