import content from '../../../shared/content.json';
import type { JourneyStep, Sector } from '../types';

const fallback = content as unknown as { journey: JourneyStep[]; sectors: Sector[] };
const apiBase = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function getSector(slug: string): Promise<Sector | undefined> {
  const local = fallback.sectors.find((sector) => sector.slug === slug);
  if (!local) return undefined;

  try {
    const response = await fetch(`${apiBase}/api/sectors/${slug}`, { next: { revalidate: 60 } });
    if (response.ok) return (await response.json()) as Sector;
  } catch {
    // The local content remains the offline fallback used by the Vite app.
  }

  return local;
}

export async function getHomeContent(): Promise<{ journey: JourneyStep[]; sectors: Sector[] }> {
  try {
    const [journeyResponse, sectorsResponse] = await Promise.all([
      fetch(`${apiBase}/api/journey`, { next: { revalidate: 60 } }),
      fetch(`${apiBase}/api/sectors`, { next: { revalidate: 60 } }),
    ]);
    if (journeyResponse.ok && sectorsResponse.ok) {
      return {
        journey: (await journeyResponse.json()) as JourneyStep[],
        sectors: (await sectorsResponse.json()) as Sector[],
      };
    }
  } catch {
    // The local content remains the offline fallback used by the Vite app.
  }

  return fallback;
}
