import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { SignalTone } from "@/components/ui/SignalNode";
import { RESEARCH_PILLARS } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const PILLAR_TONES: readonly SignalTone[] = ["trace", "accent", "signal-green"];

// 03 RESEARCH OVERVIEW — the system as one end-to-end pipeline from brain
// signal processing to robotic motion, framed as three disciplinary
// pillars (Neuroscience / AI / Robotics), each grounded in the README's
// own Labs list and technology-stack table (see src/data/bci-thesis.ts).
export function ResearchOverview() {
  return (
    <section id="research-overview" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={3} title="Research Overview" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-balance">
            The system is an end-to-end pipeline from brain signal to robot motion — a single architecture spanning three disciplines, each with its own well-established tools, meeting at explicit interfaces rather than one monolithic pipeline.
          </p>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {RESEARCH_PILLARS.map((pillar, index) => {
            const tone = PILLAR_TONES[index % PILLAR_TONES.length];
            return (
              <Reveal key={pillar.title} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-border bg-surface p-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: `var(--${tone})` }}>
                    {pillar.title}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {pillar.items.map((item) => (
                      <li key={item} className="rounded-full border border-border px-3 py-1 text-sm text-foreground/90">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
