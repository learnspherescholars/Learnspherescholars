# Editing data.js — Quick Reference

Most content now lives in your **Google Sheet** (see
`GOOGLE-SHEET-SETUP.md`) — notes, textbooks, past papers, test dates, past
tests, and scholarships all go there.

`data.js` now only holds things that rarely change:

- **siteConfig** — your email, Instagram, WhatsApp channel link, app
  download link
- **sheetConfig** — the three CSV links connecting to your Google Sheet
- **boardsData** — board names/descriptions (FBISE, Punjab, etc.)
- **testsData** — test names, descriptions, and "quick facts" (format,
  subjects, negative marking, etc.)

To change any of these, open `data.js`, find the text between the quotes,
and edit it directly. Save, then re-upload the folder to Netlify.

Everything else — the actual notes, papers, dates and scholarship
listings — goes in the Google Sheet instead.
