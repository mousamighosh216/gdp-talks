export interface Problem {
  title: string;
  /** one-line summary shown on the card */
  brief: string;
  /** the full, descriptive version shown in the pop-up (paragraphs) */
  description: string[];
  /** what a good solution should achieve */
  goals: string[];
  /** constraints and things to keep in mind */
  considerations: string[];
}

export interface Sector {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  problems: Problem[];
}

export interface JourneyStep {
  order: number;
  title: string;
  summary: string;
  details: string[];
  action: 'register' | null;
}

export interface Content {
  journey: JourneyStep[];
  sectors: Sector[];
}

export interface SubmissionInput {
  sector: string;
  companyName: string;
  email: string;
  question: string;
}
