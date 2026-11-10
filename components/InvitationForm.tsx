"use client";

import { Fragment, useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import type { Dict, Locale } from "@/lib/i18n";
import type { Invitation, PlusSlot, Reply, YesNo } from "@/lib/guestbook/guestbook";
import { sendReply } from "@/app/[lang]/rsvp/actions";

type T = Dict["rsvp"];
type PersonAnswer = { attending: YesNo | null; dietary: string };
type PlusAnswer = { attending: YesNo | null; name: string; dietary: string };

function formatDate(date: string, lang: Locale) {
  // "YYYY-MM-DD" as a calendar date, not shifted by the viewer's time zone.
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "es" ? "es-SV" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function InvitationForm({ invitation, lang, t }: { invitation: Invitation; lang: Locale; t: T }) {
  const [done, setDone] = useState<{ anyAttending: boolean } | null>(null);
  const [answered, setAnswered] = useState(invitation.answered);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (done) headingRef.current?.focus();
  }, [done]);

  if (invitation.closed) return <ClosedSummary invitation={invitation} lang={lang} t={t} />;

  if (done) {
    return (
      <div className="rsvp-card rsvp-done" role="status">
        <Check className="done-mark" aria-hidden="true" size={40} strokeWidth={1.25} />
        <h2 ref={headingRef} tabIndex={-1} className="rsvp-step-title">{t.successTitle}</h2>
        <p>{done.anyAttending ? t.successYes : t.successNo}</p>
        <button type="button" className="btn btn-outline" onClick={() => setDone(null)}>{t.changeAnswer}</button>
      </div>
    );
  }

  return (
    <Answers
      invitation={invitation}
      lang={lang}
      t={t}
      answered={answered}
      onDone={(anyAttending, date) => {
        setAnswered(date);
        setDone({ anyAttending });
        // Reload the invitation from the sheet so "Change my answer" starts from what was saved.
        router.refresh();
      }}
    />
  );
}

function plusLegend(slot: PlusSlot, solo: boolean, t: T) {
  if (slot.named) {
    return (solo ? t.plusNamedYou : t.plusNamedHost).replace("{name}", slot.name).replace("{host}", slot.host);
  }
  return (solo ? t.plusUnnamedYou : t.plusUnnamedHost).replace("{host}", slot.host);
}

