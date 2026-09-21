import * as THREE from "three";

// Helpers for turning a loaded (meshopt-quantised) glTF scene into plain
// float geometry we can restyle freely.

/**
 * Merges every mesh in `root` into one float32 BufferGeometry in root space.
 * Quantised (normalised-int) attributes can't be transformed in place without
 * clamping, so everything is re-read through the getters and rewritten as floats.
 */
export function extractGeometry(root: THREE.Object3D): THREE.BufferGeometry {
  root.updateMatrixWorld(true);
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const v = new THREE.Vector3();
  let offset = 0;

  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry;
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld);

    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      positions.push(v.x, v.y, v.z);
      if (normal) {
        v.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix).normalize();
        normals.push(v.x, v.y, v.z);
      }
    }
    const index = geometry.getIndex();
    const count = index ? index.count : position.count;
    for (let i = 0; i < count; i++) indices.push((index ? index.getX(i) : i) + offset);
    offset += position.count;
  });

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length) out.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  else out.computeVertexNormals();
  out.setIndex(indices);
  return out;
}

/** Recentres on x/z, sets the base on y = 0 and scales to unit height. Returns the original height. */
export function normalizeToUnitHeight(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const height = box.max.y - box.min.y;
  geometry.translate(-(box.min.x + box.max.x) / 2, -box.min.y, -(box.min.z + box.max.z) / 2);
  geometry.scale(1 / height, 1 / height, 1 / height);
  geometry.computeBoundingBox();
  return height;
}

/** Adds a per-vertex random `aPhase` attribute (the shared line shader pulses on it). */
export function addPhases(geometry: THREE.BufferGeometry, random: () => number) {
  const count = geometry.getAttribute("position").count;
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i += 2) phases[i] = phases[i + 1] = random();
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
  return geometry;
}
