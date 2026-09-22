"use client";

import { Boxes } from "lucide-react";
import { EEG_ACQUISITION, GESTURES, HONESTY_LABELS, MODEL_NAME, PIPELINE_STAGES, ROS_STACK } from "@/data/bci-experiment";

const MESSAGE: Record<"webgl" | "error", string> = {
  webgl: "This browser doesn't support WebGL, so a simplified overview is shown instead of the interactive digital twin.",
  error: "The interactive digital twin couldn't render in this browser, so a simplified overview is shown instead.",
};

// A professional, honest 2D stand-in — used when WebGL is unavailable or the
// 3D scene fails to mount. Still communicates the real pipeline and facts,
// never just an "unsupported" notice.
export function WebGLFallback({ reason }: { reason: "webgl" | "error" }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-foreground">
          <Boxes size={15} className="text-accent" aria-hidden /> HYBRID-ADAPTIVE BCI
        </span>
        <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
          {HONESTY_LABELS.digitalTwin}
        </span>
      </div>

      <div className="flex flex-col gap-8 bg-grid px-6 py-10">
        <ol className="flex flex-wrap gap-2">
          {PIPELINE_STAGES.map((s) => (
            <li key={s.id} className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-muted">
              <span className="text-border-strong">{s.code}</span> {s.label}
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Channels", value: String(EEG_ACQUISITION.channels) },
            { label: "Sample Rate", value: `${EEG_ACQUISITION.sampleRateHz} Hz` },
            { label: "Model", value: MODEL_NAME },
            { label: "Simulator", value: ROS_STACK.simulator },
          ].map((fact) => (
            <div key={fact.label} className="rounded-xl border border-border bg-surface p-4 text-center">
              <p className="font-display text-lg font-medium tracking-tight">{fact.value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">{fact.label}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">Gesture Vocabulary</p>
          <div className="flex flex-wrap gap-2">
            {GESTURES.map((g) => (
              <span key={g.id} className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-muted">
                {g.label}
              </span>
            ))}
          </div>
        </div>

        <p className="max-w-md text-xs leading-relaxed text-muted">{MESSAGE[reason]}</p>
      </div>
    </div>
  );
}
