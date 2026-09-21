import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArchitectureFlow, type FlowStep } from "@/components/ui/ArchitectureFlow";
import { LabHero } from "@/components/ai-lab/LabHero";
import { LabExperience } from "@/components/ai-lab/LabExperience";
import { AgentRoster } from "@/components/ai-lab/AgentRoster";
import { AgentLabProvider } from "@/components/ai-lab/AgentLabProvider";
import { AgentDevControls } from "@/components/ai-lab/AgentDevControls";
import { CommandCenter } from "@/components/ai-lab/CommandCenter";
import { ActivityStream } from "@/components/ai-lab/ActivityStream";
import { TaskHistory } from "@/components/ai-lab/TaskHistory";
import { KnowledgeBrain } from "@/components/ai-lab/KnowledgeBrain";
import { ResearchIntelligenceSection } from "@/components/ai-lab/ResearchIntelligencePanel";
import { ProjectWorkspaceSection } from "@/components/ai-lab/ProjectWorkspace";
import { SystemMap } from "@/components/ai-lab/SystemMap";
import { LabOperationsHeader } from "@/components/ai-lab/LabOperationsHeader";
import { LabLiveState } from "@/components/ai-lab/LabLiveState";
import { ActivitySummary } from "@/components/ai-lab/ActivitySummary";
import { AgentOperations } from "@/components/ai-lab/AgentOperations";
import { LabTimeline } from "@/components/ai-lab/LabTimeline";

export const metadata: Metadata = {
  title: "ABD AI LAB",
  description:
    "An experimental multi-agent AI laboratory exploring artificial intelligence, robotics, intelligent systems, research automation and human-machine interaction.",
};

// Plain strings only (no icon components) — ArchitectureFlow is a Client
// Component, and Lucide icon components can't be passed to it as props
// from this Server Component.
const roadmap: FlowStep[] = [
  {
    label: "Phase 1 — Foundation",
    description: "Architecture, agent data model and visual language",
  },
  {
    label: "Phase 2 — 3D Laboratory",
    description: "Immersive environment, camera system and agent workstations",
  },
  {
    label: "Phase 3 — Simulation",
    description: "Agent state, selection, collaboration and task context",
  },
  {
    label: "Phase 4 — Command Center",
    description: "Command routing, task orchestration and a live activity stream (this page)",
  },
];

export default function AiLabPage() {
  return (
    <AgentLabProvider>
      <LabHero />

      <section className="py-20 md:py-24">
        <Container>
          <SectionHeading
            eyebrow="Command Center"
            title="The Laboratory"
            subtitle="Hover a workstation to identify it, click to focus the camera and view its details. Drag to look around."
          />
          <div className="mt-14">
            <LabExperience />
          </div>

          <div className="mt-8">
            <CommandCenter />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ActivityStream />
            <TaskHistory />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Operations Console"
            title="Lab Operations & Intelligence"
            subtitle="What's happening in the lab, what has happened, and how it all connects — a session-level view over the same agent, task and activity state driving the 3D scene above. A local observability layer, not real monitoring infrastructure."
          />
          <div className="mt-14 flex flex-col gap-4">
            <LabOperationsHeader />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <LabLiveState />
              <ActivitySummary />
            </div>
            <AgentOperations />
            <LabTimeline />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Knowledge Brain"
            title="Local Knowledge Graph"
            subtitle="A structured map of the concepts this lab's agents draw on — connected to the agents and research already on this site, not a real knowledge base or retrieval system. Search or filter, then select a concept to see what it connects to."
          />
          <div className="mt-14">
            <KnowledgeBrain />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Research Intelligence"
            title="Research"
            subtitle="The lab's one real research item — the M.Sc. thesis behind this site — connected to the agents and knowledge concepts grounded in it. Structured research data, not a live research database."
          />
          <div className="mt-14 max-w-sm">
            <ResearchIntelligenceSection />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Project Workspace"
            title="AI Research & Engineering Workspace"
            subtitle="Where research ideas become engineering work — the site's real projects, connected to the same knowledge, research and agents above. A local workspace, not a live engineering environment: running a simulation task never builds, deploys or executes anything."
          />
          <div className="mt-14">
            <ProjectWorkspaceSection />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="Agents"
            title="The AI Workforce"
            subtitle="Six specialized agents, each modeled on a real research and engineering direction — coordinated as one simulated system, not six unrelated cards."
          />
          <div className="mt-14">
            <AgentRoster />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading
            eyebrow="System Architecture"
            title="System Map"
            subtitle="How agents, tasks, knowledge, research and technology connect in this simulation — select an item to move through what it relates to."
          />
          <div className="mt-14 max-w-2xl">
            <SystemMap />
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-24 border-t border-border">
        <Container>
          <SectionHeading eyebrow="Roadmap" title="What's Next" />
          <div className="mt-14 max-w-xl">
            <ArchitectureFlow steps={roadmap} />
          </div>
        </Container>
      </section>

      <AgentDevControls />
    </AgentLabProvider>
  );
}
