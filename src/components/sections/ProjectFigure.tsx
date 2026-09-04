import type { ProjectFigure as ProjectFigureType } from "@/data/projects";

// Styled for diagrams/plots rather than photography — caption reads like an
// academic figure label ("Fig. N — ...").
export function ProjectFigure({ figure, index }: { figure: ProjectFigureType; index: number }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={figure.src} alt={figure.alt} className="h-auto w-full object-contain" />
      <figcaption className="border-t border-border px-4 py-3 font-mono text-xs text-muted">
        Fig. {index + 1} — {figure.caption}
      </figcaption>
    </figure>
  );
}
