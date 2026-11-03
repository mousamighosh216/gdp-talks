import { describe, expect, it } from 'vitest';
import { REFERRAL_SOURCES, validateRegistration } from '@/lib/registration/registration';

const registration = {
  teamName: 'Team One',
  institution: 'Example University',
  members: [
    { name: 'Member One', email: 'one@example.com', phone: '9876543210' },
    { name: 'Member Two', email: 'two@example.com', phone: '9876543211' },
  ],
  consent: true,
};

describe('registration referral source', () => {
  it.each(REFERRAL_SOURCES)('accepts %s', (referralSource) => {
    const result = validateRegistration({ ...registration, referralSource });

    expect(result).toMatchObject({ ok: true, value: { referralSource } });
  });

  it.each([undefined, '', 'Other'])('requires a listed referral source (%s)', (referralSource) => {
    const result = validateRegistration({ ...registration, referralSource });

    expect(result).toMatchObject({
      ok: false,
      errors: { referralSource: 'Select how you discovered GDP Talks' },
    });
  });
});
