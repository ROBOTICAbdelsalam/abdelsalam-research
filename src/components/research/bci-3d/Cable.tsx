"use client";

import { useMemo } from "react";
import * as THREE from "three";

// A physically-draped cable — REBUILT for the equipment-realism pass.
// Earlier cables across the scene (EEG leads, amplifier leads, desk power
// cords) were straight cylinders between two points, which reads as a
// rigid rod, not a cable. This builds a real curve instead: a
// CatmullRomCurve3 through the two endpoints plus a midpoint pulled down
// by `sag` (gravity droop) and offset by `bow` (slack bulge away from a
// straight line), then a thin TubeGeometry along it — same technique
// DataFlow.tsx already uses for the signal path, just parameterized per
// cable instead of hardcoded. Kept cheap (a handful of tubular segments)
// since these are small background-detail objects, not hero geometry.

export type CableProps = {
  from: readonly [number, number, number];
  to: readonly [number, number, number];
  /** How far the midpoint droops below a straight line (meters). */
  sag?: number;
  /** How far the midpoint bows sideways off a straight line (meters). */
  bow?: readonly [number, number, number];
  radius?: number;
  color?: string;
  roughness?: number;
  metalness?: number;
};

export function Cable({ from, to, sag = 0.04, bow = [0, 0, 0], radius = 0.006, color = "#0c0d10", roughness = 0.55, metalness = 0.2 }: CableProps) {
  const geometry = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const mid = start.clone().lerp(end, 0.5).add(new THREE.Vector3(bow[0], -sag, bow[2]));
    const curve = new THREE.CatmullRomCurve3([start, mid, end], false, "catmullrom", 0.3);
    return new THREE.TubeGeometry(curve, 14, radius, 6, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- endpoints/sag/bow are effectively static per cable instance
  }, []);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}
