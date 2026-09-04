import type { ProjectVideo as ProjectVideoType } from "@/data/projects";

function embedUrl(video: ProjectVideoType) {
  if (video.type === "youtube") return `https://www.youtube-nocookie.com/embed/${video.src}`;
  if (video.type === "vimeo") return `https://player.vimeo.com/video/${video.src}`;
  return video.src;
}

export function ProjectVideo({ video }: { video: ProjectVideoType }) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="aspect-video w-full">
        {video.type === "file" ? (
          <video src={video.src} controls className="h-full w-full" title={video.title} />
        ) : (
          <iframe
            src={embedUrl(video)}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
      <figcaption className="border-t border-border px-4 py-3 text-sm text-muted">
        {video.title}
      </figcaption>
    </figure>
  );
}
