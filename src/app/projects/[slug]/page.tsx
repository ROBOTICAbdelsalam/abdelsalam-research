import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, FlaskConical, ArrowLeft } from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Placeholder } from "@/components/ui/Placeholder";
import { ProjectMediaGrid } from "@/components/sections/ProjectMediaGrid";
import { BCIDigitalTwin } from "@/components/research/bci-3d/BCIDigitalTwin";
import { projects } from "@/data/projects";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.build,
  };
}

function SectionLabel({ index, title }: { index: number; title: string }) {
  return (
    <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
      <span className="text-border-strong">
        [{String(index).padStart(2, "0")}]
      </span>
      {title}
    </h2>
  );
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) notFound();

  const { github, demo, research } = project.links;
  const hasLinks = Boolean(github || demo || research);
  const hasMedia = Boolean(
    project.media &&
      (project.media.heroImage ||
        project.media.videos?.length ||
        project.media.gallery?.length ||
        project.media.figures?.length)
  );

  // Numbered sequentially so the optional Media section never leaves a gap
  // in the numbering when a project has no media yet.
  const hasInteractiveExperiment = project.slug === "hybrid-adaptive-bci";
  let sectionIndex = 2; // Problem = 1, Build = 2
  const mediaIndex = hasMedia ? ++sectionIndex : undefined;
  const technologyIndex = ++sectionIndex;
  const experimentIndex = hasInteractiveExperiment ? ++sectionIndex : undefined;
  const statusIndex = ++sectionIndex;
  const linksIndex = ++sectionIndex;

  return (
    <>
      <PageHeader eyebrow={project.category} title={project.name} />

      <section className="py-20 md:py-24">
        <Container className="max-w-3xl">
          <Reveal>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              All projects
            </Link>
          </Reveal>

          <Reveal delay={0.05} className="mt-10">
            <SectionLabel index={1} title="Problem" />
            <p className="text-base leading-relaxed text-muted">{project.problem}</p>
          </Reveal>

          <Reveal delay={0.08} className="mt-12">
            <SectionLabel index={2} title="Build" />
            <p className="text-base leading-relaxed text-foreground/90">{project.build}</p>
          </Reveal>

          {hasMedia && mediaIndex && (
            <Reveal delay={0.09} className="mt-12">
              <SectionLabel index={mediaIndex} title="Media" />
              <ProjectMediaGrid media={project.media} />
            </Reveal>
          )}

          <Reveal delay={0.1} className="mt-12">
            <SectionLabel index={technologyIndex} title="Technology" />
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech}>{tech}</Badge>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {hasInteractiveExperiment && experimentIndex && (
        <section className="py-20 md:py-24 border-t border-border">
          <Container>
            <SectionLabel index={experimentIndex} title="Interactive 3D Experiment" />
            <BCIDigitalTwin />
          </Container>
        </section>
      )}

      <section className={cn("py-20 md:py-24", hasInteractiveExperiment && "border-t border-border")}>
        <Container className="max-w-3xl">
          <Reveal delay={0.12}>
            <SectionLabel index={statusIndex} title="Status" />
            {project.status ? (
              <Badge tone="accent">{project.status}</Badge>
            ) : (
              <span
                title="Edit status in src/data/projects.ts"
                className="rounded-full border border-dashed border-border-strong px-3 py-1 font-mono text-xs text-muted/60"
              >
                Status — add in src/data/projects.ts
              </span>
            )}
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <SectionLabel index={linksIndex} title="Links" />
            {hasLinks ? (
              <div className="flex flex-wrap gap-4">
                {github ? (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    <GithubIcon size={15} /> GitHub
                  </a>
                ) : null}
                {demo ? (
                  <a
                    href={demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    <ExternalLink size={15} /> Live Demo
                  </a>
                ) : null}
                {research ? (
                  <Link
                    href={research}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-accent hover:text-accent transition-colors"
                  >
                    <FlaskConical size={15} /> Research Page
                  </Link>
                ) : null}
              </div>
            ) : (
              <Placeholder editPath="src/data/projects.ts">
                Links for this project (GitHub, demo, research) have not been
                added yet.
              </Placeholder>
            )}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
