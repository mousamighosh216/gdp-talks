import { screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Journey from '../components/Journey';
import { REGISTER_URL } from '../lib/api';
import { renderAt, stubFetch } from './utils';

describe('Journey', () => {
  it('shows the three steps in order using the bundled content when the API is offline', () => {
    stubFetch();
    renderAt(<Journey />);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(['Registration', 'Onboarding', 'Selection and refining']);
    expect(screen.getByText('Step 01')).toBeInTheDocument();
  });

  it('sends registration to the configured external link', () => {
    stubFetch();
    renderAt(<Journey />);
    const link = screen.getByRole('link', { name: /register on unstop/i });
    expect(link).toHaveAttribute('href', REGISTER_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    // only the registration step has a button
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('replaces the content with API data when the API responds', async () => {
    stubFetch({
      'GET /api/journey': () => ({
        body: [
          { order: 1, title: 'Sign up', summary: 'From the API', details: ['Do it'], action: null },
        ],
      }),
    });
    renderAt(<Journey />);
    await waitFor(() => expect(screen.getByText('Sign up')).toBeInTheDocument());
    expect(screen.queryByText('Registration')).not.toBeInTheDocument();
  });
});
