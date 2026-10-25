import type { ChatMessage } from '../types';

// A short story: Engineer X (a student who vibe codes) learns about hosting and deployment
// from Doc D. It is an illustration, not a live chat, and is shown one message at a time.
export const STORY: ChatMessage[] = [
  { from: 'x', text: 'Doc D, my app works perfectly. I built the whole thing in one weekend.' },
  { from: 'd', text: 'Nice work. Where is it running?' },
  { from: 'x', text: 'On my laptop. localhost:3000.' },
  { from: 'd', text: 'So nobody else can see it yet. Hosting is the other half of the job.' },
  { from: 'x', text: 'Honestly, I have no idea how hosting or deployment works.' },
  { from: 'd', text: 'Start small: build it, set your environment variables, pick a host, ship.' },
  { from: 'x', text: 'Environment variables? I pasted my API key straight into the code.' },
  { from: 'd', text: 'Please never do that. Secrets live in environment config, not in your repo.' },
  { from: 'x', text: 'Understood. What else am I missing?' },
  { from: 'd', text: 'A database that is not on your laptop, a domain, and a deploy you can repeat.' },
  { from: 'x', text: 'So deployment is not the last step. It is part of the build.' },
  { from: 'd', text: 'Exactly. Ship early, ship often, and let real users show you what breaks.' },
  { from: 'x', text: 'New plan: deploy a tiny version today, then keep improving it.' },
  { from: 'd', text: 'That is the spirit. Smart people should keep meeting.' },
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
