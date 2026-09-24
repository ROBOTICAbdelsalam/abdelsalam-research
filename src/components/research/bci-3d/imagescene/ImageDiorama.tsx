"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useBciExperiment } from "../BCIExperimentProvider";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  IMAGE_ASPECT,
  PLANE_HALF_HEIGHT,
  PLANE_HALF_WIDTH,
  PLANE_CENTER_Y,
  STATION_POSITIONS,
  type StationId,
} from "../layout";
import { StationZone } from "../StationZone";
import { PipelineFlow } from "./PipelineFlow";
import { HandRig } from "./HandRig";

// IMAGE-BASED DIORAMA — the BCI Digital Twin's 3D scene, REBUILT from the
// ground up to be a layered 3D reconstruction of a single source photo
// (public/images/bci-lab-overview.jpg) instead of a procedurally built
// room. There is no separate laboratory geometry to fall back to; the
// photo IS the scene.
//
// Technique: one full-frame backdrop plane carries the whole image at
// true proportions (IMAGE_ASPECT, computed from the source file's actual
// 1672×607 pixel size — see layout.ts). Three more planes — one each for
// the EEG station, the BCI Core, and the robotic hand, the reference's own
// three visual anchors — sample a UV sub-rectangle of that SAME texture
// (cloned, not re-fetched) and sit a little closer to the camera, each
// soft-edged so it blends back into the backdrop beneath it rather than
// showing a hard seam. Moving the camera (the guided camera-focus shots,
// or free orbit) reveals real parallax between these layers and the
// backdrop — the depth cue this whole approach is built around. No
// geometry here changes what's visible at rest: the resting "overview"
// shot is deliberately square-on to the backdrop at the distance that
// fills the frame, so the very first thing a visitor sees is, as closely
// as a live WebGL frame can manage, the source photograph itself.

const IMAGE_URL = "/images/bci-lab-overview.jpg";

// `useTexture`'s returned Texture must never be mutated directly (the
// lint rule this trips is real: React's own cache may hand that same
// instance to another consumer). This hook constructs and configures a
// texture together — cloning once, in the one place that owns the clone
// — so nothing downstream ever touches the hook's own return value.
function usePreparedTexture(url: string) {
  const source = useTexture(url);
  return useMemo(() => {
    const clone = source.clone();
    clone.colorSpace = THREE.SRGBColorSpace;
    clone.needsUpdate = true;
    return clone;
  }, [source]);
}

// Pixel-space crop rectangles for each hero layer, in the same 1672×607
// coordinate space as the source photo (see the grid-reference read that
// produced these in the realism-pass notes) — [x0, y0, x1, y1].
const HERO_CROPS = {
  eeg: { px: [10, 5, 460, 345] as const, z: 0.28 },
  core: { px: [715, 0, 980, 470] as const, z: 0.32 },
  hand: { px: [1215, 295, 1670, 605] as const, z: 0.28 },
};

function pixelToUvBox([x0, y0, x1, y1]: readonly [number, number, number, number]) {
  const u0 = x0 / 1672;
  const u1 = x1 / 1672;
  const v0 = 1 - y1 / 607; // bottom of crop (larger pixel y) → smaller v
  const v1 = 1 - y0 / 607; // top of crop (smaller pixel y) → larger v
  return { offset: [u0, v0] as const, repeat: [u1 - u0, v1 - v0] as const };
}

function pixelBoxToWorld([x0, y0, x1, y1]: readonly [number, number, number, number]) {
  const uv0 = { u: x0 / 1672, v: 1 - y1 / 607 }; // bottom-left
  const uv1 = { u: x1 / 1672, v: 1 - y0 / 607 }; // top-right
  const wx0 = (uv0.u - 0.5) * 2 * PLANE_HALF_WIDTH;
  const wy0 = PLANE_CENTER_Y + (uv0.v - 0.5) * 2 * PLANE_HALF_HEIGHT;
  const wx1 = (uv1.u - 0.5) * 2 * PLANE_HALF_WIDTH;
  const wy1 = PLANE_CENTER_Y + (uv1.v - 0.5) * 2 * PLANE_HALF_HEIGHT;
  return { cx: (wx0 + wx1) / 2, cy: (wy0 + wy1) / 2, w: wx1 - wx0, h: wy1 - wy0 };
}

