"use client";

import type { CommandInterpretation } from "@/lib/ai-lab/commandContext";
import { getKnowledgeNode } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchItem } from "@/lib/ai-lab/researchGraph";
import { getProject } from "@/lib/ai-lab/projectGraph";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">{label}</p>
      <div className="mt-1 text-xs text-foreground">{children}</div>
    </div>
  );
}

// The Command Brief (spec §8/§12) — a compact, read-only preview of how
// the local router would interpret whatever is currently typed, recomputed
// live from the SAME resolveCommandInterpretation function submitCommand
// itself calls (see commandContext.ts), so nothing shown here can drift
// from what actually runs. Reads as an engineering execution brief, not a
// form: no inputs, nothing to fill in, just what the simulator decided.
export function CommandPreview({ interpretation }: { interpretation: CommandInterpretation }) {
  const knowledgeLabels = interpretation.knowledgeContext
    .map((id) => getKnowledgeNode(id)?.label)
    .filter((label): label is string => Boolean(label));
  const researchLabels = interpretation.researchContext
    .map((id) => getKnowledgeNode(id)?.label ?? getResearchItem(id)?.title)
    .filter((label): label is string => Boolean(label));
  const projectLabels = interpretation.projectContext
    .map((id) => getProject(id)?.title)
    .filter((label): label is string => Boolean(label));

  return (
    <div
      className="rounded-xl border border-border-strong bg-background/40 p-4"
      role="status"
      aria-live="polite"
      aria-label="Command interpretation preview"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Command Brief</span>
        {!interpretation.matched && (
          <span className="font-mono text-[9px] uppercase tracking-wide text-amber">Unmatched — fallback</span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Field label="Intent">{interpretation.intentLabel}</Field>
        <Field label="Agent">{interpretation.primary.name}</Field>
        <Field label="Collaborators">
          {interpretation.collaborators.length > 0 ? interpretation.collaborators.map((a) => a.name).join(", ") : "None"}
        </Field>
        <Field label="Knowledge">{knowledgeLabels.length > 0 ? knowledgeLabels.join(" · ") : "None"}</Field>
        <Field label="Research">{researchLabels.length > 0 ? researchLabels.join(", ") : "None"}</Field>
        <Field label="Project">{projectLabels.length > 0 ? projectLabels.join(", ") : "None"}</Field>
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border pt-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Mode</span>
        <span className="rounded-full border border-trace/30 bg-trace-soft px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-trace">
          Local Simulation
        </span>
      </div>
    </div>
  );
}
