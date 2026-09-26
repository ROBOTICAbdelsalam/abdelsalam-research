import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { CheckCircle2 } from "lucide-react";
import {
  VALIDATION_TOTALS,
  VALIDATION_MATRIX,
  VALIDATION_HOST_LABELS,
  type ValidationHost,
} from "@/data/bci-thesis";
import { CaseStudySectionLabel } from "./CaseStudySectionLabel";

const HOST_ORDER: readonly ValidationHost[] = ["dev", "ci", "ros2"];
const HOST_TONE: Record<ValidationHost, string> = {
  dev: "var(--trace)",
  ci: "var(--violet)",
  ros2: "var(--signal-green)",
};

// 13 ENGINEERING VALIDATION — every category verified, broken out by the
// host it was actually verified on, rather than one collapsed "100%
// verified" badge. Sourced from PROJECT_REPORT.md's own verification
// matrix (Section 1) and test-count breakdown (Section 4).
export function ValidationSection() {
  return (
    <section id="validation" className="scroll-mt-24 border-t border-border py-16 md:py-20">
      <Container>
        <Reveal>
          <CaseStudySectionLabel index={13} title="Engineering Validation" />
        </Reveal>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: "AI Scientific-Invariant Tests", value: VALIDATION_TOTALS.aiTests },
            { label: "ROS2 Tests", value: VALIDATION_TOTALS.ros2Tests },
            { label: "Total", value: VALIDATION_TOTALS.total },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.05}>
              <div className="rounded-xl border border-border bg-surface p-5 text-center">
                <p className="font-display text-3xl font-medium tracking-tight">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted mb-4">Verification Split</p>
          <div className="flex flex-wrap gap-4">
            {HOST_ORDER.map((host) => (
              <span key={host} className="flex items-center gap-2 font-mono text-xs text-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: HOST_TONE[host] }} aria-hidden />
                {VALIDATION_HOST_LABELS[host]}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.2} className="mt-6">
          <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
            {VALIDATION_MATRIX.map((row) => (
              <li key={row.label} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <span className="flex items-center gap-2.5 text-sm text-foreground/90">
                  <CheckCircle2 size={15} className="shrink-0 text-signal-green" aria-hidden />
                  {row.label}
                </span>
                <span className="flex gap-1.5">
                  {row.hosts.map((host) => (
                    <span
                      key={host}
                      title={VALIDATION_HOST_LABELS[host]}
                      className="rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide"
                      style={{ borderColor: `${HOST_TONE[host]}66`, color: HOST_TONE[host] }}
                    >
                      {VALIDATION_HOST_LABELS[host]}
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
