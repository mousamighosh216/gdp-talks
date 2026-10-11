import content from '../../../shared/content.json';
import type { JourneyStep, Sector, SubmissionPayload } from '../types';

const BASE = process.env.NEXT_PUBLIC_API_URL || '';

export const REGISTER_URL: string = process.env.NEXT_PUBLIC_REGISTER_URL || 'https://unstop.com/';

const data = content as unknown as { journey: JourneyStep[]; sectors: Sector[] };

// Offline fallbacks so the site renders even when the API is not running.
export const fallbackJourney: JourneyStep[] = data.journey;
export const fallbackSectors: Sector[] = data.sectors;

interface ApiErrorBody {
  error?: string;
  errors?: Record<string, string>;
}

export async function submitQuestion(payload: SubmissionPayload): Promise<void> {
  const res = await fetch(`${BASE}/api/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body: ApiErrorBody = await res.json().catch(() => ({}));
    const first = body.errors ? Object.values(body.errors)[0] : body.error;
    throw new Error(first || 'Could not send your question. Please try again.');
  }
}
