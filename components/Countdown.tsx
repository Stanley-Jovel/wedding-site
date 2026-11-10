"use client";

import { useNow } from "@/lib/useNow";

type Labels = {
  label: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  today: string;
  after: string;
};

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({ target, labels }: { target: string; labels: Labels }) {
  const end = new Date(target).getTime();
  const now = useNow();

  if (now !== null && now >= end) {
    // The wedding runs until 10 pm, five hours after the ceremony starts.
    const message = now < end + 5 * 3600 * 1000 ? labels.today : labels.after;
    return <p className="countdown-done">{message}</p>;
  }

  const p = now === null ? null : parts(end - now);
  const units = [
    { key: "days", label: labels.days },
    { key: "hours", label: labels.hours },
    { key: "minutes", label: labels.minutes },
    { key: "seconds", label: labels.seconds },
  ] as const;

  return (
    <div className="countdown">
      <dl className="countdown-units">
        {units.map((u) => (
          <div key={u.key} className={u.key === "seconds" ? "unit unit-seconds" : "unit"}>
            <dt>{u.label}</dt>
            <dd>{p ? p[u.key] : "–"}</dd>
          </div>
        ))}
      </dl>
      <p className="countdown-label">{labels.label}</p>
    </div>
  );
}
