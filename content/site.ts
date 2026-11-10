// Facts shared by both languages. Fill the nulls when the couple supplies them.

export const site = {
  // Live address; personal RSVP links in the guest sheet are built from it.
  url: "https://annikachristensen.stanleyjovel.com",
  // Ceremony start, El Salvador time (UTC-6, no daylight saving).
  ceremonyStart: "2027-03-14T17:00:00-06:00",
  // RSVPs close at the end of February 1, 2027, El Salvador time.
  rsvpDeadline: "2027-02-01T23:59:59-06:00",

  venue: {
    name: "Quinta del Pilar",
    address:
      "Avenida Monseñor Oscar Arnulfo Romero, Casa #2, Zaragoza, El Salvador",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Quinta+del+Pilar+Zaragoza+El+Salvador",
    embedUrl:
      "https://maps.google.com/maps?q=Quinta%20del%20Pilar%2C%20Zaragoza%2C%20El%20Salvador&z=15&output=embed",
  },

  calendar: {
    ics: "/annika-stanley-wedding.ics",
    google:
      "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Annika+%2B+Stanley%27s+Wedding&dates=20270314T223000Z/20270315T040000Z&location=Quinta+del+Pilar%2C+Avenida+Monse%C3%B1or+Oscar+Arnulfo+Romero%2C+Casa+%232%2C+Zaragoza%2C+El+Salvador",
  },

  // Shared Google Doc behind the "View" button in Travel.
  sharedStayDoc:
    "https://docs.google.com/document/d/1WNSnc5TVbNyaz3Un-HzmQbX8ZVg8Cu3kfdxVmHeCER0/edit?usp=sharing",

  // Zola registry (items and the honeymoon fund).
  registryUrl: "https://www.zola.com/wedding/annikakatherineandluisstanley/registry" as string | null,

  // TODO(couple): phone numbers shown in the FAQ, e.g. "+1 555 123 4567".
  phones: {
    jennifer: null as string | null,
    emma: null as string | null,
  },

  // Photos. Put files in /public/photos and set `src`, e.g. "/photos/hero-wide.jpg".
  // `alt` describes the photo for screen readers (English and Spanish).
  // While `src` is null, a labeled placeholder shows where the photo will go;
  // set showPhotoPlaceholders to false to hide empty slots instead.
  showPhotoPlaceholders: true,
  photos: {
    // 1. Hero, wide: the main couple photo across the top of Home on computers.
    heroWide: { src: null as string | null, alt: { en: "Annika and Stanley", es: "Annika y Stanley" } },
    // 2. Hero, tall (optional): the same moment framed vertically for phones.
    //    Falls back to the wide photo, cropped to the center.
    heroTall: { src: null as string | null, alt: { en: "Annika and Stanley", es: "Annika y Stanley" } },
    // 3–5. Three photos in a row on Home, under the countdown. The middle one is taller.
    gallery: [
      { src: null as string | null, alt: { en: "", es: "" } },
      { src: null as string | null, alt: { en: "", es: "" } },
      { src: null as string | null, alt: { en: "", es: "" } },
    ],
    // 6. Venue (optional): Quinta del Pilar, shown on the Schedule page.
    venue: { src: null as string | null, alt: { en: "Quinta del Pilar, Zaragoza", es: "Quinta del Pilar, Zaragoza" } },
  },
};
