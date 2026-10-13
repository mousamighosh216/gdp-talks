'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Avatar, { PEOPLE } from './Avatar';
import FloatingBackdrop from './FloatingBackdrop';
import HeroAsset from './HeroAsset';
import { STORY } from '@/lib/story';

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  
  // Typewriter state
  const [storyIndex, setStoryIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!STORY || STORY.length === 0) return;

    const currentMessage = STORY[storyIndex].text;

    // Pause when finished typing
    if (charIndex === currentMessage.length && !isDeleting) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000); 
      return () => clearTimeout(timeout);
    }

    // Move to next person when finished deleting
    if (charIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setStoryIndex((prev) => (prev + 1) % STORY.length);
      return;
    }

    // Typing/Deleting speeds (decreased values to make it faster)
    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, isDeleting ? 15 : 30); // Was 30/60, now 15/30 for snappier typing

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, storyIndex]);

  const activeMessage = STORY[storyIndex];
  const displayedText = activeMessage?.text.substring(0, charIndex) || '';

  return (
    <section
      id="top"
      ref={ref}
      className="relative bg-cream h-screen"
    >
      <div className="sticky top-0 h-screen overflow-hidden pt-16">
        <FloatingBackdrop preset="hero" />

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

          {/* Story: Typewriter effect */}
          <div
            className="order-3 min-w-0 lg:col-start-1 lg:row-start-2"
            role="region"
            aria-live="polite"
            aria-label="Story: Engineer X learns about hosting from Doc D"
          >
            <p className="font-heading text-xs font-semibold uppercase tracking-widest text-navy-500">
              A short story
            </p>

            <div className="mt-3 min-h-38 sm:min-h-44">
              {activeMessage && (
                <div
                  key={activeMessage.from}
                  className={`pop flex max-w-xl items-start gap-3 ${activeMessage.from === 'd' ? 'lg:ml-6' : ''}`}
                >
                  <Avatar who={activeMessage.from} className="h-9 w-9 text-xs" />
                  <div
                    className={`rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm min-w-[12rem] ${
                      activeMessage.from === 'x' ? 'bg-navy-500 text-cream' : 'bg-navy-950 text-cream'
                    }`}
                  >
                    <p className="mb-0.5 font-heading text-xs font-semibold text-gold-200">
                      {PEOPLE[activeMessage.from].name}
                    </p>
                    
                    {/* CSS Grid hack to pre-allocate size */}
                    <div className="grid">
                      {/* Invisible full text pushes the container to its final size */}
                      <p className="type-chat invisible col-start-1 row-start-1" aria-hidden="true">
                        {activeMessage.text}
                      </p>
                      
                      {/* Visible typing text sits exactly on top */}
                      <p className="type-chat col-start-1 row-start-1">
                        {displayedText}
                        <span className="animate-pulse">|</span>
                      </p>
                    </div>

                  </div>
                </div>
              )}

              <Link
                href="/doc-d"
                className="pop mt-6 inline-flex items-center gap-3 rounded-full bg-gold-400 py-2.5 pl-3 pr-6 font-heading text-base font-semibold text-navy-950 shadow-md transition hover:bg-gold-200"
              >
                <Avatar who="d" className="h-9 w-9 text-xs" />
                Meet Doc D
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* What GDP Talks is */}
          <div className="order-2 min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <HeroAsset />
          </div>
        </div>
      </div>
    </section>
  );
}