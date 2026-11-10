import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { site } from "@/content/site";
import { PageTitle } from "@/components/PageTitle";

export async function generateMetadata({ params }: PageProps<"/[lang]/registry">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).registry.title } : {};
}

export default async function Registry({ params }: PageProps<"/[lang]/registry">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const r = getDictionary(lang).registry;

  return (
    <>
      <PageTitle title={r.title} />
      <section className="section registry" aria-labelledby="fund-h">
        <h2 id="fund-h" className="section-title">{r.fundTitle}</h2>
        <p className="prose-center">{r.body}</p>
        {site.registryUrl ? (
          <>
            <a className="btn btn-primary" href={site.registryUrl} target="_blank" rel="noopener noreferrer">
              {r.cta}
              <ExternalLink aria-hidden="true" size={18} strokeWidth={1.5} />
            </a>
            <p className="btn-note">{r.ctaNote}</p>
          </>
        ) : (
          <p className="notice">{r.pending}</p>
        )}
      </section>
    </>
  );
}
