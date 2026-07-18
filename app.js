/* ============================================================================
   LearnSphere Scholars — App logic
   Static info (board/test names) comes from data.js.
   Live content (notes, papers, dates, scholarships) comes from your Google
   Sheet, fetched here as CSV and parsed with PapaParse.
   You should not need to edit this file.
   ========================================================================== */

const app = document.getElementById('app');

// In-memory store for whatever we load from the Sheet.
const live = {
  boards: {},        // { slug: { notes:[], textbooks:[], pastpapers:[] } }
  tests: {},          // { slug: { dates:[], pastTests:[] } }
  scholarships: { domestic: [], international: [] },
  reviews: {},        // { pathname: [{ rating, name, comment }] }
  reviewStatus: 'unconfigured',
  status: {           // load status per sheet: 'unconfigured' | 'loading' | 'ready' | 'error'
    boards: 'unconfigured',
    tests: 'unconfigured',
    scholarships: 'unconfigured',
  },
};

async function loadReviews(){
  if (!reviewsConfig.csvUrl){ live.reviewStatus = 'unconfigured'; return; }
  live.reviewStatus = 'loading';
  try{
    const rows = await parseCsvUrl(reviewsConfig.csvUrl);
    const grouped = {};
    rows.forEach(r => {
      const page = (r.page || '').trim();
      const rating = parseInt(r.rating, 10);
      if (!page || !rating) return;
      if (!grouped[page]) grouped[page] = [];
      grouped[page].push({
        rating: Math.max(1, Math.min(5, rating)),
        name: (r.name || '').trim() || 'Anonymous',
        comment: (r.comment || '').trim(),
      });
    });
    live.reviews = grouped;
    live.reviewStatus = 'ready';
  } catch(e){
    console.error('Failed to load reviews', e);
    live.reviewStatus = 'error';
  }
}

function esc(str){
  return String(str ?? '').replace(/[&<>"']/g, s => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[s]));
}

// Returns { href, label, badge } for any "Download App" button, depending
// on siteConfig.appComingSoon. Set that flag to false once the app is live.
function appCta(baseLabel){
  if (siteConfig.appComingSoon){
    return {
      href: siteConfig.whatsappChannel,
      label: `${baseLabel} — Coming Soon`,
      badge: 'Coming Soon',
    };
  }
  return {
    href: siteConfig.appDownloadLink,
    label: baseLabel,
    badge: '',
  };
}

function icon(name){
  const icons = {
    arrow: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    download: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3M3 13h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    external: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6.5 3H3v10h10V9.5M9.5 3H13v3.5M13 3L7 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    refresh: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 3v4h-4M3 13v-4h4M3.5 6.5A5.5 5.5 0 0113 5M12.5 9.5A5.5 5.5 0 013 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="display:inline-block;vertical-align:-2px;"><rect x="3.5" y="7" width="9" height="6.5" rx="1.2" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    atom: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="1.8" fill="currentColor"/><ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="currentColor" stroke-width="1.4"/><ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="currentColor" stroke-width="1.4" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" stroke="currentColor" stroke-width="1.4" transform="rotate(120 12 12)"/></svg>',
    flask: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 3h6M10 3v6.2L4.8 18a2 2 0 001.7 3h11a2 2 0 001.7-3L14 9.2V3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 15h9" stroke="currentColor" stroke-width="1.4"/></svg>',
    leaf: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20 4C10 4 4 10 4 18c0 1 0 2 .3 2.7C5 21 6 21 7 20 14 13 20 10 20 4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 18C10 14 14 11 18 7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    compass: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M15.5 8.5l-2.2 5.8-5.8 2.2 2.2-5.8 5.8-2.2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    book: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 5.5A2.5 2.5 0 016.5 3H12v18H6.5A2.5 2.5 0 014 18.5v-13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M20 5.5A2.5 2.5 0 0017.5 3H12v18h5.5a2.5 2.5 0 002.5-2.5v-13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l2.6 6.2 6.4.5-4.9 4.3 1.6 6.2L12 16.9 6.3 20.2l1.6-6.2-4.9-4.3 6.4-.5L12 3z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    map: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 4L3 6.5v14L9 18m0-14l6 2m-6-2v14m6-12l6-2.5v14L15 18m0-14v14" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    chip: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="1.2" stroke="currentColor" stroke-width="1.5"/><path d="M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 20V4M4 20h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8 16v-4M12.5 16V8M17 16v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    gradcap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4L2 9l10 5 8-4v6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 11.5V17c0 1.1 2.7 3 6 3s6-1.9 6-3v-5.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
  };
  return icons[name] || '';
}

// Generalised colored icon tile — same visual language as subjectIconTile,
// but usable anywhere with an explicit icon key + color (e.g. the generic
// scholarships badge, which isn't tied to a single institution).
function iconTile(iconKey, color, size){
  const px = size || 30;
  return `<span class="subject-icon-tile" style="width:${px}px;height:${px}px;background:${esc(color)}1a;color:${esc(color)};">${icon(iconKey)}</span>`;
}

// A logo image if one's been provided, otherwise a colored initials crest —
// used for boards & entry test authorities.
function badge(b, size){
  if (!b) return '';
  const px = size || 44;
  if (b.logo){
    return `<img src="${esc(b.logo)}" alt="" width="${px}" height="${px}" class="badge-logo" style="width:${px}px;height:${px}px;">`;
  }
  return `<span class="badge-crest" style="width:${px}px;height:${px}px;background:${esc(b.color)};font-size:${Math.round(px*0.34)}px;">${esc(b.initials)}</span>`;
}

// Matches a subject name to an icon + color from subjectIcons, by
// case-insensitive substring — falls back to the "general" entry.
function matchSubjectIcon(subjectName){
  const key = (subjectName || '').toLowerCase();
  for (const k in subjectIcons){
    if (k !== 'general' && key.includes(k)) return subjectIcons[k];
  }
  return subjectIcons.general;
}

function subjectIconTile(subjectName){
  const s = matchSubjectIcon(subjectName);
  return `<span class="subject-icon-tile" style="background:${esc(s.color)}1a;color:${esc(s.color)};">${icon(s.icon)}</span>`;
}

/* ---------------------------------------------------------------------------
   Loading live data from Google Sheets (CSV)
   ------------------------------------------------------------------------- */
function parseCsvUrl(url){
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data || []),
      error: (err) => reject(err),
    });
  });
}

async function loadAllSheets(){
  if (!sheetConfig.contentCsvUrl){
    live.status.boards = live.status.tests = live.status.scholarships = 'unconfigured';
    return;
  }
  live.status.boards = live.status.tests = live.status.scholarships = 'loading';
  try{
    const rows = await parseCsvUrl(sheetConfig.contentCsvUrl);

    const boardsResult = {};
    const testsResult = {};
    const schResult = { domestic: [], international: [] };

    rows.forEach(r => {
      const section = (r.section || '').trim().toLowerCase();

      if (section === 'boards'){
        const board = (r.key1 || '').trim().toLowerCase();
        const type = (r.key2 || '').trim().toLowerCase();
        if (!board || !type) return;
        if (!boardsResult[board]) boardsResult[board] = { notes: [], textbooks: [], pastpapers: [] };
        if (!boardsResult[board][type]) boardsResult[board][type] = [];
        boardsResult[board][type].push({
          title: r.title || '', subject: r.subject || '', grade: r.grade || '', link: r.link || '#',
        });

      } else if (section === 'tests'){
        const test = (r.key1 || '').trim().toLowerCase();
        const type = (r.key2 || '').trim().toLowerCase();
        if (!test || !type) return;
        if (!testsResult[test]) testsResult[test] = { dates: [], pastTests: [] };
        if (type === 'date'){
          testsResult[test].dates.push({ label: r.title || '', date: r.date || '', note: r.note || '' });
        } else if (type === 'pasttest'){
          testsResult[test].pastTests.push({ title: r.title || '', link: r.link || '#' });
        }

      } else if (section === 'scholarships'){
        const category = (r.key1 || '').trim().toLowerCase();
        if (category !== 'domestic' && category !== 'international') return;
        schResult[category].push({
          title: r.title || '', provider: r.provider || '', level: r.level || '',
          description: r.description || '', link: r.link || '#',
        });
      }
    });

    live.boards = boardsResult;
    live.tests = testsResult;
    live.scholarships = schResult;
    live.status.boards = live.status.tests = live.status.scholarships = 'ready';
  } catch(e){
    console.error('Failed to load content sheet', e);
    live.status.boards = live.status.tests = live.status.scholarships = 'error';
  }
}

