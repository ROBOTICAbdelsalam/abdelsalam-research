"use client";

import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { EEG_ACQUISITION, HONESTY_LABELS } from "@/data/bci-experiment";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { mulberry32 } from "@/components/3d/random";
import { useBciExperiment } from "./BCIExperimentProvider";
import { Desk } from "./Desk";
import { EEG_POSITION } from "./layout";
import { Nameplate } from "./Nameplate";
import { Screen } from "./Screen";
import { drawBackdrop, drawChrome, drawKeyValueRows, drawWaveform, PANEL } from "./screenTextures";
import { StationShell } from "./StationShell";

// A. HUMAN EEG STATION — a seated participant, shown from the rear (they
// face the back wall; every camera in the room therefore sees them from
// behind or the side, never the face), wearing a multi-electrode EEG cap,
// beside a monitor reading the acquisition configuration and a continuously
// animating multi-channel trace. The stream is a standing simulated
// instrument — always animating, independent of the pipeline's current
// stage — labeled unambiguously as simulated per the honesty contract.

const CAP_ELECTRODES = 40; // a representative scatter, not a literal 64-point map — the true count is stated on the monitor

function Electrodes() {
  const positions = useMemo(() => {
    const random = mulberry32(11);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < CAP_ELECTRODES; i++) {
      const u = random() * 0.86 - 0.06; // biased toward the upper hemisphere
      const theta = random() * Math.PI * 2;
      const s = Math.sqrt(Math.max(0, 1 - u * u));
      pts.push(new THREE.Vector3(s * Math.cos(theta), Math.abs(u), s * Math.sin(theta)));
    }
    return pts;
  }, []);

  return (
    <group>
      {positions.map((p, i) => (
        <mesh key={i} position={[p.x * 0.128, 0.03 + p.y * 0.125, p.z * 0.128]}>
          <sphereGeometry args={[0.0055, 8, 8]} />
          <meshStandardMaterial color="#cfd8ea" emissive="#3f6bd6" emissiveIntensity={0.5} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Participant() {
  return (
    // Faces -Z (the back wall) — the rest of the lab sits toward +Z, so
    // every other station's camera sees this figure from behind or the side.
    <group position={[0, 0, 0.15]}>
      {/* Chair. */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.42, 8]} />
        <meshStandardMaterial color="#2a2f38" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.05, 20]} />
        <meshStandardMaterial color="#181b21" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.72, -0.19]}>
        <boxGeometry args={[0.4, 0.5, 0.05]} />
        <meshStandardMaterial color="#181b21" roughness={0.6} />
      </mesh>

      {/* Torso + head, seated. */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <capsuleGeometry args={[0.16, 0.42, 6, 16]} />
        <meshStandardMaterial color="#232833" roughness={0.75} />
      </mesh>
      <group position={[0, 1.28, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.115, 24, 20]} />
          <meshStandardMaterial color="#3a3126" roughness={0.7} />
        </mesh>
        {/* EEG cap. */}
        <mesh position-y={0.01} castShadow>
          <sphereGeometry args={[0.124, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#14171d" roughness={0.55} metalness={0.25} />
        </mesh>
        <Electrodes />
        {/* Cap-to-amplifier cable bundle. */}
        <mesh position={[0, -0.12, 0.1]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
          <meshStandardMaterial color="#0e1014" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

export function EEGStation() {
  const { stage } = useBciExperiment();
  const reducedMotion = useReducedMotion();
  const active = stage === "eeg";

  const drawMonitor = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      drawBackdrop(ctx, w, h);
      drawChrome(ctx, w, h, "EEG ACQUISITION", HONESTY_LABELS.eegInput, PANEL.cyan);
      drawKeyValueRows(ctx, w, h, h * 0.19, [
        { label: "CHANNELS", value: String(EEG_ACQUISITION.channels), color: PANEL.cyan },
        { label: "SAMPLE RATE", value: `${EEG_ACQUISITION.sampleRateHz} Hz`, color: PANEL.cyan },
      ]);
      drawWaveform(ctx, w, h * 0.62, {
        top: h * 0.66,
        bottom: h * 0.98,
        channels: 6,
        color: PANEL.cyan,
        phase: t * 2.1,
        amplitude: h * 0.028,
        seed: 4,
      });
    },
    [],
  );

  return (
    <StationShell id="eeg" position={EEG_POSITION} radius={1.5} active={active} tint={PANEL.cyan}>
      <Participant />
      <group position={[1.55, 0, 0.15]} rotation-y={Math.PI - Math.PI / 2.6}>
        <Desk width={1.15} depth={0.55} topY={0.74} />
        <Screen
          size={[0.62, 0.42]}
          position={[0, 1.12, 0]}
          rotation={[0, 0, 0]}
          draw={drawMonitor}
          intervalMs={90}
          frozen={reducedMotion}
          glow={PANEL.cyan}
        />
      </group>
      <Nameplate text="EEG Station" sub="Motor imagery · rear view" position={[0, 1.85, 1.3]} />
    </StationShell>
  );
}
