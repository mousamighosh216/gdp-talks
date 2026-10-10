import { describe, expect, it } from 'vitest';
import { fallbackSectors } from '../lib/api';
import { approachMailto } from '../lib/mailto';

describe('problem statement content', () => {
  const problems = fallbackSectors.flatMap((s) => s.problems.map((p) => ({ sector: s.slug, p })));

  it('covers 24 problems (3 per sector)', () => {
    expect(problems).toHaveLength(24);
  });

  it('gives every problem a descriptive pop-up: 2+ paragraphs, 3 goals, 3 things to keep in mind', () => {
    for (const { sector, p } of problems) {
      const where = `${sector}: ${p.title}`;
      expect(p.description.length, where).toBeGreaterThanOrEqual(2);
      expect(p.goals.length, where).toBeGreaterThanOrEqual(3);
      expect(p.considerations.length, where).toBeGreaterThanOrEqual(3);
      for (const text of [...p.description, ...p.goals, ...p.considerations]) {
        expect(text.trim().length, where).toBeGreaterThan(10);
      }
    }
  });

  it('keeps the card summary short and the pop-up description much longer', () => {
    for (const { sector, p } of problems) {
      const words = p.description.join(' ').split(/\s+/).length;
      expect(p.brief.split(/\s+/).length, sector).toBeLessThan(30);
      expect(words, `${sector}: ${p.title}`).toBeGreaterThan(p.brief.split(/\s+/).length * 2);
    }
  });
});

describe('approachMailto', () => {
  const sector = fallbackSectors[0];
  const problem = sector.problems[0];

  it('addresses the contact email with the sector and problem in the subject', () => {
    const href = approachMailto(sector, problem, 'team@example.org');
    expect(href.startsWith('mailto:team@example.org?')).toBe(true);
    const q = new URLSearchParams(href.split('?')[1]);
    expect(q.get('subject')).toBe(`[GDP Talks] ${sector.name}: ${problem.title}`);
  });

  it('pre-fills a body that asks for the approach, company and contact person', () => {
    const q = new URLSearchParams(approachMailto(sector, problem).split('?')[1]);
    const body = q.get('body')!;
    expect(body).toContain(problem.title);
    expect(body).toContain('How we would solve it:');
    expect(body).toContain('Company:');
    expect(body).toContain('Contact person:');
  });

  it('escapes special characters so the link is not broken', () => {
    const tricky = { ...problem, title: 'Cost & speed: "fast" or cheap? #1' };
    const href = approachMailto(sector, tricky);
    expect(href).not.toMatch(/[ "#]/);
    const q = new URLSearchParams(href.split('?')[1]);
    expect(q.get('subject')).toContain('Cost & speed: "fast" or cheap? #1');
  });
});
