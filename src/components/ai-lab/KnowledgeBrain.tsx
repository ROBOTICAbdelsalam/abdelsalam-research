"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { KnowledgeCategory } from "@/lib/ai-lab/types";
import { knowledgeNodes } from "@/data/ai-lab-knowledge";
import { findKnowledgeNodes, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { KnowledgeDetailsPanel } from "./KnowledgeDetailsPanel";
import { useAgentLab } from "./AgentLabProvider";

const CATEGORY_LABEL: Record<KnowledgeCategory, string> = {
  research: "Research",
  ai: "AI",
  robotics: "Robotics",
  bci: "BCI",
  data: "Data",
  automation: "Automation",
  software: "Software",
  technology: "Technology",
  method: "Method",
  system: "System",
};

const CATEGORIES: KnowledgeCategory[] = [
  "system",
  "ai",
  "robotics",
  "bci",
  "research",
  "method",
  "data",
  "automation",
  "software",
  "technology",
];

// Each category's representative tone, for the filter pills — a category
// can span more than one domain (e.g. "technology" covers both Python/SQL
// and TypeScript/Next.js), so this borrows the tone of its first node
// rather than inventing a second color system just for filters.
const CATEGORY_TONE = Object.fromEntries(
  CATEGORIES.map((category) => {
    const representative = knowledgeNodes.find((n) => n.category === category);
    return [category, representative ? getKnowledgeNodeTone(representative.id) : "accent"];
  })
);

// The always-on 2D surface for the Knowledge Brain (spec §31/§35): search,
// category filters, a full node list and details — everything the 3D
// KnowledgeCenter3D graph shows, reachable without WebGL, a canvas, or a
// mouse. A search narrows nothing — spec §24: it highlights direct and
// one-hop-related matches in place, so the graph stays browsable even
// while searching, rather than hiding the very context a search is trying
// to surface. Category filters, by contrast, genuinely filter the list.
export function KnowledgeBrain() {
  const {
    agents,
    selectedKnowledgeNodeId,
    setSelectedKnowledgeNodeId,
    setSelectedAgentId,
    setSelectedResearchId,
    setSelectedProjectId,
    activeKnowledgeNodeIds,
  } = useAgentLab();
  const [filter, setFilter] = useState<KnowledgeCategory | "all">("all");
  const [search, setSearch] = useState("");

  const searchResult = useMemo(() => findKnowledgeNodes(search), [search]);
  const hasSearch = search.trim().length > 0;

  const filteredNodes = filter === "all" ? knowledgeNodes : knowledgeNodes.filter((n) => n.category === filter);
  const selectedNode = knowledgeNodes.find((n) => n.id === selectedKnowledgeNodeId) ?? null;

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">Search the knowledge graph</span>
        <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search concepts — e.g. BCI, robotics, TypeScript…"
          className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-accent"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter knowledge by category">
        <button
          type="button"
          onClick={() => setFilter("all")}
          aria-pressed={filter === "all"}
          className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors"
          style={{
            borderColor: filter === "all" ? "var(--accent)" : "var(--border)",
            color: filter === "all" ? "var(--accent)" : "var(--muted)",
          }}
        >
          All
        </button>
        {CATEGORIES.map((category) => {
          const active = filter === category;
          const tone = CATEGORY_TONE[category];
          return (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(active ? "all" : category)}
              aria-pressed={active}
              className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors"
              style={{
                borderColor: active ? `var(--${tone})` : "var(--border)",
                color: active ? `var(--${tone})` : "var(--muted)",
              }}
            >
              {CATEGORY_LABEL[category]}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNodes.map((node) => {
          const tone = getKnowledgeNodeTone(node.id);
          const isDirect = hasSearch && searchResult.direct.includes(node.id);
          const isRelated = hasSearch && searchResult.related.includes(node.id);
          const deemphasized = hasSearch && !isDirect && !isRelated;
          const selected = selectedKnowledgeNodeId === node.id;
          const isActive = activeKnowledgeNodeIds.includes(node.id);
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedKnowledgeNodeId(selected ? null : node.id)}
              aria-pressed={selected}
              className="rounded-2xl border bg-surface p-4 text-left transition-all"
              style={{
                borderColor: selected || isDirect || isActive ? `var(--${tone})` : "var(--border)",
                opacity: deemphasized ? 0.45 : 1,
              }}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? "motion-safe:animate-node-pulse" : ""}`}
                  style={{ backgroundColor: `var(--${tone})` }}
                  aria-hidden
                />
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">
                  {CATEGORY_LABEL[node.category]}
                </span>
                {isRelated && !isDirect && (
                  <span className="font-mono text-[9px] uppercase tracking-wide text-muted/70">Related</span>
                )}
                {isActive && (
                  <span className="font-mono text-[9px] uppercase tracking-wide text-trace">Active</span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium text-foreground">{node.label}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{node.description}</p>
            </button>
          );
        })}
      </div>

      {selectedNode && (
        <div className="mt-6 max-w-md">
          <KnowledgeDetailsPanel
            node={selectedNode}
            agents={agents}
            onClose={() => setSelectedKnowledgeNodeId(null)}
            onSelectAgent={setSelectedAgentId}
            onSelectNode={setSelectedKnowledgeNodeId}
            onSelectResearch={setSelectedResearchId}
            onSelectProject={setSelectedProjectId}
          />
        </div>
      )}
    </div>
  );
}
