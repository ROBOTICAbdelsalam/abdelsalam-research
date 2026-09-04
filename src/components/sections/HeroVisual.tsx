"use client";

import { motion } from "framer-motion";
import {
  BrainCircuit,
  Cpu,
  Database,
  Antenna,
  Bot,
  Cog,
  Network,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { SignalNode, type SignalTone } from "@/components/ui/SignalNode";

type HeroNode = {
  key: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  tone: SignalTone;
  x: number;
  y: number;
};

// Six systems radiating from the central AI core, matched to the site's
// existing signal-tone palette. Sensors and Intelligent Systems share the
// teal "trace" tone per spec (both read as cyan/teal).
const nodes: HeroNode[] = [
  { key: "ai-ml", title: "AI / ML", subtitle: "Intelligence", icon: Cpu, tone: "violet", x: 95, y: 70 },
  { key: "data", title: "DATA", subtitle: "Insight", icon: Database, tone: "accent", x: 60, y: 220 },
  { key: "sensors", title: "SENSORS", subtitle: "Perception", icon: Antenna, tone: "trace", x: 95, y: 370 },
  { key: "robotics", title: "ROBOTICS", subtitle: "Action", icon: Bot, tone: "signal-green", x: 385, y: 70 },
  { key: "automation", title: "AUTOMATION", subtitle: "Efficiency", icon: Cog, tone: "amber", x: 420, y: 220 },
  { key: "intelligent-systems", title: "INTELLIGENT SYSTEMS", subtitle: "Impact", icon: Network, tone: "trace", x: 385, y: 370 },
];

// Orthogonal circuit traces from each node to the AI core's outer ring —
// same construction technique as the rest of the site's signal system.
const paths: Record<string, string> = {
  "ai-ml": "M95,70 L189,70 L189,169",
  data: "M60,220 L168,220",
  sensors: "M95,370 L189,370 L189,271",
  robotics: "M385,70 L291,70 L291,169",
  automation: "M420,220 L312,220",
  "intelligent-systems": "M385,370 L291,370 L291,271",
};

const CENTER = { x: 240, y: 220 };

// Faint scattered background points — texture, not a literal grid.
const gridPoints = [
  [20, 20], [230, 15], [460, 25], [20, 220], [460, 220], [20, 420],
  [240, 425], [460, 420], [150, 130], [330, 130], [150, 310], [330, 310],
  [240, 25], [240, 415],
];

export function HeroVisual() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="signal-glow mx-auto w-full max-w-sm lg:max-w-none">
      {/* Desktop / tablet — full circuit network around the central core. */}
      <svg
        viewBox="0 0 480 440"
        className="hidden w-full h-auto overflow-visible sm:block"
        role="img"
        aria-label="A central AI core connects sensing, data, machine learning, decision-making, robotics and automation into one intelligent system"
      >
        {gridPoints.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.3} className="fill-border-strong" />
        ))}

        {nodes.map((node, i) => {
          const d = paths[node.key];
          const tone = `var(--${node.tone})`;
          return (
            <g key={node.key}>
              <path d={d} fill="none" strokeWidth={1.5} opacity={0.4} style={{ stroke: tone }} />
              <path
                d={d}
                fill="none"
                strokeWidth={1.5}
                strokeDasharray="5 11"
                strokeLinecap="round"
                className="motion-safe:animate-signal-trace"
                style={{ stroke: tone, animationDelay: `${i * 0.3}s`, filter: `drop-shadow(0 0 3px ${tone})` }}
              />
            </g>
          );
        })}

        {/* Central AI core */}
        <g>
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={72}
            fill="none"
            strokeWidth={1}
            className="motion-safe:animate-pulse-slow"
            style={{ stroke: "var(--trace)" }}
          />
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={58}
            fill="none"
            strokeWidth={1}
            style={{ stroke: "var(--accent)", opacity: 0.5 }}
          />
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={42}
            className="motion-safe:animate-node-pulse"
            style={{ fill: "var(--trace)" }}
          />
          <circle
            cx={CENTER.x}
            cy={CENTER.y}
            r={32}
            strokeWidth={2}
            style={{
              fill: "var(--surface)",
              stroke: "var(--accent)",
              filter: "drop-shadow(0 0 10px var(--accent)) drop-shadow(0 0 18px var(--violet))",
            }}
          />
          <foreignObject x={CENTER.x - 20} y={CENTER.y - 20} width={40} height={40}>
            <div className="flex h-full w-full items-center justify-center">
              <BrainCircuit size={28} className="text-accent" strokeWidth={1.5} />
            </div>
          </foreignObject>
          <text
            x={CENTER.x}
            y={CENTER.y + 92}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em" }}
          >
            AI CORE
          </text>
        </g>

        {nodes.map((node, index) => {
          const Icon = node.icon;
          const tone = `var(--${node.tone})`;
          return (
            <motion.g
              key={node.key}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }
              }
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={19}
                className="motion-safe:animate-node-pulse"
                style={{ fill: tone, animationDelay: `${index * 0.25}s` }}
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={15}
                strokeWidth={1.5}
                style={{ fill: "var(--surface)", stroke: tone, filter: `drop-shadow(0 0 4px ${tone})` }}
              />
              <foreignObject x={node.x - 11} y={node.y - 11} width={22} height={22}>
                <div className="flex h-full w-full items-center justify-center">
                  <Icon size={14} style={{ color: tone }} strokeWidth={1.75} />
                </div>
              </foreignObject>
              <text
                x={node.x}
                y={node.y + 33}
                textAnchor="middle"
                className="fill-foreground"
                style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.08em" }}
              >
                {node.title}
              </text>
              <text
                x={node.x}
                y={node.y + 47}
                textAnchor="middle"
                className="fill-muted"
                style={{ fontFamily: "var(--font-sans)", fontSize: 9 }}
              >
                {node.subtitle}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Mobile — brain first, then a readable grid of the six systems. */}
      <div className="flex flex-col items-center gap-10 sm:hidden">
        <div className="flex flex-col items-center">
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-full border-2 motion-safe:animate-pulse-slow"
            style={{ borderColor: "var(--accent)", filter: "drop-shadow(0 0 14px var(--accent))" }}
          >
            <span
              className="absolute inset-2 rounded-full motion-safe:animate-node-pulse"
              style={{ backgroundColor: "var(--trace)" }}
              aria-hidden
            />
            <BrainCircuit size={32} className="relative text-accent" strokeWidth={1.5} />
          </div>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
            AI Core
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          {nodes.map((node, index) => (
            <div
              key={node.key}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center"
            >
              <SignalNode icon={node.icon} tone={node.tone} size={36} delay={index * 0.05} />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-wide text-foreground">
                {node.title}
              </p>
              <p className="text-[10px] text-muted">{node.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
