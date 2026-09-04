import { aiJobAgent, automationIntro } from "@/data/automation";
import { Reveal } from "@/components/ui/Reveal";
import { ArchitectureFlow } from "@/components/ui/ArchitectureFlow";
import { Chain } from "@/components/ui/Chain";

export function AIAutomation() {
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16 items-start">
      <Reveal>
        <Chain items={automationIntro.stack} separator="plus" className="text-muted" />

        <h3 className="mt-6 font-display text-2xl sm:text-3xl font-medium tracking-tight">
          {aiJobAgent.name}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-muted text-balance">
          {aiJobAgent.description}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <ArchitectureFlow steps={aiJobAgent.architecture} />
      </Reveal>
    </div>
  );
}
