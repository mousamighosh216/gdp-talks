import { Handshake, Rocket, Lightbulb, type LucideIcon } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import { useInView } from '../lib/useInView';

const PILLARS: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Handshake,
    title: 'Keep meeting',
    text: 'Students, mentors and companies in the same room, talking about real problems instead of sample ones.',
  },
  {
    icon: Rocket,
    title: 'Learn to ship',
    text: 'Building is only half the work. We teach hosting, deployment and the habits that get a project live.',
  },
  {
    icon: Lightbulb,
    title: 'Solve real problems',
    text: 'Every sector brings problem statements from companies that want fresh thinking and honest feedback.',
  },
];

export default function About() {
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section id="about" className="relative overflow-hidden bg-navy-700 py-24 text-cream md:py-32">
      <FloatingBackdrop preset="about" theme="dark" />
      <div
        ref={ref}
        className={`reveal relative mx-auto max-w-6xl px-5 ${seen ? 'is-visible' : ''}`}
      >
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-gold-200">
          About
        </p>
        <h2 className="mt-2 max-w-3xl font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
          Our agenda
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/85">
          GDP Talks exists so that smart people keep meeting. We bring curious students and
          ambitious companies together around one hackathon, and make sure the ideas that come out
          of it do not stay on a laptop.
        </p>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-3xl bg-navy-950/45 p-7 ring-1 ring-cream/10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-400 text-navy-950">
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-xl font-bold">{title}</h3>
              <p className="mt-2 leading-relaxed text-cream/80">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
