---
version: 1
slug: "app"
primary_target: "app"
related_targets: []
---

# Surface: wedding website (all guest pages)

## Scope and mode
Read mode (RSVP form is Operate inside it). Multi-page, bilingual (/es, /en), phone first, production-ready: Home, Schedule, Travel, Registry (link-out to Zola), FAQs, RSVP.

## Audience, job, constraints
Guests of both families, all ages, mostly on phones. Essentials first for everyone (date, venue, map, dress, RSVP). Travel is the marked section for guests coming from the US. Every sentence in content/source-en.md must appear in English; the Spanish is drafted from it. RSVP: the guest looks up their household by name, then answers per invited person, plus dietary needs, interest in the Saturday crafting session, and a note. Data goes to Google Sheets. Deadline February 1, 2027.

## Direction contract
THESIS: The classic wedding website, played straight and finished better than Zola, Joy or Minted. It refuses the template's cuts: no generic stock imagery, no half-translated second language, no tiny gray type.
OWN-WORLD: White ground and soft sage fields, deep green-black ink, sage and warm-sand accents. A script face for the couple's names only, a classic old-style serif for headings and body, centered ceremonial composition, fine botanical line ornaments, and thin rules.
STORY: The guest sees whose wedding it is, when and where, and how to reply. They trust it is current and complete, find their logistics, and RSVP before February 1.
FIRST VIEWPORT: A slim top bar with the monogram, the nav, and an always-visible ES/EN switch. A full-width couple photo field carries the script names, the date and place. Below it, a countdown and a large RSVP button.
FORM: canon (the category standard), chosen by the user from the safer-register reroll ("the standing door still my favorite"). seed:0207bb0bc4612f84
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Open decisions
Couple photos (labeled placeholders until supplied), phone numbers for Jennifer and Emma.

## Decided
- The hero script reads "Annika & Stanley" (user, 2026-11-10: "Keep Annika & Stanley"). The full names sit under it and in the footer.
- Temperatures show both °F and °C in both languages (user: "having celcius and fahrenheight both is a good idea").
- The registry links to https://www.zola.com/wedding/annikakatherineandluisstanley/registry
