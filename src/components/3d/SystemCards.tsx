"use client";

import { CARD_RECTS, SYSTEMS, type SystemId } from "./sceneConfig";
import type { SceneMode, SceneView } from "./sceneView";

// The reference's glass HUD panels, as real DOM (crisp text in the site's
// own type). Positioned straight from the reference rectangles through the
// same reference→canvas transform as the camera, and layered *beneath* the
// canvas so the 3D objects overlap the panels exactly as they do in the
// reference (the bust's head over its card, the sensor over its own).
// Text is clamped to a readable minimum size, so panels grow a little as the
// scene shrinks. Panels are `pointer-events: none` — the stage hit-tests their
// rectangles to highlight the matching system — and are purely presentational
// (no tab stops); the same text is available to assistive tech.

export function SystemCards({
  view,
  mode,
  hovered,
}: {
  view: SceneView;
  mode: SceneMode;
  hovered: SystemId | null;
}) {
  // Tablet and mobile: too small for panels — the scene carries the message.
  if (mode === "tablet" || mode === "mobile") return null;

  const titlesOnly = mode === "compact";
  const s = view.scale;
  const title = Math.max(11, 19 * s);
  const body = Math.max(9, 10 * s);
  const pad = Math.max(8, 13 * s);

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {SYSTEMS.map((system) => {
        const rect = CARD_RECTS[system.id];
        const active = hovered === system.id;
        return (
          <article
            key={system.id}
            aria-label={`${system.title.replace("–", "-")} — ${system.subtitle}`}
            data-system={system.id}
            data-active={active}
            className="pointer-events-none absolute rounded-[14px] transition-[border-color,box-shadow,background] duration-300"
            style={{
              left: (rect.x - view.rx) * s,
              top: (rect.y - view.ry) * s,
              width: rect.w * s,
              minHeight: titlesOnly ? undefined : rect.h * s,
              padding: pad,
              paddingLeft: pad + (rect.clearLeft ?? 0) * rect.w * s,
              paddingRight: pad + (rect.clearRight ?? 0) * rect.w * s,
              borderRadius: Math.max(10, 14 * s),
              border: `1px solid ${active ? "rgba(120,190,255,0.75)" : "rgba(96,150,255,0.3)"}`,
              background: active
                ? "linear-gradient(140deg, rgba(44,90,190,0.5), rgba(12,28,72,0.62))"
                : "linear-gradient(140deg, rgba(34,68,150,0.32), rgba(9,20,52,0.5))",
              boxShadow: active
                ? "0 0 32px rgba(70,140,255,0.32), inset 0 1px 0 rgba(255,255,255,0.12)"
                : "0 0 22px rgba(40,100,255,0.1), inset 0 1px 0 rgba(255,255,255,0.07)",
            }}
          >
            <h3
              className="font-display font-semibold uppercase leading-[1.05] tracking-tight"
              style={{ fontSize: title, color: active ? "#9bd0ff" : "#6cb0ff" }}
            >
              {system.title}
            </h3>
            {!titlesOnly && (
              <ul className="mt-[0.55em] space-y-[0.32em]" style={{ fontSize: body }}>
                {system.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-baseline gap-[0.55em] leading-tight" style={{ color: "#c6d5ee" }}>
                    <span aria-hidden className="inline-block h-[0.32em] w-[0.32em] shrink-0 rounded-full" style={{ background: "#4c8dff" }} />
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </article>
        );
      })}
    </div>
  );
}
