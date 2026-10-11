import mongoose from 'mongoose';
import type { JourneyStep as JourneyShape, Problem, Sector as SectorShape, SubmissionPayload } from './types';

const problemSchema = new mongoose.Schema<Problem>(
  {
    title: { type: String, required: true },
    brief: { type: String, required: true },
    description: [String],
    goals: [String],
    considerations: [String],
  },
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

const submissionSchema = new mongoose.Schema<SubmissionPayload>(
  {
    sector: { type: String, required: true },
    companyName: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, maxlength: 200 },
    question: { type: String, required: true, minlength: 10, maxlength: 2000 },
  },
  { timestamps: true }
);

// Reuse models across hot reloads
export const SectorModel =
  (mongoose.models.Sector as mongoose.Model<SectorShape>) || mongoose.model('Sector', sectorSchema);
export const JourneyModel =
  (mongoose.models.JourneyStep as mongoose.Model<JourneyShape>) ||
  mongoose.model('JourneyStep', journeySchema);
export const SubmissionModel =
  (mongoose.models.Submission as mongoose.Model<SubmissionPayload>) ||
  mongoose.model('Submission', submissionSchema);
