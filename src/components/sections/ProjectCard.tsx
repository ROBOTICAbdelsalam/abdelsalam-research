import Link from "next/link";
import { ExternalLink, FlaskConical, ArrowUpRight } from "lucide-react";
import { GithubIcon } from "@/components/icons/BrandIcons";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  const { github, demo, research } = project.links;

  return (
    <Reveal delay={delay} className="h-full">
      <div className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:border-accent/40 hover:-translate-y-0.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-accent">
            {project.category}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {project.featured ? (
              <span className="rounded-full border border-trace/30 bg-trace-soft px-2.5 py-0.5 font-mono text-[10px] text-trace">
                Featured
              </span>
            ) : null}
            {project.status ? (
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[10px] text-muted">
                {project.status}
              </span>
            ) : (
              <span
                title="Edit status in src/data/projects.ts"
                className="rounded-full border border-dashed border-border-strong px-2.5 py-0.5 font-mono text-[10px] text-muted/60"
              >
                Add status
              </span>
            )}
          </div>
        </div>

        <Link href={`/projects/${project.slug}`} className="mt-4 block">
          <h3 className="font-display text-xl font-medium tracking-tight group-hover:text-accent transition-colors">
            {project.name}
          </h3>
        </Link>

        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60">
            Problem
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted/80 italic">
            {project.problem}
          </p>
        </div>
        <div className="mt-3 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60">
            Build
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">{project.build}</p>
        </div>

        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted/60 mb-2">
            Technology
          </p>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
          <div className="flex items-center gap-4">
            {github ? (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} on GitHub`}
                className="text-muted hover:text-foreground transition-colors"
              >
                <GithubIcon size={16} />
              </a>
            ) : null}
            {demo ? (
              <a
                href={demo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.name} live demo`}
                className="text-muted hover:text-foreground transition-colors"
              >
                <ExternalLink size={16} />
              </a>
            ) : null}
            {research ? (
              <Link
                href={research}
                aria-label={`${project.name} research page`}
                className="text-muted hover:text-foreground transition-colors"
              >
                <FlaskConical size={16} />
              </Link>
            ) : null}
          </div>

          <Link
            href={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-accent transition-colors"
          >
            Details
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
