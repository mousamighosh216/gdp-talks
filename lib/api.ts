import type { SubmissionPayload } from './types';

export const REGISTER_URL: string = process.env.NEXT_PUBLIC_REGISTER_URL || 'https://unstop.com/';

interface ApiErrorBody {
  error?: string;
  errors?: Record<string, string>;
}

export async function submitQuestion(payload: SubmissionPayload): Promise<void> {
  const res = await fetch('/api/submissions', {
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
