import { Router } from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { content } from '../content.js';
import { Sector, JourneyStep, Submission } from '../models/index.js';
import type { SubmissionInput } from '../types.js';

const router = Router();

// When MongoDB is not connected the API still works from the shared content file,
// and submissions are kept in memory until the server restarts.
const memorySubmissions: Array<SubmissionInput & { createdAt: string }> = [];
const usingMongo = () => mongoose.connection.readyState === 1;

const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions. Please try again in a few minutes.' },
});

router.get('/health', (_req, res) => {
  res.json({ ok: true, db: usingMongo() ? 'mongodb' : 'memory' });
});

router.get('/sectors', async (_req, res, next) => {
  try {
    const list: Array<{ slug: string; name: string; tagline?: string }> = usingMongo()
      ? await Sector.find({}, 'slug name tagline -_id').lean()
      : content.sectors.map(({ slug, name, tagline }) => ({ slug, name, tagline }));
    // keep the order defined in content.json
    const order = content.sectors.map((s) => s.slug);
    list.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
    res.json(list);
  } catch (err) {
    next(err);
  }
});

router.get('/sectors/:slug', async (req, res, next) => {
  try {
    const sector = usingMongo()
      ? await Sector.findOne({ slug: req.params.slug }, '-_id -__v').lean()
      : content.sectors.find((s) => s.slug === req.params.slug);
    if (!sector) {
      res.status(404).json({ error: 'Sector not found' });
      return;
    }
    res.json(sector);
  } catch (err) {
    next(err);
  }
});

router.get('/journey', async (_req, res, next) => {
  try {
    const steps = usingMongo()
      ? await JourneyStep.find({}, '-_id -__v').sort({ order: 1 }).lean()
      : content.journey;
    res.json(steps);
  } catch (err) {
    next(err);
  }
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/submissions', submissionLimiter, async (req, res, next) => {
  try {
    const { sector, companyName, email, question } = (req.body ?? {}) as Record<string, unknown>;
    const errors: Record<string, string> = {};

    if (typeof sector !== 'string' || !content.sectors.some((s) => s.slug === sector)) {
      errors.sector = 'Unknown sector';
    }
    if (typeof companyName !== 'string' || !companyName.trim() || companyName.length > 120) {
      errors.companyName = 'Company name is required (max 120 characters)';
    }
    if (typeof email !== 'string' || !EMAIL.test(email) || email.length > 200) {
      errors.email = 'A valid email is required';
    }
    if (typeof question !== 'string' || question.trim().length < 10 || question.length > 2000) {
      errors.question = 'Describe your problem in 10 to 2000 characters';
    }
    if (Object.keys(errors).length) {
      res.status(400).json({ errors });
      return;
    }

    const doc: SubmissionInput = {
      sector: sector as string,
      companyName: (companyName as string).trim(),
      email: (email as string).trim().toLowerCase(),
      question: (question as string).trim(),
    };

    if (usingMongo()) {
      await Submission.create(doc);
    } else {
      memorySubmissions.push({ ...doc, createdAt: new Date().toISOString() });
    }
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
