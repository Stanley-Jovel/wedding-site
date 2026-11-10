import { describe, expect, it } from "vitest";
import { createGuestBook, SheetFormatError, type Reply } from "./guestbook";
import { ANNIKA_COL, ANNIKA_HEADERS, STANLEY_COL, STANLEY_HEADERS, sampleStore } from "./sample";
import type { MemoryStore } from "./store";

const DEADLINE = "2027-02-01T23:59:59-06:00";
const BASE = "https://wedding.example";

function seeded() {
  let s = 42;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function setup(now = "2026-12-01T18:00:00Z", store: MemoryStore = sampleStore()) {
  const book = createGuestBook({ store, deadline: DEADLINE, baseUrl: BASE, now: () => new Date(now), random: seeded() });
  return { store, book };
}

// Read a cell by the guest's name and the column header, wherever the row sits now.
function cell(store: MemoryStore, guest: string, header: string) {
  for (const [headers, start] of [[STANLEY_HEADERS, STANLEY_COL], [ANNIKA_HEADERS, ANNIKA_COL]] as const) {
    const row = store.grid.findIndex((r, i) => i > 0 && r[start] === guest);
    if (row > 0) return store.grid[row][start + headers.indexOf(header)];
  }
  throw new Error(`no row for ${guest}`);
}

async function codeOf(store: MemoryStore, guest: string) {
  return cell(store, guest, "Invite code");
}

function blankReply(lang: "es" | "en" = "es"): Reply {
  return { people: {}, plusOnes: {}, saturday: false, note: "", lang };
}

describe("invite codes and links", () => {
  it("gives every named row a code, keeps existing ones, and groups '^' households", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();

    for (const g of ["Rafa", "Juan Carlos Méndez", "Tía Lucy", "Kate Morgan", "Pat + Sam"]) {
      expect(await codeOf(store, g)).toMatch(/^[a-z2-9]{6}$/);
    }
    expect(await codeOf(store, "Ana Sofía López")).toBe("lopez2");
    expect(await codeOf(store, "Mario López")).toBe("lopez2");
    expect(await codeOf(store, "Hannah Price")).toBe("price1");
    expect(await codeOf(store, "Ben Morgan")).toBe(await codeOf(store, "Kate Morgan"));
    expect(await codeOf(store, "Rafa")).not.toBe(await codeOf(store, "Tía Lucy"));
  });

  it("writes a personal link in each invitation's language", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    expect(cell(store, "Rafa", "Link")).toBe(`${BASE}/es/rsvp/${await codeOf(store, "Rafa")}`);
    expect(cell(store, "Kate Morgan", "Link")).toBe(`${BASE}/en/rsvp/${await codeOf(store, "Kate Morgan")}`);
    expect(cell(store, "Lena Ortiz", "Link")).toBe(`${BASE}/es/rsvp/${await codeOf(store, "Lena Ortiz")}`);
  });

  it("leaves blank rows and the totals below the tables alone", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    expect(store.grid[12][STANLEY_COL + STANLEY_HEADERS.indexOf("Invite code")]).toBe("");
    expect(store.grid[16].slice(0, 2)).toEqual(["TOTAL GUESTS=", "27"]);
  });

  it("does not change codes on later reads", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const first = await codeOf(store, "Rafa");
    await book.fillMissingCodes();
    expect(await codeOf(store, "Rafa")).toBe(first);
  });

  it("explains which column is missing when the sheet isn't set up", async () => {
    const store = sampleStore();
    store.grid[0][STANLEY_COL + STANLEY_HEADERS.indexOf("Invite code")] = "Code";
    const { book } = setup(undefined, store);
    await expect(book.findByCode("lopez2")).rejects.toBeInstanceOf(SheetFormatError);
  });
});

describe("findByCode", () => {
  it("returns everyone sharing the code, in the side's language", async () => {
    const { book } = setup();
    const inv = await book.findByCode("lopez2");
    expect(inv?.people.map((p) => p.name)).toEqual(["Ana Sofía López", "Mario López"]);
    expect(inv?.lang).toBe("es");
    expect(inv?.answered).toBeNull();
  });

  it("ignores capitals and spaces in the code, and returns null for unknown codes", async () => {
    const { book } = setup();
    expect((await book.findByCode("  PRICE1 "))?.people[0].name).toBe("Hannah Price");
    expect(await book.findByCode("nope00")).toBeNull();
    expect(await book.findByCode("")).toBeNull();
  });

  it("offers a named plus-one slot from 'Name +1'", async () => {
    const { book } = setup();
    const inv = await book.findByCode("price1");
    expect(inv?.lang).toBe("en");
    expect(inv?.plusOnes).toEqual([
      { key: "Hannah Price#1", host: "Hannah Price", name: "Dan Price", named: true, attending: null, dietary: "" },
    ]);
  });

  it("treats a '???' name and a missing name as unknown", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const amy = await book.findByCode(await codeOf(store, "Amy Wright"));
    expect(amy?.plusOnes.map((s) => [s.name, s.named])).toEqual([["", false]]);
    const oscar = await book.findByCode(await codeOf(store, "Oscar Pérez"));
    expect(oscar?.plusOnes.map((s) => [s.name, s.named])).toEqual([["", false]]);
  });

  it("follows the count: 0 means no plus-ones even with a name listed", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    expect((await book.findByCode(await codeOf(store, "Emily Stone")))?.plusOnes).toEqual([]);
  });

  it("doesn't show the couple's own dietary notes before the guest replies", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    expect((await book.findByCode(await codeOf(store, "Amy Wright")))?.people[0].dietary).toBe("");
  });
});

