// ============================================================================
// LearnSphere Scholars — AI Study Assistant (server-side proxy)
// ============================================================================
// This function runs on Netlify's servers, not in the visitor's browser —
// that's the whole point. It's the only place your Gemini API key ever
// touches, so it's never visible to anyone viewing your site's source code.
//
// Uses Google's Gemini API, which has a genuinely free tier — no credit
// card required, generous daily limits, plenty for a student site.
//
// Setup: see CHATBOT-SETUP.md. In short — add an environment variable named
// GEMINI_API_KEY in your Netlify site settings, with a free key from
// Google AI Studio. Nothing in this file needs editing for that part.
//
// This version also reads your live Google Sheet (the same one your site's
// Boards/Entry Tests/Scholarships pages use) so the assistant can answer
// with your actual current content, not just general knowledge. See the
// "LIVE CONTENT CATALOG" section below for how that works.
// ============================================================================

const SYSTEM_PROMPT = `You are the LearnSphere Scholars Study Assistant, a
friendly helper embedded on learnspherescholars.org — a free website built
by students, for Pakistani students in classes 9–12 and first-year
university applicants.

About LearnSphere Scholars, in case a student asks who's behind this or
what the site/app is:
- It's a free resource covering board exam notes/textbooks/past papers
  (FBISE, Balochistan, Sindh, Punjab, KPK, AJK), entry test info (MDCAT,
  ECAT, NET, SAT, LAT), and domestic + international scholarships.
- A mobile app is coming soon, with more content than the website.
- There's a WhatsApp channel students can join for updates on new notes,
  test dates, and scholarship deadlines.
- It's built and run independently by students, not a government or
  university body.

You can help with:
- General study questions in any subject (Physics, Chemistry, Biology,
  Maths, English, Urdu, Islamiat, Pakistan Studies, Computer Science, etc.)
- Explaining concepts, solving example problems, and exam preparation tips
- Questions about the entry tests and scholarships listed on the site
- Questions about what specific notes, past papers, or scholarships are
  currently available on the site — use the live content catalog below for
  this, and point the student to the matching section of the site (Boards →
  their board, Entry Tests, Scholarships) to actually open it, rather than
  inventing or reciting a link yourself.

How to mention the site/app/WhatsApp channel: do it naturally and only
when it's actually useful — e.g. if a student asks for more practice
material on a topic the site covers, or asks what else is available, or
asks who made this. Don't append a promotional line to every single reply
— that gets annoying fast and defeats the purpose. Most answers should
just be a good, direct answer to the question asked.

FORMATTING — this matters, follow it exactly:
- Never use markdown symbols for formatting. No asterisks for bold
  (**word**) and no asterisk bullets (* like this). This chat widget
  displays plain text, so asterisks just show up as literal stars on the
  page instead of real formatting.
- For any list, use plain numbers (1. 2. 3.) — or, for sub-points inside a
  numbered item, roman numerals (i. ii. iii.).
- Keep answers short and simple by default: a few sentences, or a short
  numbered list. Only give a longer, fuller explanation when the student
  clearly asks for more detail or more depth.`;

const GEMINI_MODEL = 'gemini-3.1-flash-lite'; // free tier, high daily quota, stable (GA) through at least May 2027
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ----------------------------------------------------------------------------
// LIVE CONTENT CATALOG — reads the same Google Sheet your site uses, so the
// assistant knows what notes/tests/scholarships actually exist right now.
//
// This URL must match `sheetConfig.contentCsvUrl` in data.js. If you ever
// switch to a different sheet, update it in both places.
// ----------------------------------------------------------------------------
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1LhSYDv6vtPExIXpBNd_KXENW7D2FY7muZ9nd9lrtfgY/gviz/tq?tqx=out:csv';

