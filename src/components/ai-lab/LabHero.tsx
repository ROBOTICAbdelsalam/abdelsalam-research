import { Radio } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { HeroCircuitEdge } from "@/components/sections/HeroCircuitEdge";
import { labMeta } from "@/data/ai-lab";

export function LabHero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-grid">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden lg:block opacity-40">
        <HeroCircuitEdge />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden lg:block opacity-40">
        <HeroCircuitEdge flip />
      </div>

      <Container className="relative py-20 md:py-28">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.25em] text-accent uppercase mb-6">
            AI Workforce Simulation
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-balance">
            {labMeta.title}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-2xl font-display text-2xl sm:text-3xl font-medium tracking-tight text-balance">
            {labMeta.concept}
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-muted text-balance">
            {labMeta.explanation}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-trace/30 bg-trace-soft px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-trace">
              <Radio size={13} className="motion-safe:animate-pulse-slow" aria-hidden />
              Mode — {labMeta.mode}
            </span>
            <span className="font-mono text-xs text-muted">
              No autonomous agents are active yet — this is a design foundation, not a live system.
            </span>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
