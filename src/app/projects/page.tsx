import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { AIAutomation } from "@/components/sections/AIAutomation";
import { automationIntro } from "@/data/automation";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Engineering projects spanning AI, brain-computer interfaces, robotics, automation and data engineering.",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Engineering Projects"
        title="Selected Projects"
        subtitle="Systems built at the intersection of AI, robotics, automation and data engineering."
      />

      <section className="py-20 md:py-24">
        <Container>
          <ProjectsGrid showFilter />
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="AI Automation Systems"
            title={automationIntro.title}
            subtitle={automationIntro.description}
          />
          <div className="mt-14">
            <AIAutomation />
          </div>
        </Container>
      </section>
    </>
  );
}
