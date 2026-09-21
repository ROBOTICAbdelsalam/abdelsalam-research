"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import type { SceneMode } from "./sceneView";

const noopSubscribe = () => () => {};

/** `false` during SSR and the first client render, `true` afterwards — hydration-safe. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/** Tracks an element's content-box size. */
export function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5
          ? prev
          : { width, height },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

/** Whether the element is within `margin` of the viewport. */
export function useInView(ref: RefObject<HTMLElement | null>, margin = "0px") {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: margin,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, margin]);
  return inView;
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

/** False while the browser tab is hidden. */
export function usePageVisible() {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

// Breakpoints follow the Header/Tailwind scale: lg = 1024, xl = 1280, md = 768.
const MODE_QUERIES: [SceneMode, string][] = [
  ["full", "(min-width: 1280px)"],
  ["compact", "(min-width: 1024px)"],
  ["tablet", "(min-width: 768px)"],
];

function subscribeMode(callback: () => void) {
  const lists = MODE_QUERIES.map(([, query]) => window.matchMedia(query));
  lists.forEach((mq) => mq.addEventListener("change", callback));
  return () => lists.forEach((mq) => mq.removeEventListener("change", callback));
}

function getMode(): SceneMode {
  for (const [mode, query] of MODE_QUERIES) {
    if (window.matchMedia(query).matches) return mode;
  }
  return "mobile";
}

/** Which scene composition the viewport width calls for. */
export function useSceneMode(): SceneMode {
  return useSyncExternalStore(subscribeMode, getMode, () => "mobile");
}

/** Resolves true once the browser is idle (or after a short timeout), so scene setup never competes with first paint. */
export function useIdle(timeout = 400) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setIdle(true), 120);
    return () => window.clearTimeout(id);
  }, [timeout]);
  return idle;
}
