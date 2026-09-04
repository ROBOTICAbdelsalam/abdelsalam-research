export type ResearchArea = {
  index: string;
  title: string;
  description: string;
  topics: string[];
};

// Academic / scientific focus — grounded in the M.Sc. thesis and coursework.
export const researchFocus: ResearchArea[] = [
  {
    index: "01",
    title: "Artificial Intelligence & Machine Learning",
    description:
      "Deep learning, neural networks, CNN, LSTM, Transformers, reinforcement learning and computer vision, applied to robotics and signal decoding.",
    topics: ["Deep Learning", "CNN", "LSTM", "Transformers", "Reinforcement Learning"],
  },
  {
    index: "02",
    title: "Brain-Computer Interfaces",
    description:
      "EEG acquisition and decoding, signal processing and adaptive, learning-driven BCI systems for robotic and assistive control.",
    topics: ["EEG", "Signal Processing", "Adaptive Learning", "BrainFlow", "MNE-Python"],
  },
  {
    index: "03",
    title: "Intelligent Robotics",
    description:
      "AI-driven industrial and collaborative robots, with perception-driven, adaptive behaviour in unstructured environments.",
    topics: ["AI-Driven Robots", "Collaborative Robots", "Perception", "Adaptive Behaviour"],
  },
  {
    index: "04",
    title: "Autonomous Systems",
    description:
      "Motion planning, navigation, SLAM and robot perception underpinning autonomous mobile robots and industrial robotic arms.",
    topics: ["Motion Planning", "Navigation", "SLAM", "Autonomous Mobile Robots"],
  },
  {
    index: "05",
    title: "Human-Robot Interaction",
    description:
      "Interfaces between humans, AI systems and robots — including shared control and safety-aware collaboration.",
    topics: ["Shared Control", "Safety", "BCI Interfaces", "Collaboration"],
  },
];

// Applied engineering capabilities — proven through 8+ years of industrial
// experience, deliberately kept distinct from the academic focus above.
// Robotics and AI/ML appear on both sides on purpose: one is the academic
// investigation, the other is the applied, production-facing practice.
export const engineeringCapabilities: ResearchArea[] = [
  {
    index: "06",
    title: "Robotics Engineering",
    description:
      "Programming industrial robotic arms, collaborative robots and autonomous mobile robots on ROS 2 — commissioning, testing and production handover, not just simulation.",
    topics: ["ROS 2", "Robot Control", "Motion Planning", "Industrial Robotic Arms"],
  },
  {
    index: "07",
    title: "AI/ML Systems",
    description:
      "Integrating trained models into robotic decision-making pipelines — perception-driven task selection and adaptive behaviour in production environments.",
    topics: ["Model Integration", "Perception", "Decision Pipelines"],
  },
  {
    index: "08",
    title: "Industrial Automation",
    description:
      "PLC (Siemens SIMATIC, Allen-Bradley), SCADA, HMI, instrumentation and control, predictive maintenance and IIoT across safety-critical industrial environments.",
    topics: ["PLC", "SCADA", "HMI", "Predictive Maintenance", "IIoT"],
  },
  {
    index: "09",
    title: "AI Automation",
    description:
      "LLMs, AI agents, prompt engineering and retrieval-augmented generation — with n8n as one automation and orchestration tool among others.",
    topics: ["LLMs", "AI Agents", "Prompt Engineering", "RAG", "n8n"],
  },
  {
    index: "10",
    title: "Data Engineering",
    description:
      "Python-based data processing with Pandas and NumPy, and API integration supporting AI and robotics systems — a growing technical direction.",
    topics: ["Python", "Pandas", "NumPy", "APIs", "SQL (basic)"],
  },
];

// Conceptual relationship between data engineering and downstream AI systems.
export const dataFlow: string[] = [
  "Data",
  "Processing",
  "Pipeline",
  "Intelligence",
  "Application",
];

// How PLC/SCADA-level industrial systems connect to AI and monitoring —
// the industrial automation background made visual.
export const industrialFlow: string[] = [
  "PLC",
  "SCADA",
  "I&C",
  "Sensors",
  "Robotics",
  "AI",
  "Monitoring",
];

// How research and engineering relate on this site.
export const researchToEngineering: string[] = [
  "Research",
  "Engineering",
  "Real-World Intelligent Systems",
];

export type CapabilityTone = "accent" | "trace" | "violet" | "amber" | "gold";

export type Capability = {
  title: string;
  description: string;
  technologies: string[];
  tone: CapabilityTone;
  href: string;
};

// The homepage's five-card capability summary. Deliberately a distinct
// list from `engineeringCapabilities` above (which includes Industrial
// Automation for the /research page) — the CV-verified Computer Vision
// skill set takes that slot here instead, per site content decisions.
export const capabilityGrid: Capability[] = [
  {
    title: "AI & Machine Learning",
    description:
      "Deep learning and classical ML applied to signal decoding and robotic decision-making.",
    technologies: ["PyTorch", "TensorFlow", "CNN"],
    tone: "accent",
    href: "/research#engineering-capabilities",
  },
  {
    title: "Robotics Engineering",
    description:
      "Industrial arms, collaborative robots and AMRs on ROS 2 — commissioned, not just simulated.",
    technologies: ["ROS 2", "Motion Planning", "Robot Control"],
    tone: "trace",
    href: "/research#engineering-capabilities",
  },
  {
    title: "Data Engineering",
    description:
      "Python-based data processing and API integration supporting AI systems — a growing direction.",
    technologies: ["Python", "Pandas", "APIs"],
    tone: "violet",
    href: "/research#engineering-capabilities",
  },
  {
    title: "AI Automation",
    description:
      "LLMs and AI agents orchestrated into workflows, with n8n as one tool among several.",
    technologies: ["LLMs", "AI Agents", "n8n"],
    tone: "amber",
    href: "/research#engineering-capabilities",
  },
  {
    title: "Computer Vision & Perception",
    description:
      "Object detection, image classification and camera-based perception feeding robotic decision-making.",
    technologies: ["OpenCV", "Object Detection", "Image Classification"],
    tone: "gold",
    href: "/research#engineering-capabilities",
  },
];

export const researchIntro = {
  title: "Research",
  subtitle:
    "Exploring intelligent systems that connect humans, machines, data and artificial intelligence.",
};

export const engineeringIntro = {
  title: "Engineering Capabilities",
  subtitle:
    "Applied engineering skills built over 8+ years in industry — supporting and extending the research above.",
};
