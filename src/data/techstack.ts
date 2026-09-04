export type TechCategory = {
  title: string;
  items: string[];
};

// Sourced from the CV's Technical Skills section. These are listed as
// skills and tools used, not claims of professional mastery — and SQL is
// kept explicitly "(basic)" since that's how the CV itself frames it.
export const techStack: TechCategory[] = [
  {
    title: "AI & ML",
    items: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "Keras",
      "Scikit-learn",
      "NumPy",
      "Pandas",
      "CNN",
      "LSTM / RNN",
      "Transformers",
      "Reinforcement Learning",
      "Computer Vision",
      "Object Detection",
    ],
  },
  {
    title: "Robotics",
    items: [
      "ROS 2",
      "Gazebo",
      "Isaac Sim",
      "MuJoCo",
      "CoppeliaSim",
      "Motion Planning",
      "Navigation",
      "SLAM",
      "Universal Robots",
      "Autonomous Mobile Robots",
    ],
  },
  {
    title: "Industrial Automation",
    items: [
      "Siemens SIMATIC",
      "Allen-Bradley",
      "PLC",
      "SCADA",
      "HMI",
      "Instrumentation & Control",
      "Predictive Maintenance",
      "IIoT",
      "Machine Safety",
    ],
  },
  {
    title: "Data",
    items: ["SQL (basic)", "Python", "Pandas", "NumPy", "APIs", "Data Processing"],
  },
  {
    title: "AI Agents & Automation",
    items: ["n8n", "AI Agents", "Prompt Engineering", "RAG", "APIs"],
  },
  {
    title: "Engineering",
    items: ["Git", "GitHub", "Linux", "Docker", "VS Code", "C++", "MATLAB"],
  },
];
