import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FaLinkedinIn, FaInstagram, FaXTwitter } from 'react-icons/fa6';
import Brand from './Brand';
import { content } from '@/lib/content';

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/growth-driven-pioneers/', icon: FaLinkedinIn },
  { label: 'Instagram', href: 'https://www.instagram.com/gdp.ind', icon: FaInstagram },
  { label: 'X', href: 'https://x.com/GDP_IN', icon: FaXTwitter },
];

const EXPLORE: Array<[string, string]> = [
  ['/#top', 'Home'],
  ['/#journey', 'Student journey'],
  ['/#companies', 'Companies'],
  ['/#about', 'About'],
  ['/doc-d', 'Doc D'],
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <span
            className="font-heading text-xl font-bold tracking-tight text-cream"
          >
        GDP Talks
      </span>
          <p className="mt-5 max-w-sm text-cream/75">
            Not Just a HACKATHON a prototyping sprint that brings together technical experts, product agencies, and enterprise leaders to tackle complex digital challenges.
          </p>
          <ul className="mt-6 flex gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream transition hover:border-gold-400 hover:text-gold-400"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold-400">
            Explore
          </h2>
          <ul className="mt-5 space-y-3">
            {EXPLORE.map(([to, label]) => (
              <li key={to}>
                <Link href={to} className="text-cream/80 transition hover:text-gold-200">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-gold-400">
            Sectors
          </h2>
          <ul className="mt-5 space-y-3">
            {content.sectors.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/sectors/${s.slug}`}
                  className="text-cream/80 transition hover:text-gold-200"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-6 text-sm text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} GDP Talks. All rights reserved.</p>
          <a
            href="mailto:hello@example.com"
            className="inline-flex items-center gap-2 hover:text-gold-200"
          >
            <Mail size={16} aria-hidden="true" />
            gdp.rgpv@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
