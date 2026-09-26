import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { BCIDigitalTwin } from "@/components/research/bci-3d/BCIDigitalTwin";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

// 02 INTERACTIVE DIGITAL TWIN — the existing WebGL experience, completely
// unchanged (BCIDigitalTwin already owns its own state machine, honesty
// labels and cinematic run-through — see src/components/research/bci-3d/).
// This wrapper adds only the numbered section marker and the explicit
// framing paragraph the brief asks for; it renders BCIDigitalTwin exactly
// as it already exists elsewhere, with no new instance of its state, no
// second state machine, and no edits to that component tree.
export function DigitalTwinSection() {
  return (
    <section id="digital-twin" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={2} title="Interactive Digital Twin" />
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            <span className="font-medium text-foreground">Interactive system visualization — digital twin / conceptual visualization.</span>{" "}
            The scene below is a presentation layer for the implemented research architecture described in the sections that follow — it renders the documented pipeline and lets you step through it, but it is not a live EEG backend and not a live Gazebo backend running in your browser.
          </p>
        </Reveal>
      </Container>

      <div className="mt-8">
        <Container>
          <BCIDigitalTwin />
        </Container>
      </div>
    </section>
  );
}
