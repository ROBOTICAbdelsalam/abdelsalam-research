import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import type { SignalTone } from "@/components/ui/SignalNode";
import { TECH_LAYERS } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const LAYER_TONES: readonly SignalTone[] = ["trace", "violet", "amber", "accent", "signal-green", "gold", "trace"];

// 16 TECHNOLOGY STACK — layered cards (same card shape as the
// homepage's TechStack section, src/components/sections/TechStack.tsx),
// one card per layer of the pipeline rather than one flat tag cloud, so
// the stack reads as layered, matching the brief.
export function TechnologyStackSection() {
  return (
    <section id="technology-stack" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={16} title="Technology Stack" />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH_LAYERS.map((layer, index) => {
            const tone = LAYER_TONES[index % LAYER_TONES.length];
            return (
              <Reveal key={layer.title} delay={index * 0.04}>
                <div className="h-full rounded-2xl border border-border bg-surface p-6">
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: `var(--${tone})` }}>
                    {layer.title}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {layer.items.map((item) => (
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
