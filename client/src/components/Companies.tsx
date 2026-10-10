import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import FloatingBackdrop from './FloatingBackdrop';
import { fallbackSectors } from '../lib/api';
import { SECTOR_UI, IDLE_THEME } from '../lib/sectors';
import { useMediaQuery } from '../lib/useMediaQuery';
import type { Sector } from '../types';

const DIVIDER = { borderColor: 'color-mix(in srgb, currentColor 18%, transparent)' };

/** Phones: tap a sector and its details open right under it, so the change is always in view. */
function SectorAccordion({
  openSlug,
  onToggle,
}: {
  openSlug: string | null;
  onToggle: (slug: string) => void;
}) {
  return (
    <ul>
      {fallbackSectors.map((s) => {
        const ui = SECTOR_UI[s.slug];
        const Icon = ui.icon;
        const open = openSlug === s.slug;
        const panelId = `sector-panel-${s.slug}`;
        return (
          <li key={s.slug} className="border-b" style={DIVIDER}>
            <button
              type="button"
              aria-expanded={open}
              aria-controls={panelId}
              onClick={() => onToggle(s.slug)}
              className="flex w-full items-center gap-4 py-4 text-left font-heading text-xl font-semibold"
            >
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors duration-500"
                style={{ backgroundColor: ui.boxBg, color: ui.boxFg }}
              >
                <Icon size={22} aria-hidden="true" />
              </span>
              <span className="flex-1">{s.name}</span>
              <ChevronDown
                size={22}
                aria-hidden="true"
                className={`shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div id={panelId} className="pop pb-6 pl-[3.75rem] pr-1">
                <p className="font-heading text-lg font-medium leading-snug">{s.tagline}</p>
                <p className="mt-2 leading-relaxed opacity-85">{s.summary}</p>
                <Link
                  to={`/sectors/${s.slug}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-950 px-5 py-2.5 font-heading text-sm font-semibold text-cream transition hover:bg-navy-700"
                >
                  See {s.name} problems
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Companies() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [active, setActive] = useState<Sector | null>(null); // desktop: hovered / focused sector
  const [openSlug, setOpenSlug] = useState<string | null>(null); // phone: expanded sector

  const current = isDesktop ? active : (fallbackSectors.find((s) => s.slug === openSlug) ?? null);
  const ui = current ? SECTOR_UI[current.slug] : null;
  const theme = ui ?? IDLE_THEME;
  const ActiveIcon = ui?.icon;

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

        {isDesktop ? (
          <div className="mt-14 grid items-center gap-16 md:grid-cols-2">
            {/* Logo box */}
            <div
              className="relative grid aspect-square w-full max-w-md place-items-center overflow-hidden rounded-[2rem] p-8 shadow-xl shadow-navy-950/15 transition-colors duration-700 ease-out"
              style={{ backgroundColor: theme.boxBg, color: theme.boxFg }}
              aria-live="polite"
            >
              {current && ActiveIcon ? (
                <div className="pop flex flex-col items-start" key={current.slug}>
                  <ActiveIcon size={96} strokeWidth={1.5} aria-hidden="true" />
                  <p className="mt-6 font-heading text-3xl font-bold">{current.name}</p>
                  <p className="mt-2 max-w-xs text-lg opacity-85">{current.tagline}</p>
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
                <li key={s.slug} className="border-b" style={DIVIDER}>
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
        ) : (
          <div className="mt-8">
            <p className="mb-2 text-sm opacity-75">Tap a sector to see what it is about.</p>
            <SectorAccordion
              openSlug={openSlug}
              onToggle={(slug) => setOpenSlug((cur) => (cur === slug ? null : slug))}
            />
          </div>
        )}
      </div>
    </section>
  );
}
