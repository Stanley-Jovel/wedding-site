import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { site } from "@/content/site";
import { PageTitle } from "@/components/PageTitle";

export async function generateMetadata({ params }: PageProps<"/[lang]/faqs">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).faqs.title } : {};
}

// Until a number is supplied, say so rather than silently dropping it.
function withPhones(text: string, prefix: string, pending: string) {
  return text
    .replace("{jennifer}", site.phones.jennifer ? `${prefix}${site.phones.jennifer}` : pending)
    .replace("{emma}", site.phones.emma ? `${prefix}${site.phones.emma}` : pending);
}

export default async function Faqs({ params }: PageProps<"/[lang]/faqs">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const f = getDictionary(lang).faqs;

  return (
    <>
      <PageTitle title={f.title} />
      <nav className="jump jump-list" aria-label={f.jump}>
        <ul>
          {f.items.map((item) => (
            <li key={item.id}><a href={`#${item.id}`}>{item.q}</a></li>
          ))}
        </ul>
      </nav>
      <div className="section prose">
        {f.items.map((item) => (
          <section key={item.id} id={item.id} className="prose-block" aria-labelledby={`${item.id}-q`}>
            <h2 id={`${item.id}-q`}>{item.q}</h2>
            {item.a.map((p) => (
              <p key={p}>{withPhones(p, f.phonePrefix, f.phonePending)}</p>
            ))}
          </section>
        ))}
      </div>
    </>
  );
}
