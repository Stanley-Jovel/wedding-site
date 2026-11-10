import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EB_Garamond, Pinyon_Script } from "next/font/google";
import { getDictionary, hasLocale, locales } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "../globals.css";

const serif = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const script = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    title: { default: t.meta.title, template: `%s · Annika & Stanley` },
    description: t.meta.description,
    alternates: { languages: { es: "/es", en: "/en" } },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <html lang={lang} className={`${serif.variable} ${script.variable}`}>
      <body>
        <a className="skip" href="#main">
          {t.skip}
        </a>
        <SiteHeader lang={lang} t={t} />
        <main id="main">{children}</main>
        <SiteFooter lang={lang} t={t} />
      </body>
    </html>
  );
}
