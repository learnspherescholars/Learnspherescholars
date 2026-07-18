/* ============================================================================
   LearnSphere Scholars — CONTENT FILE
   ============================================================================
   TWO kinds of content now:

   1. STATIC INFO below (board names, test descriptions, scholarship
      categories) — this rarely changes. Edit it here in data.js if it does.

   2. LIVE POSTS (notes, textbooks, past papers, test dates, past tests,
      scholarship listings) — these now come from your GOOGLE SHEET, not
      from this file. Add a row to the Sheet and it appears on the site —
      no code editing, no re-uploading needed.

   Full setup instructions: GOOGLE-SHEET-SETUP.md
   ========================================================================== */

// ---------------------------------------------------------------------------
// SITE-WIDE SETTINGS
// ---------------------------------------------------------------------------
const siteConfig = {
  siteName: "LearnSphere Scholars",
  tagline: "From board exams to global scholarships — one roll number away.",
  email: "info@learnspherescholars.org",
  instagram: "LearnSphereScholars",
  instagramLink: "https://instagram.com/LearnSphereScholars",
  whatsappChannel: "https://whatsapp.com/channel/0029Vb8JxLpDuMRpR7kvx81J",
  // Update this once your app is live on the Play Store / App Store.
  appDownloadLink: "#download",
  // While true, every "Download App" button on the site shows a
  // "Coming Soon" badge and links to the WhatsApp channel instead (so
  // people can still get notified). Set this to false once the app is
  // live and appDownloadLink points to the real store link.
  appComingSoon: true,
  // How many chapters of notes are shown free per subject on the website
  // before students are prompted to get the App for the rest.
  freeChaptersPerSubject: 2,
};

// Reference list of subjects used across boards (for your own notes when
// filling in the Google Sheet — not required by the code).
const boardSubjects = [
  "Physics", "Chemistry", "Biology", "Mathematics", "Computer Science",
  "English", "Urdu", "Islamiat", "Pakistan Studies",
];

// ---------------------------------------------------------------------------
// GOOGLE SHEET — where your live content is pulled from
// ---------------------------------------------------------------------------
// Everything (boards, tests, scholarships) lives in ONE sheet tab, so there's
// only one link to manage. This is already pointed at the sheet Claude
// created for you — you only need to change it if you make a new sheet.
const sheetConfig = {
  contentCsvUrl: "https://docs.google.com/spreadsheets/d/1LhSYDv6vtPExIXpBNd_KXENW7D2FY7muZ9nd9lrtfgY/gviz/tq?tqx=out:csv",
};

// ---------------------------------------------------------------------------
// ADMIN PANEL — a hidden page only you know the address of, for posting
// notes, textbooks, past papers, test dates and scholarships without
// opening the Sheet directly. Not shown anywhere on the public site.
// ---------------------------------------------------------------------------
// IMPORTANT: this is a hidden page, not a secure one — anyone who guesses
// or is given the passcode can post content. Don't reuse an important
// password here, and see ADMIN-SETUP.md for the honest limitations.
const adminConfig = {
  passcode: "changeme123",   // change this to your own passcode
  // Paste the "Send form" links of the 3 Google Forms you create — see
  // ADMIN-SETUP.md. Leave blank and the admin page will tell you what's missing.
  boardsFormUrl: "",
  testsFormUrl: "",
  scholarshipsFormUrl: "",
  // Link straight to your Google Sheet for full manual control.
  sheetUrl: "",
};

// ---------------------------------------------------------------------------
// REVIEWS — star ratings + comments, shown at the bottom of every page.
// Uses the same Google Form → Sheet → CSV pattern as everything else.
// Full setup instructions: REVIEWS-SETUP.md
// ---------------------------------------------------------------------------
const reviewsConfig = {
  // The published CSV link of your Reviews response sheet tab.
  csvUrl: "https://docs.google.com/spreadsheets/d/18vDwmDJEnj2BOxnYTEf9x8Ndrq94q99z5x2MDmOmC1U/export?format=csv&gid=0",
  // Your "Submit a Review" Google Form's formResponse URL (ends in /formResponse).
  formActionUrl: "https://docs.google.com/forms/d/e/1FAIpQLSfuRcsIbKbAZnUuXVEJjfjQQ_CjJDBRyB6utbzkIPQtpLxy9w/formResponse",
  // The entry.XXXXXXXXX field IDs for each question on that form.
  entryIds: {
    page: "entry.1658715306",
    rating: "entry.1693412256",
    name: "entry.1194962613",
    comment: "entry.424909386",
  },
};

