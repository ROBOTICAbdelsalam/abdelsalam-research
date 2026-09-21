"use client";

import type { ReactNode } from "react";
import { GlowRing } from "./GlowRing";
import { nodeHighlight } from "./interaction";
import { useSceneSettings } from "./sceneContext";
import { nodeScale, type SystemLayout } from "./sceneConfig";
import { SoftGlow } from "./SoftGlow";

// The circular technical platform every system stands on. Two variants, as in
// the reference: low multi-tier discs (Data, Sensors, Human–Machine,
// Automation) and tall column-mounted decks (AI/ML, Robotics). `children`
// stand on the deck surface, at the local origin.

export type PlatformVariant = "disc" | "column";

const STEEL = { metalness: 0.92, roughness: 0.3, emissive: "#0a1a40", emissiveIntensity: 0.32 } as const;

function Steel({ color }: { color: string }) {
  return <meshStandardMaterial color={color} {...STEEL} />;
}

type TechnicalPlatformProps = {
  system: SystemLayout;
  variant: PlatformVariant;
  /** Amber accent arc on the floor ring (the reference has these on several platforms). */
  amber?: boolean;
  children?: ReactNode;
};

export function TechnicalPlatform({ system, variant, amber = false, children }: TechnicalPlatformProps) {
  const R = system.radius;
  const H = system.height;
  const [x, , z] = system.position;
  const { onHover } = useSceneSettings();
  const highlight = nodeHighlight[system.id];
  // Pointer target: from the floor up to just above the prop on the deck (and no higher, so it never shadows a neighbour).
  const hitTop = H + system.propHeightPx * nodeScale(system).v * 1.05;

  return (
    <group position={[x, 0, z]}>
      {variant === "column" ? <ColumnBody R={R} H={H} tint={system.tint} /> : <DiscBody R={R} H={H} tint={system.tint} />}

      {/* Floor ring around the plinth. */}
      <GlowRing radius={R * 1.28} y={0.012} color="#2f6bff" width={0.08} core={0.16} opacity={0.55} />
      {amber && (
        <GlowRing radius={R * 1.28} y={0.014} color="#f59e0b" width={0.08} core={0.16} opacity={0.9} arcStart={0.9} arcLength={1.5} />
      )}

      {/* Hover highlight: a tinted ring and a soft halo that only appear when the node is active. */}
      <GlowRing radius={R * 1.1} y={H + 0.012} color={system.tint} width={0.11} core={0.14} opacity={0} activity={highlight} gain={0.95} />
      <SoftGlow color={system.tint} opacity={0} gain={0.42} scale={R * 3.8} position={[0, H + 0.8, 0]} activity={highlight} renderOrder={9} />

      {/* Invisible pointer target covering the platform and everything on it. */}
      <mesh
        position-y={hitTop / 2}
        onPointerOver={(event) => {
          event.stopPropagation();
          onHover(system.id);
        }}
        onPointerOut={() => onHover(null)}
      >
        <cylinderGeometry args={[R * 1.2, R * 1.2, hitTop, 24]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      <group position-y={H}>{children}</group>
    </group>
  );
}

function DiscBody({ R, H, tint }: { R: number; H: number; tint: string }) {
  const cap = Math.min(0.1, H * 0.3);
  return (
    <group>
      {/* Plinth. */}
      <mesh position-y={(H - cap) / 2}>
        <cylinderGeometry args={[R * 0.97, R, H - cap, 64]} />
        <Steel color="#101b36" />
      </mesh>
      {/* Deck. */}
      <mesh position-y={H - cap / 2}>
        <cylinderGeometry args={[R * 0.94, R * 0.98, cap, 64]} />
        <Steel color="#182647" />
      </mesh>
      <GlowRing radius={R * 0.93} y={H + 0.004} color="#38bdf8" width={0.09} core={0.13} opacity={0.95} />
      <GlowRing radius={R * 0.66} y={H + 0.004} color={tint} width={0.07} core={0.14} opacity={0.5} />
      <GlowRing radius={R * 1.0} y={H * 0.45} color="#2f6bff" width={0.06} core={0.16} opacity={0.5} />
    </group>
  );
}

function ColumnBody({ R, H, tint }: { R: number; H: number; tint: string }) {
  const deck = 0.3;
  const flare = 0.34;
  return (
    <group>
      {/* Base flare. */}
      <mesh position-y={flare / 2}>
        <cylinderGeometry args={[R * 0.78, R * 0.98, flare, 48]} />
        <Steel color="#0e1830" />
      </mesh>
      {/* Column. */}
      <mesh position-y={(H - deck + flare) / 2}>
        <cylinderGeometry args={[R * 0.5, R * 0.58, H - deck - flare, 40]} />
        <Steel color="#0b1530" />
      </mesh>
      {/* Deck. */}
      <mesh position-y={H - deck / 2}>
        <cylinderGeometry args={[R * 0.97, R * 0.8, deck, 64]} />
        <Steel color="#182647" />
      </mesh>
      <GlowRing radius={R * 0.95} y={H + 0.004} color="#38bdf8" width={0.09} core={0.13} opacity={0.95} />
      <GlowRing radius={R * 0.68} y={H + 0.004} color={tint} width={0.07} core={0.14} opacity={0.5} />
      <GlowRing radius={R * 0.92} y={H - deck} color="#2f6bff" width={0.06} core={0.16} opacity={0.55} />
      <GlowRing radius={R * 0.6} y={(H + flare) / 2} color="#22d3ee" width={0.05} core={0.16} opacity={0.4} />
    </group>
  );
}