function sheetStatusBanner(key, sectionLabel){
  const status = live.status[key];
  if (status === 'unconfigured'){
    return `<div class="owner-note"><b>Live content not connected yet.</b> Add your Sheet's link as <b>sheetConfig.contentCsvUrl</b> in data.js — see GOOGLE-SHEET-SETUP.md.</div>`;
  }
  if (status === 'loading'){
    return `<div class="owner-note">Loading the latest ${esc(sectionLabel)} from your Google Sheet…</div>`;
  }
  if (status === 'error'){
    return `<div class="owner-note"><b>Couldn't load your Google Sheet.</b> Check your internet connection, and make sure the Sheet is shared as "Anyone with the link — Viewer". <button class="resource-tab" style="display:inline;padding:2px 8px;border:1px solid var(--ink);border-radius:4px;" onclick="retryLoad()">${icon('refresh')} Retry</button></div>`;
  }
  return '';
}

function retryLoad(){
  loadAllSheets().then(route);
}
window.retryLoad = retryLoad;

/* ---------------------------------------------------------------------------
   Layout helpers
   ------------------------------------------------------------------------- */
function breadcrumb(trail){
  return `<div class="breadcrumb">${trail.map((t,i) => {
    const isLast = i === trail.length - 1;
    if (isLast) return `<span class="current">${esc(t.label)}</span>`;
    return `<a href="${t.href}">${esc(t.label)}</a><span class="sep">/</span>`;
  }).join('')}</div>`;
}

function ownerNote(text){
  return `<div class="owner-note"><b>Editing this page:</b> ${text}</div>`;
}

/* ---------------------------------------------------------------------------
   HOME
   ------------------------------------------------------------------------- */
