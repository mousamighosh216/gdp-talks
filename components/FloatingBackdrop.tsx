import type { CSSProperties } from 'react';
import {
  Braces,
  Cloud,
  Code,
  GitBranch,
  Lightbulb,
  MessageCircle,
  Rocket,
  Sparkles,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

type Kind = 'ring' | 'dot' | 'pill' | 'icon';

interface Item {
  kind: Kind;
  /** position as a percentage of the section */
  x: number;
  y: number;
  size: number;
  /** drift distance (px), rotation (deg), duration and delay (s) */
  dx: number;
  dy: number;
  rot: number;
  dur: number;
  delay: number;
  icon?: LucideIcon;
  hideOnMobile?: boolean;
}

export type BackdropPreset = 'hero' | 'about' | 'journey' | 'companies';
export type BackdropTheme = 'light' | 'dark';

const PRESETS: Record<BackdropPreset, Item[]> = {
  hero: [
    { kind: 'ring', x: 2, y: 56, size: 64, dx: 16, dy: -22, rot: 20, dur: 17, delay: 0, hideOnMobile: true },
    { kind: 'dot', x: 46, y: 10, size: 18, dx: -10, dy: 20, rot: 0, dur: 13, delay: 1 },
    { kind: 'icon', icon: Code, x: 58, y: 70, size: 44, dx: 14, dy: -18, rot: -12, dur: 19, delay: 2, hideOnMobile: true },
    { kind: 'pill', x: 90, y: 62, size: 26, dx: -12, dy: -26, rot: 14, dur: 21, delay: 3, hideOnMobile: true },
    { kind: 'icon', icon: MessageCircle, x: 8, y: 80, size: 40, dx: 18, dy: -14, rot: 10, dur: 18, delay: 4 },
    { kind: 'dot', x: 94, y: 14, size: 30, dx: -16, dy: 16, rot: 0, dur: 15, delay: 2 },
    { kind: 'ring', x: 72, y: 84, size: 48, dx: -14, dy: -18, rot: 0, dur: 16, delay: 5, hideOnMobile: true },
    { kind: 'icon', icon: Sparkles, x: 34, y: 6, size: 30, dx: 10, dy: 14, rot: 18, dur: 14, delay: 6, hideOnMobile: true },
  ],
  about: [
    { kind: 'ring', x: 92, y: 12, size: 90, dx: -18, dy: 20, rot: 16, dur: 20, delay: 0 },
    { kind: 'icon', icon: Rocket, x: 80, y: 74, size: 52, dx: 16, dy: -24, rot: 12, dur: 18, delay: 1 },
    { kind: 'dot', x: 4, y: 22, size: 22, dx: 12, dy: -18, rot: 0, dur: 14, delay: 2 },
    { kind: 'pill', x: 52, y: 8, size: 24, dx: 10, dy: 22, rot: -16, dur: 22, delay: 3, hideOnMobile: true },
    { kind: 'icon', icon: Lightbulb, x: 6, y: 78, size: 42, dx: -12, dy: -16, rot: -10, dur: 17, delay: 4 },
    { kind: 'dot', x: 68, y: 92, size: 16, dx: 14, dy: -14, rot: 0, dur: 12, delay: 1 },
  ],
  journey: [
    { kind: 'ring', x: 90, y: 8, size: 80, dx: -16, dy: 22, rot: 14, dur: 19, delay: 0 },
    { kind: 'icon', icon: GitBranch, x: 92, y: 40, size: 44, dx: -12, dy: -20, rot: 10, dur: 20, delay: 2, hideOnMobile: true },
    { kind: 'icon', icon: Terminal, x: 3, y: 56, size: 42, dx: 14, dy: -18, rot: -8, dur: 18, delay: 1, hideOnMobile: true },
    { kind: 'dot', x: 8, y: 14, size: 24, dx: 12, dy: 18, rot: 0, dur: 14, delay: 3 },
    { kind: 'pill', x: 94, y: 78, size: 26, dx: -10, dy: -24, rot: 16, dur: 21, delay: 4 },
    { kind: 'ring', x: 6, y: 92, size: 56, dx: 14, dy: -14, rot: 0, dur: 16, delay: 5 },
  ],
  companies: [
    { kind: 'ring', x: 94, y: 10, size: 72, dx: -14, dy: 20, rot: 16, dur: 18, delay: 0 },
    { kind: 'icon', icon: Cloud, x: 48, y: 8, size: 50, dx: 18, dy: 12, rot: 0, dur: 24, delay: 1, hideOnMobile: true },
    { kind: 'icon', icon: Braces, x: 4, y: 88, size: 42, dx: 12, dy: -18, rot: -10, dur: 17, delay: 3 },
    { kind: 'dot', x: 92, y: 86, size: 26, dx: -14, dy: -16, rot: 0, dur: 15, delay: 2 },
    { kind: 'pill', x: 3, y: 12, size: 24, dx: 10, dy: 22, rot: 14, dur: 20, delay: 4, hideOnMobile: true },
  ],
};

const TONES: Record<BackdropTheme, Record<Kind, string>> = {
  light: {
    ring: 'rounded-full border-2 border-gold-400/50',
    dot: 'rounded-full bg-gold-400/35',
    pill: 'rounded-full bg-navy-500/12',
    icon: 'text-navy-700/25',
  },
  dark: {
    ring: 'rounded-full border-2 border-gold-200/30',
    dot: 'rounded-full bg-cream/15',
    pill: 'rounded-full bg-cream/10',
    icon: 'text-cream/25',
  },
};

/**
 * Slowly drifting shapes and icons that fill empty background space. Purely decorative:
 * hidden from assistive tech, ignores the pointer and stops when the visitor prefers
 * reduced motion. The parent needs `relative` and `overflow-hidden`.
 */
export default function FloatingBackdrop({
  preset,
  theme = 'light',
}: {
  preset: BackdropPreset;
  theme?: BackdropTheme;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" data-backdrop={preset}>
      {PRESETS[preset].map((it, i) => {
        const style = {
          left: `${it.x}%`,
          top: `${it.y}%`,
          width: it.size,
          height: it.kind === 'pill' ? it.size * 2.4 : it.size,
          '--dx': `${it.dx}px`,
          '--dy': `${it.dy}px`,
          '--rot': `${it.rot}deg`,
          '--dur': `${it.dur}s`,
          '--delay': `-${it.delay}s`,
        } as CSSProperties;
        const Icon = it.icon;
        return (
          <span
            key={i}
            className={`float absolute ${it.hideOnMobile ? 'hidden sm:block' : ''} ${TONES[theme][it.kind]}`}
            style={style}
          >
            {Icon && <Icon className="h-full w-full" strokeWidth={1.25} />}
          </span>
        );
      })}
    </div>
  );
}
