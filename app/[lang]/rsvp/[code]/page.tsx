import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n";
import { guestBook, mode } from "@/lib/guestbook";
import { PageTitle } from "@/components/PageTitle";
import { InvitationForm } from "@/components/InvitationForm";

// Each invitation is rendered per request from the sheet; the shared header reads
// the URL, so let this route block on the server instead of prerendering a shell.
export const instant = false;

// Personal invitations are private: keep them out of search engines.
export async function generateMetadata({ params }: PageProps<"/[lang]/rsvp/[code]">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: hasLocale(lang) ? getDictionary(lang).rsvp.title : undefined,
    robots: { index: false, follow: false },
  };
}

export default function InvitationPage({ params }: PageProps<"/[lang]/rsvp/[code]">) {
  return (
    <Suspense fallback={<Shell lang="es" loading />}>
      {params.then(({ lang, code }) => {
        if (!hasLocale(lang)) notFound();
        return (
          <Shell lang={lang}>
            <Suspense fallback={<p className="notice notice-quiet">{getDictionary(lang).rsvp.loading}</p>}>
              <Invitation lang={lang} code={code} />
            </Suspense>
          </Shell>
        );
      })}
    </Suspense>
  );
}

function Shell({ lang, loading, children }: { lang: Locale; loading?: boolean; children?: React.ReactNode }) {
  const t = getDictionary(lang).rsvp;
  return (
    <>
      <PageTitle title={t.title} />
      <section className="section rsvp">
        <div className="rsvp-flow">{loading ? <p className="notice notice-quiet">{t.loading}</p> : children}</div>
      </section>
    </>
  );
}

async function Invitation({ lang, code }: { lang: Locale; code: string }) {
  // Always read the sheet fresh: answers change, and this page must never be cached.
  await connection();
  const t = getDictionary(lang).rsvp;
  const book = guestBook();
  if (!book) return <p className="notice">{t.notConfigured}</p>;

  let invitation;
  try {
    invitation = await book.findByCode(decodeURIComponent(code));
  } catch (err) {
    console.error("[rsvp] invitation lookup failed", err);
    return <p className="notice">{t.error}</p>;
  }

  if (!invitation) {
    return (
      <div className="rsvp-card">
        <p>{t.codeNotFound}</p>
        <Link className="btn btn-primary btn-block" href={`/${lang}/rsvp`}>{t.searchInstead}</Link>
      </div>
    );
  }

  return (
    <>
      {mode() === "dev" ? <p className="dev-notice">{t.devNotice}</p> : null}
      <InvitationForm invitation={invitation} lang={lang} t={t} />
    </>
  );
}
