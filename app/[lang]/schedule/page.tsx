import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import { site } from "@/content/site";
import { PageTitle } from "@/components/PageTitle";
import { Photo } from "@/components/Photo";
import { VenueActions, VenueMap } from "@/components/VenueActions";

export async function generateMetadata({ params }: PageProps<"/[lang]/schedule">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? { title: getDictionary(lang).schedule.title } : {};
}

export default async function Schedule({ params }: PageProps<"/[lang]/schedule">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang);
  const s = t.schedule;

  return (
    <>
      <PageTitle title={s.title} />
      <section className="section event" aria-labelledby="event-title">
        <h2 id="event-title" className="event-name">{s.event}</h2>
        <p className="event-day">{s.day}</p>
        <p className="event-hours">{s.hours}</p>

        <div className="event-venue">
          <p className="fact-main">{site.venue.name}</p>
          <p>{site.venue.address}</p>
          <p className="event-attire">{s.attire}</p>
          <VenueActions t={t} />
        </div>

        <ol className="timeline">
          {s.timeline.map((item) => (
            <li key={item.time}>
              <span className="timeline-time">{item.time}</span>
              <span className="timeline-text">{item.text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="section section-tight" aria-label={t.common.map}>
        <Photo
          className="venue-photo"
          src={site.photos.venue.src}
          alt={site.photos.venue.alt[lang]}
          slot="Photo 6 · Venue (optional)"
          hint="Quinta del Pilar, landscape (3:2), 2000 px wide or more"
          sizes="(min-width: 60rem) 56rem, 100vw"
        />
        <VenueMap t={t} />
      </section>

      <section className="section saturday" aria-labelledby="saturday-title">
        <h2 id="saturday-title" className="section-title">{s.saturdayTitle}</h2>
        <p className="prose-center">{s.saturdayBody}</p>
        <Link className="text-link" href={`/${lang}/faqs#saturday`}>{s.saturdayCta}</Link>
      </section>
    </>
  );
}
