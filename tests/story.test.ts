import { describe, it, expect } from 'vitest';
import { STORY, getChatState } from '@/lib/story';

describe('story data', () => {
  it('is 14 messages alternating Engineer X and Doc D, starting with Engineer X', () => {
    expect(STORY).toHaveLength(14);
    STORY.forEach((m, i) => expect(m.from).toBe(i % 2 === 0 ? 'x' : 'd'));
  });

  it('ends with Engineer X changing his approach and Doc D closing the story', () => {
    expect(STORY[12].text).toMatch(/New plan: deploy a tiny version today/);
    expect(STORY[13].text).toMatch(/Smart people should keep meeting/);
  });
});

describe('getChatState', () => {
  it('shows nothing at the very top and the last message with the redirect at the very bottom', () => {
    expect(getChatState(0)).toEqual({ index: null, showCta: false });
    expect(getChatState(1)).toEqual({ index: STORY.length - 1, showCta: true });
  });

  it('walks through every message once, in order, one at a time', () => {
    const seen: number[] = [];
    for (let i = 0; i <= 2000; i++) {
      const { index } = getChatState(i / 2000);
      if (index !== null && seen[seen.length - 1] !== index) seen.push(index);
    }
    expect(seen).toEqual(STORY.map((_, i) => i));
  });

});
