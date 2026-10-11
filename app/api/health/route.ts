import { NextResponse } from 'next/server';
import { storeName } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ok: true, db: await storeName() });
}
