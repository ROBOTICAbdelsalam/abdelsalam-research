"use client";

import { useSyncExternalStore } from "react";

// WebGL support can't change during a session, so this is cached after the
// first check rather than re-detected on every snapshot read.
let cachedSupport: boolean | null = null;

function detect(): boolean {
  if (cachedSupport !== null) return cachedSupport;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    cachedSupport = Boolean(gl);
  } catch {
    cachedSupport = false;
  }
  return cachedSupport;
}

// Nothing to subscribe to (the result never changes after first read), but
// useSyncExternalStore still gives us a server/client-safe snapshot: `false`
// during SSR and initial hydration (matching getServerSnapshot), then the
// real result immediately after — the same pattern useReducedMotion uses.
function subscribe() {
  return () => {};
}

function getServerSnapshot() {
  return false;
}

export function useWebglSupport() {
  return useSyncExternalStore(subscribe, detect, getServerSnapshot);
}
