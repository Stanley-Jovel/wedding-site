import "server-only";
import { site } from "@/content/site";
import { createGuestBook, type GuestBook } from "./guestbook";
import { googleStore, sheetsConfigured } from "./google";
import { sampleStore } from "./sample";
import type { MemoryStore } from "./store";

export type Mode = "sheets" | "dev" | "off";

// The couple's sheet wherever it's configured; fictional sample guests, kept in
// memory, only in local development.
export function mode(): Mode {
  if (sheetsConfigured()) return "sheets";
  if (process.env.NODE_ENV === "development") return "dev";
  return "off";
}

const devGlobal = globalThis as { __devGuestStore?: MemoryStore };

export function guestBook(): GuestBook | null {
  const m = mode();
  if (m === "off") return null;
  const store = m === "sheets" ? googleStore() : (devGlobal.__devGuestStore ??= sampleStore());
  return createGuestBook({ store, deadline: site.rsvpDeadline, baseUrl: site.url });
}
