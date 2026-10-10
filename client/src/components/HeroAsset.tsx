import type { CSSProperties } from 'react';
import { Code, MessagesSquare, Rocket, Users, type LucideIcon } from 'lucide-react';

interface Bar {
  icon: LucideIcon;
  height: string;
  color: string;
  iconColor: string;
  delay: number;
}

const BARS: Bar[] = [
  { icon: Code, height: 'h-28', color: 'bg-navy-700', iconColor: 'text-gold-200', delay: 0 },
  { icon: Rocket, height: 'h-40', color: 'bg-navy-500', iconColor: 'text-cream', delay: 0.6 },
  { icon: MessagesSquare, height: 'h-32', color: 'bg-gold-200', iconColor: 'text-navy-950', delay: 1.2 },
  { icon: Users, height: 'h-44', color: 'bg-gold-400', iconColor: 'text-navy-950', delay: 1.8 },
];

/** The "some asset" box in the top right of the hero: bobbing bars, a sun and drifting bubbles. */
export default function HeroAsset() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden h-72 w-60 shrink-0 overflow-hidden rounded-[2rem] bg-navy-950 shadow-2xl shadow-navy-950/25 lg:block xl:w-72"
    >
      <div
        className="float absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gold-400"
        style={{ '--dx': '-10px', '--dy': '12px', '--rot': '0deg', '--dur': '14s' } as CSSProperties}
      />
      <div
        className="float absolute left-6 top-8 h-5 w-5 rounded-full border-2 border-gold-200/60"
        style={{ '--dx': '14px', '--dy': '10px', '--rot': '0deg', '--dur': '11s' } as CSSProperties}
      />

      <div className="absolute inset-x-6 bottom-0 flex items-end gap-3">
        {BARS.map(({ icon: Icon, height, color, iconColor, delay }) => (
          <div
            key={height}
            className={`bob flex w-12 justify-center rounded-t-full rounded-b-none pt-4 ${height} ${color}`}
            style={{ '--dur': '5.5s', '--delay': `-${delay}s` } as CSSProperties}
          >
            <Icon size={22} className={iconColor} />
          </div>
        ))}
      </div>
    </div>
  );
}
