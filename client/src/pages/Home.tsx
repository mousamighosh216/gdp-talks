import Hero from '../components/Hero';
import About from '../components/About';
import Journey from '../components/Journey';
import Companies from '../components/Companies';

// Order of the page: hero with the conversation, about, student journey, company routing.
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Journey />
      <Companies />
    </>
  );
}
