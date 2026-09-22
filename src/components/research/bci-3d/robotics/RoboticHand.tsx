"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import { setSlot } from "@/components/3d/imperative";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useBciExperiment } from "../BCIExperimentProvider";
import { HAND_POSES, type HandPose } from "../handPoses";

// FIVE-FINGER ROBOTIC HAND — the experiment's physical outcome: palm,
// wrist, and five real 3-joint finger chains (a thumb plus four fingers),
// procedurally posed per the thesis gesture vocabulary. No licensed
// real-world robotic-hand asset exists (src/data/bci-assets.ts — checked
// before building this), so this is a purposeful procedural joint
// hierarchy rather than a decorative shape.
//
// Pure hand geometry only — mounting, the workbench, and the honesty
// labels live in RoboticWorkbench.tsx, which positions this at its own
// wrist-mount point.

const METAL = { color: "#c3ccdb", metalness: 0.75, roughness: 0.32 } as const;
const JOINT = { color: "#20242e", metalness: 0.7, roughness: 0.45 } as const;
const POLYMER = { color: "#171a21", metalness: 0.2, roughness: 0.7 } as const;
const RUBBER = { color: "#101114", metalness: 0.05, roughness: 0.88 } as const;
const TENDON = { color: "#0b0c0f", metalness: 0.15, roughness: 0.6 } as const;

type FingerSpec = {
  id: "index" | "middle" | "ring" | "pinky";
  x: number;
  scale: number; // relative length (middle is longest)
  splaySign: number;
};

const FINGERS: FingerSpec[] = [
  { id: "index", x: -0.048, scale: 0.92, splaySign: -1 },
  { id: "middle", x: -0.016, scale: 1.0, splaySign: -0.3 },
  { id: "ring", x: 0.016, scale: 0.94, splaySign: 0.3 },
  { id: "pinky", x: 0.048, scale: 0.78, splaySign: 1 },
];

const PHALANX_RADIUS = 0.011;
const BASE_SEGMENT = 0.052;

function Phalanges({ scale, refs, refBase }: { scale: number; refs: React.MutableRefObject<(Group | null)[]>; refBase: number }) {
  const lengths = [BASE_SEGMENT * scale, BASE_SEGMENT * 0.86 * scale, BASE_SEGMENT * 0.62 * scale];
  return <Segment lengths={lengths} depth={0} refs={refs} refBase={refBase} />;
}

