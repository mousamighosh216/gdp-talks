import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, json, validSubmission, type TestServer } from './helpers.js';

describe('API', () => {
  let api: TestServer;
  before(async () => {
    api = await startServer();
  });
  after(() => api.close());

  test('GET /health reports the in-memory store', async () => {
    const res = await api.get('/health');
    assert.equal(res.status, 200);
    assert.deepEqual(await json(res), { ok: true, db: 'memory' });
  });

  test('GET /sectors lists all 8 sectors in order, without problem details', async () => {
    const res = await api.get('/sectors');
    const list = await json<Array<Record<string, unknown>>>(res);
    assert.equal(res.status, 200);
    assert.deepEqual(
      list.map((s) => s.slug),
      [
        'devtools',
        'fashion',
        'services',
        'product-services',
        'ed-tech',
        'inference-providers',
        'gaming',
        'd2c-brands',
      ]
    );
    assert.ok(list.every((s) => s.name && s.tagline && !('problems' in s)));
  });

  test('GET /sectors/:slug returns the sector with its problem statements', async () => {
    const res = await api.get('/sectors/ed-tech');
    const sector = await json(res);
    assert.equal(res.status, 200);
    assert.equal(sector.name, 'Ed Tech');
    assert.equal(sector.problems.length, 3);
    assert.ok(sector.problems.every((p: { title: string; brief: string }) => p.title && p.brief));
  });

  test('GET /sectors/:slug returns 404 for an unknown sector', async () => {
    const res = await api.get('/sectors/does-not-exist');
    assert.equal(res.status, 404);
    assert.equal((await json(res)).error, 'Sector not found');
  });

  test('GET /journey returns the three steps in order, registration first', async () => {
    const steps = await json<Array<{ order: number; title: string; action: string | null; details: string[] }>>(
      await api.get('/journey')
    );
    assert.deepEqual(steps.map((s) => s.order), [1, 2, 3]);
    assert.equal(steps[0].title, 'Registration');
    assert.equal(steps[0].action, 'register');
    assert.ok(steps.every((s) => s.details.length > 0));
  });

  test('unknown API routes return a JSON 404', async () => {
    const res = await api.get('/nope');
    assert.equal(res.status, 404);
    assert.deepEqual(await json(res), { error: 'Not found' });
  });

  test('sends security headers', async () => {
    const res = await api.get('/health');
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  });
});

describe('POST /submissions', () => {
  let api: TestServer;
  before(async () => {
    api = await startServer();
  });
  after(() => api.close());

  test('accepts a valid submission', async () => {
    const res = await api.post('/submissions', validSubmission);
    assert.equal(res.status, 201);
    assert.deepEqual(await json(res), { ok: true });
  });

  test('rejects an empty body with an error for every field', async () => {
    const res = await api.post('/submissions', {});
    const body = await json(res);
    assert.equal(res.status, 400);
    assert.deepEqual(Object.keys(body.errors).sort(), [
      'companyName',
      'email',
      'question',
      'sector',
    ]);
  });

  test('rejects an unknown sector', async () => {
    const res = await api.post('/submissions', { ...validSubmission, sector: 'crypto' });
    assert.equal(res.status, 400);
    assert.ok((await json(res)).errors.sector);
  });

  test('rejects a blank company name', async () => {
    const res = await api.post('/submissions', { ...validSubmission, companyName: '   ' });
    assert.equal(res.status, 400);
    assert.ok((await json(res)).errors.companyName);
  });

  for (const email of ['plain', 'a@b', '@acme.com', 'a b@acme.com']) {
    test(`rejects invalid email "${email}"`, async () => {
      const res = await api.post('/submissions', { ...validSubmission, email });
      assert.equal(res.status, 400);
      assert.ok((await json(res)).errors.email);
    });
  }

  test('rejects a question that is too short', async () => {
    const res = await api.post('/submissions', { ...validSubmission, question: 'too short' });
    assert.equal(res.status, 400);
    assert.ok((await json(res)).errors.question);
  });

  test('rejects a question over 2000 characters', async () => {
    const res = await api.post('/submissions', { ...validSubmission, question: 'x'.repeat(2001) });
    assert.equal(res.status, 400);
    assert.ok((await json(res)).errors.question);
  });

  test('rejects non-string values instead of crashing', async () => {
    const res = await api.post('/submissions', {
      sector: ['gaming'],
      companyName: { $ne: null },
      email: 123,
      question: null,
    });
    assert.equal(res.status, 400);
  });

  test('rejects malformed JSON with a 400', async () => {
    const res = await api.post('/submissions', '{not json', true);
    assert.equal(res.status, 400);
    assert.deepEqual(await json(res), { error: 'Invalid JSON' });
  });
});
