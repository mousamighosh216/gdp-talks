import { NextResponse } from 'next/server';
import { saveEventRegistration } from '@/lib/event/event';
import { validateRegistration } from '@/lib/event/eventregistration';
import { sendRegistrationConfirmation } from '@/lib/event/eventmail'
import { rateLimit } from '@/lib/registration/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const limit = rateLimit(`event-register:${ip}`, Date.now());
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

  const result = validateRegistration(body);
  if (!result.ok) return NextResponse.json({ errors: result.errors }, { status: 400 });

  const saved = await saveEventRegistration(result.value);
  if (!saved.ok) {
    const payload = saved.field ? { errors: { [saved.field]: saved.message } } : { error: saved.message };
    return NextResponse.json(payload, { status: saved.status });
  }

  let emailSent = true;
    try {
      await sendRegistrationConfirmation(saved.reference, result.value);
    } catch (error) {
      emailSent = false;
      console.error('Registration confirmation email failed:', error);
    }
  

  return NextResponse.json({ ok: true, reference: saved.reference, emailSent }, { status: 201 });
}
