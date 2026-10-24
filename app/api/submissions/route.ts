import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/registration/rateLimit';
import { validateSubmission } from '@/lib/sectors/validation';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const limit = rateLimit(ip);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const result = validateSubmission(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

  const data = result.value;

  // Send email using credentials from .env.local
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: process.env.MAIN_PUBLIC_CONTACT_EMAIL, // or dynamic recipient
    subject: 'New Problem Statement Submission',
    text: `
    Problem Statement Submission Details:
    Sector: ${data.sector}
    Company Name: ${data.companyName}
    Email: ${data.email}
    Question: ${data.question}
    `
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}