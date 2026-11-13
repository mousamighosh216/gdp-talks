'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

const POPUP_SHOWN_KEY = 'gdp-talks-peer-talks-popup-shown';

export default function EventPopUp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(POPUP_SHOWN_KEY)) return;

    const timer = window.setTimeout(() => {
      window.sessionStorage.setItem(POPUP_SHOWN_KEY, 'true');
      setIsOpen(true);
    }, 1_000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <aside
      role="complementary"
      aria-labelledby="event-popup-title"
      className="pop fixed inset-x-4 bottom-4 z-[70] mx-auto max-h-[80vh] max-w-xl overflow-y-auto rounded-3xl border-2 border-dotted border-navy-950/55 bg-cream p-5 text-navy-950 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0 sm:p-6"
    >
      <button
        type="button"
        aria-label="Close Peer-Talks registration details"
        onClick={() => setIsOpen(false)}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-navy-950 transition hover:bg-navy-950/10"
      >
        <X size={20} aria-hidden="true" />
      </button>

      <div className="flex items-start gap-4 pr-8">
        <Image
          src="/favicon.png"
          alt="GDP Talks"
          width={144}
          height={96}
          className="mt-1 h-auto w-24 shrink-0 rounded-xl object-contain sm:w-28"
        />
        <div>
          <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-700">
            Peer-Talks registration
          </p>
          <h2 id="event-popup-title" className="mt-1 font-heading text-xl font-bold sm:text-2xl">
            Share your event idea
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-navy-950/85">
        Register as a participant and tell us about your event. Have these details ready:
      </p>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-navy-950/85 marker:text-navy-700">
        <li>Your name, email address, and mobile number</li>
        <li>An event description of at least 50 words</li>
        <li>A key takeaway of at least 20 words</li>
        <li>Document links (separate multiple links with commas)</li>
        <li>Your consent to the registration terms</li>
      </ul>

      <Link
        href="/talks"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-5 py-3 font-heading text-sm font-semibold text-navy-950 shadow-sm transition hover:bg-gold-200 sm:w-auto"
      >
        Register for Peer-Talks
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
    </aside>
  );
}