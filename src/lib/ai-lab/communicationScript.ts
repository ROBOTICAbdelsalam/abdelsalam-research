import type { Agent, AgentDomain, MessageType } from "./types";
import { ORCHESTRATOR_ID, SYSTEM_ID } from "./types";

// What a specialist in this domain is asked to do when brought into a
// task — reused for both "primary asks collaborator 1" and "collaborator 1
// asks collaborator 2" legs, since neither of the spec's two worked
// examples (§5 BCI, §6 Robotics) phrases a request differently depending
// on who's asking, only on who's being asked.
const REQUEST_TEMPLATES: Record<AgentDomain, string> = {
  "artificial-intelligence": "Evaluate the machine-learning component of the pipeline.",
  "brain-computer-interfaces": "Review adaptive signal-processing requirements.",
  robotics: "Review motion-planning and control requirements.",
  "data-science": "Review feature-analysis requirements.",
  automation: "Review orchestration requirements.",
  "software-engineering": "Review system interface requirements.",
};

// What that specialist reports back once done — adapted from spec §23's
// per-agent examples into a consistent "here's my output" tone, since
// that's this template's one job (some of §23's original phrasings read
// as requests, which fits a different slot than "reporting back").
const CONTRIBUTION_TEMPLATES: Record<AgentDomain, string> = {
  "artificial-intelligence": "Model evaluation context prepared.",
  "brain-computer-interfaces": "Adaptive signal validation complete.",
  robotics: "Motion-planning review complete.",
  "data-science": "Feature comparison prepared.",
  automation: "Workflow dependencies mapped.",
  "software-engineering": "System interface requirements reviewed.",
};

export type CommunicationStep = {
  from: string;
  to: string;
  type: MessageType;
};

// Builds the relay chain a task's communication plays out over — a plain
// data description (who says what to whom, in what order), not the
// message objects themselves (useAgentOrchestrator.ts turns each step into
// a real AgentMessage with timing). The chain's LENGTH depends on how many
// collaborators the task actually has (0, 1 or 2 — see
// commandRouter.ts's TASK_COLLABORATORS), so different commands genuinely
// produce different communication sequences rather than one fixed script
// reused everywhere (spec §4):
//
//   0 collaborators: orchestrator -> primary -> orchestrator -> system
//   1 collaborator:  orchestrator -> primary -> collaborator -> primary -> orchestrator -> system
//   2 collaborators: orchestrator -> primary -> collab1 -> collab2 -> primary -> orchestrator -> system
export function buildCommunicationSteps(primary: Agent, collaborators: Agent[]): CommunicationStep[] {
  const steps: CommunicationStep[] = [
    { from: ORCHESTRATOR_ID, to: primary.id, type: "request" },
  ];

  let lastSenderId = primary.id;
  collaborators.forEach((collaborator, index) => {
    steps.push({ from: lastSenderId, to: collaborator.id, type: index === 0 ? "request" : "context" });
    lastSenderId = collaborator.id;
  });

  if (collaborators.length > 0) {
    steps.push({ from: lastSenderId, to: primary.id, type: "analysis" });
  }

  steps.push({ from: primary.id, to: ORCHESTRATOR_ID, type: "result" });
  steps.push({ from: ORCHESTRATOR_ID, to: SYSTEM_ID, type: "system" });

  return steps;
}

// The actual message text for one step. `task` is only used for the very
// first leg, so the orchestrator's opening message ties back to what was
// literally asked.
export function contentForStep(
  step: CommunicationStep,
  taskTitle: string,
  agentsById: Map<string, Agent>
): string {
  if (step.from === ORCHESTRATOR_ID) {
    return step.to === SYSTEM_ID ? "Result ready." : `Process: "${taskTitle}"`;
  }
  if (step.to === ORCHESTRATOR_ID) {
    return "Workflow simulation completed.";
  }
  const recipient = agentsById.get(step.to);
  if (!recipient) return "Task update.";
  // The final leg back to the primary agent reports what the last
  // collaborator found; every earlier leg is a request for the next
  // specialist to weigh in.
  const isReportingBack = step.type === "analysis";
  const sender = agentsById.get(step.from);
  return isReportingBack && sender
    ? CONTRIBUTION_TEMPLATES[sender.domain]
    : REQUEST_TEMPLATES[recipient.domain];
}
