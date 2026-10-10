import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

export function renderAt(ui: ReactElement, route = '/') {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

type Handler = (init: RequestInit) => { status?: number; body?: unknown };

// Stub fetch. Handlers are matched on "METHOD path"; anything unmatched rejects,
// which makes the components fall back to the bundled content (API offline).
export function stubFetch(handlers: Record<string, Handler> = {}) {
  const fn = vi.fn(async (url: string, init: RequestInit = {}) => {
    const key = `${init.method ?? 'GET'} ${url}`;
    const handler = handlers[key];
    if (!handler) throw new Error(`offline: ${key}`);
    const { status = 200, body = {} } = handler(init);
    return { ok: status >= 200 && status < 300, status, json: async () => body };
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

/**
 * The hero reveals the chat based on how far its tall section has been scrolled.
 * jsdom has no layout, so fake the section size and position for a given progress (0..1).
 */
export function setScrollProgress(progress: number) {
  const height = 5000;
  const total = height - window.innerHeight;
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
    configurable: true,
    get: () => height,
  });
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: -total * progress,
  } as DOMRect);
}
