import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { AnimatedSectionDivider } from "@/components/ui/AnimatedSectionDivider";
import { Hero } from "@/components/sections/Hero";
import { CapabilityGrid } from "@/components/sections/CapabilityGrid";
import { SystemPipeline } from "@/components/sections/SystemPipeline";
import { ResearchAreas } from "@/components/sections/ResearchAreas";
import { FeaturedResearch } from "@/components/sections/FeaturedResearch";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { PublicationsList } from "@/components/sections/PublicationsList";
import { LatestActivity } from "@/components/sections/LatestActivity";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { researchFocus, researchIntro } from "@/data/research";
import { pipelineIntro } from "@/data/pipeline";

export default function Home() {
  return (
    <>
      <Hero />

      <AnimatedSectionDivider tones={["accent", "trace", "accent"]} className="py-12 md:py-16" />

      <section className="pb-24 md:pb-32">
        <Container>
          <SectionHeading
            eyebrow="01 — Capabilities"
            title="What I Work Across"
            subtitle="Five areas that connect research, engineering and 8+ years of industrial practice."
          />
          <div className="mt-14">
            <CapabilityGrid />
          </div>
        </Container>
      </section>

      <AnimatedSectionDivider tones={["violet", "amber", "gold"]} className="py-12 md:py-16" />

      <section className="pb-24 md:pb-32">
        <Container>
          <SectionHeading
            eyebrow={`02 — ${pipelineIntro.eyebrow}`}
            title={pipelineIntro.title}
            subtitle={pipelineIntro.subtitle}
          />
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            {pipelineIntro.statement}
          </p>
          <div className="mt-16">
            <SystemPipeline />
          </div>
        </Container>
      </section>

      <section id="research" className="pt-20 pb-24 border-t border-border md:pt-24 md:pb-32 scroll-mt-16">
        <Container>
          <SectionHeading
            eyebrow="03 — Research Focus"
            title={researchIntro.title}
            subtitle={researchIntro.subtitle}
          />
          <div className="mt-14">
            <ResearchAreas areas={researchFocus} />
          </div>
          <div className="mt-10">
            <Button href="/research" variant="outline">
              View full research
              <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </Container>
      </section>

      <section className="pt-20 pb-24 border-t border-border md:pt-24 md:pb-32">
        <Container>
          <SectionHeading
            eyebrow="04 — Featured Research"
            title="Hybrid-Adaptive Brain-Computer Interface"
          />
          <div className="mt-14">
            <FeaturedResearch />
          </div>
        </Container>
      </section>

      <section id="projects" className="pt-20 pb-24 border-t border-border md:pt-24 md:pb-32 scroll-mt-16">
        <Container>
          <SectionHeading
            eyebrow="05 — Engineering Projects"
            title="Selected Projects"
            subtitle="Systems spanning AI, robotics, automation and data engineering."
          />
          <div className="mt-14">
            <ProjectsGrid limit={4} />
          </div>
          <div className="mt-10">
            <Button href="/projects" variant="outline">
              View all projects
              <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </Container>
      </section>

      <section id="publications" className="pt-20 pb-24 border-t border-border md:pt-24 md:pb-32 scroll-mt-16">
        <Container>
          <SectionHeading
            eyebrow="06 — Publications"
            title="Publications"
            subtitle="A clean academic record — updated as research is completed and released."
          />
          <div className="mt-14">
            <PublicationsList />
          </div>
          <div className="mt-10">
            <Button href="/publications" variant="outline">
              View publications page
              <ArrowRight size={16} aria-hidden />
            </Button>
          </div>
        </Container>
      </section>

      <LatestActivity />

      <section id="contact" className="pt-20 pb-24 border-t border-border md:pt-24 md:pb-32 scroll-mt-16">
        <Container>
          <ContactCTA />
        </Container>
      </section>
    </>
  );
}
