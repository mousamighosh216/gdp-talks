import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import App from '../App';
import Home from '../pages/Home';
import FloatingBackdrop, { type BackdropPreset } from '../components/FloatingBackdrop';
import { fallbackSectors } from '../lib/api';
import { contrastRatio } from '../lib/color';
import { IDLE_THEME, PALETTE, SECTOR_UI } from '../lib/sectors';
import { renderAt, stubFetch } from './utils';

describe('Home page', () => {
<<<<<<< HEAD
  it('orders the sections: hero, about, student journey, company routing, then footer', () => {
    stubFetch();
    const { container } = renderAt(<App />, '/');
    const ids = ['top', 'about', 'journey', 'companies'];
=======
  it('orders the sections: hero, student journey, company routing, about, then footer', () => {
    stubFetch();
    const { container } = renderAt(<App />, '/');
    const ids = ['top', 'journey', 'companies', 'about'];
>>>>>>> a6d74d4 (version 1 : GDP TALKS)
    const els = ids.map((id) => container.querySelector(`#${id}`));
    els.forEach((el, i) => expect(el, `#${ids[i]} missing`).toBeInTheDocument());
    for (let i = 1; i < els.length; i++) {
      const following = els[i - 1]!.compareDocumentPosition(els[i]!) & Node.DOCUMENT_POSITION_FOLLOWING;
      expect(following, `#${ids[i]} should come after #${ids[i - 1]}`).toBeTruthy();
    }
    const footer = container.querySelector('footer')!;
    expect(
      els[3]!.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('no longer has a separate story section (the chat lives in the hero)', () => {
    stubFetch();
    const { container } = renderAt(<Home />, '/');
    expect(container.querySelector('#story')).not.toBeInTheDocument();
  });

<<<<<<< HEAD
=======
  it('opens the About section with the tagline', () => {
    stubFetch();
    const { container } = renderAt(<App />, '/');
    const about = container.querySelector('#about')!;
    expect(about.querySelector('h2')).toHaveTextContent('Smart people should keep meeting');
  });

>>>>>>> a6d74d4 (version 1 : GDP TALKS)
  it('lists the navigation links in page order', () => {
    stubFetch();
    renderAt(<App />, '/');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const labels = Array.from(nav.querySelectorAll('ul a')).map((a) => a.textContent?.trim());
<<<<<<< HEAD
    expect(labels.slice(0, 4)).toEqual(['Home', 'About', 'Student journey', 'Companies']);
=======
    expect(labels.slice(0, 4)).toEqual(['Home', 'Student journey', 'Companies', 'About']);
>>>>>>> a6d74d4 (version 1 : GDP TALKS)
  });

  it('navigates from a sector link to the sector page', async () => {
    stubFetch();
    const user = userEvent.setup();
    renderAt(<App />, '/');
    await user.click(screen.getAllByRole('link', { name: /Ed Tech/ })[0]);
    expect(screen.getByRole('heading', { level: 1, name: 'Ed Tech' })).toBeInTheDocument();
  });

  it('shows the standard footer on every page', () => {
    stubFetch();
    renderAt(<App />, '/doc-d');
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});

describe('Doc D page', () => {
  it('tells visitors Doc D is coming soon', () => {
    stubFetch();
    renderAt(<App />, '/doc-d');
    expect(
      screen.getByRole('heading', { level: 1, name: /doc d will soon come conquering your browser/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the story/i })).toHaveAttribute('href', '/#top');
  });
});

describe('Unknown route', () => {
  it('shows the 404 page', () => {
    stubFetch();
    renderAt(<App />, '/nowhere');
    expect(screen.getByText('This page does not exist')).toBeInTheDocument();
  });
});

describe('Sector theme (easy on the eyes)', () => {
  it('has an icon and colours for every sector in the content file', () => {
    for (const { slug } of fallbackSectors) {
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
    const { container } = renderAt(<FloatingBackdrop preset={preset} />);
    const root = container.querySelector(`[data-backdrop="${preset}"]`)!;
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root.className).toContain('pointer-events-none');
    expect(root.querySelectorAll('.float').length).toBeGreaterThanOrEqual(5);
  });

  it('keeps the number of assets small so the page stays light', () => {
    for (const preset of presets) {
      const { container, unmount } = renderAt(<FloatingBackdrop preset={preset} />);
      expect(container.querySelectorAll('.float').length).toBeLessThanOrEqual(10);
      unmount();
    }
  });
});
