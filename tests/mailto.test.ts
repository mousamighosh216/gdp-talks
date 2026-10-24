import { describe, expect, it } from 'vitest';
import { approachMailto } from '@/lib/sectors/mailto';
import { content } from '@/lib/sectors/content';

describe('approachMailto', () => {
  it('pre-fills subject and body with the sector and problem', () => {
    const s = content.sectors[1];
    const href = approachMailto(s, s.problems[0]);
    expect(href.startsWith('mailto:')).toBe(true);
    const q = new URLSearchParams(href.split('?')[1]);
    expect(q.get('subject')).toBe(`[GDP Talks] ${s.name}: ${s.problems[0].title}`);
    expect(q.get('body')).toContain(s.problems[0].title);
  });
});
