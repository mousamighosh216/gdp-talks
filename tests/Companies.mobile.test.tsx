import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import Companies from '@/components/Companies';
import { content, toSummary } from '@/lib/content';
import { IDLE_THEME, SECTOR_UI } from '@/lib/sectors';

const section = (container: HTMLElement) => container.querySelector('#companies') as HTMLElement;

// Both layouts are in the DOM; CSS decides which one is visible. These tests exercise the phone rows.
describe('Companies on a phone', () => {
  it('shows tap-to-expand rows', () => {
    render(<Companies sectors={content.sectors.map(toSummary)} />);
    expect(screen.getAllByRole('button', { expanded: false })).toHaveLength(8);
    expect(screen.getByText('Tap a sector to see what it is about.')).toBeInTheDocument();
  });

  it('opens the details right under the tapped sector, with a link to its page', async () => {
    const user = userEvent.setup();
    render(<Companies sectors={content.sectors.map(toSummary)} />);
    await user.click(screen.getByRole('button', { name: 'Fashion' }));

    const row = screen.getByRole('button', { name: 'Fashion' });
    expect(row).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(document.getElementById('sector-panel-fashion')!).getByText('Style, supply chains and storefronts')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /see fashion problems/i })).toHaveAttribute(
      'href',
      '/sectors/fashion'
    );
  });

  it('keeps one sector open at a time and closes it when tapped again', async () => {
    const user = userEvent.setup();
    render(<Companies sectors={content.sectors.map(toSummary)} />);
    await user.click(screen.getByRole('button', { name: 'Fashion' }));
    await user.click(screen.getByRole('button', { name: 'Gaming' }));
    expect(screen.getByRole('button', { name: 'Fashion' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: 'Gaming' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('link', { name: /see .* problems/i })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Gaming' }));
    expect(screen.queryByRole('link', { name: /see .* problems/i })).not.toBeInTheDocument();
  });

  it('softly tints the section for the open sector and resets when closed', async () => {
    const user = userEvent.setup();
    const { container } = render(<Companies sectors={content.sectors.map(toSummary)} />);
    expect(section(container)).toHaveStyle({ backgroundColor: IDLE_THEME.bg });
    await user.click(screen.getByRole('button', { name: 'Fashion' }));
    expect(section(container)).toHaveStyle({ backgroundColor: SECTOR_UI.fashion.bg });
    await user.click(screen.getByRole('button', { name: 'Fashion' }));
    expect(section(container)).toHaveStyle({ backgroundColor: IDLE_THEME.bg });
  });

  it('lists all 8 sectors', () => {
    render(<Companies sectors={content.sectors.map(toSummary)} />);
    for (const name of [
      'Devtools', 'Fashion', 'Services', 'Product Services',
      'Ed Tech', 'Inference Provider', 'Gaming', 'D2C Brands',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
