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
      {/* Task chair: five-star base, gas cylinder, seat pan, curved
          backrest and a pair of armrests — a real chair silhouette rather
          than a stool. */}
      <group position-y={0.02}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} rotation-y={(i / 5) * Math.PI * 2} position={[0, 0.015, 0]} castShadow>
            <boxGeometry args={[0.03, 0.03, 0.26]} />
            <meshStandardMaterial color="#20242c" roughness={0.4} metalness={0.7} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.4, 10]} />
        <meshStandardMaterial color="#2a2f38" metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.44, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.23, 0.06, 20]} />
        <meshStandardMaterial color="#1c2027" roughness={0.65} />
      </mesh>
      <group position={[0, 0.68, -0.16]} rotation={[-0.12, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.5, 0.06]} />
          <meshStandardMaterial color="#1c2027" roughness={0.65} />
        </mesh>
        <mesh position={[0, 0, 0.035]}>
          <boxGeometry args={[0.34, 0.42, 0.015]} />
          <meshStandardMaterial color="#262b34" roughness={0.55} />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.235, 0.58, -0.02]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.22]} />
          <meshStandardMaterial color="#20242c" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`post-${side}`} position={[side * 0.235, 0.49, -0.02]}>
          <cylinderGeometry args={[0.014, 0.014, 0.18, 8]} />
          <meshStandardMaterial color="#20242c" roughness={0.45} metalness={0.6} />
        </mesh>
      ))}

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
        {/* EEG cap: fabric shell, a fitted strap ring at the brow line, and
            a chin strap — physical headset details, not a smooth dome. */}
        <mesh position-y={0.01} castShadow>
          <sphereGeometry args={[0.124, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          <meshStandardMaterial color="#14171d" roughness={0.62} metalness={0.12} />
        </mesh>
        <mesh position-y={0.05} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.121, 0.007, 8, 28]} />
          <meshStandardMaterial color="#0e1014" roughness={0.55} metalness={0.15} />
        </mesh>
        <mesh position={[0, -0.05, 0.06]} rotation={[1.05, 0, 0]}>
          <cylinderGeometry args={[0.006, 0.006, 0.16, 6]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.6} metalness={0.15} />
        </mesh>
        <Electrodes />
        {/* Cap-to-amplifier cable bundle, draping down toward the desk. */}
        <mesh position={[0, -0.12, 0.1]} rotation={[0.5, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 6]} />
          <meshStandardMaterial color="#0e1014" roughness={0.5} metalness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

// Small EEG amplifier/acquisition unit beside the desk: a dark rack-style
// box with a status LED row and a bundle of electrode leads running up to
// the cap, plus a downstream cable to the acquisition monitor — actual-
// looking hardware in the scene rather than the cap driving a "hologram".
function AmplifierBox({ deskTopY }: { deskTopY: number }) {
  return (
    <group position={[-0.62, deskTopY, -0.02]}>
      <mesh position-y={0.045} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.09, 0.16]} />
        <meshStandardMaterial color="#15171d" roughness={0.45} metalness={0.4} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[-0.08 + i * 0.05, 0.096, 0.082]}>
          <boxGeometry args={[0.014, 0.006, 0.004]} />
          <meshStandardMaterial
            color={i === 0 ? "#5cf2a8" : "#2a2f38"}
            emissive={i === 0 ? "#5cf2a8" : "#000000"}
            emissiveIntensity={i === 0 ? 1.4 : 0}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Lead bundle to the participant's cap, and a downstream cable to
          the monitor — both simple draped-segment approximations. */}
      <mesh position={[-0.16, 0.09, -0.02]} rotation={[0.3, -0.5, 0]}>
        <cylinderGeometry args={[0.009, 0.009, 0.3, 6]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0.15, 0.07, 0.02]} rotation={[0.2, 0.7, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.26, 6]} />
        <meshStandardMaterial color="#0c0d10" roughness={0.55} metalness={0.2} />
      </mesh>
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
        <AmplifierBox deskTopY={0.74} />
        <Screen
          size={[0.62, 0.42]}
          position={[0, 1.12, 0]}
          rotation={[0, 0, 0]}
          draw={drawMonitor}
          intervalMs={90}
          frozen={reducedMotion}
          glow={PANEL.cyan}
          deskY={0.74}
        />
      </group>
      <Nameplate text="EEG Station" sub="Motor imagery · rear view" position={[0, 1.85, 1.3]} />
    </StationShell>
  );
}
