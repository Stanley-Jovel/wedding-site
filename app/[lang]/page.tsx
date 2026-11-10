import Link from "next/link";
import { Photo } from "@/components/Photo";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { site } from "@/content/site";
import { Countdown } from "@/components/Countdown";
import { Sprig } from "@/components/Sprig";
import { VenueActions } from "@/components/VenueActions";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const h = t.home;
  const ph = site.photos;

  return (
    <>
      <section className="hero" aria-labelledby="hero-names">
        <Photo
          className="hero-photo hero-photo-wide"
          src={ph.heroWide.src}
          alt={ph.heroWide.alt[lang]}
          slot="Photo 1 · Hero, wide"
          hint="The two of you, landscape (3:2 or wider), 2400 px wide or more"
          sizes="100vw"
          priority
        />
        <Photo
          className="hero-photo hero-photo-tall"
          src={ph.heroTall.src ?? ph.heroWide.src}
          alt={ph.heroTall.alt[lang]}
          slot="Photo 2 · Hero, tall (phones)"
          hint="Same feel, portrait (4:5), 1600 px wide or more. Optional"
          sizes="100vw"
        />
        <div className="hero-text">
          <h1 id="hero-names" className="hero-names">
            <span className="hn">Annika</span> <span className="amp">&amp;</span>{" "}
            <span className="hn">Stanley</span>
          </h1>
          <p className="hero-full">
            {h.groom} <span className="hero-and">{h.and}</span> {h.bride}
          </p>
          <Sprig className="sprig hero-sprig" />
          <p className="hero-date">{h.date}</p>
          <p className="hero-place">{h.place}</p>
        </div>
      </section>

      <section className="rsvp-band">
        <Countdown target={site.ceremonyStart} labels={h.countdown} />
        <div className="rsvp-call">
          <Link href={`/${lang}/rsvp`} className="btn btn-primary btn-large">
            {t.common.rsvpCta}
          </Link>
          <p className="rsvp-by">{t.common.rsvpBy}</p>
        </div>
      </section>

      {ph.gallery.some((g) => g.src) || site.showPhotoPlaceholders ? (
        <section className="gallery" aria-label={lang === "es" ? "Fotos" : "Photos"}>
          {ph.gallery.map((g, i) => (
            <Photo
              key={i}
              className={`gallery-item g${i + 1}`}
              src={g.src}
              alt={g.alt[lang]}
              slot={`Photo ${i + 3} · Gallery`}
              hint={i === 1 ? "Portrait (3:4), the tallest of the three" : "Portrait (4:5)"}
              sizes="(min-width: 48rem) 33vw, 50vw"
            />
          ))}
        </section>
      ) : null}

      <section className="section essentials" aria-labelledby="essentials-title">
        <h2 id="essentials-title" className="section-title">{h.essentialsTitle}</h2>
        <div className="facts">
          <div className="fact">
            <h3 className="fact-title">{h.whenLabel}</h3>
            <div className="fact-body">
              <p className="fact-main">{h.when}</p>
              <p>{h.whenDetail}</p>
              <Link className="text-link" href={`/${lang}/schedule`}>{h.fullSchedule}</Link>
            </div>
          </div>
          <div className="fact">
            <h3 className="fact-title">{h.whereLabel}</h3>
            <div className="fact-body">
              <p className="fact-main">{site.venue.name}</p>
              <p>{site.venue.address}</p>
              <VenueActions t={t} />
            </div>
          </div>
          <div className="fact">
            <h3 className="fact-title">{h.wearLabel}</h3>
            <div className="fact-body">
              <p>{h.wear}</p>
              <Link className="text-link" href={`/${lang}/faqs#dress-code`}>{h.dressDetails}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section travel-pointer" aria-labelledby="travel-pointer-title">
        <h2 id="travel-pointer-title" className="section-title">{h.travelTitle}</h2>
        <p className="prose-center">{h.travelBody}</p>
        <Link href={`/${lang}/travel`} className="btn btn-outline">
          {h.travelCta}
        </Link>
      </section>
    </>
  );
}
