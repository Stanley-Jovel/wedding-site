---
name: Annika & Stanley
description: A classic bilingual wedding site. White paper, sage fields, green-black ink, script for the names only.
colors:
  green-700: "#3b5646"
  green-800: "#2e4538"
  sage-50: "#f3f6f1"
  sage-100: "#e3eae0"
  sage-200: "#d3ddcf"
  sage-500: "#8fa58c"
  paper: "#ffffff"
  ink: "#22302a"
  ink-soft: "#4b5b52"
  rule: "#d6ded3"
  error: "#9b2c2c"
typography:
  display:
    fontFamily: "Pinyon Script, cursive"
    fontSize: "clamp(3.5rem, 13vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.05
  headline:
    fontFamily: "EB Garamond, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(2.2rem, 7vw, 3.4rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "0.12em"
  title:
    fontFamily: "EB Garamond, Iowan Old Style, Georgia, serif"
    fontSize: "clamp(1.6rem, 4vw, 2.1rem)"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "0.1em"
  subtitle:
    fontFamily: "EB Garamond, Iowan Old Style, Georgia, serif"
    fontSize: "1.6rem"
    fontWeight: 500
    lineHeight: 1.15
  body:
    fontFamily: "EB Garamond, Iowan Old Style, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "lnum"
  label:
    fontFamily: "EB Garamond, Iowan Old Style, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.14em"
rounded:
  focus: "2px"
  field: "8px"
  card: "12px"
  pill: "999px"
spacing:
  gutter: "clamp(1rem, 4vw, 2.5rem)"
  section: "clamp(2.5rem, 6vw, 4.5rem)"
  stack-sm: "0.75rem"
  stack-md: "1.5rem"
  stack-lg: "3rem"
  measure: "65ch"
components:
  button-primary:
    backgroundColor: "{colors.green-700}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.green-800}"
    textColor: "{colors.paper}"
  button-large:
    backgroundColor: "{colors.green-700}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 3.25rem"
    height: "3.75rem"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.green-700}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.75rem"
    height: "3.25rem"
  button-outline-hover:
    backgroundColor: "{colors.sage-50}"
    textColor: "{colors.green-800}"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.75rem 1rem"
    height: "3.25rem"
  choice:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0.6rem 1rem"
    height: "3.25rem"
  choice-checked:
    backgroundColor: "{colors.sage-50}"
    textColor: "{colors.ink}"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "clamp(1.5rem, 5vw, 2.5rem)"
  lang-switch-current:
    backgroundColor: "{colors.green-700}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    height: "2.75rem"
  notice:
    backgroundColor: "{colors.sage-50}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "1.25rem 1.5rem"
---

# Design System: Annika & Stanley

## Overview

**Creative North Star: "The Engraved Invitation"**

A printed wedding invitation carried onto the screen and finished with care. The page is white paper; soft sage fields mark the ceremonial bands (hero, shared-stay notice, footer); deep green-black ink carries every word. Composition is centered and symmetrical, punctuated by a fine botanical sprig and hairline rules. The couple's names are the only thing written by hand, in a flowing script; everything else is set in a classic old-style serif at a generous 19px so every guest, of every age, reads it without effort.

Density is low and the rhythm is calm: wide bands, one idea per band, large touch targets. Buttons are pills in sentence case. Depth is almost nothing: thin rules and tinted fields do the separating, with a soft shadow kept for the one floating object (the RSVP card) and the one popover (the calendar menu). Spanish and English are equals; the ES/EN switch is never hidden.

**Key Characteristics:**
- White paper ground, sage fields, green-black ink; one green accent.
- Script for the couple's names only; EB Garamond for everything else.
- Centered, ceremonial composition with a symmetric botanical sprig under titles.
- Hairline rules (1px) instead of boxes and shadows.
- Pill buttons in sentence case; large (52-60px) targets.
- Bilingual by construction: ES/EN segmented switch always in the top bar.

## Colors

A restrained botanical palette: one deep green for action, a ladder of sages for fields and states, and green-black ink.

### Primary
- **Laurel Green** (green-700): the single accent. Primary and outline buttons, the current language, the current nav item, links, focus rings, the sprig ornament, the ampersand in the names, timeline times, checked radio accents. It is the color of every interactive thing.
- **Deep Laurel** (green-800): hover and pressed state of Laurel Green only (button and link hover).

### Secondary
- **Morning Sage** (sage-100): the ceremonial field. Hero band, shared-accommodation band, footer. Also the language-switch hover.
- **Mist Sage** (sage-50): the quiet tint. Secondary bands (travel pointer), notices, the map well, hover and checked fill of choices, outline-button hover.
- **Pressed Sage** (sage-200): text selection only.
- **Lichen** (sage-500): non-text accents. Nav hover underline, choice hover border, scrollbar thumb. Never used for text (it fails contrast on white).

