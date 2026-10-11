import Hero from '../components/Hero';
import Journey from '../components/Journey';
import Companies from '../components/Companies';
import About from '../components/About';
import ChatScroll from '../components/ChatScroll';
import type { JourneyStep, Sector } from '../types';


// Order of the page: hero with the conversation, student journey, company routing, about.
export default function Home({
  journey = [],
  sectors = [],
}: {
  journey?: JourneyStep[];
  sectors?: Sector[];
}) {
  return (
    <>
      <Hero />
      <ChatScroll/>
      <Journey steps={journey} />
      <Companies sectors={sectors} />
      <About />
    </>
  );
}
