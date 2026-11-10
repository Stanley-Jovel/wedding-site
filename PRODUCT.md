# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js on Vercel's free Hobby plan (personal, non-commercial use). RSVP responses are written to a Google Sheet the couple owns. The user chose the Google Sheet over a database; the framework and host were recommended and accepted.

## Users

Wedding guests of Annika Katherine Christensen and Luis Stanley Jovel Portal. Guests span all ages and mostly open the site on a phone. The guest list falls roughly into two halves:

- **Salvadoran guests (mostly Spanish-speaking, local):** need the essentials: date, time, venue, map, dress code, RSVP. Little or no travel logistics.
- **US guests (mostly English-speaking, traveling internationally):** need everything above plus travel, lodging, transportation, currency, climate, and pre-wedding events.

Secondary user: the couple (and family helpers) reading RSVP responses in the Google Sheet.

## Product Purpose

A bilingual (Spanish / English) wedding website that replaces the couple's Zola site for everything except the registry. It brings both sides of the family together in one place. Success means every guest finds the when, where, and what to wear quickly in their own language, US guests can plan the trip without having to message the couple, and every RSVP lands in the sheet by the deadline.

## Positioning

One site that holds both halves of an international wedding equally. The essentials come first for everyone. Travel detail sits in its own clearly marked section for guests coming from the United States, and nothing is hidden based on a guess about who the visitor is. Spanish and English are equal languages; neither is a translation tucked behind a link.

## Operating Context

- Guests arrive by link or QR code, usually on a phone, sometimes days before travel or on the day itself looking for the map.
- The site is the reference that save-the-dates and invitations point to.
- RSVPs go into a Google Sheet that the couple reviews.
- The registry and honeymoon fund stay on Zola; this site links out to them.

## Capabilities and Constraints

**Confirmed sections:** Home, Schedule, Travel, Registry, FAQs, RSVP.

- **Language:** full Spanish and English for all guest-facing content, with a language switch. Claude drafts the Spanish from the English source and the couple reviews it before launch.
- **Content layering:** essentials (date, venue, map, schedule, dress code, RSVP) are visible to everyone first. The Travel section is the "US guests" section and holds the detailed logistics.
- **RSVP:** a bilingual form on this site that writes to Google Sheets. Deadline: **February 1, 2027**. Fields beyond attendance (meal choice, plus-ones, dietary needs) are **undecided**.
- **Registry:** links out to the Zola registry (items and the Honeymoon Fund). It is not rebuilt here.
- **Shared-Airbnb list:** stays public, inside the Travel (US guests) section, as it is on Zola now.
- **Countdown** to the ceremony appears on the current Home page; keeping it is optional.
- **Add to calendar** and a **map link** for the venue are expected (both exist on Zola today).

### Event facts (from the current Zola site)

- **Couple:** Annika Katherine Christensen & Luis Stanley Jovel Portal. Casual form: "Annika + Stanley".
- **Date:** Sunday, March 14, 2027, 4:30 pm – 10:00 pm.
- **Venue:** Quinta del Pilar, Avenida Monseñor Oscar Arnulfo Romero, Casa #2, Zaragoza, El Salvador.
- **Timeline:** 3:00 pm wedding party arrives for first-look photos · 4:30 pm guests arrive (early arrivals wait under the gazebo in the parking area) · 5:00 pm ceremony begins, sharp · 5:45 pm reception · 10:00 pm all guests must leave the venue.
- **Dress code:** semi-formal. Ceremony on a grass lawn, so block heels or flats are recommended. No jeans. The bridal party's colors are white and green; guests should avoid outfits that compete with them. The full FAQ wording on attire is the source copy.
- **Climate:** March is 70–90 °F with moderate to high humidity and almost no chance of rain. (Show °C for Spanish readers is **undecided**.)
- **Saturday, March 13 events:** an optional morning wedding-favor crafting session in San Salvador (contact Jennifer Christensen), and an evening bachelor/bachelorette party for close friends and siblings (contact Emma Christensen).
- **Parking:** there will be a sign on the street and an attendant at the venue. Uber is a good alternative.

### Travel content (US guests)

- **Lodging:** Airbnb or Vrbo in San Salvador. Sharing a larger place cuts costs; contact Annika to be connected with other guests.
- **Shared Airbnbs for the bride's family:** a beach villa March 9–12 and a city home March 12–16. The listed guests are Emma Christensen; Hannah & Daniel Paget; Kyle & Jennifer Christensen; Christopher Hill; Jim Carroll; Bryan & Christi Goad; Emil Haedt & Anthony Cusguen; Lauren Christenson. The "View" button opens the shared Google Doc: https://docs.google.com/document/d/1WNSnc5TVbNyaz3Un-HzmQbX8ZVg8Cu3kfdxVmHeCER0/edit?usp=sharing
- **Transportation:** Zaragoza is a 20–30 minute drive from San Salvador. A US driver's license is valid. Rent a car for longer stays; otherwise Uber is convenient and affordable.
- **Currency:** USD. Bring cash for street vendors. Tipping is not customary.

## Brand Commitments

- Names appear as "Annika Katherine & Luis Stanley" in the header and "Annika + Stanley" in casual references.
- Voice: warm, practical, and considerate of guests' cost and effort. For example, gifts are "not expected (especially not if you are paying to travel to El Salvador)."
- The Zola tagline, footer, and branding are Zola's and must not be carried over.
- **Standing visual preference (chosen 2026-11-10):** the classic wedding-website form: a full-width couple photo, script names, centered serif, soft green and neutrals, a countdown, and a clear RSVP. The user picked it twice over more distinctive directions. Run it straight and at full craft, with no novelty smuggled in. The craft bar is the best Zola, Joy and Minted sites. What keeps it from looking like a template is craft, real photos and real content, not quirks.

## Evidence on Hand

- **The full English source copy, word for word, is in `content/source-en.md`.** It covers Home, Schedule, Travel (including the shared-Airbnb section and its View link), Registry and every FAQ. It is the approved wording; the Spanish is drafted from it, and every English sentence there must appear on the site.
- **Not yet in the repo:** the two hero photos from Zola (to be supplied), the Zola registry URL, and the phone numbers for Jennifer Christensen and Emma Christensen (shown as "(phone number)" placeholders on Zola).
- No monogram, invitation suite, or logo has been provided. Do not invent one as if it were existing brand material.

## Product Principles

1. **Essentials first, for everyone.** Anyone should be able to find the date, place, map, and RSVP within seconds, in either language.
2. **Two languages, equal standing.** Spanish is never an afterthought or a partial translation.
3. **Logistics where they're needed.** Detailed travel guidance lives in its own section for traveling guests and doesn't crowd the essentials.
4. **Respect guests' effort.** Save travelers money and guesswork, and never pressure them about gifts.
5. **The couple stays in control of data.** RSVPs land in their own Google Sheet; the registry stays where it already works.

## Accessibility & Inclusion

Mixed-age guests, many on phones: text must be legible at phone sizes without zooming, tap targets must be generous, and the form must be simple and forgiving. Both languages must carry the correct `lang` attributes. WCAG 2.2 AA is the working standard.
