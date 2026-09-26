import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CSP_FACTS } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const FACTS: { label: string; value: string }[] = [
  { label: "Components", value: String(CSP_FACTS.components) },
  { label: "Feature Type", value: CSP_FACTS.featureType },
  { label: "Fit Scope", value: CSP_FACTS.fitScope },
];

// 06 CSP FEATURE EXTRACTION — Common Spatial Patterns, fit on the
// training split only. Numbers independently confirmed in two documents:
// PROJECT_REPORT.md's "four log-variance features" and
// Lab10_02_Train_CSP.md's own output shape "(29, 4)".
export function CSPSection() {
  return (
    <section id="csp-feature-extraction" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={6} title="CSP Feature Extraction" />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {FACTS.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 0.05}>
              <div className="h-full rounded-xl border border-border bg-surface p-5">
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted">{fact.label}</p>
                <p className="mt-2 font-display text-lg font-medium tracking-tight text-balance">{fact.value}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-8">
          <div className="rounded-xl border border-border-strong bg-surface p-5">
            <p className="text-sm leading-relaxed text-muted">{CSP_FACTS.leakageNote}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
