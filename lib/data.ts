import { content, toSummary } from './content';
import { useMongo } from './db';
import { JourneyModel, SectorModel, SubmissionModel } from './models';
import type { JourneyStep, Sector, SectorSummary, SubmissionPayload } from './types';

const memorySubmissions: Array<SubmissionPayload & { createdAt: string }> = [];
const order = content.sectors.map((s) => s.slug);

export async function getSectors(): Promise<SectorSummary[]> {
  if (await useMongo()) {
    const list = await SectorModel.find({}, 'slug name tagline summary -_id').lean();
    return list
      .map((s) => toSummary(s as Sector))
      .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
  }
  return content.sectors.map(toSummary);
}

export async function getSector(slug: string): Promise<Sector | null> {
  if (await useMongo()) {
    return (await SectorModel.findOne({ slug }, '-_id -__v').lean()) as Sector | null;
  }
  return content.sectors.find((s) => s.slug === slug) ?? null;
}

export async function getJourney(): Promise<JourneyStep[]> {
  if (await useMongo()) {
    return (await JourneyModel.find({}, '-_id -__v').sort({ order: 1 }).lean()) as JourneyStep[];
  }
  return content.journey;
}

export async function saveSubmission(doc: SubmissionPayload): Promise<void> {
  if (await useMongo()) await SubmissionModel.create(doc);
  else memorySubmissions.push({ ...doc, createdAt: new Date().toISOString() });
}

export async function storeName(): Promise<'mongodb' | 'memory'> {
  return (await useMongo()) ? 'mongodb' : 'memory';
}
