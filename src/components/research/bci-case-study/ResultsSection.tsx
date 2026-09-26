import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";
import { MODEL_RESULTS, RESULTS_LABEL, RESULTS_QUOTE, RESULTS_STATEMENT } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 12 RESULTS — the exact documented results, in full, with the
// scientific-honesty statement as the section's own headline. No score
// is hidden or rounded up.
export function ResultsSection() {
  const maxAccuracy = Math.max(...MODEL_RESULTS.map((m) => m.accuracy));

  return (
    <section id="results" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={12} title="Results" />
          <p className="mt-4 max-w-2xl text-lg font-medium leading-snug text-foreground text-balance">{RESULTS_STATEMENT}</p>
          <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-muted">{RESULTS_LABEL}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-muted">Model</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-muted">Accuracy</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {MODEL_RESULTS.map((m) => (
                  <tr key={m.model} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3">
                      <span className={cn("font-medium", m.deployed ? "text-accent" : "text-foreground/90")}>{m.model}</span>
                      {m.deployed && (
                        <span className="ml-2 rounded-full border border-accent/30 bg-accent-soft px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-accent">
                          deployed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-foreground">{m.accuracy.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border sm:w-32">
                        <div
                          className={cn("h-full rounded-full", m.deployed ? "bg-accent" : "bg-border-strong")}
                          style={{ width: `${(m.accuracy / maxAccuracy) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-6">
          <p className="max-w-2xl text-sm italic leading-relaxed text-muted">&ldquo;{RESULTS_QUOTE}&rdquo;</p>
        </Reveal>
      </Container>
    </section>
  );
}
