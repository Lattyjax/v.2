// ── Seed data + constants for the Latimore Content Repository ──

const UTM_SOURCES = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "email", label: "Email" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "sms", label: "SMS / Text" },
  { id: "qr", label: "QR Code (print)" },
  { id: "google", label: "Google Ads" },
];

const UTM_MEDIUMS = [
  { id: "social", label: "social" },
  { id: "email", label: "email" },
  { id: "cpc", label: "cpc" },
  { id: "referral", label: "referral" },
  { id: "qr", label: "qr" },
  { id: "banner", label: "banner" },
  { id: "organic", label: "organic" },
];

// Destinations on the Latimore site (custom CMS sections)
const DESTINATIONS = [
  { id: "blog", label: "The Beat — Blog", path: "/blog" },
  { id: "education", label: "Education Center", path: "/education" },
  { id: "resources", label: "Resources Library", path: "/resources" },
  { id: "newsletter", label: "Newsletter Archive", path: "/newsletter" },
];

const CAMPAIGNS = [
  { id: "medicare-aep-2026", label: "Medicare AEP 2026", topic: "medicare", count: 6 },
  { id: "iul-awareness-2026", label: "IUL Awareness 2026", topic: "iul", count: 4 },
  { id: "final-expense-q2", label: "Final Expense Q2", topic: "final-expense", count: 3 },
  { id: "beat-goes-on-series", label: "#TheBeatGoesOn Series", topic: "brand", count: 5 },
  { id: "living-benefits-2026", label: "Living Benefits 2026", topic: "living-benefits", count: 2 },
];

const TYPES = {
  link: { label: "Link", color: "navy" },
  pdf: { label: "PDF", color: "rust" },
  doc: { label: "Doc", color: "gold" },
  video: { label: "Video", color: "teal" },
};

function buildUrl(base, utm) {
  try {
    const u = new URL(base);
    const keys = ["source", "medium", "campaign", "content"];
    keys.forEach((k) => {
      if (utm[k]) u.searchParams.set("utm_" + k, utm[k]);
    });
    return u.toString();
  } catch (e) {
    const params = ["source", "medium", "campaign", "content"]
      .filter((k) => utm[k])
      .map((k) => `utm_${k}=${encodeURIComponent(utm[k])}`)
      .join("&");
    return base + (params ? (base.includes("?") ? "&" : "?") + params : "");
  }
}

// Auto-generate a consistent kebab campaign name
function autoCampaign(topic, source) {
  const q = "q" + (Math.floor(new Date(2026, 4, 1).getMonth() / 3) + 1);
  const seed = (topic || "general").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const src = (source || "web").toLowerCase();
  return `latimore-${seed}-${src}-2026`;
}

const SEED = [
  {
    id: "r1",
    title: "Understanding Medicare Advantage vs. Original Medicare",
    type: "link",
    source: "https://www.medicare.gov/basics/get-started-with-medicare",
    domain: "medicare.gov",
    campaign: "medicare-aep-2026",
    utm: { source: "facebook", medium: "social", campaign: "medicare-aep-2026", content: "carousel-1" },
    destination: "education",
    status: "published",
    date: "2026-05-28",
    by: "Jackson L.",
  },
  {
    id: "r2",
    title: "2026 Final Expense Planning Guide",
    type: "pdf",
    source: "Final-Expense-Guide-2026.pdf",
    domain: "Uploaded · 2.4 MB",
    campaign: "final-expense-q2",
    utm: { source: "email", medium: "email", campaign: "final-expense-q2", content: "newsletter-cta" },
    destination: "resources",
    status: "published",
    date: "2026-05-22",
    by: "Tasha R.",
  },
  {
    id: "r3",
    title: "How Indexed Universal Life Builds Tax-Free Income",
    type: "video",
    source: "https://youtu.be/iul-explained-2026",
    domain: "youtube.com",
    campaign: "iul-awareness-2026",
    utm: { source: "youtube", medium: "social", campaign: "iul-awareness-2026", content: "pinned-desc" },
    destination: "blog",
    status: "published",
    date: "2026-05-19",
    by: "Jackson L.",
  },
  {
    id: "r4",
    title: "Living Benefits: Accessing Your Policy While You're Alive",
    type: "doc",
    source: "Living-Benefits-Explainer.docx",
    domain: "Uploaded · 88 KB",
    campaign: "living-benefits-2026",
    utm: { source: "instagram", medium: "social", campaign: "living-benefits-2026", content: "story-swipe" },
    destination: "education",
    status: "draft",
    date: "2026-06-01",
    by: "Tasha R.",
  },
  {
    id: "r5",
    title: "#TheBeatGoesOn — Why We Do This Work",
    type: "video",
    source: "https://vimeo.com/latimore/the-beat-goes-on",
    domain: "vimeo.com",
    campaign: "beat-goes-on-series",
    utm: { source: "instagram", medium: "social", campaign: "beat-goes-on-series", content: "reel-03" },
    destination: "blog",
    status: "published",
    date: "2026-05-12",
    by: "Jackson L.",
  },
  {
    id: "r6",
    title: "Medicare Annual Enrollment Checklist (Printable)",
    type: "pdf",
    source: "AEP-Checklist-2026.pdf",
    domain: "Uploaded · 640 KB",
    campaign: "medicare-aep-2026",
    utm: { source: "qr", medium: "qr", campaign: "medicare-aep-2026", content: "seminar-handout" },
    destination: "resources",
    status: "scheduled",
    date: "2026-06-10",
    by: "Tasha R.",
  },
  {
    id: "r7",
    title: "Term vs. Whole Life: A Plain-English Comparison",
    type: "link",
    source: "https://www.investopedia.com/term-vs-whole-life",
    domain: "investopedia.com",
    campaign: "iul-awareness-2026",
    utm: { source: "linkedin", medium: "social", campaign: "iul-awareness-2026", content: "post-share" },
    destination: "education",
    status: "draft",
    date: "2026-06-02",
    by: "Jackson L.",
  },
  {
    id: "r8",
    title: "Protecting Today, Securing Tomorrow — Family Worksheet",
    type: "doc",
    source: "Family-Protection-Worksheet.pdf",
    domain: "Uploaded · 1.1 MB",
    campaign: "beat-goes-on-series",
    utm: { source: "email", medium: "email", campaign: "beat-goes-on-series", content: "welcome-series-2" },
    destination: "newsletter",
    status: "published",
    date: "2026-04-30",
    by: "Tasha R.",
  },
];

Object.assign(window, {
  UTM_SOURCES, UTM_MEDIUMS, DESTINATIONS, CAMPAIGNS, TYPES, SEED,
  buildUrl, autoCampaign,
});
