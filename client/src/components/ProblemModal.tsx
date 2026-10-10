import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, Mail, PenLine, X, type LucideIcon } from 'lucide-react';
import { approachMailto } from '../lib/mailto';
import type { Problem, Sector } from '../types';

interface Props {
  sector: Sector;
  problem: Problem;
  /** 0-based position of the problem within its sector */
  index: number;
  icon: LucideIcon;
  iconBg: string;
  iconFg: string;
  onClose: () => void;
  /** copies the problem into the "try your own" form and closes the pop-up */
  onStartOwn: () => void;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Pop-up with the full, descriptive version of one problem statement. Closes on Escape,
 * on the close button or by clicking outside. Keeps keyboard focus inside while open and
 * gives it back to the card that opened it afterwards.
 */
export default function ProblemModal({
  sector,
  problem,
  index,
  icon: Icon,
  iconBg,
  iconFg,
  onClose,
  onStartOwn,
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
    // onClose is stable enough for this lifetime; re-running would steal focus
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-navy-950/65 backdrop-blur-sm"
        onClick={onClose}
        data-testid="modal-backdrop"
        aria-hidden="true"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pop relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-cream text-navy-950 shadow-2xl shadow-navy-950/40 sm:max-h-[88vh] sm:rounded-3xl"
      >
        <header className="flex items-start gap-4 border-b border-navy-950/10 bg-white/60 p-5 sm:p-6">
          <span
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
            style={{ backgroundColor: iconBg, color: iconFg }}
          >
            <Icon size={24} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500">
              {sector.name} · Problem {String(index + 1).padStart(2, '0')}
            </p>
            <h2 id={titleId} className="mt-1 font-heading text-xl font-bold leading-tight sm:text-2xl">
              {problem.title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-navy-950 transition hover:bg-navy-950/10"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </header>

        <div className="space-y-6 overflow-y-auto p-5 sm:p-6">
          <p className="font-heading text-lg font-medium leading-snug text-navy-700">
            {problem.brief}
          </p>

          <div className="space-y-4 leading-relaxed text-navy-950/85">
            {problem.description.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <section aria-labelledby={`${titleId}-goals`}>
            <h3
              id={`${titleId}-goals`}
              className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500"
            >
              What we are hoping for
            </h3>
            <ul className="mt-3 space-y-2.5">
              {problem.goals.map((g) => (
                <li key={g} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-400 text-navy-950">
                    <Check size={12} strokeWidth={3} aria-hidden="true" />
                  </span>
                  {g}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby={`${titleId}-keep`}>
            <h3
              id={`${titleId}-keep`}
              className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500"
            >
              Keep in mind
            </h3>
            <ul className="mt-3 space-y-2.5">
              {problem.considerations.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <span
                    className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy-700"
                    aria-hidden="true"
                  />
                  {c}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="border-t border-navy-950/10 bg-navy-950 p-5 text-cream sm:p-6">
          <p className="font-heading text-lg font-semibold">Want to solve this your way?</p>
          <p className="mt-1 text-cream/80">
            Email us how you would approach it, or start your own version of this problem.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={approachMailto(sector, problem)}
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-heading text-sm font-semibold text-navy-950 transition hover:bg-gold-200"
            >
              <Mail size={16} aria-hidden="true" />
              Email us your approach
            </a>
            <button
              type="button"
              onClick={onStartOwn}
              className="inline-flex items-center gap-2 rounded-full border-2 border-cream/40 px-6 py-2.5 font-heading text-sm font-semibold text-cream transition hover:border-gold-200 hover:text-gold-200"
            >
              <PenLine size={16} aria-hidden="true" />
              Start your own version
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body
  );
}
