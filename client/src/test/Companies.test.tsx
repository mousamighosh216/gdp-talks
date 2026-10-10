import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Companies from '../components/Companies';
import { IDLE_THEME, PALETTE, SECTOR_UI } from '../lib/sectors';
import { renderAt } from './utils';

const section = (container: HTMLElement) => container.querySelector('#companies') as HTMLElement;

describe('Companies', () => {
  it('lists the 8 sectors, each linking to its own page', () => {
    renderAt(<Companies />);
    const expected: Record<string, string> = {
      Devtools: 'devtools',
      Fashion: 'fashion',
      Services: 'services',
      'Product Services': 'product-services',
      'Ed Tech': 'ed-tech',
      'Inference Provider': 'inference-providers',
      Gaming: 'gaming',
      'D2C Brands': 'd2c-brands',
    };
    for (const [name, slug] of Object.entries(expected)) {
      // accessible name is the row number followed by the sector name, e.g. "03Services"
      expect(screen.getByRole('link', { name: new RegExp(`^\\d{2}${name}$`) })).toHaveAttribute(
        'href',
        `/sectors/${slug}`
      );
    }
  });

  it('starts on the cream background with the company logo', () => {
    const { container } = renderAt(<Companies />);
    expect(screen.getByAltText('Company logo placeholder')).toBeInTheDocument();
    expect(section(container)).toHaveStyle({ backgroundColor: IDLE_THEME.bg });
  });

  it('hovering a sector softly tints the section and swaps the logo box', async () => {
    const user = userEvent.setup();
    const { container } = renderAt(<Companies />);

    await user.hover(screen.getByRole('link', { name: /Fashion/ }));
    expect(section(container)).toHaveStyle({ backgroundColor: SECTOR_UI.fashion.bg });
    expect(screen.getByText('Style, supply chains and storefronts')).toBeInTheDocument();
    expect(screen.queryByAltText('Company logo placeholder')).not.toBeInTheDocument();

    await user.hover(screen.getByRole('link', { name: /Devtools/ }));
    expect(section(container)).toHaveStyle({ backgroundColor: SECTOR_UI.devtools.bg });
    expect(screen.getByText('Tools that make developers faster')).toBeInTheDocument();
  });

  it('keeps the text navy on every hover so it never flips to a harsh colour', async () => {
    const user = userEvent.setup();
    const { container } = renderAt(<Companies />);
    for (const name of ['Devtools', 'Fashion', 'Services', 'Gaming']) {
      await user.hover(screen.getByRole('link', { name: new RegExp(`^\\d{2}${name}$`) }));
      expect(section(container)).toHaveStyle({ color: PALETTE.navy950 });
    }
  });

  it('returns to the logo when the pointer leaves the list', async () => {
    const user = userEvent.setup();
    const { container } = renderAt(<Companies />);
    await user.hover(screen.getByRole('link', { name: /Gaming/ }));
    await user.unhover(screen.getByRole('link', { name: /Gaming/ }));
    expect(screen.getByAltText('Company logo placeholder')).toBeInTheDocument();
    expect(section(container)).toHaveStyle({ backgroundColor: IDLE_THEME.bg });
  });

  it('reacts to keyboard focus as well as hover', async () => {
    const user = userEvent.setup();
    const { container } = renderAt(<Companies />);
    await user.tab();
    expect(screen.getByRole('link', { name: /Devtools/ })).toHaveFocus();
    expect(section(container)).toHaveStyle({ backgroundColor: SECTOR_UI.devtools.bg });
  });
});
