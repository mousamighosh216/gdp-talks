import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import { fallbackSectors } from '../lib/api';
import { SECTOR_UI, IDLE_THEME } from '../lib/sectors';
import type { Sector } from '../types';

export default function Companies() {
  const [active, setActive] = useState<Sector | null>(null);
  const ui = active ? SECTOR_UI[active.slug] : null;
  const theme = ui ?? IDLE_THEME;
  const ActiveIcon = ui?.icon;

  return (
    <section
      id="companies"
      className="relative overflow-hidden py-24 transition-colors duration-700 ease-out md:py-32"
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

        <div className="mt-14 grid items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* Logo box */}
          <div
            className="relative grid aspect-square w-full max-w-md place-items-center overflow-hidden rounded-[2rem] p-8 shadow-xl shadow-navy-950/15 transition-colors duration-700 ease-out"
            style={{ backgroundColor: theme.boxBg, color: theme.boxFg }}
            aria-live="polite"
          >
            {active && ActiveIcon ? (
              <div className="pop flex flex-col items-start" key={active.slug}>
                <ActiveIcon size={96} strokeWidth={1.5} aria-hidden="true" />
                <p className="mt-6 font-heading text-3xl font-bold">{active.name}</p>
                <p className="mt-2 max-w-xs text-lg opacity-85">{active.tagline}</p>
              </div>
            ) : (
              <div className="flex flex-col items-start">
                {/* Replace /public/logo-placeholder.svg with the company logo */}
                <img
                  src="/logo-placeholder.svg"
                  alt="Company logo placeholder"
                  className="h-40 w-40"
                />
                <p className="mt-4 text-sm opacity-75">Hover a sector to explore it</p>
              </div>
            )}
          </div>

          {/* Sector list */}
          <ul onMouseLeave={() => setActive(null)}>
            {fallbackSectors.map((s, i) => (
              <li
                key={s.slug}
                className="border-b"
                style={{ borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' }}
              >
                <Link
                  to={`/sectors/${s.slug}`}
                  onMouseEnter={() => setActive(s)}
                  onFocus={() => setActive(s)}
                  onBlur={() => setActive(null)}
                  className="group flex items-center gap-4 py-4 font-heading text-xl font-semibold transition-transform duration-300 hover:translate-x-2 sm:text-2xl"
                >
                  <span className="w-8 text-sm opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1">{s.name}</span>
                  <ArrowUpRight
                    size={22}
                    className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
