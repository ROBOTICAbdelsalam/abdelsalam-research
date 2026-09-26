import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { MODEL_RESULTS, DEPLOYED_MODEL } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 07 AI CLASSIFICATION — the six evaluated models and the deployed
// architecture. The scored results table itself lives in the Results
// section (12) with the scientific-honesty statement as its headline;
// this section focuses on what was evaluated and what ships.
export function AIClassificationSection() {
  return (
    <section id="ai-classification" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={7} title="AI Classification" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-balance">
            Six classifiers were evaluated against the same leakage-free CSP features — three classical machine-learning baselines and three deep-learning architectures.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="flex flex-wrap gap-2">
            {MODEL_RESULTS.map((m) => (
              <Badge key={m.model} tone={m.deployed ? "accent" : "default"}>
                {m.model}
                {m.deployed ? " · deployed" : ""}
              </Badge>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.14} className="mt-10">
          <div className="rounded-2xl border border-border-strong bg-surface p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Deployed Model</p>
            <h3 className="mt-2 font-display text-2xl font-medium tracking-tight">{DEPLOYED_MODEL.name}</h3>

            <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-2">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">Model Size</p>
                <p className="mt-1 font-display text-lg font-medium">≈ {DEPLOYED_MODEL.sizeKB} KB</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">CPU Inference</p>
                <p className="mt-1 font-display text-lg font-medium text-balance">{DEPLOYED_MODEL.inference}</p>
              </div>
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-wide text-muted">Architecture</p>
            <ol className="mt-3 flex flex-wrap gap-2">
              {DEPLOYED_MODEL.architecture.map((layer, i) => (
                <li key={layer} className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-3 py-1 text-sm text-foreground/90">{layer}</span>
                  {i < DEPLOYED_MODEL.architecture.length - 1 && <span className="text-muted/50">→</span>}
                </li>
              ))}
            </ol>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-wide text-muted">Training</p>
            <p className="mt-2 text-sm text-muted">
              {DEPLOYED_MODEL.training.optimizer} optimizer · {DEPLOYED_MODEL.training.callbacks.join(", ")}
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
