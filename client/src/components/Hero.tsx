'use client';

import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import heroImage from '../assets/GDPTalks.png';

export default function Hero() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section
      id="top"
      className="gdp-hero relative min-h-screen overflow-hidden bg-[#F0EFEA] text-[#0A1E3F]"
    >
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-[#FEE39F]/30 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#2A5A96]/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Navigation */}
      <header className="relative z-20 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <a href="#top" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#0A1E3F] bg-[#EFBB55] font-heading text-xl font-bold text-[#0A1E3F] transition-transform duration-300 group-hover:-rotate-6">
            G
          </span>

          <span className="font-heading text-sm font-bold uppercase tracking-[0.2em] sm:text-base">
            GDP TALKS
          </span>
        </a>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-10 md:flex">
          <a
            href="#about"
            className="font-heading text-sm font-medium transition-colors hover:text-[#2A5A96]"
          >
            About
          </a>

          <a
            href="#domains"
            className="font-heading text-sm font-medium transition-colors hover:text-[#2A5A96]"
          >
            Challenges
          </a>

          <a
            href="#mentors"
            className="font-heading text-sm font-medium transition-colors hover:text-[#2A5A96]"
          >
            Mentors
          </a>

          <Link
            href="/register"
            className="rounded-xl bg-[#0A1E3F] px-7 py-4 font-heading text-sm font-bold uppercase tracking-wide text-[#F0EFEA] transition duration-300 hover:-translate-y-1 hover:bg-[#102F5C]"
          >
            Register Now
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          className="rounded-lg border border-[#0A1E3F]/15 p-3 md:hidden"
          aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <nav className="relative z-30 mx-5 flex flex-col gap-5 rounded-2xl border border-[#0A1E3F]/10 bg-[#F0EFEA] px-6 py-5 shadow-lg md:hidden">
          <a
            href="#about"
            className="font-heading text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            About
          </a>

          <a
            href="#domains"
            className="font-heading text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Challenges
          </a>

          <a
            href="#mentors"
            className="font-heading text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Mentors
          </a>

          <Link
            href="/register"
            className="rounded-xl bg-[#0A1E3F] px-5 py-3 text-center font-heading text-sm font-bold text-[#F0EFEA]"
            onClick={() => setMobileMenuOpen(false)}
          >
            Register Now
          </Link>
        </nav>
      )}

      {/* Hero content */}
      <div className="mx-auto grid min-h-[calc(100svh-88px)] max-w-[1440px] items-center gap-8 px-6 pb-16 pt-8 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 lg:px-16 lg:py-10">

        {/* Left: Illustration */}
        <div className="gdp-illustration relative order-2 flex items-center justify-center lg:order-1">
          <div
            className="absolute left-[10%] top-[15%] h-32 w-32 rounded-full bg-[#EFBB55]/25 blur-2xl"
            aria-hidden="true"
          />

          <Image
            src={heroImage}
            alt="GDP Talks 2026 illustration featuring creative building blocks and people collaborating"
            className="relative z-10 w-full max-w-[760px] object-contain drop-shadow-sm"
            sizes="(max-width: 1024px) 100vw, 760px"
            priority
          />
        </div>

        {/* Right: Typography */}
        <div className="gdp-copy relative z-10 order-1 lg:order-2">
          <p className="mb-5 font-heading text-xs font-bold uppercase tracking-[0.28em] text-[#2A5A96] sm:text-sm">
            Students × Companies × Ideas
          </p>

          <h1 className="font-heading text-[clamp(3.2rem,6vw,6.5rem)] font-normal leading-[0.98] tracking-[-0.065em]">
            Where{' '}
            <span className="font-bold">ideas</span>

            <br />

            meet{' '}
            <span className="font-bold">
              reality<span className="text-[#EFBB55]">.</span>
            </span>
          </h1>

          <p className="mt-7 font-heading text-sm font-bold uppercase tracking-[0.32em] text-[#102F5C] sm:text-base lg:text-lg">
            GDP TALKS 2026
          </p>

          <div className="my-6 h-[3px] w-16 rounded-full bg-[#EFBB55]" />

          <p className="max-w-lg font-body text-sm leading-[1.9] text-[#0A1E3F]/80 sm:text-base lg:text-lg">
            Students and companies.
            <br />
            Real problems. Things worth building.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <a
              href="#conversation"
              className="group inline-flex items-center gap-5 rounded-xl bg-[#0A1E3F] px-6 py-4 font-heading text-sm font-bold uppercase tracking-wide text-[#F0EFEA] shadow-lg shadow-[#0A1E3F]/10 transition duration-300 hover:-translate-y-1 hover:bg-[#102F5C] sm:px-9 sm:py-5 sm:text-base"
            >
              Explore GDP Talks

              <ArrowRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-2"
              />
            </a>
          </div>

          <p className="mt-8 font-heading text-xs font-medium uppercase tracking-[0.18em] text-[#2A5A96]/70">
            Think it. Build it. Ship it.
          </p>
        </div>
      </div>

      {/* Decorative corner */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 translate-x-1/3 translate-y-1/3 rounded-full bg-[#FEE39F]/40 blur-3xl"
        aria-hidden="true"
      />
    </section>
  );
}