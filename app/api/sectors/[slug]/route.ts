import { NextResponse } from 'next/server';
import { getSector } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) return NextResponse.json({ error: 'Sector not found' }, { status: 404 });
  return NextResponse.json(sector);
}
