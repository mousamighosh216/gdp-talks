import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Rocket, ListChecks, UserPlus, type LucideIcon } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import { useApi, fallbackJourney, REGISTER_URL } from '../lib/api';
import { useInView } from '../lib/useInView';
import type { JourneyStep } from '../types';

const ICONS: LucideIcon[] = [UserPlus, Rocket, ListChecks];

function Step({ step, index }: { step: JourneyStep; index: number }) {
  const [ref, seen] = useInView<HTMLLIElement>({ threshold: 0.25 });
  const Icon = ICONS[index] ?? Rocket;

  return (
    <li ref={ref} className="relative pl-16 sm:pl-24">
      <span className="absolute left-0 top-1 grid h-12 w-12 place-items-center rounded-full bg-navy-950 text-gold-400 ring-8 ring-cream sm:h-16 sm:w-16">
        <Icon size={26} aria-hidden="true" />
      </span>

      <div
        className={`reveal rounded-3xl border border-navy-950/10 bg-white/70 p-6 shadow-sm sm:p-8 ${
          seen ? 'is-visible' : ''
        }`}
      >
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
          Step {String(step.order).padStart(2, '0')}
        </p>
        <h3 className="mt-1 font-heading text-2xl font-bold text-navy-950 sm:text-3xl">
          {step.title}
        </h3>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-navy-950/80">{step.summary}</p>

        <ul className="mt-5 space-y-2.5">
          {step.details.map((d) => (
            <li key={d} className="flex items-start gap-3 text-navy-950/85">
              <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-950">
                <Check size={12} strokeWidth={3} aria-hidden="true" />
              </span>
              {d}
            </li>
          ))}
        </ul>

        {step.action === 'register' && (
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-navy-950 px-6 py-3 font-heading text-sm font-semibold text-cream transition hover:bg-navy-700"
          >
            Register on Unstop
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </li>
  );
}

export default function Journey() {
  const steps = useApi<JourneyStep[]>('/api/journey', fallbackJourney);
  const listRef = useRef<HTMLOListElement>(null);
  const [fill, setFill] = useState(0);

  // The vertical line fills as the reader scrolls through the steps.
  useEffect(() => {
    const onScroll = () => {
      const el = listRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / r.height;
      setFill(Math.min(1, Math.max(0, p)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section id="journey" className="relative overflow-hidden bg-cream py-24 md:py-32">
      <FloatingBackdrop preset="journey" />
      <div className="relative mx-auto max-w-4xl px-5">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
          Student journey
        </p>
        <h2 className="mt-2 font-heading text-3xl font-bold text-navy-950 sm:text-4xl md:text-5xl">
          From registration to a refined idea
        </h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy-950/80">
          Three stages take you from signing up to shipping something you are proud of.
        </p>

        <div className="relative mt-14">
          <div
            className="absolute bottom-2 left-6 top-2 w-0.5 bg-navy-950/15 sm:left-8"
            aria-hidden="true"
          >
            <div
              className="w-full bg-navy-700 transition-[height] duration-150"
              style={{ height: `${fill * 100}%` }}
            />
          </div>

          <ol ref={listRef} className="space-y-12">
            {steps.map((s, i) => (
              <Step key={s.order} step={s} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
