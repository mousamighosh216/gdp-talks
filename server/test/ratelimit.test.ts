import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, json, validSubmission, type TestServer } from './helpers.js';

// Kept in its own file so the limiter state does not leak into other suites
// (node --test runs each file in a separate process).
let api: TestServer;
before(async () => {
  api = await startServer();
});
after(() => api.close());

test('limits submissions to 20 per window, then answers 429', async () => {
  for (let i = 0; i < 20; i++) {
    const res = await api.post('/submissions', validSubmission);
    assert.equal(res.status, 201, `request ${i + 1} should pass`);
  }
  const blocked = await api.post('/submissions', validSubmission);
  assert.equal(blocked.status, 429);
  assert.match((await json(blocked)).error, /Too many submissions/);
});

test('reading content is not rate limited', async () => {
  for (let i = 0; i < 30; i++) {
    assert.equal((await api.get('/sectors')).status, 200);
  }
});
