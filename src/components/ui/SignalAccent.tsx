import { cn } from "@/lib/utils";

// A small decorative signal trace — three nodes on a dashed line. Purely
// atmospheric, echoes the Hero's system visualization without repeating it.
export function SignalAccent({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 16"
      className={cn("h-4 w-28", className)}
      role="presentation"
      aria-hidden
    >
      <path
        d="M4,8 L116,8"
        fill="none"
        strokeWidth={1}
        style={{ stroke: "var(--border-strong)" }}
      />
      <path
        d="M4,8 L116,8"
        fill="none"
        strokeWidth={1.5}
        strokeDasharray="4 8"
        strokeLinecap="round"
        opacity={0.9}
        className="motion-safe:animate-signal-trace"
        style={{ stroke: "var(--trace)" }}
      />
      {[4, 60, 116].map((cx, i) => (
        <circle
          key={cx}
          cx={cx}
          cy={8}
          r={2.5}
          style={{ fill: "var(--surface)", stroke: i === 1 ? "var(--trace)" : "var(--accent)" }}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  );
}
