import "server-only";
import { JWT } from "google-auth-library";
import type { CellUpdate, SheetStore, TableData } from "./store";

// The couple's spreadsheet through a Google service account.
// Env: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY.
// Share the spreadsheet with the service account email as an Editor.

const API = "https://sheets.googleapis.com/v4/spreadsheets";
export const GUEST_TAB = "Guest List";
export const LOG_TAB = "RSVP log";

export function sheetsConfigured() {
  return Boolean(
    process.env.GOOGLE_SHEET_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY,
  );
}

let client: JWT | null = null;
function auth() {
  client ??= new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return client;
}

async function request(path: string, init?: RequestInit) {
  const { token } = await auth().getAccessToken();
  const res = await fetch(`${API}/${process.env.GOOGLE_SHEET_ID}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Sheets API ${res.status}: ${await res.text()}`);
  return res.json();
}

function columnLetter(index: number) {
  let s = "";
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

const quoted = (tab: string) => `'${tab.replace(/'/g, "''")}'`;

type GridRange = { startRowIndex?: number; endRowIndex?: number; startColumnIndex?: number; endColumnIndex?: number };
type Meta = { sheets: { properties: { title: string }; tables?: { name: string; range: GridRange }[] }[] };

export function googleStore(): SheetStore {
  return {
    async readTables(): Promise<TableData[]> {
      const meta: Meta = await request(`?fields=${encodeURIComponent("sheets(properties(title),tables(name,range))")}`);
      const sheet = meta.sheets.find((s) => s.properties.title === GUEST_TAB);
      if (!sheet) throw new Error(`No "${GUEST_TAB}" tab in the spreadsheet`);
      const tables = sheet.tables ?? [];
      if (tables.length === 0) throw new Error(`No tables on the "${GUEST_TAB}" tab`);

      const data = await request(`/values/${encodeURIComponent(quoted(GUEST_TAB))}`);
      const grid = (data.values as string[][] | undefined) ?? [];
      const at = (r: number, c: number) => String(grid[r]?.[c] ?? "");

      return tables.map(({ name, range }) => {
        const startRow = range.startRowIndex ?? 0;
        const endRow = range.endRowIndex ?? grid.length;
        const startCol = range.startColumnIndex ?? 0;
        const endCol = range.endColumnIndex ?? startCol;
        const slice = (r: number) => Array.from({ length: endCol - startCol }, (_, i) => at(r, startCol + i));
        const rows: string[][] = [];
        for (let r = startRow + 1; r < endRow; r++) rows.push(slice(r));
        return { name, headerRow: startRow, startCol, headers: slice(startRow), rows };
      });
    },

    async writeCells(updates: CellUpdate[]) {
      if (updates.length === 0) return;
      await request(`/values:batchUpdate`, {
        method: "POST",
        body: JSON.stringify({
          // RAW: guests' text is stored as typed, never run as a formula.
          valueInputOption: "RAW",
          data: updates.map((u) => ({
            range: `${quoted(GUEST_TAB)}!${columnLetter(u.col)}${u.row + 1}`,
            values: [[u.value]],
          })),
        }),
      });
    },

    async appendLog(rows: string[][]) {
      await request(
        `/values/${encodeURIComponent(`${quoted(LOG_TAB)}!A:K`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        { method: "POST", body: JSON.stringify({ values: rows }) },
      );
    },
  };
}
