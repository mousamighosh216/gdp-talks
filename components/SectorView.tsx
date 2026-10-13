'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, CheckCircle2, Loader2, Send, Sparkles } from 'lucide-react';
import FloatingBackdrop from '@/components/FloatingBackdrop';
import ProblemModal from '@/components/ProblemModal';
import { submitQuestion } from '@/lib/api';
import { SECTOR_UI } from '@/lib/sectors';
import type { Problem, Sector } from '@/lib/types';

const inputClass =
  'mt-2 w-full rounded-xl border-2 border-navy-950/20 bg-white px-4 py-3 text-navy-950 placeholder:text-navy-950/40 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-gold-400/40 aria-[invalid=true]:border-red-800';

type FormState = { companyName: string; email: string; question: string };
type FieldKey = keyof FormState;
type Status = { state: 'idle' | 'sending' | 'done' | 'error'; message: string };

const EMPTY: FormState = { companyName: '', email: '', question: '' };
const FIELD_ORDER: FieldKey[] = ['companyName', 'email', 'question'];
const QUESTION_MAX = 2000;
const EASE = [0.16, 1, 0.3, 1] as const;

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

function makeFadeUp(reduce: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    visible: { opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };
}

function makeStagger(reduce: boolean): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: reduce ? 0 : 0.12 } },
  };
}

/** Problem cards enter from the side they sit on. */
function makeSlideIn(from: 'left' | 'right', reduce: boolean): Variants {
  const dir = from === 'left' ? -1 : 1;
  return {
    hidden: { opacity: 0, x: reduce ? 0 : dir * 40 },
    visible: { opacity: 1, x: 0, transition: { duration: reduce ? 0.2 : 0.8, ease: EASE } },
  };
}

/* ------------------------------------------------------------------ */
/* Problem layout: cards zig-zag across the screen, two per row        */
/* ------------------------------------------------------------------ */

/**
 * Desktop placement on a 12-column grid. Even rows sit flush to the edges,
 * odd rows are pulled inward, and the right-hand card always drops a little.
 * Full class strings are written out so Tailwind can see them.
 */
function placement(i: number) {
  const row = Math.floor(i / 2);
  const left = i % 2 === 0;
  const oddRow = row % 2 === 1;
  if (left) return oddRow ? 'lg:col-start-2 lg:col-span-5' : 'lg:col-start-1 lg:col-span-5';
  return oddRow
    ? 'lg:col-start-8 lg:col-span-5 lg:mt-12'
    : 'lg:col-start-7 lg:col-span-6 lg:mt-20';
}

/** Phones and tablets: a single column with small inward nudges so it still zig-zags. */
function mobileShift(i: number) {
  if (i % 2 === 0) return 'sm:mr-12 lg:mr-0';
  return 'sm:ml-12 lg:ml-0';
}

