import * as THREE from "three";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mulberry32 } from "../random";

// Procedural brain: two folded hemispheres, a cerebellum and a brainstem.
// Sulci are carved along the zero-crossings of two octaves of simplex noise,
// which yields the winding, worm-like groove pattern of a cortex. Each vertex
// carries `aFold` (0 = deep in a sulcus, 1 = gyrus crest) for shading.

const RADII = { x: 0.365, y: 0.47, z: 0.62 };
const HEMISPHERE_OFFSET = 0.235;

const groove = (n: number, width: number) => 1 - THREE.MathUtils.smoothstep(Math.abs(n), 0, width);

function fold(
  geometry: THREE.SphereGeometry,
  place: (p: THREE.Vector3, f: number) => THREE.Vector3,
  noise: SimplexNoise,
  seedShift: number,
  depth: number,
) {
  const stripped = geometry.clone();
  stripped.deleteAttribute("normal");
  stripped.deleteAttribute("uv");
  const merged = mergeVertices(stripped, 1e-5);
  const position = merged.getAttribute("position");
  const folds = new Float32Array(position.count);
  const p = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    const g1 = groove(noise.noise3d(p.x * 3.1 + seedShift, p.y * 3.1, p.z * 3.1), 0.17);
    const g2 = groove(noise.noise3d(p.x * 6.4 + 9, p.y * 6.4 + seedShift, p.z * 6.4), 0.12);
    const g3 = groove(noise.noise3d(p.x * 12 + seedShift, p.y * 12 + 4, p.z * 12), 0.09);
    const grooves = Math.min(1, g1 + g2 * 0.8 + g3 * 0.45);
    folds[i] = 1 - grooves;
    const displaced = p.clone().multiplyScalar(1 - depth * grooves);
    const placed = place(displaced, folds[i]);
    position.setXYZ(i, placed.x, placed.y, placed.z);
  }
  merged.setAttribute("aFold", new THREE.BufferAttribute(folds, 1));
  merged.computeVertexNormals();
  return merged;
}

export type BrainGeometries = {
  left: THREE.BufferGeometry;
  right: THREE.BufferGeometry;
  cerebellum: THREE.BufferGeometry;
  stem: THREE.BufferGeometry;
};

export function buildBrainGeometries(detail = 1): BrainGeometries {
  const noise = new SimplexNoise({ random: mulberry32(11) });
  const wSeg = Math.round(64 * detail);
  const hSeg = Math.round(48 * detail);

  const hemisphere = (side: 1 | -1) =>
    fold(
      new THREE.SphereGeometry(1, wSeg, hSeg),
      (p) => {
        // Flatten the medial face and the underside so the two halves sit together with a fissure.
        const x = p.x * side < 0 ? p.x * 0.72 : p.x;
        const y = p.y < 0 ? p.y * 0.8 : p.y;
        return new THREE.Vector3(x * RADII.x + side * HEMISPHERE_OFFSET, y * RADII.y, p.z * RADII.z);
      },
      noise,
      side * 3.7,
      0.11,
    );

  const cerebellum = fold(
    new THREE.SphereGeometry(1, Math.round(40 * detail), Math.round(28 * detail)),
    (p) => new THREE.Vector3(p.x * 0.3, p.y * 0.13 - 0.38, p.z * 0.2 - 0.36),
    noise,
    21,
    0.12,
  );

  const stemBase = new THREE.CylinderGeometry(0.035, 0.065, 0.26, 12, 4, true);
  stemBase.translate(0, -0.56, -0.12);
  const stem = stemBase.clone();
  stem.setAttribute("aFold", new THREE.BufferAttribute(new Float32Array(stem.getAttribute("position").count).fill(0.7), 1));
  stemBase.dispose();

  return {
    left: hemisphere(-1),
    right: hemisphere(1),
    cerebellum,
    stem,
  };
}
