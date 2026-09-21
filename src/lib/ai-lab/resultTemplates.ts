import type { Agent, AgentDomain } from "./types";

// Local, template-based result content per domain — no real research
// synthesis, no fabricated citations or precision metrics (spec §13/§14).
// Each entry names the kind of workflow a specialist in that role would
// plausibly describe, not a claim about actual completed work.
const DOMAIN_RESULT: Record<AgentDomain, { workflow: string[]; nextStep: string }> = {
  "brain-computer-interfaces": {
    workflow: ["signal acquisition", "preprocessing", "feature extraction", "classification", "adaptive feedback"],
    nextStep: "Evaluate classifier robustness.",
  },
  "artificial-intelligence": {
    workflow: ["problem framing", "candidate model selection", "training setup", "evaluation criteria"],
    nextStep: "Run a comparative evaluation across the candidate approaches.",
  },
  robotics: {
    workflow: ["environment mapping", "path planning", "motion control", "safety validation"],
    nextStep: "Validate the navigation stack in simulation before any hardware trial.",
  },
  "data-science": {
    workflow: ["data ingestion", "cleaning", "feature engineering", "pipeline validation"],
    nextStep: "Schedule a dry run of the pipeline against a sample dataset.",
  },
  automation: {
    workflow: ["trigger definition", "workflow design", "integration points", "orchestration logic"],
    nextStep: "Define monitoring for the automated workflow.",
  },
  "software-engineering": {
    workflow: ["architecture review", "component boundaries", "integration points", "technical risks"],
    nextStep: "Document the proposed architecture for review.",
  },
};

export function generateResult(
  primaryAgent: Agent,
  collaboratorAgents: Agent[]
): { summary: string; nextStep: string } {
  const content = DOMAIN_RESULT[primaryAgent.domain];
  const steps = content.workflow.map((step) => `- ${step}`).join("\n");
  const collaboratorLine =
    collaboratorAgents.length > 0
      ? `\n\nCollaborating systems:\n${collaboratorAgents.map((a) => `- ${a.name}`).join("\n")}`
      : "";

  const summary = `Simulation completed.\n\n${primaryAgent.name} identified a workflow involving:\n${steps}${collaboratorLine}`;

  return { summary, nextStep: content.nextStep };
}

export const FAILURE_REASON =
  "Simulation encountered a controlled error during execution — this is a deliberate demo path, not a real fault.";