// A soft, roughly-elliptical alpha mask generated once at runtime (a
// canvas radial gradient — no new image file, nothing written to disk)
// and shared by every hero layer via its `alphaMap`, so each cropped
// photo-fragment fades into the backdrop behind it instead of showing a
// hard rectangular edge.
function useSoftMask() {
  return useMemo(() => {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.5);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);
}

// The backdrop is deliberately built a third larger than the frame it's
// meant to exactly fill at rest, with the extra margin's UV clamped to
// the image's own outermost edge pixels (not stretched/mirrored — a
// still, unnoticeable "bleed"). This costs nothing at rest — the margin
// sits outside the frustum, invisible — but it's real insurance: a camera
// transition that starts from a large jump (the resting overview shot
// straight to a distant hotspot, skipping the smaller in-between moves)
// can end its 8-second safety-cap short of fully converged (see
// BCICameraRig's own convergence notes — that logic is reused unchanged
// here, not touched), which previously could reveal the plane's true
// edge as a hard black void at the frame's border. Padding the backdrop
// this way was the fix that actually resolved it, found by screenshotting
// that exact large-jump case rather than assuming the smaller adjacent-
// preset jumps tested first were representative.
const BACKDROP_PADDING = 1.35;

function Backdrop({ texture }: { texture: THREE.Texture }) {
  const paddedTexture = useMemo(() => {
    const clone = texture.clone();
    clone.needsUpdate = true;
    clone.wrapS = THREE.ClampToEdgeWrapping;
    clone.wrapT = THREE.ClampToEdgeWrapping;
    const offset = -(BACKDROP_PADDING - 1) / 2;
    clone.repeat.set(BACKDROP_PADDING, BACKDROP_PADDING);
    clone.offset.set(offset, offset);
    return clone;
  }, [texture]);
  useEffect(() => () => paddedTexture.dispose(), [paddedTexture]);

  const width = PLANE_HALF_WIDTH * 2 * BACKDROP_PADDING;
  const height = PLANE_HALF_HEIGHT * 2 * BACKDROP_PADDING;
  return (
    <mesh position={[0, PLANE_CENTER_Y, -0.05]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={paddedTexture} toneMapped={false} />
    </mesh>
  );
}

function HeroLayer({
  baseTexture,
  softMask,
  crop,
}: {
  baseTexture: THREE.Texture;
  softMask: THREE.Texture;
  crop: { px: readonly [number, number, number, number]; z: number };
}) {
  const texture = useMemo(() => {
    const clone = baseTexture.clone();
    clone.needsUpdate = true;
    clone.wrapS = THREE.ClampToEdgeWrapping;
    clone.wrapT = THREE.ClampToEdgeWrapping;
    const { offset, repeat } = pixelToUvBox(crop.px);
    clone.offset.set(offset[0], offset[1]);
    clone.repeat.set(repeat[0], repeat[1]);
    return clone;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- crop is a static per-layer constant
  }, [baseTexture]);
  useEffect(() => () => texture.dispose(), [texture]);

  const { cx, cy, w, h } = pixelBoxToWorld(crop.px);
  const restZ = 6.5;
  const scale = (restZ - crop.z) / restZ;

  return (
    <mesh position={[cx * scale, PLANE_CENTER_Y + (cy - PLANE_CENTER_Y) * scale, crop.z]}>
      <planeGeometry args={[w * scale, h * scale]} />
      <meshBasicMaterial map={texture} alphaMap={softMask} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// The robotic hand's "depth/visual interaction representation" — true
// per-finger geometry can't be reliably extracted from a single photo
// (the reference image is visually authoritative per this pass's brief),
// so the accepted gesture state instead drives a soft accent glow
// positioned over the hand's own crop: dim at rest, brightening and
// color-coded (cyan while executing, green on an accepted/completed
// gesture, red on emergency stop) through the SAME state the old
// procedural hand's animation read from.
function HandStateGlow() {
  const { phase, accepted } = useBciExperiment();
  const ref = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();
  const { cx, cy } = pixelBoxToWorld(HERO_CROPS.hand.px);
  const restZ = 6.5;
  const scale = (restZ - (HERO_CROPS.hand.z + 0.02)) / restZ;

  const targetColor = useMemo(() => {
    if (phase === "EMERGENCY_STOP") return new THREE.Color("#e0575a");
    if (phase === "EXECUTING" || phase === "COMMAND_ACCEPTED") return new THREE.Color("#2dd4c8");
    if (phase === "COMPLETED" && accepted) return new THREE.Color("#5cf2a8");
    return new THREE.Color("#2a2f38");
  }, [phase, accepted]);

  const targetOpacity =
    phase === "EMERGENCY_STOP" || phase === "EXECUTING" || phase === "COMMAND_ACCEPTED" || (phase === "COMPLETED" && accepted) ? 0.4 : 0;

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const material = mesh.material as THREE.MeshBasicMaterial;
    const rate = reducedMotion ? 1 : 1 - Math.exp(-delta * 5);
    material.color.lerp(targetColor, rate);
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, rate);
  });

  return (
    <mesh ref={ref} position={[cx * scale, PLANE_CENTER_Y + (cy - PLANE_CENTER_Y) * scale, HERO_CROPS.hand.z + 0.02]}>
      <circleGeometry args={[1.4, 32]} />
      <meshBasicMaterial color="#2a2f38" transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// A thin, camera-facing red tint that fades in during EMERGENCY_STOP — a
// physical, readable signal beyond the DOM status text, matching the
// procedural scene's old EmergencyTint in intent without relighting the
// photo itself (a dynamic light striking a baked-lit photo would shift
// its colors in a way that reads as wrong, not as "stopped").
function EmergencyOverlay() {
  const { phase } = useBciExperiment();
  const stopped = phase === "EMERGENCY_STOP";
  const ref = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    const material = mesh.material as THREE.MeshBasicMaterial;
    const rate = reducedMotion ? 1 : 1 - Math.exp(-delta * 6);
    material.opacity = THREE.MathUtils.lerp(material.opacity, stopped ? 0.14 : 0, rate);
  });

  return (
    <mesh ref={ref} position={[0, PLANE_CENTER_Y, 0.5]}>
      <planeGeometry args={[PLANE_HALF_WIDTH * 2, PLANE_HALF_HEIGHT * 2]} />
      <meshBasicMaterial color="#e0575a" transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// Invisible hit-volumes at each station's on-image position — reuses
// StationZone unchanged (it was always generic: an invisible box wired to
// the shared hover/focus context actions, never coupled to the old room's
// specific geometry). A thin box centered just in front of the backdrop,
// sized from that station's on-image content footprint.
const HOTSPOT_SIZE: Record<StationId, readonly [number, number, number]> = {
  eeg: [4.3, 3.3, 1.2],
  "signal-processing": [2.6, 1.9, 1.0],
  "feature-extraction": [2.5, 4.4, 1.2],
  "cnn-lstm": [2.3, 1.7, 1.0],
  "adaptive-decision": [2.3, 1.7, 1.0],
  ros2: [4.6, 2.6, 1.0],
  gazebo: [2.3, 1.8, 1.0],
  hand: [4.3, 3.0, 1.2],
};

function Hotspots() {
  return (
    <>
      {(Object.keys(STATION_POSITIONS) as StationId[]).map((id) => (
        <StationZone key={id} id={id} position={STATION_POSITIONS[id]} size={[...HOTSPOT_SIZE[id]]} />
      ))}
    </>
  );
}

export function ImageDiorama() {
  const baseTexture = usePreparedTexture(IMAGE_URL);
  useEffect(() => () => baseTexture.dispose(), [baseTexture]);
  const softMask = useSoftMask();
  useEffect(() => () => softMask.dispose(), [softMask]);

  return (
    <group>
      <Backdrop texture={baseTexture} />
      <HeroLayer baseTexture={baseTexture} softMask={softMask} crop={HERO_CROPS.eeg} />
      <HeroLayer baseTexture={baseTexture} softMask={softMask} crop={HERO_CROPS.core} />
      <HeroLayer baseTexture={baseTexture} softMask={softMask} crop={HERO_CROPS.hand} />
      <HandStateGlow />
      <PipelineFlow />
      <HandRig />
      <EmergencyOverlay />
      <Hotspots />
    </group>
  );
}

export { IMAGE_ASPECT };
