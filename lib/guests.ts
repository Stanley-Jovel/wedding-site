import "server-only";
import { appendRows, readRange, sheetsConfigured } from "./sheets";

export type Household = { id: string; members: string[] };

export type ReplyRow = {
  householdId: string;
  name: string;
  attending: boolean;
  dietary: string;
  saturday: boolean;
  note: string;
  lang: string;
};

export type Mode = "sheets" | "dev" | "off";

// Sheets in any environment where it's configured; sample data only in local development.
export function mode(): Mode {
  if (sheetsConfigured()) return "sheets";
  if (process.env.NODE_ENV === "development") return "dev";
  return "off";
}

// SAMPLE DATA for local development only. Not real guests; never used in production.
const devHouseholds: Household[] = [
  { id: "SAMPLE-1", members: ["Ana Martínez", "Carlos Martínez"] },
  { id: "SAMPLE-2", members: ["Jordan Sample"] },
  { id: "SAMPLE-3", members: ["Ana Ramírez", "Luis Ramírez", "Sofía Ramírez"] },
];

export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export async function allHouseholds(): Promise<Household[]> {
  const m = mode();
  if (m === "dev") return devHouseholds;
  if (m === "off") return [];
  const rows = await readRange("Guests!A2:B");
  const map = new Map<string, string[]>();
  for (const [id, name] of rows) {
    if (!id?.trim() || !name?.trim()) continue;
    const key = id.trim();
    map.set(key, [...(map.get(key) ?? []), name.trim()]);
  }
  return [...map.entries()].map(([id, members]) => ({ id, members }));
}

// A household matches when one of its members contains every word the guest typed
// (accents and capitals ignored), e.g. "emma christensen" or "christensen emma".
export function matchHouseholds(households: Household[], query: string) {
  const words = normalize(query);
  if (words.length === 0) return [];
  return households.filter((h) =>
    h.members.some((member) => {
      const tokens = normalize(member);
      return words.every((w) => tokens.some((t) => t.startsWith(w)));
    }),
  );
}

// When this household last replied (ISO timestamp), if ever.
export async function lastReply(householdId: string): Promise<string | null> {
  if (mode() !== "sheets") return null;
  const rows = await readRange("RSVPs!A2:B");
  let latest: string | null = null;
  for (const [ts, id] of rows) {
    if (id?.trim() === householdId && ts && (!latest || ts > latest)) latest = ts;
  }
  return latest;
}

export async function saveReplies(rows: ReplyRow[]) {
  const m = mode();
  if (m === "dev") {
    console.info("[rsvp:dev] not saved", rows);
    return;
  }
  if (m === "off") throw new Error("RSVP storage is not configured");
  const ts = new Date().toISOString();
  await appendRows(
    "RSVPs!A:H",
    rows.map((r) => [
      ts,
      r.householdId,
      r.name,
      r.attending ? "yes" : "no",
      r.dietary,
      r.saturday ? "yes" : "no",
      r.note,
      r.lang,
    ]),
  );
}
