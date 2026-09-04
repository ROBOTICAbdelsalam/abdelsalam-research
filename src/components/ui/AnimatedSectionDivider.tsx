import { cn } from "@/lib/utils";
import type { SignalTone } from "./SignalNode";

// A technical signal separator used between major page sections — not a
// plain rule. Two slow particles drift along the line, the nodes carry a
// faint staggered pulse, and the middle node has a small branch stub
// suggesting a network rather than a single wire. Fully static and inert
// under prefers-reduced-motion.
export function AnimatedSectionDivider({
  tones = ["accent", "trace", "accent"],
  className,
}: {
  tones?: [SignalTone, SignalTone, SignalTone];
  className?: string;
}) {
  const positions = [6, 50, 94] as const;

  return (
    <div className={cn("w-full", className)} aria-hidden>
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="relative h-px w-full" style={{ backgroundColor: "var(--border)" }}>
          {/* Subtle branch stub off the middle node — a network, not a wire. */}
          <svg
            className="absolute left-1/2 top-1/2 -translate-x-1/2"
            width="64"
            height="22"
            viewBox="0 0 64 22"
            style={{ overflow: "visible" }}
          >
            <path
              d="M32,0 L32,-10 L54,-10"
              fill="none"
              strokeWidth={1}
              style={{ stroke: `var(--${tones[1]})`, opacity: 0.5 }}
            />
            <circle cx={54} cy={-10} r={1.6} style={{ fill: `var(--${tones[1]})`, opacity: 0.7 }} />
          </svg>

          {positions.map((pos, i) => (
            <span
              key={pos}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${pos}%` }}
            >
              <span
                className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full motion-safe:animate-node-pulse"
                style={{
                  backgroundColor: `var(--${tones[i]})`,
                  animationDelay: `${i * 0.6}s`,
                }}
              />
              <span
                className="relative block h-1.5 w-1.5 -translate-x-1/2 rounded-full border"
                style={{ borderColor: `var(--${tones[i]})`, backgroundColor: "var(--surface)" }}
              />
            </span>
          ))}

          {[0, 3].map((delay, i) => (
            <span
              key={delay}
              className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full motion-safe:animate-divider-flow"
              style={{
                backgroundColor: `var(--${tones[i === 0 ? 1 : 0]})`,
                boxShadow: `0 0 8px var(--${tones[i === 0 ? 1 : 0]})`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
