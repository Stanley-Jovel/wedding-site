import "server-only";
import { JWT } from "google-auth-library";

// Google Sheets access through a service account.
//
// The spreadsheet needs two tabs:
//   Guests: A Household ID | B Guest name             (header row 1, one row per invited person)
//   RSVPs:  A Timestamp | B Household ID | C Guest name | D Attending | E Dietary |
//           F Saturday crafting interest | G Note | H Language   (header row 1; rows are appended)
//
// Env: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
// Share the spreadsheet with the service account email as an Editor.

const API = "https://sheets.googleapis.com/v4/spreadsheets";

export function sheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY,
  );
}

let client: JWT | null = null;
function auth() {
  if (!client) {
    client = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }
  return client;
}

async function request(path: string, init?: RequestInit) {
  const { token } = await auth().getAccessToken();
  const res = await fetch(`${API}/${process.env.GOOGLE_SHEET_ID}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function readRange(range: string): Promise<string[][]> {
  const data = await request(`/values/${encodeURIComponent(range)}`);
  return (data.values as string[][] | undefined) ?? [];
}

export async function appendRows(range: string, rows: (string | number)[][]) {
  await request(
    `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    { method: "POST", body: JSON.stringify({ values: rows }) },
  );
}
