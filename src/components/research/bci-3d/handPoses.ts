import type { GestureId } from "@/data/bci-experiment";

// Per-gesture joint targets for the procedural five-finger hand. Each finger
// has 3 joints (proximal → middle → distal); `curl` is flexion around the
// joint's local bend axis (0 = straight, ~1.4 rad ≈ fully curled). `splay`
// fans the four fingers (excluding the thumb) apart from their resting
// column; `thumbCurl`/`thumbSplay` pose the thumb, which bends and rotates
// on a different axis (opposable).
//
// These are illustrative joint targets for a procedural rig, not a motion
// capture of the thesis's physical actuator limits.

export type HandPose = {
  curl: readonly [number, number, number, number]; // index, middle, ring, pinky (proximal curl; middle/distal scale from this)
  splay: number;
  thumbCurl: number;
  thumbSplay: number;
};

const REST: HandPose = { curl: [0.34, 0.36, 0.34, 0.3], splay: 0.06, thumbCurl: 0.28, thumbSplay: 0.15 };

export const HAND_POSES: Record<GestureId, HandPose> = {
  REST,
  OPEN_HAND: { curl: [0.04, 0.04, 0.04, 0.04], splay: 0.34, thumbCurl: 0.05, thumbSplay: 0.55 },
  CLOSE_HAND: { curl: [1.32, 1.38, 1.34, 1.26], splay: 0.02, thumbCurl: 0.95, thumbSplay: 0.05 },
  PINCH_GRIP: { curl: [0.92, 0.55, 0.5, 0.46], splay: 0.08, thumbCurl: 0.98, thumbSplay: 0.32 },
  POWER_GRIP: { curl: [1.18, 1.24, 1.2, 1.12], splay: 0.04, thumbCurl: 0.62, thumbSplay: 0.02 },
  POINT: { curl: [0.05, 1.3, 1.28, 1.22], splay: 0.03, thumbCurl: 0.7, thumbSplay: 0.02 },
};
