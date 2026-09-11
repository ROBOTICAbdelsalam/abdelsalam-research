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

// No real event data has been supplied yet. This list is intentionally
// empty — do not populate it with invented conferences, talks or
// attendance. Add entries here only once real, confirmed event
// information is available.
export const events: EventItem[] = [];

export const eventsIntro = {
  title: "Events & Professional Activity",
  subtitle:
    "Conferences, workshops, seminars, meetups, and professional activities connected to my research and engineering journey.",
};
