import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, CheckCheck, ChevronDown } from 'lucide-react';
import Avatar, { PEOPLE, type Who } from './Avatar';
import FloatingBackdrop from './FloatingBackdrop';
import { useScrollProgress } from '../lib/useScrollProgress';
import { PAIRS, STAGES, getChatState } from '../lib/story';

function TypingBubble({ who }: { who: Who }) {
  return (
    <div className={`pop flex ${who === 'd' ? 'sm:ml-10' : ''}`} aria-hidden="true">
      <div className="flex items-center gap-1.5 rounded-2xl bg-navy-950/90 px-4 py-3">
        <span className="dot h-2 w-2 rounded-full bg-cream" />
        <span className="dot h-2 w-2 rounded-full bg-cream" />
        <span className="dot h-2 w-2 rounded-full bg-cream" />
      </div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progress = useScrollProgress(ref);
  const chat = getChatState(progress);

  const shown = chat.pairIndex === null ? [] : PAIRS[chat.pairIndex].slice(0, chat.visible);

  return (
    <section
      id="top"
      ref={ref}
      className="relative bg-cream"
      style={{ height: `${100 + (STAGES - 1) * 45}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden pt-16">
        <FloatingBackdrop preset="hero" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center gap-5 px-5 lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
          {/* Left: subtitle, title, what GDP Talks is, and a pointer to the conversation */}
          <div className="min-w-0">
            <p className="type-sub font-heading font-medium text-navy-700">
              smart people should keep meeting
            </p>
            <h1 className="type-head mt-2 font-heading font-bold tracking-tight text-navy-950">
              GDP Talks
            </h1>

            <div className="mt-5 max-w-xl rounded-3xl border-2 border-navy-950/15 bg-white/55 p-5 sm:mt-7 sm:p-6">
              <p className="text-base leading-relaxed text-navy-950/85 sm:text-lg">
                GDP Talks is a hackathon where students and companies meet to solve real problems
                together. Build something real, learn how to actually ship it, and keep the
                conversation going.
              </p>
              <p className="mt-3 inline-flex items-center gap-2 font-heading text-sm font-semibold text-navy-700 sm:text-base">
                Follow the conversation between Doc D and Engineer X
                <ArrowRight size={18} className="hidden lg:block" aria-hidden="true" />
                <ArrowDown size={18} className="lg:hidden" aria-hidden="true" />
              </p>
            </div>
          </div>

          {/* Right: the conversation. No frame, two messages at a time, driven by scrolling */}
          <div
            className="min-w-0"
            role="log"
            aria-live="polite"
            aria-label="Engineer X and Doc D conversation"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-3">
                <Avatar who="d" className="h-9 w-9 text-xs" />
                <Avatar who="x" className="h-9 w-9 text-xs" />
              </div>
              <div className="leading-tight">
                <p className="font-heading text-sm font-semibold text-navy-950">
                  Engineer X · Doc D
                </p>
                <p className="text-sm text-navy-700">
                  {chat.typing ? `${PEOPLE[chat.typing].name} is typing…` : 'online'}
                </p>
              </div>
            </div>

            <div className="mt-4 flex min-h-[13rem] flex-col gap-3 sm:min-h-[17rem]">
              {shown.map((m, i) => (
                <div
                  key={`${chat.pairIndex}-${i}`}
                  className={`pop max-w-[96%] self-start rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm ${
                    m.from === 'x'
                      ? 'bg-navy-500 text-cream'
                      : 'bg-navy-950 text-cream sm:ml-10'
                  }`}
                >
                  <p className="mb-0.5 font-heading text-xs font-semibold text-gold-200">
                    {PEOPLE[m.from].name}
                  </p>
                  <p className="type-chat">{m.text}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-cream/70">
                    {m.time}
                    {m.from === 'x' && (
                      <CheckCheck size={14} className="text-gold-200" aria-hidden="true" />
                    )}
                  </p>
                </div>
              ))}

              {chat.typing && <TypingBubble who={chat.typing} />}

              {!shown.length && !chat.typing && (
                <p className="inline-flex items-center gap-2 text-navy-700">
                  <ChevronDown size={18} className="bob" aria-hidden="true" />
                  Scroll to start the conversation
                </p>
              )}

              {chat.showCta && (
                <Link
                  to="/doc-d"
                  className="pop mt-2 inline-flex items-center gap-3 self-start rounded-full bg-gold-400 py-2.5 pl-3 pr-6 font-heading text-base font-semibold text-navy-950 shadow-md transition hover:bg-gold-200"
                >
                  <Avatar who="d" className="h-9 w-9 text-xs" />
                  Chat with Doc D yourself
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
