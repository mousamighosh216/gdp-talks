type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0').toUpperCase();

/** Blends `top` over `base` at `amount` (0..1). A small amount gives a soft tint. */
export function mix(top: string, base: string, amount: number): string {
  const t = hexToRgb(top);
  const b = hexToRgb(base);
  const out = b.map((c, i) => c + (t[i] - c) * amount);
  return `#${out.map(toHex).join('')}`;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
