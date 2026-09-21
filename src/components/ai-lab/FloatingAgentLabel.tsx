"use client";

import { Html } from "@react-three/drei";
import type { SignalTone } from "@/components/ui/SignalNode";

export type LabelEmphasis = "dimmed" | "normal" | "emphasized";

const OPACITY: Record<LabelEmphasis, number> = {
  dimmed: 0.3,
  normal: 0.55,
  emphasized: 1,
};

// A small AR/HUD-style annotation above a workstation — plain HTML (via
// drei's <Html>) rather than a texture, so the text stays crisp at any
// distance and reuses the site's own type/color tokens. Three-way emphasis
// (spec §6/§11): the selected agent's own label is emphasized, its
// collaborators stay normal, and everything else dims.
export function FloatingAgentLabel({
  name,
  tone,
  emphasis,
}: {
  name: string;
  tone: SignalTone;
  emphasis: LabelEmphasis;
}) {
  const emphasized = emphasis === "emphasized";

  return (
    <Html center distanceFactor={9} zIndexRange={[10, 0]} occlude={false}>
      <div
        className="pointer-events-none select-none whitespace-nowrap rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-opacity duration-200"
        style={{
          opacity: OPACITY[emphasis],
          borderColor: emphasized ? `var(--${tone})` : "var(--border-strong)",
          backgroundColor: "rgba(8, 9, 11, 0.72)",
          color: emphasized ? `var(--${tone})` : "var(--muted)",
        }}
      >
        {name}
      </div>
    </Html>
  );
}
