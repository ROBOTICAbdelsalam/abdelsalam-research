"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import type { SignalTone } from "@/components/ui/SignalNode";
import { useInView } from "@/components/3d/hooks";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PIPELINE_GROUPS, PIPELINE_NODES, VISUAL_NODES, type PipelineGroupId, type VisualNode } from "@/data/bci-pipeline";
import { PipelineGroupRow } from "./PipelineGroupRow";
import { PipelineDetailPanel } from "./PipelineDetailPanel";

const GROUP_TONE: Record<PipelineGroupId, SignalTone> = {
  "environment-eeg": "trace",
  "signal-preprocessing": "violet",
  "feature-engineering": "amber",
  "classical-ml": "gold",
  "deep-learning": "accent",
  "adaptive-ai": "violet",
  "real-time-system": "signal-green",
  "ros2-control": "accent",
};

// The tour advances one node every TICK_MS while the pipeline is in view,
// motion is not reduced, and nothing is manually selected — a "controlled
// speed", not a distraction. It now travels the full flattened sequence
// (every sub-lab is its own stop: Lab 01 → … → 07.1 → … → 14.7 → ROS2 →
// Demo), matching the brief's exact §6 request, not the earlier
// family-level-only tour.
const TICK_MS = 900;

type GroupEntry = { node: VisualNode; globalIndex: number };

function buildGroupedEntries(): { groupId: PipelineGroupId; label: string; entries: GroupEntry[] }[] {
  const byGroup = new Map<PipelineGroupId, GroupEntry[]>();
  VISUAL_NODES.forEach((node, globalIndex) => {
    const list = byGroup.get(node.group) ?? [];
    list.push({ node, globalIndex });
    byGroup.set(node.group, list);
  });
  return PIPELINE_GROUPS.map((g) => ({ groupId: g.id, label: g.label, entries: byGroup.get(g.id) ?? [] }));
}

const GROUPED = buildGroupedEntries();

function InterGroupConnector({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const color = active ? "var(--trace)" : "var(--border-strong)";
  return (
    <div className="relative flex h-5 items-center pl-2" aria-hidden>
      <ChevronDown size={13} style={{ color }} strokeWidth={1.75} />
      {active && !reducedMotion && (
        <motion.span
          className="absolute left-2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: "var(--trace)", boxShadow: "0 0 6px var(--trace)" }}
          initial={{ top: "-20%", opacity: 0 }}
          animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}

export function BCIPipeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "-100px");
  const reducedMotion = useReducedMotion();

  const [tourIndex, setTourIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null); // VisualNode id

  const running = inView && !reducedMotion && selectedId === null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTourIndex((i) => (i + 1) % VISUAL_NODES.length);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const selectedVisual = useMemo(() => VISUAL_NODES.find((n) => n.id === selectedId) ?? null, [selectedId]);
  const selectedFamily = useMemo(
    () => (selectedVisual ? (PIPELINE_NODES.find((n) => n.id === selectedVisual.familyId) ?? null) : null),
    [selectedVisual],
  );

  const activeIndex = selectedVisual
    ? VISUAL_NODES.findIndex((n) => n.id === selectedVisual.id)
    : reducedMotion
      ? -1
      : tourIndex;

  const handleSelect = (node: VisualNode, globalIndex: number) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
    setTourIndex(globalIndex);
  };

  const selectedTone = selectedFamily ? GROUP_TONE[selectedFamily.group] : "accent";

  return (
    <div ref={rootRef}>
      <div className="flex flex-col gap-3">
        {GROUPED.map(({ groupId, label, entries }, gi) => (
          <div key={groupId}>
            {gi > 0 && (
              <InterGroupConnector
                active={entries.length > 0 && activeIndex === entries[0].globalIndex}
                reducedMotion={reducedMotion}
              />
            )}
            <PipelineGroupRow
              label={label}
              tone={GROUP_TONE[groupId]}
              entries={entries.map((e) => ({ ...e, active: activeIndex === e.globalIndex }))}
              selectedFamilyId={selectedVisual?.familyId ?? null}
              reducedMotion={reducedMotion}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      <PipelineDetailPanel
        node={selectedFamily}
        tone={selectedTone}
        visual={selectedVisual?.visual}
        highlightFile={selectedVisual?.file}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
