'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Rocket, ListChecks, UserPlus, type LucideIcon, ArrowUpRight } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import type { JourneyStep } from '@/lib/types';

const ICONS: LucideIcon[] = [UserPlus, Rocket, ListChecks];

/* ------------------------------------------------------------------ */
/* Timeline config                                                     */
/* ------------------------------------------------------------------ */

const SLIDE_START = 0.05; // progress at which the first slide-in begins
const SLIDE_LENGTH = 0.3; // how much progress each slide-in takes
const SLIDE_GAP = 0.1; // pause between consecutive slide-ins
const REST_BUFFER = 0.25; // progress left at the end so the last card rests
const OFFSCREEN = 120; // % the card starts from, off to the side
const VH_BASE = 150; // total track = VH_BASE + steps * 100 (3 steps -> 450vh)

/**
 * Builds the slide window of every step from the step count, so the section
 * keeps working (and keeps the same 25% resting buffer) with 2, 3, 4+ steps.
 * With 3 steps this produces exactly the windows [0.05–0.35] and [0.45–0.75].
 */
function buildWindows(count: number) {
  const raw = Array.from({ length: Math.max(count - 1, 0) }, (_, i) => {
    const start = SLIDE_START + i * (SLIDE_LENGTH + SLIDE_GAP);
    return { start, end: start + SLIDE_LENGTH };
  });
  const lastEnd = raw.length ? raw[raw.length - 1].end : 1;
  const scale = (1 - REST_BUFFER) / lastEnd;
  return [{ start: 0, end: 0 }, ...raw.map((w) => ({ start: w.start * scale, end: w.end * scale }))];
}

/** Step 1 stays put; later steps alternate: left, right, left, ... */
function getXOffset(index: number, progress: number, windows: { start: number; end: number }[]) {
  if (index === 0) return 0;
  const w = windows[index];
  if (!w) return 0;

  const from = index % 2 === 1 ? -OFFSCREEN : OFFSCREEN;
  if (progress <= w.start) return from;
  if (progress >= w.end) return 0;
  const p = (progress - w.start) / (w.end - w.start);
  return from * (1 - p);
}

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/** Scroll progress (0–1) through a tall track, throttled to one update per frame. */
function useTrackProgress(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      if (distance <= 0) return;
      setProgress(Math.min(Math.max(-rect.top / distance, 0), 1));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    measure();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, enabled]);

  return progress;
}

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

function StepCard({ step, index }: { step: JourneyStep; index: number }) {
  const Icon = ICONS[index] ?? Rocket;
  const headingId = `journey-step-${step.order}`;

  return (
    <article
      aria-labelledby={headingId}
      className="relative flex h-[min(520px,calc(100svh_-_6rem))] min-h-[420px] w-full max-w-3xl flex-col justify-between overflow-hidden rounded-[2.5rem] border border-navy-950/10 bg-white/70 p-8 shadow-2xl backdrop-blur-2xl sm:p-10 lg:p-12"
    >
      {/* Bookmark Icon */}
      <span className="absolute right-6 top-6 grid h-12 w-12 place-items-center rounded-full bg-navy-950 text-gold-400 ring-8 ring-cream sm:right-8 sm:top-8 sm:h-14 sm:w-14">
        <Icon size={24} aria-hidden="true" />
      </span>

      {/* Top Header Content */}
      <header className="pr-16 sm:pr-20">
        <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500 sm:text-sm">
          Step {String(step.order).padStart(2, '0')}
        </p>
        <h3
          id={headingId}
          className="mt-2 font-heading text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl"
        >
          {step.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-navy-950/80 sm:text-lg">{step.summary}</p>
      </header>

      {/* Middle Details Content */}
      <ul className="my-auto space-y-2.5 py-4">
        {step.details.map((d) => (
          <li key={d} className="flex items-start gap-3 text-navy-950/85">
            <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-950">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="text-sm sm:text-base">{d}</span>
          </li>
        ))}
      </ul>

      {/* Bottom Action CTA Slot (fixed height keeps cards aligned) */}
      <footer className="pt-2">
        {step.action === 'register' ? (
          <a
            href="/register"
            className="inline-flex items-center gap-2.5 rounded-full bg-navy-950 px-7 py-3 font-heading text-sm font-semibold text-cream shadow-md transition hover:bg-navy-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400"
          >
            Register now
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        ) : (
          <div className="h-11" aria-hidden="true" />
        )}
      </footer>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Progress rail (shows where you are in the sequence)                 */
/* ------------------------------------------------------------------ */

function ProgressRail({ count, active }: { count: number; active: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-6 z-50 flex justify-center gap-2 sm:bottom-8"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === active ? 'w-8 bg-navy-950' : 'w-1.5 bg-navy-950/20'
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Journey({ steps }: { steps: JourneyStep[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const progress = useTrackProgress(trackRef, !reduceMotion);

  const windows = buildWindows(steps.length);

  // The card that currently "owns" the screen = the latest one that has started sliding in.
  const active = windows.reduce((acc, w, i) => (i > 0 && progress > w.start ? i : acc), 0);

  return (
    <section id="journey" aria-labelledby="journey-title" className="relative bg-cream">
      <FloatingBackdrop preset="journey" />

      {/* Title Header */}
      <div className="relative mx-auto max-w-4xl px-5 pt-24 text-center md:pt-32">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
          Student journey
        </p>
        <h2
          id="journey-title"
          className="mt-2 font-heading text-3xl font-bold text-navy-950 sm:text-4xl md:text-5xl"
        >
          From registration to a refined idea
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-navy-950/80">
          Three stages take you from signing up to shipping something you are proud of.
        </p>
      </div>

      {reduceMotion ? (
        /* Reduced motion: same cards, simply stacked in reading order */
        <ol className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 py-16">
          {steps.map((s, i) => (
            <li key={s.order} className="flex w-full justify-center">
              <StepCard step={s} index={i} />
            </li>
          ))}
        </ol>
      ) : (
        /* Scroll track with a resting buffer for the last step */
        <div
          ref={trackRef}
          className="relative"
          style={{ height: `${VH_BASE + steps.length * 100}vh` }}
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <ol className="relative h-full w-full">
              {steps.map((s, i) => {
                const x = getXOffset(i, progress, windows);
                const offscreen = Math.abs(x) >= 100;
                return (
                  <li
                    key={s.order}
                    className="absolute inset-0 flex items-center justify-center px-4 will-change-transform"
                    style={{
                      transform: `translate3d(${x}%, 0, 0)`,
                      zIndex: (i + 1) * 10,
                      // hides offscreen cards from keyboard focus and screen readers
                      visibility: offscreen ? 'hidden' : 'visible',
                    }}
                  >
                    <StepCard step={s} index={i} />
                  </li>
                );
              })}
            </ol>
            <ProgressRail count={steps.length} active={active} />
          </div>
        </div>
      )}
    </section>
  );
}