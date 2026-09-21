import * as THREE from "three";

// Shared shader materials. Everything that glows in the scene is drawn with
// cheap additive shaders instead of post-processing bloom.

/** Shared animation clock (seconds) for every shader. Frozen when motion is reduced or paused. */
export const timeUniform = { value: 4.2 };

/** Canvas pixels per world unit at view-depth 1 — used to size point sprites. Set by the scene on resize. */
export const pointScaleUniform = { value: 900 };

// Shaders write raw sRGB, so run the output colour-space conversion ourselves.
const OUT = "#include <colorspace_fragment>";

const additive = {
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
} as const;

// ---- Glow ring (flat ring lying in local XY; rotate the mesh into place) ----

const ringVertex = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime, uRadius, uWidth, uOpacity, uDashes, uSpeed, uArcStart, uArcLen, uCore;
  varying vec2 vP;
  const float TAU = 6.2831853;
  void main() {
    float d = (length(vP) - uRadius) / uWidth;
    float core = exp(-pow(d / uCore, 2.0));
    float halo = exp(-pow(d * 1.35, 2.0)) * 0.32;
    float a = atan(vP.y, vP.x);
    float pulse = 1.0;
    if (uDashes > 0.0) {
      float t = fract(a * uDashes / TAU - uTime * uSpeed);
      pulse = 0.3 + 0.7 * smoothstep(0.0, 0.2, t) * (1.0 - smoothstep(0.2, 0.85, t));
    }
    float mask = 1.0;
    if (uArcLen < TAU - 0.01) {
      float rel = mod(a - uArcStart + TAU, TAU);
      mask = smoothstep(0.0, 0.3, rel) * (1.0 - smoothstep(uArcLen - 0.3, uArcLen, rel));
    }
    float alpha = (core + halo) * uOpacity * pulse * mask;
    gl_FragColor = vec4(uColor * (0.65 + core * 0.9), alpha);
    ${OUT}
  }
`;

export type GlowRingOptions = {
  color: string;
  radius: number;
  /** Half-width of the ring band (world units); the visible line is much thinner than this. */
  width?: number;
  /** Fraction of the band that is the bright core line. */
  core?: number;
  opacity?: number;
  /** Number of travelling highlights around the ring (0 = uniform). */
  dashes?: number;
  speed?: number;
  arcStart?: number;
  arcLength?: number;
};

export function createGlowRingMaterial(o: GlowRingOptions) {
  return new THREE.ShaderMaterial({
    ...additive,
    side: THREE.DoubleSide,
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    uniforms: {
      uColor: { value: new THREE.Color(o.color) },
      uTime: timeUniform,
      uRadius: { value: o.radius },
      uWidth: { value: o.width ?? 0.09 },
      uCore: { value: o.core ?? 0.16 },
      uOpacity: { value: o.opacity ?? 1 },
      uDashes: { value: o.dashes ?? 0 },
      uSpeed: { value: o.speed ?? 0.06 },
      uArcStart: { value: o.arcStart ?? 0 },
      uArcLen: { value: o.arcLength ?? Math.PI * 2 },
    },
  });
}

// ---- Fresnel glass (sphere shells) ----

const fresnelVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vObj;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vObj = position;
    gl_Position = projectionMatrix * mv;
  }
`;

const fresnelFragment = /* glsl */ `
  uniform vec3 uColor, uColor2;
  uniform float uPower, uOpacity, uFill;
  varying vec3 vN;
  varying vec3 vV;
  varying vec3 vObj;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPower);
    // Brighter toward the lower-left of the shell, as lit by the surroundings in the reference.
    float bias = 0.75 + 0.25 * clamp(-vObj.x * 0.6 - vObj.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uColor, uColor2, f);
    gl_FragColor = vec4(col * (0.7 + f), (f * bias + uFill) * uOpacity);
    ${OUT}
  }
`;

export type FresnelOptions = {
  color: string;
  color2?: string;
  power?: number;
  opacity?: number;
  /** Constant body tint (0 = pure rim). */
  fill?: number;
  side?: THREE.Side;
};

export function createFresnelMaterial(o: FresnelOptions) {
  return new THREE.ShaderMaterial({
    ...additive,
    side: o.side ?? THREE.FrontSide,
    vertexShader: fresnelVertex,
    fragmentShader: fresnelFragment,
    uniforms: {
      uColor: { value: new THREE.Color(o.color) },
      uColor2: { value: new THREE.Color(o.color2 ?? o.color) },
      uPower: { value: o.power ?? 2.4 },
      uOpacity: { value: o.opacity ?? 1 },
      uFill: { value: o.fill ?? 0.04 },
    },
  });
}

