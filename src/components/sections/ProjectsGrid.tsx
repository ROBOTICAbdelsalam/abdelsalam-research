"use client";

import { useMemo, useState } from "react";
import { projectGroups, projects, type ProjectGroup } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";
import { cn } from "@/lib/utils";

type Filter = ProjectGroup | "All";

export function ProjectsGrid({
  limit,
  showFilter = false,
}: {
  limit?: number;
  showFilter?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("All");

  const items = useMemo(() => {
    if (limit) return projects.slice(0, limit);
    if (showFilter && filter !== "All") {
      return projects.filter((project) => project.groups.includes(filter));
    }
    return projects;
  }, [limit, showFilter, filter]);

  return (
    <div>
      {showFilter ? (
        <div className="mb-8 flex flex-wrap gap-2">
          {(["All", ...projectGroups] as Filter[]).map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setFilter(group)}
              className={cn(
                "rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wide transition-colors",
                filter === group
                  ? "border-accent text-accent bg-accent-soft"
                  : "border-border text-muted hover:text-foreground hover:border-border-strong"
              )}
            >
              {group}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((project, index) => (
          <ProjectCard key={project.slug} project={project} delay={index * 0.05} />
        ))}
      </div>

      {showFilter && items.length === 0 ? (
        <p className="text-sm text-muted">No projects in this category yet.</p>
      ) : null}
    </div>
  );
}
