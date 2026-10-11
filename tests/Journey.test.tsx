import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Journey from '@/components/Journey';
import { REGISTER_URL } from '@/lib/api';
import { content } from '@/lib/content';

describe('Journey', () => {
  it('shows the three steps in order from the content data', () => {
    render(<Journey steps={content.journey} />);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(['Registration', 'Onboarding', 'Selection and refining']);
    expect(screen.getByText('Step 01')).toBeInTheDocument();
  });

  it('sends registration to the configured external link', () => {
    render(<Journey steps={content.journey} />);
    const link = screen.getByRole('link', { name: /register on unstop/i });
    expect(link).toHaveAttribute('href', REGISTER_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    // only the registration step has a button
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders whatever steps it is given', () => {
    render(
      <Journey
        steps={[{ order: 1, title: 'Sign up', summary: 'From props', details: ['Do it'], action: null }]}
      />
    );
    expect(screen.getByText('Sign up')).toBeInTheDocument();
    expect(screen.queryByText('Registration')).not.toBeInTheDocument();
  });
});
