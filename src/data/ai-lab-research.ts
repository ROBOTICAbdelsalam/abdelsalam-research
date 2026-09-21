import type { ResearchItem } from "@/lib/ai-lab/types";
import { featuredResearch } from "@/data/featured-research";

// ABD AI LAB — the Research Intelligence layer's content (Phase 7). A
// structured pointer into the site's real research content, not a second
// copy of it and not a real research database. Title/description/status/
// technologies are read directly from data/featured-research.ts (the same
// source the real /research/hybrid-adaptive-bci page renders) so the two
// can never drift apart.
//
// Hybrid-Adaptive BCI is the ONLY research item this site documents — no
// additional publications, preprints or projects are invented here. Its
// `relatedKnowledge` matches exactly the "hybrid-adaptive-bci" knowledge
// node's own `relatedNodes` in data/ai-lab-knowledge.ts (plus itself), and
// its `relatedAgents` matches that same node's `relatedAgents` — this
// research item and that knowledge node are two views of the same real
// thing, not two independently-invented relationship lists. Robotics
// Engineer and Software Engineer are deliberately left out: nothing in the
// existing knowledge graph directly connects them to this research, and
// inventing that link would violate the phase's core honesty constraint.
export const researchItems: ResearchItem[] = [
  {
    id: "hybrid-adaptive-bci",
    title: featuredResearch.title,
    type: "THESIS",
    status: featuredResearch.status,
    description: featuredResearch.description,
    route: `/research/${featuredResearch.slug}`,
    relatedKnowledge: [
      "hybrid-adaptive-bci",
      "brain-computer-interface",
      "eeg",
      "signal-processing",
      "feature-extraction",
      "classification",
      "machine-learning",
      "human-machine-interaction",
    ],
    relatedAgents: ["bci-researcher", "ai-researcher", "data-scientist"],
    relatedTechnologies: featuredResearch.technologies,
    relatedProjects: ["hybrid-adaptive-bci"],
    focusAreas: ["Brain-Computer Interfaces", "EEG Decoding", "Deep Learning", "Robot Control"],
  },
];
