// Shared data, icons, and small components
const FMP = (window.FMP = window.FMP || {});

// --- Icons (Lucide-style strokes) ---
const ic = (path, opts = {}) => ({ size = 16, color = "currentColor", strokeWidth = 1.75, style } = opts) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>{path}</svg>
);

FMP.Icon = {
  Search: ic(<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>),
  Home: ic(<><path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></>),
  Sparkles: ic(<><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M19 14l.7 1.8L21.5 16.5l-1.8.7L19 19l-.7-1.8L16.5 16.5l1.8-.7z"/></>),
  Mail: ic(<><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>),
  Inbox: ic(<><path d="M3 13h4l2 3h6l2-3h4"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6z"/></>),
  Bookmark: ic(<><path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-4z"/></>),
  User: ic(<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>),
  Settings: ic(<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>),
  Chevron: ic(<path d="m9 6 6 6-6 6"/>),
  ChevronDown: ic(<path d="m6 9 6 6 6-6"/>),
  Plus: ic(<><path d="M12 5v14"/><path d="M5 12h14"/></>),
  Check: ic(<path d="M5 13l4 4L19 7"/>),
  X: ic(<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>),
  Filter: ic(<path d="M3 5h18l-7 9v6l-4-2v-4z"/>),
  Send: ic(<><path d="m22 2-11 11"/><path d="M22 2 15 22l-4-9-9-4z"/></>),
  Clock: ic(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  Building: ic(<><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/></>),
  Award: ic(<><circle cx="12" cy="9" r="6"/><path d="m9 14-2 7 5-3 5 3-2-7"/></>),
  Book: ic(<><path d="M4 4h14a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M4 4v16"/></>),
  Globe: ic(<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>),
  ExternalLink: ic(<><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></>),
  Star: ic(<path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6l6.4-.6z"/>),
  StarF: ({ size = 16, color = "currentColor" } = {}) => (<svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12 3l2.6 6 6.4.6-4.8 4.4 1.4 6.4L12 17l-5.6 3.4L7.8 14 3 9.6l6.4-.6z"/></svg>),
  Trend: ic(<><path d="M3 17 9 11l4 4 8-8"/><path d="M15 7h6v6"/></>),
  Eye: ic(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>),
  Reply: ic(<><path d="M9 17 4 12l5-5"/><path d="M4 12h11a5 5 0 0 1 5 5v2"/></>),
  Dot: ({ size=8, color="currentColor"}={}) => <span style={{display:"inline-block", width:size, height:size, borderRadius:"50%", background:color}}/>,
  Logo: ({ size = 22 } = {}) => (
    <span className="brand-mark" style={{ width: size, height: size, fontSize: size*0.65 }}>ƒ</span>
  ),
};

// --- Research interest taxonomy ---
// Each top-level field maps to professor keywords used for filtering.
FMP.INTERESTS = [
  { id: "ai_ml",     label: "AI / Machine Learning", icon: "Sparkles",
    keywords: ["NLP", "Multimodal Learning", "LLM Reasoning", "Reinforcement Learning", "Causal Inference", "Computer Vision", "Bayesian ML", "ML for Biology", "RL for OR"] },
  { id: "biotech",   label: "Biotech / Synthetic Biology", icon: "Award",
    keywords: ["Synthetic Biology", "Gene Circuits", "ML for Biology"] },
  { id: "robotics",  label: "Robotics", icon: "Building",
    keywords: ["Reinforcement Learning", "Manipulation", "Sim2Real"] },
  { id: "neuro",     label: "Neuroscience", icon: "Star",
    keywords: ["Computational Cognition", "Bayesian Models", "fMRI"] },
  { id: "or",        label: "Operations Research", icon: "Trend",
    keywords: ["Optimization", "RL for OR", "Healthcare Operations"] },
  { id: "nlp",       label: "Linguistics / NLP", icon: "Book",
    keywords: ["NLP", "Low-Resource NLP", "Speech", "Endangered Languages"] },
  { id: "vision",    label: "Computer Vision", icon: "Eye",
    keywords: ["Computer Vision", "Multimodal Learning"] },
  { id: "quantum",   label: "Quantum Computing", icon: "Sparkles",
    keywords: ["Quantum"] },
];

// --- Mock data ---
FMP.professors = [
  {
    id: "p1",
    name: "Dr. Mariam El-Sayed",
    initials: "ME",
    title: "Associate Professor",
    dept: "Computer Science",
    school: "ETH Zürich",
    country: "Switzerland",
    keywords: ["NLP", "Multimodal Learning", "LLM Reasoning", "Causal Inference"],
    hIndex: 42,
    citations: 8240,
    score: 94,
    breakdown: { expertise: 96, funding: 92, activity: 95, reputation: 88 },
    reasons: [
      "Top 3% semantic overlap with your statement on 'instruction-tuned multimodal systems'",
      "Published 4 papers in last 12 months at NeurIPS, ACL, EMNLP",
      "Active ERC Consolidator Grant runs through 2028 — funding likely",
    ],
    funding: "ERC Consolidator · €2M · 2024–2028",
    lastPaper: "Grounded Reasoning in Vision–Language Agents (NeurIPS 2025)",
    accepting: true,
    email: "m.elsayed@inf.ethz.ch",
    homepage: "elsayed-lab.ethz.ch",
    advisingStyle: "Hands-on, weekly 1:1s, encourages publishing early",
    saved: false,
    sources: ["ORCID", "Semantic Scholar", "ETH Faculty"],
  },
  {
    id: "p2",
    name: "Prof. Daniel Okonkwo",
    initials: "DO",
    title: "Full Professor",
    dept: "Bioengineering",
    school: "MIT",
    country: "USA",
    keywords: ["Synthetic Biology", "Gene Circuits", "ML for Biology"],
    hIndex: 61,
    citations: 19400,
    score: 89,
    breakdown: { expertise: 84, funding: 95, activity: 90, reputation: 96 },
    reasons: [
      "Strong overlap with your interest in 'machine learning applied to gene regulatory design'",
      "$4.2M NIH R01 grant active; lab posted 2 PhD openings on department page",
      "h-index 61 — top 1% in field",
    ],
    funding: "NIH R01 · $4.2M · 2023–2028",
    lastPaper: "Programmable Mammalian Gene Circuits (Nature 2025)",
    accepting: true,
    email: "okonkwo@mit.edu",
    homepage: "okonkwo-lab.mit.edu",
    advisingStyle: "Independent, biweekly group meetings, heavy collaboration",
    saved: true,
    sources: ["NIH RePORTER", "Semantic Scholar"],
  },
  {
    id: "p3",
    name: "Dr. Yuki Tanaka",
    initials: "YT",
    title: "Assistant Professor",
    dept: "Robotics",
    school: "University of Tokyo",
    country: "Japan",
    keywords: ["Reinforcement Learning", "Manipulation", "Sim2Real"],
    hIndex: 18,
    citations: 1850,
    score: 86,
    breakdown: { expertise: 92, funding: 78, activity: 94, reputation: 72 },
    reasons: [
      "Recently started lab — explicitly hiring 2 PhDs for Spring 2026",
      "Direct keyword match: 'sim2real transfer for dexterous manipulation'",
      "8 publications in the last year; consistent ICRA/CoRL presence",
    ],
    funding: "JSPS Kakenhi · ¥28M · 2025–2028",
    lastPaper: "Tactile-Guided Sim2Real Policies (CoRL 2025)",
    accepting: true,
    email: "y.tanaka@is.s.u-tokyo.ac.jp",
    homepage: "tanaka-lab.is.u-tokyo.ac.jp",
    advisingStyle: "New lab, small group — lots of attention per student",
    saved: false,
    sources: ["arXiv", "U-Tokyo Faculty"],
  },
  {
    id: "p4",
    name: "Prof. Sofia Reinhardt",
    initials: "SR",
    title: "Full Professor",
    dept: "Computational Linguistics",
    school: "University of Edinburgh",
    country: "UK",
    keywords: ["Low-Resource NLP", "Speech", "Endangered Languages"],
    hIndex: 38,
    citations: 7100,
    score: 82,
    breakdown: { expertise: 88, funding: 70, activity: 84, reputation: 86 },
    reasons: [
      "Aligned with your stated interest in 'NLP for under-resourced languages'",
      "Co-PI on UKRI grant ending 2026 — may have continuation",
      "Group has produced 6 graduating PhDs in last 3 years (active pipeline)",
    ],
    funding: "UKRI · £1.1M · 2022–2026",
    lastPaper: "Cross-Lingual Transfer for 200 Languages (TACL 2024)",
    accepting: false,
    email: "s.reinhardt@ed.ac.uk",
    homepage: "reinhardt-cl.ed.ac.uk",
    advisingStyle: "Structured, milestone-driven, encourages co-supervision",
    saved: false,
    sources: ["ORCID", "Edinburgh Faculty"],
  },
  {
    id: "p5",
    name: "Dr. Ravi Subramanian",
    initials: "RS",
    title: "Associate Professor",
    dept: "Operations Research",
    school: "Stanford University",
    country: "USA",
    keywords: ["Optimization", "RL for OR", "Healthcare Operations"],
    hIndex: 29,
    citations: 4100,
    score: 78,
    breakdown: { expertise: 76, funding: 88, activity: 80, reputation: 78 },
    reasons: [
      "Moderate semantic overlap — your stats background fits the OR/RL crossover",
      "NSF CAREER Award (2023) provides funded slot through 2028",
      "Note: previous applicants reported slow email response",
    ],
    funding: "NSF CAREER · $550K · 2023–2028",
    lastPaper: "RL Policies for Operating-Room Scheduling (Mgmt Sci 2025)",
    accepting: true,
    email: "ravisub@stanford.edu",
    homepage: "subramanian.stanford.edu",
    advisingStyle: "Industry-collaborative, ok with remote check-ins",
    saved: false,
    sources: ["NSF Awards", "Stanford Faculty"],
  },
  {
    id: "p6",
    name: "Prof. Camille Devereaux",
    initials: "CD",
    title: "Full Professor",
    dept: "Cognitive Neuroscience",
    school: "Collège de France",
    country: "France",
    keywords: ["Computational Cognition", "Bayesian Models", "fMRI"],
    hIndex: 55,
    citations: 14200,
    score: 74,
    breakdown: { expertise: 70, funding: 82, activity: 70, reputation: 94 },
    reasons: [
      "Tangential match — your ML background could bridge to her Bayesian cognition work",
      "Senior researcher with consistent funding history",
      "Group is large (18 members) — less 1:1 advisor time",
    ],
    funding: "ANR · €1.6M · 2024–2027",
    lastPaper: "Bayesian Theories of Perceptual Learning (Neuron 2024)",
    accepting: true,
    email: "c.devereaux@college-de-france.fr",
    homepage: "devereaux.cdf.fr",
    advisingStyle: "Senior, delegates to postdocs, prestigious lineage",
    saved: false,
    sources: ["ORCID", "PubMed"],
  },
];

FMP.outreach = [
  { id: "o1", profId: "p2", subject: "PhD Inquiry — Gene-Circuit Design w/ ML Priors", sent: "3 days ago", status: "replied", opens: 4, clicks: 1, replyAt: "2 days ago", followups: 0 },
  { id: "o2", profId: "p1", subject: "Multimodal Reasoning — Fall 2026 PhD interest", sent: "5 days ago", status: "opened", opens: 2, clicks: 0, followups: 0 },
  { id: "o3", profId: "p3", subject: "Sim2Real PhD position — research fit", sent: "8 days ago", status: "no-reply", opens: 1, clicks: 0, followups: 1, nextFollowup: "in 2 days" },
  { id: "o4", profId: "p5", subject: "OR + RL crossover — your CAREER award", sent: "12 days ago", status: "no-reply", opens: 0, clicks: 0, followups: 1, nextFollowup: "in 1 day" },
  { id: "o5", profId: "p4", subject: "Low-resource NLP — alignment with your TACL paper", sent: "2 weeks ago", status: "bounced", opens: 0, clicks: 0, followups: 0 },
];

FMP.statusMeta = {
  replied:   { label: "Replied",   pill: "pill-green",  dot: "oklch(0.5 0.12 155)" },
  opened:    { label: "Opened",    pill: "pill-blue",   dot: "oklch(0.55 0.12 240)" },
  "no-reply":{ label: "No reply",  pill: "pill-amber",  dot: "oklch(0.7 0.12 75)" },
  bounced:   { label: "Bounced",   pill: "pill-red",    dot: "oklch(0.55 0.15 25)" },
  queued:    { label: "Queued",    pill: "pill-outline",dot: "oklch(0.7 0.005 100)" },
};

// --- Small components ---
FMP.ScoreRing = function ScoreRing({ value = 78, size = 56 }) {
  return (
    <div className="score-ring" style={{ "--pct": value, "--size": `${size}px` }}>
      <span>{value}</span>
    </div>
  );
};

FMP.Bar = function Bar({ value, label, color }) {
  return (
    <div className="col gap-1" style={{ width: "100%" }}>
      <div className="row between" style={{ fontSize: 11, color: "var(--ink-3)" }}>
        <span>{label}</span>
        <span className="num" style={{ color: "var(--ink-2)" }}>{value}</span>
      </div>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${value}%`, background: color || "var(--green)" }} />
      </div>
    </div>
  );
};

FMP.Avatar = function Avatar({ initials, size = "md", tone }) {
  const cls = size === "lg" ? "avatar avatar-lg" : size === "xl" ? "avatar avatar-xl" : "avatar";
  const bg = tone === "ink" ? "var(--ink)" : undefined;
  const color = tone === "ink" ? "var(--paper)" : undefined;
  const smStyle = size === "sm" ? { width: 24, height: 24, fontSize: 10 } : null;
  return <div className={cls} style={{ background: bg, color, ...smStyle }}>{initials}</div>;
};

Object.assign(window, FMP);

// --- Country/university browse data ---
FMP.COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States",   unis: 4124, profs: 58210, top: ["MIT", "Stanford", "Harvard", "CMU", "Berkeley"] },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom",  unis: 162,  profs: 12480, top: ["Oxford", "Cambridge", "Imperial", "UCL", "Edinburgh"] },
  { code: "DE", flag: "🇩🇪", name: "Germany",         unis: 423,  profs: 14820, top: ["TUM", "LMU Munich", "Heidelberg", "RWTH Aachen", "Humboldt"] },
  { code: "CA", flag: "🇨🇦", name: "Canada",          unis: 96,   profs: 6840,  top: ["Toronto", "UBC", "McGill", "Waterloo", "Montreal"] },
  { code: "CH", flag: "🇨🇭", name: "Switzerland",     unis: 12,   profs: 2410,  top: ["ETH Zürich", "EPFL", "Zürich", "Basel", "Geneva"] },
  { code: "FR", flag: "🇫🇷", name: "France",          unis: 87,   profs: 8120,  top: ["Sorbonne", "Collège de France", "ENS", "Polytechnique", "Sciences Po"] },
  { code: "NL", flag: "🇳🇱", name: "Netherlands",     unis: 14,   profs: 3260,  top: ["Delft", "Amsterdam", "Utrecht", "Leiden", "Eindhoven"] },
  { code: "JP", flag: "🇯🇵", name: "Japan",           unis: 86,   profs: 10440, top: ["U-Tokyo", "Kyoto", "Osaka", "Tohoku", "Tokyo Tech"] },
  { code: "SG", flag: "🇸🇬", name: "Singapore",       unis: 6,    profs: 1480,  top: ["NUS", "NTU", "SMU", "SUTD", "Yale-NUS"] },
  { code: "AU", flag: "🇦🇺", name: "Australia",       unis: 43,   profs: 5210,  top: ["Melbourne", "Sydney", "ANU", "Monash", "UNSW"] },
  { code: "SE", flag: "🇸🇪", name: "Sweden",          unis: 22,   profs: 2840,  top: ["KTH", "Stockholm", "Lund", "Chalmers", "Uppsala"] },
  { code: "IL", flag: "🇮🇱", name: "Israel",          unis: 9,    profs: 1620,  top: ["Hebrew U", "Technion", "Tel Aviv", "Weizmann", "BGU"] },
];

// --- Professor reviews (free tier) ---
FMP.REVIEWS = [
  { id: "r1", profId: "p1", rating: 4.6, n: 14, snippets: [
    { stars: 5, role: "Former PhD '23", text: "Mariam is the most engaged advisor I've had — weekly meetings, real co-authorship, and she actually reads your drafts.", time: "3 months ago", helpful: 22 },
    { stars: 4, role: "Current PhD",     text: "Brilliant scientist. Bit demanding on writing deadlines but the standards make papers stronger.", time: "6 months ago", helpful: 11 },
    { stars: 5, role: "Postdoc '22",     text: "Hands-down the best PI for early-career multimodal work in Europe.", time: "1 year ago", helpful: 18 },
  ]},
  { id: "r2", profId: "p2", rating: 4.2, n: 21, snippets: [
    { stars: 4, role: "Current PhD",  text: "Independent style — works best if you're self-driven. Office hours are gold when you book them.", time: "2 months ago", helpful: 31 },
    { stars: 5, role: "Industry mentee", text: "His feedback on grant proposals changed how I think about funding narratives.", time: "5 months ago", helpful: 9 },
  ]},
  { id: "r3", profId: "p3", rating: 4.8, n: 6,  snippets: [
    { stars: 5, role: "First PhD student", text: "Brand new lab — Yuki has tons of time and energy. Excellent mentor for someone who wants attention.", time: "1 month ago", helpful: 14 },
  ]},
  { id: "r4", profId: "p4", rating: 3.8, n: 18, snippets: [
    { stars: 4, role: "PhD '22", text: "Brilliant linguist but the lab is large and you'll get a lot of co-supervision.", time: "8 months ago", helpful: 7 },
  ]},
];

// --- Hiring board (PRO) ---
FMP.HIRINGS = [
  { id: "h1", profId: "p1", title: "PhD candidate — Multimodal Reasoning", deadline: "Jan 15, 2026", funding: "Fully funded · CHF 65k/yr · 4 years", posted: "2 days ago", urgency: "new", slots: 2 },
  { id: "h2", profId: "p2", title: "PhD / Postdoc — Programmable Gene Circuits", deadline: "Rolling", funding: "Fully funded · $42k stipend + tuition", posted: "5 days ago", urgency: "rolling", slots: 2 },
  { id: "h3", profId: "p3", title: "PhD — Tactile Manipulation (Spring 2026)", deadline: "Feb 1, 2026", funding: "MEXT scholarship + lab top-up", posted: "1 week ago", urgency: "closing", slots: 1 },
  { id: "h4", profId: "p5", title: "Visiting PhD — RL for Healthcare Operations", deadline: "Mar 1, 2026", funding: "$48k · partial tuition waiver", posted: "1 week ago", urgency: "open", slots: 1 },
  { id: "h5", profId: "p1", title: "Research Engineer — VLM evaluations", deadline: "Open", funding: "Industry-adjacent · CHF 85k", posted: "4 days ago", urgency: "new", slots: 1 },
  { id: "h6", profId: "p6", title: "Postdoc — Bayesian Models of Perception", deadline: "Apr 15, 2026", funding: "ANR-funded · 2 years renewable", posted: "11 days ago", urgency: "open", slots: 1 },
];

// --- What's new (PRO) — newly added/changed records ---
FMP.WHATSNEW = [
  { type: "new-prof",    profId: "p3", title: "Yuki Tanaka added", note: "New assistant professor at U-Tokyo · indexed from arXiv + faculty page", time: "2h ago" },
  { type: "new-grant",   profId: "p2", title: "Daniel Okonkwo won NIH R01 renewal", note: "$4.2M · adds 2 funded PhD slots", time: "6h ago" },
  { type: "new-paper",   profId: "p1", title: "Mariam El-Sayed published in NeurIPS 2025", note: "Grounded Reasoning in Vision–Language Agents", time: "1d ago" },
  { type: "new-opening", profId: "p1", title: "ETH lab posted 2 PhD openings", note: "Deadline Jan 15, 2026 · CHF 65k", time: "2d ago" },
  { type: "score-up",    profId: "p3", title: "Tanaka match score +6 (now 86)", note: "New activity bumped recency signal", time: "2d ago" },
  { type: "new-prof",    profId: null, title: "12 new professors at MIT EECS", note: "Indexed from department directory crawl", time: "3d ago" },
  { type: "new-grant",   profId: "p4", title: "Sofia Reinhardt secured UKRI renewal", note: "£1.4M · 4 years · group expansion", time: "4d ago" },
];
