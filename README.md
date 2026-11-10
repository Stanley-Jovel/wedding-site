# Annika & Stanley — wedding website

A bilingual (Spanish / English) wedding site built with Next.js and hosted on Vercel's free Hobby plan. RSVPs go to a Google Sheet.

- Spanish: `/es` · English: `/en` (visitors to `/` are sent to their browser's language)
- Pages: Home, Schedule, Travel, Registry, FAQs, RSVP

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Google Sheets settings, the RSVP page runs in **development mode** with fictional sample guests; see below.

## Where to edit things

| What | File |
| --- | --- |
| English wording (approved source from Zola) | `content/source-en.md`, then `content/dictionaries/en.ts` |
| Spanish wording (draft, needs your review) | `content/dictionaries/es.ts` |
| Dates, venue, map, links, phone numbers, photos | `content/site.ts` |
| Colors and layout | `app/globals.css` |

### Still to fill in (`content/site.ts`)

- `registryUrl`: your Zola registry link. Until it's set, the Registry page says the link is coming soon.
- `phones.jennifer`, `phones.emma`: shown in the FAQ about Saturday's events.
- `photos`: put files in `public/photos/` and set each `src` (for example `src: "/photos/hero-wide.jpg"`). There are six slots:
  1. Hero, wide: the two of you, landscape, at least 2400 px wide. **This is the one that matters most.**
  2. Hero, tall (optional): a portrait version for phones, at least 1600 px wide. Without it, phones show photo 1 cropped to the center.
  3–5. Gallery: three photos in a row on Home, all portrait. The middle one is the tallest.
  6. Venue (optional): Quinta del Pilar, landscape, on the Schedule page.

  Until a slot has a photo, it shows a labeled placeholder. Set `showPhotoPlaceholders: false` to hide empty slots before launch.

## RSVPs: your "Guest List" sheet

The RSVP runs on your existing Google Sheet, on the **Guest List** tab, which holds the **Stanley Guests** and **Annika Guests** tables. The site finds each table by name and each column by its header, so you can reorder columns and sort rows freely. Just don't rename these headers.

**Columns the site reads and writes, in both tables:**

| Column | Who fills it | What it means |
| --- | --- | --- |
| Name | You | One person per row |
| Status | Site (Yes / No) | Your own Maybe / Probably no stays until the guest replies |
| Plus One? | You | How many guests this person may bring. Blank or 0 means none |
| Name +1 | You, then the site | Known names, comma separated. `???` means "ask the guest" |
| Dietary restrictions | Site | The person's own needs, then `Name: needs` for their plus-ones |
| Invite code | You or the site | Rows with the same code are one invitation. Leave it blank and the site fills in a random code |
| Link | Site | The personal link to send. It opens in Spanish for Stanley's side and English for Annika's |
| Answered | Site | Date of the latest reply |
| Plus-ones coming | Site | How many of this row's plus-ones are coming |
| Saturday crafting | Site | Yes / No for the whole invitation |
| Note to couple | Site | The guest's message |
| Language | You (optional) | `es` or `en` to override the side's language |

Every reply is also added to the **RSVP log** tab (Timestamp, Invite code, Side, Guest name, Role, Attending, Plus-one name, Dietary, Saturday crafting, Note, Language), so nothing is lost if a cell is edited by mistake.

Guests open their personal link, or search by any of their names on the RSVP page. They can change their answers until February 1, 2027 (El Salvador time). After that their page shows their answers read-only.

### Connect the sheet

1. Create a service account in [Google Cloud Console](https://console.cloud.google.com/): create a project, enable the **Google Sheets API**, then go to *IAM & Admin → Service Accounts → Create*. Open it, choose *Keys → Add key → JSON*, and download the file.
2. Share your guest spreadsheet with the service account's email (it ends in `iam.gserviceaccount.com`) as an **Editor**.
3. Add three environment variables (see `.env.example`):
   - `GOOGLE_SHEET_ID`: the long ID in the sheet's URL, between `/d/` and `/edit`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `client_email` from the JSON file
   - `GOOGLE_PRIVATE_KEY`: `private_key` from the JSON file

   For local testing, put them in `.env.local`. For the live site, add them in Vercel under *Project → Settings → Environment Variables*, then redeploy.

Without these settings, `npm run dev` uses fictional sample guests kept in memory (try "Juan Carlos Méndez" or "Amy Wright"), and the live site says RSVPs aren't open yet.

### Tests

```bash
npm test
```

## Deploy on Vercel (free)

1. Push this folder to a GitHub repository.
2. At [vercel.com](https://vercel.com), sign up with the free Hobby plan, choose *Add New → Project*, and import the repository. Keep the defaults.
3. Add the three Google variables, then deploy. Vercel gives you a `*.vercel.app` address; you can add your own domain later in *Settings → Domains*.
