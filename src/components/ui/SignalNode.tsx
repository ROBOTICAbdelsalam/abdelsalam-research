"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type SignalTone = "accent" | "trace" | "violet" | "amber" | "gold" | "signal-green";

export function SignalNode({
  icon: Icon,
  tone = "accent",
  size = 44,
  pulse = true,
  delay = 0,
  className,
}: {
  icon?: LucideIcon;
  tone?: SignalTone;
  size?: number;
  pulse?: boolean;
  delay?: number;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const color = `var(--${tone})`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={
        shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }
      }
      className={cn("relative flex items-center justify-center rounded-xl border", className)}
      style={{ width: size, height: size, borderColor: color, backgroundColor: `var(--${tone}-soft)` }}
    >
      {pulse && (
        <span
          className="absolute inset-0 rounded-xl motion-safe:animate-node-pulse"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      {Icon && (
        <Icon
          size={Math.round(size * 0.45)}
          style={{ color }}
          strokeWidth={1.75}
          className="relative"
        />
      )}
    </motion.div>
  );
}
