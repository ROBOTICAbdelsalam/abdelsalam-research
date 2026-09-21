"use client";

import { researchItems } from "@/data/ai-lab-research";
import { getAgentsForResearch, getKnowledgeForResearch, getResearchForTask } from "@/lib/ai-lab/researchGraph";
import { getAgentsForProject, getProjectsForResearch, getProjectsForTask } from "@/lib/ai-lab/projectGraph";
import { getKnowledgeForTask, getKnowledgeNode, getKnowledgeNodeTone } from "@/lib/ai-lab/knowledgeGraph";
import { useAgentLab } from "./AgentLabProvider";

const primaryResearchItem = researchItems[0];

function Node({
  label,
  tone,
  onClick,
  active,
}: {
  label: string;
  tone: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const content = (
    <span className="flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: `var(--${tone})` }} aria-hidden />
      {label}
    </span>
  );
  const className =
    "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide transition-colors";
  const style = { borderColor: active ? `var(--${tone})` : "var(--border)", color: active ? `var(--${tone})` : "var(--muted)" };

  if (!onClick) {
    return (
      <span className={className} style={style}>
        {content}
      </span>
    );
  }
  return (
    <button type="button" onClick={onClick} className={`${className} hover:border-accent hover:text-foreground`} style={style}>
      {content}
    </button>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">{label}</span>
        <div className="flex flex-wrap justify-center gap-1.5">{children}</div>
      </div>
      <div className="h-4 w-px bg-border" aria-hidden />
    </>
  );
}

// A compact, structured relationship topology (Phase 7 §7/§18, extended in
// Phase 8 §16 and Phase 9 §13) — not a second graph engine and not a
// literal mind-map. While a task is active, the map re-anchors on THAT
// task (Task -> Agent -> Knowledge -> Research/Project -> Technology),
// rendering only the rows that actually have data — an untagged task shows
// no Research/Project row rather than an empty one. With nothing active,
// it falls back to the fixed Research-anchored view from Phase 7/8. Every
// chip routes through the SAME selection state as every other surface;
// there is exactly one research item today, so the idle view has one fixed
// anchor rather than a dynamic re-centering graph.
export function SystemMap() {
  const {
    agents,
    tasks,
    activeTaskId,
    selectedAgentId,
    selectedKnowledgeNodeId,
    selectedProjectId,
    setSelectedAgentId,
    setSelectedKnowledgeNodeId,
    setSelectedResearchId,
    setSelectedProjectId,
    viewTask,
  } = useAgentLab();

  const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

  if (activeTask) {
    const assignedAgent = agents.find((a) => a.id === activeTask.assignedAgent);
    const taskKnowledge = getKnowledgeForTask(activeTask.knowledgeContext);
    const taskResearch = getResearchForTask(activeTask.researchContext);
    const taskProjects = getProjectsForTask(activeTask.projectContext);
    const technologies = Array.from(
      new Set([...taskResearch.flatMap((r) => r.relatedTechnologies), ...taskProjects.flatMap((p) => p.technologies)])
    );

    return (
      <div className="rounded-2xl border border-border bg-surface p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">System Map — Active Task</p>

        <div className="mt-4 flex flex-col items-center gap-3">
          <Row label="Task">
            <Node
              label={activeTask.title}
              tone="amber"
              active
              onClick={() => activeTask.result && viewTask(activeTask.id)}
            />
          </Row>

          {assignedAgent && (
            <Row label="Agent">
              <Node
                label={assignedAgent.name}
                tone={assignedAgent.tone}
                active={selectedAgentId === assignedAgent.id}
                onClick={() => setSelectedAgentId(assignedAgent.id)}
              />
            </Row>
          )}

          {taskKnowledge.length > 0 && (
            <Row label="Knowledge">
              {taskKnowledge.map((node) => (
                <Node
                  key={node.id}
                  label={node.label}
                  tone={getKnowledgeNodeTone(node.id)}
                  active={selectedKnowledgeNodeId === node.id}
                  onClick={() => setSelectedKnowledgeNodeId(node.id)}
                />
              ))}
            </Row>
          )}

          {taskResearch.length > 0 && (
            <Row label="Research">
              {taskResearch.map((item) => (
                <Node
                  key={item.id}
                  label={getKnowledgeNode(item.id)?.label ?? item.title}
                  tone="trace"
                  onClick={() => setSelectedResearchId(item.id)}
                />
              ))}
            </Row>
          )}

          {taskProjects.length > 0 && (
            <Row label="Project">
              {taskProjects.map((project) => (
                <Node
                  key={project.id}
                  label={project.title}
                  tone="gold"
                  active={selectedProjectId === project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                />
              ))}
            </Row>
          )}

          {technologies.length > 0 && (
            <div className="flex flex-col items-center gap-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Technology</span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {technologies.slice(0, 6).map((tech) => (
                  <Node key={tech} label={tech} tone="gold" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const knowledge = getKnowledgeForResearch(primaryResearchItem.id);
  const linkedProjects = getProjectsForResearch(primaryResearchItem.id);
  const researchAgents = getAgentsForResearch(primaryResearchItem.id, agents);
  const projectAgents = linkedProjects.flatMap((p) => getAgentsForProject(p.id, agents));
  const relatedAgents = Array.from(new Map([...researchAgents, ...projectAgents].map((a) => [a.id, a])).values());
  const researchLabel = getKnowledgeNode(primaryResearchItem.id)?.label ?? primaryResearchItem.title;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">System Map</p>

      <div className="mt-4 flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Research</span>
          <Node
            label={researchLabel}
            tone="trace"
            active={true}
            onClick={() => setSelectedResearchId(primaryResearchItem.id)}
          />
        </div>

        <div className="h-4 w-px bg-border" aria-hidden />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Project</span>
          {linkedProjects.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-1.5">
              {linkedProjects.map((project) => (
                <Node
                  key={project.id}
                  label={project.title}
                  tone="gold"
                  active={selectedProjectId === project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                />
              ))}
            </div>
          ) : (
            <span className="font-mono text-[10px] text-muted/60">No linked project</span>
          )}
        </div>

        <div className="h-4 w-px bg-border" aria-hidden />

        <div className="flex flex-col items-center gap-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Knowledge</span>
          <div className="flex flex-wrap justify-center gap-1.5">
            {knowledge.map((node) => (
              <Node
                key={node.id}
                label={node.label}
                tone={getKnowledgeNodeTone(node.id)}
                active={selectedKnowledgeNodeId === node.id}
                onClick={() => setSelectedKnowledgeNodeId(node.id)}
              />
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-border" aria-hidden />

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Agents</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {relatedAgents.map((agent) => (
                <Node
                  key={agent.id}
                  label={agent.name}
                  tone={agent.tone}
                  active={selectedAgentId === agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted/60">Technologies</span>
            <div className="flex flex-wrap justify-center gap-1.5">
              {primaryResearchItem.relatedTechnologies.slice(0, 6).map((tech) => (
                <Node key={tech} label={tech} tone="gold" />
              ))}
            </div>
          </div>
        </div>

        <div className="h-4 w-px bg-border" aria-hidden />

        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted/60">
          ABD AI LAB — Local Simulation Runtime
        </p>
      </div>
    </div>
  );
}
