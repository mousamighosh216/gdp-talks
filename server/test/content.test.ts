import { test } from 'node:test';
import assert from 'node:assert/strict';
import { content } from '../content.js';

test('there are 8 sectors with unique slugs', () => {
  const slugs = content.sectors.map((s) => s.slug);
  assert.equal(slugs.length, 8);
  assert.equal(new Set(slugs).size, 8);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('every sector has copy and at least 3 complete problem statements', () => {
  for (const s of content.sectors) {
    assert.ok(s.name && s.tagline && s.summary, `${s.slug} is missing copy`);
    assert.ok(s.problems.length >= 3, `${s.slug} needs 3+ problems`);
    for (const p of s.problems) assert.ok(p.title.trim() && p.brief.trim());
  }
});

test('problem titles are unique within a sector', () => {
  for (const s of content.sectors) {
    const titles = s.problems.map((p) => p.title);
    assert.equal(new Set(titles).size, titles.length, `${s.slug} has duplicate titles`);
  }
});

test('journey runs registration, onboarding, selection with sequential order', () => {
  assert.deepEqual(content.journey.map((j) => j.order), [1, 2, 3]);
  assert.deepEqual(content.journey.map((j) => j.title), [
    'Registration',
    'Onboarding',
    'Selection and refining',
  ]);
  assert.equal(content.journey.filter((j) => j.action === 'register').length, 1);
});
