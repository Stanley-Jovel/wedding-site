"use server";

import { guestBook } from "@/lib/guestbook";
import { SheetFormatError, type Reply, type SearchResult, type SubmitResult, type YesNo } from "@/lib/guestbook/guestbook";

type Unavailable = { status: "not-configured" | "error" };

export async function searchInvitations(query: string): Promise<SearchResult | Unavailable> {
  const book = guestBook();
  if (!book) return { status: "not-configured" };
  try {
    return await book.search(String(query ?? ""));
  } catch (err) {
    console.error("[rsvp] search failed", err);
    return { status: "error" };
  }
}

const yesNo = (v: unknown): YesNo | null => (v === "yes" || v === "no" ? v : null);
const text = (v: unknown) => (typeof v === "string" ? v : "");
const entries = (v: unknown) => (v && typeof v === "object" ? Object.entries(v as Record<string, unknown>) : []);

// The browser sends this; rebuild it so only expected fields and types reach the sheet.
function clean(raw: unknown): Reply {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    people: Object.fromEntries(
      entries(r.people).map(([name, a]) => {
        const v = (a ?? {}) as Record<string, unknown>;
        return [name, { attending: yesNo(v.attending), dietary: text(v.dietary) }];
      }),
    ),
    plusOnes: Object.fromEntries(
      entries(r.plusOnes).map(([key, a]) => {
        const v = (a ?? {}) as Record<string, unknown>;
        return [key, { attending: yesNo(v.attending), name: text(v.name), dietary: text(v.dietary) }];
      }),
    ),
    saturday: r.saturday === true,
    note: text(r.note),
    lang: r.lang === "en" ? "en" : "es",
  };
}

export async function sendReply(code: string, reply: Reply): Promise<SubmitResult | Unavailable> {
  const book = guestBook();
  if (!book) return { status: "not-configured" };
  try {
    return await book.submit(String(code ?? ""), clean(reply));
  } catch (err) {
    console.error("[rsvp] submit failed", err instanceof SheetFormatError ? err.message : err);
    return { status: "error" };
  }
}