// Kept in memory only — resets whenever Netlify spins up a fresh instance of
// this function, and refreshed on its own every 5 minutes either way. That
// keeps it close to real-time without re-fetching the sheet on every single
// chat message.
let catalogCache = { text: '', fetchedAt: 0 };
const CATALOG_CACHE_MS = 5 * 60 * 1000;

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { cur += c; }
    } else if (c === '"') { inQuotes = true; }
    else if (c === ',') { result.push(cur); cur = ''; }
    else { cur += c; }
  }
  result.push(cur);
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = (values[i] || '').trim(); });
    return row;
  });
}

function formatCatalog(rows) {
  const boards = rows.filter((r) => r.section === 'boards');
  const tests = rows.filter((r) => r.section === 'tests');
  const scholarships = rows.filter((r) => r.section === 'scholarships');

  const boardLines = boards.map(
    (r) => `${r.key1} / ${r.subject} / ${r.grade} / ${r.key2}: ${r.title}`
  );
  const testLines = tests.map((r) =>
    r.key2 === 'date'
      ? `${r.key1} — ${r.title}${r.note ? ' (' + r.note + ')' : ''}`
      : `${r.key1} past test — ${r.title}${r.note ? ' (' + r.note + ')' : ''}`
  );
  const scholarshipLines = scholarships.map(
    (r) =>
      `${r.title} — ${r.key1 || ''}, ${r.level || ''}. Provider: ${r.provider || 'n/a'}. ${r.description || ''}`
  );

  return [
    `BOARDS CONTENT (${boardLines.length} items — format is board / subject / grade / type: title):`,
    ...boardLines,
    '',
    `ENTRY TESTS (${testLines.length} items):`,
    ...testLines,
    '',
    `SCHOLARSHIPS (${scholarshipLines.length} items):`,
    ...scholarshipLines,
  ].join('\n');
}

async function getCatalog() {
  const now = Date.now();
  if (catalogCache.text && now - catalogCache.fetchedAt < CATALOG_CACHE_MS) {
    return catalogCache.text;
  }
  try {
    const res = await fetch(SHEET_CSV_URL);
    if (!res.ok) throw new Error(`sheet fetch failed: ${res.status}`);
    const csvText = await res.text();
    const rows = parseCsv(csvText);
    const formatted = formatCatalog(rows);
    catalogCache = { text: formatted, fetchedAt: now };
    return formatted;
  } catch (err) {
    console.error('Live catalog fetch failed, falling back', err);
    // Fall back to a stale cached copy if we have one, otherwise the
    // assistant just answers from general knowledge for this request —
    // it never breaks the chat entirely over this.
    return catalogCache.text || '';
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing from environment variables.');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'The AI assistant isn\u2019t connected yet. Add GEMINI_API_KEY in Netlify\u2019s environment variables — see CHATBOT-SETUP.md.',
      }),
    };
  }

  let messages;
  try {
    const body = JSON.parse(event.body || '{}');
    messages = Array.isArray(body.messages) ? body.messages : null;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  if (!messages || messages.length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No message provided' }) };
  }

  // Keep the request small and free-tier-friendly — only send the last 20
  // turns. Gemini uses 'user' / 'model' roles instead of 'user' / 'assistant'.
  const trimmed = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content || '').slice(0, 4000) }],
  }));

  const catalog = await getCatalog();
  const systemText = catalog
    ? `${SYSTEM_PROMPT}\n\n---\nLIVE CONTENT CATALOG (pulled from your Google Sheet just now — this is what's actually on the site right now):\n${catalog}`
    : SYSTEM_PROMPT;

  try {
    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemText }] },
        contents: trimmed,
        generationConfig: { maxOutputTokens: 800 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error', data);
      const message = data.error?.message || '';
      const friendly = /quota|rate/i.test(message)
        ? 'The free AI quota is fully used up for the moment — please try again in a bit.'
        : 'The AI assistant had a problem answering that.';
      return { statusCode: response.status, body: JSON.stringify({ error: friendly }) };
    }

    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: text || 'Sorry, I don\u2019t have an answer for that.' }),
    };
  } catch (err) {
    console.error('Chat function failed', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong reaching the AI assistant.' }) };
  }
};
