export interface Problem {
  title: string;
  brief: string;
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
