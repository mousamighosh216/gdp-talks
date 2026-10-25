import raw from '@/content/content.json';
import type { JourneyStep, Sector, SectorSummary } from '../types';

// Single source of truth for sectors, problem statements and the student journey.
const data = raw as unknown as { journey: JourneyStep[]; sectors: Sector[] };

export const content = data;

export const toSummary = ({ slug, name, tagline, summary }: Sector): SectorSummary => ({
  slug,
  name,
  tagline,
  summary,
});
