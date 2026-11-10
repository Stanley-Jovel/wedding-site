import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { mode } from "@/lib/guestbook";
import { PageTitle } from "@/components/PageTitle";
import { RsvpSearch } from "@/components/RsvpSearch";

export async function generateMetadata({ params }: PageProps<"/[lang]/rsvp">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).rsvp.title } : {};
}

export default async function Rsvp({ params }: PageProps<"/[lang]/rsvp">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).rsvp;
  const m = mode();

  return (
    <>
      <PageTitle title={t.title} lede={t.lede} />
      <section className="section rsvp">
        <div className="rsvp-flow">
          {m === "dev" ? <p className="dev-notice">{t.devNotice}</p> : null}
          {m === "off" ? <p className="notice">{t.notConfigured}</p> : <RsvpSearch lang={lang} t={t} />}
        </div>
      </section>
    </>
  );
}
