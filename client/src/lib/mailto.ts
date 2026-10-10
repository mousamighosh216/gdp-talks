import type { Problem, Sector } from '../types';

export const CONTACT_EMAIL: string = import.meta.env.VITE_CONTACT_EMAIL || 'hello@example.com';

/** Builds the "email us your approach" link, pre-filled with the sector and problem. */
export function approachMailto(sector: Sector, problem: Problem, to: string = CONTACT_EMAIL): string {
  const subject = `[GDP Talks] ${sector.name}: ${problem.title}`;
  const body = [
    'Hi GDP Talks team,',
    '',
    `We would like to take on this problem: "${problem.title}" (${sector.name}).`,
    '',
    'How we would solve it:',
    '',
    '',
    'Company:',
    'Contact person:',
    'Anything we should know:',
  ].join('\n');
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
