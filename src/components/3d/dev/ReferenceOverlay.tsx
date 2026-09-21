"use client";

import { useEffect, useState } from "react";
import { REF } from "../sceneConfig";
import type { SceneView } from "../sceneView";

// DEV ONLY. Lays the target reference render over the canvas using the exact
// same reference→canvas transform the camera uses, so any misalignment of the
// 3D scene is visible at a glance. Toggle with the `O` key (off → 50% → 100%)
// or start with `?heroref=0.5`. HeroScene only imports this when
// NODE_ENV !== "production", and the image itself lives in the gitignored
// public/__dev/ folder — neither ships.

function initialOpacity() {
  const value = new URLSearchParams(window.location.search).get("heroref");
  if (value === null) return 0;
  const parsed = Number(value);
  return Math.min(1, Math.max(0, Number.isFinite(parsed) && parsed > 0 ? parsed : 0.5));
}

export default function ReferenceOverlay({ view }: { view: SceneView }) {
  const [opacity, setOpacity] = useState(initialOpacity);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName))) return;
      if (event.key.toLowerCase() !== "o" || event.metaKey || event.ctrlKey || event.altKey) return;
      setOpacity((current) => (current === 0 ? 0.5 : current < 1 ? 1 : 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (opacity === 0) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- dev-only overlay, sized by the scene transform
    <img
      alt=""
      aria-hidden
      src="/__dev/hero-reference.jpg"
      style={{
        position: "absolute",
        left: -view.rx * view.scale,
        top: -view.ry * view.scale,
        width: REF.w * view.scale,
        height: REF.h * view.scale,
        maxWidth: "none",
        opacity,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}
