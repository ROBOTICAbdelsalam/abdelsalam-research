import type { Agent, LabMode } from "@/lib/ai-lab/types";
import { getKnowledgeContextForDomain } from "@/lib/ai-lab/knowledgeGraph";
import { getResearchContextForDomain } from "@/lib/ai-lab/researchGraph";

// ABD AI LAB — content for both the Phase 1 foundation and the Phase 3/4
// simulation layer. Skills/focus areas are drawn directly from the
// CV-sourced data already on this site (see src/data/techstack.ts,
// research.ts and pipeline.ts) — no invented credentials, achievements or
// tools. currentTask/lastActivity/collaborators are explicitly simulated
// demo content (see lib/ai-lab/useAgentRuntime.ts and
// useAgentOrchestrator.ts) — illustrative task framings a specialist in
// that role might plausibly work on, not records of real research output.
// These seeded currentTask entries represent each agent's illustrative
// "work in progress" at page load — distinct from tasks the orchestrator
// creates from a submitted command, which replace an agent's currentTask
// while they run.
export const labMeta: {
  mode: LabMode;
  eyebrow: string;
  title: string;
  concept: string;
  explanation: string;
  runtimeLabel: string;
} = {
  mode: "simulation",
  eyebrow: "ABD AI LAB",
  title: "ABD AI LAB",
  concept:
    "An experimental AI workforce for research, robotics and intelligent systems.",
  explanation:
    "Explore a simulated multi-agent environment where specialized AI systems collaborate across research, engineering, data and automation.",
  runtimeLabel: "Local Agent Runtime — no external AI execution is connected yet.",
};

