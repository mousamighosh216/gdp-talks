import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Routes, Route } from 'react-router-dom';
<<<<<<< HEAD
=======
import { within } from '@testing-library/react';
>>>>>>> a6d74d4 (version 1 : GDP TALKS)
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
<<<<<<< HEAD
    expect(screen.getAllByRole('button', { name: /use as a starting point/i })).toHaveLength(3);
=======
    // each problem is a button that opens its full description
    expect(screen.getAllByRole('button', { name: /read the full problem/i })).toHaveLength(3);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
>>>>>>> a6d74d4 (version 1 : GDP TALKS)
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

<<<<<<< HEAD
  it('copies a sample problem into the form as a starting point', async () => {
    stubFetch();
    const user = userEvent.setup();
    page('fashion');
    await user.click(screen.getAllByRole('button', { name: /use as a starting point/i })[0]);
    const box = screen.getByLabelText<HTMLTextAreaElement>('Your problem statement');
    expect(box.value).toContain('Find the right size the first time');
    expect(box.value).toContain('Reduce returns by helping shoppers');
  });

=======
>>>>>>> a6d74d4 (version 1 : GDP TALKS)
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
<<<<<<< HEAD
=======

describe('Problem pop-up', () => {
  const openFirst = async (slug = 'fashion') => {
    stubFetch();
    const user = userEvent.setup();
    page(slug);
    const card = screen.getAllByRole('button', { name: /read the full problem/i })[0];
    await user.click(card);
    return { user, card, dialog: screen.getByRole('dialog') };
  };

  it('opens the full, descriptive version when a problem is clicked', async () => {
    const { dialog } = await openFirst();
    expect(dialog).toHaveAccessibleName('Find the right size the first time');
    expect(within(dialog).getByText(/Wrong size is the most common reason clothes are sent back/)).toBeInTheDocument();
    expect(within(dialog).getByText('What we are hoping for')).toBeInTheDocument();
    expect(within(dialog).getByText('Keep in mind')).toBeInTheDocument();
    expect(within(dialog).getAllByRole('listitem').length).toBeGreaterThanOrEqual(6);
  });

  it('tells companies how to respond: an email link pre-filled with the problem', async () => {
    const { dialog } = await openFirst();
    const mail = within(dialog).getByRole('link', { name: /email us your approach/i });
    const href = mail.getAttribute('href')!;
    expect(href.startsWith('mailto:')).toBe(true);
    const query = new URLSearchParams(href.split('?')[1]);
    expect(query.get('subject')).toBe('[GDP Talks] Fashion: Find the right size the first time');
    expect(query.get('body')).toContain('Find the right size the first time');
  });

  it('closes with the close button', async () => {
    const { user } = await openFirst();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes with the Escape key and gives focus back to the problem card', async () => {
    const { user, card } = await openFirst();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(card).toHaveFocus();
  });

  it('closes when the dark area outside the pop-up is clicked, but not when the pop-up itself is', async () => {
    const { user, dialog } = await openFirst();
    await user.click(within(dialog).getByText(/Wrong size is the most common reason/));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByTestId('modal-backdrop'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('puts focus inside the pop-up, keeps it there when tabbing, and locks page scrolling', async () => {
    const { user, dialog } = await openFirst();
    expect(within(dialog).getByRole('button', { name: 'Close' })).toHaveFocus();
    expect(document.body.style.overflow).toBe('hidden');
    for (let i = 0; i < 8; i++) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    await user.keyboard('{Escape}');
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('"Start your own version" closes the pop-up and fills the form with that problem', async () => {
    const { user, dialog } = await openFirst();
    await user.click(within(dialog).getByRole('button', { name: /start your own version/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const box = screen.getByLabelText<HTMLTextAreaElement>('Your problem statement');
    expect(box.value).toContain('Find the right size the first time');
    expect(box.value).toContain('Reduce returns by helping shoppers');
  });

  it('opens the right problem for each card', async () => {
    stubFetch();
    const user = userEvent.setup();
    page('gaming');
    const cards = screen.getAllByRole('button', { name: /read the full problem/i });
    await user.click(cards[2]);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Moderate chat without killing the fun');
    expect(screen.getByText(/Problem 03/)).toBeInTheDocument();
  });
});
>>>>>>> a6d74d4 (version 1 : GDP TALKS)
