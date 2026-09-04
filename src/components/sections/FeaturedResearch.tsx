import { ArrowRight } from "lucide-react";
import { featuredResearch } from "@/data/featured-research";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArchitectureFlow } from "@/components/ui/ArchitectureFlow";

export function FeaturedResearch() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
      <Reveal>
        <Badge tone="accent">{featuredResearch.name}</Badge>
        <h3 className="mt-5 font-display text-2xl sm:text-3xl font-medium tracking-tight text-balance">
          {featuredResearch.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted text-balance">
          {featuredResearch.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {featuredResearch.technologies.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <Button href={`/research/${featuredResearch.slug}`}>
            Explore Research
            <ArrowRight size={16} aria-hidden />
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ArchitectureFlow steps={featuredResearch.architecture} />
      </Reveal>
    </div>
  );
}
