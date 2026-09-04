import { techStack } from "@/data/techstack";
import { Reveal } from "@/components/ui/Reveal";

export function TechStack() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {techStack.map((category, index) => (
        <Reveal key={category.title} delay={index * 0.05}>
          <div className="h-full rounded-2xl border border-border bg-surface p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {category.title}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-border px-3 py-1 text-sm text-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
