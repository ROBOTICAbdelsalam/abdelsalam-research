"use client";

import { SoftGlow } from "./SoftGlow";

// Out-of-focus lights far behind the scene — the warm and cool bokeh across
// the top of the reference. Positions/sizes are fixed (not random) so the
// composition is identical on every load.
const LIGHTS: { p: [number, number, number]; s: number; c: string; o: number }[] = [
  { p: [-12, 5.5, -18], s: 1.8, c: "#f59e0b", o: 0.3 },
  { p: [-9, 7.2, -18], s: 1.1, c: "#ffb454", o: 0.28 },
  { p: [-14, 8.5, -18], s: 2.4, c: "#3b82f6", o: 0.18 },
  { p: [-6, 8.8, -18], s: 0.9, c: "#f59e0b", o: 0.22 },
  { p: [11, 6.2, -18], s: 1.6, c: "#3b82f6", o: 0.22 },
  { p: [13.5, 7.6, -18], s: 1.2, c: "#f59e0b", o: 0.3 },
  { p: [9, 9, -18], s: 2.2, c: "#2563eb", o: 0.16 },
  { p: [15, 5, -18], s: 0.9, c: "#ffb454", o: 0.26 },
  { p: [2, 9.5, -18], s: 1.4, c: "#22d3ee", o: 0.12 },
];

export function Backdrop({ count = LIGHTS.length }: { count?: number }) {
  return (
    <group>
      {LIGHTS.slice(0, count).map((light, i) => (
        <SoftGlow key={i} position={light.p} scale={light.s * 3.2} color={light.c} opacity={light.o} renderOrder={0} />
      ))}
    </group>
  );
}