describe("search", () => {
  async function names(q: string) {
    const { book } = setup();
    const r = await book.search(q);
    return r.status === "found" ? r.candidates.map((c) => c.name) : r.status;
  }

  it("finds a one-name guest by their full name", async () => {
    expect(await names("Rafa Martínez Gómez")).toEqual(["Rafa"]);
    expect(await names("rafa")).toEqual(["Rafa"]);
  });

  it("finds guests who type more names than the sheet has", async () => {
    expect(await names("Juan Carlos Méndez Castillo")).toEqual(["Juan Carlos Méndez"]);
  });

  it("finds guests who type only part of their name", async () => {
    expect(await names("juan mendez")).toEqual(["Juan Carlos Méndez"]);
    expect(await names("Jose Rios")).toEqual(["Roberto José Ríos"]);
  });

  it("ignores family titles, accents and capitals", async () => {
    expect(await names("Lucy")).toEqual(["Tía Lucy"]);
    expect(await names("CHELA")).toEqual(["Mamá Chela"]);
    expect(await names("Joe Smith")).toEqual(["Grandpa Joe"]);
  });

  it("lists every invitation that matches", async () => {
    expect(await names("Roberto Ríos")).toEqual(["Roberto Ríos", "Roberto José Ríos"]);
  });

  it("does not match on one shared word of a longer name", async () => {
    expect(await names("Roberto")).toBe("not-found");
    expect(await names("Ríos")).toBe("not-found");
  });

  it("reports nothing found and too many", async () => {
    expect(await names("Zed Nobody")).toBe("not-found");
    expect(await names("   ")).toBe("not-found");
    expect(await names("Mario Lopez Kate Morgan Hannah Price Rafa David")).toBe("too-many");
  });

  it("returns only a code and the matching person's name", async () => {
    const { book } = setup();
    const r = await book.search("Mario López");
    expect(r).toEqual({ status: "found", candidates: [{ code: "lopez2", name: "Mario López" }] });
  });
});

