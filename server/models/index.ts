import mongoose from 'mongoose';
import type { Problem, Sector as SectorShape, JourneyStep as JourneyShape, SubmissionInput } from '../types.js';

const problemSchema = new mongoose.Schema<Problem>(
  { title: { type: String, required: true }, brief: { type: String, required: true } },
  { _id: false }
);

const sectorSchema = new mongoose.Schema<SectorShape>({
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tagline: String,
  summary: String,
  problems: [problemSchema],
});

const journeySchema = new mongoose.Schema<JourneyShape>({
  order: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  summary: String,
  details: [String],
  action: { type: String, default: null },
});

const submissionSchema = new mongoose.Schema<SubmissionInput>(
  {
    sector: { type: String, required: true },
    companyName: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    question: { type: String, required: true, minlength: 10, maxlength: 2000 },
  },
  { timestamps: true }
);

export const Sector = mongoose.model('Sector', sectorSchema);
export const JourneyStep = mongoose.model('JourneyStep', journeySchema);
export const Submission = mongoose.model('Submission', submissionSchema);
