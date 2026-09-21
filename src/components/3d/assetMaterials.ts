import * as THREE from "three";

// Shared PBR materials for the props standing on the platforms — one
// instance each, reused across meshes (fewer state changes, no duplicates).
// They live for the page's lifetime, so they are never disposed.

function make() {
  return {
    white: new THREE.MeshStandardMaterial({ color: "#e6edf8", metalness: 0.3, roughness: 0.28, emissive: "#0c1c40", emissiveIntensity: 0.35 }),
    silver: new THREE.MeshStandardMaterial({ color: "#aab7cc", metalness: 0.9, roughness: 0.28, emissive: "#0c1c40", emissiveIntensity: 0.3 }),
    darkJoint: new THREE.MeshStandardMaterial({ color: "#1a2438", metalness: 0.85, roughness: 0.38, emissive: "#0a1836", emissiveIntensity: 0.5 }),
    blackMatte: new THREE.MeshStandardMaterial({ color: "#0c111d", metalness: 0.5, roughness: 0.55, emissive: "#081226", emissiveIntensity: 0.5 }),
    rack: new THREE.MeshStandardMaterial({ color: "#16233f", metalness: 0.85, roughness: 0.34, emissive: "#0d2a66", emissiveIntensity: 0.6 }),
    glassLens: new THREE.MeshStandardMaterial({ color: "#04101f", metalness: 0.9, roughness: 0.08, emissive: "#0a2a5c", emissiveIntensity: 0.6 }),
    glowBlue: new THREE.MeshBasicMaterial({ color: "#5ec8ff", toneMapped: false }),
    glowCyan: new THREE.MeshBasicMaterial({ color: "#7df3ff", toneMapped: false }),
    glowAmber: new THREE.MeshBasicMaterial({ color: "#ffae42", toneMapped: false }),
    glowGreen: new THREE.MeshBasicMaterial({ color: "#5cf2a8", toneMapped: false }),
  };
}

let cache: ReturnType<typeof make> | null = null;

export function getAssetMaterials() {
  if (!cache) cache = make();
  return cache;
}
