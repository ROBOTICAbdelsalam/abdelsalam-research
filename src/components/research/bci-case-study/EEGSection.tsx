import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Chain } from "@/components/ui/Chain";
import { EEG_DATASET, EEG_PREPROCESSING_STEPS, EEG_SIGNAL_FLOW } from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const STATS: { label: string; value: string }[] = [
  { label: "Dataset", value: EEG_DATASET.dataset },
  { label: "Epochs", value: String(EEG_DATASET.epochs) },
  { label: "Channels", value: String(EEG_DATASET.channels) },
  { label: "Sample Rate", value: `${EEG_DATASET.sampleRateHz} Hz` },
  { label: "Classes", value: String(EEG_DATASET.classes) },
];

// 05 EEG SIGNAL PROCESSING — the documented acquisition/preprocessing
// facts (src/data/bci-thesis.ts's EEG_DATASET, sourced from
// PROJECT_REPORT.md's "Dataset: EEGBCI subject 1, run 4 — 29 epochs, 64
// channels, 160 Hz, 3 classes") plus the raw→CSP signal flow.
export function EEGSection() {
  return (
    <section id="eeg-signal-processing" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={5} title="EEG Signal Processing" />
        </Reveal>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {STATS.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.04}>
              <div className="rounded-xl border border-border bg-surface p-4 text-center">
                <p className="font-display text-lg font-medium tracking-tight text-balance">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">Preprocessing</p>
          <Chain items={[...EEG_PREPROCESSING_STEPS]} />
        </Reveal>

        <Reveal delay={0.15} className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">Signal Flow</p>
          <Chain items={[...EEG_SIGNAL_FLOW]} lastItemAccent />
        </Reveal>
      </Container>
    </section>
  );
}
