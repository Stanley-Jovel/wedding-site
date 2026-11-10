import { CalendarPlus, MapPin } from "lucide-react";
import { site } from "@/content/site";
import type { Dict } from "@/lib/i18n";

// Map and add-to-calendar, shown wherever the venue appears.
export function VenueActions({ t }: { t: Dict }) {
  return (
    <div className="venue-actions">
      <a className="btn btn-outline" href={site.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
        <MapPin aria-hidden="true" size={20} strokeWidth={1.5} />
        {t.common.openMap}
      </a>
      <details className="cal">
        <summary className="btn btn-outline">
          <CalendarPlus aria-hidden="true" size={20} strokeWidth={1.5} />
          {t.common.addToCalendar}
        </summary>
        <ul className="cal-menu">
          <li>
            <a href={site.calendar.google} target="_blank" rel="noopener noreferrer">
              {t.common.google}
            </a>
          </li>
          <li>
            <a href={site.calendar.ics} download>
              {t.common.appleOutlook}
            </a>
          </li>
        </ul>
      </details>
    </div>
  );
}

export function VenueMap({ t }: { t: Dict }) {
  return (
    <div className="map">
      {/* Shown until the embedded map paints over it, or if embeds are blocked. */}
      <div className="map-fallback">
        <MapPin aria-hidden="true" size={32} strokeWidth={1.25} />
        <p className="fact-main">{site.venue.name}</p>
        <p>{site.venue.address}</p>
        <a href={site.venue.mapsUrl} target="_blank" rel="noopener noreferrer">
          {t.common.openMap}
        </a>
      </div>
      <iframe
        title={t.common.mapTitle}
        src={site.venue.embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
