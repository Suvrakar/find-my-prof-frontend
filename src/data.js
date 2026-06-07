// All mock data for Find My Professor

// Each interest has:
//   keywords  — broad terms for client-side substring matching against professor keywords
//   search    — short term sent to the API's full-text search (keep to 1–2 words)
//   category  — used to group interests in the preference bar UI
// db_topics: terms that actually appear in the OpenAlex-sourced DB keyword taxonomy.
// Used for the backend ?topics= OR-filter so interests return real results.
// CS subfields (ai_ml, nlp, etc.) map to "Computer science" since OpenAlex uses
// broad Wikipedia categories — the DB cannot distinguish CS subfields.
export const INTERESTS = [
  // ── Technology & Engineering ──────────────────────────────────────────────
  { id: "ai_ml",       label: "AI / Machine Learning",       icon: "Sparkles",  category: "Technology",
    db_topics: ["Computer science", "Artificial intelligence", "Machine learning"],
    keywords: ["machine learning", "deep learning", "neural network", "artificial intelligence", "nlp", "natural language", "computer vision", "reinforcement learning", "large language model", "llm", "multimodal", "generative", "diffusion", "transformer", "causal inference", "bayesian", "federated learning", "graph neural", "knowledge graph", "recommendation"] },
  { id: "nlp",         label: "Linguistics / NLP",           icon: "Book",      category: "Technology",
    db_topics: ["Computer science", "Linguistics", "Natural language processing"],
    keywords: ["nlp", "natural language", "computational linguistics", "speech", "text mining", "information extraction", "machine translation", "sentiment", "discourse", "pragmatics", "phonology", "syntax", "semantics", "low-resource", "endangered language"] },
  { id: "vision",      label: "Computer Vision",             icon: "Eye",       category: "Technology",
    db_topics: ["Computer science", "Computer vision", "Pattern recognition"],
    keywords: ["computer vision", "image recognition", "object detection", "segmentation", "3d reconstruction", "video understanding", "medical imaging", "remote sensing", "scene understanding"] },
  { id: "robotics",    label: "Robotics",                    icon: "Building",  category: "Technology",
    db_topics: ["Computer science", "Engineering", "Robotics"],
    keywords: ["robotics", "robot", "manipulation", "sim2real", "autonomous", "navigation", "motion planning", "human-robot", "soft robotics", "aerial", "underwater robot"] },
  { id: "security",    label: "Cybersecurity",               icon: "Eye",       category: "Technology",
    db_topics: ["Computer science", "Computer security", "Cryptography"],
    keywords: ["cybersecurity", "security", "privacy", "cryptography", "network security", "malware", "intrusion detection", "vulnerability", "blockchain", "zero trust", "federated privacy"] },
  { id: "systems",     label: "Systems & Networks",          icon: "Building",  category: "Technology",
    db_topics: ["Computer science", "Engineering", "Distributed computing"],
    keywords: ["distributed systems", "operating systems", "computer architecture", "cloud computing", "networking", "edge computing", "high performance", "compilers", "parallel computing", "storage", "database"] },
  { id: "engineering", label: "Engineering (Broad)",         icon: "Building",  category: "Technology",
    db_topics: ["Engineering", "Mechanical engineering", "Electrical engineering", "Civil engineering"],
    keywords: ["mechanical engineering", "electrical engineering", "civil engineering", "chemical engineering", "aerospace", "structural", "thermodynamics", "fluid dynamics", "materials engineering", "biomedical engineering", "control systems", "signal processing"] },
  { id: "quantum",     label: "Quantum Computing",           icon: "Sparkles",  category: "Technology",
    db_topics: ["Computer science", "Physics", "Quantum mechanics"],
    keywords: ["quantum", "quantum computing", "quantum information", "quantum cryptography", "quantum hardware", "qubit"] },

  // ── Natural Sciences ──────────────────────────────────────────────────────
  { id: "biology",     label: "Biology & Life Sciences",     icon: "Award",     category: "Sciences",
    db_topics: ["Biology", "Genetics", "Molecular biology", "Ecology", "Biochemistry"],
    keywords: ["biology", "molecular biology", "cell biology", "genetics", "genomics", "proteomics", "evolutionary biology", "ecology", "microbiology", "biochemistry", "bioinformatics", "systems biology", "developmental biology", "synthetic biology", "gene", "dna", "rna", "crispr", "phylogenetics"] },
  { id: "medicine",    label: "Medicine & Public Health",    icon: "Award",     category: "Sciences",
    db_topics: ["Medicine", "Public health", "Pharmacology", "Epidemiology", "Oncology"],
    keywords: ["medicine", "clinical", "pharmacology", "epidemiology", "public health", "oncology", "cardiology", "neurology", "immunology", "pathology", "surgery", "pediatrics", "psychiatry", "global health", "health informatics", "drug discovery", "vaccine", "biomarker"] },
  { id: "neuro",       label: "Neuroscience",                icon: "Star",      category: "Sciences",
    db_topics: ["Neuroscience", "Biology", "Psychology", "Cognitive science"],
    keywords: ["neuroscience", "neural", "brain", "cognitive", "fmri", "eeg", "computational neuroscience", "neuroimaging", "synaptic", "cortex", "connectome", "alzheimer", "parkinson", "memory", "perception"] },
  { id: "physics",     label: "Physics & Astronomy",         icon: "Sparkles",  category: "Sciences",
    db_topics: ["Physics", "Condensed matter physics", "Astrophysics", "Quantum mechanics"],
    keywords: ["physics", "astrophysics", "cosmology", "particle physics", "condensed matter", "optics", "plasma", "nuclear", "quantum field", "gravitation", "astronomy", "telescope", "dark matter", "superconductor"] },
  { id: "chemistry",   label: "Chemistry & Materials",       icon: "Award",     category: "Sciences",
    db_topics: ["Chemistry", "Materials science", "Organic chemistry", "Inorganic chemistry"],
    keywords: ["chemistry", "organic chemistry", "inorganic chemistry", "physical chemistry", "analytical chemistry", "materials science", "polymer", "nanomaterial", "nanotechnology", "catalysis", "electrochemistry", "spectroscopy", "crystallography"] },
  { id: "math",        label: "Mathematics & Statistics",    icon: "Trend",     category: "Sciences",
    db_topics: ["Mathematics", "Applied mathematics", "Statistics", "Mathematical optimization"],
    keywords: ["mathematics", "statistics", "algebra", "topology", "geometry", "analysis", "number theory", "combinatorics", "probability", "stochastic", "optimization", "numerical methods", "applied math", "mathematical modeling", "biostatistics"] },
  { id: "environment", label: "Environmental Science",       icon: "Globe",     category: "Sciences",
    db_topics: ["Environmental science", "Environmental planning", "Climate change", "Ecology"],
    keywords: ["environmental", "climate change", "ecology", "sustainability", "conservation", "renewable energy", "carbon", "greenhouse", "biodiversity", "remote sensing", "geoscience", "hydrology", "atmospheric", "ocean", "pollution"] },
  { id: "biotech",     label: "Biotech / Synthetic Biology", icon: "Award",     category: "Sciences",
    db_topics: ["Biotechnology", "Biology", "Biochemistry", "Genetics"],
    keywords: ["biotechnology", "synthetic biology", "gene circuit", "metabolic engineering", "fermentation", "bioreactor", "directed evolution", "protein engineering", "tissue engineering", "stem cell"] },

  // ── Social Sciences ───────────────────────────────────────────────────────
  { id: "economics",   label: "Economics",                   icon: "Trend",     category: "Social Sciences",
    db_topics: ["Economics", "Financial services", "Econometrics", "Business"],
    keywords: ["economics", "econometrics", "microeconomics", "macroeconomics", "game theory", "labor economics", "development economics", "behavioral economics", "financial economics", "monetary policy", "trade", "inequality", "welfare"] },
  { id: "business",    label: "Business & Management",       icon: "Building",  category: "Social Sciences",
    db_topics: ["Business", "Management", "Financial services", "Marketing"],
    keywords: ["management", "marketing", "finance", "accounting", "strategy", "entrepreneurship", "supply chain", "operations management", "organizational behavior", "human resources", "innovation", "leadership", "corporate", "business analytics"] },
  { id: "psychology",  label: "Psychology",                  icon: "Star",      category: "Social Sciences",
    db_topics: ["Psychology", "Cognitive science", "Behaviorism"],
    keywords: ["psychology", "cognitive psychology", "social psychology", "clinical psychology", "developmental psychology", "behavioral", "mental health", "personality", "motivation", "learning", "emotion", "therapy", "counseling", "psychotherapy"] },
  { id: "sociology",   label: "Sociology & Anthropology",    icon: "Globe",     category: "Social Sciences",
    db_topics: ["Sociology", "Anthropology", "Social science"],
    keywords: ["sociology", "anthropology", "social theory", "ethnography", "qualitative", "culture", "inequality", "race", "gender", "migration", "urban", "globalization", "community", "social movements"] },
  { id: "political",   label: "Political Science & Law",     icon: "Book",      category: "Social Sciences",
    db_topics: ["Political science", "Law", "Public policy", "International relations"],
    keywords: ["political science", "law", "policy", "governance", "democracy", "international relations", "comparative politics", "public administration", "constitutional law", "criminal law", "human rights", "diplomacy", "security studies"] },
  { id: "education",   label: "Education & Learning",        icon: "Book",      category: "Social Sciences",
    db_topics: ["Education", "Knowledge management", "Pedagogy"],
    keywords: ["education", "pedagogy", "curriculum", "learning", "e-learning", "educational technology", "higher education", "k-12", "literacy", "stem education", "teacher", "assessment", "special education"] },
  { id: "or",          label: "Operations Research",         icon: "Trend",     category: "Social Sciences",
    db_topics: ["Computer science", "Mathematics", "Operations research"],
    keywords: ["operations research", "optimization", "linear programming", "simulation", "scheduling", "logistics", "supply chain optimization", "decision theory", "integer programming", "metaheuristics"] },

  // ── Humanities ────────────────────────────────────────────────────────────
  { id: "history",     label: "History & Philosophy",        icon: "Book",      category: "Humanities",
    db_topics: ["History", "Philosophy", "Humanities"],
    keywords: ["history", "philosophy", "ethics", "epistemology", "metaphysics", "political philosophy", "philosophy of science", "intellectual history", "medieval", "modern history", "ancient history", "historiography"] },
  { id: "arts",        label: "Arts, Media & Literature",    icon: "Star",      category: "Humanities",
    db_topics: ["Literature", "Linguistics", "Art", "Media studies", "Cultural studies"],
    keywords: ["literature", "art", "music", "film", "media studies", "cultural studies", "creative writing", "rhetoric", "theatre", "visual art", "digital humanities", "linguistics", "communication", "journalism"] },
];

