import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { GAZEBO_MOVEIT_FACTS } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const FACTS: { label: string; value: string }[] = [
  { label: "Simulator", value: GAZEBO_MOVEIT_FACTS.simulator },
  { label: "Control Framework", value: GAZEBO_MOVEIT_FACTS.controlFramework },
  { label: "Motion Planner", value: GAZEBO_MOVEIT_FACTS.planner },
  { label: "Planning Group", value: GAZEBO_MOVEIT_FACTS.planningGroup },
  { label: "Named Gesture States", value: String(GAZEBO_MOVEIT_FACTS.namedStates) },
  { label: "Planning Library", value: GAZEBO_MOVEIT_FACTS.planningLibrary },
];

// 11 GAZEBO + MOVEIT2 — the simulation and motion-planning layer that
// sits under the robot abstraction (section 09) and receives the
// robotic hand's joint trajectory.
export function GazeboMoveItSection() {
  return (
    <section id="gazebo-moveit2" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={11} title="Gazebo + MoveIt2" />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FACTS.map((fact, i) => (
            <Reveal key={fact.label} delay={i * 0.04}>
              <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-5 py-4">
                <span className="font-mono text-[10px] uppercase tracking-wide text-muted">{fact.label}</span>
                <span className="text-sm font-medium text-foreground text-right">{fact.value}</span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2} className="mt-6">
          <div className="flex flex-wrap gap-2">
            {GAZEBO_MOVEIT_FACTS.controllers.map((c) => (
              <span key={c} className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted">
                {c}
              </span>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
