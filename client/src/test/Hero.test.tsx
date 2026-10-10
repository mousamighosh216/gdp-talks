import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import Hero from '../components/Hero';
import { STAGES } from '../lib/story';
import { renderAt, setScrollProgress } from './utils';

// progress at a given stage (0 = intro, 1..7 = pairs, 8 = redirect) and position inside it
const at = (stage: number, frac: number) => (stage + frac) / STAGES;

const MSG = {
  x1: /built the whole thing in one weekend/,
  d1: /Where is it running\?/,
  x4: /pasted my API key/,
  d4: /Secrets live in environment config/,
  last: /Smart people should keep meeting\.$/,
};

describe('Hero', () => {
  beforeEach(() => setScrollProgress(0));

  it('shows the subtitle above the GDP Talks heading', () => {
    renderAt(<Hero />);
    const subtitle = screen.getByText('smart people should keep meeting');
    const heading = screen.getByRole('heading', { level: 1, name: 'GDP Talks' });
    expect(subtitle.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('starts with no messages and invites the visitor to scroll', () => {
    renderAt(<Hero />);
    expect(screen.queryByText(MSG.x1)).not.toBeInTheDocument();
    expect(screen.getByText('Scroll to start the conversation')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
  });

  it('pops up Engineer X first, then Doc D answers in the same pair', () => {
    setScrollProgress(at(1, 0.1));
    const first = renderAt(<Hero />);
    expect(screen.getByText(MSG.x1)).toBeInTheDocument();
    expect(screen.queryByText(MSG.d1)).not.toBeInTheDocument();
    first.unmount();

    setScrollProgress(at(1, 0.4));
    const typing = renderAt(<Hero />);
    expect(screen.getByText('Doc D is typing…')).toBeInTheDocument();
    typing.unmount();

    setScrollProgress(at(1, 0.8));
    renderAt(<Hero />);
    expect(screen.getByText(MSG.x1)).toBeInTheDocument();
    expect(screen.getByText(MSG.d1)).toBeInTheDocument();
  });

  it('shows only two chats at a time: the previous pair is gone when the next appears', () => {
    setScrollProgress(at(4, 0.8));
    renderAt(<Hero />);
    expect(screen.getByText(MSG.x4)).toBeInTheDocument();
    expect(screen.getByText(MSG.d4)).toBeInTheDocument();
    expect(screen.queryByText(MSG.x1)).not.toBeInTheDocument();
    expect(screen.queryByText(MSG.d1)).not.toBeInTheDocument();
    expect(screen.getAllByText(/^\d\d:\d\d$/)).toHaveLength(2);
  });

  it('does not offer the redirect while the conversation is still going', () => {
    setScrollProgress(at(7, 0.9));
    renderAt(<Hero />);
    expect(screen.queryByRole('link', { name: /chat with doc d/i })).not.toBeInTheDocument();
  });

  it('redirects to the Doc D page once the whole conversation is done', () => {
    setScrollProgress(1);
    renderAt(<Hero />);
    expect(screen.getByText(MSG.last)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /chat with doc d yourself/i })).toHaveAttribute(
      'href',
      '/doc-d'
    );
  });

  it('has the asset box and decorative background marked as decoration', () => {
    const { container } = renderAt(<Hero />);
    expect(container.querySelector('[data-backdrop="hero"]')).toHaveAttribute('aria-hidden', 'true');
  });
});
