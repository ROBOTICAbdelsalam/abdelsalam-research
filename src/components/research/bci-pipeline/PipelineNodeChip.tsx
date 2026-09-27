"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  FlaskConical,
  Network as NetworkIcon,
  Sparkles,
  Settings2,
  Database,
  FileText,
  MousePointerClick,
  ScanSearch,
  GitBranch,
  Tag,
  Save,
  ClipboardList,
  BarChart3,
  Lightbulb,
  SlidersHorizontal,
  MessageSquare,
  Gauge,
  RefreshCw,
  Wrench,
  TrendingUp,
  Radio,
  Cpu,
  Crosshair,
  Terminal,
  Activity,
  Network,
} from "lucide-react";
import type { SignalTone } from "@/components/ui/SignalNode";
import type { PipelineNodeKind, PipelineVisual, TechnicalIconKey } from "@/data/bci-pipeline";

const KIND_ICON = { lab: FlaskConical, ros2: NetworkIcon, demo: Sparkles } as const;

// A fixed, small vocabulary of abstract technical icons — deliberately
// plain Lucide glyphs, never a generated chart, so a "no real figure"
// node can never be mistaken for an experimental result. See
// bci-pipeline.ts's own note on which labs this applies to and why.
const TECHNICAL_ICON_MAP: Record<TechnicalIconKey, typeof Settings2> = {
  setup: Settings2,
  database: Database,
  file: FileText,
  select: MousePointerClick,
  detect: ScanSearch,
  split: GitBranch,
  tag: Tag,
  save: Save,
  report: ClipboardList,
  metrics: BarChart3,
  theory: Lightbulb,
  filter: SlidersHorizontal,
  feedback: MessageSquare,
  gate: Gauge,
  loop: RefreshCw,
  update: Wrench,
  trend: TrendingUp,
  stream: Radio,
  cpu: Cpu,
  target: Crosshair,
  terminal: Terminal,
  activity: Activity,
  nodegraph: Network,
};

// The figure area — a real project figure (next/image, lazy-loaded,
// responsive) for `experimental`/real `technical` visuals, or a plain
// centered icon on a flat tone tint for illustrative `technical` ones.
// Same fixed box either way, so rows stay visually even regardless of
// which kind of node sits where.
function NodeFigure({ visual, tone }: { visual: PipelineVisual | undefined; tone: SignalTone }) {
  const color = `var(--${tone})`;

  if (!visual) return null;

  if ("src" in visual) {
    return (
      <span className="relative block h-16 w-full overflow-hidden rounded-md border border-border bg-[#05070a]">
        <Image src={visual.src} alt={visual.alt} fill sizes="162px" className="object-contain" loading="lazy" />
      </span>
    );
  }

  const Icon = TECHNICAL_ICON_MAP[visual.icon];
  return (
    <span
      className="flex h-16 w-full items-center justify-center rounded-md border"
      style={{ borderColor: `${color}33`, backgroundColor: `${color}0d` }}
      role="img"
      aria-label={visual.alt}
    >
      <Icon size={22} strokeWidth={1.5} style={{ color }} aria-hidden />
    </span>
  );
}

// Compact, information-dense node — reference-image node shape (code +
// title + figure + real filename in a short card). Every breakpoint
// keeps this exact structure; only the row around it scrolls.
export function PipelineNodeChip({
  code,
  title,
  file,
  visual,
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
  visual?: PipelineVisual;
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
      className="flex w-[150px] shrink-0 flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-left focus-visible:outline-2 focus-visible:outline-accent sm:w-[162px]"
    >
      <span className="flex items-center gap-1.5">
        <Icon size={11} strokeWidth={1.75} style={{ color }} aria-hidden />
        <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color }}>
          {code}
        </span>
      </span>
      <span className="text-[11px] font-medium leading-tight text-foreground line-clamp-2">{title}</span>
      <NodeFigure visual={visual} tone={tone} />
      {file && <span className="truncate font-mono text-[8.5px] leading-tight text-muted/80">{file}</span>}
    </motion.button>
  );
}
