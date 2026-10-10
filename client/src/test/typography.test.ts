// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';

const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

describe('design tokens', () => {
  it('heading is 1.6x the subtitle size', () => {
    expect(css).toMatch(/--fs-head:\s*calc\(var\(--fs-sub\)\s*\*\s*1\.6\)/);
  });

  it('chat text is the heading reduced by 45% (x 0.55)', () => {
    expect(css).toMatch(/--fs-chat:\s*calc\(var\(--fs-head\)\s*\*\s*0\.55\)/);
  });

  it('uses Libron for body and Space Grotesk for headings', () => {
    expect(css).toMatch(/--font-body:\s*"Libron"/);
    expect(css).toMatch(/--font-heading:\s*"Space Grotesk"/);
  });

  it('defines the brand colours', () => {
    for (const hex of ['#F0EEE9', '#0A1E3F', '#102F5C', '#1A447A', '#2A5A96', '#FEE39F', '#EFBB55']) {
      expect(css.toUpperCase()).toContain(hex);
    }
  });

  it('ships all four Libron font files that the CSS points to', () => {
    const files = [...css.matchAll(/url\("\/fonts\/([^"]+)"\)/g)].map((m) => m[1]);
    expect(files.sort()).toEqual([
      'Libron-Bold.woff2',
      'Libron-BoldItalic.woff2',
      'Libron-Italic.woff2',
      'Libron-Regular.woff2',
    ]);
    for (const f of files) {
      expect(() => readFileSync(new URL(`../../public/fonts/${f}`, import.meta.url))).not.toThrow();
    }
  });

  it('left-aligns body text', () => {
    expect(css).toMatch(/body\s*\{[^}]*text-align:\s*left/);
  });

  it('stops the moving assets for visitors who prefer reduced motion', () => {
    const block = css.slice(css.indexOf('prefers-reduced-motion'));
    expect(block).toContain('.float');
    expect(block).toContain('.bob');
  });
});
