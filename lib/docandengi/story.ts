import type { ChatMessage } from '../types';

export const STORY: ChatMessage[] = [
  { from: 'x', text: 'I can build an app in a weekend. Why GDP Talks?' },
  { from: 'd', text: 'Whose problem are you solving?' },
  { from: 'x', text: 'Mine. Mostly.' },
  { from: 'd', text: 'Convenient. But is it real?' },
  { from: 'x', text: 'What\'s that supposed to mean?' },
  { from: 'd', text: 'Real problems fight back.' },
  { from: 'x', text: 'How?' },
  { from: 'd', text: 'Budgets. Deadlines. People. Old systems.' },
  { from: 'x', text: 'So coding isn\'t the hard part?' },
  { from: 'd', text: 'Finding the right problem is.' },
  { from: 'x', text: 'And GDP Talks?' },
  { from: 'd', text: 'A place where you work on real ones.' },
];

/** intro screen + one stage per message + final "meet Doc D" call to action */
export const STAGES = STORY.length + 2;

export interface ChatState {
  /** index of the one message on screen, or null before the story starts */
  index: number | null;
  /** the link to the Doc D page appears once the whole story has been read */
  showCta: boolean;
}

/** Maps scroll progress (0..1) to the story: exactly one message at a time. */
export function getChatState(progress: number): ChatState {
  const stage = Math.min(STAGES - 1, Math.floor(progress * STAGES));
  if (stage === 0) return { index: null, showCta: false };
  if (stage === STAGES - 1) return { index: STORY.length - 1, showCta: true };
  return { index: stage - 1, showCta: false };
}
