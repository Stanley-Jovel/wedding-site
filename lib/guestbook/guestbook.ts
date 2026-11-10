import type { CellUpdate, SheetStore, TableData } from "./store";

// The RSVP domain over the couple's "Guest List" tab.
//
// The tab holds two tables, "Stanley Guests" and "Annika Guests". Each row is
// one invited person. Rows that share an Invite code are one invitation.
// Columns are found by header name, so the couple can reorder them freely.

export type Side = "stanley" | "annika";
export type Lang = "es" | "en";
export type YesNo = "yes" | "no";

export type Person = { name: string; attending: YesNo | null; dietary: string };

export type PlusSlot = {
  /** Stable within an invitation: host name + slot number. */
  key: string;
  host: string;
  /** Name as known (from the sheet, or the guest's last reply); "" when unknown. */
  name: string;
  /** True when the couple (or an earlier reply) already has a name for this slot. */
  named: boolean;
  attending: YesNo | null;
  dietary: string;
};

export type Invitation = {
  code: string;
  side: Side;
  lang: Lang;
  people: Person[];
  plusOnes: PlusSlot[];
  /** Date of the latest reply (YYYY-MM-DD, El Salvador time), or null. */
  answered: string | null;
  saturday: boolean;
  note: string;
  closed: boolean;
};

export type SearchResult =
  | { status: "found"; candidates: { code: string; name: string }[] }
  | { status: "too-many" | "not-found" };

export type Reply = {
  people: Record<string, { attending: YesNo | null; dietary: string }>;
  plusOnes: Record<string, { attending: YesNo | null; name: string; dietary: string }>;
  saturday: boolean;
  note: string;
  lang: Lang;
};

export type SubmitResult =
  | { status: "saved"; anyAttending: boolean }
  | { status: "missing"; people: string[]; plusOnes: string[]; plusOneNames: string[] }
  | { status: "closed" | "not-found" };

export class SheetFormatError extends Error {}

const COLUMNS = {
  name: "name",
  status: "status",
  plusAllowed: "plus one?",
  plusNames: "name +1",
  dietary: "dietary restrictions",
  code: "invite code",
  link: "link",
  answered: "answered",
  plusComing: "plus-ones coming",
  saturday: "saturday crafting",
  note: "note to couple",
  language: "language",
  address: "mailing address",
} as const;
type ColumnKey = keyof typeof COLUMNS;
const OPTIONAL: ColumnKey[] = ["address"];

const MAX = { name: 80, dietary: 300, note: 1000, query: 120 };
const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const CODE_LENGTH = 6;
export const SEARCH_LIMIT = 4;

// Family titles and connecting words that shouldn't decide a match.
const IGNORED_WORDS = new Set([
  "tia", "tio", "mama", "papa", "abuela", "abuelo", "abuelita", "abuelito", "don", "dona",
  "grandma", "grandpa", "grandmother", "grandfather", "uncle", "aunt", "auntie", "nana",
  "de", "del", "la", "las", "los", "y", "and",
]);

type Row = {
  side: Side;
  /** Absolute row index on the tab. */
  abs: number;
  col: Partial<Record<ColumnKey, number>>;
  get: (key: ColumnKey) => string;
};

type Options = {
  store: SheetStore;
  deadline: string;
  baseUrl: string;
  now?: () => Date;
  random?: () => number;
};

export function words(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !IGNORED_WORDS.has(w));
}

function sideOf(tableName: string): Side {
  return /annika/i.test(tableName) ? "annika" : "stanley";
}

function parse(tables: TableData[]): Row[] {
  const rows: Row[] = [];
  for (const t of tables) {
    const headers = t.headers.map((h) => h.trim().toLowerCase());
    const col: Partial<Record<ColumnKey, number>> = {};
    for (const key of Object.keys(COLUMNS) as ColumnKey[]) {
      const i = headers.indexOf(COLUMNS[key]);
      if (i >= 0) col[key] = t.startCol + i;
      else if (!OPTIONAL.includes(key)) {
        throw new SheetFormatError(`Table "${t.name}" has no "${COLUMNS[key]}" column`);
      }
    }
    t.rows.forEach((cells, i) => {
      const get = (key: ColumnKey) => {
        const c = col[key];
        return c === undefined ? "" : (cells[c - t.startCol] ?? "").trim();
      };
      rows.push({ side: sideOf(t.name), abs: t.headerRow + 1 + i, col, get });
    });
  }
  return rows.filter((r) => r.get("name"));
}

function plusAllowed(r: Row) {
  const n = Number.parseInt(r.get("plusAllowed"), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 10) : 0;
}

