import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Hero from '@/components/Hero';
import { STAGES, STORY } from '@/lib/story';
import { REGISTER_URL } from '@/lib/api';
import { setScrollProgress } from './utils';

// stage 0 = intro, 1..14 = one message each, 15 = redirect
const at = (stage: number) => (stage + 0.5) / STAGES;

const sample = [
  { sector: 'Devtools', title: 'Make error messages useful' },
  { sector: 'Ed Tech', title: 'Keep learners coming back' },
  { sector: 'Gaming', title: 'Match players fairly' },
];
const hero = () => render(<Hero sectorCount={8} problemCount={24} sample={sample} />);

describe('Hero', () => {
  beforeEach(() => setScrollProgress(0));

  it('shows the subtitle above the GDP Talks heading', () => {
    hero();
    const subtitle = screen.getByText('smart people should keep meeting');
    const heading = screen.getByRole('heading', { level: 1, name: 'GDP Talks' });
    expect(subtitle.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('says plainly what GDP Talks is, with Register and Browse actions', () => {
    hero();
    expect(screen.getByText('What is GDP Talks?')).toBeInTheDocument();
    expect(screen.getByText(/students solve real problem statements brought by companies/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute('href', REGISTER_URL);
    expect(screen.getByRole('link', { name: /browse problems/i })).toHaveAttribute('href', '#companies');
  });

  it('points to the conversation between Doc D and Engineer X', () => {
    hero();
    expect(screen.getByText('Follow the conversation between Doc D and Engineer X')).toBeInTheDocument();
  });

  it('computes the asset counts from the data it is given', () => {
    hero();
    expect(screen.getByText('8 sectors')).toBeInTheDocument();
    expect(screen.getByText('24 sample problems')).toBeInTheDocument();
    expect(screen.getByText('Make error messages useful')).toBeInTheDocument();
  });

  it('frames the chat as a story: no online status, typing, ticks or timestamps', () => {
    setScrollProgress(at(3));
    const { container } = hero();
    expect(screen.getByText('A short story')).toBeInTheDocument();
    expect(screen.queryByText('online')).not.toBeInTheDocument();
    expect(screen.queryByText(/typing/i)).not.toBeInTheDocument();
    expect(container.querySelector('.dot')).not.toBeInTheDocument();
    expect(screen.queryByText(/^\d\d:\d\d$/)).not.toBeInTheDocument();
  });

  it('starts with no message and invites the visitor to scroll', () => {
    hero();
    expect(screen.queryByText(STORY[0].text)).not.toBeInTheDocument();
    expect(screen.getByText('Scroll down to read it, one message at a time')).toBeInTheDocument();
  });

  it('shows exactly one message at a time, with its position in the story', () => {
    setScrollProgress(at(4));
    hero();
    expect(screen.getByText(STORY[3].text)).toBeInTheDocument();
    for (const i of [0, 1, 2, 4, 5]) expect(screen.queryByText(STORY[i].text)).not.toBeInTheDocument();
    expect(screen.getByText('4 / 14')).toBeInTheDocument();
  });

  it('does not offer the redirect while the story is still going', () => {
    setScrollProgress(at(14));
    hero();
    expect(screen.getByText(STORY[13].text)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /meet doc d/i })).not.toBeInTheDocument();
  });

  it('redirects to the Doc D page once the whole story is done', () => {
    setScrollProgress(1);
    hero();
    expect(screen.getByRole('link', { name: /meet doc d/i })).toHaveAttribute('href', '/doc-d');
  });

  it('marks the decorative background as decoration', () => {
    const { container } = hero();
    expect(container.querySelector('[data-backdrop="hero"]')).toHaveAttribute('aria-hidden', 'true');
  });
});
