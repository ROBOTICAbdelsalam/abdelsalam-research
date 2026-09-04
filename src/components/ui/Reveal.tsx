"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/useReducedMotion";

export function Reveal({
  children,
  className,
  delay = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  // `initial`/`whileInView` always keep the same shape across renders —
  // toggling them to `undefined` after the reduced-motion preference
  // resolves (post-hydration) makes Framer Motion fall back to the
  // mount-time "initial" (opacity: 0) as the resting state, leaving
  // content permanently invisible. Zeroing the transition instead gives
  // the same "no animation" result without ever removing the props.
  return (
    <motion.div
      id={id}
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
