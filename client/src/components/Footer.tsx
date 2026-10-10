import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { FaLinkedinIn, FaInstagram, FaXTwitter, FaGithub } from 'react-icons/fa6';
import Brand from './Brand';
import { fallbackSectors } from '../lib/api';

const SOCIALS = [
  { label: 'LinkedIn', href: '#', icon: FaLinkedinIn },
  { label: 'Instagram', href: '#', icon: FaInstagram },
  { label: 'X', href: '#', icon: FaXTwitter },
  { label: 'GitHub', href: '#', icon: FaGithub },
];

const EXPLORE: Array<[string, string]> = [
  ['/#top', 'Home'],
  ['/#about', 'About'],
  ['/#journey', 'Student journey'],
  ['/#companies', 'Companies'],
  ['/doc-d', 'Doc D'],
];

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Brand light />
          <p className="mt-5 max-w-sm text-cream/75">
            Smart people should keep meeting. A hackathon where students and companies solve real
            problems together.
          </p>
          <ul className="mt-6 flex gap-3">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
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
                <Link to={to} className="text-cream/80 transition hover:text-gold-200">
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
            {fallbackSectors.map((s) => (
              <li key={s.slug}>
                <Link
                  to={`/sectors/${s.slug}`}
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
            hello@example.com
          </a>
        </div>
      </div>
    </footer>
  );
}
