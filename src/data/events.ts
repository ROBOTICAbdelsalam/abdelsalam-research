export type EventType =
  | "Conference"
  | "Workshop"
  | "Seminar"
  | "Meetup"
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
