// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { sendMail, saveRegistration } = vi.hoisted(() => ({
  sendMail: vi.fn().mockResolvedValue(undefined),
  saveRegistration: vi.fn().mockResolvedValue({ ok: true, reference: 'GDP-7K2M9Q' }),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: () => ({ sendMail }),
  },
}));

vi.mock('@/lib/registration/registrationStore', () => ({
  makeReference: () => 'GDP-7K2M9Q',
  saveRegistration,
}));

import { POST as register } from '@/app/api/register/route';

const registration = {
  teamName: 'Quantum Badgers',
  institution: 'Example University',
  members: [
    { name: 'Ada Lovelace', email: 'ada@example.edu', phone: '9876543210' },
    { name: 'Grace Hopper', email: 'grace@example.edu', phone: '9876543211' },
  ],
  consent: true,
};

const postRegistration = () =>
  register(
    new Request('http://localhost/api/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(registration),
    })
  );

beforeEach(() => {
  vi.stubEnv('MAIL_HOST', 'smtp.example.edu');
  vi.stubEnv('MAIL_PORT', '587');
  vi.stubEnv('MAIL_USER', 'mailer@example.edu');
  vi.stubEnv('MAIL_PASS', 'test-password');
  vi.stubEnv('MAIL_FROM', 'GDP Talks <mailer@example.edu>');
  sendMail.mockClear().mockResolvedValue(undefined);
  saveRegistration.mockClear().mockResolvedValue({ ok: true, reference: 'GDP-7K2M9Q' });
});

describe('POST /api/register confirmation email', () => {
  it('emails each team member the saved registration and reference', async () => {
    const response = await postRegistration();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      reference: 'GDP-7K2M9Q',
      emailSent: true,
    });
    expect(sendMail).toHaveBeenCalledTimes(2);
    for (const [index, member] of registration.members.entries()) {
      const message = sendMail.mock.calls[index][0];
      expect(message.to).toBe(member.email);
      expect(message.from).toBe('GDP Talks <mailer@example.edu>');
      expect(message.text).toContain('Reference ID: GDP-7K2M9Q');
      expect(message.text).toContain('Team name: Quantum Badgers');
      expect(message.text).toContain('Institution: Example University');
      expect(message.text).toContain('Ada Lovelace');
      expect(message.text).toContain('Grace Hopper');
      expect(message.text).toContain('+91' + member.phone);
    }
  });

  it('keeps the registration successful and reports failed email delivery', async () => {
    sendMail.mockRejectedValueOnce(new Error('SMTP unavailable'));
    const response = await postRegistration();

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      ok: true,
      reference: 'GDP-7K2M9Q',
      emailSent: false,
    });
    expect(saveRegistration).toHaveBeenCalledOnce();
    expect(sendMail).toHaveBeenCalledTimes(2);
  });
});