function Answers({
  invitation,
  lang,
  t,
  answered,
  onDone,
}: {
  invitation: Invitation;
  lang: Locale;
  t: T;
  answered: string | null;
  onDone: (anyAttending: boolean, date: string) => void;
}) {
  const [people, setPeople] = useState<Record<string, PersonAnswer>>(() =>
    Object.fromEntries(invitation.people.map((p) => [p.name, { attending: p.attending, dietary: p.dietary }])),
  );
  const [plus, setPlus] = useState<Record<string, PlusAnswer>>(() =>
    Object.fromEntries(invitation.plusOnes.map((s) => [s.key, { attending: s.attending, name: s.name, dietary: s.dietary }])),
  );
  const [saturday, setSaturday] = useState(invitation.saturday);
  const [note, setNote] = useState(invitation.note);
  const [missing, setMissing] = useState<Set<string>>(new Set());
  const [missingNames, setMissingNames] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const solo = invitation.people.length === 1;

  const personId = (i: number) => `${ids}-p${i}`;
  const slotId = (i: number) => `${ids}-s${i}`;
  const slotIndex = (key: string) => invitation.plusOnes.findIndex((s) => s.key === key);
  const anyYes =
    Object.values(people).some((a) => a.attending === "yes") || Object.values(plus).some((a) => a.attending === "yes");

  const label = (key: string) => {
    const person = invitation.people.find((p) => p.name === key);
    if (person) return person.name;
    const s = invitation.plusOnes[slotIndex(key)];
    return s.named ? s.name : t.guestOf.replace("{host}", s.host);
  };

  const showMissing = (keys: string[], names: string[]) => {
    setMissing(new Set(keys));
    setMissingNames(new Set(names));
    setError(keys.length ? t.missingFor.replace("{names}", keys.map(label).join(", ")) : t.missingName);
    // Take the guest straight to the first question still needing an answer.
    const first = keys[0] ?? names[0];
    const pi = invitation.people.findIndex((p) => p.name === first);
    const selector =
      pi >= 0 ? `input[name="${personId(pi)}"]`
      : keys[0] ? `input[name="${slotId(slotIndex(first))}"]`
      : `#${CSS.escape(`${slotId(slotIndex(first))}-name`)}`;
    formRef.current?.querySelector<HTMLInputElement>(selector)?.focus();
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const keys = [
      ...invitation.people.filter((p) => !people[p.name].attending).map((p) => p.name),
      ...invitation.plusOnes.filter((s) => !plus[s.key].attending).map((s) => s.key),
    ];
    const names = invitation.plusOnes
      .filter((s) => plus[s.key].attending === "yes" && !plus[s.key].name.trim())
      .map((s) => s.key);
    if (keys.length || names.length) return showMissing(keys, names);

    setMissing(new Set());
    setMissingNames(new Set());
    setError(null);
    const reply: Reply = { people, plusOnes: plus, saturday: anyYes && saturday, note, lang };
    start(async () => {
      const r = await sendReply(invitation.code, reply);
      if (r.status === "saved") {
        return onDone(r.anyAttending, new Date().toLocaleDateString("en-CA", { timeZone: "America/El_Salvador" }));
      }
      if (r.status === "missing") return showMissing([...r.people, ...r.plusOnes], r.plusOneNames);
      setError(r.status === "closed" ? t.closed : r.status === "not-configured" ? t.notConfigured : t.error);
    });
  };

  const choice = (
    name: string,
    value: YesNo | null,
    onChange: (v: YesNo) => void,
    labels: [string, string],
    clearMissing: () => void,
  ) => (
    <div className="choices">
      {(["yes", "no"] as const).map((v, i) => (
        <label key={v} className="choice">
          <input
            type="radio"
            name={name}
            value={v}
            checked={value === v}
            onChange={() => {
              onChange(v);
              clearMissing();
            }}
          />
          <span>{labels[i]}</span>
        </label>
      ))}
    </div>
  );

  const unmark = (key: string) =>
    setMissing((m) => {
      const n = new Set(m);
      n.delete(key);
      return n;
    });

  return (
    <form ref={formRef} className="rsvp-card" onSubmit={submit} noValidate>
      <h2 className="rsvp-step-title">{t.householdTitle}</h2>
      <p className="household-names">{invitation.people.map((p) => p.name).join(" · ")}</p>
      {answered ? <p className="notice notice-quiet">{t.already.replace("{date}", formatDate(answered, lang))}</p> : null}

      {invitation.people.map((p, i) => {
        const a = people[p.name];
        const invalid = missing.has(p.name);
        const slots = invitation.plusOnes.map((s, si) => ({ s, si })).filter(({ s }) => s.host === p.name);
        return (
          <div key={p.name} className="rsvp-person">
            <fieldset
              className="choice-group"
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? `${personId(i)}-err` : undefined}
            >
              <legend>{t.attendingQ.replace("{name}", p.name)}</legend>
              {invalid ? <p id={`${personId(i)}-err`} className="field-error field-error-inline">{t.answerThis}</p> : null}
              {choice(
                personId(i),
                a.attending,
                (v) => setPeople((x) => ({ ...x, [p.name]: { ...x[p.name], attending: v } })),
                [t.yes, t.no],
                () => unmark(p.name),
              )}
            </fieldset>
            {a.attending === "yes" ? (
              <TextField
                id={`${personId(i)}-diet`}
                label={t.dietaryFor.replace("{name}", p.name)}
                hint={t.optional}
                value={a.dietary}
                maxLength={300}
                onChange={(v) => setPeople((x) => ({ ...x, [p.name]: { ...x[p.name], dietary: v } }))}
              />
            ) : null}

            {slots.map(({ s, si }) => {
              const b = plus[s.key];
              const slotInvalid = missing.has(s.key);
              const nameInvalid = missingNames.has(s.key);
              return (
                <Fragment key={s.key}>
                  <fieldset
                    className="choice-group plus-group"
                    aria-invalid={slotInvalid || undefined}
                    aria-describedby={slotInvalid ? `${slotId(si)}-err` : undefined}
                  >
                    <legend>{plusLegend(s, solo, t)}</legend>
                    {slotInvalid ? <p id={`${slotId(si)}-err`} className="field-error field-error-inline">{t.answerThis}</p> : null}
                    {choice(
                      slotId(si),
                      b.attending,
                      (v) => setPlus((x) => ({ ...x, [s.key]: { ...x[s.key], attending: v } })),
                      [t.plusYes, t.plusNo],
                      () => unmark(s.key),
                    )}
                  </fieldset>
                  {b.attending === "yes" ? (
                    <>
                      <TextField
                        id={`${slotId(si)}-name`}
                        label={t.guestNameLabel}
                        value={b.name}
                        maxLength={80}
                        autoComplete="off"
                        invalid={nameInvalid ? t.missingName : undefined}
                        onChange={(v) => {
                          setPlus((x) => ({ ...x, [s.key]: { ...x[s.key], name: v } }));
                          if (v.trim()) setMissingNames((m) => new Set([...m].filter((k) => k !== s.key)));
                        }}
                      />
                      <TextField
                        id={`${slotId(si)}-diet`}
                        label={t.dietaryFor.replace("{name}", b.name.trim() || t.guestOf.replace("{host}", s.host))}
                        hint={t.optional}
                        value={b.dietary}
                        maxLength={300}
                        onChange={(v) => setPlus((x) => ({ ...x, [s.key]: { ...x[s.key], dietary: v } }))}
                      />
                    </>
                  ) : null}
                </Fragment>
              );
            })}
          </div>
        );
      })}

      {anyYes ? (
        <label className="check">
          <input type="checkbox" checked={saturday} onChange={(e) => setSaturday(e.target.checked)} />
          <span>{t.saturdayLabel}</span>
        </label>
      ) : null}

      <label htmlFor={`${ids}-note`} className="field-label">{t.noteLabel}</label>
      <p id={`${ids}-note-hint`} className="field-hint">{t.optional}</p>
      <textarea
        id={`${ids}-note`}
        className="input textarea"
        rows={3}
        maxLength={1000}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        aria-describedby={`${ids}-note-hint`}
      />

      {error ? <p className="field-error" role="alert">{error}</p> : null}

      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? t.sending : t.submit}
      </button>
      <Link className="text-link link-button" href={`/${lang}/rsvp`}>{t.notYou}</Link>
    </form>
  );
}