// ---------------------------------------------------------------------------
// SECTION 1 — BOARDS (static info only — the slug on the left, e.g. "fbise",
// MUST exactly match the "board" column you use in the Google Sheet)
// ---------------------------------------------------------------------------
const boardsData = {
  fbise: {
    name: "FBISE",
    fullName: "Federal Board of Intermediate & Secondary Education",
    region: "Islamabad & Federal Territories",
    logo: "assets/logos/fbise.jpg",
    badge: { initials: "FB", color: "#1e3a5f" },
  },
  balochistan: {
    name: "Balochistan Board",
    fullName: "BISE Balochistan (Quetta)",
    region: "Balochistan",
    logo: "assets/logos/balochistan.jpg",
    badge: { initials: "BB", color: "#8a4b2e" },
  },
  sindh: {
    name: "Sindh Board",
    fullName: "BISE Sindh (Karachi, Hyderabad & regional boards)",
    region: "Sindh",
    logo: "assets/logos/sindh.jpg",
    badge: { initials: "SB", color: "#2e6b5e" },
  },
  punjab: {
    name: "Punjab Boards",
    fullName: "BISE Lahore, Multan, Rawalpindi & other Punjab boards",
    region: "Punjab",
    logo: "assets/logos/punjab.png",
    badge: { initials: "PB", color: "#1f6f3f" },
  },
  kpk: {
    name: "KPK Board",
    fullName: "BISE Peshawar, Swat, Mardan, Kohat, Bannu, D.I. Khan, Abbottabad & Malakand",
    region: "Khyber Pakhtunkhwa",
    logo: "assets/logos/kpk.jpg",
    badge: { initials: "KP", color: "#7a3b5e" },
  },
  ajk: {
    name: "AJK Board",
    fullName: "BISE Azad Jammu & Kashmir (Mirpur)",
    region: "Azad Jammu & Kashmir",
    logo: "assets/logos/ajk.jpg",
    badge: { initials: "AJK", color: "#2e5090" },
  },
};

