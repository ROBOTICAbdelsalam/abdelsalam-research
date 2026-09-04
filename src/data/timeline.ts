export type TimelineStage = "past" | "current" | "future";

export type TimelineMilestone = {
  title: string;
  period: string;
  description: string;
  stage: TimelineStage;
};

// Sourced directly from the CV's Education and Professional Experience
// dates — no milestones are inferred or added between them.
export const timeline: TimelineMilestone[] = [
  {
    title: "B.Sc. Mechanical Power Engineering",
    period: "2014",
    description:
      "Graduated from Zagazig University, Faculty of Engineering — graduation project (jet engine design and performance simulation) awarded a grade of Excellent.",
    stage: "past",
  },
  {
    title: "Automation & Robotics Engineering — Egypt Megaproject",
    period: "2015 – 2018",
    description:
      "Delivered automation, I&C and robotic engineering across a 14.4 GW combined-cycle power programme with Siemens Energy Solutions, Orascom Construction and El Sewedy Electric.",
    stage: "past",
  },
  {
    title: "Automation Engineering — Mediterranean Gas Fields",
    period: "2018 – 2021",
    description:
      "Designed and maintained PLC and SCADA systems for offshore gas field processes with the Egyptian Navy, including predictive maintenance and fail-safe control.",
    stage: "past",
  },
  {
    title: "Robotics Engineering — SMART Robotics",
    period: "2021 – 2023",
    description:
      "Led development of industrial robotic systems across Egypt and the Netherlands, integrating machine learning into robotic decision-making and commissioning autonomous mobile robot fleets.",
    stage: "past",
  },
  {
    title: "M.Sc. Robotics and Automation — JAMK University of Applied Sciences",
    period: "2026",
    description:
      "Completing an M.Sc. in Robotics and Automation at JAMK University of Applied Sciences, Finland, specialized in artificial intelligence for robotics.",
    stage: "current",
  },
  {
    title: "Hybrid Adaptive BCI — Research / Thesis",
    period: "2026",
    description:
      "M.Sc. thesis engineering a hybrid adaptive Brain-Computer Interface that decodes real-time EEG with deep learning to control industrial robotic manipulators and medical assistive devices.",
    stage: "current",
  },
];
