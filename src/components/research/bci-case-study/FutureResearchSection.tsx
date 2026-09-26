import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { FUTURE_RESEARCH } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 15 FUTURE RESEARCH — a vertical timeline, every item traceable to
// PROJECT_REPORT.md's own Section 6. Built locally rather than via the
// shared Chain component: Chain's vertical mode renders a label only,
// with no room for the one-line "why" each of these needs — extending
// Chain itself would change its behavior on every other page that uses
// it, which is out of scope here.
export function FutureResearchSection() {
  return (
    <section id="future-research" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={15} title="Future Research" />
        </Reveal>

        <div className="relative mt-10 pl-7">
          <div className="absolute left-[3.5px] top-2 bottom-2 w-px bg-border" aria-hidden />
          <ol className="flex flex-col gap-8">
            {FUTURE_RESEARCH.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.04}>
                <li className="relative">
                  <span
                    className="absolute -left-7 top-0.5 h-3.5 w-3.5 -translate-x-1/2 rounded-full motion-safe:animate-node-pulse"
                    style={{ backgroundColor: "var(--trace)", animationDelay: `${i * 0.25}s` }}
                    aria-hidden
                  />
                  <span
                    className="absolute -left-7 top-1 h-1.5 w-1.5 -translate-x-1/2 rounded-full ring-4 ring-background"
                    style={{ backgroundColor: "var(--trace)" }}
                    aria-hidden
                  />
                  <span className="font-mono text-[10px] text-border-strong">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display text-lg font-medium tracking-tight">{item.title}</h3>
                  <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">{item.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
