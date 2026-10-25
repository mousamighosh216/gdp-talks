// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMail } = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail }),
  },
}));

import { GET as health } from '@/app/api/health/route';
import { GET as sectors } from '@/app/api/sectors/route';
import { GET as sector } from '@/app/api/sectors/[slug]/route';
import { GET as journey } from '@/app/api/journey/route';
import { POST as submit } from '@/app/api/submissions/route';
import { resetRateLimit, rateLimit } from '@/lib/registration/rateLimit';

const json = async (res: Response) => (await res.json()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
const post = (body: unknown, raw = false, ip = '1.1.1.1') =>
  submit(
    new Request('http://x/api/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
      body: raw ? (body as string) : JSON.stringify(body),
    })
  );
const valid = {
  sector: 'gaming',
  companyName: 'Acme Games',
  email: 'Hello@Acme.com',
  question: 'How do we keep new players for more than one session?',
};

beforeEach(() => {
  resetRateLimit();
  sendMail.mockClear();
});

describe('GET routes', () => {
  it('health reports the in-memory store', async () => {
    const res = await health();
    expect(res.status).toBe(200);
    expect(await json(res)).toEqual({ ok: true, db: 'memory' });
  });

  it('lists all 8 sectors in order without problem details', async () => {
    const list = await json(await sectors());
    expect(list.map((s: { slug: string }) => s.slug)).toEqual([
      'devtools', 'fashion', 'services', 'product-services',
      'ed-tech', 'inference-providers', 'gaming', 'd2c-brands',
    ]);
    expect(list.every((s: object) => !('problems' in s))).toBe(true);
  });

  it('returns a sector with full problem details', async () => {
    const res = await sector(new Request('http://x'), { params: Promise.resolve({ slug: 'gaming' }) });
    const body = await json(res);
    expect(body.problems).toHaveLength(3);
    for (const p of body.problems) {
      expect(p.description.length).toBeGreaterThanOrEqual(2);
      expect(p.goals.length).toBeGreaterThanOrEqual(3);
      expect(p.considerations.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('returns 404 for an unknown sector', async () => {
    const res = await sector(new Request('http://x'), { params: Promise.resolve({ slug: 'nope' }) });
    expect(res.status).toBe(404);
    expect((await json(res)).error).toBe('Sector not found');
  });

  it('returns the journey in order, registration first', async () => {
    const steps = await json(await journey());
    expect(steps.map((s: { order: number }) => s.order)).toEqual([1, 2, 3]);
    expect(steps[0].action).toBe('register');
  });
});

describe('POST /api/submissions', () => {
  it('accepts a valid submission', async () => {
    const res = await post(valid);
    expect(res.status).toBe(201);
    expect(await json(res)).toEqual({ ok: true });
    expect(sendMail).toHaveBeenCalledOnce();
  });

  it('rejects an empty body with an error for every field', async () => {
    const res = await post({});
    expect(res.status).toBe(400);
    expect(Object.keys((await json(res)).errors).sort()).toEqual(['companyName', 'email', 'question', 'sector']);
  });

  it.each([
    ['unknown sector', { sector: 'crypto' }, 'sector'],
    ['blank company', { companyName: '   ' }, 'companyName'],
    ['bad email', { email: 'a@b' }, 'email'],
    ['short question', { question: 'too short' }, 'question'],
    ['long question', { question: 'x'.repeat(2001) }, 'question'],
  ])('rejects %s', async (_n, patch, field) => {
    const res = await post({ ...valid, ...patch });
    expect(res.status).toBe(400);
    expect((await json(res)).errors[field]).toBeTruthy();
  });

  it('rejects non-string values instead of crashing', async () => {
    const res = await post({ sector: ['gaming'], companyName: { $ne: null }, email: 123, question: null });
    expect(res.status).toBe(400);
  });

  it('rejects malformed JSON with a 400', async () => {
    const res = await post('{not json', true);
    expect(res.status).toBe(400);
    expect(await json(res)).toEqual({ error: 'Invalid JSON' });
  });

  it('rate limits one address after 20 submissions, not others', async () => {
    for (let i = 0; i < 20; i++) expect((await post(valid, false, '9.9.9.9')).status).toBe(201);
    const blocked = await post(valid, false, '9.9.9.9');
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBeTruthy();
    expect((await post(valid, false, '8.8.8.8')).status).toBe(201);
  });
});

describe('rateLimit', () => {
  it('starts a new window after 15 minutes', () => {
    const t = 1_000_000;
    for (let i = 0; i < 21; i++) rateLimit('k', t);
    expect(rateLimit('k', t).ok).toBe(false);
    expect(rateLimit('k', t + 15 * 60 * 1000 + 1).ok).toBe(true);
  });
});
