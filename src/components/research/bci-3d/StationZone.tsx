"use client";

import { useCallback, type ReactNode } from "react";
import { useThree, type RootState } from "@react-three/fiber";
import { useBciExperiment } from "./BCIExperimentProvider";
import type { StationId, Vec3 } from "./layout";

function setCanvasCursor(gl: RootState["gl"], cursor: string) {
  gl.domElement.style.cursor = cursor;
}

// Replaces the previous StationShell — REBUILT for the realism pass.
// StationShell drew a circular floor pad plus a permanently-visible glow
// ring under every station, which is exactly the "floating station /
// glowing platform" look section 30 calls out for removal. This version
// is purely functional: an invisible hit-volume wiring hover/click into
// the shared experiment context, plus a cursor-pointer affordance on
// hover — no visible floor decoration. "Which station is active" is now
// communicated the way a real lab would show it: by what's actually
// showing on that station's own monitor (still true) and by the DOM
// timeline/system-status panel, not a neon ring on the floor.

export type StationZoneProps = {
  id: StationId;
  position: Vec3;
  /** Hit-volume footprint [width, height, depth], centered on `position`, base at floor level. */
  size?: [number, number, number];
  /** Yaw applied to the whole station (desk, screens, lamp, stool, nameplate) as one rigid assembly — see layout.ts's STATION_YAW. */
  rotationY?: number;
  children?: ReactNode;
};

export function StationZone({ id, position, size = [2.4, 2.2, 2.0], rotationY = 0, children }: StationZoneProps) {
  const { hoverStation, focusStation } = useBciExperiment();
  const { gl } = useThree();

  const onOver = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      hoverStation(id);
      setCanvasCursor(gl, "pointer");
    },
    [hoverStation, id, gl],
  );
  const onOut = useCallback(() => {
    hoverStation(null);
    setCanvasCursor(gl, "auto");
  }, [hoverStation, gl]);
  const onClick = useCallback(
    (event: { stopPropagation: () => void }) => {
      event.stopPropagation();
      focusStation(id);
    },
    [focusStation, id],
  );

  return (
    <group position={position as unknown as [number, number, number]} rotation-y={rotationY}>
      <mesh position={[0, size[1] / 2, 0]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
        <boxGeometry args={size} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {children}
    </group>
  );
}