// ---- Point sprites (neural nodes) ----

const pointsVertex = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  uniform float uScale;
  varying float vPhase;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = max(aSize * uScale / -mv.z, 1.5);
    vPhase = aPhase;
    gl_Position = projectionMatrix * mv;
  }
`;

const pointsFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime, uOpacity;
  varying float vPhase;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    float tw = 0.6 + 0.4 * sin(uTime * 1.8 + vPhase * 6.2831853);
    gl_FragColor = vec4(uColor * (0.85 + a), a * tw * uOpacity);
    ${OUT}
  }
`;

export function createPointsMaterial(color: string, opacity = 1) {
  return new THREE.ShaderMaterial({
    ...additive,
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: timeUniform,
      uScale: pointScaleUniform,
      uOpacity: { value: opacity },
    },
  });
}

// ---- Pulsing line segments (neural connections) ----

const linesVertex = /* glsl */ `
  attribute float aPhase;
  varying float vPhase;
  void main() {
    vPhase = aPhase;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const linesFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime, uOpacity;
  varying float vPhase;
  void main() {
    float tw = 0.5 + 0.5 * sin(uTime * 1.4 + vPhase * 6.2831853);
    gl_FragColor = vec4(uColor, uOpacity * (0.35 + 0.65 * tw));
    ${OUT}
  }
`;

export function createLinesMaterial(color: string, opacity = 0.5) {
  return new THREE.ShaderMaterial({
    ...additive,
    vertexShader: linesVertex,
    fragmentShader: linesFragment,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: timeUniform,
      uOpacity: { value: opacity },
    },
  });
}

// ---- Soft radial glow (floor pools, halos) ----

const radialVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const radialFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity, uPower;
  varying vec2 vUv;
  void main() {
    float d = length(vUv - 0.5) * 2.0;
    float a = pow(clamp(1.0 - d, 0.0, 1.0), uPower);
    gl_FragColor = vec4(uColor, a * uOpacity);
    ${OUT}
  }
`;

export function createRadialGlowMaterial(color: string, opacity = 0.5, power = 2.2) {
  return new THREE.ShaderMaterial({
    ...additive,
    side: THREE.DoubleSide,
    vertexShader: radialVertex,
    fragmentShader: radialFragment,
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uPower: { value: power },
    },
  });
}

// ---- Signal tubes (energy flowing along a path) ----

const signalVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const signalFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime, uSpeed, uDir, uPulses, uOpacity, uIntensity, uPhase;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float u = vUv.x;
    float f = fract(u * uPulses - uTime * uSpeed * uDir + uPhase);
    // The pulse head leads in the direction of travel; the tail fades behind it.
    float p = uDir > 0.0 ? f : 1.0 - f;
    float pulse = pow(p, 5.0);
    float ends = smoothstep(0.0, 0.06, u) * (1.0 - smoothstep(0.9, 1.0, u));
    float edge = pow(abs(dot(normalize(vN), normalize(vV))), 0.7);
    float a = (0.42 + pulse) * ends * edge * uOpacity * uIntensity;
    vec3 col = mix(uColor, vec3(1.0), pulse * 0.4) * (1.1 + pulse * 0.9);
    gl_FragColor = vec4(col, a);
    ${OUT}
  }
`;

export type SignalMaterialOptions = {
  color: string;
  /** +1: pulses travel toward the end of the curve (the core); −1: away from it. */
  direction: 1 | -1;
  speed?: number;
  pulses?: number;
  opacity?: number;
  phase?: number;
  /** Shared, mutable — lets hover / stage highlights fade a path without React state. */
  intensity: { value: number };
};

export function createSignalMaterial(o: SignalMaterialOptions) {
  return new THREE.ShaderMaterial({
    ...additive,
    side: THREE.DoubleSide,
    vertexShader: signalVertex,
    fragmentShader: signalFragment,
    uniforms: {
      uColor: { value: new THREE.Color(o.color) },
      uTime: timeUniform,
      uSpeed: { value: o.speed ?? 0.16 },
      uDir: { value: o.direction },
      uPulses: { value: o.pulses ?? 2 },
      uOpacity: { value: o.opacity ?? 1 },
      uPhase: { value: o.phase ?? 0 },
      uIntensity: o.intensity,
    },
  });
}
