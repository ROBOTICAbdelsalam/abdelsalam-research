// Central site configuration.
// Source of truth: Abdelsalam's CV. Do not add facts here that the CV
// doesn't support — bracketed placeholders below are intentional and
// should stay that way until real values are supplied.

export const siteConfig = {
  name: "Abdelsalam",
  fullName: "Abdelsalam Ali Abdelsalam Mohamed",
  title: "AI & Robotics Engineer",
  // Primary current positioning — used as the Hero eyebrow and the Open
  // Graph image. Industrial Automation is real, historical experience (see
  // engineeringCapabilities in data/research.ts and the About timeline) but
  // deliberately doesn't lead here, since AI, Robotics and Intelligent
  // Systems are the current specialization this site represents.
  positioning: "Artificial Intelligence · Robotics · Intelligent Systems",
  tagline: "Researcher • Builder • AI Systems",
  // Hero-only copy (rendered in Hero.tsx). Split into three pieces so the
  // four-word statement can be styled as the visual focal point.
  heroLead: "I build intelligent systems that",
  // Non-breaking spaces bind each "·" to the word before it, so a line
  // break (e.g. on narrow screens) never strands a separator at line start.
  heroFocus: "PERCEIVE · LEARN · DECIDE · ACT.",
  heroSupporting:
    "Connecting Artificial Intelligence, Robotics, and Data to build intelligent machines and autonomous systems that move intelligence into the physical world.",

  // Base URL used for canonical links, sitemap, robots and Open Graph tags.
  // TODO: replace with your production domain before deploying.
  url: "https://abdelsalam-research.vercel.app",

  description:
    "Abdelsalam Ali Abdelsalam Mohamed is an AI & Robotics Engineer with 8+ years in industrial robotics, automation and control, completing an M.Sc. in Robotics and Automation and researching adaptive brain-computer interfaces for industrial and medical robotics.",

  keywords: [
    "Abdelsalam",
    "Abdelsalam Ali Abdelsalam Mohamed",
    "AI & Robotics Engineer",
    "Robotics Engineer",
    "Automation Engineer",
    "Brain-Computer Interfaces",
    "Artificial Intelligence",
    "Industrial Automation",
    "PLC",
    "SCADA",
    "ROS 2",
    "Machine Learning",
    "EEG",
    "Collaborative Robots",
    "Autonomous Mobile Robots",
    "JAMK University of Applied Sciences",
    "AI Agents",
  ],

  // Confirmed public contact details.
  email: "abdelsalam.robotic.ai@outlook.com",
  phone: "+358 45 867 0063",

  // General location only (from the CV) — no street address is published.
  location: "Helsinki, Finland",

  // Present in the CV as "[SPECIFY - e.g. Finnish residence permit holder,
  // eligible to work in the EU]". Left as an editable placeholder and not
  // rendered anywhere in the UI until a real value is supplied.
  workAuthorization: "Add work authorization status",

  links: {
    github: "https://github.com/ROBOTICAbdelsalam",
    // Not present in the CV. Fill in to make the link appear.
    googleScholar: "",
    // Not present in the CV. Fill in to make the link appear.
    orcid: "",
    linkedin: "https://linkedin.com/in/abdelsalam-mohamed-5b4421344",
  },

  cvPath: "/cv/Abdelsalam-CV.pdf",
} as const;

// Hero credential strip — four facts only, each directly from the CV.
export const heroCredentials = [
  {
    value: "8+ Years",
    label: "Robotics & Automation",
    description: "Engineering Experience",
  },
  {
    value: "B.Sc.",
    label: "Mechanical Power Engineering",
    description: "Zagazig University",
  },
  {
    value: "M.Sc.",
    label: "Robotics & Automation",
    description: "JAMK University of Applied Sciences",
  },
  {
    value: "AI + Robotics",
    label: "Research & Engineering",
    description: "Intelligent Systems",
  },
] as const;

export const navigation = [
  { label: "Home", href: "/" },
  { label: "Research", href: "/research" },
  { label: "Projects", href: "/projects" },
  { label: "AI Lab", href: "/ai-lab" },
  { label: "Publications", href: "/publications" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "CV", href: "/cv" },
  { label: "Contact", href: "/contact" },
] as const;