### Neutral
- **Paper** (paper): page ground, cards, inputs, text on green.
- **Evergreen Ink** (ink): all headings and body text.
- **Soft Ink** (ink-soft): secondary text (place line, hints, countdown units, household names, footer line) and input borders. Still above 4.5:1 on paper and sage.
- **Hairline** (rule): every divider: masthead bottom, band edges, fact columns, timeline rows, card and choice borders.
- **Garnet** (error): validation messages and invalid field borders only.

### Named Rules
**The One Green Rule.** Laurel Green is the only accent and it always means "you can act here". No second accent hue competes with it.

**The Field, Not Fill Rule.** Sage appears as full-width bands and quiet tints, never as button color or text color.

## Typography

**Script Font:** Pinyon Script (fallback cursive)
**Body and Heading Font:** EB Garamond (fallback Iowan Old Style, Georgia, serif)

**Character:** A hand-lettered name above engraver's capitals. The script is ornament with one job; the Garamond carries all information, warm and bookish, with lining figures so dates and times sit level.

### Hierarchy
- **Display** (script, 400, clamp 3.5-6rem, 1.05): the couple's names in the hero. Under 30rem the names stack on three lines at 4.5rem with a smaller ampersand. The same script sets the monogram (2.5rem, 2.1rem on phones) and the footer names (2.5rem).
- **Headline** (500, clamp 2.2-3.4rem, uppercase, 0.12em tracking): page titles, followed by the sprig.
- **Title** (500, clamp 1.6-2.1rem, uppercase, 0.1em tracking): centered section titles. The hero date uses the same engraved capitals (clamp 1.4-1.9rem, 0.16em).
- **Subtitle** (500, 1.6rem, sentence case): fact titles (When, Where, What to wear), event names, RSVP step titles (clamp 1.5-1.9rem), long-form h2s (clamp 1.45-1.75rem, with a hairline under).
- **Body** (400, 19px, 1.6): all reading text, capped at 65ch for long-form pages and 38-40rem for centered prose. Ledes step up to 1.25rem in Soft Ink.
- **Label** (400, 1rem, uppercase, 0.14em): primary nav only (0.9rem / 0.08em on phones). The language switch uses 0.95rem at 0.12em.

### Named Rules
**The Names-Only Script Rule.** Pinyon Script sets the couple's names and their monogram, nothing else. Never a heading, button, or label.

**The 19px Floor Rule.** Body text is 1.1875rem. Secondary text never drops below 0.95rem, and never in a color lighter than Soft Ink.

**The Level Figures Rule.** Numbers use lining figures; countdowns and timeline times use tabular lining figures.

## Layout

Single centered column, symmetrical, built from full-width bands stacked vertically. Horizontal padding is one fluid gutter (clamp 1-2.5rem). Content sections pad vertically at clamp(2.5rem, 6vw, 4.5rem) and cap at 70rem; long-form prose caps at the 65ch measure; the RSVP flow caps at 36rem; the map at 56rem.

- **Masthead:** a three-column grid with the script monogram centered and the ES/EN switch at the right; centered uppercase nav below, wrapping on phones. Under 40rem the monogram moves left and the switch stays right on the same row.
- **Hero:** a Morning Sage band (the photo slot sits above the text when a photo is supplied, 4:5, max 78vh). Names, full names, sprig, date, place, all centered.
- **RSVP band:** countdown and large RSVP button stacked on phones, side by side from 52rem, closed by a hairline.
- **Essentials:** three fact columns from 60rem divided by vertical hairlines; stacked below.
- **Choices:** one column on phones, two from 34rem.
- **Vertical rhythm:** 0.75rem inside a group, 1.5rem between fields and under titles, 2.5-3rem between blocks.

**The Centered Ceremony Rule.** Titles, facts, and calls to action are centered. Only long-form prose, timelines, and form fields run left-aligned.

## Elevation & Depth

Flat by default. Separation comes from hairlines and tinted bands. Two soft, low-contrast ink-tinted shadows exist, each for one job, plus a hover lift on the primary button.

### Shadow Vocabulary
- **Card float** (`0 18px 40px -28px rgba(34, 48, 42, 0.35)`): the RSVP card, the only resting raised surface.
- **Popover** (`0 12px 32px -12px rgba(34, 48, 42, 0.3)`): the add-to-calendar menu.
- **Button hover** (`0 6px 18px -8px rgba(34, 48, 42, 0.45)`): primary button on hover only.

### Named Rules
**The Hairline Rule.** Divide with a 1px Hairline rule or a sage band before reaching for a shadow.

## Shapes

Two shape families. Everything you press or switch is a full pill (999px): buttons, the language switch, the RSVP nav item, jump links. Everything that holds content has gently rounded corners: cards and the map at 12px, inputs, choices, picks, and notices at 8px. Borders are 1px throughout. The sprig is the only illustrative shape: a single fine stroke (1.1) drawn symmetrically from a center bud.

## Components

