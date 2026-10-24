
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom does not implement these browser APIs.
if (typeof Element !== 'undefined') {
  Element.prototype.scrollTo = vi.fn() as unknown as typeof Element.prototype.scrollTo;
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
}

// Mock matchMedia, which jsdom does not implement.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn().mockReturnValue(false),
    })),
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
