import type { ResearchArea } from "@/data/research";
import { Reveal } from "@/components/ui/Reveal";

export function ResearchAreas({ areas }: { areas: ResearchArea[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {areas.map((area, index) => (
        <Reveal key={area.index} delay={index * 0.05}>
          <div className="group relative h-full rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:border-accent/40 hover:-translate-y-0.5">
            <div className="flex items-start justify-between gap-4">
              <span className="font-mono text-sm text-accent">{area.index}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-trace opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
            <h3 className="mt-4 font-display text-xl font-medium tracking-tight">
              {area.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {area.description}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {area.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
