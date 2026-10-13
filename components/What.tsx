'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import FloatingBackdrop from './FloatingBackdrop';

const EASE = [0.16, 1, 0.3, 1] as const;
const RUNWAY_WEEKS = 11;

/** Fade + rise. Collapses to a plain fade for reduced motion. */
function makeFadeUp(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 30 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };
}

function makeStagger(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: reduce ? 0 : 0.15 } },
  };
}

/** Cards enter from the side they sit on, so the zig-zag is also how they arrive. */
function makeSlideIn(from: 'left' | 'right', reduce: boolean): Variants {
  const dir = from === 'left' ? -1 : 1;
  return {
    hidden: { opacity: 0, x: reduce ? 0 : dir * 48 },
    visible: { opacity: 1, x: 0, transition: { duration: reduce ? 0.2 : 0.9, ease: EASE } },
  };
}

/**
 * Eleven weeks fill in one by one when it scrolls into view,
 * then the 30-hour sprint lands as the gold block at the end.
 */
function Runway({ reduce }: { reduce: boolean }) {
  const delay = (i: number) => (reduce ? 0 : 0.2 + i * 0.07);
  const grow = {
    initial: { scaleX: reduce ? 1 : 0, opacity: reduce ? 1 : 0 },
    whileInView: { scaleX: 1, opacity: 1 },
    viewport: { once: true, amount: 0.6 },
  } as const;

  return (
    <div className="mt-12 w-full max-w-3xl">
      <div
        role="img"
        aria-label="Timeline: eleven weeks of preparation leading into a 30-hour build sprint"
        className="flex items-end gap-1.5 sm:gap-2"
      >
        {Array.from({ length: RUNWAY_WEEKS }, (_, i) => (
          <motion.span
            key={i}
            aria-hidden="true"
            className="h-2 flex-1 origin-left rounded-full bg-navy-950/15"
            {...grow}
            transition={{ delay: delay(i), duration: 0.5, ease: EASE }}
          />
        ))}
        <motion.span
          aria-hidden="true"
          className="h-5 flex-[3] origin-left rounded-full bg-gold-400 shadow-lg shadow-gold-400/30"
          {...grow}
          transition={{ delay: delay(RUNWAY_WEEKS) + 0.1, duration: 0.8, ease: EASE }}
        />
      </div>
      <div
        aria-hidden="true"
        className="mt-3 flex gap-1.5 font-heading text-xs font-semibold uppercase tracking-widest text-navy-500 sm:gap-2"
      >
        <span className="flex-[11] text-left">Week 1</span>
        <span className="flex-[3] text-right text-navy-950">30 hours</span>
      </div>
    </div>
  );
}

type BlueprintCard = {
  number: string;
  category: string;
  title: string;
  description: string;
  /** Desktop grid placement. Edit these to move a card around the screen. */
  place: string;
  /** Small inward shift on tablets/phones so the stack zig-zags instead of forming a flat column. */
  shift: string;
  from: 'left' | 'right';
};

const BLUEPRINT_CARDS: BlueprintCard[] = [
  {
    number: '01',
    category: 'Enterprises',
    title: 'The Challenge Scopers',
    description:
      'Major brands bypass generic RFPs to offload complex R&D backlogs into live, scoped 30-hour sprint tracks, gaining real-time validation and functional prototypes.',
    place: 'lg:col-start-1 lg:col-span-5 lg:row-start-1',
    shift: '',
    from: 'left',
  },
  {
    number: '02',
    category: 'Tech Giants',
    title: 'The Ecosystem Sponsors',
    description:
      'Large IT services and productized tech platforms utilize the arena for high-volume talent scouting, co-innovation visibility, and deep ecosystem integration.',
    place: 'lg:col-start-7 lg:col-span-6 lg:row-start-1 lg:mt-24',
    shift: 'sm:ml-12 lg:ml-0',
    from: 'right',
  },
  {
    number: '03',
    category: 'Government',
    title: 'The Facilitator',
    description:
      'Providing institutional backing to bridge the gap between emerging engineering talent and private sector capital, accelerating regional digital transformation at zero cost.',
    place: 'lg:col-start-2 lg:col-span-5 lg:row-start-2',
    shift: 'sm:mr-12 lg:mr-0',
    from: 'left',
  },
  {
    number: '04',
    category: 'Builders',
    title: 'Pro & Next-Gen',
    description:
      'Senior agency squads and top-tier student developers execute side-by-side, translating theory into production-grade architecture under extreme time constraints.',
    place: 'lg:col-start-8 lg:col-span-5 lg:row-start-2 lg:mt-16',
    shift: 'sm:ml-12 lg:ml-0',
    from: 'right',
  },
];

