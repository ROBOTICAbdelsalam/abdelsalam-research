"use client";

import type { CSSProperties } from "react";
import { Antenna, Database, Cpu, Split, Bot, Cog, Network } from "lucide-react";
import { systemPipeline } from "@/data/pipeline";
import { SignalNode } from "@/components/ui/SignalNode";
import { Reveal } from "@/components/ui/Reveal";

const iconMap = {
  antenna: Antenna,
  database: Database,
  cpu: Cpu,
  split: Split,
  bot: Bot,
  cog: Cog,
  network: Network,
};

export function SystemPipeline() {
  return (
    <div className="flex flex-col items-stretch lg:flex-row lg:items-start">
      {systemPipeline.map((stage, index) => {
        const Icon = iconMap[stage.iconKey];
        const isLast = index === systemPipeline.length - 1;
        const next = systemPipeline[index + 1];

        return (
          <div key={stage.title} className="flex flex-col items-center lg:flex-1">
            <div className="flex flex-col items-center lg:w-full">
              <Reveal delay={index * 0.05}>
                <SignalNode icon={Icon} tone={stage.tone} size={44} />
              </Reveal>
              <p className="mt-3 text-center font-mono text-xs font-semibold uppercase tracking-wide text-foreground">
                {stage.title}
              </p>
              <p className="mt-1 max-w-[130px] text-center text-[11px] leading-snug text-muted">
                {stage.description}
              </p>
            </div>

            {!isLast && (
              <div
                className="my-5 h-8 w-px shrink-0 self-center [background:linear-gradient(to_bottom,var(--from),var(--to))] lg:my-6 lg:h-px lg:w-full lg:flex-1 lg:[background:linear-gradient(to_right,var(--from),var(--to))]"
                style={
                  {
                    "--from": `var(--${stage.tone})`,
                    "--to": `var(--${next.tone})`,
                  } as CSSProperties
                }
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
