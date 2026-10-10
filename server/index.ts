import 'dotenv/config';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { content } from './content.js';
import { Sector, JourneyStep } from './models/index.js';

const PORT = process.env.PORT || 5000;

async function seed(): Promise<void> {
  await Sector.bulkWrite(
    content.sectors.map((s) => ({
      updateOne: { filter: { slug: s.slug }, update: { $set: s }, upsert: true },
    }))
  );
  await JourneyStep.bulkWrite(
    content.journey.map((j) => ({
      updateOne: { filter: { order: j.order }, update: { $set: j }, upsert: true },
    }))
  );
  console.log('Seeded sectors and journey steps');
}

async function connect(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI not set: running with in-memory content (no persistence).');
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
    await seed();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`MongoDB unavailable (${message}). Falling back to in-memory content.`);
  }
}

await connect();
createApp().listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
