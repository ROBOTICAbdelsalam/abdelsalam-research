"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type FlowStep =
  | string
  | { label: string; description?: string; icon?: LucideIcon };

function normalize(step: FlowStep) {
  return typeof step === "string" ? { label: step } : step;
}

export function ArchitectureFlow({
  steps,
  className,
}: {
  steps: FlowStep[];
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className={cn("flex flex-col items-stretch", className)}>
      {steps.map((rawStep, index) => {
        const step = normalize(rawStep);
        const isLast = index === steps.length - 1;
        const dotColor = index % 2 === 0 ? "var(--accent)" : "var(--trace)";
        const Icon = step.icon;

        return (
          <div key={step.label} className="relative">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }
              }
              className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-colors duration-200 hover:border-accent/40"
            >
              <span className="font-mono text-xs text-accent tabular-nums shrink-0">
                <span className="text-border-strong">[</span>
                {String(index + 1).padStart(2, "0")}
                <span className="text-border-strong">]</span>
              </span>
              {Icon && (
                <Icon size={16} className="text-accent shrink-0" strokeWidth={1.75} aria-hidden />
              )}
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{step.label}</span>
                {step.description && (
                  <span className="block text-xs text-muted mt-0.5">{step.description}</span>
                )}
              </span>
            </motion.div>

            {!isLast && (
              <div className="relative mx-auto h-8 w-px bg-border">
                <span
                  className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full motion-safe:animate-flow"
                  style={{
                    backgroundColor: dotColor,
                    boxShadow: `0 0 8px ${dotColor}`,
                    animationDelay: `${index * 0.15}s`,
                  }}
                  aria-hidden
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
