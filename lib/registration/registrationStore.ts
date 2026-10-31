import { randomBytes } from 'node:crypto';
import { appendRegistration, sheetsConfigured } from '../db/sheets';
import type { RegistrationInput } from './registration';

type Valid = Required<Omit<RegistrationInput, 'website'>>;

export type StoreResult =
  | { ok: true; reference: string }
  | { ok: false; status: 409 | 502 | 503; field?: string; message: string };

/** Short, readable and hard to guess: GDP-7K2M9Q */
export function makeReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(6);
  return `GDP-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

// Used only when Google Sheets is not configured and we're not in production (development and tests).
const memory: Array<{ reference: string; teamName: string; emails: string[] }> = [];
export const memoryRegistrations = () => memory;
export const resetMemoryRegistrations = () => {
  memory.length = 0;
};

const DUPLICATE_TEAM = 'That team name is already registered';
const DUPLICATE_EMAIL = 'This email is already part of a registered team';
const REFERENCE_ATTEMPTS = 2;
const DUPLICATE_REFERENCE = 'We could not generate a unique registration reference. Please try again.';

function saveInMemory(v: Valid, reference: string): StoreResult {
  if (memory.some((r) => r.teamName.toLowerCase() === v.teamName.toLowerCase())) {
    return { ok: false, status: 409, field: 'teamName', message: DUPLICATE_TEAM };
  }
  for (let i = 0; i < v.members.length; i++) {
    if (memory.some((r) => r.emails.includes(v.members[i].email))) {
      return { ok: false, status: 409, field: `members.${i}.email`, message: DUPLICATE_EMAIL };
    }
  }
  memory.push({ reference, teamName: v.teamName, emails: v.members.map((m) => m.email) });
  return { ok: true, reference };
}

export async function saveRegistration(v: Valid): Promise<StoreResult> {
  if (!sheetsConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'Registration is not configured: set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_SHEET_ID'
      );
      return { ok: false, status: 503, message: 'Registration is not open yet. Please try again later.' };
    }

    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt++) {
      const reference = makeReference();
      if (memory.some((registration) => registration.reference === reference)) continue;
      return saveInMemory(v, reference);
    }

    return { ok: false, status: 503, message: DUPLICATE_REFERENCE };
  }

  try {
    for (let attempt = 0; attempt < REFERENCE_ATTEMPTS; attempt++) {
      const reference = makeReference();
      const result = await appendRegistration(reference, v);
      if (result.ok) return { ok: true, reference };
      if (result.duplicate === 'reference') continue;
      return {
        ok: false,
        status: 409,
        field: result.duplicate,
        message: result.duplicate === 'teamName' ? DUPLICATE_TEAM : DUPLICATE_EMAIL,
      };
    }
    return { ok: false, status: 503, message: DUPLICATE_REFERENCE };
  } catch (err) {
    console.error('Google Sheets write failed:', (err as Error).message);
    return { ok: false, status: 502, message: 'We could not save your registration. Please try again.' };
  }
}