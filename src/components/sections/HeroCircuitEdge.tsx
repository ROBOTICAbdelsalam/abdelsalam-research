const branches = [
  "M0,40 H36 M36,40 V20",
  "M0,140 H60 M60,140 V170 H90",
  "M0,260 H24",
  "M0,360 H48 M48,360 V330",
  "M0,460 H72 M72,460 V490 H100",
  "M0,540 H30",
];

const nodes: [number, number][] = [
  [36, 20],
  [90, 170],
  [24, 260],
  [48, 330],
  [100, 490],
  [30, 540],
];

// Purely decorative circuit-board texture along the Hero's edges. Static
// (no animation) so it reads as background atmosphere, not another moving
// element competing with the main signal diagram.
export function HeroCircuitEdge({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 120 560"
      className="h-full w-[120px]"
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      {branches.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          strokeWidth={1}
          style={{ stroke: "var(--border-strong)" }}
        />
      ))}
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={2} style={{ fill: "var(--border-strong)" }} />
      ))}
    </svg>
  );
}
