import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Routes, Route } from 'react-router-dom';
import SectorPage from '../pages/Sector';
import { renderAt, stubFetch } from './utils';

const page = (slug: string) =>
  renderAt(
    <Routes>
      <Route path="/sectors/:slug" element={<SectorPage />} />
    </Routes>,
    `/sectors/${slug}`
  );

type User = ReturnType<typeof userEvent.setup>;

async function fillForm(
  user: User,
  { company = 'Acme Games', email = 'hi@acme.com', question = '' } = {}
) {
  await user.type(screen.getByLabelText('Company name'), company);
  await user.type(screen.getByLabelText('Work email'), email);
  if (question) await user.type(screen.getByLabelText('Your problem statement'), question);
}

describe('Sector page', () => {
  it('shows the sector and its sample problem statements', () => {
    stubFetch();
    page('gaming');
    expect(screen.getByRole('heading', { level: 1, name: 'Gaming' })).toBeInTheDocument();
    expect(screen.getByText('Communities, matches and moments')).toBeInTheDocument();
    expect(screen.getByText('Match players fairly in small communities')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /use as a starting point/i })).toHaveLength(3);
  });

  it('renders every sector slug without crashing', () => {
    stubFetch();
    for (const [slug, name] of [
      ['devtools', 'Devtools'],
      ['fashion', 'Fashion'],
      ['services', 'Services'],
      ['product-services', 'Product Services'],
      ['ed-tech', 'Ed Tech'],
      ['inference-providers', 'Inference Provider'],
      ['gaming', 'Gaming'],
      ['d2c-brands', 'D2C Brands'],
    ]) {
      const { unmount } = page(slug);
      expect(screen.getByRole('heading', { level: 1, name })).toBeInTheDocument();
      unmount();
    }
  });

  it('shows a not found page for an unknown sector', () => {
    stubFetch();
    page('crypto');
    expect(screen.getByText('This page does not exist')).toBeInTheDocument();
  });

  it('copies a sample problem into the form as a starting point', async () => {
    stubFetch();
    const user = userEvent.setup();
    page('fashion');
    await user.click(screen.getAllByRole('button', { name: /use as a starting point/i })[0]);
    const box = screen.getByLabelText<HTMLTextAreaElement>('Your problem statement');
    expect(box.value).toContain('Find the right size the first time');
    expect(box.value).toContain('Reduce returns by helping shoppers');
  });

  it('submits the form to the API and shows a thank you message', async () => {
    const fetchMock = stubFetch({
      'POST /api/submissions': () => ({ status: 201, body: { ok: true } }),
    });
    const user = userEvent.setup();
    page('gaming');

    await fillForm(user, { question: 'How do we keep new players past session one?' });
    await user.click(screen.getByRole('button', { name: /send problem statement/i }));

    expect(await screen.findByText('Thank you')).toBeInTheDocument();
    const post = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(post).toBeDefined();
    expect(JSON.parse(post![1]!.body as string)).toEqual({
      sector: 'gaming',
      companyName: 'Acme Games',
      email: 'hi@acme.com',
      question: 'How do we keep new players past session one?',
    });
  });

  it('shows the API validation error and keeps what the user typed', async () => {
    stubFetch({
      'POST /api/submissions': () => ({
        status: 400,
        body: { errors: { email: 'A valid email is required' } },
      }),
    });
    const user = userEvent.setup();
    page('gaming');

    await fillForm(user, { email: 'nope', question: 'A long enough problem statement.' });
    await user.click(screen.getByRole('button', { name: /send problem statement/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('A valid email is required');
    expect(screen.getByLabelText('Company name')).toHaveValue('Acme Games');
  });

  it('shows an error when the server cannot be reached', async () => {
    stubFetch(); // POST is unmatched => network failure
    const user = userEvent.setup();
    page('gaming');

    await fillForm(user, { question: 'A long enough problem statement.' });
    await user.click(screen.getByRole('button', { name: /send problem statement/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.queryByText('Thank you')).not.toBeInTheDocument();
  });
});
