"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SignalTone } from "@/components/ui/SignalNode";
import { useInView } from "@/components/3d/hooks";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { PIPELINE_GROUPS, PIPELINE_NODES, type PipelineGroupId, type PipelineNode } from "@/data/bci-pipeline";
import { PipelineNodeChip } from "./PipelineNodeChip";
import { PipelineConnector } from "./PipelineConnector";
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
// speed", not a distraction (see the brief's own §3).
const TICK_MS = 1100;

type FlowItem =
  | { kind: "header"; groupId: PipelineGroupId; label: string }
  | { kind: "node"; node: PipelineNode; index: number }
  | { kind: "connector"; index: number };

function buildFlowItems(): FlowItem[] {
  const items: FlowItem[] = [];
  let lastGroup: PipelineGroupId | null = null;
  PIPELINE_NODES.forEach((node, index) => {
    if (node.group !== lastGroup) {
      const group = PIPELINE_GROUPS.find((g) => g.id === node.group)!;
      items.push({ kind: "header", groupId: group.id, label: group.label });
      lastGroup = node.group;
    } else {
      items.push({ kind: "connector", index });
    }
    items.push({ kind: "node", node, index });
  });
  return items;
}

const FLOW_ITEMS = buildFlowItems();

export function BCIPipeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, "-100px");
  const reducedMotion = useReducedMotion();

  const [tourIndex, setTourIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const running = inView && !reducedMotion && selectedId === null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTourIndex((i) => (i + 1) % PIPELINE_NODES.length);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [running]);

  const selectedNode = useMemo(() => PIPELINE_NODES.find((n) => n.id === selectedId) ?? null, [selectedId]);
  const activeIndex = selectedId
    ? PIPELINE_NODES.findIndex((n) => n.id === selectedId)
    : reducedMotion
      ? -1
      : tourIndex;

  const handleSelect = (node: PipelineNode, index: number) => {
    setSelectedId((current) => (current === node.id ? null : node.id));
    setTourIndex(index);
  };

  const selectedTone = selectedNode ? GROUP_TONE[selectedNode.group] : "accent";

  return (
    <div ref={rootRef}>
      <div className="flex flex-col items-stretch gap-y-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1">
        {FLOW_ITEMS.map((item) => {
          if (item.kind === "header") {
            return (
              <p
                key={`h-${item.groupId}`}
                className="mt-2 w-full font-mono text-[10px] uppercase tracking-[0.2em] text-muted first:mt-0"
              >
                {item.label}
              </p>
            );
          }
          if (item.kind === "connector") {
            return <PipelineConnector key={`c-${item.index}`} active={activeIndex === item.index} reducedMotion={reducedMotion} />;
          }
          return (
            <PipelineNodeChip
              key={item.node.id}
              node={item.node}
              tone={GROUP_TONE[item.node.group]}
              active={activeIndex === item.index}
              selected={selectedId === item.node.id}
              reducedMotion={reducedMotion}
              onSelect={() => handleSelect(item.node, item.index)}
            />
          );
        })}
      </div>

      <PipelineDetailPanel node={selectedNode} tone={selectedTone} onClose={() => setSelectedId(null)} />
    </div>
  );
}
