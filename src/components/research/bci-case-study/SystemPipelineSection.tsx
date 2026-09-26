import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { BCIPipeline } from "@/components/research/bci-pipeline/BCIPipeline";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 04 SYSTEM PIPELINE — REBUILT into the full interactive Labs 01–14 +
// ROS2 execution pipeline (src/components/research/bci-pipeline/), in
// place of the coarse 12-step ArchitectureFlow this section used to
// show. See src/data/bci-pipeline.ts for every fact/filename this
// renders — all sourced from the thesis repository's own directory
// listings and docs, cross-checked against bci-thesis.ts.
export function SystemPipelineSection() {
  return (
    <section id="system-pipeline" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={4} title="System Pipeline" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted text-balance">
            EEG → preprocessing → CSP feature extraction → CNN/LSTM → adaptive threshold → real-time prediction → ROS2 bridge → robot abstraction → ros2_control → Gazebo Harmonic → MoveIt2 → robotic hand. Select any lab or ROS2 stage below for its purpose, data flow and real source file.
          </p>
        </Reveal>

        <div className="mt-10">
          <BCIPipeline />
        </div>
      </Container>
    </section>
  );
}
