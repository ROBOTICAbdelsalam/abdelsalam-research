"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BrainCircuit, Bot, Antenna, Database, Cog, Terminal } from "lucide-react";
import type { AgentDomain } from "@/lib/ai-lab/types";
import { useIsDesktop } from "@/lib/ai-lab/useIsDesktop";
import { AgentCard } from "./AgentCard";
import { AgentInfoPanel } from "./AgentInfoPanel";
import { useAgentLab } from "./AgentLabProvider";

const domainIcons: Record<AgentDomain, typeof BrainCircuit> = {
  "artificial-intelligence": BrainCircuit,
  robotics: Bot,
  "brain-computer-interfaces": Antenna,
  "data-science": Database,
  automation: Cog,
  "software-engineering": Terminal,
};

type FilterKey = "all" | "research" | "robotics" | "data" | "automation" | "software";

const FILTERS: { key: FilterKey; label: string; domains: AgentDomain[] | null }[] = [
  { key: "all", label: "All", domains: null },
  { key: "research", label: "Research", domains: ["artificial-intelligence", "brain-computer-interfaces"] },
  { key: "robotics", label: "Robotics", domains: ["robotics"] },
  { key: "data", label: "Data", domains: ["data-science"] },
  { key: "automation", label: "Automation", domains: ["automation"] },
  { key: "software", label: "Software", domains: ["software-engineering"] },
];

export function AgentRoster() {
  const {
    agents,
    messages,
    selectedAgentId,
    setSelectedAgentId,
    setSelectedKnowledgeNodeId,
    setSelectedResearchId,
    setSelectedProjectId,
  } = useAgentLab();
  const [filter, setFilter] = useState<FilterKey>("all");
  const isDesktop = useIsDesktop();

  const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
  const visibleAgents = activeFilter.domains
    ? agents.filter((agent) => activeFilter.domains!.includes(agent.domain))
    : agents;
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) ?? null;

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter agents by category">
        {FILTERS.map((item) => {
          const active = item.key === filter;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              aria-pressed={active}
              className="rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wide transition-colors"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                color: active ? "var(--accent)" : "var(--muted)",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleAgents.map((agent, index) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            icon={domainIcons[agent.domain]}
            selected={selectedAgentId === agent.id}
            onSelect={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* On desktop, LabExperience already shows the info panel next to the
          3D canvas — showing it again here would just duplicate it. On
          mobile/tablet, where the 3D scene isn't rendered at all, this is
          the only place a selection surfaces (spec §22). */}
      {!isDesktop && (
        <div className="mt-6">
          <AnimatePresence>
            {selectedAgent && (
              <AgentInfoPanel
                key={selectedAgent.id}
                agent={selectedAgent}
                agents={agents}
                messages={messages}
                onClose={() => setSelectedAgentId(null)}
                onSelectAgent={setSelectedAgentId}
                onSelectKnowledgeNode={setSelectedKnowledgeNodeId}
                onSelectResearch={setSelectedResearchId}
                onSelectProject={setSelectedProjectId}
              />
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
