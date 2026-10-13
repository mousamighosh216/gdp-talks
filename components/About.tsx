'use client';

import { Handshake, Rocket, Lightbulb, type LucideIcon } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import { useInView } from '@/lib/useInView';

type Pillar = {
  icon: LucideIcon;
  title: string;
  text: string;
  /** Where the card sits (desktop grid) and which side it enters from. */
  place: string;
  /** Small offsets on phones so the stack zig-zags instead of forming a flat column. */
  mobileShift: string;
  from: 'left' | 'right';
};

const PILLARS: Pillar[] = [
  {
    icon: Handshake,
    title: 'Keep meeting',
    text: 'Students, mentors and companies in the same room, talking about real problems instead of sample ones.',
    // top, far right, level with the intro but dropped a little
    place: 'lg:col-start-8 lg:col-span-5 lg:row-start-1 lg:mt-28',
    mobileShift: '',
    from: 'right',
  },
  {
    icon: Rocket,
    title: 'Learn to ship',
    text: 'Building is only half the work. We teach hosting, deployment and the habits that get a project live.',
    // middle, left side
    place: 'lg:col-start-2 lg:col-span-6 lg:row-start-2',
    mobileShift: 'sm:ml-12',
    from: 'left',
  },
  {
    icon: Lightbulb,
    title: 'Solve real problems',
    text: 'Every sector brings problem statements from companies that want fresh thinking and honest feedback.',
    // bottom, shifted right
    place: 'lg:col-start-6 lg:col-span-6 lg:row-start-3',
    mobileShift: 'sm:mr-12',
    from: 'right',
  },
];

function PillarCard({ pillar }: { pillar: Pillar }) {
  const { icon: Icon, title, text, place, mobileShift, from } = pillar;
  const [ref, seen] = useInView<HTMLLIElement>({ threshold: 0.2 });
  const hidden = from === 'left' ? '-translate-x-10' : 'translate-x-10';

  return (
    <li
      ref={ref}
      className={`${place} ${mobileShift} transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${
        seen ? 'translate-x-0 opacity-100' : `${hidden} opacity-0 motion-reduce:opacity-100`
      }`}
    >
      <article className="flex flex-col gap-5 rounded-3xl bg-navy-950/45 p-7 ring-1 ring-cream/10 transition-transform duration-300 hover:-translate-y-1 sm:flex-row sm:items-start sm:gap-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-400 text-navy-950">
          <Icon size={24} aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-heading text-xl font-bold">{title}</h3>
          <p className="mt-2 leading-relaxed text-cream/80">{text}</p>
        </div>
      </article>
    </li>
  );
}

export default function About() {
  const [ref, seen] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative overflow-hidden bg-navy-700 py-24 text-cream md:py-32"
    >
      <FloatingBackdrop preset="about" theme="dark" />

      <div
        ref={ref}
        className={`reveal relative mx-auto max-w-6xl px-5 ${seen ? 'is-visible' : ''}`}
      >
        {/* One scattered layout: intro top-left, cards stepping across the screen */}
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
          <header className="lg:col-span-7 lg:row-start-1">
            <p className="font-heading text-sm font-semibold uppercase tracking-widest text-gold-200">
              About · Our agenda
            </p>
            <h2
              id="about-title"
              className="mt-2 max-w-3xl font-heading text-3xl font-bold sm:text-4xl md:text-5xl"
            >
              Smart people should keep meeting
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/85">
              That is why GDP Talks exists. We bring curious students and ambitious companies
              together around one hackathon, and make sure the ideas that come out of it do not
              stay on a laptop.
            </p>
          </header>

          {/* display: contents lets the cards sit directly on the section grid */}
          <ul className="contents">
            {PILLARS.map((p) => (
              <PillarCard key={p.title} pillar={p} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}