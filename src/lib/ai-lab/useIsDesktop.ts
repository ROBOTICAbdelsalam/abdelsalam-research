"use client";

import { useSyncExternalStore } from "react";

// Matches the Header's `lg` breakpoint (1024px) — the full 3D lab only
// loads on desktop-sized viewports; smaller screens get WebGLFallback
// instead of downloading the three.js / R3F bundle at all.
const query = "(min-width: 1024px)";

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

export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
