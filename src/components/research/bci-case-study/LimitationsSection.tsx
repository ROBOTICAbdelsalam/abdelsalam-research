import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { LIMITATIONS } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 14 LIMITATIONS — prominent by design (amber, not hidden in fine print),
// stating plainly that live EEG does not yet drive robot motion, and
// why: real-data confidence stays below the adaptive gate. Nothing here
// is softened.
export function LimitationsSection() {
  return (
    <section id="limitations" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={14} title="Limitations" />
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <div className="rounded-2xl border border-amber/40 bg-amber-soft p-6 md:p-8">
            <div className="flex items-center gap-2.5">
              <AlertTriangle size={18} className="text-amber shrink-0" aria-hidden />
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-amber">Known, stated plainly</p>
            </div>
            <ul className="mt-5 flex flex-col gap-4">
              {LIMITATIONS.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
