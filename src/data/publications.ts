export type Publication = {
  title: string;
  authors: string;
  year: number;
  venue: string;
  abstract: string;
  doi?: string;
  paperUrl?: string;
  codeUrl?: string;
};

export type PublicationCategory =
  | "Journal Papers"
  | "Conference Papers"
  | "Preprints"
  | "Thesis"
  | "Technical Reports";

export const publicationCategories: PublicationCategory[] = [
  "Journal Papers",
  "Conference Papers",
  "Preprints",
  "Thesis",
  "Technical Reports",
];

// Populate this map with entries shaped like the `Publication` type above
// as further work is completed and released — nothing here is fabricated.
export const publications: Record<PublicationCategory, Publication[]> = {
  "Journal Papers": [],
  "Conference Papers": [],
  Preprints: [],
  Thesis: [
    {
      title:
        "Hybrid Adaptive Brain-Computer Interface Using Artificial Intelligence for Controlling Industrial Robots and Medical Assistive Devices",
      authors: "Abdelsalam Ali Abdelsalam Mohamed",
      year: 2026,
      venue: "M.Sc. Thesis, JAMK University of Applied Sciences, Jyväskylä, Finland",
      abstract:
        "Engineers a hybrid adaptive Brain-Computer Interface enabling hands-free, non-invasive EEG control of industrial robotic manipulators and medical assistive devices, combining deep learning (CNN/LSTM) motor-imagery decoding with an online-adaptive layer and a ROS 2 / Gazebo robot control stack, verified through simulation-first testing with a shared-control safety layer.",
      // doi / paperUrl / codeUrl intentionally omitted — not yet available.
    },
  ],
  "Technical Reports": [],
};
