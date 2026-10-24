'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import { SECTOR_UI, IDLE_THEME } from '@/lib/sectors/sectors';
import type { SectorSummary } from '@/lib/types';

export default function Companies({ sectors }: { sectors: SectorSummary[] }) {
  const [active, setActive] = useState<SectorSummary | null>(null); // desktop: hovered / focused sector
  const [openSlug, setOpenSlug] = useState<string | null>(sectors[0]?.slug ?? null); // phone: selected sector (defaults to first)

  // Determine current active theme and data for desktop vs mobile
  const currentDesktop = active ?? sectors.find((s) => s.slug === openSlug) ?? null;
  const currentMobile = sectors.find((s) => s.slug === openSlug) ?? sectors[0] ?? null;
  
  const current = active ?? currentMobile;
  const ui = current ? SECTOR_UI[current.slug] : null;
  const theme = ui ?? IDLE_THEME;

  const ActiveIconDesktop = currentDesktop ? SECTOR_UI[currentDesktop.slug]?.icon : null;
  const ActiveIconMobile = currentMobile ? SECTOR_UI[currentMobile.slug]?.icon : null;
  const mobileUi = currentMobile ? SECTOR_UI[currentMobile.slug] : null;

  // Pattern chunker to enforce [3, 2, 3] layout across both views
  const rows: SectorSummary[][] = [];
  const pattern = [3, 2, 3];
  let currentIndex = 0;
  let patternIndex = 0;

  while (currentIndex < sectors.length) {
    const chunkSize = pattern[patternIndex % pattern.length];
    rows.push(sectors.slice(currentIndex, currentIndex + chunkSize));
    currentIndex += chunkSize;
    patternIndex++;
  }

  return (
    <section
      id="companies"
      className="relative overflow-hidden border-t border-navy-950/10 py-20 transition-colors duration-700 ease-out md:py-32"
      style={{ backgroundColor: theme.bg, color: theme.fg }}
    >
      <FloatingBackdrop preset="companies" />
      <div className="relative mx-auto max-w-6xl px-5">
        <p className="font-heading text-sm font-semibold uppercase tracking-widest text-navy-500">
          Companies
        </p>
        <h2 className="mt-2 max-w-2xl font-heading text-3xl font-bold sm:text-4xl md:text-5xl">
          The sectors we are approaching
        </h2>

        {/* ================= DESKTOP VIEW ================= */}
        <div className="mt-14 hidden items-center gap-12 md:grid md:grid-cols-2 lg:gap-16">
          {/* Logo box */}
          <div
            className="relative grid aspect-square w-full max-w-md place-items-center overflow-hidden rounded-[2rem] p-8 shadow-xl shadow-navy-950/15 transition-colors duration-700 ease-out"
            style={{ backgroundColor: theme.boxBg, color: theme.boxFg }}
            aria-live="polite"
          >
            {currentDesktop && ActiveIconDesktop ? (
              <div className="pop flex flex-col items-start" key={currentDesktop.slug}>
                <ActiveIconDesktop size={96} strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-6 font-heading text-3xl font-bold">{currentDesktop.name}</p>
                <p className="mt-2 max-w-xs text-lg opacity-85">{currentDesktop.tagline}</p>
              </div>
            ) : (
              <div className="flex flex-col items-start">
                <img
                  src="/logo-placeholder.svg"
                  alt="Company logo placeholder"
                  className="h-40 w-40"
                />
                <p className="mt-4 text-sm opacity-75">Hover a sector to explore it</p>
              </div>
            )}
          </div>

          {/* Desktop Sector grid (3, 2, 3 layout) */}
          <div onMouseLeave={() => setActive(null)} className="flex flex-col gap-6 lg:gap-8">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap items-center gap-3 lg:gap-4">
                {row.map((s, itemIndex) => {
                  const isActive = active?.slug === s.slug;
                  return (
                    <div key={s.slug} className="flex items-center gap-3 lg:gap-4">
                      <Link
                        href={`/sectors/${s.slug}`}
                        onMouseEnter={() => setActive(s)}
                        onFocus={() => setActive(s)}
                        onBlur={() => setActive(null)}
                        className={`font-heading text-lg font-semibold transition-all duration-300 xl:text-2xl ${
                          isActive ? 'opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
                        }`}
                      >
                        {s.name}
                      </Link>
                      {itemIndex < row.length - 1 && (
                        <span className="text-xl opacity-30" aria-hidden="true">&bull;</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ================= MOBILE VIEW ================= */}
        <div className="mt-8 flex flex-col gap-8 md:hidden">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
            Tap a sector to explore
          </p>

          {/* Mobile Sector Cluster (3, 2, 3 rows with bullets) */}
          <div className="flex flex-col gap-4">
            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-wrap items-center gap-2 sm:gap-3">
                {row.map((s, itemIndex) => {
                  const isSelected = openSlug === s.slug;
                  return (
                    <div key={s.slug} className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenSlug(s.slug)}
                        className={`text-left font-heading text-base font-semibold transition-all duration-300 sm:text-lg ${
                          isSelected ? 'scale-105 opacity-100 underline decoration-2 underline-offset-4' : 'opacity-60'
                        }`}
                      >
                        {s.name}
                      </button>
                      {itemIndex < row.length - 1 && (
                        <span className="text-sm opacity-30" aria-hidden="true">&bull;</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Dynamic Mobile Card */}
          {currentMobile && mobileUi && ActiveIconMobile && (
            <div
              key={currentMobile.slug}
              className="pop flex flex-col gap-4 rounded-2xl p-6 shadow-lg transition-colors duration-500 ease-out"
              style={{ backgroundColor: mobileUi.boxBg, color: mobileUi.boxFg }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy-950/10">
                  <ActiveIconMobile size={28} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-heading text-xl font-bold">{currentMobile.name}</h3>
                  <p className="text-xs font-medium opacity-80">{currentMobile.tagline}</p>
                </div>
              </div>

              <p className="text-sm leading-relaxed opacity-90">{currentMobile.summary}</p>

              <Link
                href={`/sectors/${currentMobile.slug}`}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-2.5 font-heading text-sm font-semibold text-cream transition active:scale-95"
              >
                See {currentMobile.name} problems
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}