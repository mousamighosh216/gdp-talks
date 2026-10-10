import type { ChatMessage } from '../types';

// Engineer X (a student who vibe codes) learns about hosting and deployment from Doc D.
// Messages alternate X, D so they can be shown as pairs.
export const STORY: ChatMessage[] = [
  { from: 'x', text: 'Doc D, my app works perfectly. I built the whole thing in one weekend.', time: '10:02' },
  { from: 'd', text: 'Nice work. Where is it running?', time: '10:02' },
  { from: 'x', text: 'On my laptop. localhost:3000.', time: '10:03' },
  { from: 'd', text: 'So nobody else can see it yet. Hosting is the other half of the job.', time: '10:03' },
  { from: 'x', text: 'Honestly, I have no idea how hosting or deployment works.', time: '10:04' },
  { from: 'd', text: 'Start small: build it, set your environment variables, pick a host, ship.', time: '10:04' },
  { from: 'x', text: 'Environment variables? I pasted my API key straight into the code.', time: '10:05' },
  { from: 'd', text: 'Please never do that. Secrets live in environment config, not in your repo.', time: '10:05' },
  { from: 'x', text: 'Understood. What else am I missing?', time: '10:06' },
  { from: 'd', text: 'A database that is not on your laptop, a domain, and a deploy you can repeat.', time: '10:06' },
  { from: 'x', text: 'So deployment is not the last step. It is part of the build.', time: '10:07' },
  { from: 'd', text: 'Exactly. Ship early, ship often, and let real users show you what breaks.', time: '10:07' },
  { from: 'x', text: 'New plan: deploy a tiny version today, then keep improving it.', time: '10:08' },
  { from: 'd', text: 'That is the spirit. Smart people should keep meeting.', time: '10:08' },
];

export type Pair = [ChatMessage, ChatMessage];

export const PAIRS: Pair[] = Array.from({ length: STORY.length / 2 }, (_, i) => [
  STORY[i * 2],
  STORY[i * 2 + 1],
]);

/** intro screen + one stage per pair + final "meet Doc D" call to action */
export const STAGES = PAIRS.length + 2;

export interface ChatState {
  /** which pair is on screen, or null before the conversation starts */
  pairIndex: number | null;
  /** how many messages of that pair are showing (0, 1 or 2) */
  visible: 0 | 1 | 2;
  /** who is "typing" right now */
  typing: 'x' | 'd' | null;
  /** the redirect to the Doc D page appears once the whole conversation is done */
  showCta: boolean;
}

/** Maps scroll progress (0..1) to what the chat shows: two messages at a time. */
export function getChatState(progress: number): ChatState {
  const raw = progress * STAGES;
  const stage = Math.min(STAGES - 1, Math.floor(raw));
  const frac = progress >= 1 ? 1 : raw - Math.floor(raw);

  if (stage === 0) {
    return { pairIndex: null, visible: 0, typing: progress > 0 && frac > 0.5 ? 'x' : null, showCta: false };
  }
  if (stage === STAGES - 1) {
    return { pairIndex: PAIRS.length - 1, visible: 2, typing: null, showCta: true };
  }

  const pairIndex = stage - 1;
  if (frac < 0.3) return { pairIndex, visible: 1, typing: null, showCta: false };
  if (frac < 0.55) {
    return { pairIndex, visible: 1, typing: PAIRS[pairIndex][1].from, showCta: false };
  }
  return { pairIndex, visible: 2, typing: null, showCta: false };
}
