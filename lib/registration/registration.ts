export const MIN_MEMBERS = 2;
export const MAX_MEMBERS = 3;

export interface MemberInput {
  name: string;
  email: string;
  /** 10 digit Indian mobile number, without the +91 */
  phone: string;
  website?: string;
}

export interface RegistrationInput {
  teamName: string;
  institution: string;
  members: MemberInput[];
  consent: boolean;
}

export type FieldErrors = Record<string, string>;

export type RegistrationResult =
  | { ok: true; value: Required<Omit<RegistrationInput, 'website'>> }
  | { ok: false; errors: FieldErrors };

// simple regex 
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Accepts "98765 43210", "+91 98765 43210" or "09876543210" and returns the 10 digits, or ''. */
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');

/** Roles shown on the form and written to the sheet. */
export const roleLabel = (i: number) => (i === 0 ? 'Team lead' : `Member ${i + 1}`);

export function validateRegistration(body: unknown): RegistrationResult {
  const raw = (body ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const validNamePattern = /^[\p{L} ]+$/u;

  const teamName = clean(raw.teamName);
  const institution = clean(raw.institution);
  if (teamName.length < 2 || teamName.length > 60 || !validNamePattern.test(teamName)) {
    errors.teamName = 'Team name must be 2 to 60 characters and contain only letters and spaces';
  }
  if (institution.length < 2 || institution.length > 120 || !validNamePattern.test(institution)) {
    errors.institution = 'College or university name must be 2 to 120 characters and contain only letters and spaces';;
  }

  const list = Array.isArray(raw.members) ? raw.members : [];
  if (list.length < MIN_MEMBERS || list.length > MAX_MEMBERS) {
    errors.members = `A team has ${MIN_MEMBERS} to ${MAX_MEMBERS} members`;
  }

  const members: MemberInput[] = list.slice(0, MAX_MEMBERS).map((m, i) => {
    const r = (m ?? {}) as Record<string, unknown>;
    const name = clean(r.name);
    const email = clean(r.email).toLowerCase();
    const phone = normalizePhone(typeof r.phone === 'string' ? r.phone : '');
    if (name.length < 2 || name.length > 80 || !validNamePattern.test(name)) errors[`members.${i}.name`] = 'Enter the full name';
    if (!EMAIL.test(email) || email.length > 200) errors[`members.${i}.email`] = 'Enter a valid email';
    if (!phone) errors[`members.${i}.phone`] = 'Enter a 10 digit mobile number';
    return { name, email, phone };
  });

  const seenEmail = new Map<string, number>();
  const seenPhone = new Map<string, number>();
  members.forEach((m, i) => {
    if (m.email && seenEmail.has(m.email) && !errors[`members.${i}.email`]) {
      errors[`members.${i}.email`] = `Same email as ${roleLabel(seenEmail.get(m.email)!)}`;
    } else if (m.email) seenEmail.set(m.email, i);
    if (m.phone && seenPhone.has(m.phone) && !errors[`members.${i}.phone`]) {
      errors[`members.${i}.phone`] = `Same number as ${roleLabel(seenPhone.get(m.phone)!)}`;
    } else if (m.phone) seenPhone.set(m.phone, i);
  });

  if (raw.consent !== true) errors.consent = 'Please confirm the declaration to continue';

  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { teamName, institution, members, consent: true } };
}

export function sheetSafe(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

/** One row per team. Column order must match google-apps-script/Code.gs. */
export function toSheetPayload(v: Required<Omit<RegistrationInput, 'website'>>) {
  return {
    teamName: sheetSafe(v.teamName),
    institution: sheetSafe(v.institution),
    memberCount: v.members.length,
    members: v.members.map((m) => ({
      name: sheetSafe(m.name),
      email: sheetSafe(m.email),
      phone: sheetSafe(`+91${m.phone}`),
    })),
  };
}
