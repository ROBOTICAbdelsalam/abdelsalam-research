"use client";

import { useEffect, useMemo } from "react";
import * as THREE from "three";

// The arena floor: a dark disc that fades into the page at its edge, with
// concentric grooves, faint radial spokes and a pool of blue light gathering
// around the AI Core — drawn in one cheap shader (no reflections pass).

const vertex = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uBase, uLine, uPool;
  uniform float uRadius;
  varying vec2 vP;
  float line(float r, float at, float w) { return smoothstep(w, 0.0, abs(r - at)); }
  void main() {
    float r = length(vP);
    float fade = 1.0 - smoothstep(uRadius * 0.42, uRadius * 0.98, r);
    float pool = exp(-r * r * 0.07);
    float rings = line(r, 2.55, 0.018) * 0.9 + line(r, 3.05, 0.012) * 0.5 + line(r, 5.15, 0.02) * 0.8
                + line(r, 5.6, 0.012) * 0.5 + line(r, 7.1, 0.02) * 0.6 + line(r, 8.0, 0.012) * 0.3;
    float a = atan(vP.y, vP.x);
    float spokes = smoothstep(0.02, 0.0, abs(fract(a * 24.0 / 6.2831853) - 0.5) - 0.47) * smoothstep(1.7, 2.4, r) * (1.0 - smoothstep(5.2, 7.4, r));
    vec3 col = uBase + uPool * pool * 0.3 + uLine * (rings * 0.3 + spokes * 0.07);
    gl_FragColor = vec4(col, fade * (0.9 + pool * 0.1));
    #include <colorspace_fragment>
  }
`;

export function Floor({ radius = 9.6 }: { radius?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uBase: { value: new THREE.Color("#050b1c") },
          uLine: { value: new THREE.Color("#2f6bff") },
          uPool: { value: new THREE.Color("#123a8a") },
          uRadius: { value: radius },
        },
      }),
    [radius],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.004} material={material} renderOrder={0}>
      <circleGeometry args={[radius, 128]} />
    </mesh>
  );
}
