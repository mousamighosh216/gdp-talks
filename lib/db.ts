import mongoose from 'mongoose';
import { content } from './content';
import { JourneyModel, SectorModel } from './models';

// MongoDB is optional. Without MONGODB_URI everything is served from content/content.json
// and submissions are kept in memory until the server restarts.
interface Cache {
  promise: Promise<boolean> | null;
  failedAt: number;
}
const g = globalThis as unknown as { __gdpDb?: Cache };
const cache: Cache = (g.__gdpDb ??= { promise: null, failedAt: 0 });
const RETRY_AFTER_MS = 30_000;

async function connect(uri: string): Promise<boolean> {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    await SectorModel.deleteMany({});
    await SectorModel.insertMany(content.sectors);
    await JourneyModel.deleteMany({});
    await JourneyModel.insertMany(content.journey);
    return true;
  } catch (err) {
    console.error('MongoDB unavailable, using the content file instead:', (err as Error).message);
    cache.failedAt = Date.now();
    return false;
  }
}

/** Resolves true when MongoDB is connected and seeded, false when the content file is used. */
export async function useMongo(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return false;
  if (mongoose.connection.readyState === 1) return true;
  if (cache.failedAt && Date.now() - cache.failedAt < RETRY_AFTER_MS) return false;
  cache.promise ??= connect(uri).then((ok) => {
    if (!ok) cache.promise = null;
    return ok;
  });
  return cache.promise;
}