function TextField({
  id,
  label,
  hint,
  value,
  maxLength,
  autoComplete,
  invalid,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  maxLength: number;
  autoComplete?: string;
  invalid?: string;
  onChange: (v: string) => void;
}) {
  const describedBy = [hint ? `${id}-hint` : null, invalid ? `${id}-err` : null].filter(Boolean).join(" ");
  return (
    <div className="sub-field">
      <label htmlFor={id} className="field-label">{label}</label>
      {hint ? <p id={`${id}-hint`} className="field-hint">{hint}</p> : null}
      <input
        id={id}
        className="input"
        value={value}
        maxLength={maxLength}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {invalid ? <p id={`${id}-err`} className="field-error">{invalid}</p> : null}
    </div>
  );
}

function ClosedSummary({ invitation, lang, t }: { invitation: Invitation; lang: Locale; t: T }) {
  const replied = invitation.answered !== null;
  return (
    <div className="rsvp-card">
      <h2 className="rsvp-step-title">{t.closedTitle}</h2>
      <p className="notice notice-quiet">{replied ? t.closedSummary : t.noReply}</p>
      {replied ? (
        <ul className="reply-summary">
          {invitation.people.map((p) => (
            <li key={p.name}>
              <span className="fact-main">{p.name}</span>: {p.attending === "yes" ? t.attending : t.notAttending}
              {p.attending === "yes" && p.dietary ? ` · ${p.dietary}` : ""}
            </li>
          ))}
          {invitation.plusOnes
            .filter((s) => s.attending === "yes")
            .map((s) => (
              <li key={s.key}>
                <span className="fact-main">{s.name}</span>: {t.attending}
                {s.dietary ? ` · ${s.dietary}` : ""}
              </li>
            ))}
          {invitation.saturday ? <li>{t.saturdayYes}</li> : null}
          {invitation.note ? (
            <li>
              {t.yourNote}: {invitation.note}
            </li>
          ) : null}
        </ul>
      ) : null}
      <p className="field-hint reply-date">{replied ? formatDate(invitation.answered!, lang) : null}</p>
    </div>
  );
}
