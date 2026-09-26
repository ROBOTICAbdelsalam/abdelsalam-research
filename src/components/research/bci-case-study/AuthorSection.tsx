import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { THESIS_META } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const FACTS: { label: string; value: string }[] = [
  { label: "Author", value: THESIS_META.author },
  { label: "Supervisor", value: THESIS_META.supervisor },
  { label: "Degree", value: THESIS_META.degree },
  { label: "Institution", value: THESIS_META.institution },
  { label: "Release", value: THESIS_META.version },
  { label: "License", value: THESIS_META.license },
];

// 18 AUTHOR / THESIS INFORMATION — the closing section.
export function AuthorSection() {
  return (
    <section id="author" className="scroll-mt-24 border-t border-border py-16 md:py-24">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={18} title="Author / Thesis Information" />
        </Reveal>

        <Reveal delay={0.08} className="mt-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 rounded-2xl border border-border bg-surface p-6 text-sm sm:grid-cols-2 md:p-8">
            {FACTS.map((fact) => (
              <div key={fact.label} className="flex items-baseline justify-between gap-4 border-b border-border pb-3 last:border-b-0 sm:border-b-0">
                <dt className="font-mono text-[10px] uppercase tracking-wide text-muted">{fact.label}</dt>
                <dd className="text-right font-medium text-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
