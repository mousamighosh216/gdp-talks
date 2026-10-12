import Hero from '@/components/Hero';
import Journey from '@/components/Journey';
import Companies from '@/components/Companies';
import About from '@/components/About';
import { getJourney, getSectors } from '@/lib/data';

export const dynamic = 'force-dynamic';

// Order of the page: hero with the story, student journey, company routing, about.
export default async function Home() {
  const [sectors, journey] = await Promise.all([getSectors(), getJourney()]);

  return (
    <>
      <Hero />
      <Journey steps={journey} />
      <Companies sectors={sectors} />
      <About />
    </>
  );
}