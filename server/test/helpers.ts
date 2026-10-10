import type { AddressInfo } from 'node:net';
import { createApp } from '../app.js';

// Starts the app on a random port. No MongoDB is connected, so the API runs
// in its in-memory mode, which is exactly what we want for fast tests.
export async function startServer() {
  const server = createApp().listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
  return {
    base,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
    get: (p: string) => fetch(`${base}${p}`),
    post: (p: string, body: unknown, raw = false) =>
      fetch(`${base}${p}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: raw ? (body as string) : JSON.stringify(body),
      }),
  };
}

export type TestServer = Awaited<ReturnType<typeof startServer>>;

/** Typed JSON body helper (fetch returns `unknown` for json() under Node types). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const json = async <T = any>(res: Response): Promise<T> => (await res.json()) as T;

export const validSubmission = {
  sector: 'gaming',
  companyName: 'Acme Games',
  email: 'Hello@Acme.com',
  question: 'How do we keep new players for more than one session?',
};
