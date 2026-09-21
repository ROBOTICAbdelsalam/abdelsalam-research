"use client";

import { useCallback, useEffect, useMemo } from "react";
import * as THREE from "three";
import { CORE } from "../sceneConfig";
import { GlowRing } from "../GlowRing";
import { createRadialGlowMaterial } from "../materials";
import { drawSpacedText, resolveFontFamily, useCanvasTexture } from "../textTexture";

// The technical pedestal: a widening 3-tier drum (vertical slats on the base,
// glowing rims, amber + cyan slit lights), a neck, and the rounded
// "AI CORE / INTELLIGENT SYSTEMS" plate set into the front of the top drum.

const SLATS = 56;
const METAL = { color: "#1b2c52", metalness: 0.92, roughness: 0.3 } as const;

function Drum({ radius, bottom, top, color = METAL.color }: { radius: number; bottom: number; top: number; color?: string }) {
  return (
    <mesh position-y={(bottom + top) / 2}>
      <cylinderGeometry args={[radius * 0.985, radius, top - bottom, 72]} />
      <meshStandardMaterial
        color={color}
        metalness={METAL.metalness}
        roughness={METAL.roughness}
        emissive="#0f2a66"
        emissiveIntensity={0.55}
      />
    </mesh>
  );
}

function PlateLabel() {
  const radius = CORE.plate.radius + 0.006;
  const arc = 1.25;
  const height = 0.36;
  const width = 1024;
  const heightPx = Math.round((width * height) / (arc * radius));

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const r = h * 0.3;
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, h - 20, r);
    ctx.fillStyle = "rgba(8, 22, 52, 0.9)";
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(90, 200, 255, 0.95)";
    ctx.shadowColor = "#22d3ee";
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;
    drawSpacedText(ctx, w / 2, h * 0.42, {
      text: "AI CORE",
      family: resolveFontFamily("--font-space-grotesk", "system-ui, sans-serif"),
      size: h * 0.36,
      weight: 600,
      spacing: h * 0.03,
      color: "#eaf9ff",
      glow: "#22d3ee",
      glowBlur: 14,
    });
    drawSpacedText(ctx, w / 2, h * 0.76, {
      text: "INTELLIGENT SYSTEMS",
      family: resolveFontFamily("--font-jetbrains-mono", "ui-monospace, monospace"),
      size: h * 0.115,
      weight: 500,
      spacing: h * 0.028,
      color: "#a8dcff",
    });
  }, []);
  const texture = useCanvasTexture(width, heightPx, draw);

  const geometry = useMemo(
    () =>
      new THREE.CylinderGeometry(radius, radius, height, 40, 1, true, -arc / 2, arc),
    [radius, height],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position-y={CORE.plate.top - 0.27}>
      <meshBasicMaterial map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function CorePedestal() {
  const { base, tier2, tier1, plate } = CORE;

  const glowMaterial = useMemo(() => createRadialGlowMaterial("#2563eb", 0.55, 1.9), []);
  const glowMaterial2 = useMemo(() => createRadialGlowMaterial("#22d3ee", 0.32, 2.4), []);
  useEffect(() => () => glowMaterial.dispose(), [glowMaterial]);
  useEffect(() => () => glowMaterial2.dispose(), [glowMaterial2]);

  const slatMatrices = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < SLATS; i++) {
      const a = (i / SLATS) * Math.PI * 2;
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
      m.compose(new THREE.Vector3(Math.cos(a) * (base.radius + 0.004), base.top / 2, Math.sin(a) * (base.radius + 0.004)), q, s);
      matrices.push(m.clone());
    }
    return matrices;
  }, [base.radius, base.top]);

  return (
    <group>
      {/* Pools of light on the floor around the pedestal. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} material={glowMaterial} renderOrder={1}>
        <planeGeometry args={[7.4, 7.4]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.006} material={glowMaterial2} renderOrder={1}>
        <planeGeometry args={[4.2, 4.2]} />
      </mesh>

      <Drum radius={base.radius} bottom={0} top={base.top} />
      <Drum radius={tier2.radius} bottom={base.top} top={tier2.top} color="#20335e" />
      <Drum radius={tier1.radius} bottom={tier2.top} top={tier1.top} color="#243a68" />
      <Drum radius={plate.radius} bottom={tier1.top} top={plate.top} color="#1a2b52" />
      {/* Neck up to the glass sphere. */}
      <mesh position-y={(plate.top + CORE.centerY - CORE.sphereRadius) / 2 + 0.04}>
        <cylinderGeometry args={[0.36, 0.44, CORE.centerY - CORE.sphereRadius - plate.top + 0.12, 32]} />
        <meshStandardMaterial color="#14223f" metalness={0.9} roughness={0.35} />
      </mesh>

      {/* Vertical slats around the base tier. */}
      <instancedMesh
        args={[undefined, undefined, SLATS]}
        ref={(mesh) => {
          if (!mesh) return;
          slatMatrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
          mesh.instanceMatrix.needsUpdate = true;
        }}
      >
        <boxGeometry args={[0.1, base.top * 0.78, 0.035]} />
        <meshStandardMaterial color="#0b1530" metalness={0.9} roughness={0.32} />
      </instancedMesh>

      {/* Glowing rims on each tier. */}
      <GlowRing radius={base.radius - 0.02} y={base.top + 0.006} color="#22d3ee" width={0.1} core={0.13} opacity={0.95} />
      <GlowRing radius={tier2.radius - 0.02} y={tier2.top + 0.006} color="#38bdf8" width={0.1} core={0.13} opacity={0.95} />
      <GlowRing radius={tier1.radius - 0.02} y={tier1.top + 0.006} color="#7dd3fc" width={0.09} core={0.13} opacity={0.9} />
      <GlowRing radius={base.radius + 0.35} y={0.012} color="#2563eb" width={0.09} core={0.16} opacity={0.6} dashes={6} speed={0.05} />

      {/* Slit lights: cyan at the front, amber at the flanks. */}
      <mesh position={[0, 0.21, base.radius + 0.012]}>
        <boxGeometry args={[0.045, 0.32, 0.02]} />
        <meshBasicMaterial color="#6be9ff" toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (base.radius - 0.18), 0.2, base.radius * 0.66]} rotation-y={-side * 0.72}>
          <boxGeometry args={[0.07, 0.17, 0.02]} />
          <meshBasicMaterial color="#ffae42" toneMapped={false} />
        </mesh>
      ))}

      <PlateLabel />
    </group>
  );
}
