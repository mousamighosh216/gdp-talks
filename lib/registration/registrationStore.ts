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
  const reference = makeReference();

  if (!sheetsConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        'Registration is not configured: set GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY and GOOGLE_SHEET_ID'
      );
      return { ok: false, status: 503, message: 'Registration is not open yet. Please try again later.' };
    }
    return saveInMemory(v, reference);
  }

  try {
    const result = await appendRegistration(reference, v);
    if (result.ok) return { ok: true, reference };
    return {
      ok: false,
      status: 409,
      field: result.duplicate,
      message: result.duplicate === 'teamName' ? DUPLICATE_TEAM : DUPLICATE_EMAIL,
    };
  } catch (err) {
    console.error('Google Sheets write failed:', (err as Error).message);
    return { ok: false, status: 502, message: 'We could not save your registration. Please try again.' };
  }
}