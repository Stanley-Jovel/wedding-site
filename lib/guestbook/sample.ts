import { MemoryStore, type TableRange } from "./store";

// FICTIONAL guests laid out like the couple's real "Guest List" tab: two tables
// side by side, real header names, "^" households, single names and titles,
// "???" plus-ones, a 0 plus-one with a leftover name, and a totals row below.
// Used for local development and tests. Never real guests.

export const STANLEY_HEADERS = [
  "Name", "Guarda la Fecha", "Invite Sent", "Status", "Plus One?", "Name +1",
  "Dietary restrictions", "Bilingual", "Invite code", "Link", "Answered",
  "Plus-ones coming", "Saturday crafting", "Note to couple", "Language",
];
export const ANNIKA_HEADERS = [
  "Name", "Save the Date", "Invite Sent", "Status", "Plus One?", "Name +1",
  "Dietary restrictions", "Bilingual", "Invite code", "Link", "Answered",
  "Plus-ones coming", "Saturday crafting", "Note to couple", "Language", "Mailing address",
];

type Guest = Partial<Record<string, string>>;

const stanley: Guest[] = [
  { Name: "Rafa" },
  { Name: "Juan Carlos Méndez", "Plus One?": "2", "Name +1": "Lucía, Beto" },
  { Name: "Tía Lucy" },
  { Name: "Mamá Chela", Status: "Maybe" },
  { Name: "Karla Méndez de Ríos", "Plus One?": "1", "Name +1": "Robertito" },
  { Name: "Roberto Ríos", Status: "Maybe" },
  { Name: "Roberto José Ríos" },
  { Name: "David" },
  { Name: "Oscar Pérez", "Plus One?": "1" },
  { Name: "Ana Sofía López", "Invite code": "lopez2" },
  { Name: "Mario López", "Invite code": "lopez2" },
  {},
  {},
];

const annika: Guest[] = [
  { Name: "Kate Morgan", "Mailing address": "12 Elm St, Tacoma WA" },
  { Name: "Ben Morgan", "Mailing address": "^" },
  { Name: "Hannah Price", "Plus One?": "1", "Name +1": "Dan Price", "Invite code": "price1", "Mailing address": "1 Oak Ave, Olympia WA" },
  { Name: "Emily Stone", "Plus One?": "0", "Name +1": "Jack Hale", "Mailing address": "4 Pine Rd, Everett WA" },
  { Name: "Amy Wright", "Plus One?": "1", "Name +1": "Fay ???", "Dietary restrictions": "vegan", "Mailing address": "9 Ash Ct, Boulder CO" },
  { Name: "Grandpa Joe", Status: "Yes", "Mailing address": "7 Bay St, Austin TX" },
  { Name: "Pat + Sam", Status: "Probably no" },
  { Name: "Lena Ortiz", Language: "es", "Mailing address": "n/a" },
  {},
];

export const STANLEY_COL = 0;
export const ANNIKA_COL = STANLEY_HEADERS.length;

export function sampleTables(): TableRange[] {
  return [
    { name: "Stanley Guests", startRow: 0, endRow: stanley.length + 1, startCol: STANLEY_COL, endCol: ANNIKA_COL },
    { name: "Annika Guests", startRow: 0, endRow: annika.length + 1, startCol: ANNIKA_COL, endCol: ANNIKA_COL + ANNIKA_HEADERS.length },
  ];
}

export function sampleGrid(): string[][] {
  const width = ANNIKA_COL + ANNIKA_HEADERS.length;
  const grid: string[][] = Array.from({ length: 18 }, () => Array<string>(width).fill(""));
  const place = (headers: string[], guests: Guest[], startCol: number) => {
    headers.forEach((h, i) => (grid[0][startCol + i] = h));
    guests.forEach((g, r) => headers.forEach((h, i) => (grid[r + 1][startCol + i] = g[h] ?? "")));
  };
  place(STANLEY_HEADERS, stanley, STANLEY_COL);
  place(ANNIKA_HEADERS, annika, ANNIKA_COL);
  // Totals sit below the tables, outside their ranges.
  grid[16][0] = "TOTAL GUESTS=";
  grid[16][1] = "27";
  return grid;
}

export function sampleStore() {
  return new MemoryStore(sampleGrid(), sampleTables());
}
