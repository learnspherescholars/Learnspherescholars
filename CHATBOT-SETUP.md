# AI Study Assistant Setup — LearnSphere Scholars (Free Version)

Every page has a chat bubble (bottom-right) that opens a study assistant.
It runs on **Google's Gemini API**, which has a genuinely free tier — no
credit card, no trial period that expires, just a daily usage limit that
resets every day. That's a good fit for a student site with no budget.

Until you finish Step 2 below, the chat widget is visible but replies with
a message explaining it isn't connected yet — it won't error out or break
the rest of the site.

---

## Step 1 — Get a free Gemini API key

1. Go to **aistudio.google.com** and sign in with any Google account
2. Look for **"Get API key"** (usually top-left or in a side menu)
3. Click **"Create API key"**
4. Choose **"Create key in new project"** if asked
5. Copy the key that appears — save it somewhere for the next step

No credit card is asked for at any point in this flow. If Google ever
prompts you to "enable billing," you can skip that entirely — it's for
higher paid limits, not required for the free tier.

## Step 2 — Add the key to Netlify

1. Go to your site on **app.netlify.com**
2. **Site configuration → Environment variables → Add a variable**
3. Key: `GEMINI_API_KEY`
4. Value: paste the key from Step 1
5. Save, then trigger a new deploy (**Deploys → Trigger deploy → Deploy
   site**) — Netlify only picks up a new environment variable after a
   fresh deploy.

## Step 3 — Test it

Open your live site, tap the chat bubble, and ask it something. A real
answer means it's working.

---

## About the free limits

Google's free tier for the model this uses (`gemini-3.1-flash-lite`) allows a
generous number of requests per day — more than enough for a small
student site's chat traffic. If a student ever sees a message like "the
free AI quota is fully used up for the moment," it just means the daily
limit was hit — it resets automatically, no action needed from you.

Google's free tier terms allow your prompts/responses to be used to
improve their models. If that's a concern, that's the one tradeoff of
using a free tier over a paid one — nothing to configure differently on
your end either way.

## Knows your real content

The assistant reads your live Google Sheet (the same one your Boards/Entry
Tests/Scholarships pages use) on every reply, so it can answer "do you
have notes for X" questions with what's actually on the site — not just
guesses. It's refreshed at most every 5 minutes, so new rows you add show
up in chat almost right away. It replies in plain numbered lists, no
asterisks, and keeps answers short unless a student asks for more detail.

## Adjusting it later

- **Change how it behaves / what it knows about your site** — edit the
  `SYSTEM_PROMPT` text at the top of `netlify/functions/chat.js`.
- **Higher daily limit, still free** — this is already the highest-quota
  free option. For noticeably better answer quality instead, at a lower
  daily cap, you can swap `gemini-3.1-flash-lite` to `gemini-3.5-flash`
  in the same file.
- **Conversation memory** — the widget remembers the conversation while a
  student has the tab open, but starts fresh if they reload the page.
