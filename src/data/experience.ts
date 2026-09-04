export type ExperienceMetric = {
  value: string;
  label: string;
};

// The same six figures already shown per-role above, surfaced together as
// a compact metric panel. Values are exactly as documented on the CV.
export const experienceMetrics: ExperienceMetric[] = [
  { value: "30%", label: "Operating cost reduction" },
  { value: "25%", label: "Throughput increase" },
  { value: "40%", label: "Material handling time reduction" },
  { value: "20%", label: "Downtime reduction" },
  { value: "15%", label: "Productivity improvement" },
  { value: "30%", label: "Maintenance-time reduction" },
];

export type ExperienceEntry = {
  title: string;
  company: string;
  location: string;
  period: string;
  achievements: string[];
  // Standout, documented metrics from the CV — surfaced as badges.
  highlights: string[];
};

// Sourced directly from the CV's Professional Experience section.
// Figures are as documented on the CV — not recalculated or estimated.
export const experience: ExperienceEntry[] = [
  {
    title: "Robotics Engineer",
    company: "SMART Robotics",
    location: "Egypt & Netherlands",
    period: "Aug 2021 – Jul 2023",
    highlights: ["30% cost reduction", "25% throughput increase", "40% material handling time reduction"],
    achievements: [
      "Led design and development of industrial robotic systems automating material handling, packaging and quality control for manufacturing, logistics and healthcare clients across two countries.",
      "Deployed robotic automation that reduced client operating costs by 30% and raised throughput by 25%; delivered an AI-driven logistics robotics project cutting material handling time by 40% while improving order accuracy.",
      "Integrated machine learning models into robotic decision-making pipelines, enabling perception-driven task selection and adaptive behaviour in unstructured production environments.",
      "Programmed industrial robotic arms, collaborative robots and autonomous mobile robots (AMRs), commissioning AMR fleets in warehouses across Egypt and the Netherlands.",
      "Executed rigorous testing, validation and performance benchmarking of robotic cells to certify functionality, precision and safety before production handover.",
    ],
  },
  {
    title: "Automation Engineer",
    company: "Egyptian Navy — Mediterranean Gas Fields",
    location: "Egypt",
    period: "Nov 2018 – Jul 2021",
    highlights: ["20% downtime reduction", "15% productivity improvement"],
    achievements: [
      "Designed, programmed and maintained PLC (Siemens, Allen-Bradley) and SCADA systems controlling offshore gas field processes in a safety-critical, regulated environment.",
      "Implemented predictive maintenance using AI and IIoT sensor telemetry to anticipate equipment failure, reducing operational downtime by 20%.",
      "Engineered and commissioned a fully automated control system for a high-complexity industrial process, improving productivity by 15%.",
      "Designed fail-safe mechanisms and integrated real-time monitoring, certifying compliance with industry safety standards and offshore regulations; trained operations staff on new automation technology.",
    ],
  },
  {
    title: "Automation & Robotics Engineer",
    company: "Egypt Megaproject — Siemens Energy Solutions, with Orascom Construction & El Sewedy Electric",
    location: "New Administrative Capital, Burullus & Beni Suef, Egypt",
    period: "Aug 2015 – Oct 2018",
    highlights: ["14.4 GW programme", "30% maintenance-time reduction"],
    achievements: [
      "Delivered automation, I&C and robotic engineering across three 4,800 MW combined-cycle power stations totalling 14.4 GW — the largest combined-cycle programme ever built, completed in a record 27.5 months.",
      "Designed and deployed robotic systems for inspection, maintenance and condition monitoring of turbines, generators and auxiliary equipment, cutting maintenance time by 30%.",
      "Deployed robotic inspection into hazardous high-temperature zones previously requiring human entry, materially reducing personnel exposure to unsafe environments.",
      "Programmed and optimized PLC and SCADA systems for automated control of critical plant processes, integrating robotics with Siemens control architecture.",
      "Executed gas turbine synchronization testing and led planning, execution and documentation of electrical and I&C scope, including vibration diagnosis and GT performance test reporting.",
    ],
  },
];
