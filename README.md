# Annika & Stanley — wedding website

A bilingual (Spanish / English) wedding site built with Next.js and hosted on Vercel's free Hobby plan. RSVPs go to a Google Sheet.

- Spanish: `/es` · English: `/en` (visitors to `/` are sent to their browser's language)
- Pages: Home, Schedule, Travel, Registry, FAQs, RSVP

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Google Sheets settings, the RSVP page runs in **development mode**: it uses sample guests (Ana Martínez, Jordan Sample, Ana Ramírez…) and saves nothing.

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

## Set up RSVPs with Google Sheets

1. **Create the spreadsheet** with two tabs, named exactly:
   - `Guests` with headers in row 1: `Household ID` | `Guest name`. Add one row per invited person; people in the same household share an ID (for example `H001`).
   - `RSVPs` with headers in row 1: `Timestamp` | `Household ID` | `Guest name` | `Attending` | `Dietary` | `Saturday crafting` | `Note` | `Language`. The site adds rows here. If a household replies twice, the newest rows are their current answer.
2. **Create a service account** in [Google Cloud Console](https://console.cloud.google.com/): create a project, enable the **Google Sheets API**, then go to *IAM & Admin → Service Accounts → Create*. Open it, choose *Keys → Add key → JSON*, and download the file.
3. **Share the spreadsheet** with the service account's email (it ends in `iam.gserviceaccount.com`) as an **Editor**.
4. **Add three environment variables** (see `.env.example`):
   - `GOOGLE_SHEET_ID`: the long ID in the sheet's URL, between `/d/` and `/edit`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: `client_email` from the JSON file
   - `GOOGLE_PRIVATE_KEY`: `private_key` from the JSON file

   For local testing, put them in `.env.local`. For the live site, add them in Vercel under *Project → Settings → Environment Variables*, then redeploy.

Guests search by first and last name (accents and capitals don't matter). RSVPs close automatically after February 1, 2027 (El Salvador time).

## Deploy on Vercel (free)

1. Push this folder to a GitHub repository.
2. At [vercel.com](https://vercel.com), sign up with the free Hobby plan, choose *Add New → Project*, and import the repository. Keep the defaults.
3. Add the three Google variables, then deploy. Vercel gives you a `*.vercel.app` address; you can add your own domain later in *Settings → Domains*.
