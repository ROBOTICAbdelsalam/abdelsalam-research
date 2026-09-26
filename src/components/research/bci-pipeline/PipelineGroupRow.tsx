"use client";

import type { SignalTone } from "@/components/ui/SignalNode";
import type { VisualNode } from "@/data/bci-pipeline";
import { PipelineNodeChip } from "./PipelineNodeChip";
import { PipelineConnector } from "./PipelineConnector";

// One row per research stage — the reference diagram's own structure
// (a colored banner, then a dense strip of every lab/sub-lab in that
// stage). Rows never wrap: at any width narrower than a row's natural
// content width, that ONE row scrolls horizontally within itself
// (overflow-x-auto), never the page — the brief's own explicit
// preference over shrinking nodes until they're unreadable.
export function PipelineGroupRow({
  label,
  tone,
  entries,
  selectedFamilyId,
  reducedMotion,
  onSelect,
}: {
  label: string;
  tone: SignalTone;
  entries: readonly { node: VisualNode; globalIndex: number; active: boolean }[];
  selectedFamilyId: string | null;
  reducedMotion: boolean;
  onSelect: (node: VisualNode, globalIndex: number) => void;
}) {
  const color = `var(--${tone})`;

  return (
    <div>
      <span
        className="inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em]"
        style={{ borderColor: `${color}66`, backgroundColor: `${color}14`, color }}
      >
        {label}
      </span>

      <div className="mt-2.5 overflow-x-auto pb-1.5">
        <div className="flex items-stretch gap-1 pr-1">
          {entries.flatMap(({ node, globalIndex, active }, i) => {
            const chip = (
              <PipelineNodeChip
                key={node.id}
                code={node.code}
                title={node.title}
                file={node.file}
                kind={node.kind}
                tone={tone}
                active={active}
                selected={selectedFamilyId === node.familyId}
                reducedMotion={reducedMotion}
                onSelect={() => onSelect(node, globalIndex)}
              />
            );
            if (i === 0) return [chip];
            return [<PipelineConnector key={`c-${node.id}`} active={active} reducedMotion={reducedMotion} />, chip];
          })}
        </div>
      </div>
    </div>
  );
}
