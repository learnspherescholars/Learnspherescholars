# Reviews Setup — LearnSphere Scholars

Every page now has a "Rate this page" widget at the bottom — star rating +
optional name + comment. It follows the exact same pattern as your content
Sheet: a Google Form collects submissions into a Google Sheet, the site
reads that Sheet back as CSV. No backend, nothing to pay for.

Until you finish the steps below, the widget shows an honest "not connected
yet" note instead of a form — the site won't break, it just won't collect
reviews yet.

---

## Step 1 — Create the Google Form

Go to **forms.google.com → Blank form**. Name it "LearnSphere Scholars —
Page Reviews". Add exactly these 4 questions, **in this order**, with these
**exact lowercase titles** (the site matches columns by name):

1. `page` — Short answer
2. `rating` — Short answer
3. `name` — Short answer
4. `comment` — Paragraph

Don't mark any of them "Required" — the site fills `page` and `rating` in
automatically behind the scenes, and a visitor never actually sees this
form (it's submitted invisibly when they tap "Submit Review" on your site).

## Step 2 — Get the entry IDs

1. On the form editor, click the **⋮** menu (top right) → **Get pre-filled
   link**
2. Type anything into all 4 fields (e.g. "test") and click **Get link**
3. Click **Copy link**, then paste it somewhere you can read it — it'll
   look like:
   `https://docs.google.com/forms/d/e/ABC123/viewform?usp=pp_url&entry.111111111=test&entry.222222222=test&entry.333333333=test&entry.444444444=test`
4. Match each `entry.XXXXXXXXX=test` to the question in the same position
   you added them (1st = page, 2nd = rating, 3rd = name, 4th = comment)

## Step 3 — Get the form action URL

Take that same pre-filled link and:
- Replace `/viewform` with `/formResponse`
- Delete everything from `?` onwards

So `.../forms/d/e/ABC123/viewform?usp=pp_url&...` becomes
`.../forms/d/e/ABC123/formResponse`. That's your `formActionUrl`.

## Step 4 — Connect responses to a Sheet, publish as CSV

1. On the form, click **Responses** → the green Sheets icon → **Create a
   new spreadsheet**
2. Open that new sheet → **File → Share → Publish to web**
3. Choose the response sheet's tab, format **CSV**, click **Publish**
4. Copy the CSV link it gives you

## Step 5 — Wire it into data.js

Open `data.js`, find `reviewsConfig`, and fill in everything from Steps
2–4:

```js
const reviewsConfig = {
  csvUrl: "paste the CSV link from Step 4",
  formActionUrl: "paste the .../formResponse link from Step 3",
  entryIds: {
    page: "entry.111111111",
    rating: "entry.222222222",
    name: "entry.333333333",
    comment: "entry.444444444",
  },
};
```

Save, re-upload to Netlify. Reviews submitted on the site will now land in
your Sheet, and show up on the site itself within about a minute (Google's
publish-to-web CSV refreshes on a short delay, not instantly).

## Notes

- There's no moderation — anything submitted appears once the CSV
  refreshes. If that becomes a problem, you can delete a bad row directly
  from the Sheet; it'll disappear from the site on the next refresh.
- The "page" value the site sends is the page's URL path (e.g.
  `/boards/fbise`), so ratings stay specific to the page they were left on.
