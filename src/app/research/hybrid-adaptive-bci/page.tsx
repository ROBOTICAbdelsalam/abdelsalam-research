import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { ArchitectureFlow } from "@/components/ui/ArchitectureFlow";
import { Placeholder } from "@/components/ui/Placeholder";
import { ResearchTOC } from "@/components/ui/ResearchTOC";
import {
  featuredResearch,
  featuredResearchDetail,
} from "@/data/featured-research";

export const metadata: Metadata = {
  title: featuredResearch.title,
  description: featuredResearch.description,
};

export default function HybridAdaptiveBciPage() {
  return (
    <>
      <PageHeader
        eyebrow="Featured Research"
        title={featuredResearch.title}
        subtitle={featuredResearch.description}
      />

      <section className="py-16 border-b border-border">
        <Container className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{featuredResearch.status}</Badge>
            <Badge>{featuredResearch.institution}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {featuredResearch.technologies.map((tech) => (
              <Badge key={tech}>{tech}</Badge>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24">
        <Container>
          <nav
            aria-label="Section index"
            className="mb-16 flex flex-wrap gap-2 font-mono text-xs lg:hidden"
          >
            {featuredResearchDetail.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-border px-3 py-1.5 text-muted hover:border-accent hover:text-accent transition-colors"
              >
                {section.title}
              </a>
            ))}
          </nav>

          <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-16">
            <ResearchTOC sections={featuredResearchDetail} />

            <div className="flex flex-col gap-16 max-w-3xl">
              {featuredResearchDetail.map((section) => (
                <Reveal key={section.id} id={section.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-medium tracking-tight">
                      {section.title}
                    </h2>
                    {section.status === "in-progress" ? (
                      <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
                        In Progress
                      </span>
                    ) : null}
                  </div>

                  {section.id === "system-architecture" ? (
                    <div className="mt-6 max-w-xl">
                      <ArchitectureFlow steps={featuredResearch.architecture} />
                    </div>
                  ) : null}

                  {section.status === "in-progress" ? (
                    <Placeholder className="mt-5" editPath="src/data/featured-research.ts">
                      {section.content}
                    </Placeholder>
                  ) : (
                    <p className="mt-5 text-base leading-relaxed text-muted text-balance">
                      {section.content}
                    </p>
                  )}
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
