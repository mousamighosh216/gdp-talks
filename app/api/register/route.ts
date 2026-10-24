import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/registration/rateLimit';
import { validateRegistration } from '@/lib/registration/registration';
import { makeReference, saveRegistration } from '@/lib/registration/registrationStore';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const limit = rateLimit(`register:${ip}`, Date.now());
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Pretend it worked and write nothing.
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === 'string' && trap.trim() !== '') {
    return NextResponse.json({ ok: true, reference: makeReference() }, { status: 201 });
  }

  const result = validateRegistration(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

  const saved = await saveRegistration(result.value);
  if (!saved.ok) {
    const payload = saved.field ? { errors: { [saved.field]: saved.message } } : { error: saved.message };
    return NextResponse.json(payload, { status: saved.status });
  }
  return NextResponse.json({ ok: true, reference: saved.reference }, { status: 201 });
}