function knownPlusNames(r: Row) {
  return r.get("plusNames").split(",").map((s) => s.trim()).filter(Boolean);
}

function langOf(rows: Row[]): Lang {
  for (const r of rows) {
    const l = r.get("language").toLowerCase();
    if (l === "es" || l === "en") return l;
  }
  return rows[0].side === "annika" ? "en" : "es";
}

/** Split a host's dietary cell into their own needs and each plus-one's ("Name: needs"). */
function splitDietary(cell: string, slotNames: string[]) {
  const own: string[] = [];
  const bySlot = new Map<string, string>();
  const lower = slotNames.filter(Boolean).map((n) => n.toLowerCase());
  for (const part of cell.split(/;\s*/)) {
    const m = part.match(/^(.+?):\s*(.*)$/);
    if (m && lower.includes(m[1].trim().toLowerCase())) bySlot.set(m[1].trim().toLowerCase(), m[2].trim());
    else if (part.trim()) own.push(part.trim());
  }
  return { own: own.join("; "), bySlot };
}

function yesNo(value: string): YesNo | null {
  const v = value.toLowerCase();
  return v === "yes" ? "yes" : v === "no" ? "no" : null;
}

function clip(value: string, max: number) {
  return value.trim().slice(0, max);
}

export function createGuestBook({ store, deadline, baseUrl, now = () => new Date(), random = Math.random }: Options) {
  const isClosed = () => now().getTime() > new Date(deadline).getTime();

  function newCode(taken: Set<string>) {
    for (;;) {
      let code = "";
      for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
      if (!taken.has(code)) {
        taken.add(code);
        return code;
      }
    }
  }

  function linkFor(code: string, lang: Lang) {
    return `${baseUrl.replace(/\/$/, "")}/${lang}/rsvp/${code}`;
  }

  /** Read the tables, giving blank-code rows a code and keeping every Link cell current. */
  async function load() {
    const rows = parse(await store.readTables());
    const updates: CellUpdate[] = [];
    const codes = new Map<Row, string>();
    const taken = new Set(rows.map((r) => r.get("code").toLowerCase()).filter(Boolean));

    for (const r of rows) {
      let code = r.get("code").toLowerCase();
      if (!code) {
        // "^" in the address column means "same household as the row above".
        const above = rows.find((o) => o.side === r.side && o.abs === r.abs - 1);
        code = r.get("address") === "^" && above && codes.get(above) ? codes.get(above)! : newCode(taken);
        updates.push({ row: r.abs, col: r.col.code!, value: code });
      }
      codes.set(r, code);
    }

    const groups = new Map<string, Row[]>();
    for (const r of rows) {
      const code = codes.get(r)!;
      groups.set(code, [...(groups.get(code) ?? []), r]);
    }
    for (const [code, members] of groups) {
      const link = linkFor(code, langOf(members));
      for (const r of members) {
        if (r.get("link") !== link) updates.push({ row: r.abs, col: r.col.link!, value: link });
      }
    }

    if (updates.length) await store.writeCells(updates);
    return groups;
  }

  function toInvitation(code: string, rows: Row[]): Invitation {
    const answered = rows.map((r) => r.get("answered")).filter(Boolean).sort().at(-1) ?? null;
    const replied = answered !== null;
    const plusOnes: PlusSlot[] = [];
    const people: Person[] = rows.map((r) => {
      const allowed = plusAllowed(r);
      const known = knownPlusNames(r);
      const slotNames = Array.from({ length: allowed }, (_, i) => {
        const n = known[i] ?? "";
        return n.includes("???") ? "" : n;
      });
      const diet = splitDietary(r.get("dietary"), slotNames);
      const coming = Number.parseInt(r.get("plusComing"), 10) || 0;
      slotNames.forEach((name, i) => {
        plusOnes.push({
          key: `${r.get("name")}#${i + 1}`,
          host: r.get("name"),
          name,
          named: Boolean(name),
          attending: replied ? (i < coming ? "yes" : "no") : null,
          dietary: replied && name ? (diet.bySlot.get(name.toLowerCase()) ?? "") : "",
        });
      });
      return {
        name: r.get("name"),
        attending: replied ? yesNo(r.get("status")) : null,
        // Before a guest replies, the cell holds the couple's own notes; don't show those.
        dietary: replied ? diet.own : "",
      };
    });
    return {
      code,
      side: rows[0].side,
      lang: langOf(rows),
      people,
      plusOnes,
      answered,
      saturday: rows.some((r) => r.get("saturday").toLowerCase() === "yes"),
      note: rows.map((r) => r.get("note")).find(Boolean) ?? "",
      closed: isClosed(),
    };
  }

  async function findByCode(code: string): Promise<Invitation | null> {
    const key = code.trim().toLowerCase();
    if (!key) return null;
    const rows = (await load()).get(key);
    return rows ? toInvitation(key, rows) : null;
  }

  async function search(query: string): Promise<SearchResult> {
    const q = new Set(words(query.slice(0, MAX.query)));
    if (q.size === 0) return { status: "not-found" };
    const candidates: { code: string; name: string }[] = [];
    for (const [code, rows] of await load()) {
      const hit = rows.find((r) => {
        const name = [...new Set(words(r.get("name")))];
        if (name.length === 0) return false;
        const shared = name.filter((w) => q.has(w)).length;
        return shared === name.length || shared >= 2;
      });
      if (hit) candidates.push({ code, name: hit.get("name") });
    }
    if (candidates.length === 0) return { status: "not-found" };
    if (candidates.length > SEARCH_LIMIT) return { status: "too-many" };
    return { status: "found", candidates };
  }

  async function submit(code: string, reply: Reply): Promise<SubmitResult> {
    if (isClosed()) return { status: "closed" };
    const key = code.trim().toLowerCase();
    // Re-read at submit time: rows may have been sorted or inserted since the page loaded.
    const rows = (await load()).get(key);
    if (!rows) return { status: "not-found" };
    const invitation = toInvitation(key, rows);

    const missingPeople = invitation.people
      .filter((p) => !reply.people[p.name]?.attending)
      .map((p) => p.name);
    const missingPlus = invitation.plusOnes.filter((s) => !reply.plusOnes[s.key]?.attending).map((s) => s.key);
    const missingNames = invitation.plusOnes
      .filter((s) => reply.plusOnes[s.key]?.attending === "yes" && !(clip(reply.plusOnes[s.key].name, MAX.name) || s.name))
      .map((s) => s.key);
    if (missingPeople.length || missingPlus.length || missingNames.length) {
      return { status: "missing", people: missingPeople, plusOnes: missingPlus, plusOneNames: missingNames };
    }

    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/El_Salvador" }).format(now());
    const stamp = now().toISOString();
    const note = clip(reply.note, MAX.note);
    const saturday = reply.saturday ? "Yes" : "No";
    const updates: CellUpdate[] = [];
    const log: string[][] = [];
    const set = (r: Row, key: ColumnKey, value: string) => updates.push({ row: r.abs, col: r.col[key]!, value });

    for (const r of rows) {
      const name = r.get("name");
      const answer = reply.people[name];
      const slots = invitation.plusOnes
        .filter((s) => s.host === name)
        .map((s) => {
          const a = reply.plusOnes[s.key];
          return {
            attending: a.attending as YesNo,
            name: clip(a.name, MAX.name) || s.name,
            dietary: a.attending === "yes" ? clip(a.dietary, MAX.dietary) : "",
          };
        });
      const own = clip(answer.dietary, MAX.dietary);
      const dietary = [own, ...slots.filter((s) => s.dietary && s.name).map((s) => `${s.name}: ${s.dietary}`)]
        .filter(Boolean)
        .join("; ");

      set(r, "status", answer.attending === "yes" ? "Yes" : "No");
      set(r, "dietary", dietary);
      set(r, "answered", today);
      set(r, "saturday", saturday);
      set(r, "note", note);
      if (slots.length) {
        const coming = slots.filter((s) => s.attending === "yes");
        // Attending plus-ones first, so the count and the names line up on the next read.
        const ordered = [...coming, ...slots.filter((s) => s.attending === "no")];
        set(r, "plusComing", String(coming.length));
        set(r, "plusNames", ordered.map((s) => s.name).filter(Boolean).join(", "));
      }

      const base = [stamp, key, r.side];
      log.push([...base, name, "guest", answer.attending === "yes" ? "Yes" : "No", "", own, saturday, note, reply.lang]);
      for (const s of slots) {
        log.push([...base, name, "plus-one", s.attending === "yes" ? "Yes" : "No", s.name, s.dietary, saturday, note, reply.lang]);
      }
    }

    await store.writeCells(updates);
    await store.appendLog(log);
    const anyAttending =
      invitation.people.some((p) => reply.people[p.name].attending === "yes") ||
      invitation.plusOnes.some((s) => reply.plusOnes[s.key].attending === "yes");
    return { status: "saved", anyAttending };
  }

  /** Give every named row a code and an up-to-date link. Returns nothing; reads do this too. */
  async function fillMissingCodes() {
    await load();
  }

  return { findByCode, search, submit, fillMissingCodes };
}

export type GuestBook = ReturnType<typeof createGuestBook>;
