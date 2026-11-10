import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { mode } from "@/lib/guests";
import { site } from "@/content/site";
import { PageTitle } from "@/components/PageTitle";
import { RsvpFlow } from "@/components/RsvpFlow";

export async function generateMetadata({ params }: PageProps<"/[lang]/rsvp">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).rsvp.title } : {};
}

export default async function Rsvp({ params }: PageProps<"/[lang]/rsvp">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).rsvp;

  return (
    <>
      <PageTitle title={t.title} lede={t.lede} />
      <section className="section rsvp">
        <RsvpFlow lang={lang} t={t} mode={mode()} deadline={site.rsvpDeadline} />
      </section>
    </>
  );
}
