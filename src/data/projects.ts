export type ProjectGroup = "AI" | "Robotics" | "Data" | "Automation";

export const projectGroups: ProjectGroup[] = ["AI", "Robotics", "Data", "Automation"];

export type ProjectImage = { src: string; alt: string; caption?: string };
export type ProjectVideo = {
  type: "youtube" | "vimeo" | "file";
  src: string;
  title: string;
};
export type ProjectFigure = { src: string; alt: string; caption: string };

// All optional and unset for every project today — the site has no real
// media assets yet. These fields exist so images/video can be added later
// without a data-model change; until then, nothing renders (see
// ProjectMediaGrid).
export type ProjectMedia = {
  heroImage?: ProjectImage;
  gallery?: ProjectImage[];
  videos?: ProjectVideo[];
  figures?: ProjectFigure[];
};

export type Project = {
  slug: string;
  name: string;
  category: string;
  groups: ProjectGroup[];
  problem: string;
  build: string;
  technologies: string[];
  // Left unset where the current state isn't established — renders as an
  // editable placeholder rather than an invented status.
  status?: string;
  links: {
    github?: string;
    demo?: string;
    research?: string;
  };
  featured?: boolean;
  media?: ProjectMedia;
};

export const projects: Project[] = [
  {
    slug: "hybrid-adaptive-bci",
    name: "Hybrid Adaptive BCI",
    category: "AI / BCI / Robotics",
    groups: ["AI", "Robotics"],
    problem:
      "Manual control is impractical for users with severe motor impairment, and in industrial settings where hands-free operation is needed.",
    build:
      "M.Sc. thesis engineering a hybrid adaptive Brain-Computer Interface that decodes real-time EEG with deep learning to control industrial robotic manipulators and medical assistive devices.",
    technologies: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "Scikit-learn",
      "BrainFlow",
      "MNE-Python",
      "ROS 2",
      "Gazebo",
    ],
    status: "M.Sc. Thesis · Completed 2026",
    links: {
      github: "",
      demo: "",
      research: "/research/hybrid-adaptive-bci",
    },
    featured: true,
  },
  {
    slug: "ai-job-agent",
    name: "AI Job Agent",
    category: "AI Agents / Automation / Data",
    groups: ["AI", "Automation", "Data"],
    problem:
      "Manually searching, filtering and evaluating job postings across multiple sources doesn't scale.",
    build:
      "An engineering system that combines AI agents, LLM analysis and workflow automation to collect, process and act on job data end-to-end.",
    technologies: ["Python", "LLMs", "AI Agents", "PostgreSQL", "n8n", "APIs"],
    status: "In Progress",
    links: {
      github: "",
      demo: "",
      research: "",
    },
  },
  {
    slug: "ros2-robotics-systems",
    name: "ROS2 Robotics Systems",
    category: "Robotics / ROS2",
    groups: ["Robotics"],
    problem:
      "Bridging AI-driven decision-making with real robot behavior requires a dependable control and simulation layer.",
    build:
      "Robot control and simulation work built on ROS2, exploring intelligent behaviors and human-robot interaction.",
    technologies: ["ROS2", "Python", "Robot Simulation", "Control Systems"],
    status: "In Progress",
    links: {
      github: "",
      demo: "",
      research: "",
    },
  },
  {
    slug: "intelligent-data-pipeline",
    name: "Intelligent Data Pipeline",
    category: "Data Engineering / Python / SQL",
    groups: ["Data"],
    problem:
      "Intelligent systems are only as reliable as the data feeding them — inconsistent pipelines undermine everything built on top.",
    build:
      "A data engineering system for ingesting, processing and serving structured data through reliable, intelligent pipelines.",
    technologies: ["Python", "SQL", "PostgreSQL", "APIs", "ETL"],
    status: "In Progress",
    links: {
      github: "",
      demo: "",
      research: "",
    },
  },
  {
    slug: "jet-engine-simulation",
    name: "Jet Engine Design and Performance Simulation",
    category: "Mechanical Engineering / Simulation",
    groups: [],
    problem:
      "Characterizing a jet engine's efficiency and fuel consumption across operating conditions requires validating a design before physical prototyping.",
    build:
      "B.Sc. graduation project designing a complete jet engine assembly — compressor, combustion chamber, turbine and exhaust — using thermodynamic cycle analysis and fluid mechanics, modelled in CAD and validated with ANSYS and MATLAB simulations.",
    technologies: ["ANSYS", "MATLAB", "CAD", "Thermodynamics", "Fluid Mechanics"],
    status: "B.Sc. Graduation Project · Grade: Excellent · 2014",
    links: {
      github: "",
      demo: "",
      research: "",
    },
  },
];
