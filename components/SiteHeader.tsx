import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { NavLinks } from "./NavLinks";
import { LangSwitch } from "./LangSwitch";

export function SiteHeader({ lang, t }: { lang: Locale; t: Dict }) {
  const items = [
    { href: `/${lang}`, label: t.nav.home },
    { href: `/${lang}/schedule`, label: t.nav.schedule },
    { href: `/${lang}/travel`, label: t.nav.travel },
    { href: `/${lang}/registry`, label: t.nav.registry },
    { href: `/${lang}/faqs`, label: t.nav.faqs },
    { href: `/${lang}/rsvp`, label: t.nav.rsvp, primary: true },
  ];

  return (
    <header className="masthead">
      <div className="masthead-bar">
        <Link href={`/${lang}`} className="monogram" aria-label={t.nav.home}>
          A <span aria-hidden="true">&amp;</span> S
        </Link>
        <LangSwitch lang={lang} label={t.switchLabel} />
      </div>
      <NavLinks items={items} label={t.nav.label} />
    </header>
  );
}
