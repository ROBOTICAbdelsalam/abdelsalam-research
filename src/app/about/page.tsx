import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { AboutBio } from "@/components/sections/AboutBio";
import { Experience } from "@/components/sections/Experience";
import { ExperienceMetrics } from "@/components/sections/ExperienceMetrics";
import { Education } from "@/components/sections/Education";
import { Certifications } from "@/components/sections/Certifications";
import { Timeline } from "@/components/sections/Timeline";
import { TechStack } from "@/components/sections/TechStack";
import { siteConfig } from "@/data/site";
import { currentProjects, futureDirection } from "@/data/about";

export const metadata: Metadata = {
  title: "About",
  description:
    "AI & Robotics Engineer with 8+ years in industrial robotics, automation and control, completing an M.Sc. in Robotics and Automation.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader eyebrow="About" title={siteConfig.fullName} />

      <section className="py-20 md:py-24">
        <Container className="max-w-3xl">
          <AboutBio />
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Professional Journey"
            title="From Industrial Automation to AI Research"
            subtitle="The path from real-world automation engineering to robotics, AI and brain-computer interface research."
          />
          <div className="mt-14">
            <Timeline />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="Engineering Experience"
            title="Professional Experience"
            subtitle="8+ years in industrial robotics, automation and control — documented achievements from the CV."
          />
          <div className="mt-14">
            <ExperienceMetrics />
          </div>
          <div className="mt-10">
            <Experience />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Education" title="Academic Background" />
          <div className="mt-14">
            <Education />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Certifications" title="Certifications" />
          <div className="mt-14">
            <Certifications />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container className="max-w-3xl grid grid-cols-1 gap-6 md:grid-cols-2">
          <Reveal>
            <Card>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Current Work
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {currentProjects.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-sm leading-relaxed text-foreground/90"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-trace" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
          <Reveal delay={0.05}>
            <Card>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
                Where I&apos;m Headed
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                {futureDirection}
              </p>
            </Card>
          </Reveal>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Technology Stack"
            title="Tools and Technologies"
            subtitle="Listed as skills and areas of active interest, not claims of professional mastery."
          />
          <div className="mt-14">
            <TechStack />
          </div>
        </Container>
      </section>
    </>
  );
}
