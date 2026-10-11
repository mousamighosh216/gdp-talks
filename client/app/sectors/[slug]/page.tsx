import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectorPage from '../../../src/views/Sector';
import { getSector } from '../../../src/lib/server-api';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) return { title: 'Sector not found | GDP Talks' };
  return {
    title: `${sector.name} | GDP Talks`,
    description: sector.summary,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) notFound();
  return <SectorPage slug={slug} fallback={sector} />;
}