// ---------------------------------------------------------------------------
// SECTION 2 — ENTRY TESTS (static info only — the slug on the left, e.g.
// "mdcat", MUST exactly match the "test" column in the Google Sheet)
// ---------------------------------------------------------------------------
const testsData = {
  mdcat: {
    name: "MDCAT",
    fullName: "Medical & Dental College Admission Test",
    conductedBy: "Pakistan Medical & Dental Council (PMDC)",
    officialSite: "https://pmdc.pk",
    logo: "assets/logos/mdcat.png",
    badge: { initials: "MD", color: "#a13d3d" },
    about:
      "MDCAT is Pakistan's national entry test for admission to MBBS and BDS programmes. " +
      "It is a paper-based, 180-MCQ test in English covering Biology, Chemistry, Physics and " +
      "English, with no negative marking. Around 200,000 students sit the test each year for " +
      "roughly 4,000 MBBS seats nationwide.",
    quickFacts: [
      { label: "Format", value: "180 MCQs, paper-based (OMR), 3 hours" },
      { label: "Subjects", value: "Biology 45% · Chemistry 25% · Physics 20% · English 10%" },
      { label: "Negative marking", value: "None" },
      { label: "Passing marks", value: "55% for MBBS, 50% for BDS" },
    ],
  },
  ecat: {
    name: "ECAT",
    fullName: "Engineering College Admission Test",
    conductedBy: "University of Engineering & Technology (UET), Lahore",
    officialSite: "https://ecat.uet.edu.pk",
    logo: "assets/logos/ecat.jpg",
    badge: { initials: "EC", color: "#2e5090" },
    about:
      "ECAT is the mandatory entry test for admission to public and private engineering " +
      "universities across Punjab, including UET Lahore and its campuses. It is a 100-MCQ, " +
      "computer-based test covering Maths/Biology, Physics, and Chemistry/Computer " +
      "Science/Statistics, plus English, with no negative marking.",
    quickFacts: [
      { label: "Format", value: "100 MCQs, computer-based test (CBT), 100 minutes" },
      { label: "Negative marking", value: "None — every correct answer earns marks" },
      { label: "Merit formula", value: "FSc 50% + best ECAT score 40% + Matric 10%" },
      { label: "Attempts", value: "Best score of Phase 1 & Phase 2 is used" },
    ],
  },
  net: {
    name: "NET",
    fullName: "NUST Entry Test",
    conductedBy: "National University of Sciences & Technology (NUST)",
    officialSite: "https://nust.edu.pk",
    logo: "assets/logos/net.png",
    badge: { initials: "NT", color: "#1f6f3f" },
    about:
      "NET is NUST's own admission test, required for undergraduate admission to NUST and its " +
      "constituent colleges across engineering, computing, business and social sciences. It is " +
      "offered in multiple sessions and can usually be taken more than once, with the best score " +
      "counted toward merit.",
    quickFacts: [
      { label: "Format", value: "Computer-based test, subject-specific (engineering / pre-medical / social sciences / business)" },
      { label: "Sessions", value: "Multiple NET sessions are usually held across the year" },
      { label: "Attempts", value: "Best score across sessions is generally considered" },
    ],
  },
  sat: {
    name: "SAT",
    fullName: "Scholastic Assessment Test",
    conductedBy: "College Board (USA)",
    officialSite: "https://satsuite.collegeboard.org",
    logo: "assets/logos/sat.jpg",
    badge: { initials: "SAT", color: "#1e3a5f" },
    about:
      "The SAT is an internationally recognised standardised test used by universities abroad — " +
      "especially in the USA — for undergraduate admissions and merit scholarships. It is now a " +
      "digital, adaptive test covering Reading & Writing and Math, and many Pakistani students " +
      "take it alongside board exams to widen their scholarship options.",
    quickFacts: [
      { label: "Format", value: "Digital adaptive test — Reading & Writing + Math" },
      { label: "Duration", value: "Approx. 2 hours 14 minutes" },
      { label: "Score range", value: "400–1600" },
      { label: "Used for", value: "Admissions & merit scholarships at universities abroad" },
    ],
  },
  lat: {
    name: "LAT",
    fullName: "Law Admission Test",
    conductedBy: "Higher Education Commission (HEC), Pakistan",
    officialSite: "https://hec.gov.pk",
    logo: "assets/logos/lat.png",
    badge: { initials: "LAT", color: "#7a3b5e" },
    about:
      "LAT is mandatory for admission to LLB / BA-LLB programmes at law colleges and " +
      "universities recognised by the Pakistan Bar Council. It tests English, general knowledge, " +
      "analytical reasoning and legal aptitude, and is generally required before applying to any " +
      "law programme in Pakistan.",
    quickFacts: [
      { label: "Format", value: "MCQ-based test — English, general knowledge & analytical reasoning" },
      { label: "Required for", value: "Admission to LLB / BA-LLB programmes nationwide" },
      { label: "Conducted by", value: "HEC-authorised testing bodies (varies by year)" },
    ],
  },
};

// ---------------------------------------------------------------------------
// SUBJECT ICONS — used to give each subject group in the Textbooks/Books
// view a distinct visual identity. Matching is case-insensitive and by
// substring, so "Physics", "physics 1st year" etc. all match "physics".
// Anything that doesn't match falls back to the "General" entry.
// ---------------------------------------------------------------------------
const subjectIcons = {
  physics:            { icon: "atom",     color: "#2e5090" },
  chemistry:           { icon: "flask",    color: "#1f6f3f" },
  biology:             { icon: "leaf",     color: "#2e6b5e" },
  math:                { icon: "compass",  color: "#a13d3d" },
  english:             { icon: "book",     color: "#7a3b5e" },
  urdu:                { icon: "book",     color: "#8a4b2e" },
  islam:               { icon: "star",     color: "#1e3a5f" },
  "pakistan studies":  { icon: "map",      color: "#1f6f3f" },
  "computer science":  { icon: "chip",     color: "#2e5090" },
  statistics:          { icon: "chart",    color: "#a13d3d" },
  general:             { icon: "book",     color: "#4a4a4a" },
};

// Generic badge for the Scholarships section (no single institution to
// represent, so this is one consistent icon+color for the whole section).
const scholarshipsBadge = { icon: "gradcap", color: "#8a4b2e" };
