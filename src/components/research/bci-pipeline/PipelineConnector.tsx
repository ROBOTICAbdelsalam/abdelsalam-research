"use client";

import { motion } from "framer-motion";

// A single connecting segment between two adjacent pipeline nodes. Two
// visual variants share one component so the same `active` state drives
// both: a horizontal chevron (desktop/tablet flow) and a vertical one
// (mobile column) — see BCIPipeline's own note on why both live in the
// same flex-wrap list rather than two separate layouts.
export function PipelineConnector({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const color = active ? "var(--trace)" : "var(--border-strong)";

  return (
    <>
      {/* Horizontal — hidden on the mobile vertical column */}
      <span className="relative hidden h-5 w-6 shrink-0 items-center justify-center sm:flex" aria-hidden>
        <svg viewBox="0 0 24 10" className="h-2.5 w-6">
          <path d="M1,5 H19" stroke={color} strokeWidth={1.5} fill="none" />
          <path d="M15,1 L20,5 L15,9" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {active && !reducedMotion && (
          <motion.span
            className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: "var(--trace)", boxShadow: "0 0 6px var(--trace)" }}
            initial={{ left: "0%", opacity: 0 }}
            animate={{ left: "85%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          />
        )}
      </span>

      {/* Vertical — mobile column only */}
      <span className="relative flex h-6 w-5 shrink-0 items-center justify-center sm:hidden" aria-hidden>
        <svg viewBox="0 0 10 24" className="h-6 w-2.5">
          <path d="M5,1 V19" stroke={color} strokeWidth={1.5} fill="none" />
          <path d="M1,15 L5,20 L9,15" stroke={color} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {active && !reducedMotion && (
          <motion.span
            className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
            style={{ backgroundColor: "var(--trace)", boxShadow: "0 0 6px var(--trace)" }}
            initial={{ top: "0%", opacity: 0 }}
            animate={{ top: "85%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          />
        )}
      </span>
    </>
  );
}
