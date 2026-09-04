import { timeline } from "@/data/timeline";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

const stageColor = {
  past: "bg-muted",
  current: "bg-accent",
  future: "bg-trace",
};

export function Timeline() {
  return (
    <div className="relative pl-8 sm:pl-10">
      <div className="absolute left-[5px] sm:left-[7px] top-2 bottom-2 w-px bg-border" />
      <div className="flex flex-col gap-10">
        {timeline.map((milestone, index) => (
          <Reveal key={milestone.title} delay={index * 0.05} className="relative">
            <span
              className={cn(
                "absolute -left-8 sm:-left-10 top-1.5 h-[11px] w-[11px] rounded-full ring-4 ring-background",
                stageColor[milestone.stage]
              )}
              aria-hidden
            />
            <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted">
              {milestone.period}
            </p>
            <h3 className="mt-2 font-display text-xl font-medium tracking-tight">
              {milestone.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {milestone.description}
            </p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
