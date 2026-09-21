export type EventType =
  | "Conference"
  | "Workshop"
  | "Seminar"
  | "Meetup"
  | "User Group"
  | "Hackathon"
  | "Talk"
  | "Presentation"
  | "Professional Activity";

export type EventStatus =
  | "Attended"
  | "Participant"
  | "Speaker"
  | "Presenter"
  | "Workshop"
  | "Organizer";

export type EventImage = { src: string; alt: string };

export type EventItem = {
  slug: string;
  title: string;
  // Display date, e.g. "March 2025" or "12 Mar 2025".
  date: string;
  // Used for sorting/grouping — `date` above is free-form for display.
  year: number;
  location: string;
  type: EventType;
  status: EventStatus;
  description: string;
  topics?: string[];
  officialUrl?: string;
  organization?: string;
  image?: EventImage;
};

// Verified attendance only — sourced from the official public event
// listings plus the user's own confirmation of attendance. No speaker,
// presenter or organizer role is claimed for any entry below unless
// independently verified. Ordered most recent first; LatestActivity's
// stable sort (by year) preserves this order for same-year entries.
export const events: EventItem[] = [
  {
    slug: "devops-finland-netlight-september-2026",
    title: "DevOps Finland September meetup",
    date: "21 September 2026 · 17:00–20:30 EEST",
    year: 2026,
    location: "Netlight, Pohjoisesplanadi 33 A, 00100 Helsinki, Finland",
    type: "Meetup",
    status: "Attended",
    description:
      "Attended the DevOps Finland September meetup at Netlight, exploring agentic AI, cloud operations, software development, and the evolving role of AI agents.",
    organization: "DevOps Finland",
    topics: [
      "DevOps",
      "Agentic AI",
      "Cloud Operations",
      "AWS",
      "AI Agents",
      "Software Development",
      "Networking",
    ],
    officialUrl: "https://www.meetup.com/devops-finland/events/316496752/",
  },
  {
    slug: "microsoft-data-platform-user-group-innofactor-september-2026",
    title: "Microsoft Data Platform User Group: In-person September meetup @ Innofactor",
    date: "16 September 2026 · 17:00–20:00 EEST",
    year: 2026,
    location: "Innofactor, Keilaranta 9, 02150 Espoo, Finland",
    type: "User Group",
    status: "Attended",
    description:
      "Attended the Microsoft Data Platform User Group meetup at Innofactor, exploring Microsoft Fabric, data engineering, analytics, AI, and practical approaches to modern data platform workflows.",
    organization: "Microsoft Data Platform User Group – Finland",
    topics: [
      "Microsoft Data Platform",
      "Microsoft Fabric",
      "Data Engineering",
      "Analytics",
      "AI",
      "dbt",
      "Data & AI",
      "Networking",
    ],
    officialUrl:
      "https://www.meetup.com/microsoft-data-platform-user-group-finland/events/316250213/",
  },
  {
    slug: "apiops-helsinki-roasberg-september-2026",
    title: "AI Discovery & API governance",
    date: "15 September 2026 · 17:00–20:00 EEST",
    year: 2026,
    location: "Roasberg, Mikonkatu 13, Helsinki, Finland",
    type: "Meetup",
    status: "Attended",
    description:
      "Attended the APIOps Helsinki meetup exploring AI-driven API discovery, API governance, authorization, and the evolving role of APIs for AI agents.",
    organization: "APIOps Helsinki",
    topics: [
      "AI Agents",
      "APIs",
      "API Governance",
      "OpenAPI",
      "Authorization",
      "Automation",
      "Networking",
    ],
    officialUrl: "https://www.meetup.com/apiops-helsinki/events/316084189/",
  },
  {
    slug: "snowflake-finland-user-group-september-2026",
    title: "Snowflake Finland User Group Meeting",
    date: "8 September 2026",
    year: 2026,
    location: "Etlia Oy, Espoo, Finland",
    type: "Meetup",
    status: "Attended",
    description:
      "Attended the Snowflake Finland User Group meeting at Etlia, covering modern data platforms, real-world Snowflake use cases, data engineering practices, and the role of cloud data infrastructure in AI-driven applications.",
    organization: "Snowflake Finland User Group",
    topics: [
      "Data Platforms",
      "Data Engineering",
      "Snowflake",
      "AI and Machine Learning",
      "Analytics",
      "Cloud Technologies",
      "Networking",
    ],
    officialUrl:
      "https://usergroups.snowflake.com/events/details/snowflake-helsinki-presents-snowflake-finland-user-group-helsinki-september-2026-at-etlia/",
  },
  {
    slug: "powerup-live-meetup-september-2026",
    title: "PowerUp! Live Meetup",
    date: "2 September 2026",
    year: 2026,
    location: "Microsoft Talo, Espoo, Finland",
    type: "Meetup",
    status: "Attended",
    description:
      "Attended PowerUp! Live Meetup in Espoo, an evening session on Microsoft Power Platform, AI and automation, practical use cases, and networking with the Finnish technology community.",
    organization: "PowerUp! Meetup (Finland)",
    topics: ["Microsoft Power Platform", "AI", "Automation", "Digital Transformation", "Networking"],
    officialUrl: "https://www.meetup.com/powerup-meetup-finland/",
  },
  {
    slug: "faug-knowit-august-2026",
    title: "FAUG @ Knowit",
    date: "26 August 2026",
    year: 2026,
    location: "Knowit Oy, Helsinki, Finland",
    type: "Meetup",
    status: "Attended",
    description:
      "Attended a Finland Azure User Group meetup hosted at Knowit in Helsinki, covering a local LLM Bicep code generator, Microsoft Fabric project foundations, Microsoft Azure, and cloud technologies.",
    organization: "Finland Azure User Group",
    topics: ["Microsoft Azure", "Cloud Computing", "Cloud Services", "Local LLMs", "Microsoft Fabric", "AI", "Networking"],
    officialUrl: "https://www.meetup.com/finland-azure-user-group/events/315971802/",
  },
];

export const eventsIntro = {
  title: "Events and Professional Activity",
  subtitle:
    "Conferences, workshops, seminars, meetups, and professional activities connected to my research and engineering journey.",
};
