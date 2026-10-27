'use client';

import { useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Lock, Plus, ShieldCheck, X } from 'lucide-react';
import {
  MAX_MEMBERS,
  MIN_MEMBERS,
  roleLabel,
  validateRegistration,
  type FieldErrors,
  type MemberInput,
} from '@/lib/registration/registration';

const inputClass =
  'w-full rounded-xl border-2 bg-white px-4 py-3 text-navy-950 placeholder:text-navy-950/40 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-gold-400/40';

const card = 'rounded-3xl border-2 border-navy-950/15 bg-white/60 p-5 sm:p-7';

const EMPTY_MEMBER: MemberInput = { name: '', email: '', phone: '' };

interface FieldProps {
  /** key used by the validator, for example "members.1.email" */
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email';
  prefix?: string;
  hint?: string;
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  autoComplete,
  inputMode,
  prefix,
  hint,
}: FieldProps) {
  const id = useId();
  const describedBy = [error ? `${id}-err` : '', hint ? `${id}-hint` : ''].filter(Boolean).join(' ');
  const border = error ? 'border-red-700' : 'border-navy-950/20';
  return (
    <div>
      <label htmlFor={id} className="block font-heading text-sm font-semibold text-navy-950">
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        {prefix && (
          <span
            className="grid shrink-0 place-items-center rounded-xl border-2 border-navy-950/20 bg-cream px-3 font-heading text-sm font-semibold text-navy-700"
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}
        <input
          id={id}
          data-field={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClass} ${border}`}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-navy-950/65">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 text-sm font-medium text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

function Section({
  step,
  title,
  note,
  badge,
  children,
}: {
  step: number;
  title: string;
  note?: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section className={card} aria-labelledby={`step-${step}`}>
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-400 font-heading text-sm font-bold text-navy-950">
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`step-${step}`} className="font-heading text-xl font-bold text-navy-950">
            {title}
          </h2>
          {note && <p className="mt-0.5 text-sm text-navy-950/70">{note}</p>}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full bg-gold-200 px-3 py-1 font-heading text-xs font-semibold text-navy-950">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-6 grid gap-5">{children}</div>
    </section>
  );
}

type Status =
  | { state: 'idle' | 'sending' }
  | { state: 'error'; message: string }
  | { state: 'done'; reference: string; emailSent: boolean };

export default function RegisterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [teamName, setTeamName] = useState('');
  const [institution, setInstitution] = useState('');
  const [members, setMembers] = useState<MemberInput[]>([EMPTY_MEMBER, EMPTY_MEMBER, EMPTY_MEMBER]);
  const [count, setCount] = useState(MIN_MEMBERS);
  const [consent, setConsent] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const roster = useMemo(() => members.slice(0, count), [members, count]);

  // Once someone has pressed submit, errors update live as they fix each field.
  const clientErrors: FieldErrors = useMemo(() => {
    if (!attempted) return {};
    const r = validateRegistration({ teamName, institution, members: roster, consent });
    return r.ok ? {} : r.errors;
  }, [attempted, teamName, institution, roster, consent]);
  const errors = { ...clientErrors, ...serverErrors };

  const edit = <T,>(setter: (v: T) => void) => (v: T) => {
    setServerErrors({});
    setter(v);
  };
  const editMember = (i: number, key: keyof MemberInput) => (v: string) => {
    setServerErrors({});
    setMembers((list) => list.map((m, idx) => (idx === i ? { ...m, [key]: v } : m)));
  };

  const focusFirstError = (errs: FieldErrors) => {
    const fields = Array.from(formRef.current?.querySelectorAll<HTMLElement>('[data-field]') ?? []);
    fields.find((el) => errs[el.dataset.field!])?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status.state === 'sending') return;
    setAttempted(true);
    setServerErrors({});

    const check = validateRegistration({ teamName, institution, members: roster, consent });
    if (!check.ok) {
      setStatus({ state: 'idle' });
      focusFirstError(check.errors);
      return;
    }

    setStatus({ state: 'sending' });
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...check.value, website: '' }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        reference?: string;
        emailSent?: boolean;
        error?: string;
        errors?: FieldErrors;
      };
      if (res.ok && body.reference) {
        setStatus({ state: 'done', reference: body.reference, emailSent: body.emailSent === true });
        window.scrollTo({ top: 0 });
        return;
      }
      if (body.errors) {
        setServerErrors(body.errors);
        setStatus({ state: 'idle' });
        // wait for the messages to render, then jump to the first one
        setTimeout(() => focusFirstError(body.errors!), 0);
        return;
      }
      setStatus({
        state: 'error',
        message: body.error || 'We could not save your registration. Please try again.',
      });
    } catch {
      setStatus({
        state: 'error',
        message: 'We could not reach the server. Check your connection and try again.',
      });
    }
  };

  if (status.state === 'done') {
    return (
      <div className={`${card} pop`} role="status">
        <CheckCircle2 size={44} className="text-navy-700" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-3xl font-bold text-navy-950">Registration locked</h2>
        <p className="mt-2 max-w-xl text-lg leading-relaxed text-navy-950/85">
          {teamName.trim()} is registered with {roster.length} members. Keep this reference: you
          will need it if you contact us about your team.
        </p>
        <p className="mt-2 max-w-xl text-navy-950/85">
          {status.emailSent
            ? 'A confirmation email with the registration details and reference has been sent to each team member.'
            : 'Your registration is saved, but we could not send the confirmation emails. Keep the reference above and contact the organisers if needed.'}
        </p>
        <p className="mt-5 inline-block rounded-2xl bg-navy-950 px-5 py-3 font-heading text-2xl font-bold tracking-widest text-gold-200">
          {status.reference}
        </p>
        <ul className="mt-6 space-y-1 text-navy-950/85">
          {roster.map((m, i) => (
            <li key={i}>
              <span className="font-heading font-semibold">{roleLabel(i)}:</span> {m.name.trim()}
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-heading text-sm font-semibold text-navy-950 transition hover:bg-gold-200"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back home
        </Link>
      </div>
    );
  }

  const sending = status.state === 'sending';

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-6">
      <Section
        step={1}
        title="Team and institution"
        note="Your team name is how organisers and companies will know you."
        badge={`${count} / ${MAX_MEMBERS} seats`}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            name="teamName"
            label="Team name"
            value={teamName}
            onChange={edit(setTeamName)}
            error={errors.teamName}
            placeholder="e.g. Quantum Badgers"
            autoComplete="off"
          />
          <Field
            name="institution"
            label="College or university"
            value={institution}
            onChange={edit(setInstitution)}
            error={errors.institution}
            placeholder="e.g. School of Information Technology"
            autoComplete="organization"
          />
        </div>

        <fieldset>
          <legend className="font-heading text-sm font-semibold text-navy-950">Team size</legend>
          <div className="mt-2 inline-flex rounded-full border-2 border-navy-950/20 bg-white p-1" role="radiogroup" aria-label="Team size">
            {[2, 3].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={count === n}
                onClick={() => setCount(n)}
                className={`rounded-full px-5 py-2 font-heading text-sm font-semibold transition ${
                  count === n ? 'bg-navy-950 text-cream' : 'text-navy-950 hover:bg-navy-950/5'
                }`}
              >
                {n} members
              </button>
            ))}
          </div>
        </fieldset>
      </Section>

      {roster.map((m, i) => (
        <Section
          key={i}
          step={i + 2}
          title={i === 0 ? 'Team lead' : roleLabel(i)}
          note={
            i === 0
              ? 'The main point of contact for organisers.'
              : 'Details of a participant in your team.'
          }
          badge={i === 0 ? 'Lead' : undefined}
        >
          <Field
            name={`members.${i}.name`}
            label="Full name"
            value={m.name}
            onChange={editMember(i, 'name')}
            error={errors[`members.${i}.name`]}
            placeholder="As on your college ID"
            autoComplete="off"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              name={`members.${i}.email`}
              label="Institutional or work email"
              value={m.email}
              onChange={editMember(i, 'email')}
              error={errors[`members.${i}.email`]}
              type="email"
              inputMode="email"
              placeholder="name@college.edu"
              autoComplete="off"
            />
            <Field
              name={`members.${i}.phone`}
              label="Mobile number"
              value={m.phone}
              onChange={editMember(i, 'phone')}
              error={errors[`members.${i}.phone`]}
              type="tel"
              inputMode="tel"
              prefix="+91"
              placeholder="98765 43210"
              autoComplete="off"
            />
          </div>
        </Section>
      ))}

      {count < MAX_MEMBERS ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-dashed border-navy-950/25 px-5 py-4">
          <p className="text-navy-950/85">
            <span className="font-heading font-semibold">Have a 3rd member?</span> A team can have up
            to {MAX_MEMBERS} people.
          </p>
          <button
            type="button"
            onClick={() => setCount(3)}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-navy-950 px-5 py-2 font-heading text-sm font-semibold text-navy-950 transition hover:bg-navy-950 hover:text-cream"
          >
            <Plus size={16} aria-hidden="true" />
            Add member 3
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCount(2)}
          className="inline-flex items-center gap-1.5 justify-self-start rounded-full px-1 font-heading text-sm font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-950"
        >
          <X size={16} aria-hidden="true" />
          Remove member 3
        </button>
      )}


      <div className={card}>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            data-field="consent"
            checked={consent}
            onChange={(e) => edit(setConsent)(e.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'consent-err' : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-navy-700"
          />
          <span className="text-navy-950/90">
            I confirm the details above are correct, and that every member agrees to be contacted
            on the email and phone number given about GDP Talks. I understand the registration is locked
            once it is submitted.
          </span>
        </label>
        {errors.consent && (
          <p id="consent-err" role="alert" className="mt-2 text-sm font-medium text-red-800">
            {errors.consent}
          </p>
        )}
      </div>

      {status.state === 'error' && (
        <p role="alert" className="rounded-2xl border-2 border-red-800/40 bg-white px-5 py-3 font-medium text-red-800">
          {status.message}
        </p>
      )}
      {attempted && Object.keys(errors).length > 0 && status.state !== 'error' && (
        <p role="alert" className="font-medium text-red-800">
          Please fix the highlighted fields.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-heading text-base font-semibold text-navy-950 shadow-md transition hover:bg-gold-200 disabled:opacity-60"
        >
          {sending ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Lock size={18} aria-hidden="true" />
          )}
          {sending ? 'Registering…' : 'Complete registration and lock roster'}
        </button>
        <p className="inline-flex items-center gap-2 text-sm text-navy-950/70">
          <ShieldCheck size={16} aria-hidden="true" />
          Your details are used only for the purpose of the GDP Talks event.
        </p>
      </div>
    </form>
  );
}
