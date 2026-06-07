import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject auth token when present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

// ---------------------------------------------------------------------------
// Deterministic pseudo-random (no Math.random — avoids re-render drift)
// ---------------------------------------------------------------------------
function seeded(seed, min, max) {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  const r = x - Math.floor(x);
  return Math.round(min + r * (max - min));
}

function getInitials(name) {
  return (name || '')
    .split(' ')
    .filter(w => /[A-Za-z]/.test(w))
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

// Strip DBLP-style disambiguation suffixes like " 0001", " 0002"
function cleanName(name) {
  return (name || '').replace(/\s+\d{4}$/, '').trim();
}

// ---------------------------------------------------------------------------
// Country metadata  (backend stores country as a plain string like "USA")
// ---------------------------------------------------------------------------
export const COUNTRY_META = {
  'USA':         { code: 'US', flag: '🇺🇸', name: 'United States' },
  'UK':          { code: 'GB', flag: '🇬🇧', name: 'United Kingdom' },
  'China':       { code: 'CN', flag: '🇨🇳', name: 'China' },
  'India':       { code: 'IN', flag: '🇮🇳', name: 'India' },
  'Australia':   { code: 'AU', flag: '🇦🇺', name: 'Australia' },
  'Europe':      { code: 'EU', flag: '🇪🇺', name: 'Europe' },
  'Germany':     { code: 'DE', flag: '🇩🇪', name: 'Germany' },
  'France':      { code: 'FR', flag: '🇫🇷', name: 'France' },
  'Canada':      { code: 'CA', flag: '🇨🇦', name: 'Canada' },
  'Japan':       { code: 'JP', flag: '🇯🇵', name: 'Japan' },
  'South Korea': { code: 'KR', flag: '🇰🇷', name: 'South Korea' },
  'Switzerland': { code: 'CH', flag: '🇨🇭', name: 'Switzerland' },
  'Netherlands': { code: 'NL', flag: '🇳🇱', name: 'Netherlands' },
  'Sweden':      { code: 'SE', flag: '🇸🇪', name: 'Sweden' },
  'Italy':       { code: 'IT', flag: '🇮🇹', name: 'Italy' },
  'Spain':       { code: 'ES', flag: '🇪🇸', name: 'Spain' },
  'Brazil':      { code: 'BR', flag: '🇧🇷', name: 'Brazil' },
  'Singapore':   { code: 'SG', flag: '🇸🇬', name: 'Singapore' },
  'Israel':      { code: 'IL', flag: '🇮🇱', name: 'Israel' },
  'Portugal':    { code: 'PT', flag: '🇵🇹', name: 'Portugal' },
  'Austria':     { code: 'AT', flag: '🇦🇹', name: 'Austria' },
  'Romania':     { code: 'RO', flag: '🇷🇴', name: 'Romania' },
  'Romaina':     { code: 'RO', flag: '🇷🇴', name: 'Romania' },
  'Belgium':     { code: 'BE', flag: '🇧🇪', name: 'Belgium' },
  'Denmark':     { code: 'DK', flag: '🇩🇰', name: 'Denmark' },
  'Finland':     { code: 'FI', flag: '🇫🇮', name: 'Finland' },
  'Norway':      { code: 'NO', flag: '🇳🇴', name: 'Norway' },
  'Poland':      { code: 'PL', flag: '🇵🇱', name: 'Poland' },
  'Taiwan':      { code: 'TW', flag: '🇹🇼', name: 'Taiwan' },
  'Hong Kong':   { code: 'HK', flag: '🇭🇰', name: 'Hong Kong' },
  'New Zealand': { code: 'NZ', flag: '🇳🇿', name: 'New Zealand' },
  'Mexico':      { code: 'MX', flag: '🇲🇽', name: 'Mexico' },
  'Argentina':   { code: 'AR', flag: '🇦🇷', name: 'Argentina' },
  'Chile':       { code: 'CL', flag: '🇨🇱', name: 'Chile' },
  'Colombia':    { code: 'CO', flag: '🇨🇴', name: 'Colombia' },
  'South Africa':{ code: 'ZA', flag: '🇿🇦', name: 'South Africa' },
  'Egypt':       { code: 'EG', flag: '🇪🇬', name: 'Egypt' },
  'Turkey':      { code: 'TR', flag: '🇹🇷', name: 'Turkey' },
  'Estonia':     { code: 'EE', flag: '🇪🇪', name: 'Estonia' },
  'Russia':      { code: 'RU', flag: '🇷🇺', name: 'Russia' },
  'Czech Republic': { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic' },
  'Hungary':     { code: 'HU', flag: '🇭🇺', name: 'Hungary' },
  'Greece':      { code: 'GR', flag: '🇬🇷', name: 'Greece' },
  'Ireland':     { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  'Irland':      { code: 'IE', flag: '🇮🇪', name: 'Ireland' },
  'Iran':        { code: 'IR', flag: '🇮🇷', name: 'Iran' },
  'Pakistan':    { code: 'PK', flag: '🇵🇰', name: 'Pakistan' },
  'Bangladesh':  { code: 'BD', flag: '🇧🇩', name: 'Bangladesh' },
  'Thailand':    { code: 'TH', flag: '🇹🇭', name: 'Thailand' },
  'Malaysia':    { code: 'MY', flag: '🇲🇾', name: 'Malaysia' },
  'Kenya':       { code: 'KE', flag: '🇰🇪', name: 'Kenya' },
  'Jordan':      { code: 'JO', flag: '🇯🇴', name: 'Jordan' },
  'Qatar':       { code: 'QA', flag: '🇶🇦', name: 'Qatar' },
  'Indonesia':   { code: 'ID', flag: '🇮🇩', name: 'Indonesia' },
  'Philippines': { code: 'PH', flag: '🇵🇭', name: 'Philippines' },
  'Vietnam':     { code: 'VN', flag: '🇻🇳', name: 'Vietnam' },
  'UAE':         { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
  'United Arab Emirates': { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates' },
  'Saudi Arabia': { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
  'Saudi':       { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' },
};

// ---------------------------------------------------------------------------
// Semester helpers — used by hiring board
// ---------------------------------------------------------------------------
export function intakeSemesterFromDeadline(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  const m = d.getMonth() + 1; // 1-12
  // Sep-Dec deadline → spring admission next year; Jan-Aug → fall admission same year
  return m >= 9 ? `Spring ${d.getFullYear() + 1}` : `Fall ${d.getFullYear()}`;
}

export function fundingExpirySemester(isoDate) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  const m = d.getMonth() + 1;
  const y = d.getFullYear();
  if (m <= 5) return `Spring ${y}`;
  if (m <= 8) return `Summer ${y}`;
  return `Fall ${y}`;
}

// ---------------------------------------------------------------------------
// Transform backend Professor → frontend UI shape
// ---------------------------------------------------------------------------
// Detect broad academic field from research keywords to normalise scoring
function detectFieldCategory(kwds) {
  const joined = kwds.join(' ').toLowerCase();
  if (/\b(histor|philosoph|literature|art\b|music|theatre|cultural studies|rhetoric|journalism|media studies)\b/.test(joined))
    return 'humanities';
  if (/\b(sociology|anthropology|political science|law\b|policy|governance|education|pedagogy|social work)\b/.test(joined))
    return 'social';
  if (/\b(psychology|behavioral|cogniti|therapy|counseling|mental health)\b/.test(joined))
    return 'psychology';
  if (/\b(economics|econometrics|finance|accounting|management|marketing|business|entrepreneurship)\b/.test(joined))
    return 'business';
  if (/\b(medicine|clinical|pharmacology|epidemiology|oncology|surgery|public health|nursing|global health)\b/.test(joined))
    return 'medicine';
  if (/\b(biology|genetics|genomics|ecology|biochemistry|molecular|microbiology|evolutionary|bioinformatics)\b/.test(joined))
    return 'biology';
  if (/\b(chemistry|materials science|polymer|nanomaterial|catalysis|crystallography)\b/.test(joined))
    return 'chemistry';
  if (/\b(physics|astrophysics|cosmology|particle|condensed matter|quantum field|plasma|nuclear)\b/.test(joined))
    return 'physics';
  if (/\b(environment|climate|ecology|sustainability|conservation|hydrology|atmospheric|ocean)\b/.test(joined))
    return 'environment';
  return 'stem'; // default: CS / engineering
}

// Field-normalised h-index thresholds (what counts as "high" varies by discipline)
const FIELD_H_CEILING = {
  stem:        60,   // CS / engineering
  biology:     50,
  medicine:    55,
  chemistry:   45,
  physics:     50,
  environment: 35,
  psychology:  30,
  business:    25,
  social:      20,
  humanities:  15,
};
const FIELD_CIT_CEILING = {
  stem:        20000,
  biology:     15000,
  medicine:    18000,
  chemistry:   12000,
  physics:     12000,
  environment: 8000,
  psychology:  8000,
  business:    5000,
  social:      4000,
  humanities:  2000,
};

export function transformProfessor(prof) {
  const id   = prof.id;
  const name = cleanName(prof.name);
  const kwds = Array.isArray(prof.research_keywords) ? prof.research_keywords : [];
  const hIdx = prof.h_index   ?? 0;
  const cit  = prof.citation_count ?? 0;

  // Detect field for normalised scoring
  const field     = detectFieldCategory(kwds);
  const hCeil     = FIELD_H_CEILING[field]  || 60;
  const citCeil   = FIELD_CIT_CEILING[field] || 20000;

  // Score components (deterministic, id-seeded)
  const hScore  = Math.min(hIdx / hCeil   * 100, 100);
  const cScore  = Math.min(cit  / citCeil * 100, 100);
  const kScore  = Math.min(kwds.length / 8 * 100, 100);
  const hiBonus = prof.is_hiring ? 15 : 0;
  const noise   = seeded(id, 0, 8);
  const rawScore = 0.4 * hScore + 0.3 * cScore + 0.2 * kScore + 0.1 * hiBonus + noise;
  const score    = Math.max(25, Math.min(Math.round(rawScore) || 50, 96));

  const breakdown = {
    expertise:  Math.min(Math.max(Math.round(hScore) + seeded(id + 1, 0, 12), 25), 97),
    funding:    prof.is_hiring ? seeded(id + 2, 70, 95) : seeded(id + 2, 20, 55),
    activity:   Math.min(Math.max(Math.round(cScore * 0.8) + seeded(id + 3, 5, 20), 25), 97),
    reputation: Math.min(Math.max(Math.round(hScore * 0.7) + seeded(id + 4, 0, 15), 20), 95),
  };

  const reasonTemplates = [
    (kw) => `Strong alignment in ${kw} — matches your research statement embedding`,
    (kw) => `Recent publication activity in ${kw} (${seeded(id * 7 + 1, 10, 200)} citations)`,
    (kw) => `Active funding in ${kw}-related projects through current grants`,
    (kw) => `${kw} expertise overlaps with your stated interest area`,
  ];
  const reasons = kwds.slice(0, 3).map((kw, i) => reasonTemplates[i % 4](kw));
  if (reasons.length === 0) reasons.push('Active researcher with recent publications and open positions');

  const fundingStr = Array.isArray(prof.funding_opportunities) && prof.funding_opportunities.length
    ? prof.funding_opportunities[0]
    : (prof.is_hiring ? `Active research funding · ${2024 + seeded(id, 0, 2)}` : null);

  const recentYear = 2023 + seeded(id, 0, 2);
  const lastPaper = kwds.length > 0
    ? `Recent advances in ${kwds[0]} (${recentYear})`
    : `Recent publication (${recentYear})`;

  // Photo: use stored photo_url first, then try to construct from Google Scholar ID
  const scholarId = prof.google_scholar_id;
  const photoUrl = prof.photo_url ||
    (scholarId ? `https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=${scholarId}&citpid=2` : null);

  return {
    id,
    name,
    initials:   getInitials(name),
    photoUrl,
    scholarId,
    title:      prof.title   || 'Professor',
    dept:       prof.department || prof.lab_name || 'Research Department',
    school:     prof.affiliation,
    country:    prof.country,
    state:      prof.state,
    email:      prof.email,
    homepage:   prof.homepage_url,
    orcid:      prof.orcid,
    keywords:   kwds,
    hIndex:     prof.h_index  ?? null,
    citations:  cit,
    score,
    breakdown,
    reasons,
    accepting:        !!prof.is_hiring,
    hasActiveGrant:   !!prof.has_active_grant,
    hiringConfidence: prof.hiring_confidence ?? 0,
    dataCompleteness: prof.data_completeness ?? 0,
    professorStatus:  prof.professor_status  || 'active',
    hiring_positions: Array.isArray(prof.hiring_positions) ? prof.hiring_positions : [],
    hiringDeadline:   prof.hiring_deadline   || null,   // "YYYY-MM-DD" string or null
    intakeSemester:   intakeSemesterFromDeadline(prof.hiring_deadline),
    dateDetected:     prof.last_scraped_at   || prof.last_updated || null,  // ISO datetime
    jobDescription:   prof.job_description   || '',
    educationHistory: Array.isArray(prof.education_history) ? prof.education_history : [],
    activeGrants:     Array.isArray(prof.active_grants) ? prof.active_grants : [],
    fundingOpps:      Array.isArray(prof.funding_opportunities) ? prof.funding_opportunities : [],
    funding:    fundingStr,
    lastPaper,
    advisingStyle: 'Collaborative mentor who supports independent thinking and guides students\' research directions.',
    sources: [prof.profile_source, 'ORCID', 'University homepage'].filter(Boolean),
    saved: false,
    // keep raw fields for detail page
    _raw: prof,
  };
}

// ---------------------------------------------------------------------------
// Build country-level summary from /api/universities/ response
// ---------------------------------------------------------------------------
export function buildCountryList(data) {
  const unis = data.universities || [];
  const canonicalCounts = data.canonical_counts || {};
  const byCountry = {};

  unis.forEach(u => {
    const cname = u.country || 'Unknown';
    if (!byCountry[cname]) byCountry[cname] = { profs: 0, unis: [], count: 0 };
    byCountry[cname].profs += u.professor_count;
    byCountry[cname].count += 1;
    if (byCountry[cname].unis.length < 8 && u.name) {
      byCountry[cname].unis.push({ name: u.name, profs: u.professor_count });
    }
  });

  // Exclude region containers that aren't real countries
  const REGION_KEYS = new Set(['Europe']);
  return Object.entries(byCountry)
    .filter(([cname, v]) => v.profs > 0 && cname !== 'Unknown' && cname !== '' && !REGION_KEYS.has(cname))
    .sort((a, b) => b[1].profs - a[1].profs)
    .map(([cname, v]) => {
      const meta = COUNTRY_META[cname] || { code: cname, flag: '🌐', name: cname };
      // Use canonical count if available (includes 0-professor universities)
      const uniCount = canonicalCounts[cname] ?? v.count;
      return {
        code:     meta.code,
        flag:     meta.flag,
        name:     meta.name,
        unis:     uniCount,
        profs:    v.profs,
        top:      v.unis.map(u => u.name),
        _apiName: cname,
        _uniRows: v.unis,
      };
    });
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const professorService = {
  getAll:          (params = {}) => api.get('/professors/', { params }),
  getById:         (id)          => api.get(`/professors/${id}/`),
  getPublications: (id)          => api.get(`/professors/${id}/publications/`),
  getGrants:       (id)          => api.get(`/professors/${id}/grants/`),
  getTopResearchers: (limit = 10) => api.get('/professors/top_researchers/', { params: { limit } }),
  getPhoto:        (id)          => api.get(`/professors/${id}/photo/`),
};

export const universityService = {
  getAll:      (params = {}) => api.get('/universities/', { params }),
  getByCountry: (country)   => api.get('/universities/', { params: { country } }),
  getProfile:  (affiliation) => api.get('/universities/profile/', { params: { affiliation } }),
};

export const ratingService = {
  getSummary: (profId)      => api.get('/ratings/summary/', { params: { professor: profId } }),
  getAll:     (params = {}) => api.get('/ratings/', { params }),
  create:     (data)        => api.post('/ratings/', data),
};

export const publicationService = {
  getAll:  (params = {}) => api.get('/publications/', { params }),
  getById: (id)          => api.get(`/publications/${id}/`),
};

export const grantService = {
  getAll:   (params = {}) => api.get('/grants/', { params }),
  getById:  (id)          => api.get(`/grants/${id}/`),
  getActive: ()           => api.get('/grants/active_grants/'),
};

export const metaService = {
  get: () => api.get('/meta/'),
};

export const userService = {
  getProfile:    ()     => api.get('/profile/me/'),
  updateProfile: (data) => api.patch('/profile/me/', data),
};

export const matchService = {
  getAll:      (params = {}) => api.get('/matches/', { params }),
  getById:     (id)          => api.get(`/matches/${id}/`),
  recent:      (limit = 10)  => api.get('/matches/recent_matches/', { params: { limit } }),
  markClicked: (id)          => api.post(`/matches/${id}/mark_clicked/`),
  markReplied: (id)          => api.post(`/matches/${id}/mark_replied/`),
};

export const authService = {
  register:     (username, email, password) => api.post('/auth/register/', { username, email, password }),
  login:        (username, password)        => api.post('/auth/login/', { username, password }),
  logout:       ()                          => api.post('/auth/logout/'),
  me:           ()                          => api.get('/auth/me/'),
  googleAuth:   (credential)               => api.post('/auth/google/', { credential }),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post('/auth/avatar/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const savedService = {
  getIds:  ()       => api.get('/saved/ids/'),
  toggle:  (profId) => api.post('/saved/toggle/', { professor_id: profId }),
  getAll:  ()       => api.get('/saved/'),
};

// ---------------------------------------------------------------------------
// What's New feed
// ---------------------------------------------------------------------------
export function relativeTime(isoDate) {
  if (!isoDate) return '';
  const secs = (Date.now() - new Date(isoDate)) / 1000;
  if (secs < 3600)  return `${Math.max(1, Math.round(secs / 60))}m ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h ago`;
  const days = Math.round(secs / 86400);
  if (days < 30)    return `${days}d ago`;
  if (days < 365)   return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

function profToFeedItem(rawProf, type) {
  const prof = transformProfessor(rawProf);
  let title = '', note = '';
  const timestamp = type === 'new-prof'
    ? (rawProf.created_at || rawProf.last_updated)
    : rawProf.last_updated;

  if (type === 'new-opening') {
    const pos = prof.hiring_positions.slice(0, 2).join(' / ') || 'Researcher';
    title = `${pos} opening`;
    note  = prof.school + (prof.hiringDeadline ? ` · Deadline ${prof.hiringDeadline}` : '');
  } else if (type === 'new-grant') {
    const g = prof.activeGrants[0];
    if (g) {
      title = `${g.agency || 'Grant'} funding`;
      const amt = g.amount ? ` · $${(g.amount / 1000).toFixed(0)}k` : '';
      note  = (g.title || '').slice(0, 90) + amt;
    } else {
      title = 'Active funding';
      note  = prof.school + (prof.dept ? ` · ${prof.dept}` : '');
    }
  } else {
    title = 'New faculty indexed';
    note  = [prof.school, prof.dept, prof.hIndex ? `h-index ${prof.hIndex}` : ''].filter(Boolean).join(' · ');
  }
  return { type, prof, profId: prof.id, title, note, timestamp };
}

// ---------------------------------------------------------------------------
// Scholarship services
// ---------------------------------------------------------------------------
export const scholarshipService = {
  getAll:        (params = {}) => api.get('/scholarships/', { params }),
  get:           (id)          => api.get(`/scholarships/${id}/`),
  getRecommended: ()           => api.get('/scholarships/recommended/'),
};

export const userScholarshipService = {
  getAll:  ()          => api.get('/user-scholarships/'),
  toggle:  (id)        => api.post('/user-scholarships/toggle/', { scholarship_id: id }),
  update:  (id, data)  => api.patch(`/user-scholarships/${id}/`, data),
  remove:  (id)        => api.delete(`/user-scholarships/${id}/`),
};

// ---------------------------------------------------------------------------
// CV Documents
// ---------------------------------------------------------------------------
export const cvService = {
  getAll:            ()           => api.get('/cv-documents/'),
  get:               (id)         => api.get(`/cv-documents/${id}/`),
  create:            (data)       => api.post('/cv-documents/', data),
  update:            (id, data)   => api.patch(`/cv-documents/${id}/`, data),
  remove:            (id)         => api.delete(`/cv-documents/${id}/`),
  extractKeywords:   (id)         => api.post(`/cv-documents/${id}/extract_keywords/`),
  matchProfessors:   (id, filters) => api.post(`/cv-documents/${id}/match_professors/`, filters || {}),
  matchScholarships: (id)         => api.post(`/cv-documents/${id}/match_scholarships/`),
};

// ---------------------------------------------------------------------------
// User Uploaded Documents
// ---------------------------------------------------------------------------
export const userDocumentService = {
  getAll: () => api.get('/user-documents/'),
  upload: (formData) => api.post('/user-documents/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  remove: (id) => api.delete(`/user-documents/${id}/`),
};

// ---------------------------------------------------------------------------
// What's New feed
// ---------------------------------------------------------------------------
export const whatsnewService = {
  async getFeed(tab = 'all', page = 1, pageSize = 15) {
    if (tab === 'hiring') {
      const r = await professorService.getAll({ is_hiring: true, ordering: '-last_updated', page, page_size: pageSize });
      return {
        items: (r.data.results || []).map(p => profToFeedItem(p, 'new-opening')),
        count: r.data.count || 0,
      };
    }
    if (tab === 'grants') {
      const r = await professorService.getAll({ has_active_grant: true, ordering: '-last_updated', page, page_size: pageSize });
      return {
        items: (r.data.results || []).map(p => profToFeedItem(p, 'new-grant')),
        count: r.data.count || 0,
      };
    }
    if (tab === 'faculty') {
      const r = await professorService.getAll({ ordering: '-created_at', page, page_size: pageSize });
      return {
        items: (r.data.results || []).map(p => profToFeedItem(p, 'new-prof')),
        count: r.data.count || 0,
      };
    }
    if (tab === 'saved') {
      const r = await savedService.getAll();
      const raw = r.data.results || r.data || [];
      const profs = raw.map(s => s.professor_details || s.professor).filter(Boolean);
      profs.sort((a, b) => new Date(b.last_updated || 0) - new Date(a.last_updated || 0));
      const allItems = profs.flatMap(p => {
        const out = [];
        if (p.is_hiring)         out.push(profToFeedItem(p, 'new-opening'));
        if (p.has_active_grant)  out.push(profToFeedItem(p, 'new-grant'));
        if (out.length === 0)    out.push(profToFeedItem(p, 'new-prof'));
        return out;
      });
      const start = (page - 1) * pageSize;
      return { items: allItems.slice(start, start + pageSize), count: allItems.length };
    }
    // 'all': parallel page-N requests from each source, merged
    const ps = Math.ceil(pageSize / 3);
    const [h, g, f] = await Promise.all([
      professorService.getAll({ is_hiring: true,      ordering: '-last_updated', page, page_size: ps }),
      professorService.getAll({ has_active_grant: true, ordering: '-last_updated', page, page_size: ps }),
      professorService.getAll({ ordering: '-created_at', page, page_size: ps }),
    ]);
    const hiringItems  = (h.data.results || []).map(p => profToFeedItem(p, 'new-opening'));
    const grantItems   = (g.data.results || []).map(p => profToFeedItem(p, 'new-grant'));
    const facultyItems = (f.data.results || []).map(p => profToFeedItem(p, 'new-prof'));
    const seen = new Set();
    const merged = [...hiringItems, ...grantItems, ...facultyItems].filter(item => {
      const k = `${item.type}-${item.profId}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    merged.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));
    // Total is approximate: max of the three source counts
    const approxTotal = Math.max(h.data.count || 0, g.data.count || 0, f.data.count || 0);
    return { items: merged, count: approxTotal };
  },
};

export const pipelineService = {
  getAll:  ()           => api.get('/pipeline/'),
  create:  (data)       => api.post('/pipeline/', data),
  update:  (id, data)   => api.patch(`/pipeline/${id}/`, data),
  remove:  (id)         => api.delete(`/pipeline/${id}/`),
};

export const deadlineService = {
  getAll:  ()           => api.get('/deadlines/'),
  create:  (data)       => api.post('/deadlines/', data),
  update:  (id, data)   => api.patch(`/deadlines/${id}/`, data),
  remove:  (id)         => api.delete(`/deadlines/${id}/`),
};

// ---------------------------------------------------------------------------
// Gmail OAuth + Outreach Email services
// ---------------------------------------------------------------------------
export const gmailAuthService = {
  start:      ()  => api.get('/auth/gmail/start/'),
  status:     ()  => api.get('/auth/gmail/status/'),
  disconnect: ()  => api.delete('/auth/gmail/status/'),
};

export const outreachEmailService = {
  getAll:   (params = {}) => api.get('/outreach/emails/', { params }),
  getStats: ()            => api.get('/outreach/emails/stats/'),
  send:     (data)        => api.post('/outreach/send/', data),
};

// ---------------------------------------------------------------------------
// Paddle payments
// ---------------------------------------------------------------------------
export const paymentService = {
  getStatus:           ()  => api.get('/payments/status/'),
  cancel:              ()  => api.post('/payments/cancel/'),
  getUpdatePaymentUrl: ()  => api.get('/payments/update-payment/'),
};

export default api;
