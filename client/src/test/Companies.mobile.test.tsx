import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Companies from '../components/Companies';
import { IDLE_THEME, SECTOR_UI } from '../lib/sectors';
import { renderAt } from './utils';

const section = (container: HTMLElement) => container.querySelector('#companies') as HTMLElement;

// Pretend to be a phone: the (min-width: 768px) query does not match.
function phone() {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

describe('Companies on a phone', () => {
  beforeEach(phone);

  it('shows tap-to-expand rows instead of the logo box', () => {
    renderAt(<Companies />);
    expect(screen.queryByAltText('Company logo placeholder')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(8);
    expect(screen.getByText('Tap a sector to see what it is about.')).toBeInTheDocument();
  });

  it('opens the details right under the tapped sector, with a link to its page', async () => {
    const user = userEvent.setup();
    renderAt(<Companies />);
    await user.click(screen.getByRole('button', { name: 'Fashion' }));

    const row = screen.getByRole('button', { name: 'Fashion' });
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Style, supply chains and storefronts')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see fashion problems/i })).toHaveAttribute(
      'href',
      '/sectors/fashion'
    );
  });

  it('keeps one sector open at a time and closes it when tapped again', async () => {
    const user = userEvent.setup();
    renderAt(<Companies />);
    await user.click(screen.getByRole('button', { name: 'Fashion' }));
    await user.click(screen.getByRole('button', { name: 'Gaming' }));
    expect(screen.getByRole('button', { name: 'Fashion' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Gaming' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('link')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Gaming' }));
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('softly tints the section for the open sector and resets when closed', async () => {
    const user = userEvent.setup();
    const { container } = renderAt(<Companies />);
    expect(section(container)).toHaveStyle({ backgroundColor: IDLE_THEME.bg });
    await user.click(screen.getByRole('button', { name: 'Fashion' }));
    expect(section(container)).toHaveStyle({ backgroundColor: SECTOR_UI.fashion.bg });
    await user.click(screen.getByRole('button', { name: 'Fashion' }));
    expect(section(container)).toHaveStyle({ backgroundColor: IDLE_THEME.bg });
  });

  it('lists all 8 sectors', () => {
    renderAt(<Companies />);
    for (const name of [
      'Devtools', 'Fashion', 'Services', 'Product Services',
      'Ed Tech', 'Inference Provider', 'Gaming', 'D2C Brands',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
