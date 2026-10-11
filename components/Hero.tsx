'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react';
import Avatar, { PEOPLE } from './Avatar';
import FloatingBackdrop from './FloatingBackdrop';
import HeroAsset from './HeroAsset';
import { REGISTER_URL } from '@/lib/api';
import { useScrollProgress } from '@/lib/useScrollProgress';
import { STAGES, STORY, getChatState } from '@/lib/story';


export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref);
  const chat = getChatState(progress);
  const message = chat.index === null ? null : STORY[chat.index];

  return (
    <section
      id="top"
      ref={ref}
      className="relative bg-cream"
      style={{ height: `${100 + (STAGES - 1) * 45}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden pt-16">
        <FloatingBackdrop preset="hero" />

        {/* One grid: phones read title, what it is, then the story; desktop is two columns. */}
        <div className="relative mx-auto grid h-full max-w-6xl content-center gap-5 px-5 lg:grid-cols-2 lg:gap-x-14 lg:gap-y-7">
          {/* Title block */}
          <div className="order-1 min-w-0 lg:col-start-1 lg:row-start-1">
            <p className="type-sub font-heading font-medium text-navy-700">
              smart people should keep meeting
            </p>
            <h1 className="type-head mt-2 font-heading font-bold tracking-tight text-navy-950">
              GDP Talks
            </h1>
          </div>

          {/* Story: one message at a time, driven by scrolling */}
          <div
            className="order-3 min-w-0 lg:col-start-1 lg:row-start-2"
            role="region"
            aria-live="polite"
            aria-label="Story: Engineer X learns about hosting from Doc D"
          >
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500">
              A short story
            </p>

            <div className="mt-3 min-h-[9.5rem] sm:min-h-[11rem]">
              {message ? (
                <div
                  key={chat.index}
                  className={`pop flex max-w-xl items-start gap-3 ${message.from === 'd' ? 'lg:ml-6' : ''}`}
                >
                  <Avatar who={message.from} className="h-9 w-9 text-xs" />
                  <div
                    className={`rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm ${
                      message.from === 'x' ? 'bg-navy-500 text-cream' : 'bg-navy-950 text-cream'
                    }`}
                  >
                    <p className="mb-0.5 font-heading text-xs font-semibold text-gold-200">
                      {PEOPLE[message.from].name}
                    </p>
                    <p className="type-chat">{message.text}</p>
                  </div>
                </div>
              ) : (
                <p className="inline-flex items-center gap-2 text-navy-700">
                  <ChevronDown size={18} className="bob" aria-hidden="true" />
                  Scroll down to read it,
                </p>
              )}

              {chat.showCta && (
                <Link
                  href="/doc-d"
                  className="pop mt-4 inline-flex items-center gap-3 rounded-full bg-gold-400 py-2.5 pl-3 pr-6 font-heading text-base font-semibold text-navy-950 shadow-md transition hover:bg-gold-200"
                >
                  <Avatar who="d" className="h-9 w-9 text-xs" />
                  Meet Doc D
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          {/* What GDP Talks is */}
          <div className="order-2 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            {/* <div className="rounded-3xl border-2 border-navy-950/15 bg-white/60 p-5 sm:p-6">
              <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500">
                What is GDP Talks?
              </p>
              <p className="mt-2 text-base leading-relaxed text-navy-950/90 sm:text-lg">
                A hackathon where students solve real problem statements brought by companies. Pick
                a sector, build something that works, and learn how to ship it.
              </p>
            </div>

            <p className="mt-4 inline-flex items-center gap-2 font-heading text-sm font-semibold text-navy-700 sm:text-base">
              Follow the conversation between Doc D and Engineer X
              <ArrowDown size={18} className="lg:hidden" aria-hidden="true" />
              <ArrowRight size={18} className="hidden rotate-180 lg:block" aria-hidden="true" />
            </p> */}

            <HeroAsset />
          </div>
        </div>
      </div>
    </section>
  );
}