function Segment({
  lengths,
  depth,
  refs,
  refBase,
}: {
  lengths: number[];
  depth: number;
  refs: React.MutableRefObject<(Group | null)[]>;
  refBase: number;
}) {
  const length = lengths[depth];
  if (length === undefined) return null;
  const radius = PHALANX_RADIUS * (1 - depth * 0.16);
  const isTip = depth === lengths.length - 1;
  return (
    <group ref={(g) => setSlot(refs.current, refBase + depth, g)}>
      <mesh position-y={length / 2} castShadow>
        <capsuleGeometry args={[radius, Math.max(length - radius * 2, 0.004), 4, 10]} />
        <meshStandardMaterial {...(depth === 1 ? POLYMER : METAL)} />
      </mesh>
      {/* Dorsal tendon line — a thin cable along the back of the segment,
          suggesting real actuation routing rather than a bare mechanical
          skeleton. Moves with the joint it's attached to; no separate
          animation. */}
      <mesh position={[0, length / 2, -radius * 1.3]}>
        <cylinderGeometry args={[radius * 0.2, radius * 0.2, length * 0.8, 6]} />
        <meshStandardMaterial {...TENDON} />
      </mesh>
      {depth === 0 && (
        // Knuckle actuator housing at the MCP joint — every finger bends
        // from a visible mechanical bulge, not a bare hinge.
        <mesh position-y={radius * 0.1} castShadow>
          <boxGeometry args={[radius * 2.7, radius * 1.7, radius * 2.3]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
      )}
      <mesh position-y={0}>
        <sphereGeometry args={[radius * 1.12, 10, 8]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      <group position-y={length}>
        {isTip ? (
          // Fingertip pad — matte dark rubber, not bare metal, where the
          // hand would actually contact an object.
          <mesh position-y={radius * 0.55} castShadow>
            <sphereGeometry args={[radius * 1.08, 10, 8]} />
            <meshStandardMaterial {...RUBBER} />
          </mesh>
        ) : (
          <Segment lengths={lengths} depth={depth + 1} refs={refs} refBase={refBase} />
        )}
      </group>
    </group>
  );
}

function Thumb({ refs }: { refs: React.MutableRefObject<(Group | null)[]> }) {
  const lengths = [BASE_SEGMENT * 0.62, BASE_SEGMENT * 0.5];
  return (
    <group position={[-0.075, -0.01, 0.028]} rotation={[0.3, 0, 1.02]}>
      <group ref={(g) => setSlot(refs.current, 0, g)}>
        <mesh position-y={lengths[0] / 2} castShadow>
          <capsuleGeometry args={[PHALANX_RADIUS * 1.15, lengths[0] - PHALANX_RADIUS * 2, 4, 10]} />
          <meshStandardMaterial {...METAL} />
        </mesh>
        <mesh position={[0, lengths[0] / 2, -PHALANX_RADIUS * 1.5]}>
          <cylinderGeometry args={[PHALANX_RADIUS * 0.22, PHALANX_RADIUS * 0.22, lengths[0] * 0.78, 6]} />
          <meshStandardMaterial {...TENDON} />
        </mesh>
        <mesh position-y={-PHALANX_RADIUS * 0.15} castShadow>
          <boxGeometry args={[PHALANX_RADIUS * 3, PHALANX_RADIUS * 2, PHALANX_RADIUS * 2.6]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        <mesh>
          <sphereGeometry args={[PHALANX_RADIUS * 1.3, 10, 8]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        <group position-y={lengths[0]} ref={(g) => setSlot(refs.current, 1, g)}>
          <mesh position-y={lengths[1] / 2} castShadow>
            <capsuleGeometry args={[PHALANX_RADIUS, lengths[1] - PHALANX_RADIUS * 1.8, 4, 10]} />
            <meshStandardMaterial {...POLYMER} />
          </mesh>
          <mesh>
            <sphereGeometry args={[PHALANX_RADIUS * 1.05, 10, 8]} />
            <meshStandardMaterial {...JOINT} />
          </mesh>
          <mesh position-y={lengths[1] + PHALANX_RADIUS * 0.5} castShadow>
            <sphereGeometry args={[PHALANX_RADIUS * 1.02, 10, 8]} />
            <meshStandardMaterial {...RUBBER} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// Interpolated joint targets → concrete rotation angles per finger joint.
function applyPose(fingerRefs: React.MutableRefObject<(Group | null)[]>[], thumbRefs: React.MutableRefObject<(Group | null)[]>, pose: HandPose) {
  FINGERS.forEach((finger, fi) => {
    const refs = fingerRefs[fi].current;
    const curl = pose.curl[fi];
    const scales = [1, 0.92, 0.72];
    for (let j = 0; j < 3; j++) {
      const g = refs[j];
      if (!g) continue;
      g.rotation.x = curl * scales[j];
      if (j === 0) g.rotation.z = finger.splaySign * pose.splay;
    }
  });
  const t = thumbRefs.current;
  if (t[0]) t[0].rotation.x = pose.thumbCurl * 0.9;
  if (t[1]) t[1].rotation.x = pose.thumbCurl * 1.1;
}

export function RoboticHand() {
  const { phase, command, accepted } = useBciExperiment();
  const reducedMotion = useReducedMotion();

  const indexRefs = useRef<(Group | null)[]>([]);
  const middleRefs = useRef<(Group | null)[]>([]);
  const ringRefs = useRef<(Group | null)[]>([]);
  const pinkyRefs = useRef<(Group | null)[]>([]);
  const thumbRefs = useRef<(Group | null)[]>([]);
  const fingerRefs = useMemo(() => [indexRefs, middleRefs, ringRefs, pinkyRefs], []);

  const current = useRef<HandPose>({ ...HAND_POSES.REST, curl: [...HAND_POSES.REST.curl] });

  // Executing/holding a command the gate accepted shows that gesture; every
  // other state (idle, rejected, mid-inference, stopped) shows REST — a
  // rejected prediction never moves the hand.
  const targetId = (phase === "COMMAND_ACCEPTED" || phase === "EXECUTING" || phase === "COMPLETED") && accepted ? command : "REST";
  const target = HAND_POSES[targetId];

  useFrame((_, delta) => {
    const c = current.current;
    const k = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.5);
    c.curl = [
      THREE.MathUtils.lerp(c.curl[0], target.curl[0], k),
      THREE.MathUtils.lerp(c.curl[1], target.curl[1], k),
      THREE.MathUtils.lerp(c.curl[2], target.curl[2], k),
      THREE.MathUtils.lerp(c.curl[3], target.curl[3], k),
    ];
    c.splay = THREE.MathUtils.lerp(c.splay, target.splay, k);
    c.thumbCurl = THREE.MathUtils.lerp(c.thumbCurl, target.thumbCurl, k);
    c.thumbSplay = THREE.MathUtils.lerp(c.thumbSplay, target.thumbSplay, k);
    applyPose(fingerRefs, thumbRefs, c);
  });

  return (
    <group>
      {/* Forearm + wrist: a segmented forearm, a motor housing with vent
          slats, and a mounting flange at the wrist joint — actuator
          hardware, not a bare rod. */}
      <mesh position={[0, 0.06, -0.3]} rotation={[0.5, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.16, 0.24]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[0.052, 0.02 + i * 0.045, -0.3 + i * 0.02]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.004, 0.11, 0.02]} />
          <meshStandardMaterial color="#0c0d10" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.16, -0.16]} rotation={[0.5, 0, 0]} castShadow>
        <cylinderGeometry args={[0.052, 0.058, 0.32, 20]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      <mesh position={[0, 0.24, -0.02]} rotation-x={Math.PI / 2} castShadow>
        <torusGeometry args={[0.062, 0.012, 10, 24]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      <mesh position={[0, 0.24, -0.02]} castShadow>
        <sphereGeometry args={[0.058, 20, 16]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>

      {/* Palm. */}
      <group position={[0, 0.26, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.05, 0.11]} />
          <meshStandardMaterial {...POLYMER} />
        </mesh>
        <mesh position={[0, -0.026, 0]}>
          <boxGeometry args={[0.15, 0.006, 0.1]} />
          <meshStandardMaterial {...RUBBER} />
        </mesh>
        <mesh position={[0, 0.026, 0]}>
          <boxGeometry args={[0.152, 0.006, 0.1]} />
          <meshStandardMaterial color="#2dd4c8" emissive="#2dd4c8" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>

        {FINGERS.map((finger, fi) => (
          <group key={finger.id} position={[finger.x, 0.026, 0.05]}>
            <Phalanges scale={finger.scale} refs={fingerRefs[fi]} refBase={0} />
          </group>
        ))}
        <Thumb refs={thumbRefs} />
      </group>
    </group>
  );
}
