// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { append, batchGet } = vi.hoisted(() => ({
  append: vi.fn(),
  batchGet: vi.fn(),
}));

vi.mock('googleapis', () => ({
  google: {
    auth: { GoogleAuth: vi.fn() },
    sheets: () => ({ spreadsheets: { values: { append, batchGet } } }),
  },
}));

import { appendRegistration, appendTalksRegistration } from '@/lib/db/sheets';

const registration = {
  teamName: 'Team One',
  institution: 'Example University',
  referralSource: 'Social Media' as const,
  members: [{ name: 'Member One', email: 'member@example.com', phone: '1234567890' }],
};

beforeEach(() => {
  vi.stubEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL', 'service@example.com');
  vi.stubEnv('GOOGLE_PRIVATE_KEY', 'private-key');
  vi.stubEnv('GOOGLE_SHEET_ID', 'sheet-id');
  append.mockReset();
  batchGet.mockReset();
});

describe('appendRegistration reference uniqueness', () => {
  it('appends the referral source in column P', async () => {
    batchGet.mockResolvedValue({ data: { valueRanges: Array.from({ length: 5 }, () => ({ values: [] })) } });

    await expect(appendRegistration('GDP-7K2M9Q', registration)).resolves.toEqual({ ok: true });

    const request = append.mock.calls[0][0];
    expect(request.range).toBe('Registrations!A:P');
    expect(request.requestBody.values[0]).toEqual([
      expect.any(String),
      'GDP-7K2M9Q',
      'Team One',
      'Example University',
      '1',
      'Member One',
      'member@example.com',
      '+911234567890',
      '',
      '',
      '',
      '',
      '',
      '',
      'Yes',
      'Social Media',
    ]);
  });

  it('checks existing references in column B and skips duplicate IDs', async () => {
    batchGet.mockResolvedValue({
      data: {
        valueRanges: [
          { values: [['GDP-7K2M9Q']] },
          { values: [] },
          { values: [] },
          { values: [] },
          { values: [] },
        ],
      },
    });

    await expect(appendRegistration('gdp-7k2m9q', registration)).resolves.toEqual({
      ok: false,
      duplicate: 'reference',
    });
    expect(batchGet.mock.calls[0][0].ranges).toContain('Registrations!B2:B');
    expect(append).not.toHaveBeenCalled();
  });
});

describe('appendTalksRegistration', () => {
  it('checks the submitted reference and appends all ten event fields through column J', async () => {
    batchGet.mockResolvedValue({
      data: {
        valueRanges: [{ values: [['GDP-7K2M9Q']] }, { values: [] }],
      },
    });

    await expect(
      appendTalksRegistration('GDP-ABCDE', {
        name: 'Ada Lovelace',
        email: 'ada@example.edu',
        phone: '9876543210',
        talksID: 'GDP-7K2M9Q',
        eventDescription: 'A sufficiently detailed event description',
        eventTakeway: 'A useful takeaway',
        documentLinks: 'https://example.com/doc',
      })
    ).resolves.toEqual({ ok: true });

    const request = append.mock.calls[0][0];
    expect(request.range).toBe('Event!A:J');
    expect(request.requestBody.values[0]).toHaveLength(10);
    expect(request.requestBody.values[0][5]).toBe('GDP-7K2M9Q');
    expect(request.requestBody.values[0][9]).toBe('Yes');
    expect(batchGet.mock.calls[0][0].ranges).toEqual(['Registrations!B2:B', 'Event!D2:D']);
  });

  it('does not append when the submitted reference is not in the registration sheet', async () => {
    batchGet.mockResolvedValue({
      data: {
        valueRanges: [{ values: [['GDP-7K2M9Q']] }, { values: [] }],
      },
    });

    await expect(
      appendTalksRegistration('GDP-ABCDE', {
        name: 'Ada Lovelace',
        email: 'ada@example.edu',
        phone: '9876543210',
        talksID: 'GDP-9Z9Z9Z',
        eventDescription: 'A sufficiently detailed event description',
        eventTakeway: 'A useful takeaway',
        documentLinks: 'https://example.com/doc',
      })
    ).resolves.toEqual({ ok: false, duplicate: 'talksID' });
    expect(append).not.toHaveBeenCalled();
  });
});
