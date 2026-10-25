import { NextResponse } from 'next/server';
import { getJourney } from '@/lib/sectors/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await getJourney());
}
