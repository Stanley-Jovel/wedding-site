"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

// Both languages are always visible; the current one is marked, the other is a link
// to the same page in that language.
export function LangSwitch({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const rest = pathname.replace(/^\/(es|en)(?=\/|$)/, "");
  const langs: { code: Locale; short: string; name: string }[] = [
    { code: "es", short: "ES", name: "Español" },
    { code: "en", short: "EN", name: "English" },
  ];

  return (
    <div className="lang" role="group" aria-label={label}>
      {langs.map((l) =>
        l.code === lang ? (
          <span key={l.code} className="lang-opt is-current" lang={l.code} aria-current="true">
            <abbr title={l.name}>{l.short}</abbr>
          </span>
        ) : (
          <Link
            key={l.code}
            href={`/${l.code}${rest}`}
            className="lang-opt"
            hrefLang={l.code}
            lang={l.code}
            aria-label={l.name}
          >
            {l.short}
          </Link>
        ),
      )}
    </div>
  );
}
