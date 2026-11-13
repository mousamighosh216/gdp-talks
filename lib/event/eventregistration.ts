export interface EventRegistration {
  name: string;
  email: string;
  phone: string;
  eventDescription: string;
  eventTakeway: string;
  documentLinks: string;
  consent: boolean;
}

export type FieldErrors = Record<string, string>;

export type RegistrationResult =
  | { ok: true; value: Required<EventRegistration> }
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
const wordCount = (value: string) => (value ? value.split(' ').length : 0);

export function validateRegistration(body: unknown): RegistrationResult {
  const raw = (body ?? {}) as Record<string, unknown>;
  const errors: FieldErrors = {};

  const name = clean(raw.name);
  const email = clean(raw.email).toLowerCase();
  const phone = normalizePhone(typeof raw.phone === 'string' ? raw.phone : '');
  const eventDescription = clean(raw.eventDescription);
  const eventTakeway = clean(raw.eventTakeway);
  const documentLinks = clean(raw.documentLinks);

  const validNamePattern = /^[\p{L} ]+$/u;

  if (wordCount(eventDescription) < 50) {
    errors.eventDescription = 'Description must contain at least 50 words';
  }
  if (wordCount(eventTakeway) < 20) {
    errors.eventTakeway = 'Takeaway must contain at least 20 words';
  }
  if (documentLinks.length === 0) {
    errors.documentLinks = 'Document Links section can\'t be empty';
  }
  if (name.length < 2 || name.length > 80 || !validNamePattern.test(name)) errors.name = 'Enter the full name';
  if (!EMAIL.test(email) || email.length > 200) errors.email = 'Enter a valid email';
  if (!phone) errors.phone = 'Enter a 10 digit mobile number';
    

  if (raw.consent !== true) errors.consent = 'Please confirm the declaration to continue';

  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { name, email, phone, eventDescription, eventTakeway, documentLinks, consent: true},
  };
}

