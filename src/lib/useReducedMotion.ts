"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(query);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

// Framer Motion's own `useReducedMotion` reads matchMedia synchronously
// outside an effect, which causes a real SSR/client hydration mismatch the
// moment the OS has reduced motion enabled. useSyncExternalStore reports
// `false` (matching the server) on the first client render, then updates
// to the real value right after — no mismatch, same end result.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
