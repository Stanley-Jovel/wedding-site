"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { Check, Search } from "lucide-react";
import type { Dict, Locale } from "@/lib/i18n";
import type { Mode } from "@/lib/guests";
import { useNow } from "@/lib/useNow";
import {
  lookupHousehold,
  submitRsvp,
  type FoundHousehold,
  type LookupResult,
} from "@/app/[lang]/rsvp/actions";

type T = Dict["rsvp"];
type Step =
  | { kind: "find"; message?: string }
  | { kind: "pick"; households: FoundHousehold[] }
  | { kind: "answer"; household: FoundHousehold }
  | { kind: "done"; anyAttending: boolean; household: FoundHousehold };

function lookupMessage(r: LookupResult, t: T) {
  switch (r.status) {
    case "not-found": return t.notFound;
    case "too-short": return t.tooShort;
    case "closed": return t.closed;
    case "not-configured": return t.notConfigured;
    case "error": return t.error;
    default: return undefined;
  }
}

export function RsvpFlow({ lang, t, mode, deadline }: { lang: Locale; t: T; mode: Mode; deadline: string }) {
  const [step, setStep] = useState<Step>({ kind: "find" });
  const now = useNow();
  const closed = now !== null && now > new Date(deadline).getTime();
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ids = useId();

  // Move focus to each new step's heading so screen readers and keyboards follow along.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step.kind]);

  if (mode === "off") return <p className="notice">{t.notConfigured}</p>;
  if (closed) return <p className="notice">{t.closed}</p>;

  const find = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await lookupHousehold(query);
      if (r.status !== "found") return setStep({ kind: "find", message: lookupMessage(r, t) });
      setStep(r.households.length === 1 ? { kind: "answer", household: r.households[0] } : { kind: "pick", households: r.households });
    });
  };

  const reset = () => setStep({ kind: "find" });

  return (
    <div className="rsvp-flow">
      {mode === "dev" ? <p className="dev-notice">{t.devNotice}</p> : null}

      {step.kind === "find" && (
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
            aria-describedby={`${ids}-hint${step.message ? ` ${ids}-msg` : ""}`}
            aria-invalid={step.message ? true : undefined}
          />
          {step.message ? (
            <p id={`${ids}-msg`} className="field-error" role="alert">{step.message}</p>
          ) : null}
          <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
            <Search aria-hidden="true" size={20} strokeWidth={1.5} />
            {pending ? t.finding : t.findCta}
          </button>
        </form>
      )}

      {step.kind === "pick" && (
        <div className="rsvp-card">
          <h2 ref={headingRef} tabIndex={-1} className="rsvp-step-title">{t.pickOne}</h2>
          <ul className="pick-list">
            {step.households.map((h) => (
              <li key={h.id}>
                <button type="button" className="pick" onClick={() => setStep({ kind: "answer", household: h })}>
                  {h.members.join(" · ")}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="text-link link-button" onClick={reset}>{t.notYou}</button>
        </div>
      )}

      {step.kind === "answer" && (
        <AnswerForm
          key={step.household.id}
          household={step.household}
          t={t}
          lang={lang}
          headingRef={headingRef}
          onBack={reset}
          onDone={(anyAttending) => setStep({ kind: "done", anyAttending, household: step.household })}
        />
      )}

      {step.kind === "done" && (
        <div className="rsvp-card rsvp-done" role="status">
          <Check className="done-mark" aria-hidden="true" size={40} strokeWidth={1.25} />
          <h2 ref={headingRef} tabIndex={-1} className="rsvp-step-title">{t.successTitle}</h2>
          <p>{step.anyAttending ? t.successYes : t.successNo}</p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setStep({ kind: "answer", household: { ...step.household, repliedAt: new Date().toISOString() } })}
          >
            {t.changeAnswer}
          </button>
        </div>
      )}
    </div>
  );
}

function AnswerForm({
  household,
  t,
  lang,
  headingRef,
  onBack,
  onDone,
}: {
  household: FoundHousehold;
  t: T;
  lang: Locale;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onBack: () => void;
  onDone: (anyAttending: boolean) => void;
}) {
  const [answers, setAnswers] = useState<Record<string, "yes" | "no">>({});
  const [dietary, setDietary] = useState("");
  const [saturday, setSaturday] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [pending, start] = useTransition();
  const ids = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const replied = household.repliedAt
    ? new Intl.DateTimeFormat(lang === "es" ? "es-SV" : "en-US", { dateStyle: "long" }).format(new Date(household.repliedAt))
    : null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const unanswered = household.members.filter((m) => !answers[m]);
    if (unanswered.length) {
      setMissing(unanswered);
      setError(t.missingFor.replace("{names}", unanswered.join(", ")));
      // Take the guest straight to the first question still needing an answer.
      const i = household.members.indexOf(unanswered[0]);
      formRef.current?.querySelector<HTMLInputElement>(`input[name="${ids}-p${i}"]`)?.focus();
      return;
    }
    setMissing([]);
    setError(null);
    start(async () => {
      const r = await submitRsvp({ householdId: household.id, answers, dietary, saturday, note, lang });
      if (r.status === "saved") return onDone(r.anyAttending);
      setError(r.status === "missing" ? t.missingAnswer : r.status === "closed" ? t.closed : r.status === "not-configured" ? t.notConfigured : t.error);
    });
  };

  return (
    <form ref={formRef} className="rsvp-card" onSubmit={submit} noValidate>
      <h2 ref={headingRef} tabIndex={-1} className="rsvp-step-title">{t.householdTitle}</h2>
      <p className="household-names">{household.members.join(" · ")}</p>
      {replied ? <p className="notice notice-quiet">{t.already.replace("{date}", replied)}</p> : null}

      {household.members.map((name, i) => (
        <fieldset
          key={name}
          className="choice-group"
          aria-invalid={missing.includes(name) ? true : undefined}
          aria-describedby={missing.includes(name) ? `${ids}-p${i}-err` : undefined}
        >
          <legend>{t.attendingQ.replace("{name}", name)}</legend>
          {missing.includes(name) ? (
            <p id={`${ids}-p${i}-err`} className="field-error field-error-inline">{t.answerThis}</p>
          ) : null}
          <div className="choices">
            {(["yes", "no"] as const).map((v) => (
              <label key={v} className="choice">
                <input
                  type="radio"
                  name={`${ids}-p${i}`}
                  value={v}
                  checked={answers[name] === v}
                  onChange={() => {
                    setAnswers((a) => ({ ...a, [name]: v }));
                    setMissing((m) => m.filter((x) => x !== name));
                  }}
                />
                <span>{v === "yes" ? t.yes : t.no}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <label htmlFor={`${ids}-diet`} className="field-label">{t.dietaryLabel}</label>
      <p id={`${ids}-diet-hint`} className="field-hint">{t.dietaryHint}</p>
      <textarea
        id={`${ids}-diet`}
        className="input textarea"
        rows={2}
        maxLength={500}
        value={dietary}
        onChange={(e) => setDietary(e.target.value)}
        aria-describedby={`${ids}-diet-hint`}
      />

      <label className="check">
        <input type="checkbox" checked={saturday} onChange={(e) => setSaturday(e.target.checked)} />
        <span>{t.saturdayLabel}</span>
      </label>

      <label htmlFor={`${ids}-note`} className="field-label">{t.noteLabel}</label>
      <p id={`${ids}-note-hint`} className="field-hint">{t.noteHint}</p>
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
      <button type="button" className="text-link link-button" onClick={onBack}>{t.notYou}</button>
    </form>
  );
}
