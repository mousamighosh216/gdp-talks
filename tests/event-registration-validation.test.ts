// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { validateRegistration } from '@/lib/event/eventregistration';

const validRegistration = {
  name: 'Ada Lovelace',
  email: 'ada@example.edu',
  phone: '9876543210',
  eventDescription: Array(50).fill('description').join(' '),
  eventTakeway: Array(20).fill('takeaway').join(' '),
  documentLinks: 'https://example.com/doc',
  consent: true,
};

describe('event registration word limits', () => {
  it('accepts descriptions and takeaways at their minimum word counts', () => {
    expect(validateRegistration(validRegistration).ok).toBe(true);
  });

  it('rejects descriptions and takeaways below their minimum word counts', () => {
    const result = validateRegistration({
      ...validRegistration,
      eventDescription: Array(49).fill('description').join(' '),
      eventTakeway: Array(19).fill('takeaway').join(' '),
    });

    expect(result).toMatchObject({
      ok: false,
      errors: {
        eventDescription: expect.any(String),
        eventTakeway: expect.any(String),
      },
    });
  });
});
