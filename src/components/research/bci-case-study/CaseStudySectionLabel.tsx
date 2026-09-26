import { cn } from "@/lib/utils";

// The numbered section marker used throughout this case study — the same
// "[NN] TITLE" mono/accent convention the generic project page's own
// SectionLabel already established (src/app/projects/[slug]/page.tsx),
// just exported so every section component here can share one
// implementation instead of redefining it 17 times.
export function CaseStudySectionLabel({
  index,
  title,
  className,
}: {
  index: number;
  title: string;
  className?: string;
}) {
  return (
    <h2 className={cn("flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-accent", className)}>
      <span className="text-border-strong">[{String(index).padStart(2, "0")}]</span>
      {title}
    </h2>
  );
}
