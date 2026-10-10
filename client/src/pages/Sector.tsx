import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, PenLine, Send, Sparkles } from 'lucide-react';
import NotFound from './NotFound';
import FloatingBackdrop from '../components/FloatingBackdrop';
import { useApi, fallbackSectors, submitQuestion } from '../lib/api';
import { SECTOR_UI } from '../lib/sectors';
import type { Problem, Sector } from '../types';

const inputClass =
  'mt-2 w-full rounded-xl border-2 border-navy-950/20 bg-white px-4 py-3 text-navy-950 placeholder:text-navy-950/40 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-gold-400/40';

type FormState = { companyName: string; email: string; question: string };
type Status = { state: 'idle' | 'sending' | 'done' | 'error'; message: string };

const EMPTY: FormState = { companyName: '', email: '', question: '' };

function SectorContent({ slug, fallback }: { slug: string; fallback: Sector }) {
  const ui = SECTOR_UI[slug];
  const sector = useApi<Sector>(`/api/sectors/${slug}`, fallback);
  const Icon = ui.icon;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<Status>({ state: 'idle', message: '' });

  const set =
    (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const useAsStart = (p: Problem) => {
    setForm((f) => ({ ...f, question: `${p.title}\n\n${p.brief}\n\nOur twist: ` }));
    document.getElementById('try-your-own')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ state: 'sending', message: '' });
    try {
      await submitQuestion({ sector: slug, ...form });
      setStatus({ state: 'done', message: '' });
      setForm(EMPTY);
    } catch (err) {
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'Could not send your question.',
      });
    }
  };

  return (
    <>
      {/* Same soft tint as the hover state on the home page */}
      <section
        className="relative overflow-hidden pb-20 pt-32 md:pb-28 md:pt-40"
        style={{ backgroundColor: ui.bg, color: ui.fg }}
      >
        <FloatingBackdrop preset="companies" />
        <div className="relative mx-auto max-w-6xl px-5">
          <Link
            to="/#companies"
            className="inline-flex items-center gap-2 font-heading text-sm font-semibold opacity-80 hover:opacity-100"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            All sectors
          </Link>

          <div className="mt-8 flex items-center gap-5">
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
              <h1 className="font-heading text-4xl font-bold sm:text-5xl md:text-6xl">
                {sector.name}
              </h1>
            </div>
          </div>

          <p className="mt-8 max-w-2xl font-heading text-xl font-medium sm:text-2xl">
            {sector.tagline}
          </p>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed opacity-85">{sector.summary}</p>
        </div>
      </section>

      <section className="bg-cream py-20 md:py-24" aria-labelledby="samples">
        <div className="mx-auto max-w-6xl px-5">
          <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
            For companies
          </p>
          <h2
            id="samples"
            className="mt-2 font-heading text-3xl font-bold text-navy-950 sm:text-4xl"
          >
            Sample problem statements
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-navy-950/80">
            Use these as a reference for the kind of problem students can take on, or adapt one as
            your own.
          </p>

          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {sector.problems.map((p, i) => (
              <li
                key={p.title}
                className="flex flex-col rounded-3xl border border-navy-950/10 bg-white/70 p-7"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-navy-950 font-heading text-sm font-bold text-gold-400">
                  {i + 1}
                </span>
                <h3 className="mt-5 font-heading text-xl font-bold text-navy-950">{p.title}</h3>
                <p className="mt-2 flex-1 leading-relaxed text-navy-950/80">{p.brief}</p>
                <button
                  type="button"
                  onClick={() => useAsStart(p)}
                  className="mt-6 inline-flex items-center gap-2 self-start font-heading text-sm font-semibold text-navy-700 hover:text-navy-950"
                >
                  <PenLine size={16} aria-hidden="true" />
                  Use as a starting point
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="try-your-own"
        className="relative overflow-hidden bg-navy-950 py-20 text-cream md:py-24"
      >
        <FloatingBackdrop preset="journey" theme="dark" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-widest text-gold-400">
              <Sparkles size={16} aria-hidden="true" />
              Try your own
            </p>
            <h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">
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
          >
            {status.state === 'done' ? (
              <div className="flex flex-col items-start gap-3 py-6" role="status">
                <CheckCircle2 size={44} className="text-navy-700" aria-hidden="true" />
                <h3 className="font-heading text-2xl font-bold">Thank you</h3>
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
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block font-heading text-sm font-semibold">
                    Company name
                    <input
                      className={inputClass}
                      value={form.companyName}
                      onChange={set('companyName')}
                      maxLength={120}
                      autoComplete="organization"
                      required
                    />
                  </label>
                  <label className="block font-heading text-sm font-semibold">
                    Work email
                    <input
                      className={inputClass}
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      maxLength={200}
                      autoComplete="email"
                      required
                    />
                  </label>
                </div>

                <label className="mt-5 block font-heading text-sm font-semibold">
                  Your problem statement
                  <textarea
                    className={`${inputClass} min-h-40 resize-y`}
                    value={form.question}
                    onChange={set('question')}
                    maxLength={2000}
                    placeholder="Describe the problem, who it affects and what a good outcome looks like."
                    required
                  />
                </label>

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
    </>
  );
}

export default function SectorPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const fallback = fallbackSectors.find((s) => s.slug === slug);
  if (!fallback || !SECTOR_UI[slug]) return <NotFound />;
  // key resets form and fetch state when moving between sectors
  return <SectorContent key={slug} slug={slug} fallback={fallback} />;
}