export const professors = [
  {
    id: "p1", name: "Dr. Mariam El-Sayed", initials: "ME",
    title: "Associate Professor", dept: "Computer Science", school: "ETH Zürich", country: "Switzerland",
    keywords: ["NLP", "Multimodal Learning", "LLM Reasoning", "Causal Inference"],
    hIndex: 42, citations: 8240, score: 94,
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
    id: "p2", name: "Prof. Daniel Okonkwo", initials: "DO",
    title: "Full Professor", dept: "Bioengineering", school: "MIT", country: "USA",
    keywords: ["Synthetic Biology", "Gene Circuits", "ML for Biology"],
    hIndex: 61, citations: 19400, score: 89,
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
    id: "p3", name: "Dr. Yuki Tanaka", initials: "YT",
    title: "Assistant Professor", dept: "Robotics", school: "University of Tokyo", country: "Japan",
    keywords: ["Reinforcement Learning", "Manipulation", "Sim2Real"],
    hIndex: 18, citations: 1850, score: 86,
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
    id: "p4", name: "Prof. Sofia Reinhardt", initials: "SR",
    title: "Full Professor", dept: "Computational Linguistics", school: "University of Edinburgh", country: "UK",
    keywords: ["Low-Resource NLP", "Speech", "Endangered Languages"],
    hIndex: 38, citations: 7100, score: 82,
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
    id: "p5", name: "Dr. Ravi Subramanian", initials: "RS",
    title: "Associate Professor", dept: "Operations Research", school: "Stanford University", country: "USA",
    keywords: ["Optimization", "RL for OR", "Healthcare Operations"],
    hIndex: 29, citations: 4100, score: 78,
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
    id: "p6", name: "Prof. Camille Devereaux", initials: "CD",
    title: "Full Professor", dept: "Cognitive Neuroscience", school: "Collège de France", country: "France",
    keywords: ["Computational Cognition", "Bayesian Models", "fMRI"],
    hIndex: 55, citations: 14200, score: 74,
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

export const outreach = [
  { id: "o1", profId: "p2", subject: "PhD Inquiry — Gene-Circuit Design w/ ML Priors", sent: "3 days ago", status: "replied", opens: 4, clicks: 1, replyAt: "2 days ago", followups: 0 },
  { id: "o2", profId: "p1", subject: "Multimodal Reasoning — Fall 2026 PhD interest", sent: "5 days ago", status: "opened", opens: 2, clicks: 0, followups: 0 },
  { id: "o3", profId: "p3", subject: "Sim2Real PhD position — research fit", sent: "8 days ago", status: "no-reply", opens: 1, clicks: 0, followups: 1, nextFollowup: "in 2 days" },
  { id: "o4", profId: "p5", subject: "OR + RL crossover — your CAREER award", sent: "12 days ago", status: "no-reply", opens: 0, clicks: 0, followups: 1, nextFollowup: "in 1 day" },
  { id: "o5", profId: "p4", subject: "Low-resource NLP — alignment with your TACL paper", sent: "2 weeks ago", status: "bounced", opens: 0, clicks: 0, followups: 0 },
];

export const statusMeta = {
  replied:    { label: "Replied",  pill: "pill-green",  dot: "oklch(0.5 0.12 155)" },
  opened:     { label: "Opened",   pill: "pill-blue",   dot: "oklch(0.55 0.12 240)" },
  "no-reply": { label: "No reply", pill: "pill-amber",  dot: "oklch(0.7 0.12 75)" },
  bounced:    { label: "Bounced",  pill: "pill-red",    dot: "oklch(0.55 0.15 25)" },
  queued:     { label: "Queued",   pill: "pill-outline",dot: "oklch(0.7 0.005 100)" },
};

export const COUNTRIES = [
  { code: "US", flag: "🇺🇸", name: "United States",  unis: 4124, profs: 58210, top: ["MIT", "Stanford", "Harvard", "CMU", "Berkeley"] },
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", unis: 162,  profs: 12480, top: ["Oxford", "Cambridge", "Imperial", "UCL", "Edinburgh"] },
  { code: "DE", flag: "🇩🇪", name: "Germany",        unis: 423,  profs: 14820, top: ["TUM", "LMU Munich", "Heidelberg", "RWTH Aachen", "Humboldt"] },
  { code: "CA", flag: "🇨🇦", name: "Canada",         unis: 96,   profs: 6840,  top: ["Toronto", "UBC", "McGill", "Waterloo", "Montreal"] },
  { code: "CH", flag: "🇨🇭", name: "Switzerland",    unis: 12,   profs: 2410,  top: ["ETH Zürich", "EPFL", "Zürich", "Basel", "Geneva"] },
  { code: "FR", flag: "🇫🇷", name: "France",         unis: 87,   profs: 8120,  top: ["Sorbonne", "Collège de France", "ENS", "Polytechnique", "Sciences Po"] },
  { code: "NL", flag: "🇳🇱", name: "Netherlands",    unis: 14,   profs: 3260,  top: ["Delft", "Amsterdam", "Utrecht", "Leiden", "Eindhoven"] },
  { code: "JP", flag: "🇯🇵", name: "Japan",          unis: 86,   profs: 10440, top: ["U-Tokyo", "Kyoto", "Osaka", "Tohoku", "Tokyo Tech"] },
  { code: "SG", flag: "🇸🇬", name: "Singapore",      unis: 6,    profs: 1480,  top: ["NUS", "NTU", "SMU", "SUTD", "Yale-NUS"] },
  { code: "AU", flag: "🇦🇺", name: "Australia",      unis: 43,   profs: 5210,  top: ["Melbourne", "Sydney", "ANU", "Monash", "UNSW"] },
  { code: "SE", flag: "🇸🇪", name: "Sweden",         unis: 22,   profs: 2840,  top: ["KTH", "Stockholm", "Lund", "Chalmers", "Uppsala"] },
  { code: "IL", flag: "🇮🇱", name: "Israel",         unis: 9,    profs: 1620,  top: ["Hebrew U", "Technion", "Tel Aviv", "Weizmann", "BGU"] },
];

export const REVIEWS = [
  { id: "r1", profId: "p1", rating: 4.6, n: 14, snippets: [
    { stars: 5, role: "Former PhD '23", text: "Mariam is the most engaged advisor I've had — weekly meetings, real co-authorship, and she actually reads your drafts.", time: "3 months ago", helpful: 22 },
    { stars: 4, role: "Current PhD",    text: "Brilliant scientist. Bit demanding on writing deadlines but the standards make papers stronger.", time: "6 months ago", helpful: 11 },
    { stars: 5, role: "Postdoc '22",    text: "Hands-down the best PI for early-career multimodal work in Europe.", time: "1 year ago", helpful: 18 },
  ]},
  { id: "r2", profId: "p2", rating: 4.2, n: 21, snippets: [
    { stars: 4, role: "Current PhD",    text: "Independent style — works best if you're self-driven. Office hours are gold when you book them.", time: "2 months ago", helpful: 31 },
    { stars: 5, role: "Industry mentee",text: "His feedback on grant proposals changed how I think about funding narratives.", time: "5 months ago", helpful: 9 },
  ]},
  { id: "r3", profId: "p3", rating: 4.8, n: 6, snippets: [
    { stars: 5, role: "First PhD student", text: "Brand new lab — Yuki has tons of time and energy. Excellent mentor for someone who wants attention.", time: "1 month ago", helpful: 14 },
  ]},
  { id: "r4", profId: "p4", rating: 3.8, n: 18, snippets: [
    { stars: 4, role: "PhD '22", text: "Brilliant linguist but the lab is large and you'll get a lot of co-supervision.", time: "8 months ago", helpful: 7 },
  ]},
];

export const HIRINGS = [
  { id: "h1", profId: "p1", title: "PhD candidate — Multimodal Reasoning", deadline: "Jan 15, 2026", funding: "Fully funded · CHF 65k/yr · 4 years", posted: "2 days ago", urgency: "new", slots: 2 },
  { id: "h2", profId: "p2", title: "PhD / Postdoc — Programmable Gene Circuits", deadline: "Rolling", funding: "Fully funded · $42k stipend + tuition", posted: "5 days ago", urgency: "rolling", slots: 2 },
  { id: "h3", profId: "p3", title: "PhD — Tactile Manipulation (Spring 2026)", deadline: "Feb 1, 2026", funding: "MEXT scholarship + lab top-up", posted: "1 week ago", urgency: "closing", slots: 1 },
  { id: "h4", profId: "p5", title: "Visiting PhD — RL for Healthcare Operations", deadline: "Mar 1, 2026", funding: "$48k · partial tuition waiver", posted: "1 week ago", urgency: "open", slots: 1 },
  { id: "h5", profId: "p1", title: "Research Engineer — VLM evaluations", deadline: "Open", funding: "Industry-adjacent · CHF 85k", posted: "4 days ago", urgency: "new", slots: 1 },
  { id: "h6", profId: "p6", title: "Postdoc — Bayesian Models of Perception", deadline: "Apr 15, 2026", funding: "ANR-funded · 2 years renewable", posted: "11 days ago", urgency: "open", slots: 1 },
];

export const WHATSNEW = [
  { type: "new-prof",    profId: "p3", title: "Yuki Tanaka added", note: "New assistant professor at U-Tokyo · indexed from arXiv + faculty page", time: "2h ago" },
  { type: "new-grant",   profId: "p2", title: "Daniel Okonkwo won NIH R01 renewal", note: "$4.2M · adds 2 funded PhD slots", time: "6h ago" },
  { type: "new-paper",   profId: "p1", title: "Mariam El-Sayed published in NeurIPS 2025", note: "Grounded Reasoning in Vision–Language Agents", time: "1d ago" },
  { type: "new-opening", profId: "p1", title: "ETH lab posted 2 PhD openings", note: "Deadline Jan 15, 2026 · CHF 65k", time: "2d ago" },
  { type: "score-up",    profId: "p3", title: "Tanaka match score +6 (now 86)", note: "New activity bumped recency signal", time: "2d ago" },
  { type: "new-prof",    profId: null, title: "12 new professors at MIT EECS", note: "Indexed from department directory crawl", time: "3d ago" },
  { type: "new-grant",   profId: "p4", title: "Sofia Reinhardt secured UKRI renewal", note: "£1.4M · 4 years · group expansion", time: "4d ago" },
];

export const DEFAULT_CV = {
  name: "Alex Chen",
  email: "alex.chen@uw.edu",
  phone: "+1 (206) 555-0173",
  website: "alexchen.dev",
  github: "github.com/alexchen",
  scholar: "scholar.google.com/alexchen",
  address: "Seattle, WA",
  links: [
    { label: "LinkedIn", url: "linkedin.com/in/alexchen" },
    { label: "Twitter / X", url: "x.com/alexchen" },
  ],
  summary: "Final-year undergraduate in Computer Science with a research focus on multimodal large language models. Author on two workshop papers; seeking PhD positions for Fall 2026.",
  education: [
    { school: "University of Washington", degree: "B.Sc. Computer Science", dates: "2020 — 2024", gpa: "3.92 / 4.00", notes: "Honors. Coursework: ML, NLP, Optimization, Systems. Senior thesis with Prof. K. Hayashi on vision-language chart understanding.", link: "washington.edu" },
    { school: "Pacific Northwest Tech Institute", degree: "Visiting Student", dates: "Summer 2023", notes: "Research fellowship in machine learning theory." },
  ],
  research: [
    { role: "Undergraduate Researcher", lab: "UW NLP Lab", advisor: "Prof. K. Hayashi", dates: "2023 — present", link: "uwnlp.github.io", bullets: [
      "Built a 1.4B-parameter vision-language model for chart understanding; achieved +8% over OpenFlamingo baseline on ChartQA.",
      "Designed an evaluation harness covering 12 datasets and 4 perturbation regimes; merged upstream into lab repo (250+ stars).",
      "Co-authored workshop paper at NeurIPS Self-Supervised Learning workshop 2024.",
    ]},
    { role: "Research Intern", lab: "Allen Institute for AI", dates: "Summer 2024", link: "allenai.org", bullets: [
      "Investigated instruction-following failures in 7B open-weight LLMs across 40k held-out prompts.",
      "Findings adopted into AI2's open-instruct evaluation pipeline.",
    ]},
  ],
  publications: [
    { authors: "A. Chen, R. Park, K. Hayashi", title: "Chart-CLIP: Visually-Grounded Chart Understanding with Verifier Loops", venue: "NeurIPS SSL Workshop 2024", year: 2024, link: "arxiv.org/abs/2412.01234" },
    { authors: "L. Mendez, A. Chen, et al.", title: "Probing Multimodal Embedding Alignment", venue: "ICLR Tiny Papers", year: 2024, link: "arxiv.org/abs/2403.05678" },
  ],
  awards: [
    { name: "Mary Gates Research Scholarship", year: "2024", note: "$5,000 · top 4% of UW undergrads", link: "expd.uw.edu/mge" },
    { name: "Husky Promise Scholar", year: "2020 — 2024" },
    { name: "ACM ICPC Pacific NW · 4th place", year: "2023", link: "icpc.global" },
  ],
  skills: {
    "Languages": "Python, Rust, TypeScript, C++, SQL",
    "ML": "PyTorch, JAX, Hugging Face, vLLM, DeepSpeed",
    "Tools": "Git, Docker, Kubernetes, Weights & Biases, Slurm",
  },
  spoken: ["English (native)", "Mandarin (intermediate)", "Japanese (beginner)"],
};
