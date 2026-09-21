import type * as THREE from "three";

// Per-frame writes into three.js objects. Kept as plain module-level
// functions: this is inherently imperative work (the animation loop mutating
// GPU-facing state), and isolating it here keeps the React components pure.

export function setOpacity(material: THREE.Material, value: number) {
  material.opacity = value;
}

export function setUniform(material: THREE.ShaderMaterial, name: string, value: number) {
  material.uniforms[name].value = value;
}

export function setSlot<T>(list: T[], index: number, value: T) {
  list[index] = value;
}