function renderHome(){
  const boardCount = Object.keys(boardsData).length;
  const testCount = Object.keys(testsData).length;
  const schCount = (live.scholarships.domestic?.length || 0) + (live.scholarships.international?.length || 0);
  const heroApp = appCta('Download the App');
  const bandApp = appCta('Download App');

  app.innerHTML = `
    <section class="hero">
      <div class="container">
        <div class="slip">
          <div class="slip-top">
            <div>
              <span class="hero-eyebrow">Welcome to LearnSphere Scholars</span>
              <h1>Board exams, entry tests &amp; scholarships — <em>all on one slip.</em></h1>
              <p class="lede">${esc(siteConfig.tagline)} Notes, textbooks, past papers, test dates and scholarship listings, organised the way Pakistani students actually search for them.</p>
              <div class="hero-actions">
                <a href="${esc(heroApp.href)}" ${siteConfig.appComingSoon ? 'target="_blank" rel="noopener"' : ''} class="btn btn-primary">${icon('download')} ${esc(heroApp.label)}</a>
                <a href="${esc(siteConfig.whatsappChannel)}" target="_blank" rel="noopener" class="btn btn-outline">Join WhatsApp Channel</a>
              </div>
            </div>
            <div class="slip-serial mono">
              <b>LSS / 2026</b>
              Candidate: Every Student<br>
              Valid: Boards · Tests · Scholarships
            </div>
          </div>

          <div class="slip-fields">
            <a href="/boards" class="slip-field">
              <span class="field-label">Section 01</span>
              <span class="field-value">Boards <span class="field-arrow">${icon('arrow')}</span></span>
            </a>
            <a href="/entry-tests" class="slip-field">
              <span class="field-label">Section 02</span>
              <span class="field-value">Entry Tests <span class="field-arrow">${icon('arrow')}</span></span>
            </a>
            <a href="/scholarships" class="slip-field">
              <span class="field-label">Section 03</span>
              <span class="field-value">Scholarships <span class="field-arrow">${icon('arrow')}</span></span>
            </a>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat"><div class="num">${boardCount}</div><div class="label">Boards covered</div></div>
          <div class="stat"><div class="num">${testCount}</div><div class="label">Entry tests tracked</div></div>
          <div class="stat"><div class="num">${schCount}+</div><div class="label">Scholarships listed</div></div>
          <div class="stat"><div class="num">3</div><div class="label">Everything, one place</div></div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Three sections. Everything a student needs.</h2>
          <p>Pick where you are in the journey — we've organised each one the way you'll actually use it.</p>
        </div>
        <div class="grid grid-3">
          <a href="/boards" class="card">
            <span class="card-code">01 / BOARDS</span>
            <h3>Board Notes &amp; Papers</h3>
            <p>FBISE, Balochistan, Sindh, Punjab and AJK — notes, textbooks and past papers by board.</p>
            <span class="card-foot">Browse boards ${icon('arrow')}</span>
          </a>
          <a href="/entry-tests" class="card">
            <span class="card-code">02 / ENTRY TESTS</span>
            <h3>MDCAT, ECAT, NET, SAT &amp; LAT</h3>
            <p>Test dates, past papers and everything you need to know about each test.</p>
            <span class="card-foot">Browse tests ${icon('arrow')}</span>
          </a>
          <a href="/scholarships" class="card">
            <span class="card-code">03 / SCHOLARSHIPS</span>
            <h3>Domestic &amp; International</h3>
            <p>Fully funded and partial scholarships in Pakistan and abroad.</p>
            <span class="card-foot">Browse scholarships ${icon('arrow')}</span>
          </a>
        </div>
      </div>
    </section>

    <section class="section-tight">
      <div class="container">
        <div class="cta-band">
          <div>
            <h3>Get updates the moment they're posted.</h3>
            <p>New notes, test dates and scholarship deadlines — straight to your phone.</p>
          </div>
          <div class="hero-actions">
            <a href="${esc(siteConfig.whatsappChannel)}" target="_blank" rel="noopener" class="btn btn-gold">Join WhatsApp Channel</a>
            <a href="${esc(bandApp.href)}" ${siteConfig.appComingSoon ? 'target="_blank" rel="noopener"' : ''} class="btn btn-outline" style="border-color:#fff;color:#fff;">${icon('download')} ${esc(bandApp.label)}</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   BOARDS — overview
   ------------------------------------------------------------------------- */
function renderBoardsOverview(){
  const cards = Object.entries(boardsData).map(([slug, b]) => `
    <a href="/boards/${slug}" class="card">
      <div class="card-badge-row">${badge(b.badge)}<span class="card-code mono">${esc(b.region)}</span></div>
      <h3>${esc(b.name)}</h3>
      <p>${esc(b.fullName)}</p>
      <span class="card-foot">Notes · Textbooks · Past Papers ${icon('arrow')}</span>
    </a>
  `).join('');

  app.innerHTML = `
    <section class="section">
      <div class="container">
        ${breadcrumb([{label:'Home', href:'/'}, {label:'Boards'}])}
        <div class="section-head">
          <h2>Section 01 — Boards</h2>
          <p>Choose your board to find notes, textbooks and past papers.</p>
        </div>
        <div class="grid grid-5">${cards}</div>
      </div>
    </section>
  `;
}

function resourceRow(it, kind){
  return `
    <a href="${esc(it.link)}" data-doc-title="${esc(it.title)}" class="resource-row js-doc-link">
      <div class="resource-info">
        <h4>${esc(it.title)}</h4>
        <div class="resource-meta">${[it.subject, it.grade].filter(Boolean).map(esc).join(' · ')}</div>
      </div>
      <span class="tag tag-gold">${esc(kind)}</span>
    </a>
  `;
}

function appTeaserRow(remaining){
  const cta = appCta('Get the App');
  return `
    <a href="${esc(cta.href)}" ${siteConfig.appComingSoon ? 'target="_blank" rel="noopener"' : ''} class="resource-row resource-row-locked">
      <div class="resource-info">
        <h4>${icon('lock')} ${remaining} more chapter${remaining > 1 ? 's' : ''} waiting in the App</h4>
        <div class="resource-meta">This subject continues beyond the free preview${siteConfig.appComingSoon ? ' — available once the App launches' : ''}</div>
      </div>
      <span class="tag tag-maroon">${esc(cta.badge || 'Get the App')}</span>
    </a>
  `;
}

function groupBySubject(items){
  const groups = {};
  const order = [];
  (items || []).forEach(it => {
    const key = it.subject && it.subject.trim() ? it.subject.trim() : 'General';
    if (!groups[key]){ groups[key] = []; order.push(key); }
    groups[key].push(it);
  });
  return order.map(key => ({ subject: key, items: groups[key] }));
}

// Flat list, no subject grouping or capping — used for textbooks & past papers.
function resourceSection(items, kind, emptyLabel){
  if (!items || items.length === 0){
    return `<div class="resource-empty">${esc(emptyLabel)}</div>`;
  }
  const groups = groupBySubject(items);
  const showBookTile = kind === 'Textbook';
  return groups.map(g => `
    <div class="subject-group${showBookTile ? ' subject-group-books' : ''}">
      <div class="subject-heading">${showBookTile ? subjectIconTile(g.subject) : ''}${esc(g.subject)}</div>
      <div class="resource-list">${g.items.map(it => resourceRow(it, kind)).join('')}</div>
    </div>
  `).join('');
}

// Grouped by subject AND capped to siteConfig.freeChaptersPerSubject per
// subject, with an "unlock in the App" teaser for anything beyond that.
// Used for board notes only.
function resourceSectionCapped(items, kind, emptyLabel){
  if (!items || items.length === 0){
    return `<div class="resource-empty">${esc(emptyLabel)}</div>`;
  }
  const cap = siteConfig.freeChaptersPerSubject || 2;
  const groups = groupBySubject(items);
  return groups.map(g => {
    const shown = g.items.slice(0, cap);
    const remaining = g.items.length - shown.length;
    return `
      <div class="subject-group">
        <div class="subject-heading">${esc(g.subject)}</div>
        <div class="resource-list">
          ${shown.map(it => resourceRow(it, kind)).join('')}
          ${remaining > 0 ? appTeaserRow(remaining) : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ---------------------------------------------------------------------------
   BOARDS — detail page (notes / textbooks / past papers tabs)
   ------------------------------------------------------------------------- */
function renderBoardDetail(slug){
  const b = boardsData[slug];
  if (!b){ renderNotFound(); return; }

  const boardLive = live.boards[slug] || { notes: [], textbooks: [], pastpapers: [] };
  const tabs = [
    { key: 'notes', label: 'Notes' },
    { key: 'textbooks', label: 'Textbooks' },
    { key: 'pastpapers', label: 'Past Papers' },
  ];

  app.innerHTML = `
    <section class="section">
      <div class="container">
        ${breadcrumb([{label:'Home', href:'/'}, {label:'Boards', href:'/boards'}, {label:b.name}])}
        <div class="section-head section-head-badged">
          ${badge(b.badge, 56)}
          <div>
            <h2>${esc(b.name)}</h2>
            <p>${esc(b.fullName)} — ${esc(b.region)}</p>
          </div>
        </div>

        ${sheetStatusBanner('boards', 'Boards')}

        <p class="mono" style="font-size:12.5px;color:var(--ink-soft);margin-bottom:20px;">Every subject's first ${siteConfig.freeChaptersPerSubject} chapters are free to read here. The rest of that subject continues in the LearnSphere Scholars App.</p>

        <div class="resource-tabs" id="board-tabs">
          ${tabs.map((t,i) => `<button class="resource-tab ${i===0?'active':''}" data-tab="${t.key}">${t.label} (${(boardLive[t.key]||[]).length})</button>`).join('')}
        </div>
        <div id="board-tab-panel"></div>
      </div>
    </section>
  `;

  const panel = document.getElementById('board-tab-panel');
  const labels = { notes: 'Notes', textbooks: 'Textbook', pastpapers: 'Past Paper' };
  const emptyLabels = {
    notes: 'No notes posted yet for this board — add a row to your Google Sheet to post one.',
    textbooks: 'No textbooks posted yet for this board — add a row to your Google Sheet to post one.',
    pastpapers: 'No past papers posted yet for this board — add a row to your Google Sheet to post one.',
  };
  function showTab(key){
    if (key === 'notes'){
      panel.innerHTML = resourceSectionCapped(boardLive[key], labels[key], emptyLabels[key]);
    } else {
      panel.innerHTML = resourceSection(boardLive[key], labels[key], emptyLabels[key]);
    }
  }
  showTab('notes');

  document.getElementById('board-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.resource-tab');
    if (!btn) return;
    document.querySelectorAll('#board-tabs .resource-tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    showTab(btn.dataset.tab);
  });
}

/* ---------------------------------------------------------------------------
   ENTRY TESTS — overview
   ------------------------------------------------------------------------- */
function renderTestsOverview(){
  const cards = Object.entries(testsData).map(([slug, t]) => `
    <a href="/entry-tests/${slug}" class="card">
      <div class="card-badge-row">${badge(t.badge)}<span class="card-code mono">${esc(t.conductedBy)}</span></div>
      <h3>${esc(t.name)}</h3>
      <p>${esc(t.fullName)}</p>
      <span class="card-foot">Dates · Past Papers · Info ${icon('arrow')}</span>
    </a>
  `).join('');

  app.innerHTML = `
    <section class="section">
      <div class="container">
        ${breadcrumb([{label:'Home', href:'/'}, {label:'Entry Tests'}])}
        <div class="section-head">
          <h2>Section 02 — Entry Tests</h2>
          <p>MDCAT, ECAT, NET, SAT and LAT — dates, past papers and full details.</p>
        </div>
        <div class="grid grid-5">${cards}</div>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   ENTRY TESTS — detail page (past tests / test dates / all info tabs)
   ------------------------------------------------------------------------- */
function renderTestDetail(slug){
  const t = testsData[slug];
  if (!t){ renderNotFound(); return; }

  const testLive = live.tests[slug] || { dates: [], pastTests: [] };
  const tabs = [
    { key: 'dates', label: `Test Dates (${(testLive.dates||[]).length})` },
    { key: 'past', label: `Past Tests (${(testLive.pastTests||[]).length})` },
    { key: 'info', label: 'All Information' },
  ];

  app.innerHTML = `
    <section class="section">
      <div class="container">
        ${breadcrumb([{label:'Home', href:'/'}, {label:'Entry Tests', href:'/entry-tests'}, {label:t.name}])}
        <div class="section-head section-head-badged">
          ${badge(t.badge, 56)}
          <div>
            <h2>${esc(t.name)}</h2>
            <p>${esc(t.fullName)} — conducted by ${esc(t.conductedBy)}</p>
          </div>
        </div>

        ${sheetStatusBanner('tests', 'Entry Tests')}

        <div class="resource-tabs" id="test-tabs">
          ${tabs.map((tb,i) => `<button class="resource-tab ${i===0?'active':''}" data-tab="${tb.key}">${tb.label}</button>`).join('')}
        </div>
        <div id="test-tab-panel"></div>
      </div>
    </section>
  `;

  const panel = document.getElementById('test-tab-panel');

  function renderDates(){
    const items = testLive.dates || [];
    if (items.length === 0) return `<div class="resource-empty">No dates posted yet — add a row to your Google Sheet to post one.</div>`;
    return items.map(d => `
      <div class="date-slip">
        <div>
          <div class="dl">${esc(d.label)}</div>
          ${d.note ? `<div class="dn">${esc(d.note)}</div>` : ''}
        </div>
        <div class="dd">${esc(d.date)}</div>
      </div>
    `).join('');
  }

  function renderPast(){
    return resourceSection(testLive.pastTests, 'Download', 'No past tests posted yet — add a row to your Google Sheet to post one.');
  }

  function renderInfo(){
    const facts = (t.quickFacts||[]).map(f => `
      <div class="fact">
        <span class="field-label">${esc(f.label)}</span>
        <span class="field-value">${esc(f.value)}</span>
      </div>
    `).join('');
    return `
      <p style="max-width:680px;color:var(--ink-soft);margin-bottom:24px;">${esc(t.about)}</p>
      <div class="fact-grid">${facts}</div>
      <p class="mt-16" style="font-size:13.5px;">
        Official source: <a href="${esc(t.officialSite)}" target="_blank" rel="noopener" style="border-bottom:1px dotted var(--ink);">${esc(t.officialSite)} ${icon('external')}</a>
      </p>
    `;
  }

  const renderers = { dates: renderDates, past: renderPast, info: renderInfo };
  function showTab(key){ panel.innerHTML = renderers[key](); }
  showTab('dates');

  document.getElementById('test-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.resource-tab');
    if (!btn) return;
    document.querySelectorAll('#test-tabs .resource-tab').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    showTab(btn.dataset.tab);
  });
}

/* ---------------------------------------------------------------------------
   SCHOLARSHIPS — overview
   ------------------------------------------------------------------------- */
function renderScholarshipsOverview(){
  const domCount = live.scholarships.domestic?.length || 0;
  const intlCount = live.scholarships.international?.length || 0;

  app.innerHTML = `
    <section class="section">
      <div class="container">
        ${breadcrumb([{label:'Home', href:'/'}, {label:'Scholarships'}])}
        <div class="section-head section-head-badged">
          ${iconTile(scholarshipsBadge.icon, scholarshipsBadge.color, 48)}
          <div>
            <h2>Section 03 — Scholarships</h2>
            <p>Choose domestic or international to see current listings.</p>
          </div>
        </div>
        ${sheetStatusBanner('scholarships', 'Scholarships')}
        <div class="grid grid-2">
          <a href="/scholarships/domestic" class="card">
            <div class="card-badge-row">${iconTile(scholarshipsBadge.icon, scholarshipsBadge.color)}<span class="card-code">WITHIN PAKISTAN</span></div>
            <h3>Domestic Scholarships</h3>
            <p>Government and provincial scholarships for students studying in Pakistan.</p>
            <span class="card-foot">${domCount} listed ${icon('arrow')}</span>
          </a>
          <a href="/scholarships/international" class="card">
            <div class="card-badge-row">${iconTile(scholarshipsBadge.icon, scholarshipsBadge.color)}<span class="card-code">STUDY ABROAD</span></div>
            <h3>International Scholarships</h3>
            <p>Fully funded and partial scholarships to study outside Pakistan.</p>
            <span class="card-foot">${intlCount} listed ${icon('arrow')}</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   SCHOLARSHIPS — list page
   ------------------------------------------------------------------------- */
function skeletonCards(count){
  return Array.from({ length: count }).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-line short"></div>
      <div class="skeleton-line" style="width:80%;height:18px;"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
    </div>
  `).join('');
}

function renderScholarshipList(type){
  const isDomestic = type === 'domestic';
  if (type !== 'domestic' && type !== 'international'){ renderNotFound(); return; }
  const items = live.scholarships[type] || [];
  const isLoading = live.status.scholarships === 'loading';

  const cards = items.map(s => `
    <a href="${esc(s.link)}" target="_blank" rel="noopener" class="card">
      <div class="card-badge-row">${iconTile(scholarshipsBadge.icon, scholarshipsBadge.color)}<span class="card-code mono">${esc(s.provider)}</span></div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.description)}</p>
      <span class="card-foot"><span class="tag tag-green">${esc(s.level)}</span></span>
    </a>
  `).join('');

  const gridContent = isLoading && items.length === 0
    ? skeletonCards(3)
    : (cards || `<div class="resource-empty">No scholarships posted yet — add a row to your Google Sheet to post one.</div>`);

  app.innerHTML = `
    <section class="section">
      <div class="container">
        ${breadcrumb([{label:'Home', href:'/'}, {label:'Scholarships', href:'/scholarships'}, {label: isDomestic ? 'Domestic' : 'International'}])}
        <div class="section-head section-head-badged">
          ${iconTile(scholarshipsBadge.icon, scholarshipsBadge.color, 48)}
          <div>
            <h2>${isDomestic ? 'Domestic' : 'International'} Scholarships</h2>
            <p>${isDomestic ? 'For students studying within Pakistan.' : 'For students planning to study abroad.'}</p>
          </div>
        </div>
        ${sheetStatusBanner('scholarships', 'Scholarships')}
        <div class="grid grid-3">${gridContent}</div>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   ADMIN — hidden page, not linked anywhere in the public site.
   Reachable only at /admin. Gated by a simple passcode (see adminConfig
   in data.js). This is a front-end-only gate for keeping the page out of
   casual visitors' way — see ADMIN-SETUP.md for the honest limitations.
   ------------------------------------------------------------------------- */
function adminIsUnlocked(){
  try{ return sessionStorage.getItem('lss_admin_ok') === '1'; }
  catch(e){ return false; }
}
function adminSetUnlocked(){
  try{ sessionStorage.setItem('lss_admin_ok', '1'); } catch(e){ /* ignore */ }
}

function renderAdmin(){
  if (!adminIsUnlocked()){
    app.innerHTML = `
      <section class="section">
        <div class="container" style="max-width:420px;">
          <div class="section-head"><h2>Admin</h2><p>Enter your passcode to continue.</p></div>
          <form id="admin-login" class="card" style="display:flex;flex-direction:column;gap:12px;">
            <input type="password" id="admin-passcode" placeholder="Passcode" autocomplete="off"
              style="padding:12px 14px;border:1px solid var(--line);border-radius:var(--radius);font-family:var(--font-mono);font-size:14px;">
            <button type="submit" class="btn btn-primary">Unlock</button>
            <div id="admin-login-error" style="color:var(--maroon);font-size:13px;display:none;">Wrong passcode — try again.</div>
          </form>
        </div>
      </section>
    `;
    document.getElementById('admin-login').addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('admin-passcode').value;
      if (val === adminConfig.passcode){
        adminSetUnlocked();
        renderAdmin();
      } else {
        document.getElementById('admin-login-error').style.display = 'block';
      }
    });
    return;
  }

  const postCard = (title, desc, url, code) => `
    <div class="card">
      <span class="card-code">${esc(code)}</span>
      <h3>${esc(title)}</h3>
      <p>${esc(desc)}</p>
      ${url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener" class="btn btn-primary mt-16" style="width:100%;justify-content:center;">Open Form</a>`
        : `<div class="owner-note mt-16">No form link set yet — add it to <b>adminConfig</b> in data.js. See ADMIN-SETUP.md.</div>`}
    </div>
  `;

  app.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2>Admin — Post Content</h2>
          <p>These forms feed straight into your Google Sheet. Fill one in and it appears on the site next time someone refreshes.</p>
        </div>

        <div class="grid grid-3">
          ${postCard('Boards — Notes / Textbooks / Past Papers', 'Post a note, textbook or past paper to any board.', adminConfig.boardsFormUrl, 'FORM 01')}
          ${postCard('Entry Tests — Dates / Past Tests', 'Post a test date or a past test for MDCAT, ECAT, NET, SAT or LAT.', adminConfig.testsFormUrl, 'FORM 02')}
          ${postCard('Scholarships', 'Post a domestic or international scholarship listing.', adminConfig.scholarshipsFormUrl, 'FORM 03')}
        </div>

        <div class="mt-40">
          ${adminConfig.sheetUrl
            ? `<a href="${esc(adminConfig.sheetUrl)}" target="_blank" rel="noopener" class="btn btn-outline">Open Google Sheet directly ${icon('external')}</a>`
            : `<div class="owner-note">Add your Sheet's link to <b>adminConfig.sheetUrl</b> in data.js for a quick direct-edit shortcut here too.</div>`}
        </div>

        <div class="owner-note mt-24">
          This page isn't linked anywhere on the public site and isn't shown to visitors — only people with this exact web address (and your passcode) can reach it. It's a hidden page, not a secured one: treat the address and passcode like a shared house key, not a bank password.
        </div>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   404
   ------------------------------------------------------------------------- */
