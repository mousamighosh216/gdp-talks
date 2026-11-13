import { randomBytes } from 'node:crypto';
import { appendTalksRegistration, sheetsConfigured } from '../db/sheets';
import type { EventRegistration } from './eventregistration';

type Valid = Required<EventRegistration>;

export type StoreResult =
  | { ok: true; reference: string }
  | { ok: false; status: 409 | 502 | 503; field?: string; message: string };

/** Short, readable and hard to guess: GDP-7K2M9 */
export function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(5);
  return `GDP-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

const DUPLICATE_EMAIL = 'This email is already used for a Peer-Talks registration';
const INVALID_TALKS_ID = 'Enter a valid GDP Talks reference ID';

export async function saveEventRegistration(m: Valid): Promise<StoreResult> {
  if (!sheetsConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'Registration is not configured: set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_SHEET_ID'
      );
      return { ok: false, status: 503, message: 'Registration is not open yet. Please try again later.' };
    }
  }

  try {
    const reference = makeReference();
    const result = await appendTalksRegistration(reference, m);
    if (result.ok) return { ok: true, reference };
    return {
        ok: false,
        status: 409,
        field: result.duplicate,
        message: result.duplicate === 'email' ? DUPLICATE_EMAIL : INVALID_TALKS_ID,
    };
  } catch (err) {
    console.error('Google Sheets write failed:', (err as Error).message);
    return { ok: false, status: 502, message: 'We could not save your registration. Please try again.' };
  }
}