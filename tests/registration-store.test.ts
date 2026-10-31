// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { appendRegistration, sheetsConfigured } = vi.hoisted(() => ({
  appendRegistration: vi.fn(),
  sheetsConfigured: vi.fn(() => true),
}));

vi.mock('@/lib/db/sheets', () => ({ appendRegistration, sheetsConfigured }));

import { saveRegistration } from '@/lib/registration/registrationStore';

const registration = {
  teamName: 'Team One',
  institution: 'Example University',
  members: [{ name: 'Member One', email: 'member@example.com', phone: '1234567890' }],
  consent: true,
};

beforeEach(() => {
  appendRegistration.mockReset();
  sheetsConfigured.mockReturnValue(true);
});

describe('saveRegistration reference uniqueness', () => {
  it('generates a new reference and retries once after a collision', async () => {
    appendRegistration
      .mockResolvedValueOnce({ ok: false, duplicate: 'reference' })
      .mockResolvedValueOnce({ ok: true });

    const result = await saveRegistration(registration);

    expect(result).toMatchObject({ ok: true });
    expect(appendRegistration).toHaveBeenCalledTimes(2);
    expect(appendRegistration.mock.calls[0][0]).not.toBe(appendRegistration.mock.calls[1][0]);
  });

  it('stops after two reference collisions', async () => {
    appendRegistration.mockResolvedValue({ ok: false, duplicate: 'reference' });

    const result = await saveRegistration(registration);

    expect(result).toEqual({
      ok: false,
      status: 503,
      message: 'We could not generate a unique registration reference. Please try again.',
    });
    expect(appendRegistration).toHaveBeenCalledTimes(2);
  });

  it('does not retry team or email conflicts', async () => {
    appendRegistration.mockResolvedValue({ ok: false, duplicate: 'teamName' });

    const result = await saveRegistration(registration);

    expect(result).toMatchObject({ ok: false, status: 409, field: 'teamName' });
    expect(appendRegistration).toHaveBeenCalledOnce();
  });
});