function renderNotFound(){
  app.innerHTML = `
    <section class="section text-center">
      <div class="container">
        <h2 style="font-family:var(--font-display);font-size:32px;margin-bottom:12px;">Page not found</h2>
        <p style="color:var(--ink-soft);margin-bottom:20px;">This roll number doesn't match anything on file.</p>
        <a href="/" class="btn btn-primary">Back to Home</a>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   Trust pages — Privacy Policy, Terms, About, Contact
   Shared layout: a narrow readable column, section headings in the display
   font, body copy in --ink-soft to match the rest of the site.
   ------------------------------------------------------------------------- */
const H3 = 'font-family:var(--font-display);font-size:22px;margin:32px 0 12px;color:var(--ink);';
const LEGAL_P = 'margin-bottom:16px;';

function renderLegalPage(title, updated, bodyHtml){
  app.innerHTML = `
    <section class="section">
      <div class="container" style="max-width:760px;">
        <h2 style="font-family:var(--font-display);font-size:36px;margin-bottom:8px;">${title}</h2>
        ${updated ? `<p style="color:var(--ink-soft);opacity:0.8;margin-bottom:32px;font-size:14px;">Last updated: ${updated}</p>` : ''}
        <div style="line-height:1.7;color:var(--ink-soft);">${bodyHtml}</div>
      </div>
    </section>
  `;
}

function renderPrivacyPolicy(){
  renderLegalPage('Privacy Policy', 'July 2026', `
    <p style="${LEGAL_P}">LearnSphere Scholars ("we," "us," "the site") is a free educational
    resource built by students, for Pakistani students. This policy explains what information
    we collect, why, and how it's handled. It's written in plain language on purpose — if
    anything here is unclear, email us at <a data-config="email" href="mailto:${siteConfig.email}">${siteConfig.email}</a>.</p>

    <h3 style="${H3}">1. Information we collect</h3>
    <p style="${LEGAL_P}"><strong>Usage data.</strong> Like most websites, we use Google Analytics
    to see which pages get visited, roughly which country/city visitors come from, device and
    browser type, and how people move through the site. This is aggregate data — it tells us
    what content is helpful, not who any individual visitor is.</p>
    <p style="${LEGAL_P}"><strong>Study Assistant chats.</strong> If you use the AI chat feature,
    your messages are sent to Google's Gemini API to generate a response. We don't attach your
    name or identity to these messages, and we don't store a transcript of your conversations
    on our own servers. Please don't share personal details (full name, phone number, address,
    exam roll number, etc.) in the chat — treat it like a study helper, not a private inbox.</p>
    <p style="${LEGAL_P}"><strong>Reviews.</strong> If you leave a review on a board, test, or
    scholarship page, we store the rating, comment, and the name you choose to enter (you can
    leave this blank/anonymous — it's never required).</p>
    <p style="${LEGAL_P}"><strong>Direct contact.</strong> If you email us, we naturally receive
    your email address and whatever you write to us. We use it only to reply to you.</p>

    <h3 style="${H3}">2. How we use information</h3>
    <p style="${LEGAL_P}">To understand which notes, past papers, and scholarships are actually
    useful, fix broken content, respond to questions, and generally keep the site running and
    improving. We do not sell student data, and we don't use it for anything beyond running
    this site.</p>

    <h3 style="${H3}">3. Third-party services we use</h3>
    <p style="${LEGAL_P}">Google Analytics (site statistics), Google's Gemini API (Study
    Assistant responses), Google Sheets (how we manage and publish notes/test/scholarship
    listings), and Netlify (website hosting). Each of these providers has its own privacy
    policy governing how they process data on their end.</p>

    <h3 style="${H3}">4. Cookies</h3>
    <p style="${LEGAL_P}">Google Analytics sets standard analytics cookies to distinguish
    visitors and measure site usage. If we add advertising in the future (for example, Google
    AdSense), that would introduce additional cookies used to serve and measure ads — this
    policy will be updated first if and when that happens, and you'll still be able to control
    ad personalization through your Google account settings.</p>

    <h3 style="${H3}">5. Children's privacy</h3>
    <p style="${LEGAL_P}">This site is aimed at secondary school and college-entry students in
    Pakistan, many of whom are minors. We don't knowingly ask for or collect sensitive personal
    information from anyone, regardless of age. If you're a parent or guardian with a concern
    about your child's use of the site, contact us and we'll address it.</p>

    <h3 style="${H3}">6. Data security</h3>
    <p style="${LEGAL_P}">We take reasonable, standard precautions to protect the limited data
    we do handle. No website can guarantee perfect security, but we don't collect more than we
    need in the first place, which limits what there is to protect.</p>

    <h3 style="${H3}">7. Your choices</h3>
    <p style="${LEGAL_P}">You can browse and use almost the entire site without submitting any
    personal information at all — reviews and direct contact are optional. You can also use
    your browser's cookie settings or Google's Ad Settings to limit analytics/ad tracking.</p>

    <h3 style="${H3}">8. Changes to this policy</h3>
    <p style="${LEGAL_P}">If this policy changes in a meaningful way (for example, when
    advertising is added), we'll update the date at the top of this page.</p>

    <h3 style="${H3}">9. Contact us</h3>
    <p style="${LEGAL_P}">Questions about this policy or your data: email
    <a data-config="email" href="mailto:${siteConfig.email}">${siteConfig.email}</a>.</p>

    <p style="${LEGAL_P}font-size:13px;opacity:0.75;margin-top:32px;">This page is written to be
    genuinely clear and accurate about how this site works, but it isn't formal legal advice.
    If you rely on this site for a large-scale or commercial project, or need certainty about a
    specific country's data law, have it reviewed by a lawyer.</p>
  `);
}

function renderTerms(){
  renderLegalPage('Terms &amp; Conditions', 'July 2026', `
    <p style="${LEGAL_P}">By using LearnSphere Scholars, you agree to these terms. Please read
    them — they're short and written in plain language on purpose.</p>

    <h3 style="${H3}">1. What this site is (and isn't)</h3>
    <p style="${LEGAL_P}">LearnSphere Scholars is an independent, student-run educational
    resource. We are <strong>not officially affiliated with, endorsed by, or operated by</strong>
    FBISE, any provincial education board, PMC, NUMS, ECAT authorities, the College Board, or
    any scholarship provider listed on this site. Test names, board names, and scholarship
    names are used only to describe and organize the information we've gathered about them.</p>

    <h3 style="${H3}">2. Educational content</h3>
    <p style="${LEGAL_P}">Notes, textbooks, and past papers are shared to help with study and
    revision. We do our best to keep them accurate and current, but we can't guarantee every
    file is error-free, complete, or perfectly matches your specific board's current syllabus.
    For anything exam-critical — dates, syllabus changes, official past papers — always
    cross-check with your board or test authority's official website.</p>

    <h3 style="${H3}">3. The Study Assistant (AI chat)</h3>
    <p style="${LEGAL_P}">The chat feature is powered by AI and is meant to help you understand
    concepts and study more effectively. Like any AI tool, it can occasionally get things wrong
    or oversimplify. Don't treat its answers as an official or final source, especially for
    anything that affects your grades, exam eligibility, or applications.</p>

    <h3 style="${H3}">4. Reviews and content you submit</h3>
    <p style="${LEGAL_P}">If you leave a review, keep it honest and relevant. We may remove
    reviews that are spam, abusive, or clearly unrelated to the content they're posted under.</p>

    <h3 style="${H3}">5. External links</h3>
    <p style="${LEGAL_P}">Notes and past papers often link out to Google Drive, and scholarship
    listings link to external provider websites. We don't control these external sites and
    aren't responsible for their content, availability, or accuracy.</p>

    <h3 style="${H3}">6. Ownership</h3>
    <p style="${LEGAL_P}">The site's design, layout, and original written content belong to
    LearnSphere Scholars. Textbooks, past papers, and syllabus materials remain the property of
    their original publishers/boards — we're organizing and sharing access to them for
    non-commercial study purposes, not claiming authorship.</p>

    <h3 style="${H3}">7. No guarantees</h3>
    <p style="${LEGAL_P}">Using this site doesn't guarantee any particular exam result,
    admission, or scholarship outcome. It's a study aid, not a promise.</p>

    <h3 style="${H3}">8. Limitation of liability</h3>
    <p style="${LEGAL_P}">The site is provided "as is," free of charge. To the extent permitted
    by law, LearnSphere Scholars isn't liable for any loss or damage arising from your use of
    the site, including reliance on any content, past paper, or AI-generated answer found here.</p>

    <h3 style="${H3}">9. Changes to these terms</h3>
    <p style="${LEGAL_P}">We may update these terms as the site grows. Continued use after an
    update means you accept the revised terms.</p>

    <h3 style="${H3}">10. Contact us</h3>
    <p style="${LEGAL_P}">Questions about these terms: email
    <a data-config="email" href="mailto:${siteConfig.email}">${siteConfig.email}</a>.</p>

    <p style="${LEGAL_P}font-size:13px;opacity:0.75;margin-top:32px;">This page is a genuine,
    tailored starting point for this site, not formal legal advice. If the site grows into a
    larger or commercial operation, have these terms reviewed by a lawyer familiar with your
    jurisdiction.</p>
  `);
}

function renderAbout(){
  renderLegalPage('About LearnSphere Scholars', '', `
    <p style="${LEGAL_P}">LearnSphere Scholars started with a simple frustration: good study
    notes, real past papers, and scholarship information for Pakistani students are scattered
    across dozens of Facebook groups, WhatsApp forwards, and half-broken websites — hard to
    find and harder to trust. This site puts it in one place, organized, and free.</p>

    <p style="${LEGAL_P}">It's built and run independently by students, not by a government
    body, testing authority, or university — see our <a href="/terms">Terms</a> for the full
    independence disclaimer.</p>

    <h3 style="${H3}">What's here</h3>
    <p style="${LEGAL_P}">Board exam notes, textbooks, and past papers for FBISE, Balochistan,
    Sindh, Punjab, KPK, and AJK boards. Test dates and prep info for MDCAT, ECAT, NET, SAT, and
    LAT. Domestic and international scholarships. And a Study Assistant to help explain
    concepts along the way.</p>

    <h3 style="${H3}">Why it's free</h3>
    <p style="${LEGAL_P}">Because the students who'd benefit most from organized study material
    are often the ones least able to pay for it. That's not changing.</p>

    <h3 style="${H3}">Get in touch</h3>
    <p style="${LEGAL_P}">Questions, corrections, or something you'd like to see added? Visit
    our <a href="/contact">Contact page</a> — we read every message.</p>
  `);
}

function renderContact(){
  app.innerHTML = `
    <section class="section text-center">
      <div class="container" style="max-width:560px;">
        <h2 style="font-family:var(--font-display);font-size:36px;margin-bottom:12px;">Get in touch</h2>
        <p style="color:var(--ink-soft);margin-bottom:32px;">Questions, corrections, broken
        links, or something you'd like to see added — we read everything.</p>

        <div style="display:flex;flex-direction:column;gap:16px;align-items:center;">
          <a data-config="email" href="mailto:${siteConfig.email}" class="btn btn-primary" style="min-width:220px;">${siteConfig.email}</a>
          <a href="${siteConfig.instagramLink}" target="_blank" rel="noopener" style="color:var(--ink-soft);">Message us on Instagram</a>
          <a href="${siteConfig.whatsappChannel}" target="_blank" rel="noopener" style="color:var(--ink-soft);">Follow our WhatsApp Channel</a>
        </div>
      </div>
    </section>
  `;
}

/* ---------------------------------------------------------------------------
   Router
   ------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
   Embedded document viewer — keeps students on-site instead of bouncing to
   Google Drive for every note/textbook/past paper.
   ------------------------------------------------------------------------- */
function toEmbedUrl(url){
  // Handles Drive, Docs, Sheets and Slides links — all of them support a
  // /preview path that's embeddable in an iframe. Anything else is passed
  // through as-is (works for direct PDF links; the "Open in new tab"
  // button in the viewer is the fallback if a host blocks embedding).
  const match = url.match(/^(https:\/\/(?:docs|drive)\.google\.com\/[a-z]+\/d\/[a-zA-Z0-9_-]+)/);
  return match ? `${match[1]}/preview` : url;
}

let docViewerTrigger = null;

function openDocViewer(url, title){
  const overlay = document.getElementById('doc-viewer');
  if (!overlay) return;
  overlay.innerHTML = `
    <div class="doc-viewer-backdrop"></div>
    <div class="doc-viewer-panel">
      <div class="doc-viewer-header">
        <span class="doc-viewer-title">${esc(title || 'Document')}</span>
        <div class="doc-viewer-actions">
          <a href="${esc(url)}" target="_blank" rel="noopener" class="doc-viewer-open">Open in new tab ${icon('external')}</a>
          <button class="doc-viewer-close" aria-label="Close viewer">&times;</button>
        </div>
      </div>
      <iframe src="${esc(toEmbedUrl(url))}" class="doc-viewer-frame" allow="autoplay" loading="lazy" title="${esc(title || 'Document preview')}"></iframe>
    </div>`;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.doc-viewer-backdrop').addEventListener('click', closeDocViewer);
  overlay.querySelector('.doc-viewer-close').addEventListener('click', closeDocViewer);
  overlay.querySelector('.doc-viewer-close').focus();
}

function closeDocViewer(){
  const overlay = document.getElementById('doc-viewer');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.innerHTML = '';
  document.body.style.overflow = '';
  if (docViewerTrigger){ docViewerTrigger.focus(); docViewerTrigger = null; }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('.js-doc-link');
  if (!link) return;
  e.preventDefault();
  docViewerTrigger = link;
  openDocViewer(link.getAttribute('href'), link.dataset.docTitle);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeDocViewer();
});

/* ---------------------------------------------------------------------------
   Reviews — star rating + comments, shown at the bottom of every page
   ------------------------------------------------------------------------- */
function starIcons(filled, total = 5){
  let out = '';
  for (let i = 1; i <= total; i++){
    out += `<span class="star${i <= filled ? ' filled' : ''}">★</span>`;
  }
  return out;
}

function renderReviewsWidget(pathname){
  const widget = document.getElementById('reviews-widget');
  if (!widget) return;

  const reviews = live.reviews[pathname] || [];
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const notConfigured = !reviewsConfig.csvUrl || !reviewsConfig.formActionUrl;

  const listHtml = count
    ? reviews.slice().reverse().map(r => `
        <div class="review-item">
          <div class="review-item-top">
            <span class="review-stars">${starIcons(r.rating)}</span>
            <span class="review-name">${esc(r.name)}</span>
          </div>
          ${r.comment ? `<p class="review-comment">${esc(r.comment)}</p>` : ''}
        </div>`).join('')
    : `<p class="review-empty">No reviews yet for this page — be the first to rate it.</p>`;

  widget.innerHTML = `
    <div class="container reviews-inner">
      <h3 class="reviews-heading">Rate this page</h3>
      ${count ? `
        <div class="reviews-summary">
          <span class="reviews-avg">${avg.toFixed(1)}</span>
          <span class="review-stars">${starIcons(Math.round(avg))}</span>
          <span class="reviews-count">${count} review${count === 1 ? '' : 's'}</span>
        </div>` : ''}

      ${notConfigured ? `<div class="owner-note">Reviews aren't connected yet — see REVIEWS-SETUP.md to wire up the Google Form + Sheet.</div>` : ''}

      <form id="review-form" class="review-form">
        <div class="review-star-picker" id="review-star-picker" data-value="0">
          ${[1,2,3,4,5].map(i => `<span class="star-pick" data-star="${i}">★</span>`).join('')}
        </div>
        <input type="text" name="name" placeholder="Your name (optional)" class="review-input" maxlength="60">
        <textarea name="comment" placeholder="Share your thoughts (optional)" class="review-textarea" maxlength="500" rows="3"></textarea>
        <button type="submit" class="btn btn-gold" ${notConfigured ? 'disabled' : ''}>Submit Review</button>
        <p id="review-msg" class="review-msg" aria-live="polite"></p>
      </form>

      <div class="review-list">${listHtml}</div>
    </div>`;

  const picker = document.getElementById('review-star-picker');
  const stars = picker.querySelectorAll('.star-pick');
  stars.forEach(s => {
    s.addEventListener('click', () => {
      const val = parseInt(s.dataset.star, 10);
      picker.dataset.value = val;
      stars.forEach(st => st.classList.toggle('picked', parseInt(st.dataset.star, 10) <= val));
    });
  });

  const form = document.getElementById('review-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('review-msg');
    if (notConfigured){
      msg.textContent = 'Reviews aren\u2019t connected yet — see REVIEWS-SETUP.md.';
      msg.className = 'review-msg review-msg-error';
      return;
    }
    const rating = parseInt(picker.dataset.value, 10);
    if (!rating){
      msg.textContent = 'Please pick a star rating first.';
      msg.className = 'review-msg review-msg-error';
      return;
    }
    const name = form.name.value.trim();
    const comment = form.comment.value.trim();

    submitReview(pathname, rating, name, comment);

    // Show it right away — the Sheet/CSV can take a minute to catch up,
    // so don't make the student wait to see their own review appear.
    if (!live.reviews[pathname]) live.reviews[pathname] = [];
    live.reviews[pathname].push({ rating, name: name || 'Anonymous', comment });
    renderReviewsWidget(pathname);

    const freshMsg = document.getElementById('review-msg');
    if (freshMsg){
      freshMsg.textContent = 'Thanks for your review!';
      freshMsg.className = 'review-msg review-msg-ok';
    }
  });
}

// Submits to the Google Form via a hidden iframe so the page never
// navigates away or shows Google's own confirmation screen.
function submitReview(page, rating, name, comment){
  let iframe = document.getElementById('review-submit-frame');
  if (!iframe){
    iframe = document.createElement('iframe');
    iframe.id = 'review-submit-frame';
    iframe.name = 'review-submit-frame';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }

  const form = document.createElement('form');
  form.action = reviewsConfig.formActionUrl;
  form.method = 'POST';
  form.target = 'review-submit-frame';
  form.style.display = 'none';

  const fields = { page, rating, name, comment };
  Object.keys(fields).forEach(key => {
    const entryId = reviewsConfig.entryIds[key];
    if (!entryId) return;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = entryId;
    input.value = fields[key];
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

/* ---------------------------------------------------------------------------
   AI Chat Assistant — floating widget, talks to /.netlify/functions/chat
   (a serverless function that calls the Gemini API server-side, so no API
   key is ever exposed in this front-end code). See CHATBOT-SETUP.md.
   ------------------------------------------------------------------------- */
const chatState = {
  open: false,
  loading: false,
  history: [], // { role: 'user' | 'assistant', content: string }
};

function initChatWidget(){
  const mount = document.getElementById('ai-chat');
  if (!mount) return;

  mount.innerHTML = `
    <button id="chat-toggle" class="chat-toggle" aria-label="Open AI study assistant">
      <span class="chat-toggle-icon">💬</span>
    </button>
    <div id="chat-panel" class="chat-panel">
      <div class="chat-panel-header">
        <span>Study Assistant</span>
        <button id="chat-close" class="chat-close" aria-label="Close chat">&times;</button>
      </div>
      <div id="chat-messages" class="chat-messages" role="log" aria-live="polite">
        <div class="chat-msg chat-msg-assistant">
          Hi! I'm the LearnSphere Scholars study assistant. Ask me anything — board exams, entry tests, scholarships, or any subject you're studying.
        </div>
      </div>
      <form id="chat-form" class="chat-form">
        <input id="chat-input" type="text" placeholder="Type your question…" autocomplete="off" maxlength="1000">
        <button type="submit" class="chat-send" aria-label="Send">${icon('arrow')}</button>
      </form>
    </div>`;

  document.getElementById('chat-toggle').addEventListener('click', () => setChatOpen(true));
  document.getElementById('chat-close').addEventListener('click', () => setChatOpen(false));
  document.getElementById('chat-form').addEventListener('submit', handleChatSubmit);
}

function setChatOpen(open){
  chatState.open = open;
  const panel = document.getElementById('chat-panel');
  const toggle = document.getElementById('chat-toggle');
  if (panel) panel.classList.toggle('open', open);
  if (toggle) toggle.classList.toggle('hidden', open);
  if (open){
    const input = document.getElementById('chat-input');
    if (input) input.focus();
  } else if (toggle){
    toggle.focus();
  }
}

function appendChatMessage(role, text){
  const messages = document.getElementById('chat-messages');
  if (!messages) return;
  const div = document.createElement('div');
  div.className = `chat-msg chat-msg-${role}`;
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

async function handleChatSubmit(e){
  e.preventDefault();
  if (chatState.loading) return;

  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  appendChatMessage('user', text);
  chatState.history.push({ role: 'user', content: text });

  chatState.loading = true;
  appendChatMessage('assistant', 'Thinking…');

  try{
    const res = await fetch('/.netlify/functions/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatState.history }),
    });
    const data = await res.json();

    // Remove the "Thinking…" placeholder.
    const messages = document.getElementById('chat-messages');
    if (messages && messages.lastChild) messages.removeChild(messages.lastChild);

    if (!res.ok || !data.reply){
      appendChatMessage('assistant', 'Sorry, something went wrong. Please try again in a moment.');
      console.error('Chat error', data);
    } else {
      appendChatMessage('assistant', data.reply);
      chatState.history.push({ role: 'assistant', content: data.reply });
    }
  } catch(err){
    const messages = document.getElementById('chat-messages');
    if (messages && messages.lastChild) messages.removeChild(messages.lastChild);
    appendChatMessage('assistant', 'Sorry, I couldn\u2019t connect. Check your internet connection and try again.');
    console.error('Chat fetch failed', err);
  } finally {
    chatState.loading = false;
  }
}

function updateActiveNav(pathname){
  document.querySelectorAll('.nav-links a[data-nav]').forEach(a => {
    a.classList.toggle('active', a.dataset.nav === pathname.split('/')[1]);
  });
}

// Updates <title> and the meta description for the current page — search
// engines and shared links use these, and they should be different for
// every page rather than one generic title site-wide.
function setMeta(title, description){
  document.title = title ? `${title} | ${siteConfig.siteName}` : siteConfig.siteName;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && description) metaDesc.setAttribute('content', description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', location.origin + location.pathname);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', document.title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && description) ogDesc.setAttribute('content', description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', location.origin + location.pathname);
}

/* ---------------------------------------------------------------------------
   Scroll reveal — subtle fade/rise for card grids as they enter view.
   Skips anything already visible on load and respects reduced-motion via
   the CSS media query (the .reveal class itself becomes a no-op then).
   ------------------------------------------------------------------------- */
const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  : null;

function initReveals(){
  if (!revealObserver) return;
  const targets = app.querySelectorAll('.grid > .card, .cta-band, .stat-row');
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${Math.min(i * 40, 240)}ms`;
    revealObserver.observe(el);
  });
}

