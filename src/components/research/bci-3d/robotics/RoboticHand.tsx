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

const METAL = { color: "#b7c2d6", metalness: 0.82, roughness: 0.3 } as const; // anodized-aluminum tone
const JOINT = { color: "#20242e", metalness: 0.7, roughness: 0.45 } as const;
const POLYMER = { color: "#171a21", metalness: 0.2, roughness: 0.7 } as const;
const RUBBER = { color: "#101114", metalness: 0.05, roughness: 0.88 } as const;
const TENDON = { color: "#0b0c0f", metalness: 0.15, roughness: 0.6 } as const;
const STEEL = { color: "#8d95a3", metalness: 0.9, roughness: 0.22 } as const; // fastener tone, brighter/harder than the housings

// A small hex-head bolt — reused at every panel seam so the hand reads as
// assembled hardware (real screws holding real plates together) rather
// than a single molded blob. Cheap: one shared geometry per call site.
function Bolt({ position, rotation, radius = 0.0026 }: { position: readonly [number, number, number]; rotation?: readonly [number, number, number]; radius?: number }) {
  return (
    <mesh position={position as [number, number, number]} rotation={rotation as [number, number, number] | undefined}>
      <cylinderGeometry args={[radius, radius, radius * 1.4, 6]} />
      <meshStandardMaterial {...STEEL} />
    </mesh>
  );
}

// A joint pin — a thin steel rod through a knuckle sphere, perpendicular
// to the bend axis, suggesting a real hinge rather than a bare ball joint.
function JointPin({ radius }: { radius: number }) {
  return (
    <mesh rotation-z={Math.PI / 2}>
      <cylinderGeometry args={[radius * 0.16, radius * 0.16, radius * 2.6, 8]} />
      <meshStandardMaterial {...STEEL} />
    </mesh>
  );
}

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

// Per-finger animation decay rates — index/middle/ring/pinky, matching
// FINGERS' order. Higher = faster. Deliberately uneven so a gesture change
// visibly cascades across the hand instead of every finger arriving in
// perfect lockstep.
const FINGER_RATES = [7.2, 6.4, 5.6, 4.8] as const;
const THUMB_RATE = 6.6;

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
        // from a visible mechanical bulge, not a bare hinge. Two small
        // bolts at the housing's outer corners read as a fastened cover
        // plate, not a molded blob.
        <group position-y={radius * 0.1}>
          <mesh castShadow>
            <boxGeometry args={[radius * 2.7, radius * 1.7, radius * 2.3]} />
            <meshStandardMaterial {...JOINT} />
          </mesh>
          <Bolt position={[0, radius * 0.9, radius * 0.95]} rotation={[Math.PI / 2, 0, 0]} radius={radius * 0.22} />
          <Bolt position={[0, radius * 0.9, -radius * 0.95]} rotation={[Math.PI / 2, 0, 0]} radius={radius * 0.22} />
        </group>
      )}
      <mesh position-y={0}>
        <sphereGeometry args={[radius * 1.12, 10, 8]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>
      <JointPin radius={radius} />
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
        <Bolt position={[PHALANX_RADIUS * 1.3, -PHALANX_RADIUS * 0.15, 0]} rotation={[0, 0, Math.PI / 2]} radius={PHALANX_RADIUS * 0.24} />
        <mesh>
          <sphereGeometry args={[PHALANX_RADIUS * 1.3, 10, 8]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        <JointPin radius={PHALANX_RADIUS * 1.1} />
        <group position-y={lengths[0]} ref={(g) => setSlot(refs.current, 1, g)}>
          <mesh position-y={lengths[1] / 2} castShadow>
            <capsuleGeometry args={[PHALANX_RADIUS, lengths[1] - PHALANX_RADIUS * 1.8, 4, 10]} />
            <meshStandardMaterial {...POLYMER} />
          </mesh>
          <mesh>
            <sphereGeometry args={[PHALANX_RADIUS * 1.05, 10, 8]} />
            <meshStandardMaterial {...JOINT} />
          </mesh>
          <JointPin radius={PHALANX_RADIUS * 0.95} />
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
    // Per-finger decay rates, not one shared rate — index fastest, pinky
    // slowest, so the fingers visibly finish at slightly different moments
    // instead of moving as one rigid unit. Reads as sequential mechanical
    // actuation rather than a single hinge, on top of the exponential ease
    // each joint already gets from this decay curve.
    const rateFor = (rate: number) => (reducedMotion ? 1 : 1 - Math.exp(-delta * rate));
    c.curl = [
      THREE.MathUtils.lerp(c.curl[0], target.curl[0], rateFor(FINGER_RATES[0])),
      THREE.MathUtils.lerp(c.curl[1], target.curl[1], rateFor(FINGER_RATES[1])),
      THREE.MathUtils.lerp(c.curl[2], target.curl[2], rateFor(FINGER_RATES[2])),
      THREE.MathUtils.lerp(c.curl[3], target.curl[3], rateFor(FINGER_RATES[3])),
    ];
    const kThumb = rateFor(THUMB_RATE);
    c.splay = THREE.MathUtils.lerp(c.splay, target.splay, kThumb);
    c.thumbCurl = THREE.MathUtils.lerp(c.thumbCurl, target.thumbCurl, kThumb);
    c.thumbSplay = THREE.MathUtils.lerp(c.thumbSplay, target.thumbSplay, kThumb);
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
      {/* Wrist mounting flange — a real mechanical interface disc with
          bolt-holes around its rim, not a bare torus. This is the
          "mounting interface" the hand is actually attached through. */}
      <mesh position={[0, 0.24, -0.02]} rotation-x={Math.PI / 2} castShadow>
        <cylinderGeometry args={[0.066, 0.066, 0.018, 24]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return <Bolt key={i} position={[Math.cos(a) * 0.058, 0.24, -0.02 + Math.sin(a) * 0.058]} rotation={[Math.PI / 2, 0, 0]} radius={0.0032} />;
      })}
      <mesh position={[0, 0.24, -0.02]} castShadow>
        <sphereGeometry args={[0.052, 20, 16]} />
        <meshStandardMaterial {...JOINT} />
      </mesh>

      {/* Palm — a structural base with a thinner cover plate fastened on
          top (a visible seam + corner bolts), not one solid molded block. */}
      <group position={[0, 0.26, 0.05]}>
        <mesh castShadow>
          <boxGeometry args={[0.16, 0.05, 0.11]} />
          <meshStandardMaterial {...POLYMER} />
        </mesh>
        <mesh position={[0, 0.014, 0]} castShadow>
          <boxGeometry args={[0.154, 0.008, 0.104]} />
          <meshStandardMaterial {...JOINT} />
        </mesh>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => <Bolt key={`${sx}-${sz}`} position={[sx * 0.066, 0.019, sz * 0.042]} radius={0.0026} />),
        )}
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
