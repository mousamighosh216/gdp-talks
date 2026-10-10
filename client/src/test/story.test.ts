import { describe, it, expect } from 'vitest';
import { PAIRS, STAGES, STORY, getChatState } from '../lib/story';

describe('story data', () => {
  it('is 14 messages alternating Engineer X and Doc D, grouped into 7 pairs', () => {
    expect(STORY).toHaveLength(14);
    expect(PAIRS).toHaveLength(7);
    for (const [a, b] of PAIRS) {
      expect(a.from).toBe('x');
      expect(b.from).toBe('d');
    }
  });

  it('ends with Engineer X changing his approach and Doc D closing the story', () => {
    expect(STORY[12].text).toMatch(/New plan: deploy a tiny version today/);
    expect(STORY[13].text).toMatch(/Smart people should keep meeting/);
  });
});

describe('getChatState', () => {
  it('never shows more than two messages, at any scroll position', () => {
    for (let i = 0; i <= 1000; i++) {
      expect(getChatState(i / 1000).visible).toBeLessThanOrEqual(2);
    }
  });

  it('only shows the redirect in the final stage', () => {
    for (let i = 0; i <= 1000; i++) {
      const p = i / 1000;
      expect(getChatState(p).showCta).toBe(Math.floor(p * STAGES) >= STAGES - 1);
    }
  });

  it('walks through every pair in order', () => {
    const seen: number[] = [];
    for (let i = 0; i <= 1000; i++) {
      const { pairIndex } = getChatState(i / 1000);
      if (pairIndex !== null && seen[seen.length - 1] !== pairIndex) seen.push(pairIndex);
    }
    expect(seen).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('is empty at the very top and complete at the very bottom', () => {
    expect(getChatState(0)).toEqual({ pairIndex: null, visible: 0, typing: null, showCta: false });
    expect(getChatState(1)).toMatchObject({ pairIndex: 6, visible: 2, showCta: true });
  });
});
