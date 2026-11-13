'use client';

import { useId, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Loader2, Lock, ShieldCheck } from 'lucide-react';
import {
  validateRegistration,
  type EventRegistration,
  type FieldErrors,
} from '@/lib/event/eventregistration';

const inputClass =
  'w-full rounded-xl border-2 bg-white px-4 py-3 text-navy-950 placeholder:text-navy-950/40 focus:border-navy-700 focus:outline-none focus:ring-4 focus:ring-gold-400/40';
const card = 'rounded-3xl border-2 border-navy-950/15 bg-white/60 p-5 sm:p-7';

type FormValues = Required<EventRegistration>;
type Status =
  | { state: 'idle' | 'sending' }
  | { state: 'error'; message: string }
  | { state: 'done'; reference: string; emailSent: boolean };

function TextField({
  name,
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  prefix,
}: {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  prefix?: string;
}) {
  const id = useId();
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
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`${inputClass} ${error ? 'border-red-700' : 'border-navy-950/20'}`}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

function TextAreaField({
  name,
  label,
  value,
  onChange,
  error,
  hint,
  rows = 5,
}: {
  name: keyof FormValues;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-heading text-sm font-semibold text-navy-950">
        {label}
      </label>
      <textarea
        id={id}
        data-field={name}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputClass} mt-2 resize-y ${error ? 'border-red-700' : 'border-navy-950/20'}`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-navy-950/65">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-red-800">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EventForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
    phone: '',
    eventDescription: '',
    eventTakeway: '',
    documentLinks: '',
    consent: false,
  });
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const clientErrors: FieldErrors = useMemo(() => {
    if (!attempted) return {};
    const result = validateRegistration(values);
    return result.ok ? {} : result.errors;
  }, [attempted, values]);
  const errors = { ...clientErrors, ...serverErrors };

  const edit = <K extends keyof FormValues>(key: K) => (value: FormValues[K]) => {
    setServerErrors({});
    setValues((current) => ({ ...current, [key]: value }));
  };

  const focusFirstError = (fieldErrors: FieldErrors) => {
    const fields = Array.from(formRef.current?.querySelectorAll<HTMLElement>('[data-field]') ?? []);
    fields.find((field) => fieldErrors[field.dataset.field ?? ''])?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.state === 'sending') return;

    setAttempted(true);
    setServerErrors({});
    const result = validateRegistration(values);
    if (!result.ok) {
      setStatus({ state: 'idle' });
      focusFirstError(result.errors);
      return;
    }

    setStatus({ state: 'sending' });
    try {
      const response = await fetch('/api/event-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.value),
      });
      const body = (await response.json().catch(() => ({}))) as {
        reference?: string;
        emailSent?: boolean;
        error?: string;
        errors?: FieldErrors;
      };

      if (response.ok && body.reference) {
        setStatus({
          state: 'done',
          reference: body.reference,
          emailSent: body.emailSent === true,
        });
        window.scrollTo({ top: 0 });
        return;
      }
      if (body.errors) {
        const fieldErrors = body.errors;
        setServerErrors(fieldErrors);
        setStatus({ state: 'idle' });
        setTimeout(() => focusFirstError(fieldErrors), 0);
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
        <h2 className="mt-4 font-heading text-3xl font-bold text-navy-950">Registration received</h2>
        <p className="mt-2 max-w-xl text-lg leading-relaxed text-navy-950/85">
          Your event registration has been saved. Keep this reference if you need to contact the organisers.
        </p>
        <p className="mt-2 max-w-xl text-navy-950/85">
          {status.emailSent
            ? 'A confirmation email with your registration details and reference has been sent to your email address.'
            : 'Your registration is saved, but we could not send the confirmation email. Keep the reference above and contact the organisers if needed.'}
        </p>
        <p className="m-5  inline-block rounded-2xl bg-navy-950 px-5 py-3 font-heading text-2xl font-bold tracking-widest text-gold-200">
          {status.reference}
        </p>
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
      <section className={card} aria-labelledby="event-contact-heading">
        <h2 id="event-contact-heading" className="font-heading text-xl font-bold text-navy-950">
          Your details
        </h2>
        <div className="mt-6 grid gap-5">
          <TextField
            name="name"
            label="Full name"
            value={values.name}
            onChange={edit('name')}
            error={errors.name}
            placeholder="As on your college ID"
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="email"
              label="Email"
              value={values.email}
              onChange={edit('email')}
              error={errors.email}
              placeholder="name@college.edu"
              type="email"
            />
            <TextField
              name="phone"
              label="Mobile number"
              value={values.phone}
              onChange={edit('phone')}
              error={errors.phone}
              placeholder="98765 43210"
              type="tel"
              prefix="+91"
            />
          </div>
        </div>
      </section>

      <section className={card} aria-labelledby="event-details-heading">
        <h2 id="event-details-heading" className="font-heading text-xl font-bold text-navy-950">
          Event details
        </h2>
        <div className="mt-6 grid gap-5">
          <TextAreaField
            name="eventDescription"
            label="Event description"
            value={values.eventDescription}
            onChange={edit('eventDescription')}
            error={errors.eventDescription}
            hint="Describe your event in at least 50 words."
          />
          <TextAreaField
            name="eventTakeway"
            label="Key takeaway"
            value={values.eventTakeway}
            onChange={edit('eventTakeway')}
            error={errors.eventTakeway}
            hint="Share the key takeaway in at least 20 words."
          />
          <TextAreaField
            name="documentLinks"
            label="Document links"
            value={values.documentLinks}
            onChange={edit('documentLinks')}
            error={errors.documentLinks}
            hint="Enter one or more links, separated by commas."
            rows={3}
          />
        </div>
      </section>

      <div className={card}>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            data-field="consent"
            checked={values.consent}
            onChange={(event) => edit('consent')(event.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'event-consent-error' : undefined}
            className="mt-1 h-5 w-5 shrink-0 accent-navy-700"
          />
          <span className="text-navy-950/90">
            I confirm the information above is correct and agree to be contacted about this event.
          </span>
        </label>
        {errors.consent && (
          <p id="event-consent-error" role="alert" className="mt-2 text-sm font-medium text-red-800">
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
          {sending ? 'Submitting…' : 'Submit event registration'}
        </button>
        <p className="inline-flex items-center gap-2 text-sm text-navy-950/70">
          <ShieldCheck size={16} aria-hidden="true" />
          Your details are used only for the purpose of the GDP Talks event.
        </p>
      </div>
    </form>
  );
}