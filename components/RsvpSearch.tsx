"use client";

import { useId, useRef, useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { Dict, Locale } from "@/lib/i18n";
import { searchInvitations } from "@/app/[lang]/rsvp/actions";

type T = Dict["rsvp"];
type Candidate = { code: string; name: string };

// Backup way in for guests without their personal link: search by any of their names.
export function RsvpSearch({ lang, t }: { lang: Locale; t: T }) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const ids = useId();
  const pickRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (candidates) pickRef.current?.focus();
  }, [candidates]);

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await searchInvitations(query);
      if (r.status === "found" && r.candidates.length === 1) {
        router.push(`/${lang}/rsvp/${r.candidates[0].code}`);
        return;
      }
      if (r.status === "found") {
        setMessage(null);
        setCandidates(r.candidates);
        return;
      }
      setCandidates(null);
      setMessage(
        r.status === "not-found" ? t.notFound
        : r.status === "too-many" ? t.tooMany
        : r.status === "not-configured" ? t.notConfigured
        : t.error,
      );
    });
  };

  if (candidates) {
    return (
      <div className="rsvp-card">
        <h2 ref={pickRef} tabIndex={-1} className="rsvp-step-title">{t.pickOne}</h2>
        <ul className="pick-list">
          {candidates.map((c) => (
            <li key={c.code}>
              <Link className="pick" href={`/${lang}/rsvp/${c.code}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
        <button type="button" className="text-link link-button" onClick={() => setCandidates(null)}>
          {t.searchInstead}
        </button>
      </div>
    );
  }

  return (
    <form className="rsvp-card" onSubmit={find} noValidate>
      <label htmlFor={`${ids}-name`} className="field-label">{t.findLabel}</label>
      <p id={`${ids}-hint`} className="field-hint">{t.findHint}</p>
      <input
        id={`${ids}-name`}
        className="input"
        name="name"
        autoComplete="name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-describedby={`${ids}-hint${message ? ` ${ids}-msg` : ""}`}
        aria-invalid={message ? true : undefined}
      />
      {message ? <p id={`${ids}-msg`} className="field-error" role="alert">{message}</p> : null}
      <button className="btn btn-primary btn-block" type="submit" disabled={pending || !query.trim()}>
        <Search aria-hidden="true" size={20} strokeWidth={1.5} />
        {pending ? t.finding : t.findCta}
      </button>
    </form>
  );
}
