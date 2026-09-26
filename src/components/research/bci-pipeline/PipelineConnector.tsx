"use client";

import { motion } from "framer-motion";

// A single connecting segment between two adjacent nodes IN THE SAME
// GROUP ROW. Every breakpoint now lays groups out as one dense
// horizontal (optionally scrollable) row — see BCIPipeline's own note on
// why a wrapping/vertical variant was dropped in favor of matching the
// reference diagram's row structure — so this only ever needs the
// horizontal chevron, not a mobile-vertical one.
export function PipelineConnector({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const color = active ? "var(--trace)" : "var(--border-strong)";

  return (
    <span className="relative flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
      <svg viewBox="0 0 16 8" className="h-2 w-4">
        <path d="M1,4 H11" stroke={color} strokeWidth={1.5} fill="none" />
        <path d="M8,1 L13,4 L8,7" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {active && !reducedMotion && (
        <motion.span
          className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
          style={{ backgroundColor: "var(--trace)", boxShadow: "0 0 6px var(--trace)" }}
          initial={{ left: "0%", opacity: 0 }}
          animate={{ left: "80%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      )}
    </span>
  );
}
