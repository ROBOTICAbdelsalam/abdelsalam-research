import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Chain } from "@/components/ui/Chain";
import { ROS2_PACKAGES, ROS2_FLOW, ROS2_TOPICS, ROBOT_INDEPENDENCE } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 09 ROBOT-INDEPENDENT ROS2 ARCHITECTURE — the six packages, the
// command/topic flow from the AI pipeline's output file to Gazebo, and
// the robot-independence seam as a distinct engineering contribution.
// Every package name, topic name and message type here is quoted from
// docs/ARCHITECTURE.md's own component/topic tables.
export function ROS2ArchitectureSection() {
  return (
    <section id="ros2-architecture" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={9} title="Robot-Independent ROS2 Architecture" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-balance">
            Six single-purpose ROS2 Jazzy packages carry a prediction from the AI pipeline&apos;s output file to a robot in Gazebo, with MoveIt2 handling motion planning.
          </p>
        </Reveal>

        {/* Packages */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROS2_PACKAGES.map((pkg, i) => (
            <Reveal key={pkg.name} delay={i * 0.05}>
              <div className="h-full rounded-xl border border-border bg-surface p-5">
                <p className="font-mono text-sm text-accent">{pkg.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{pkg.responsibility}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Command flow */}
        <Reveal delay={0.1} className="mt-12">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">Command Flow</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3 font-mono text-xs">
            {ROS2_FLOW.map((step, i) => (
              <span key={step.label} className="flex max-w-full items-center gap-2">
                <span className="flex min-w-0 max-w-full flex-col items-start rounded-lg border border-border bg-surface px-3 py-2">
                  <span className="uppercase tracking-wide text-foreground break-words">{step.label}</span>
                  {step.detail && <span className="mt-0.5 text-[10px] normal-case tracking-normal text-muted break-words">{step.detail}</span>}
                </span>
                {i < ROS2_FLOW.length - 1 && (
                  <span className="text-accent" aria-hidden>
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
        </Reveal>

        {/* Topics table */}
        <Reveal delay={0.14} className="mt-12">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">Topic / Service Interface</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-muted">Topic</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-muted">Type</th>
                  <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wide text-muted">Direction</th>
                </tr>
              </thead>
              <tbody>
                {ROS2_TOPICS.map((row) => (
                  <tr key={row.topic} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-mono text-xs text-accent">{row.topic}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{row.type}</td>
                    <td className="px-4 py-3 text-xs text-foreground/90">{row.direction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* Robot independence */}
        <Reveal delay={0.18} className="mt-14">
          <div className="rounded-2xl border border-signal-green/30 bg-signal-green-soft p-6 md:p-8">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-green">Engineering Contribution — Robot Independence</p>
            <p className="mt-4 text-sm leading-relaxed text-foreground/90">{ROBOT_INDEPENDENCE.statement}</p>

            <div className="mt-6">
              <Chain items={["BCI", "Semantic Gesture", "RobotInterface", "Robotic Hand"]} lastItemAccent />
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-wide text-muted">Adding a new robot</p>
            <ol className="mt-2 flex flex-col gap-1.5">
              {ROBOT_INDEPENDENCE.addRobotSteps.map((step, i) => (
                <li key={step} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-0.5 font-mono text-xs text-signal-green shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>

            <div className="mt-6 flex flex-wrap gap-2">
              {ROBOT_INDEPENDENCE.candidateRobots.map((robot) => (
                <span key={robot} className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-xs text-foreground/90">
                  {robot}
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">{ROBOT_INDEPENDENCE.candidateRobotsNote}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
