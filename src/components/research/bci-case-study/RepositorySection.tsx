import { ExternalLink, FileText, BookOpen, FlaskConical, Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { REPO_LINKS, REPO_FACTS } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const LINKS = [
  { href: REPO_LINKS.repository, label: "Repository", description: "Full source — AI pipeline + ROS2 workspace", icon: GithubIcon },
  { href: REPO_LINKS.readme, label: "README", description: "Project overview, quick start, structure", icon: BookOpen },
  { href: REPO_LINKS.architecture, label: "Architecture", description: "System design, data flow, robot abstraction", icon: Compass },
  { href: REPO_LINKS.projectReport, label: "Project Report", description: "Performance report, validation, future work", icon: FileText },
  { href: REPO_LINKS.userGuide, label: "User Guide", description: "Installation, build, run, troubleshooting", icon: FlaskConical },
];

// 17 RESEARCH REPOSITORY
export function RepositorySection() {
  return (
    <section id="repository" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={17} title="Research Repository" />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            {REPO_FACTS.status} — {REPO_FACTS.statusDetail}
          </p>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <Reveal key={link.label} delay={i * 0.04}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40"
                >
                  <Icon size={18} className="shrink-0 text-accent" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">{link.label}</span>
                    <span className="block text-xs text-muted mt-0.5">{link.description}</span>
                  </span>
                  <ExternalLink size={14} className="shrink-0 text-muted transition-colors group-hover:text-accent" aria-hidden />
                </a>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.2} className="mt-6">
          <p className="text-xs text-muted">{REPO_FACTS.seam}</p>
        </Reveal>
      </Container>
    </section>
  );
}
