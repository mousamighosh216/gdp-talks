import {
  Code,
  Shirt,
  Briefcase,
  Package,
  GraduationCap,
  Cpu,
  Gamepad2,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { mix } from './color';

export const PALETTE = {
  cream: '#F0EEE9', // Pantone Cloud Dancer
  white: '#FFFFFF',
  navy950: '#0A1E3F',
  navy900: '#102F5C',
  navy700: '#1A447A',
  navy500: '#2A5A96',
  gold200: '#FEE39F', // Light Scatter
  gold400: '#EFBB55', // Golden Glamor
} as const;

// Soft tints of the brand colours. They are kept very light on purpose so the
// page background never competes with the content and the navy text stays crisp.
const TINT = {
  sky: mix(PALETTE.navy500, PALETTE.white, 0.14),
  mist: mix(PALETTE.navy700, PALETTE.white, 0.1),
  butter: mix(PALETTE.gold200, PALETTE.cream, 0.55),
  honey: mix(PALETTE.gold400, PALETTE.cream, 0.26),
};

export interface SectorTheme {
  icon?: LucideIcon;
  /** page / section background (soft tint) */
  bg: string;
  /** text colour on that background (always navy) */
  fg: string;
  /** logo box colours (bold, so the box stands out against the soft background) */
  boxBg: string;
  boxFg: string;
}

type SectorUI = SectorTheme & { icon: LucideIcon };

const sector = (icon: LucideIcon, bg: string, boxBg: string, boxFg: string): SectorUI => ({
  icon,
  bg,
  fg: PALETTE.navy950,
  boxBg,
  boxFg,
});

export const SECTOR_UI: Record<string, SectorUI> = {
  devtools: sector(Code, TINT.sky, PALETTE.navy950, PALETTE.gold200),
  fashion: sector(Shirt, TINT.butter, PALETTE.navy950, PALETTE.gold200),
  services: sector(Briefcase, TINT.mist, PALETTE.navy900, PALETTE.gold200),
  'product-services': sector(Package, TINT.honey, PALETTE.navy900, PALETTE.gold200),
  'ed-tech': sector(GraduationCap, TINT.sky, PALETTE.gold400, PALETTE.navy950),
  'inference-providers': sector(Cpu, TINT.mist, PALETTE.navy950, PALETTE.gold200),
  gaming: sector(Gamepad2, TINT.sky, PALETTE.gold400, PALETTE.navy950),
  'd2c-brands': sector(ShoppingBag, TINT.butter, PALETTE.navy700, PALETTE.cream),
};

export const IDLE_THEME: SectorTheme = {
  bg: PALETTE.cream,
  fg: PALETTE.navy950,
  boxBg: PALETTE.navy950,
  boxFg: PALETTE.gold200,
};
