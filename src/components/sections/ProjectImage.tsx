import type { ProjectImage as ProjectImageType } from "@/data/projects";

export function ProjectImage({ image }: { image: ProjectImageType }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.src} alt={image.alt} className="h-auto w-full object-cover" />
      {image.caption && (
        <figcaption className="border-t border-border px-4 py-3 text-sm text-muted">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
