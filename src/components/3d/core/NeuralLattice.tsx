"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createLinesMaterial, createPointsMaterial } from "../materials";
import { mulberry32 } from "../random";
import { useSceneSettings } from "../sceneContext";

// The luminous neural network filling the glass sphere: nodes scattered
// through the shell (weighted toward the surface, like the reference's
// network that hugs the glass), each linked to its nearest neighbours.

type LatticeProps = {
  count?: number;
  radius?: number;
  color?: string;
  linkColor?: string;
  linkDistance?: number;
  seed?: number;
  spin?: number;
};

export function NeuralLattice({
  count = 140,
  radius = 0.98,
  color = "#9fe8ff",
  linkColor = "#3aa8ff",
  linkDistance = 0.4,
  seed = 5,
  spin = 0.04,
}: LatticeProps) {
  const { reducedMotion } = useSceneSettings();
  const group = useRef<THREE.Group>(null);

  const { points, lines } = useMemo(() => {
    const random = mulberry32(seed);
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      // Uniform direction; radius biased toward the outer shell.
      const u = random() * 2 - 1;
      const theta = random() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const onShell = random() < 0.4;
      const r = radius * (onShell ? 0.9 + random() * 0.08 : 0.32 + random() * 0.6);
      nodes.push(new THREE.Vector3(s * Math.cos(theta) * r, u * r, s * Math.sin(theta) * r));
    }

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    nodes.forEach((n, i) => {
      positions.set([n.x, n.y, n.z], i * 3);
      sizes[i] = 0.03 + random() * 0.045;
      phases[i] = random();
    });
    const pointsGeometry = new THREE.BufferGeometry();
    pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    pointsGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const seen = new Set<string>();
    const segments: number[] = [];
    const segmentPhases: number[] = [];
    nodes.forEach((a, i) => {
      const near = nodes
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter(({ j, d }) => j !== i && d < linkDistance)
        .sort((x, y) => x.d - y.d)
        .slice(0, 3);
      near.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`;
        if (seen.has(key)) return;
        seen.add(key);
        const b = nodes[j];
        segments.push(a.x, a.y, a.z, b.x, b.y, b.z);
        const phase = random();
        segmentPhases.push(phase, phase);
      });
    });
    const linesGeometry = new THREE.BufferGeometry();
    linesGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segments), 3));
    linesGeometry.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(segmentPhases), 1));

    return { points: pointsGeometry, lines: linesGeometry };
  }, [count, radius, linkDistance, seed]);

  const pointsMaterial = useMemo(() => createPointsMaterial(color, 1), [color]);
  const linesMaterial = useMemo(() => createLinesMaterial(linkColor, 0.42), [linkColor]);

  useEffect(
    () => () => {
      points.dispose();
      lines.dispose();
    },
    [points, lines],
  );
  useEffect(() => () => pointsMaterial.dispose(), [pointsMaterial]);
  useEffect(() => () => linesMaterial.dispose(), [linesMaterial]);

  useFrame((_, delta) => {
    if (reducedMotion || !group.current) return;
    group.current.rotation.y += delta * spin;
  });

  return (
    <group ref={group}>
      <lineSegments geometry={lines} material={linesMaterial} frustumCulled={false} renderOrder={3} />
      <points geometry={points} material={pointsMaterial} frustumCulled={false} renderOrder={4} />
    </group>
  );
}
