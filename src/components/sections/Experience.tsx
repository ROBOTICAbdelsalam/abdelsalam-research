import { experience } from "@/data/experience";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export function Experience() {
  return (
    <div className="flex flex-col gap-6">
      {experience.map((entry, index) => (
        <Reveal key={entry.title + entry.company} delay={index * 0.05}>
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-medium tracking-tight text-foreground">
                  {entry.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {entry.company} · {entry.location}
                </p>
              </div>
              <span className="font-mono text-xs text-accent shrink-0">{entry.period}</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {entry.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-trace/30 bg-trace-soft px-3 py-1 font-mono text-[11px] text-trace"
                >
                  {highlight}
                </span>
              ))}
            </div>

            <ul className="mt-5 flex flex-col gap-2.5">
              {entry.achievements.map((achievement) => (
                <li
                  key={achievement}
                  className="flex gap-3 text-sm leading-relaxed text-foreground/85"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" aria-hidden />
                  {achievement}
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}
