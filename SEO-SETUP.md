# Making LearnSphere Scholars Show Up in Search — SEO Setup

First, an honest heads-up: **no one can make a site "permanently" appear in
search engines** — not me, not an SEO agency, nobody. Google, Bing, and
others decide on their own what to index and how to rank it, based on
things like content quality, other sites linking to yours, and how often
people visit. What I *can* do is fix everything technical that would
otherwise stop your site from being indexed at all, and set it up so it has
the best possible chance. That's what's below.

---

## What I changed in the site itself

1. **Real page URLs instead of `#` links.** Your site used to use links like
   `yoursite.com/#/boards` — search engines generally can't index those as
   separate pages, only the homepage. Every page now has its own real
   address: `yoursite.com/boards`, `yoursite.com/entry-tests/mdcat`, etc.
   This is the single biggest fix for search visibility.
2. **`_redirects` file** — tells Netlify to serve your site correctly for
   those real URLs (without this, visiting `/boards` directly would show a
   404 error). This is already in your folder — just keep it there when
   you upload.
3. **Per-page titles & descriptions** — each page now sets its own
   `<title>` and description (e.g. the MDCAT page describes MDCAT
   specifically) instead of one generic title for the whole site.
4. **`robots.txt`** — tells search engines they're welcome to crawl the
   site, but explicitly keeps your hidden `/admin` page out of search
   results.
5. **`sitemap.xml`** — a list of all 17 pages on your site, which helps
   search engines discover and index everything, not just the homepage.
6. **Social preview tags (Open Graph)** — when someone shares your link on
   WhatsApp, Facebook, etc., it now shows a proper title and description
   instead of a blank preview.

## One placeholder you need to update

I used `https://learnspherescholars.netlify.app/` as a placeholder URL in
a few places, since I don't know your final domain yet:

- `index.html` — the `<link rel="canonical">` and `og:url` tags near the top
- `robots.txt` — the `Sitemap:` line
- `sitemap.xml` — every `<loc>` entry

Once you know your real URL (your Netlify address, or a custom domain if
you get one), replace `https://learnspherescholars.netlify.app` with it
in all three files — a simple find-and-replace.

---

## What only you can do (this needs your own accounts)

Search engines have to be told your site exists — I can't submit anything
on your behalf since it requires verifying you own the site.

### Google (the big one)
1. Go to **search.google.com/search-console**
2. Add your site (use the URL prefix option with your Netlify/custom URL)
3. Verify ownership — easiest method is usually the HTML tag option, or
   uploading a small verification file, both explained on-screen
4. Once verified, go to **Sitemaps** in the left menu → submit
   `sitemap.xml`
5. Indexing isn't instant — it typically takes anywhere from a few days to
   a few weeks for new sites

### Bing (also feeds Yahoo and some AI assistants)
1. Go to **bing.com/webmasters**
2. You can actually import your site directly from Google Search Console
   if you set that up first — much faster than verifying separately
3. Submit the same `sitemap.xml` there too

---

## Realistic expectations

- A brand-new site with no other sites linking to it usually takes **days
  to a few weeks** to first appear in search results, and longer to rank
  well for competitive terms like "MDCAT past papers."
- The more real, useful content you post (via your Google Sheet) and the
  more people share/link to specific pages, the better it'll rank over
  time — this compounds, it isn't a one-time setup.
- Sharing the site in relevant WhatsApp groups, Facebook groups, or asking
  students to link to specific board/test pages helps far more than any
  technical setting.

If you want, once you've picked a final domain and verified it in Search
Console, tell me and I'll help you double check everything's wired up
correctly.
