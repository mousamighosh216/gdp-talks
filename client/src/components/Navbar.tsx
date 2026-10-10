import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';
import { REGISTER_URL } from '../lib/api';

// Same order as the page: home, student journey, companies, about.
const LINKS = [
  { to: '/#top', label: 'Home' },
  { to: '/#journey', label: 'Student journey' },
  { to: '/#companies', label: 'Companies' },
  { to: '/#about', label: 'About' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-navy-950/10 bg-cream/95 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5"
        aria-label="Main"
      >
        <Brand />

        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="font-heading text-sm font-medium text-navy-950 transition-colors hover:text-navy-500"
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-5 py-2.5 font-heading text-sm font-semibold text-navy-950 transition hover:bg-gold-200"
            >
              Register
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg text-navy-950 md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-navy-950/10 bg-cream px-5 pb-5 md:hidden">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-heading text-lg font-medium text-navy-950"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={REGISTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-5 py-3 font-heading text-sm font-semibold text-navy-950"
          >
            Register
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>
      )}
    </header>
  );
}
