import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Chain } from "@/components/ui/Chain";
import { ADAPTIVE_LAYER_STATE, LIVE_GATE_THRESHOLD } from "@/data/bci-experiment";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 08 ADAPTIVE DECISION — deliberately reads its numbers from
// src/data/bci-experiment.ts (the interactive digital twin's own,
// already-implemented constants) instead of restating new values here,
// so this section and the live demo above can never disagree.
export function AdaptiveDecisionSection() {
  return (
    <section id="adaptive-decision" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={8} title="Adaptive Decision" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-balance">
            A confidence gate decides whether a prediction becomes a command. It adapts to recent accuracy: a model that has been reliable gets a more permissive gate; a model that hasn&apos;t, or one that hasn&apos;t collected enough feedback yet, is held to a stricter one.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <Chain items={["Prediction", "Confidence", "Adaptive Threshold", "Accept / Wait / Reject"]} lastItemAccent />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Reveal delay={0.12}>
            <div className="h-full rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted">High Accuracy</p>
              <p className="mt-2 text-sm text-foreground/90">More permissive — the gate relaxes as the decoder proves reliable.</p>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="h-full rounded-xl border border-border bg-surface p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Low Accuracy</p>
              <p className="mt-2 text-sm text-foreground/90">More conservative — the gate tightens rather than risk an unintended command.</p>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="h-full rounded-xl border border-amber/40 bg-amber-soft p-5">
              <p className="font-mono text-[10px] uppercase tracking-wide text-amber">Cold Start</p>
              <p className="mt-2 text-sm text-foreground/90">
                Conservative by design — fewer than {ADAPTIVE_LAYER_STATE.coldStartMinSamples} feedback samples holds the threshold at {ADAPTIVE_LAYER_STATE.coldStartThreshold.toFixed(2)}, regardless of measured accuracy.
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.24} className="mt-8">
          <div className="rounded-xl border border-border-strong bg-surface p-5">
            <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Current Adaptive-Layer State</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted">Feedback samples</dt>
                <dd className="font-mono text-foreground">{ADAPTIVE_LAYER_STATE.feedbackSamples}</dd>
              </div>
              <div>
                <dt className="text-muted">Feedback accuracy</dt>
                <dd className="font-mono text-foreground">{(ADAPTIVE_LAYER_STATE.feedbackAccuracy * 100).toFixed(0)}%</dd>
              </div>
              <div>
                <dt className="text-muted">Samples remaining</dt>
                <dd className="font-mono text-foreground">{ADAPTIVE_LAYER_STATE.samplesRemaining}</dd>
              </div>
              <div>
                <dt className="text-muted">Status</dt>
                <dd className="font-mono text-amber">{ADAPTIVE_LAYER_STATE.status}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-muted">
              The interactive demo above gates each run against a fixed {LIVE_GATE_THRESHOLD.toFixed(2)} threshold (documented as the Lab 14 simulated real-time gate) — distinct from this cold-start bookkeeping, which governs when the online classifier itself is allowed to update.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
