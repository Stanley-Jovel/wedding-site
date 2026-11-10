import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, House } from "lucide-react";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { site } from "@/content/site";
import { PageTitle } from "@/components/PageTitle";
import { Sprig } from "@/components/Sprig";

export async function generateMetadata({ params }: PageProps<"/[lang]/travel">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).travel.title } : {};
}

export default async function Travel({ params }: PageProps<"/[lang]/travel">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const tr = getDictionary(lang).travel;

  return (
    <>
      <PageTitle title={tr.title} lede={tr.lede} />

      <nav className="jump" aria-label={tr.title}>
        <ul>
          {tr.sections.map((s) => (
            <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
          ))}
          <li><a href="#shared">{tr.shared.kicker}</a></li>
        </ul>
      </nav>

      <div className="section prose">
        {tr.sections.map((s) => (
          <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="prose-block">
            <h2 id={`${s.id}-h`}>{s.title}</h2>
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </section>
        ))}
      </div>

      <section id="shared" className="shared" aria-labelledby="shared-h">
        <div className="shared-inner">
          <House className="shared-icon" aria-hidden="true" size={44} strokeWidth={1} />
          <h2 id="shared-h" className="shared-title">{tr.shared.title}</h2>
          <p>{tr.shared.body}</p>
          <p>{tr.shared.listIntro}</p>
          <ul className="shared-names">
            {tr.shared.names.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <a className="btn btn-primary" href={site.sharedStayDoc} target="_blank" rel="noopener noreferrer">
            {tr.shared.cta}
            <ExternalLink aria-hidden="true" size={18} strokeWidth={1.5} />
          </a>
          <p className="btn-note">{tr.shared.ctaNote}</p>
          <Sprig className="sprig" />
        </div>
      </section>
    </>
  );
}
