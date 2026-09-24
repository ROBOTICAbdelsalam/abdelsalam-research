"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import type { Line2 } from "three-stdlib";
import * as THREE from "three";
import type { PipelineStageId } from "@/data/bci-experiment";
import { useBciExperiment } from "../BCIExperimentProvider";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { STAGE_TO_STATION, STATION_FLOW_ORDER, STATION_POSITIONS, type StationId } from "../layout";

// CINEMATIC PIPELINE ORCHESTRATION — a purely presentational overlay on
// top of the existing run (BCIExperimentProvider.tsx / state.ts, both
// unchanged in meaning): a thin luminous line strung through the 8
// stations in pipeline order, each with a soft halo that brightens while
// that station's stage is active and settles to a dim "visited" glow
// once the run has moved past it. Every value driving this is read each
// frame from progressRef (a ref, not React state — see
// BCIExperimentProvider's own note on why) or from the same low-
// frequency reactive fields (phase/stage) the rest of this scene already
// reads directly (ExperimentTimeline reads `stage` the same way), so
// this adds no new per-frame React re-renders.
//
// A run's stage only ever advances forward through STATION_FLOW_ORDER
// (ticks always progress in pipeline order — see buildRunSequence), and
// resets to null on Reset/Emergency Stop. That means "has this station
// already been passed" is always just "is the CURRENT station's index
// greater than mine" — no separate history bookkeeping needed.

const FLOW_Z = 0.16;
const HALO_Z = 0.2;
const CYAN = new THREE.Color("#2dd4c8");
const REJECT_RED = new THREE.Color("#e0575a");

// How long a "packet" takes to travel one segment, independent of the
// destination stage's own tick duration — a station can hold across more
// than one tick (Adaptive Decision spans WAITING_FOR_CONFIDENCE then
// COMMAND_ACCEPTED), so this is timed from when the run actually arrived
// at the station, not from any one tick's own clock.
const TRAVEL_MS = 650;

function currentStationIndex(stage: PipelineStageId | null) {
  if (!stage) return -1;
  return STATION_FLOW_ORDER.indexOf(STAGE_TO_STATION[stage]);
}

function Segment({ from, to, index }: { from: StationId; to: StationId; index: number }) {
  const lineRef = useRef<Line2>(null);
  const dotRef = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();
  const { phase, progressRef } = useBciExperiment();

  const [a, b] = useMemo(() => {
    const [fx, fy] = STATION_POSITIONS[from];
    const [tx, ty] = STATION_POSITIONS[to];
    return [new THREE.Vector3(fx, fy, FLOW_Z), new THREE.Vector3(tx, ty, FLOW_Z)] as const;
  }, [from, to]);

  const lastStationIndexRef = useRef(-1);
  const enteredAtRef = useRef(0);

  useFrame(() => {
    const line = lineRef.current;
    const dot = dotRef.current;
    if (!line || !dot) return;
    const lineMaterial = line.material;
    const dotMaterial = dot.material as THREE.MeshBasicMaterial;

    const stationIndex = currentStationIndex(progressRef.current.stage);
    if (stationIndex !== lastStationIndexRef.current) {
      lastStationIndexRef.current = stationIndex;
      if (stationIndex === index + 1) enteredAtRef.current = performance.now();
    }

    const settled = stationIndex > index + 1;
    const inFlight = stationIndex === index + 1;
    const rejected = phase === "REJECTED";
    const color = rejected && inFlight ? REJECT_RED : CYAN;

    let lineOpacity = 0.08;
    let dotT = 0;
    let dotVisible = false;

    if (settled) {
      lineOpacity = 0.32;
    } else if (inFlight) {
      const elapsed = performance.now() - enteredAtRef.current;
      dotT = reducedMotion ? 1 : THREE.MathUtils.clamp(elapsed / TRAVEL_MS, 0, 1);
      lineOpacity = THREE.MathUtils.lerp(0.1, 0.4, dotT);
      dotVisible = dotT < 1;
    }

    const rate = reducedMotion ? 1 : 0.15;
    lineMaterial.color.lerp(color, rate);
    lineMaterial.opacity = THREE.MathUtils.lerp(lineMaterial.opacity, lineOpacity, rate);
    dotMaterial.color.lerp(color, rate);
    dotMaterial.opacity = THREE.MathUtils.lerp(dotMaterial.opacity, dotVisible ? 0.9 : 0, reducedMotion ? 1 : 0.25);
    dot.position.lerpVectors(a, b, dotT);
  });

  return (
    <>
      <Line ref={lineRef} points={[a, b]} color="#2dd4c8" lineWidth={1} transparent opacity={0.08} depthWrite={false} toneMapped={false} />
      <mesh ref={dotRef} position={a}>
        <circleGeometry args={[0.09, 16]} />
        <meshBasicMaterial color="#2dd4c8" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
    </>
  );
}

function StationHalo({ id }: { id: StationId }) {
  const ref = useRef<THREE.Mesh>(null);
  const reducedMotion = useReducedMotion();
  const { phase, progressRef } = useBciExperiment();
  const [x, y] = STATION_POSITIONS[id];
  const index = STATION_FLOW_ORDER.indexOf(id);

  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const material = mesh.material as THREE.MeshBasicMaterial;

    const stationIndex = currentStationIndex(progressRef.current.stage);
    const isCurrent = stationIndex === index;
    const isPast = stationIndex > index;
    const rejected = phase === "REJECTED";

    const color = rejected && isCurrent ? REJECT_RED : CYAN;
    const pulse = reducedMotion || !isCurrent ? 1 : 0.75 + Math.sin(state.clock.elapsedTime * 4) * 0.25;
    const targetOpacity = isCurrent ? 0.5 * pulse : isPast ? 0.16 : 0;
    const targetScale = isCurrent ? 1.08 : 1;

    const rate = reducedMotion ? 1 : 0.12;
    material.color.lerp(color, rate);
    material.opacity = THREE.MathUtils.lerp(material.opacity, targetOpacity, rate);
    const nextScale = THREE.MathUtils.lerp(mesh.scale.x, targetScale, rate);
    mesh.scale.setScalar(nextScale);
  });

  return (
    <mesh ref={ref} position={[x, y, HALO_Z]}>
      <circleGeometry args={[0.55, 32]} />
      <meshBasicMaterial color="#2dd4c8" transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

export function PipelineFlow() {
  return (
    <group>
      {STATION_FLOW_ORDER.slice(0, -1).map((id, i) => (
        <Segment key={id} from={id} to={STATION_FLOW_ORDER[i + 1]} index={i} />
      ))}
      {STATION_FLOW_ORDER.map((id) => (
        <StationHalo key={id} id={id} />
      ))}
    </group>
  );
}
