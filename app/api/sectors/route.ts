import { NextResponse } from 'next/server';
import { getSectors } from '@/lib/sectors/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getSectors());
}
