"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import type { Capability } from "@/data/research";
import { SignalNode } from "@/components/ui/SignalNode";
import { Reveal } from "@/components/ui/Reveal";

export function CapabilityCard({
  item,
  icon: Icon,
  delay = 0,
}: {
  item: Capability;
  icon: LucideIcon;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <Link
        href={item.href}
        className="group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors duration-300"
      >
        <div
          className="absolute inset-0 rounded-2xl border opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ borderColor: `var(--${item.tone})` }}
          aria-hidden
        />

        <div className="relative transition-transform duration-300 group-hover:-translate-y-0.5">
          <SignalNode icon={Icon} tone={item.tone} size={40} />
        </div>

        <h3 className="relative mt-5 font-display text-base font-medium tracking-tight transition-transform duration-300 group-hover:translate-x-0.5">
          {item.title}
        </h3>
        <p className="relative mt-2 text-sm leading-relaxed text-muted transition-transform duration-300 group-hover:translate-x-0.5">
          {item.description}
        </p>

        <ul className="relative mt-4 flex flex-col gap-1.5">
          {item.technologies.map((tech) => (
            <li key={tech} className="flex items-center gap-2 font-mono text-xs text-muted">
              <span
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: `var(--${item.tone})` }}
                aria-hidden
              />
              {tech}
            </li>
          ))}
        </ul>

        <div
          className="relative mt-5 h-px w-0 bg-current transition-all duration-300 group-hover:w-8"
          style={{ color: `var(--${item.tone})` }}
        />

        <span className="relative mt-4 inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors duration-300 group-hover:text-foreground">
          Learn more
          <ArrowUpRight
            size={12}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </Link>
    </Reveal>
  );
}
