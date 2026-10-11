import Hero from '../components/Hero';
import Journey from '../components/Journey';
import Companies from '../components/Companies';
import About from '../components/About';
import ChatScroll from '../components/ChatScroll';


// Order of the page: hero with the conversation, student journey, company routing, about.
export default function Home() {
  return (
    <>
      <Hero />
      <ChatScroll/>
      <Journey />
      <Companies />
      <About />
    </>
  );
}
