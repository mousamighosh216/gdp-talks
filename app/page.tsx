import Hero from '@/components/Hero';
import Journey from '@/components/Journey';
import Companies from '@/components/Companies';
import About from '@/components/About';
import { getJourney, getSectors } from '@/lib/data';
import { content } from '@/lib/content';

export const dynamic = 'force-dynamic';

// Order of the page: hero with the story, student journey, company routing, about.
export default async function Home() {
  const [sectors, journey] = await Promise.all([getSectors(), getJourney()]);
  const problemCount = content.sectors.reduce((n, s) => n + s.problems.length, 0);
  const sample = content.sectors
    .filter((s) => ['devtools', 'ed-tech', 'gaming'].includes(s.slug))
    .map((s) => ({ sector: s.name, title: s.problems[0].title }));

  return (
    <>
      <Hero sectorCount={sectors.length} problemCount={problemCount} sample={sample} />
      <Journey steps={journey} />
      <Companies sectors={sectors} />
      <About />
    </>
  );
}
