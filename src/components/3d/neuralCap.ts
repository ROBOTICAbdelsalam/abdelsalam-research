import * as THREE from "three";
import { mulberry32 } from "./random";

// A geodesic EEG-style mesh over the cranium: the upper part of a subdivided
// icosphere as glowing lines + nodes, in unit-sphere space with the face
// toward +z. Scale it to the head with a group transform.

export function buildNeuralCap(seed = 3) {
  const base = new THREE.IcosahedronGeometry(1, 2);
  const wire = new THREE.WireframeGeometry(base);
  const pos = wire.getAttribute("position");
  const random = mulberry32(seed);
  const segments: number[] = [];
  const phases: number[] = [];
  const nodes = new Map<string, THREE.Vector3>();

  // Cranium only: above the brow line, and not the face.
  const keep = (p: THREE.Vector3) => p.y > 0.05 && !(p.z > 0.55 && p.y < 0.5);

  for (let i = 0; i < pos.count; i += 2) {
    const a = new THREE.Vector3().fromBufferAttribute(pos, i);
    const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
    if (!keep(a) || !keep(b)) continue;
    segments.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const phase = random();
    phases.push(phase, phase);
    nodes.set(`${a.x.toFixed(3)},${a.y.toFixed(3)},${a.z.toFixed(3)}`, a);
    nodes.set(`${b.x.toFixed(3)},${b.y.toFixed(3)},${b.z.toFixed(3)}`, b);
  }

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(new Float32Array(segments), 3));
  lines.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(phases), 1));

  const list = [...nodes.values()];
  const points = new THREE.BufferGeometry();
  points.setAttribute("position", new THREE.BufferAttribute(new Float32Array(list.flatMap((n) => [n.x, n.y, n.z])), 3));
  points.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(list.map(() => 0.05 + random() * 0.05)), 1));
  points.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(list.map(() => random())), 1));

  base.dispose();
  wire.dispose();
  return { lines, points };
}
