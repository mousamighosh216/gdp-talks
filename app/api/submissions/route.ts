import { NextResponse } from 'next/server';
import { saveSubmission } from '@/lib/data';
import { rateLimit } from '@/lib/rateLimit';
import { validateSubmission } from '@/lib/validation';

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

  await saveSubmission(result.value);
  return NextResponse.json({ ok: true }, { status: 201 });
}
