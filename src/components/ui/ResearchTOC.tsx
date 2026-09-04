"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ResearchTOC({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Section index" className="hidden lg:block">
      <div className="sticky top-28 flex max-h-[calc(100vh-8rem)] flex-col gap-0.5 overflow-y-auto pr-2">
        {sections.map((section) => {
          const active = activeId === section.id;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "border-l py-1.5 pl-4 font-mono text-xs transition-colors",
                active
                  ? "border-accent text-accent"
                  : "border-border text-muted hover:border-border-strong hover:text-foreground"
              )}
            >
              {section.title}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
