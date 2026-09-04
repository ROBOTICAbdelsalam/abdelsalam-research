import type { ProjectMedia } from "@/data/projects";
import { ProjectImage } from "./ProjectImage";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectVideo } from "./ProjectVideo";
import { ProjectFigure } from "./ProjectFigure";

// Renders whichever media a project actually has and nothing else — no
// placeholder boxes. Returns null outright if the project has no media yet.
export function ProjectMediaGrid({ media }: { media?: ProjectMedia }) {
  if (!media) return null;

  const hasContent =
    media.heroImage || media.videos?.length || media.gallery?.length || media.figures?.length;
  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-12">
      {media.heroImage && <ProjectImage image={media.heroImage} />}

      {media.videos && media.videos.length > 0 && (
        <div className="flex flex-col gap-6">
          {media.videos.map((video) => (
            <ProjectVideo key={video.src} video={video} />
          ))}
        </div>
      )}

      {media.gallery && media.gallery.length > 0 && <ProjectGallery images={media.gallery} />}

      {media.figures && media.figures.length > 0 && (
        <div className="flex flex-col gap-6">
          {media.figures.map((figure, index) => (
            <ProjectFigure key={figure.src} figure={figure} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
