import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArchitectureFlow } from "@/components/ui/ArchitectureFlow";
import { Chain } from "@/components/ui/Chain";
import { Reveal } from "@/components/ui/Reveal";
import { ResearchAreas } from "@/components/sections/ResearchAreas";
import { FeaturedResearch } from "@/components/sections/FeaturedResearch";
import {
  dataFlow,
  engineeringCapabilities,
  engineeringIntro,
  industrialFlow,
  researchFocus,
  researchIntro,
  researchToEngineering,
} from "@/data/research";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Research focus spanning Brain-Computer Interfaces, Artificial Intelligence, Robotics and Human-Machine Interaction, plus the engineering capabilities that support it.",
};

export default function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research"
        title={researchIntro.title}
        subtitle={researchIntro.subtitle}
      />

      <section className="py-14 border-b border-border">
        <Container>
          <Reveal>
            <Chain items={researchToEngineering} separator="arrow" lastItemAccent />
          </Reveal>
        </Container>
      </section>

      <section className="py-24 md:py-28">
        <Container>
          <SectionHeading eyebrow="Academic Focus" title="Research Focus" />
          <div className="mt-14">
            <ResearchAreas areas={researchFocus} />
          </div>
        </Container>
      </section>

      <section id="engineering-capabilities" className="py-24 md:py-28 border-t border-border scroll-mt-16">
        <Container>
          <SectionHeading
            eyebrow="Applied Engineering"
            title={engineeringIntro.title}
            subtitle={engineeringIntro.subtitle}
          />
          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-start">
            <ResearchAreas areas={engineeringCapabilities} />
            <div className="flex flex-col gap-10">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-6">
                  Data → Processing → Pipeline → Intelligence → Application
                </p>
                <ArchitectureFlow steps={dataFlow} />
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-6">
                  Industrial Systems → AI
                </p>
                <ArchitectureFlow steps={industrialFlow} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-28 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Featured Research"
            title="Hybrid-Adaptive Brain-Computer Interface"
          />
          <div className="mt-14">
            <FeaturedResearch />
          </div>
        </Container>
      </section>
    </>
  );
}