describe("submit", () => {
  it("names everyone and every plus-one still unanswered", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const code = await codeOf(store, "Juan Carlos Méndez");
    const r = await book.submit(code, {
      ...blankReply(),
      plusOnes: { "Juan Carlos Méndez#1": { attending: "yes", name: "", dietary: "" } },
    });
    expect(r).toEqual({
      status: "missing",
      people: ["Juan Carlos Méndez"],
      plusOnes: ["Juan Carlos Méndez#2"],
      plusOneNames: [],
    });
  });

  it("requires a name for a plus-one who is coming", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const r = await book.submit(await codeOf(store, "Oscar Pérez"), {
      ...blankReply(),
      people: { "Oscar Pérez": { attending: "yes", dietary: "" } },
      plusOnes: { "Oscar Pérez#1": { attending: "yes", name: "  ", dietary: "" } },
    });
    expect(r).toMatchObject({ status: "missing", plusOneNames: ["Oscar Pérez#1"] });
  });

  it("writes the answer, plus-ones, dietary and the date into the guest's row", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const r = await book.submit(await codeOf(store, "Juan Carlos Méndez"), {
      people: { "Juan Carlos Méndez": { attending: "yes", dietary: "sin gluten" } },
      plusOnes: {
        "Juan Carlos Méndez#1": { attending: "no", name: "Lucía", dietary: "ignored" },
        "Juan Carlos Méndez#2": { attending: "yes", name: "Beto", dietary: "vegetariano" },
      },
      saturday: true,
      note: "¡Felicidades!",
      lang: "es",
    });
    expect(r).toEqual({ status: "saved", anyAttending: true });
    const c = (h: string) => cell(store, "Juan Carlos Méndez", h);
    expect(c("Status")).toBe("Yes");
    expect(c("Plus-ones coming")).toBe("1");
    // Sent to the sheet as a number, so the totals' SUM counts it.
    const write = store.writes.flat().find((u) => u.value === 1);
    expect(write).toBeDefined();
    expect(c("Name +1")).toBe("Beto, Lucía");
    expect(c("Dietary restrictions")).toBe("sin gluten; Beto: vegetariano");
    expect(c("Answered")).toBe("2026-12-01");
    expect(c("Saturday crafting")).toBe("Yes");
    expect(c("Note to couple")).toBe("¡Felicidades!");
  });

  it("logs one row per person and per plus-one", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const code = await codeOf(store, "Juan Carlos Méndez");
    await book.submit(code, {
      people: { "Juan Carlos Méndez": { attending: "yes", dietary: "" } },
      plusOnes: {
        "Juan Carlos Méndez#1": { attending: "yes", name: "Lucía", dietary: "" },
        "Juan Carlos Méndez#2": { attending: "no", name: "Beto", dietary: "" },
      },
      saturday: false,
      note: "",
      lang: "es",
    });
    expect(store.log.map((r) => r.slice(1, 7))).toEqual([
      [code, "stanley", "Juan Carlos Méndez", "guest", "Yes", ""],
      [code, "stanley", "Juan Carlos Méndez", "plus-one", "Yes", "Lucía"],
      [code, "stanley", "Juan Carlos Méndez", "plus-one", "No", "Beto"],
    ]);
  });

  it("fills in an unknown plus-one's name and shows the reply when the guest returns", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const code = await codeOf(store, "Amy Wright");
    await book.submit(code, {
      people: { "Amy Wright": { attending: "yes", dietary: "vegan" } },
      plusOnes: { "Amy Wright#1": { attending: "yes", name: "Fayyad Khan", dietary: "no nuts" } },
      saturday: false,
      note: "",
      lang: "en",
    });
    expect(cell(store, "Amy Wright", "Name +1")).toBe("Fayyad Khan");

    const again = await book.findByCode(code);
    expect(again?.answered).toBe("2026-12-01");
    expect(again?.people).toEqual([{ name: "Amy Wright", attending: "yes", dietary: "vegan" }]);
    expect(again?.plusOnes).toEqual([
      { key: "Amy Wright#1", host: "Amy Wright", name: "Fayyad Khan", named: true, attending: "yes", dietary: "no nuts" },
    ]);
  });

  it("answers for a whole household and leaves other guests' guesses alone", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const r = await book.submit(await codeOf(store, "Kate Morgan"), {
      ...blankReply("en"),
      people: { "Kate Morgan": { attending: "yes", dietary: "" }, "Ben Morgan": { attending: "no", dietary: "" } },
    });
    expect(r).toEqual({ status: "saved", anyAttending: true });
    expect(cell(store, "Kate Morgan", "Status")).toBe("Yes");
    expect(cell(store, "Ben Morgan", "Status")).toBe("No");
    expect(cell(store, "Ben Morgan", "Answered")).toBe("2026-12-01");
    expect(cell(store, "Pat + Sam", "Status")).toBe("Probably no");
    expect(cell(store, "Roberto Ríos", "Status")).toBe("Maybe");
  });

  it("writes to the right row even if the couple re-sorted the sheet after the page loaded", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const code = await codeOf(store, "Rafa");
    // Swap Rafa's row (1) with Oscar's (9) on Stanley's side only.
    const width = STANLEY_HEADERS.length;
    const a = store.grid[1].slice(0, width);
    const b = store.grid[9].slice(0, width);
    store.grid[1].splice(0, width, ...b);
    store.grid[9].splice(0, width, ...a);

    await book.submit(code, { ...blankReply(), people: { Rafa: { attending: "no", dietary: "" } } });
    expect(cell(store, "Rafa", "Status")).toBe("No");
    expect(cell(store, "Oscar Pérez", "Status")).toBe("");
  });

  it("replaces an earlier answer and keeps both in the log", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    const code = await codeOf(store, "Rafa");
    await book.submit(code, { ...blankReply(), people: { Rafa: { attending: "yes", dietary: "" } } });
    const r = await book.submit(code, { ...blankReply(), people: { Rafa: { attending: "no", dietary: "" } } });
    expect(r).toEqual({ status: "saved", anyAttending: false });
    expect(cell(store, "Rafa", "Status")).toBe("No");
    expect(store.log.map((l) => l[5])).toEqual(["Yes", "No"]);
  });

  it("stores text exactly as typed, even if it looks like a formula", async () => {
    const { store, book } = setup();
    await book.fillMissingCodes();
    await book.submit(await codeOf(store, "Rafa"), {
      ...blankReply(),
      people: { Rafa: { attending: "yes", dietary: "=1+1" } },
    });
    expect(cell(store, "Rafa", "Dietary restrictions")).toBe("=1+1");
  });

  it("closes after the deadline but still shows the invitation", async () => {
    const { book } = setup("2027-02-02T12:00:00Z");
    expect(await book.submit("lopez2", blankReply())).toEqual({ status: "closed" });
    expect((await book.findByCode("lopez2"))?.closed).toBe(true);
  });

  it("returns not-found for an unknown code", async () => {
    const { book } = setup();
    expect(await book.submit("nope00", blankReply())).toEqual({ status: "not-found" });
  });
});