export const agents: Agent[] = [
  {
    id: "ai-researcher",
    name: "AI Researcher",
    role: "Artificial Intelligence & Machine Learning",
    domain: "artificial-intelligence",
    status: "thinking",
    tone: "accent",
    summary:
      "Researches deep learning, computer vision and reinforcement learning approaches for perception and decision-making in intelligent systems.",
    focusAreas: ["Deep Learning", "Computer Vision", "Reinforcement Learning", "Model Integration"],
    skills: ["PyTorch", "TensorFlow", "CNN", "Transformers", "Scikit-learn"],
    currentTask: {
      id: "ai-researcher-task-1",
      title: "Analyze adaptive learning approaches",
      description: "Illustrative work in progress, seeded at page load.",
      assignedAgent: "ai-researcher",
      collaborators: [],
      status: "thinking",
      progress: 48,
      createdAt: "2026-01-01T00:00:00.000Z",
      executionMode: "simulation",
      knowledgeContext: getKnowledgeContextForDomain("artificial-intelligence"),
      researchContext: getResearchContextForDomain("artificial-intelligence"),
    },
    lastActivity: {
      id: "ai-researcher-activity-1",
      type: "agent",
      agentId: "ai-researcher",
      message: "Reviewing model architecture",
      timestamp: "2026-01-01T00:00:00.000Z",
    },
    collaborators: ["bci-researcher", "data-scientist", "software-engineer"],
  },
  {
    id: "robotics-engineer",
    name: "Robotics Engineer",
    role: "Robotics & Autonomous Systems",
    domain: "robotics",
    status: "working",
    tone: "signal-green",
    summary:
      "Works on motion planning, navigation and control for industrial arms, collaborative robots and autonomous mobile robots.",
    focusAreas: ["Motion Planning", "Navigation", "SLAM", "Robot Control"],
    skills: ["ROS 2", "Gazebo", "MuJoCo", "Universal Robots"],
    currentTask: {
      id: "robotics-engineer-task-1",
      title: "Review navigation architecture",
      description: "Illustrative work in progress, seeded at page load.",
      assignedAgent: "robotics-engineer",
      collaborators: [],
      status: "working",
      progress: 71,
      createdAt: "2026-01-01T00:00:00.000Z",
      executionMode: "simulation",
      knowledgeContext: getKnowledgeContextForDomain("robotics"),
      researchContext: getResearchContextForDomain("robotics"),
    },
    lastActivity: {
      id: "robotics-engineer-activity-1",
      type: "agent",
      agentId: "robotics-engineer",
      message: "Evaluating motion planning strategy",
      timestamp: "2026-01-01T00:00:00.000Z",
    },
    collaborators: ["bci-researcher", "software-engineer", "automation-engineer"],
  },
  {
    id: "bci-researcher",
    name: "BCI Researcher",
    role: "Brain-Computer Interfaces",
    domain: "brain-computer-interfaces",
    status: "thinking",
    tone: "trace",
    summary:
      "Investigates EEG acquisition and decoding, and adaptive, learning-driven interfaces between brain signals and robotic or assistive systems.",
    focusAreas: ["EEG Decoding", "Signal Processing", "Adaptive Learning", "Assistive Robotics"],
    skills: ["BrainFlow", "MNE-Python", "Deep Learning", "Signal Processing"],
    currentTask: {
      id: "bci-researcher-task-1",
      title: "Evaluate classification pipeline",
      description: "Illustrative work in progress, seeded at page load.",
      assignedAgent: "bci-researcher",
      collaborators: [],
      status: "thinking",
      progress: 64,
      createdAt: "2026-01-01T00:00:00.000Z",
      executionMode: "simulation",
      knowledgeContext: getKnowledgeContextForDomain("brain-computer-interfaces"),
      researchContext: getResearchContextForDomain("brain-computer-interfaces"),
    },
    lastActivity: {
      id: "bci-researcher-activity-1",
      type: "agent",
      agentId: "bci-researcher",
      message: "Processing EEG feature pipeline",
      timestamp: "2026-01-01T00:00:00.000Z",
    },
    collaborators: ["ai-researcher", "data-scientist", "robotics-engineer"],
  },
  {
    id: "data-scientist",
    name: "Data Scientist",
    role: "Data Engineering & Analysis",
    domain: "data-science",
    status: "waiting",
    tone: "violet",
    summary:
      "Builds data pipelines and analysis workflows that turn sensor and system data into inputs for AI and robotics.",
    focusAreas: ["Data Pipelines", "API Integration", "Data Processing", "Analysis"],
    skills: ["Python", "Pandas", "NumPy", "SQL (basic)"],
    currentTask: {
      id: "data-scientist-task-1",
      title: "Prepare feature comparison",
      description: "Illustrative work in progress, seeded at page load.",
      assignedAgent: "data-scientist",
      collaborators: [],
      status: "queued",
      progress: 25,
      createdAt: "2026-01-01T00:00:00.000Z",
      executionMode: "simulation",
      knowledgeContext: getKnowledgeContextForDomain("data-science"),
      researchContext: getResearchContextForDomain("data-science"),
    },
    lastActivity: {
      id: "data-scientist-activity-1",
      type: "agent",
      agentId: "data-scientist",
      message: "Preparing experiment dataset",
      timestamp: "2026-01-01T00:00:00.000Z",
    },
    collaborators: ["ai-researcher", "bci-researcher", "automation-engineer"],
  },
  {
    id: "automation-engineer",
    name: "Automation Engineer",
    role: "Industrial & Intelligent Automation",
    domain: "automation",
    status: "working",
    tone: "amber",
    summary:
      "Connects industrial control systems and AI-driven workflows — from PLC/SCADA automation to LLM-based agents and orchestration.",
    focusAreas: ["PLC / SCADA", "IIoT", "Workflow Orchestration", "AI Agents"],
    skills: ["Siemens SIMATIC", "n8n", "Prompt Engineering", "RAG"],
    currentTask: {
      id: "automation-engineer-task-1",
      title: "Map research workflow",
      description: "Illustrative work in progress, seeded at page load.",
      assignedAgent: "automation-engineer",
      collaborators: [],
      status: "working",
      progress: 58,
      createdAt: "2026-01-01T00:00:00.000Z",
      executionMode: "simulation",
      knowledgeContext: getKnowledgeContextForDomain("automation"),
      researchContext: getResearchContextForDomain("automation"),
    },
    lastActivity: {
      id: "automation-engineer-activity-1",
      type: "agent",
      agentId: "automation-engineer",
      message: "Mapping workflow dependencies",
      timestamp: "2026-01-01T00:00:00.000Z",
    },
    collaborators: ["software-engineer", "data-scientist", "robotics-engineer"],
  },
  {
    id: "software-engineer",
    name: "Software Engineer",
    role: "Systems & Software Engineering",
    domain: "software-engineering",
    status: "idle",
    tone: "gold",
    summary:
      "Builds the software, tooling and infrastructure that connect AI, robotics and automation into working, deployable systems.",
    focusAreas: ["Systems Integration", "Tooling", "APIs", "Version Control"],
    skills: ["Python", "C++", "Git", "Docker", "Linux"],
    currentTask: {
      id: "software-engineer-task-1",
      title: "Review AI Lab architecture",
      description: "Illustrative work in progress, seeded at page load.",
      assignedAgent: "software-engineer",
      collaborators: [],
      status: "queued",
      progress: 10,
      createdAt: "2026-01-01T00:00:00.000Z",
      executionMode: "simulation",
      knowledgeContext: getKnowledgeContextForDomain("software-engineering"),
      researchContext: getResearchContextForDomain("software-engineering"),
    },
    lastActivity: {
      id: "software-engineer-activity-1",
      type: "agent",
      agentId: "software-engineer",
      message: "Reviewing system architecture",
      timestamp: "2026-01-01T00:00:00.000Z",
    },
    collaborators: ["automation-engineer", "robotics-engineer", "ai-researcher"],
  },
];
