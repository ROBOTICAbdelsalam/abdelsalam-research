import type { ProjectImage as ProjectImageType } from "@/data/projects";
import { ProjectImage } from "./ProjectImage";

export function ProjectGallery({ images }: { images: ProjectImageType[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {images.map((image) => (
        <ProjectImage key={image.src} image={image} />
      ))}
    </div>
  );
}
