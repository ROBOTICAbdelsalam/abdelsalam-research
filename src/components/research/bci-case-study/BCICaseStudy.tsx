import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { CASE_STUDY_SECTIONS } from "@/data/bci-thesis";
import { Hero } from "./Hero";
import { DigitalTwinSection } from "./DigitalTwinSection";
import { ResearchOverview } from "./ResearchOverview";
import { SystemPipelineSection } from "./SystemPipelineSection";
import { EEGSection } from "./EEGSection";
import { CSPSection } from "./CSPSection";
import { AIClassificationSection } from "./AIClassificationSection";
import { AdaptiveDecisionSection } from "./AdaptiveDecisionSection";
import { ROS2ArchitectureSection } from "./ROS2ArchitectureSection";
import { RoboticHandSection } from "./RoboticHandSection";
import { GazeboMoveItSection } from "./GazeboMoveItSection";
import { ResultsSection } from "./ResultsSection";
import { ValidationSection } from "./ValidationSection";
import { LimitationsSection } from "./LimitationsSection";
import { FutureResearchSection } from "./FutureResearchSection";
import { TechnologyStackSection } from "./TechnologyStackSection";
import { RepositorySection } from "./RepositorySection";
import { AuthorSection } from "./AuthorSection";

// The full 18-section premium case study for /projects/hybrid-adaptive-bci.
// Each numbered section is its own component (see this directory) built
// from the site's existing UI primitives (Container, Reveal, Chain,
// ArchitectureFlow, Card-style panels, Badge) and from
// src/data/bci-thesis.ts, which holds every fact sourced from the thesis
// repository. The interactive digital twin (section 02) is the existing,
// completely unmodified src/components/research/bci-3d component tree —
// this file adds no second state machine and no new instance of it.
//
// Sections are stacked full-width blocks with border-t dividers (the
// same rhythm the generic project-page template already uses for
// Problem/Build/Technology), not a sidebar-article layout — so
// in-page navigation is a horizontal pill nav at every breakpoint
// (the same pattern already proven on /research/hybrid-adaptive-bci's
// mobile nav) rather than a sticky sidebar that would fight that layout.
export function BCICaseStudy() {
  return (
    <>
      <Container className="pt-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} />
          All projects
        </Link>
      </Container>

      <Hero />

      <nav aria-label="Section index" className="border-b border-border py-5">
        <Container>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {CASE_STUDY_SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-border px-3 py-1.5 text-muted hover:border-accent hover:text-accent transition-colors"
              >
                {section.title}
              </a>
            ))}
          </div>
        </Container>
      </nav>

      <DigitalTwinSection />
      <ResearchOverview />
      <SystemPipelineSection />
      <EEGSection />
      <CSPSection />
      <AIClassificationSection />
      <AdaptiveDecisionSection />
      <ROS2ArchitectureSection />
      <RoboticHandSection />
      <GazeboMoveItSection />
      <ResultsSection />
      <ValidationSection />
      <LimitationsSection />
      <FutureResearchSection />
      <TechnologyStackSection />
      <RepositorySection />
      <AuthorSection />
    </>
  );
}
