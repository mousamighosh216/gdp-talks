import { google } from 'googleapis';

const SHEET_TAB = 'Registrations';

function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  // .env files and dashboards store the key's line breaks as the two characters \n
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!email || !key || !sheetId) return null;

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return { sheets: google.sheets({ version: 'v4', auth }), sheetId };
}

export const sheetsConfigured = () => getSheetsClient() !== null;

export type SheetResult =
  | { ok: true }
  | { ok: false; duplicate: 'reference' | 'teamName' | `members.${number}.email` };

const plain = (v: unknown) => String(v ?? '').trim().toLowerCase();

export async function appendRegistration(
  reference: string,
  v: {
    teamName: string;
    institution: string;
    members: { name: string; email: string; phone: string }[];
  }
): Promise<SheetResult> {
  const client = getSheetsClient();
  if (!client) throw new Error('Google Sheets is not configured');
  const { sheets, sheetId } = client;

  // 1. One read: references (B), team names (C), and the three email columns (G, J, M)
  const read = await sheets.spreadsheets.values.batchGet({
    spreadsheetId: sheetId,
    ranges: [
      `${SHEET_TAB}!B2:B`,
      `${SHEET_TAB}!C2:C`,
      `${SHEET_TAB}!G2:G`,
      `${SHEET_TAB}!J2:J`,
      `${SHEET_TAB}!M2:M`,
    ],
  });
  const [references, teams, ...emailCols] = (read.data.valueRanges ?? []).map((r) =>
    (r.values ?? []).flat().map(plain)
  );
  if (references?.includes(plain(reference))) return { ok: false, duplicate: 'reference' };
  if (teams?.includes(plain(v.teamName))) return { ok: false, duplicate: 'teamName' };
  const taken = new Set(emailCols.flat());
  for (let i = 0; i < v.members.length; i++) {
    if (taken.has(plain(v.members[i].email))) {
      return { ok: false, duplicate: `members.${i}.email` };
    }
  }

  // 2. One write: a single row, columns A to O
  const row: string[] = [new Date().toISOString(), reference, v.teamName, v.institution, String(v.members.length)];
  for (let i = 0; i < 3; i++) {
    const m = v.members[i];
    row.push(m?.name ?? '', m?.email ?? '', m ? `+91${m.phone}` : '');
  }
  row.push('Yes');

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: `${SHEET_TAB}!A:O`,
    valueInputOption: 'RAW', // stored exactly as sent; "=1+1" stays text
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });
  return { ok: true };
}