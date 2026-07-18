# Admin Panel Setup — LearnSphere Scholars

This gives you a hidden page on your own site where you can post notes,
textbooks, past papers, test dates and scholarships by filling in a simple
form — no spreadsheet needed once this is set up.

**Be honest with yourself about what this is:** it's a *hidden* page, not a
*secure* one. Anyone who has the exact web address and your passcode can
post content. There's no real login system behind it — it's a front-end
gate, which is normal for a small static site with no server. Don't use an
important password as your passcode, and don't rely on this to protect
anything sensitive.

---

## Step 1 — Finish the Google Sheet setup first

This builds on top of `GOOGLE-SHEET-SETUP.md` — do that first if you
haven't. The forms below feed directly into the same Sheet.

## Step 2 — Create 3 Google Forms

Go to **forms.google.com → Blank form**. Create three separate forms:

### Form 1 — "Post to Boards"
Add these questions, in this order, all as **Short answer** except where noted:

1. `board` — Short answer *(they'll type: fbise / balochistan / sindh / punjab / kpk / ajk)*
   — better: make this **Dropdown** with those 6 options, so it can't be typed wrong
2. `type` — **Dropdown**: notes / textbooks / pastpapers
3. `title` — Short answer
4. `subject` — **Dropdown**: Physics / Chemistry / Biology / Mathematics / Computer Science / English / Urdu / Islamiat / Pakistan Studies
5. `grade` — **Dropdown**: Class 9 / Class 10 / 1st Year / 2nd Year
6. `link` — Short answer (the Google Drive link)

### Form 2 — "Post to Entry Tests"
1. `test` — **Dropdown**: mdcat / ecat / net / sat / lat
2. `type` — **Dropdown**: date / pasttest
3. `title` — Short answer (the label, e.g. "Registration closes")
4. `date` — Short answer (e.g. "8 July 2026") — leave blank for pasttest rows
5. `note` — Short answer (optional detail) — leave blank for pasttest rows
6. `link` — Short answer (for pasttest rows only)

### Form 3 — "Post a Scholarship"
1. `category` — **Dropdown**: domestic / international
2. `title` — Short answer
3. `provider` — Short answer
4. `level` — Short answer (e.g. "Undergraduate")
5. `description` — Paragraph
6. `link` — Short answer

---

## Step 3 — Point each form's answers at your Sheet

For each of the 3 forms:

1. Click the **Responses** tab (top of the form editor)
2. Click the green Sheets icon
3. Choose **"Select existing spreadsheet"** → pick your "LearnSphere
   Scholars — Content" Sheet
4. This creates a *new tab* in that Sheet (e.g. "Post to Boards
   (Responses)") — that's fine and expected

## Step 4 — Point your site at the responses tab instead

Since the form creates its own response tab, use *that* tab's CSV link
instead of the one from your original Boards/Tests/Scholarships tab:

1. Open the response tab it created
2. Copy the Sheet ID and this tab's `gid` from the address bar (same method
   as `GOOGLE-SHEET-SETUP.md` Step 4)
3. Build the CSV link:
   `https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=GID`
4. Paste it into `sheetConfig` in `data.js` (replacing whatever was there)

> The form adds a "Timestamp" column automatically — that's fine, the site
> ignores columns it doesn't need.

## Step 5 — Get each form's "Send" link

1. On each form, click **Send** (top right)
2. Click the **link icon** (🔗)
3. Copy the link — it'll look like
   `https://forms.gle/AbCdEfGhIjKlMnOp`

## Step 6 — Wire it all into data.js

Open `data.js`, find `adminConfig`, and fill in:

```js
const adminConfig = {
  passcode: "pick-your-own-passcode",
  boardsFormUrl: "https://forms.gle/your-boards-form-link",
  testsFormUrl: "https://forms.gle/your-tests-form-link",
  scholarshipsFormUrl: "https://forms.gle/your-scholarships-form-link",
  sheetUrl: "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit",
};
```

Save, re-upload to Netlify.

---

## Step 7 — Using it

1. Go to `yoursite.netlify.app/admin` (bookmark this — it's not linked
   anywhere on the site)
2. Enter your passcode
3. Tap the form you need, fill it in on your phone or laptop
4. It's live on the site the next time someone refreshes — usually within
   a minute

---

## Why not a "real" upload button?

A true admin dashboard that saves data instantly needs a server and a
database. This site is a static site (just files, no server), which is
what makes it free to host and simple to maintain. Google Forms + Sheets
gives you the same day-to-day experience — fill a form, it's live — without
needing to run or pay for a backend. If you ever outgrow this (e.g. you want
multiple team members posting with their own logins, or content moderation
before it goes live), that's the point where a proper backend becomes worth
building — happy to help with that when you get there.
