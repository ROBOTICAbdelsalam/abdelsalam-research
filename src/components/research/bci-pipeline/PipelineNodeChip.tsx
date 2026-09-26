"use client";

import { motion } from "framer-motion";
import { FlaskConical, Network, Sparkles } from "lucide-react";
import type { SignalTone } from "@/components/ui/SignalNode";
import type { PipelineNode } from "@/data/bci-pipeline";

const KIND_ICON = { lab: FlaskConical, ros2: Network, demo: Sparkles } as const;

export function PipelineNodeChip({
  node,
  tone,
  active,
  selected,
  reducedMotion,
  onSelect,
}: {
  node: PipelineNode;
  tone: SignalTone;
  active: boolean;
  selected: boolean;
  reducedMotion: boolean;
  onSelect: () => void;
}) {
  const Icon = KIND_ICON[node.kind];
  const color = `var(--${tone})`;
  const lit = active || selected;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-expanded={selected}
      aria-controls="bci-pipeline-detail"
      aria-label={`${node.code} ${node.title} — view lab details`}
      title={`${node.title} — ${node.purpose}`}
      animate={{
        borderColor: lit ? color : "var(--border)",
        scale: reducedMotion ? 1 : lit ? 1.045 : 1,
        boxShadow: lit ? `0 0 0 1px ${color}33, 0 0 14px ${color}40` : "0 0 0 0 transparent",
      }}
      transition={{ duration: reducedMotion ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group flex w-[92px] shrink-0 flex-col items-center gap-1.5 rounded-xl border bg-surface px-2.5 py-3 text-center focus-visible:outline-2 focus-visible:outline-accent sm:w-[104px]"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
        style={{ borderColor: lit ? color : "var(--border)", color: lit ? color : "var(--muted)" }}
      >
        <Icon size={13} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted">{node.code}</span>
      <span className="text-[11px] font-medium leading-tight text-foreground line-clamp-2">{node.title}</span>
    </motion.button>
  );
}