function route(){
  const pathname = location.pathname;
  const parts = pathname.split('/').filter(Boolean);

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  updateActiveNav(pathname);

  const navLinks = document.getElementById('nav-links');
  if (navLinks) navLinks.classList.remove('open');
  const navToggle = document.getElementById('nav-toggle');
  if (navToggle) navToggle.setAttribute('aria-expanded', 'false');

  if (parts.length === 0){
    setMeta('', siteConfig.tagline);
    renderHome();
  } else if (parts[0] === 'boards' && parts.length === 1){
    setMeta('Boards', 'Notes, textbooks and past papers for FBISE, Balochistan, Sindh, Punjab, KPK and AJK boards.');
    renderBoardsOverview();
  } else if (parts[0] === 'boards' && parts.length === 2){
    const b = boardsData[parts[1]];
    setMeta(b ? b.name : 'Board', b ? `Notes, textbooks and past papers for ${b.fullName}.` : '');
    renderBoardDetail(parts[1]);
  } else if (parts[0] === 'entry-tests' && parts.length === 1){
    setMeta('Entry Tests', 'Test dates, past papers and full details for MDCAT, ECAT, NET, SAT and LAT.');
    renderTestsOverview();
  } else if (parts[0] === 'entry-tests' && parts.length === 2){
    const t = testsData[parts[1]];
    setMeta(t ? t.name : 'Entry Test', t ? `${t.fullName} — test dates, past papers and full details.` : '');
    renderTestDetail(parts[1]);
  } else if (parts[0] === 'scholarships' && parts.length === 1){
    setMeta('Scholarships', 'Domestic and international scholarships for Pakistani students.');
    renderScholarshipsOverview();
  } else if (parts[0] === 'scholarships' && parts.length === 2){
    const isDomestic = parts[1] === 'domestic';
    setMeta(isDomestic ? 'Domestic Scholarships' : 'International Scholarships',
      isDomestic ? 'Government and provincial scholarships for students studying in Pakistan.' : 'Fully funded and partial scholarships to study abroad.');
    renderScholarshipList(parts[1]);
  } else if (parts[0] === 'privacy' && parts.length === 1){
    setMeta('Privacy Policy', 'How LearnSphere Scholars collects and uses information.');
    renderPrivacyPolicy();
  } else if (parts[0] === 'terms' && parts.length === 1){
    setMeta('Terms & Conditions', 'Terms of use for LearnSphere Scholars.');
    renderTerms();
  } else if (parts[0] === 'about' && parts.length === 1){
    setMeta('About', 'What LearnSphere Scholars is, and who it\'s built by.');
    renderAbout();
  } else if (parts[0] === 'contact' && parts.length === 1){
    setMeta('Contact', 'Get in touch with LearnSphere Scholars.');
    renderContact();
  } else if (parts[0] === 'admin'){
    renderAdmin();
  } else {
    setMeta('Page Not Found', '');
    renderNotFound();
  }

  const isAdminOrNotFound = parts[0] === 'admin' || (parts[0] && !['boards','entry-tests','scholarships'].includes(parts[0]));
  const reviewsWidget = document.getElementById('reviews-widget');
  if (reviewsWidget){
    if (isAdminOrNotFound) reviewsWidget.innerHTML = '';
    else renderReviewsWidget(pathname);
  }

  initReveals();
}

