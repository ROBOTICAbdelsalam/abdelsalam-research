import type { SignalTone } from "@/components/ui/SignalNode";

export type PipelineStage = {
  title: string;
  description: string;
  tone: SignalTone;
  iconKey: "antenna" | "database" | "cpu" | "split" | "bot" | "cog" | "network";
};

// The conceptual pipeline connecting every domain on this site — not seven
// unrelated careers, but one intelligent-systems direction. Purely
// conceptual/positioning; not a claim about any specific project's
// implementation.
export const systemPipeline: PipelineStage[] = [
  { title: "Sensors", description: "EEG, industrial & robotic sensing", tone: "trace", iconKey: "antenna" },
  { title: "Data", description: "Acquisition, pipelines, processing", tone: "violet", iconKey: "database" },
  { title: "AI / ML", description: "Models, inference, decoding", tone: "accent", iconKey: "cpu" },
  { title: "Decision", description: "Planning, adaptive control logic", tone: "accent", iconKey: "split" },
  { title: "Robotics", description: "Motion, manipulation, control", tone: "signal-green", iconKey: "bot" },
  { title: "Automation", description: "Workflows, agents, orchestration", tone: "amber", iconKey: "cog" },
  { title: "Intelligent Systems", description: "Real-world, deployed outcomes", tone: "gold", iconKey: "network" },
];

export const pipelineIntro = {
  eyebrow: "System Pipeline",
  title: "From Data to Intelligent Action",
  subtitle:
    "A systems view of how data, intelligence, robotics and automation connect.",
  statement:
    "I work across the boundary between software intelligence and physical systems — connecting data, machine learning, robotics, control and intelligent automation to build real-world intelligent systems.",
};
