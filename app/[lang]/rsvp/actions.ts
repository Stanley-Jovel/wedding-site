"use server";

import { site } from "@/content/site";
import { allHouseholds, lastReply, matchHouseholds, mode, saveReplies } from "@/lib/guests";

export type FoundHousehold = { id: string; members: string[]; repliedAt: string | null };

export type LookupResult =
  | { status: "found"; households: FoundHousehold[] }
  | { status: "not-found" | "too-short" | "closed" | "not-configured" | "error" };

function isClosed() {
  return Date.now() > new Date(site.rsvpDeadline).getTime();
}

export async function lookupHousehold(query: string): Promise<LookupResult> {
  if (isClosed()) return { status: "closed" };
  if (mode() === "off") return { status: "not-configured" };
  const q = query.trim().slice(0, 120);
  if (q.split(/\s+/).filter(Boolean).length < 2) return { status: "too-short" };
  try {
    // Cap the matches so a vague search can't list the whole guest list.
    const matches = matchHouseholds(await allHouseholds(), q).slice(0, 4);
    if (matches.length === 0) return { status: "not-found" };
    const households = await Promise.all(
      matches.map(async (h) => ({ ...h, repliedAt: await lastReply(h.id) })),
    );
    return { status: "found", households };
  } catch (err) {
    console.error("[rsvp] lookup failed", err);
    return { status: "error" };
  }
}

export type SubmitInput = {
  householdId: string;
  answers: Record<string, "yes" | "no">;
  dietary: string;
  saturday: boolean;
  note: string;
  lang: string;
};

export type SubmitResult =
  | { status: "saved"; anyAttending: boolean }
  | { status: "missing" | "closed" | "not-configured" | "error" };

export async function submitRsvp(input: SubmitInput): Promise<SubmitResult> {
  if (isClosed()) return { status: "closed" };
  if (mode() === "off") return { status: "not-configured" };
  try {
    const household = (await allHouseholds()).find((h) => h.id === input.householdId);
    if (!household) return { status: "error" };
    // Only the people on this invitation can be answered for, and all of them must be.
    if (household.members.some((m) => input.answers[m] !== "yes" && input.answers[m] !== "no")) {
      return { status: "missing" };
    }
    const dietary = input.dietary.trim().slice(0, 500);
    const note = input.note.trim().slice(0, 1000);
    await saveReplies(
      household.members.map((name) => ({
        householdId: household.id,
        name,
        attending: input.answers[name] === "yes",
        dietary,
        saturday: input.saturday,
        note,
        lang: input.lang === "en" ? "en" : "es",
      })),
    );
    return { status: "saved", anyAttending: household.members.some((m) => input.answers[m] === "yes") };
  } catch (err) {
    console.error("[rsvp] submit failed", err);
    return { status: "error" };
  }
}

export async function rsvpMode() {
  return mode();
}
