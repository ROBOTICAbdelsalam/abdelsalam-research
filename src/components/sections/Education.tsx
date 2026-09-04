import { education } from "@/data/education";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export function Education() {
  return (
    <div className="flex flex-col gap-4">
      {education.map((entry, index) => (
        <Reveal key={entry.degree} delay={index * 0.05}>
          <Card>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg font-medium text-foreground">
                {entry.degree}
              </h3>
              <span className="font-mono text-xs text-accent">{entry.period}</span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {entry.institution} · {entry.location}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">
              {entry.detail}
            </p>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
