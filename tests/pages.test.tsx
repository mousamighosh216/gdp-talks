import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Home from '@/app/page';
import DocD from '@/app/doc-d/page';
import NotFound from '@/app/not-found';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingBackdrop, { type BackdropPreset } from '@/components/FloatingBackdrop';
import { content } from '@/lib/content';
import { contrastRatio } from '@/lib/color';
import { IDLE_THEME, PALETTE, SECTOR_UI } from '@/lib/sectors';

const home = async () => render(await Home());

describe('Home page', () => {
  it('orders the sections: hero, student journey, company routing, about', async () => {
    const { container } = await home();
    const ids = ['top', 'journey', 'companies', 'about'];
    const els = ids.map((id) => container.querySelector(`#${id}`));
    els.forEach((el, i) => expect(el, `#${ids[i]} missing`).toBeInTheDocument());
    for (let i = 1; i < els.length; i++) {
      const following = els[i - 1]!.compareDocumentPosition(els[i]!) & Node.DOCUMENT_POSITION_FOLLOWING;
      expect(following, `#${ids[i]} should come after #${ids[i - 1]}`).toBeTruthy();
    }
  });

  it('puts the footer after the about section', async () => {
    const { container } = await home();
    render(<Footer />, { container: container.appendChild(document.createElement('div')) });
    const about = container.querySelector('#about')!;
    expect(about.compareDocumentPosition(container.querySelector('footer')!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('has no separate story section (the story lives in the hero)', async () => {
    const { container } = await home();
    expect(container.querySelector('#story')).not.toBeInTheDocument();
  });

  it('opens the About section with the tagline', async () => {
    const { container } = await home();
    expect(container.querySelector('#about h2')).toHaveTextContent('Smart people should keep meeting');
  });

  it('takes the hero numbers from the content, not from made-up figures', async () => {
    await home();
    const problems = content.sectors.reduce((n, s) => n + s.problems.length, 0);
    expect(screen.getByText(`${content.sectors.length} sectors`)).toBeInTheDocument();
    expect(screen.getByText(`${problems} sample problems`)).toBeInTheDocument();
  });

  it('links each sector to its page', async () => {
    await home();
    expect(screen.getByRole('link', { name: /^\d{2}Ed Tech$/ })).toHaveAttribute('href', '/sectors/ed-tech');
  });
});

describe('Navbar and footer', () => {
  it('lists the navigation links in page order', () => {
    render(<Navbar />);
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const labels = Array.from(nav.querySelectorAll('ul a')).map((a) => a.textContent?.trim());
    expect(labels.slice(0, 4)).toEqual(['Home', 'Student journey', 'Companies', 'About']);
  });

  it('opens the mobile menu', async () => {
    const user = userEvent.setup();
    render(<Navbar />);
    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('has the standard footer with all sectors', () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
    for (const s of content.sectors) {
      expect(screen.getByRole('link', { name: s.name })).toHaveAttribute('href', `/sectors/${s.slug}`);
    }
  });
});

describe('Doc D page', () => {
  it('tells visitors Doc D is coming soon', () => {
    render(<DocD />);
    expect(
      screen.getByRole('heading', { level: 1, name: /doc d will soon come conquering your browser/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the story/i })).toHaveAttribute('href', '/#top');
  });
});

describe('404 page', () => {
  it('shows the not found message', () => {
    render(<NotFound />);
    expect(screen.getByText('This page does not exist')).toBeInTheDocument();
  });
});

describe('Sector theme (easy on the eyes)', () => {
  it('has an icon and colours for every sector in the content file', () => {
    for (const { slug } of content.sectors) {
      const ui = SECTOR_UI[slug];
      expect(ui, `missing UI config for ${slug}`).toBeDefined();
      expect(ui.icon).toBeTruthy();
      for (const key of ['bg', 'fg', 'boxBg', 'boxFg'] as const) {
        expect(ui[key]).toMatch(/^#[0-9A-F]{6}$/i);
      }
    }
  });

  it('hover backgrounds are soft: barely different from the cream page colour', () => {
    for (const [slug, ui] of Object.entries(SECTOR_UI)) {
      expect(contrastRatio(ui.bg, PALETTE.cream), slug).toBeLessThan(1.15);
    }
  });

  it('text on every hover background passes WCAG AAA (7:1)', () => {
    for (const [slug, ui] of Object.entries({ ...SECTOR_UI, idle: IDLE_THEME })) {
      expect(contrastRatio(ui.fg, ui.bg), slug).toBeGreaterThanOrEqual(7);
    }
  });

  it('logo box colours come from the brand palette and stay readable', () => {
    const palette: string[] = Object.values(PALETTE).map((c) => c.toUpperCase());
    for (const [slug, ui] of Object.entries(SECTOR_UI)) {
      expect(palette, slug).toContain(ui.boxBg.toUpperCase());
      expect(palette, slug).toContain(ui.boxFg.toUpperCase());
      expect(contrastRatio(ui.boxFg, ui.boxBg), slug).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('FloatingBackdrop', () => {
  const presets: BackdropPreset[] = ['hero', 'about', 'journey', 'companies'];

  it.each(presets)('%s preset renders drifting, decorative, non-interactive assets', (preset) => {
    const { container } = render(<FloatingBackdrop preset={preset} />);
    const root = container.querySelector(`[data-backdrop="${preset}"]`)!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root.className).toContain('pointer-events-none');
    expect(root.querySelectorAll('.float').length).toBeGreaterThanOrEqual(5);
  });

  it('keeps the number of assets small so the page stays light', () => {
    for (const preset of presets) {
      const { container, unmount } = render(<FloatingBackdrop preset={preset} />);
      expect(container.querySelectorAll('.float').length).toBeLessThanOrEqual(10);
      unmount();
    }
  });
});