### Buttons
Calm and generous; sentence case, never uppercase.
- **Shape:** full pill (999px), 1px Laurel Green border, minimum height 52px.
- **Primary:** Laurel Green fill, Paper text, 1.15rem, 0.02em tracking. Hover deepens to Deep Laurel with a soft lift shadow.
- **Large:** the home RSVP call, 60px tall, 1.35rem, wide padding.
- **Outline:** Paper fill, Laurel Green text and border; hover to Mist Sage. Used for secondary actions (travel information, maps, add to calendar, "change answers").
- **Block:** full width inside the RSVP card.
- **Disabled/pending:** 60% opacity, progress cursor.
- **Icons:** optional 20px line icons (1.5 stroke) before the label, never alone.
- **Transitions:** background, color, shadow at 0.25s on the house ease-out.
- **Text actions:** underlined Laurel Green link-buttons ("Not you? Search again") sit centered below a card's main button.

### Navigation
- **Top nav:** uppercase label type in Evergreen Ink, 44px tall targets. Hover turns Laurel Green with a Lichen underline; current page gets a Laurel Green 1px underline and `aria-current`.
- **RSVP nav item:** an outline pill; filled Laurel Green when current or hovered.
- **Language switch:** a segmented pill with a Laurel Green outline; the current language is filled Laurel Green, the other is a link to the same page in that language. Always visible at every width.
- **Footer:** sprig, script names, a Soft Ink summary line, and underlined links on Morning Sage.
- **Jump links:** outline pills (Hairline border, Laurel Green on hover) or, as a list, full-width rows divided by hairlines.

### Inputs / Fields
- **Style:** Paper fill, 1px Soft Ink border, 8px corners, 52px minimum height, 1.15rem text. Labels 1.1rem medium weight above; hints 1rem Soft Ink between label and field.
- **Focus:** 2px Laurel Green outline, 1px offset, border turns Laurel Green.
- **Error:** Garnet border plus a Garnet message (1.05rem) linked by `aria-describedby`; the form-level summary uses `role="alert"`.

### Choices (radio and checkbox rows)
- Whole-row labels, 52px minimum, 1px Hairline border, 8px corners, 22px native controls tinted Laurel Green.
- Hover: Lichen border, Mist Sage fill. Checked: Laurel Green border, Mist Sage fill. Keyboard focus: 2px Laurel Green outline around the row. Unanswered group: every row gets a Garnet border with an inline "Please choose one." above.

### RSVP Card
The one raised surface. Paper, 1px Hairline border, 12px corners, card-float shadow, padding clamp 1.5-2.5rem, max 36rem. The flow moves through four states in the same card: **find** (name search with hint), **pick** (full-width household buttons), **answer** (a choice group per guest, optional dietary and note textareas, an opt-in checkbox row), **done** (a 40px line checkmark, title, confirmation, outline "change answers" button, `role="status"`). Focus moves to each new step's heading. A previous reply shows a quiet Mist Sage notice at the top.

### Notices
Mist Sage fill, Hairline border, 8px corners, centered; the quiet variant is left-aligned at 1.05rem. Used for closed or unconfigured states and "already replied".

### Countdown
Days, hours, minutes, seconds as large tabular figures (clamp 2.25-3rem) over small Soft Ink unit labels, with an italic Soft Ink caption.

### Sprig Ornament (signature)
A symmetric botanical line drawing (240x48 viewBox): one stem, mirrored leaves, small buds, a center bud, stroked at 1.1 in Laurel Green with no fill. It sits under page titles and between the hero's full names and date (min(13rem, 60%) wide) and tops the footer (10rem). Decorative: `aria-hidden`, never focusable, never a divider between ordinary sections.

### Hero Motion
The hero text rises once on load: 1.4s on the house ease-out (`cubic-bezier(0.16, 1, 0.3, 1)`) from 85% opacity and 10px down. It starts almost visible so a paused or throttled animation never hides the names. Under `prefers-reduced-motion` the animation and smooth scrolling are off. No other entrance motion exists.

## Do's and Don'ts

### Do:
- **Do** keep Laurel Green as the only accent and the only interactive color.
- **Do** set body text at 19px with 1.6 leading and keep secondary text at 0.95rem or larger in Soft Ink.
- **Do** keep both languages one tap away: the ES/EN switch sits in the top bar at every width, marks the current language with `aria-current`, carries `lang` and `hreflang` on each option, and links to the same page in the other language. The document root carries the active `lang`.
- **Do** give every target at least 44px (nav, links, switch) and every button and field at least 52px.
- **Do** show focus as a 2px Laurel Green outline with an offset on everything focusable.
- **Do** separate content with 1px Hairline rules and sage bands.
- **Do** place the sprig under page titles and in the hero and footer.
- **Do** keep buttons in sentence case on a full pill.
- **Do** honor reduced motion; the single hero rise is the only entrance animation.

### Don't:
- **Don't** use the script face for anything but the couple's names and monogram.
- **Don't** set buttons in uppercase or with square corners.
- **Don't** use Lichen or any sage for text.
- **Don't** set small, light gray type.
- **Don't** hide or collapse the language switch into a menu, or ship a half-translated page.
- **Don't** start an entrance animation from invisible.
- **Don't** add new shadows beyond the card float, popover, and button hover.
- **Don't** use stock imagery in the photo slot; leave the sage field until the couple's own photo arrives.
