import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SectorView from '@/components/SectorView';
import { getSector } from '@/lib/sectors/data';
import { content } from '@/lib/sectors/content';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return content.sectors.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sector = content.sectors.find((s) => s.slug === slug);
  return sector ? { title: sector.name, description: sector.tagline } : {};
}

export default async function SectorPage({ params }: Props) {
  const { slug } = await params;
  const sector = await getSector(slug);
  if (!sector) notFound();
  return <SectorView key={slug} sector={sector} />;
}
