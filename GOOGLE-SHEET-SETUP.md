# Google Sheet Setup — LearnSphere Scholars

Your content sheet: **"LearnSphere Scholars — FINAL Content"**
https://docs.google.com/spreadsheets/d/1LhSYDv6vtPExIXpBNd_KXENW7D2FY7muZ9nd9lrtfgY/edit

This is the one and only sheet the site reads from. It already contains
everything: all 6 boards × all 9 subjects × notes/textbooks/past papers
(378 rows), all 5 entry tests with real dates, and 6 scholarships.

## The one thing you need to check

1. Open the sheet
2. Tap **Share** (top right)
3. Make sure it says **"Anyone with the link" → Viewer**

That's it. The site's `data.js` is already pointed at this sheet.

---

## ⚠️ Adding new rows — read this first

Here's exactly what went wrong last time, so it doesn't happen again: rows
got pasted starting one column too far left, so `section` ended up holding
a board name like "fbise" instead of the word "boards", and everything
after it shifted over by one. The data wasn't lost — all 378 rows were
recovered and re-mapped — but let's avoid it happening again.

**The safest way to add a row:** click the very **last row** with data in
it, right-click → "Insert row below," then type into that new row using
Tab to move across. Avoid pasting a multi-column block from somewhere else
directly into column A — that's what caused the shift.

### Column cheat-sheet (12 columns, always in this order)

| # | Column | Boards rows | Test rows | Scholarship rows |
|---|--------|---|---|---|
| 1 | `section` | `boards` | `tests` | `scholarships` |
| 2 | `key1` | board slug (fbise/balochistan/sindh/punjab/kpk/ajk) | test slug (mdcat/ecat/net/sat/lat) | category (domestic/international) |
| 3 | `key2` | type (notes/textbooks/pastpapers) | type (date/pasttest) | *(leave blank)* |
| 4 | `title` | note/book/paper title | date label or past-test title | scholarship name |
| 5 | `subject` | subject name | *(blank)* | *(blank)* |
| 6 | `grade` | e.g. "1st Year" | *(blank)* | *(blank)* |
| 7 | `date` | *(blank)* | e.g. "8 July 2026" | *(blank)* |
| 8 | `note` | *(blank)* | extra detail | *(blank)* |
| 9 | `link` | Drive link | Drive link (pasttest only) | apply link |
| 10 | `provider` | *(blank)* | *(blank)* | who offers it |
| 11 | `level` | *(blank)* | *(blank)* | e.g. "Undergraduate" |
| 12 | `description` | *(blank)* | *(blank)* | one sentence |

**Column 1 must always literally say** `boards`, `tests`, or
`scholarships` — never a board or test name. That's the one thing that
went wrong before, and the first thing to check if something looks off.

### Safest option: use the Admin forms instead

If typing directly into the sheet feels risky, `ADMIN-SETUP.md` walks you
through setting up 3 simple Google Forms — you fill in one labeled field
at a time (no columns to get wrong), and it appends the row correctly for
you automatically. Worth the 15-minute setup if you'll be adding content
often.

---

## How the single sheet works

Every row has a `section` column that tells the site what kind of content
it is. You never need to fill every column — just the ones that matter
for that row's section (see table above). Leave the rest empty.

---

## Getting a Drive link for a note/textbook/paper

1. Upload the PDF to Google Drive
2. Right-click it → **Share**
3. Change access to **"Anyone with the link"**
4. Click **Copy link** — paste that as the `link` value

---

## If you'd rather have more example rows to copy from

Your zip includes `sheet-templates/boards_template.csv`, `tests_template.csv`,
and `scholarships_template.csv` — the same data already in your sheet, in
case you want a reference copy. Remember: if copying from these, re-type
values into the sheet field by field rather than pasting a raw block.

---

## Troubleshooting

- **"Live content not connected yet" on the site** → `contentCsvUrl` is
  missing in `data.js` — it should already be filled in.
- **"Couldn't load your Google Sheet"** → sharing likely isn't set to
  "Anyone with the link — Viewer" yet.
- **A row isn't showing up, or shows in the wrong place** → almost always
  means column 1 (`section`) doesn't exactly say `boards`, `tests`, or
  `scholarships`. Check that row first.
