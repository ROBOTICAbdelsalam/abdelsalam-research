export type EducationEntry = {
  degree: string;
  institution: string;
  location: string;
  period: string;
  detail: string;
};

// Sourced directly from the CV's Education section.
export const education: EducationEntry[] = [
  {
    degree: "M.Sc., Robotics and Automation",
    institution: "JAMK University of Applied Sciences",
    location: "Jyväskylä, Finland",
    period: "Expected Jul 2026",
    detail:
      "Coursework: AI and Machine Learning for Robotics, Robotics Design and Development, Industrial Robotics and Automation Systems, Embedded Systems and Control Engineering, Robot Perception and Vision Systems, Human-Robot Interaction. Applied robotics research conducted with industry partners in multicultural international engineering teams.",
  },
  {
    degree: "B.Sc., Mechanical Power Engineering",
    institution: "Faculty of Engineering, Zagazig University",
    location: "Zagazig, Egypt",
    period: "May 2014",
    detail:
      "Core disciplines: Thermodynamics, Fluid Mechanics, Heat Transfer, Mechanical Design, Energy Systems, Engineering Simulation and Analysis. Graduation project awarded a grade of Excellent.",
  },
];
