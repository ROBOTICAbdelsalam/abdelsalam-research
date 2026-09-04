import { experienceMetrics } from "@/data/experience";
import { Reveal } from "@/components/ui/Reveal";

export function ExperienceMetrics() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
      {experienceMetrics.map((metric, index) => (
        <Reveal key={metric.label} delay={index * 0.04} className="bg-surface p-5">
          <p className="font-display text-3xl font-medium tracking-tight text-accent">
            {metric.value}
          </p>
          <p className="mt-1.5 font-mono text-[11px] uppercase leading-snug tracking-[0.08em] text-muted">
            {metric.label}
          </p>
        </Reveal>
      ))}
    </div>
  );
}
