"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { GlowRing } from "@/components/3d/GlowRing";
import { useBciExperiment } from "./BCIExperimentProvider";
import type { StationId, Vec3 } from "./layout";

// Shared wrapper every station uses: a floor pad, a pointer hit-volume wired
// to hover/click on the shared experiment context, and a restrained edge
// ring that brightens on hover or while the station's pipeline stage is
// active — the scene's only "glow", used sparingly per station rather than
// as blanket neon.

export type StationShellProps = {
  id: StationId;
  position: Vec3;
  /** Footprint radius (m) — sizes the floor pad and the pointer hit-volume. */
  radius: number;
  height?: number;
  active?: boolean;
  tint?: string;
  children?: ReactNode;
};

const PAD_COLOR = "#12151b";

export function StationShell({ id, position, radius, height = 2.2, active = false, tint = "#5b9dff", children }: StationShellProps) {
  const { hoveredStation, hoverStation, focusStation } = useBciExperiment();
  const hovered = hoveredStation === id;

  const padGeometry = useMemo(() => new THREE.CylinderGeometry(radius, radius * 1.02, 0.06, 40), [radius]);
  const hitGeometry = useMemo(() => new THREE.CylinderGeometry(radius * 1.1, radius * 1.1, height, 20), [radius, height]);

  const onOver = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      hoverStation(id);
    },
    [hoverStation, id],
  );
  const onOut = useCallback(() => hoverStation(null), [hoverStation]);
  const onClick = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      focusStation(id);
    },
    [focusStation, id],
  );

  return (
    <group position={position as unknown as [number, number, number]}>
      <mesh geometry={padGeometry} position-y={0.03} receiveShadow>
        <meshStandardMaterial color={PAD_COLOR} roughness={0.6} metalness={0.3} />
      </mesh>
      <GlowRing
        radius={radius * 1.02}
        y={0.065}
        color={tint}
        width={0.045}
        core={0.15}
        opacity={hovered ? 0.9 : active ? 0.6 : 0.22}
      />

      <mesh
        geometry={hitGeometry}
        position-y={height / 2}
        onPointerOver={onOver}
        onPointerOut={onOut}
        onClick={onClick}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {children}
    </group>
  );
}
