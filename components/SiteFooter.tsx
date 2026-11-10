import Link from "next/link";
import type { Dict, Locale } from "@/lib/i18n";
import { Sprig } from "./Sprig";

export function SiteFooter({ lang, t }: { lang: Locale; t: Dict }) {
  return (
    <footer className="footer">
      <Sprig className="footer-sprig" />
      <p className="footer-names">Annika &amp; Stanley</p>
      <p className="footer-line">{t.footer.line}</p>
      <ul className="footer-nav">
        <li><Link href={`/${lang}/schedule`}>{t.nav.schedule}</Link></li>
        <li><Link href={`/${lang}/travel`}>{t.nav.travel}</Link></li>
        <li><Link href={`/${lang}/registry`}>{t.nav.registry}</Link></li>
        <li><Link href={`/${lang}/faqs`}>{t.nav.faqs}</Link></li>
        <li><Link href={`/${lang}/rsvp`}>{t.nav.rsvp}</Link></li>
      </ul>
    </footer>
  );
}
