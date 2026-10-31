import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Bot } from 'lucide-react';
import { PEOPLE } from '@/components/Avatar';
import FloatingBackdrop from '@/components/FloatingBackdrop';
import { STORY } from '@/lib/docandengi/story';

export const metadata: Metadata = { title: 'Doc D' };

function ProfileImage({ who, alt, className }: { who: 'x' | 'd'; alt: string; className: string }) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}>
      <Image
        src={`/${who}.jpg`}
        alt={alt}
        fill
        sizes="60px"
        className="object-cover object-[center_30%]"
      />
    </span>
  );
}

export default function DocD() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-navy-950 pt-16 text-cream">
      <FloatingBackdrop preset="about" theme="dark" />
      <div className="relative mx-auto w-full max-w-6xl px-5 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-4 py-1.5 font-heading text-sm font-semibold text-navy-950">
            <Bot size={16} aria-hidden="true" />
            Coming soon
          </span>

          <h1 className="type-head mt-6 font-heading font-bold tracking-tight">
            With Doc D know how real engineering works.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-cream/75">
            Soon you will be able to talk to Doc D yourself and ask him anything about building,
            hosting and shipping. Until then, catch up on how he helped Engineer X.
          </p>
        </div>

        <div
          className="pop mx-auto mt-10 max-w-2xl overflow-hidden rounded-3xl border border-white/50 bg-cream text-navy-950 shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:mt-12"
          role="region"
          aria-label="A preview of the conversation between Engineer X and Doc D"
        >
          <div className="flex items-center justify-between border-b border-navy-950/10 px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <ProfileImage who="x" alt="" className="h-9 w-9 ring-2 ring-cream" />
                <ProfileImage who="d" alt="" className="h-9 w-9 ring-2 ring-cream" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold">Engineer X &amp; Doc D</p>
                <p className="text-xs text-navy-950/55">A conversation about getting it out there</p>
              </div>
            </div>
            <span className="hidden items-center gap-2 rounded-full bg-gold-400/25 px-3 py-1 font-heading text-xs font-semibold text-navy-950 sm:inline-flex">
              <span className="h-2 w-2 rounded-full bg-green-600" aria-hidden="true" />
              Chat preview
            </span>
          </div>

          <div className="space-y-4 px-4 py-5 sm:px-7 sm:py-6" aria-live="polite">
            {STORY.slice(0, 2).map((message, index) => {
              const isEngineer = message.from === 'x';
              return (
                <div
                  key={index}
                  className={`pop flex items-end gap-2.5 ${isEngineer ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${index * 0.12}s` }}
                >
                  {!isEngineer && <ProfileImage who="d" alt="" className="h-8 w-8" />}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%] ${
                      isEngineer
                        ? 'rounded-br-sm bg-navy-500 text-cream'
                        : 'rounded-bl-sm bg-white text-navy-950'
                    }`}
                  >
                    <p
                      className={`mb-1 font-heading text-[11px] font-bold ${
                        isEngineer ? 'text-gold-200' : 'text-navy-700'
                      }`}
                    >
                      {PEOPLE[message.from].name}
                    </p>
                    <p>{message.text}</p>
                  </div>
                  {isEngineer && <ProfileImage who="x" alt="" className="h-8 w-8" />}
                </div>
              );
            })}

            <div className="flex items-center gap-2.5 pl-10">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                <span className="sr-only">Engineer X is typing</span>
                <span className="dot h-1.5 w-1.5 rounded-full bg-navy-700" aria-hidden="true" />
                <span className="dot h-1.5 w-1.5 rounded-full bg-navy-700" aria-hidden="true" />
                <span className="dot h-1.5 w-1.5 rounded-full bg-navy-700" aria-hidden="true" />
              </div>
              <span className="font-heading text-xs text-navy-950/55">Engineer X is typing…</span>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-xl grid-cols-2 gap-6 sm:mt-12 sm:gap-12">
          {([
            { who: 'x', title: 'Engineer X', subtitle: 'Big ideas, first deploy' },
            { who: 'd', title: 'Doc D', subtitle: 'Here to help you ship' },
          ] as const).map(({ who, title, subtitle }) => (
            <figure key={who} className="flex flex-col items-center text-center">
              <div className="relative h-36 w-36 overflow-hidden rounded-full border-4 border-gold-400 bg-cream shadow-xl sm:h-48 sm:w-48">
                <Image
                  src={`/${who}.jpg`}
                  alt={`${title} portrait`}
                  fill
                  sizes="(max-width: 640px) 144px, 192px"
                  className="object-cover object-[center_30%]"
                />
              </div>
              <figcaption className="mt-4">
                <p className="font-heading text-lg font-bold text-cream">{title}</p>
                <p className="mt-1 text-sm text-cream/60">{subtitle}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-heading text-sm font-semibold text-navy-950 transition hover:bg-gold-200"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to the story
          </Link>
        </div>
      </div>
    </section>
  );
}
