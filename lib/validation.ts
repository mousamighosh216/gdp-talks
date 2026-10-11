import { content } from './content';
import type { SubmissionPayload } from './types';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ValidationResult =
  | { ok: true; value: SubmissionPayload }
  | { ok: false; errors: Record<string, string> };

export function validateSubmission(body: unknown): ValidationResult {
  const { sector, companyName, email, question } = (body ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};

  if (typeof sector !== 'string' || !content.sectors.some((s) => s.slug === sector)) {
    errors.sector = 'Unknown sector';
  }
  if (typeof companyName !== 'string' || !companyName.trim() || companyName.length > 120) {
    errors.companyName = 'Company name is required (max 120 characters)';
  }
  if (typeof email !== 'string' || !EMAIL.test(email) || email.length > 200) {
    errors.email = 'A valid email is required';
  }
  if (typeof question !== 'string' || question.trim().length < 10 || question.length > 2000) {
    errors.question = 'Describe your problem in 10 to 2000 characters';
  }
  if (Object.keys(errors).length) return { ok: false, errors };

  return {
    ok: true,
    value: {
      sector: sector as string,
      companyName: (companyName as string).trim(),
      email: (email as string).trim().toLowerCase(),
      question: (question as string).trim(),
    },
  };
}