function BlueprintItem({ card, reduce }: { card: BlueprintCard; reduce: boolean }) {
  return (
    <motion.li
      variants={makeSlideIn(card.from, reduce)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={`${card.place} ${card.shift}`}
    >
      {/* Hover lift lives on the inner element so it never fights the entrance transform */}
      <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-navy-950/10 bg-white/70 p-7 shadow-sm backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-navy-950/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
        {/* Gold hover accent line */}
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 h-1 w-full scale-x-0 bg-gold-400 transition-transform duration-500 ease-out group-hover:scale-x-100"
        />

        <div>
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500">
              {card.number}. {card.category}
            </span>
            <span
              aria-hidden="true"
              className="h-2 w-2 rounded-full bg-gold-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>

          <h3 className="mt-4 font-heading text-2xl font-bold text-navy-950">{card.title}</h3>

          <p className="mt-3 text-sm leading-relaxed text-navy-950/80">{card.description}</p>
        </div>

        <div className="mt-8 border-t border-navy-950/5 pt-4">
          <span className="font-heading text-xs font-semibold text-navy-500 transition-colors group-hover:text-navy-950">
            Learn more &rarr;
          </span>
        </div>
      </article>
    </motion.li>
  );
}

export default function WhatIsGDPTalks() {
  const reduce = useReducedMotion() ?? false;
  const fadeUp = makeFadeUp(reduce);
  const stagger = makeStagger(reduce);

  return (
    <div className="w-full selection:bg-gold-400 selection:text-navy-950">
      {/* ONE SECTION: statement, runway and blueprint together */}
      <section        id="what"
        className="relative overflow-hidden bg-cream py-24 text-navy-950 md:py-32"
      >
        <FloatingBackdrop preset="companies" />

        <div className="relative mx-auto max-w-6xl px-5">
          {/* Section Header */}
          <motion.header
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-14 flex flex-col justify-between border-b border-navy-950/15 pb-8 md:flex-row md:items-end"
          >
            <div>
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500">
                A High-Signal Execution Environment
              </p>
              <h1
                id="blueprint-title"
                className="mt-2 font-heading text-3xl font-bold text-navy-950 sm:text-4xl md:text-5xl"
              >
                What is GDP Talks?
              </h1>
            </div>
            <p className="mt-4 font-heading text-sm font-semibold uppercase tracking-widest text-navy-500 md:mt-0">
              500+ Engineers & 25+ Enterprises
            </p>
          </motion.header>

          {/* Statement: the quote and description that used to open the hero */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.p
              variants={fadeUp}
              className="max-w-3xl font-heading text-2xl font-medium italic text-navy-950 sm:text-3xl"
            >
              &quot;30-Hour Accelerated Focused Building event.&quot;
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-3xl text-lg leading-relaxed text-navy-950/80 sm:text-xl"
            >
              An executive 30-hour accelerated R&D prototyping sprint
                uniting senior technical architects, product agencies, and
            enterprise leaders to resolve complex digital backlogs with
            zero agency risk.
            </motion.p>
          </motion.div>

          <Runway reduce={reduce} />

          {/* SCATTERED GRID: each card sits in its own part of the screen and enters from that side */}
          <ul className="mt-20 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
            {BLUEPRINT_CARDS.map((card) => (
              <BlueprintItem key={card.number} card={card} reduce={reduce} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}