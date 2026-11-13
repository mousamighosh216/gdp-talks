// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { saveEventRegistration, sendRegistrationConfirmation } = vi.hoisted(() => ({
  saveEventRegistration: vi.fn(),
  sendRegistrationConfirmation: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/event/event', () => ({ saveEventRegistration }));
vi.mock('@/lib/event/eventmail', () => ({ sendRegistrationConfirmation }));

import { POST as registerEvent } from '@/app/api/event-register/route';
import { resetRateLimit } from '@/lib/registration/rateLimit';

const registration = {
  name: 'Ada Lovelace',
  email: 'ada@example.edu',
  phone: '9876543210',
  talksID: 'GDP-7K2M9Q',
  eventDescription: Array(50).fill('description').join(' '),
  eventTakeway: Array(20).fill('takeaway').join(' '),
  documentLinks: 'https://example.com/doc',
  consent: true,
};

const postRegistration = (body: unknown) =>
  registerEvent(
    new Request('http://localhost/api/event-register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
  );

beforeEach(() => {
  resetRateLimit();
  saveEventRegistration.mockReset().mockResolvedValue({ ok: true, reference: 'GDP-ABCDE' });
  sendRegistrationConfirmation.mockReset().mockResolvedValue(undefined);
});

describe('POST /api/event-register', () => {
  it('validates and saves an event registration', async () => {
    const response = await postRegistration(registration);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      reference: 'GDP-ABCDE',
      emailSent: true,
    });
    expect(saveEventRegistration).toHaveBeenCalledWith(registration);
  });

  it('returns validation errors without saving invalid input', async () => {
    const response = await postRegistration({ ...registration, email: 'not-an-email' });

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ errors: { email: expect.any(String) } });
    expect(saveEventRegistration).not.toHaveBeenCalled();
  });
});