// Intercepts clicks on same-origin links so navigation updates the URL
// via pushState instead of reloading the page — this is what makes it a
// single-page app while still giving every page its own real, indexable URL.
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  if (link.target === '_blank' || link.hasAttribute('download')) return;
  const href = link.getAttribute('href') || '';
  if (!href.startsWith('/')) return; // external links, mailto:, #anchors, etc. pass through normally
  e.preventDefault();
  if (href !== location.pathname){
    history.pushState({}, '', href);
    route();
  }
});

/* ---------------------------------------------------------------------------
   Cookie consent banner — shown once until the visitor picks Accept or
   Decline. Analytics only actually loads after Accept (or immediately on a
   later visit if they already accepted before). See window.__loadAnalytics
   in index.html's <head> for the loader itself.
   ------------------------------------------------------------------------- */
function initCookieBanner(){
  let consent = null;
  try { consent = localStorage.getItem('cookie-consent'); } catch { /* storage blocked — treat as no decision yet */ }

  if (consent === 'accepted'){
    if (window.__loadAnalytics) window.__loadAnalytics();
    return;
  }
  if (consent === 'declined') return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie notice');
  banner.innerHTML = `
    <p>We use cookies to understand how the site is used and to improve it.
    See our <a href="/privacy">Privacy Policy</a> for details.</p>
    <div class="cookie-banner-actions">
      <button class="cookie-banner-btn" type="button" data-action="decline">Decline</button>
      <button class="cookie-banner-btn accept" type="button" data-action="accept">Accept</button>
    </div>
  `;
  document.body.appendChild(banner);

  banner.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const accepted = btn.dataset.action === 'accept';
    try { localStorage.setItem('cookie-consent', accepted ? 'accepted' : 'declined'); } catch { /* storage blocked — banner will just show again next visit */ }
    if (accepted && window.__loadAnalytics) window.__loadAnalytics();
    banner.remove();
  });
}

window.addEventListener('popstate', route);
window.addEventListener('DOMContentLoaded', async () => {
  document.querySelectorAll('[data-config]').forEach(el => {
    const key = el.dataset.config;
    if (key === 'email'){ el.textContent = siteConfig.email; el.href = `mailto:${siteConfig.email}`; }
    if (key === 'instagram'){ el.textContent = `@${siteConfig.instagram}`; el.href = siteConfig.instagramLink; }
    if (key === 'whatsapp'){ el.href = siteConfig.whatsappChannel; }
    if (key === 'app'){
      const cta = appCta('Download App');
      el.href = cta.href;
      el.textContent = cta.label;
      if (siteConfig.appComingSoon){ el.target = '_blank'; el.rel = 'noopener'; }
    }
    if (key === 'sitename'){ el.textContent = siteConfig.siteName; }
    if (key === 'tagline'){ el.textContent = siteConfig.tagline; }
  });

  const toggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggle && navLinks){
    toggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  initChatWidget();
  initCookieBanner();

  // Show pages immediately with whatever we have (static skeleton), then
  // load live Sheet content and re-render once it's in.
  route();
  await Promise.all([loadAllSheets(), loadReviews()]);
  route();
});
