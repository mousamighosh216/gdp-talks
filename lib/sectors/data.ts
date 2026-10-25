import { content, toSummary } from './content';
import type { JourneyStep, Sector, SectorSummary, SubmissionPayload } from '../types';

const memorySubmissions: Array<SubmissionPayload & { createdAt: string }> = [];

export async function getSectors(): Promise<SectorSummary[]> {
  return content.sectors.map(toSummary);
}

export async function getSector(slug: string): Promise<Sector | null> {
  return content.sectors.find((s) => s.slug === slug) ?? null;
}

export async function getJourney(): Promise<JourneyStep[]> {
  return content.journey;
}

export async function saveSubmission(doc: SubmissionPayload): Promise<void> {
  memorySubmissions.push({ ...doc, createdAt: new Date().toISOString() });
}

export async function storeName(): Promise<'memory'> {
  return 'memory';
}