function ProblemCard({
  problem,
  index,
  reduce,
  onOpen,
}: {
  problem: Problem;
  index: number;
  reduce: boolean;
  onOpen: () => void;
}) {
  const from = index % 2 === 0 ? 'left' : 'right';
  return (
    <motion.li
      variants={makeSlideIn(from, reduce)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      style={{ '--row': Math.floor(index / 2) + 1 } as CSSProperties}
      className={`flex lg:[grid-row:var(--row)] ${placement(index)} ${mobileShift(index)}`}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-haspopup="dialog"
        className="group flex w-full flex-col rounded-3xl border border-navy-950/10 bg-white/70 p-7 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-navy-700/40 hover:shadow-lg hover:shadow-navy-950/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-400 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-950 font-heading text-sm font-bold text-gold-400">
          {index + 1}
        </span>
        <span className="mt-5 font-heading text-xl font-bold text-navy-950">{problem.title}</span>
        <span className="mt-2 flex-1 leading-relaxed text-navy-950/80">{problem.brief}</span>
        <span className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-semibold text-navy-700 group-hover:text-navy-950">
          Read the full problem
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
      </button>
    </motion.li>
  );
}

/* ------------------------------------------------------------------ */
/* Form helpers                                                        */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f: FormState): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  if (!f.companyName.trim()) errors.companyName = 'Enter your company name.';
  if (!f.email.trim()) errors.email = 'Enter your work email.';
  else if (!EMAIL_RE.test(f.email.trim())) errors.email = 'Enter a valid email address.';
  if (!f.question.trim()) errors.question = 'Describe the problem you want to share.';
  return errors;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-2 text-sm text-red-800">
      {message}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function SectorView({ sector }: { sector: Sector }) {
  const slug = sector.slug;
  const ui = SECTOR_UI[slug];
  const Icon = ui.icon;
  const reduce = useReducedMotion() ?? false;
  const fadeUp = makeFadeUp(reduce);
  const stagger = makeStagger(reduce);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>({ state: 'idle', message: '' });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

  const questionRef = useRef<HTMLTextAreaElement>(null);
  const thanksRef = useRef<HTMLHeadingElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // After a successful send, move focus to the confirmation so it is announced
  useEffect(() => {
    if (status.state === 'done') thanksRef.current?.focus();
  }, [status.state]);

  const errors = validate(form);
  const visible = (key: FieldKey) => (attempted || touched[key] ? errors[key] : undefined);

  const set =
    (key: FieldKey) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const fieldProps = (key: FieldKey) => ({
    id: `field-${key}`,
    value: form[key],
    onChange: set(key),
    onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    'aria-invalid': visible(key) ? (true as const) : undefined,
    'aria-describedby': visible(key) ? `field-${key}-error` : undefined,
  });

  const startOwn = (p: Problem) => {
    setOpenIndex(null);
    setTouched({});
    setAttempted(false);
    setForm((f) => ({ ...f, question: `${p.title}\n\n${p.brief}\n\nOur twist: ` }));
    // wait for the pop-up to unmount (it restores focus and page scrolling) before scrolling
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      document
        .getElementById('try-your-own')
        ?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
      // drop the cursor at the end, ready to write the "twist"
      const el = questionRef.current;
      if (el) {
        el.focus({ preventScroll: true });
        el.setSelectionRange(el.value.length, el.value.length);
      }
    }, 50);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.state === 'sending') return;

    setAttempted(true);
    const firstInvalid = FIELD_ORDER.find((k) => errors[k]);
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus();
      return;
    }

    setStatus({ state: 'sending', message: '' });
    try {
      await submitQuestion({
        sector: slug,
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        question: form.question.trim(),
      });
      setStatus({ state: 'done', message: '' });
      setForm(EMPTY);
      setTouched({});
      setAttempted(false);
    } catch (err) {
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'Could not send your question.',
      });
    }
  };

  const problemCount = sector.problems.length;

  return (
    <>
      {/* Same soft tint as the hover state on the home page */}
      <section
        aria-labelledby="sector-title"
        className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40"
        style={{ backgroundColor: ui.bg, color: ui.fg }}
      >
        <FloatingBackdrop preset="companies" />
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-6xl px-5"
        >
          <motion.nav variants={fadeUp} aria-label="Breadcrumb">
            <Link
              href="/#companies"
              className="inline-flex items-center gap-2 font-heading text-sm font-semibold opacity-80 hover:opacity-100"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              All sectors
            </Link>
          </motion.nav>

          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-5">
            <span
              className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl shadow-lg shadow-navy-950/15"
              style={{ backgroundColor: ui.boxBg, color: ui.boxFg }}
            >
              <Icon size={40} aria-hidden="true" />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
                Sector
              </p>
              <h1
                id="sector-title"
                className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl"
              >
                {sector.name}
              </h1>
            </div>
          </motion.div>

          {/* Tagline and summary sit side by side on desktop instead of one long column */}
          <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-x-8">
            <motion.p
              variants={fadeUp}
              className="max-w-2xl font-heading text-xl font-medium sm:text-2xl lg:col-span-5"
            >
              {sector.tagline}
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="max-w-2xl text-lg leading-relaxed opacity-85 lg:col-span-6 lg:col-start-7"
            >
              {sector.summary}
            </motion.p>
          </div>

          {/* Jump links to the two things you can do on this page */}
          <motion.div variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href="#problems"
              className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-6 py-3 font-heading text-sm font-semibold text-cream transition hover:bg-navy-700"
            >
              See {problemCount} sample {problemCount === 1 ? 'problem' : 'problems'}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              href="#try-your-own"
              className="inline-flex items-center gap-2 font-heading text-sm font-semibold opacity-80 hover:opacity-100"
            >
              Submit your own
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </motion.div>
        </motion.div>
      </section>

      <section id="problems" className="scroll-mt-20 bg-cream py-20 md:py-24" aria-labelledby="samples">
        <div className="mx-auto max-w-6xl px-5">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.p
              variants={fadeUp}
              className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500"
            >
              For companies
            </motion.p>
            <motion.h2
              variants={fadeUp}
              id="samples"
              className="mt-2 font-heading text-3xl font-bold text-navy-950 sm:text-4xl"
            >
              Sample problem statements
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-3 max-w-2xl text-lg text-navy-950/80">
              Select any problem to read the full description, then email us your approach or
              start your own version.
            </motion.p>
          </motion.div>

          {/* SCATTERED GRID: two cards per row, each in its own part of the screen */}
          <ol className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-10">
            {sector.problems.map((p, i) => (
              <ProblemCard
                key={p.title}
                problem={p}
                index={i}
                reduce={reduce}
                onOpen={() => setOpenIndex(i)}
              />
            ))}
          </ol>
        </div>
      </section>

      <section
        id="try-your-own"
        aria-labelledby="try-title"
        className="relative scroll-mt-0 overflow-hidden bg-navy-950 py-20 text-cream md:py-24"
      >
        <FloatingBackdrop preset="journey" theme="dark" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Stays in view while the longer form scrolls on desktop */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="inline-flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-widest text-gold-400">
              <Sparkles size={16} aria-hidden="true" />
              Try your own
            </p>
            <h2 id="try-title" className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
              Have a problem of your own?
            </h2>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-cream/80">
              Write your own {sector.name.toLowerCase()} problem statement and send it to us. We
              will review it and share it with participating teams.
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-3xl bg-cream p-6 text-navy-950 sm:p-8"
            noValidate
            aria-busy={status.state === 'sending'}
          >
            {/* Always mounted so screen readers announce the change */}
            <div role="status" aria-live="polite">
              {status.state === 'done' && (
                <div className="flex flex-col items-start gap-3 py-6">
                  <CheckCircle2 size={44} className="text-navy-700" aria-hidden="true" />
                  <h3
                    ref={thanksRef}
                    tabIndex={-1}
                    className="font-heading text-2xl font-bold focus:outline-none"
                  >
                    Thank you
                  </h3>
                  <p className="text-lg text-navy-950/80">
                    Your problem statement has been sent. We will be in touch by email.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus({ state: 'idle', message: '' })}
                    className="mt-2 font-heading text-sm font-semibold text-navy-700 hover:text-navy-950"
                  >
                    Send another
                  </button>
                </div>
              )}
            </div>

            {status.state !== 'done' && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block font-heading text-sm font-semibold">
                      Company name
                      <input
                        className={inputClass}
                        maxLength={120}
                        autoComplete="organization"
                        required
                        {...fieldProps('companyName')}
                      />
                    </label>
                    <FieldError id="field-companyName-error" message={visible('companyName')} />
                  </div>
                  <div>
                    <label className="block font-heading text-sm font-semibold">
                      Work email
                      <input
                        className={inputClass}
                        type="email"
                        maxLength={200}
                        autoComplete="email"
                        required
                        {...fieldProps('email')}
                      />
                    </label>
                    <FieldError id="field-email-error" message={visible('email')} />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block font-heading text-sm font-semibold">
                    Your problem statement
                    <textarea
                      ref={questionRef}
                      className={`${inputClass} min-h-40 resize-y`}
                      maxLength={QUESTION_MAX}
                      placeholder="Describe the problem, who it affects and what a good outcome looks like."
                      required
                      {...fieldProps('question')}
                    />
                  </label>
                  <div className="flex items-start justify-between gap-4">
                    <FieldError id="field-question-error" message={visible('question')} />
                    <span
                      aria-hidden="true"
                      className="ml-auto mt-2 shrink-0 text-xs text-navy-950/60"
                    >
                      {form.question.length} / {QUESTION_MAX}
                    </span>
                  </div>
                </div>

                {status.state === 'error' && (
                  <p
                    className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                    role="alert"
                  >
                    {status.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status.state === 'sending'}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-navy-950 px-7 py-3.5 font-heading text-sm font-semibold text-cream transition hover:bg-navy-700 disabled:opacity-60"
                >
                  {status.state === 'sending' ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Send size={16} aria-hidden="true" />
                  )}
                  {status.state === 'sending' ? 'Sending…' : 'Send problem statement'}
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {openIndex !== null && sector.problems[openIndex] && (
        <ProblemModal
          sector={sector}
          problem={sector.problems[openIndex]}
          index={openIndex}
          icon={ui.icon}
          iconBg={ui.boxBg}
          iconFg={ui.boxFg}
          onClose={() => setOpenIndex(null)}
          onStartOwn={() => startOwn(sector.problems[openIndex])}
        />
      )}
    </>
  );
}