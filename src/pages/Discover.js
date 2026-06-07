import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Icon } from '../components/Icons';
import { Avatar, ScoreRing, Stars } from '../components/Shared';
import { professors } from '../data';
import { universityService, professorService, transformProfessor, buildCountryList, fundingExpirySemester, whatsnewService, relativeTime, savedService, COUNTRY_META, ratingService } from '../services/api';
import { useAuth } from '../App';

// Module-level cache — survives re-mounts, cleared only on page refresh
let _countryCache = null;

// Responsive breakpoint hook
function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024 };
}

// --- Paywall overlay ---
const MONTHLY_PRICE_ID = process.env.REACT_APP_PADDLE_MONTHLY_PRICE_ID || '';
const YEARLY_PRICE_ID  = process.env.REACT_APP_PADDLE_YEARLY_PRICE_ID  || '';

function PaywallOverlay({ title, subtitle }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(null); // 'monthly' | 'yearly' | null
  const [err, setErr] = useState(null);

  function checkout(priceId, key) {
    const Paddle = window.Paddle;
    if (!Paddle) { setErr('Payment system not loaded. Please refresh the page.'); return; }
    if (!priceId) { setErr('Price not configured.'); return; }
    setLoading(key);
    setErr(null);
    try {
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { userId: user?.id, username: user?.username },
        settings: {
          successUrl: `${window.location.origin}/app/matches?payment=success`,
        },
      });
    } catch (e) {
      setErr('Could not open checkout. Please try again.');
    }
    setLoading(null);
  }

  return (
    <div className="fade-in" style={{ padding: "80px 32px 0" }}>
      <div className="card" style={{ maxWidth: 540, margin: "0 auto", padding: "36px 32px", textAlign: "center", boxShadow: "var(--shadow-3)", border: "1px solid var(--green-soft-2)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center", margin: "0 auto" }}>
          <Icon.Sparkles size={24}/>
        </div>
        <h2 style={{ fontSize: 24, marginTop: 16, letterSpacing: "-0.02em" }}>{title}</h2>
        <p className="muted" style={{ fontSize: 14, maxWidth: 360, margin: "10px auto 0", lineHeight: 1.5 }}>{subtitle}</p>

        {/* Pricing cards */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          <div className="card" style={{ flex: '1 1 180px', maxWidth: 200, padding: '18px 16px', border: '2px solid var(--green-deep)', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: 'var(--green-deep)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap', letterSpacing: '0.06em' }}>BEST VALUE</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Yearly</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>$8<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-3)' }}>/mo</span></div>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 14 }}>$96 billed yearly · save 33%</div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading === 'yearly'}
              onClick={() => checkout(YEARLY_PRICE_ID, 'yearly')}>
              {loading === 'yearly' ? 'Opening…' : 'Start now'}
            </button>
          </div>
          <div className="card" style={{ flex: '1 1 180px', maxWidth: 200, padding: '18px 16px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Monthly</div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>$12<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ink-3)' }}>/mo</span></div>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 14 }}>Billed monthly</div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading === 'monthly'}
              onClick={() => checkout(MONTHLY_PRICE_ID, 'monthly')}>
              {loading === 'monthly' ? 'Opening…' : 'Start now'}
            </button>
          </div>
        </div>

        {err && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{err}</p>}

        <div className="row gap-4" style={{ justifyContent: "center", marginTop: 20, fontSize: 12, color: "var(--ink-3)" }}>
          <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> Cancel any time</span>
          <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> Student discount −40%</span>
          <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> Secure checkout</span>
        </div>
      </div>
    </div>
  );
}

// --- Mock university reviews (no reviews API yet) ---
const UNI_REVIEWS = [
  { author: "PhD student", stars: 5, role: "PhD candidate · CS",  time: "2 months ago", text: "Outstanding research environment with world-class faculty and strong industry connections.", helpful: 24 },
  { author: "Postdoc",     stars: 4, role: "Postdoctoral fellow",  time: "4 months ago", text: "Excellent facilities and collaborative atmosphere. Funding is competitive but available.", helpful: 18 },
  { author: "Masters",     stars: 4, role: "MSc student · EE",     time: "6 months ago", text: "Great professors and courses. The admin processes could be smoother, but research-wise fantastic.", helpful: 11 },
];

// --- ProfessorRow (shared in UniversityPage and CountryDetail) ---
function ProfessorRow({ p, i, go }) {
  const colors = [
    ['#dbeafe','#1d4ed8'],['#dcfce7','#15803d'],['#fef9c3','#a16207'],
    ['#fce7f3','#9d174d'],['#ede9fe','#6d28d9'],['#ffedd5','#c2410c'],
    ['#e0f2fe','#0369a1'],['#f0fdf4','#166534'],
  ];
  const [bg, fg] = colors[(p.id || i) % colors.length];
  return (
    <div
      className="row gap-3"
      style={{ padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : 0, cursor: "pointer", alignItems: "center" }}
      onClick={() => go("profDetail", { prof: p })}
      onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
      onMouseOut={e => e.currentTarget.style.background = ""}
    >
      {/* Avatar with deterministic color */}
      <div style={{ width: 38, height: 38, borderRadius: "50%", background: bg,
        color: fg, display: "grid", placeItems: "center", fontSize: 13,
        fontWeight: 700, flexShrink: 0, border: "1px solid var(--line)" }}>
        {p.initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
          {p.accepting && <span className="pill pill-green" style={{ fontSize: 10 }}>Hiring</span>}
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
          {[p.title, p.dept].filter(Boolean).join(' · ')}
        </div>
        <div className="row gap-1 mt-1" style={{ flexWrap: "wrap" }}>
          {p.keywords.slice(0, 3).map(k => (
            <span key={k} className="pill" style={{ fontSize: 10.5 }}>{k}</span>
          ))}
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {p.hIndex != null && (
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", color: "var(--ink)" }}>
            h={p.hIndex}
          </div>
        )}
        {p.citations > 0 && (
          <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 1 }}>
            {p.citations >= 1000 ? (p.citations / 1000).toFixed(1) + 'K' : p.citations} cit.
          </div>
        )}
      </div>
      <Icon.Chevron size={13} color="var(--ink-4)"/>
    </div>
  );
}

const UNI_PROF_PAGE_SIZE = 15;

// Skeleton shimmer block
const Sk = ({ w = "60%", h = 12 }) => (
  <div style={{ height: h, width: w, borderRadius: 4, background: "var(--paper-3)",
    backgroundImage: "linear-gradient(90deg, var(--paper-3) 25%, var(--paper-2) 50%, var(--paper-3) 75%)",
    backgroundSize: "200% 100%", animation: "shimmer 1.4s linear infinite" }}/>
);

// --- UniversityPage — exported, gets its own URL /app/university/:slug ---
export function UniversityPage({ uni, go }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [profs, setProfs]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(uni.profs ?? uni.professor_count ?? 0);
  const [tab, setTab]               = useState('overview');
  const [q, setQ]                   = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [hiringOnly, setHiringOnly] = useState(false);
  const [profPage, setProfPage]         = useState(1);
  const [profile, setProfile]           = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const affiliationKey = uni.affiliation || uni.name;
  const countryFlag    = uni.flag || '';
  const countryName    = uni.countryName || uni.country || '';

  useEffect(() => {
    setLoading(true);
    professorService.getAll({ affiliation: affiliationKey, ordering: '-citation_count', page_size: 200 })
      .then(res => {
        const results = (res.data.results || res.data || []).map(transformProfessor);
        setProfs(results);
        setTotal(res.data.count || results.length);
      })
      .catch(() => setProfs([]))
      .finally(() => setLoading(false));
  }, [affiliationKey]);

  useEffect(() => {
    setProfileLoading(true);
    universityService.getProfile(affiliationKey)
      .then(res => setProfile(res.data && res.data.affiliation ? res.data : null))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [affiliationKey]);

  // ── Derived stats ──
  const hiringCount    = profs.filter(p => p.accepting).length;
  const hIdxProfs      = profs.filter(p => p.hIndex != null && p.hIndex > 0);
  const avgHIndex      = hIdxProfs.length
    ? Math.round(hIdxProfs.reduce((s, p) => s + p.hIndex, 0) / hIdxProfs.length) : null;
  const totalCitations = profs.reduce((s, p) => s + (p.citations || 0), 0);
  const citStr         = totalCitations >= 1000000
    ? (totalCitations / 1000000).toFixed(1) + 'M'
    : totalCitations >= 1000
    ? (totalCitations / 1000).toFixed(1) + 'K'
    : totalCitations > 0 ? String(totalCitations) : '—';

  // Keyword frequency
  const kwFreq = {};
  profs.forEach(p => p.keywords.forEach(k => { kwFreq[k] = (kwFreq[k] || 0) + 1; }));
  const topKeywords  = Object.entries(kwFreq).sort((a, b) => b[1] - a[1]).slice(0, 30);
  const maxKwCount   = topKeywords.length ? topKeywords[0][1] : 1;

  // Department breakdown
  const deptCounts  = {};
  profs.forEach(p => { if (p.dept) deptCounts[p.dept] = (deptCounts[p.dept] || 0) + 1; });
  const topDepts    = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const allDepts    = topDepts.map(([d]) => d);
  const maxDeptCount = topDepts.length ? topDepts[0][1] : 1;

  // Top professors by h-index
  const topProfs = [...profs].sort((a, b) => (b.hIndex || 0) - (a.hIndex || 0)).slice(0, 6);

  // ── Professor tab filtering + pagination ──
  const filtered = profs.filter(p => {
    if (hiringOnly && !p.accepting) return false;
    if (deptFilter && p.dept !== deptFilter) return false;
    if (q.trim()) {
      const lq = q.toLowerCase();
      return p.name.toLowerCase().includes(lq) || p.keywords.some(k => k.toLowerCase().includes(lq));
    }
    return true;
  });
  const isFiltering    = !!(q.trim() || deptFilter || hiringOnly);
  const totalProfPages = Math.ceil(filtered.length / UNI_PROF_PAGE_SIZE);
  const pagedProfs     = isFiltering
    ? filtered
    : filtered.slice((profPage - 1) * UNI_PROF_PAGE_SIZE, profPage * UNI_PROF_PAGE_SIZE);

  return (
    <div className="fade-in" style={{ minHeight: "100%" }}>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <div style={{
        background: "linear-gradient(160deg, #060c16 0%, #0c1929 55%, #060c16 100%)",
        padding: "20px 32px 0",
      }}>
        {/* Breadcrumb */}
        <button
          onClick={() => window.history.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 22,
            background: "transparent", border: 0, color: "rgba(255,255,255,0.4)",
            fontSize: 12.5, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          onMouseOver={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}
          onMouseOut={e => e.currentTarget.style.color = "rgba(255,255,255,0.4)"}
        >
          <Icon.Chevron size={11} style={{ transform: "rotate(180deg)" }}/>
          {countryFlag && <span>{countryFlag}</span>} {countryName || 'Universities'}
        </button>

        {/* Main hero row: logo bubble + name/meta + CTAs */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28, flexWrap: isMobile ? "wrap" : "nowrap" }}>

          {/* Logo in white card */}
          <div style={{
            width: 72, height: 72, borderRadius: 18, background: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 10, flexShrink: 0, boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
          }}>
            {profile?.logo_url
              ? <img src={profile.logo_url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}/>
              : <Icon.Building size={30} color="#9ca3af"/>}
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: "white", fontSize: isMobile ? 22 : 30, fontWeight: 800,
              letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 10px" }}>
              {uni.name}
            </h1>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {profile?.institution_type && (
                <span style={{ background: "rgba(74,222,128,0.18)", border: "1px solid rgba(74,222,128,0.35)",
                  color: "#4ade80", fontSize: 11, fontWeight: 700, padding: "2px 9px",
                  borderRadius: 6, textTransform: "capitalize" }}>
                  {profile.institution_type}
                </span>
              )}
              {countryFlag && <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{countryFlag} {countryName}</span>}
              {(profile?.city || uni.state) && (
                <><span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{profile?.city || uni.state}</span></>
              )}
              {profile?.founded_year && (
                <><span style={{ color: "rgba(255,255,255,0.18)" }}>·</span>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Est. {profile.founded_year}</span></>
              )}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4,
                background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.25)",
                borderRadius: 999, padding: "2px 8px", color: "#4ade80", fontSize: 10.5, fontWeight: 600 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ade80", display: "inline-block" }}/>
                Live data
              </span>
            </div>

            {/* Quick external links */}
            {!profileLoading && (profile?.official_website || profile?.admissions_url || profile?.youtube_channel_url) && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {profile.official_website && (
                  <a href={profile.official_website} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.6)", padding: "4px 11px", borderRadius: 7,
                      textDecoration: "none", fontFamily: "inherit" }}
                    onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "white"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}>
                    <Icon.Globe size={11}/> Website
                  </a>
                )}
                {profile.admissions_url && (
                  <a href={profile.admissions_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                      background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)",
                      color: "#4ade80", padding: "4px 11px", borderRadius: 7,
                      textDecoration: "none", fontFamily: "inherit" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(74,222,128,0.25)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(74,222,128,0.15)"}>
                    <Icon.ExternalLink size={11}/> Apply
                  </a>
                )}
                {profile.youtube_channel_url && (
                  <a href={profile.youtube_channel_url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                      background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.25)",
                      color: "#f87171", padding: "4px 11px", borderRadius: 7,
                      textDecoration: "none", fontFamily: "inherit" }}
                    onMouseOver={e => e.currentTarget.style.background = "rgba(220,38,38,0.2)"}
                    onMouseOut={e => e.currentTarget.style.background = "rgba(220,38,38,0.12)"}>
                    ▶ YouTube
                  </a>
                )}
              </div>
            )}
          </div>

          {/* CTA Buttons */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 8, flexShrink: 0, alignSelf: "flex-start" }}>
              <button
                onClick={() => { setTab('professors'); setHiringOnly(true); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px",
                  borderRadius: 9, background: "#4ade80", color: "#052e16",
                  border: 0, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  boxShadow: "0 2px 12px rgba(74,222,128,0.3)" }}>
                <Icon.Inbox size={13}/> View openings
                {!loading && hiringCount > 0 && (
                  <span style={{ background: "#052e16", color: "#4ade80", borderRadius: 999,
                    padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>{hiringCount}</span>
                )}
              </button>
              <button
                onClick={() => setTab('professors')}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px",
                  borderRadius: 9, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.12)", fontWeight: 500, fontSize: 13,
                  cursor: "pointer", fontFamily: "inherit" }}>
                Browse faculty
              </button>
            </div>
          )}
        </div>

        {/* ── Stat strip ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${[true, true, true, true, !!profile?.founded_year, !!profile?.student_count].filter(Boolean).length}, 1fr)`,
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}>
          {[
            { label: "Professors",     value: loading ? '…' : total.toLocaleString(),                           accent: null },
            { label: "Actively hiring",value: loading ? '…' : (hiringCount > 0 ? hiringCount : '—'),            accent: hiringCount > 0 ? "#4ade80" : null },
            { label: "Avg h-index",    value: loading ? '…' : (avgHIndex ?? '—'),                               accent: null },
            { label: "Total citations",value: loading ? '…' : citStr,                                           accent: null },
            ...(profile?.founded_year   ? [{ label: "Founded",  value: profile.founded_year,                                                                            accent: null }] : []),
            ...(profile?.student_count  ? [{ label: "Students", value: profile.student_count >= 1000 ? Math.round(profile.student_count / 1000) + 'K+' : profile.student_count, accent: null }] : []),
          ].map((s, i) => (
            <div key={s.label} style={{
              padding: "16px 0 16px", paddingLeft: i === 0 ? 0 : 16,
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.07)" : "none", paddingRight: 16,
            }}>
              <div style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, letterSpacing: "-0.03em",
                fontFamily: "var(--font-mono)", color: s.accent || "white", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", marginTop: 4, letterSpacing: "0.02em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 0, marginTop: 0 }}>
          {[
            ['overview',   'Overview'],
            ['professors', `Faculty${!loading && total > 0 ? ' · ' + total : ''}`],
            ['campus',     'Campus & Info'],
            ['reviews',    'Reviews'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ padding: "12px 18px", border: 0, background: "transparent",
                cursor: "pointer", fontFamily: "inherit", fontSize: 13.5, whiteSpace: "nowrap",
                fontWeight: tab === id ? 600 : 400,
                color: tab === id ? "white" : "rgba(255,255,255,0.4)",
                borderBottom: tab === id ? "2px solid #4ade80" : "2px solid transparent",
                marginBottom: -1 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab content ───────────────────────────────────────── */}
      <div style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ══ OVERVIEW TAB ══ */}
        {tab === 'overview' && (
          <div style={{ display: "grid", gap: 28 }}>

            {/* ── Institution profile card ── */}
            {!profileLoading && profile && (
              <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--line)", boxShadow: "var(--shadow-1)" }}>
                {/* Green gradient header */}
                <div style={{
                  background: "linear-gradient(135deg, #052e16 0%, #14532d 60%, #166534 100%)",
                  padding: "24px 28px", display: "flex", gap: 20, alignItems: "flex-start",
                }}>
                  {profile.logo_url && (
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: 8, flexShrink: 0, boxShadow: "0 2px 12px rgba(0,0,0,0.25)" }}>
                      <img src={profile.logo_url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}/>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginBottom: 6, letterSpacing: "-0.01em" }}>
                      About {uni.name}
                    </div>
                    {profile.description && (
                      <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, lineHeight: 1.6, margin: 0,
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {profile.description}
                      </p>
                    )}
                  </div>
                </div>
                {/* Facts strip */}
                {[profile.founded_year, profile.institution_type, profile.student_count, profile.city, profile.country].some(Boolean) && (
                  <div style={{ background: "white", display: "flex", flexWrap: "wrap", borderTop: "1px solid var(--line)" }}>
                    {[
                      profile.founded_year     && { label: "Founded",  value: profile.founded_year },
                      profile.institution_type && { label: "Type",     value: profile.institution_type.charAt(0).toUpperCase() + profile.institution_type.slice(1) },
                      profile.student_count    && { label: "Students", value: profile.student_count >= 1000 ? Math.round(profile.student_count / 1000) + 'K+' : profile.student_count },
                      profile.city             && { label: "Location", value: profile.city },
                      profile.country          && { label: "Country",  value: profile.country },
                    ].filter(Boolean).map((fact, i) => (
                      <div key={fact.label} style={{ padding: "14px 20px", flex: "1 1 120px",
                        borderLeft: i > 0 ? "1px solid var(--line)" : "none" }}>
                        <div style={{ fontSize: 10, color: "var(--ink-4)", textTransform: "uppercase",
                          letterSpacing: "0.08em", marginBottom: 3 }}>{fact.label}</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{fact.value}</div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Action links */}
                {(profile.admissions_url || profile.official_website || profile.youtube_channel_url) && (
                  <div style={{ background: "var(--paper-2)", borderTop: "1px solid var(--line)",
                    padding: "12px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {profile.official_website && (
                      <a href={profile.official_website} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Icon.Globe size={12}/> Official website
                      </a>
                    )}
                    {profile.admissions_url && (
                      <a href={profile.admissions_url} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                        <Icon.ExternalLink size={12}/> Apply / Admissions
                      </a>
                    )}
                    {profile.youtube_channel_url && (
                      <a href={profile.youtube_channel_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5,
                          padding: "5px 12px", borderRadius: 7, border: "1px solid rgba(220,38,38,0.3)",
                          background: "rgba(220,38,38,0.06)", color: "#dc2626",
                          textDecoration: "none", fontFamily: "inherit" }}>
                        ▶ YouTube channel
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Two-column layout: Research areas + Top professors */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>

              {/* LEFT — Research areas */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "var(--ink-4)", margin: 0 }}>
                    Research areas
                  </h3>
                  {!loading && topKeywords.length > 0 && (
                    <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>
                      {topKeywords.length} distinct areas
                    </span>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[...Array(12)].map((_, i) => (
                      <Sk key={i} w={60 + (i % 4) * 20} h={28}/>
                    ))}
                  </div>
                ) : topKeywords.length === 0 ? (
                  <p className="muted" style={{ fontSize: 13 }}>No keyword data available.</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {topKeywords.map(([kw, count]) => {
                      const weight = count / maxKwCount;
                      const isTop  = weight >= 0.6;
                      return (
                        <button key={kw} onClick={() => { setTab('professors'); setQ(kw); }}
                          style={{
                            padding: isTop ? "6px 13px" : "4px 10px",
                            borderRadius: 999,
                            fontSize: isTop ? 13 : 12,
                            fontWeight: isTop ? 600 : 400,
                            border: `1px solid ${isTop ? "var(--green-soft-2)" : "var(--line)"}`,
                            background: isTop ? "var(--green-soft)" : "white",
                            color: isTop ? "var(--green-deep)" : "var(--ink-2)",
                            cursor: "pointer", fontFamily: "inherit",
                            transition: "all 0.1s",
                          }}>
                          {kw}
                          <span style={{ marginLeft: 5, fontSize: 10.5,
                            color: isTop ? "var(--green-deep)" : "var(--ink-4)",
                            fontFamily: "var(--font-mono)", opacity: 0.7 }}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Department breakdown */}
                {!loading && topDepts.length > 0 && (
                  <div style={{ marginTop: 28 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.06em", color: "var(--ink-4)", margin: "0 0 14px" }}>
                      Departments
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0,
                      border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                      {topDepts.map(([dept, count], i) => {
                        const pct = Math.round(count / maxDeptCount * 100);
                        return (
                          <div key={dept}
                            onClick={() => { setTab('professors'); setDeptFilter(dept); }}
                            onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
                            onMouseOut={e => e.currentTarget.style.background = "white"}
                            style={{ display: "flex", alignItems: "center", gap: 14,
                              padding: "11px 18px", cursor: "pointer", background: "white",
                              borderTop: i ? "1px solid var(--line)" : "none" }}>
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 500,
                              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {dept}
                            </span>
                            {/* Progress bar */}
                            <div style={{ width: 140, position: "relative" }}>
                              <div style={{ height: 6, borderRadius: 999,
                                background: "var(--paper-3)", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: pct + "%",
                                  borderRadius: 999, background: "var(--green-deep)",
                                  transition: "width 0.4s ease" }}/>
                              </div>
                            </div>
                            <span style={{ width: 38, textAlign: "right", fontSize: 12,
                              fontFamily: "var(--font-mono)", color: "var(--ink-3)" }}>
                              {count}
                            </span>
                            <Icon.Chevron size={11} color="var(--ink-4)"/>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT — Top professors */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "var(--ink-4)", margin: 0 }}>
                    Top faculty
                  </h3>
                  {!loading && (
                    <button onClick={() => setTab('professors')}
                      style={{ background: "none", border: 0, cursor: "pointer",
                        fontSize: 12, color: "var(--green-deep)", fontFamily: "inherit",
                        display: "flex", alignItems: "center", gap: 3 }}>
                      All {total} <Icon.Chevron size={11}/>
                    </button>
                  )}
                </div>

                {loading ? (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px",
                        borderTop: i ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                        <Sk w={38} h={38}/>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                          <Sk w="70%"/>
                          <Sk w="50%" h={10}/>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topProfs.length > 0 ? (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                    {topProfs.map((p, i) => <ProfessorRow key={p.id} p={p} i={i} go={go}/>)}
                  </div>
                ) : (
                  <div style={{ border: "1px solid var(--line)", borderRadius: 12,
                    padding: 24, textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>
                    No faculty data loaded yet.
                  </div>
                )}

                {/* Hiring spotlight */}
                {!loading && hiringCount > 0 && (
                  <div onClick={() => { setTab('professors'); setHiringOnly(true); }}
                    style={{ marginTop: 12, padding: "14px 18px", borderRadius: 12, cursor: "pointer",
                      background: "var(--green-soft)", border: "1px solid var(--green-soft-2)",
                      display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-deep)",
                      color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon.Award size={15}/>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "var(--green-deep)" }}>
                        {hiringCount} professor{hiringCount !== 1 ? 's' : ''} actively hiring
                      </div>
                      <div style={{ fontSize: 12, color: "var(--green-deep)", opacity: 0.7, marginTop: 1 }}>
                        View open positions →
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        )}

        {/* ══ PROFESSORS TAB ══ */}
        {tab === 'professors' && (
          <>
            {/* Search + filter bar */}
            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center",
                padding: "8px 14px", borderRadius: 10, border: "1px solid var(--line)",
                background: "white", flex: 1, minWidth: 200, maxWidth: 340 }}>
                <Icon.Search size={14} color="var(--ink-4)"/>
                <input value={q} onChange={e => { setQ(e.target.value); setProfPage(1); }}
                  placeholder="Search by name or keyword…"
                  style={{ border: 0, outline: 0, background: "transparent", flex: 1, fontSize: 13, fontFamily: "inherit" }}/>
                {q && (
                  <button onClick={() => { setQ(''); setProfPage(1); }}
                    style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}>
                    <Icon.X size={12} color="var(--ink-4)"/>
                  </button>
                )}
              </div>
              <button
                className={"chip" + (hiringOnly ? " selected" : "")}
                onClick={() => { setHiringOnly(v => !v); setProfPage(1); }}>
                <Icon.Award size={11}/> Hiring only
                {hiringOnly && hiringCount > 0 && (
                  <span style={{ marginLeft: 4, fontSize: 11, fontFamily: "var(--font-mono)" }}>{hiringCount}</span>
                )}
              </button>
              {isFiltering && (
                <button className="btn btn-sm btn-ghost"
                  onClick={() => { setQ(''); setDeptFilter(''); setHiringOnly(false); setProfPage(1); }}>
                  <Icon.X size={11}/> Clear
                </button>
              )}
              {!loading && (
                <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-4)", fontFamily: "var(--font-mono)" }}>
                  {isFiltering ? filtered.length : total} {isFiltering ? "match" : "total"}
                </span>
              )}
            </div>

            {/* Department filter chips */}
            {allDepts.length > 0 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
                <button className={"chip" + (deptFilter === '' ? " selected" : "")}
                  onClick={() => { setDeptFilter(''); setProfPage(1); }}>All</button>
                {allDepts.map(d => (
                  <button key={d} className={"chip" + (deptFilter === d ? " selected" : "")}
                    onClick={() => { setDeptFilter(d); setProfPage(1); }}
                    style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {d}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "14px 20px",
                    borderTop: i ? "1px solid var(--line)" : "none", alignItems: "center" }}>
                    <Sk w={38} h={38}/>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <Sk w="40%"/>
                      <Sk w="60%" h={10}/>
                    </div>
                    <Sk w={44} h={44}/>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ border: "1px solid var(--line)", borderRadius: 12,
                padding: "48px 32px", textAlign: "center" }}>
                <Icon.Search size={28} color="var(--ink-4)"/>
                <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>
                  {isFiltering ? "No professors match the current filters." : "No professors indexed yet."}
                </p>
                {isFiltering && (
                  <button className="btn btn-sm" style={{ marginTop: 12 }}
                    onClick={() => { setQ(''); setDeptFilter(''); setHiringOnly(false); setProfPage(1); }}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
                  {pagedProfs.map((p, i) => <ProfessorRow key={p.id} p={p} i={i} go={go}/>)}
                </div>

                {!isFiltering && totalProfPages > 1 && (
                  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20, alignItems: "center" }}>
                    <button className="btn btn-sm" disabled={profPage === 1}
                      onClick={() => setProfPage(p => p - 1)}
                      style={{ opacity: profPage === 1 ? 0.4 : 1 }}>
                      <Icon.Chevron size={13} style={{ transform: "rotate(180deg)" }}/> Prev
                    </button>
                    {[...Array(totalProfPages)].map((_, i) => {
                      const p = i + 1;
                      const show = p === 1 || p === totalProfPages || Math.abs(p - profPage) <= 1;
                      if (!show) {
                        if (p === 2 || p === totalProfPages - 1)
                          return <span key={p} className="muted" style={{ fontSize: 13 }}>…</span>;
                        return null;
                      }
                      return (
                        <button key={p} onClick={() => setProfPage(p)}
                          style={{ width: 32, height: 32, borderRadius: 6,
                            border: "1px solid var(--line)",
                            background: profPage === p ? "var(--green-deep)" : "white",
                            color: profPage === p ? "white" : "var(--ink)",
                            fontWeight: profPage === p ? 600 : 400,
                            fontSize: 13, cursor: "pointer" }}>
                          {p}
                        </button>
                      );
                    })}
                    <button className="btn btn-sm" disabled={profPage === totalProfPages}
                      onClick={() => setProfPage(p => p + 1)}
                      style={{ opacity: profPage === totalProfPages ? 0.4 : 1 }}>
                      Next <Icon.Chevron size={13}/>
                    </button>
                    <span className="muted" style={{ fontSize: 11.5, marginLeft: 8, fontFamily: "var(--font-mono)" }}>
                      {(profPage - 1) * UNI_PROF_PAGE_SIZE + 1}–{Math.min(profPage * UNI_PROF_PAGE_SIZE, filtered.length)} of {filtered.length}
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ══ REVIEWS TAB ══ */}
        {tab === 'reviews' && (
          <div style={{ maxWidth: 680 }}>
            {/* Rating header */}
            <div style={{ display: "flex", gap: 24, alignItems: "center",
              padding: "20px 24px", borderRadius: 14, background: "white",
              border: "1px solid var(--line)", marginBottom: 20 }}>
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: "-0.04em",
                  lineHeight: 1, color: "var(--ink)" }}>
                  4.3
                </div>
                <Stars n={4} size={14}/>
                <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 4 }}>
                  {UNI_REVIEWS.length} reviews
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                {[5,4,3,2,1].map(s => {
                  const ct = UNI_REVIEWS.filter(r => r.stars === s).length;
                  const pct = Math.round(ct / UNI_REVIEWS.length * 100);
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                      <span style={{ width: 8, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>{s}</span>
                      <Icon.StarF size={10} color="oklch(0.7 0.13 75)"/>
                      <div style={{ flex: 1, height: 6, borderRadius: 999, background: "var(--paper-3)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: pct + "%", background: "oklch(0.7 0.13 75)", borderRadius: 999 }}/>
                      </div>
                      <span style={{ width: 24, textAlign: "right", color: "var(--ink-4)",
                        fontFamily: "var(--font-mono)" }}>{ct}</span>
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-sm btn-primary" style={{ flexShrink: 0 }}>
                <Icon.Plus size={12}/> Write review
              </button>
            </div>

            {/* Review cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {UNI_REVIEWS.map((r, i) => (
                <div key={i} style={{ padding: "20px 22px", borderRadius: 14,
                  background: "white", border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <Stars n={r.stars} size={13}/>
                      <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>{r.role}</div>
                    </div>
                    <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{r.time}</span>
                  </div>
                  <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 16.5,
                    color: "var(--ink)", margin: 0, fontStyle: "italic",
                    lineHeight: 1.6, borderLeft: "3px solid var(--green-soft-2)",
                    paddingLeft: 14 }}>
                    "{r.text}"
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                    <button className="btn btn-sm btn-ghost" style={{ fontSize: 12 }}>
                      <Icon.Check size={11}/> Helpful · {r.helpful}
                    </button>
                    <button className="btn btn-sm btn-ghost" style={{ fontSize: 12 }}>
                      <Icon.Reply size={11}/> Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ CAMPUS & INFO TAB ══ */}
        {tab === 'campus' && (
          <div style={{ display: "grid", gap: 20 }}>

            {profileLoading ? (
              <div style={{ display: "grid", gap: 16 }}>
                <Sk w="100%" h={200}/>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  {[...Array(6)].map((_, i) => <Sk key={i} h={86}/>)}
                </div>
                <Sk w="100%" h={80}/>
              </div>
            ) : !profile ? (
              <div style={{ textAlign: "center", padding: "64px 32px", border: "1px solid var(--line)",
                borderRadius: 16, background: "white" }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>🏛️</div>
                <h3 style={{ fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>Campus details coming soon</h3>
                <p className="muted" style={{ fontSize: 13.5, maxWidth: 380, margin: "0 auto" }}>
                  We haven't enriched this university's profile yet. Check back later or try running the enrichment scraper.
                </p>
              </div>
            ) : (
              <>
                {/* ── Header: logo + name + full description ── */}
                <div style={{
                  borderRadius: 18, overflow: "hidden",
                  background: "linear-gradient(135deg, #0c1929 0%, #1e3a5f 100%)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                }}>
                  <div style={{ padding: "28px 32px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                    {profile.logo_url ? (
                      <div style={{ width: 80, height: 80, borderRadius: 18, background: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 12, flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                        <img src={profile.logo_url} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}/>
                      </div>
                    ) : (
                      <div style={{ width: 80, height: 80, borderRadius: 18, background: "rgba(255,255,255,0.08)",
                        display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <Icon.Building size={36} color="rgba(255,255,255,0.4)"/>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: "white", fontWeight: 800, fontSize: isMobile ? 20 : 24,
                        letterSpacing: "-0.02em", marginBottom: 10 }}>
                        {profile.display_name || uni.name}
                      </div>
                      {profile.description ? (
                        <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                          {profile.description}
                        </p>
                      ) : (
                        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13.5, margin: 0, fontStyle: "italic" }}>
                          No description available yet.
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Quick fact pills at the bottom of the header */}
                  {[profile.founded_year, profile.institution_type, profile.city, profile.country].some(Boolean) && (
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "14px 32px",
                      display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {profile.founded_year && (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                          <span style={{ color: "rgba(255,255,255,0.25)", marginRight: 6 }}>Est.</span>
                          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{profile.founded_year}</span>
                        </span>
                      )}
                      {profile.institution_type && (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, textTransform: "capitalize" }}>
                          <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{profile.institution_type}</span>
                        </span>
                      )}
                      {profile.city && (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                          📍 <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{profile.city}{profile.country ? ', ' + profile.country : ''}</span>
                        </span>
                      )}
                      {profile.student_count && (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>
                          👥 <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                            {profile.student_count >= 1000 ? Math.round(profile.student_count / 1000) + 'K' : profile.student_count} students
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Admissions card (always shown) ── */}
                {profile.official_website && (() => {
                  const applyUrl  = profile.admissions_url ||
                    profile.official_website.replace(/\/$/, '') + '/admissions';
                  const websiteHost = profile.official_website.replace(/^https?:\/\//, '').split('/')[0];
                  return (
                    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(34,197,94,0.3)",
                      background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
                      {/* Card header */}
                      <div style={{ padding: "20px 28px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#16a34a",
                          display: "grid", placeItems: "center", flexShrink: 0 }}>
                          <Icon.ExternalLink size={20} color="white"/>
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 16, color: "#14532d", letterSpacing: "-0.01em" }}>
                            Admissions &amp; Applications
                          </div>
                          <div style={{ fontSize: 12.5, color: "#16a34a", marginTop: 2 }}>
                            {profile.admissions_url
                              ? 'Dedicated admissions portal available'
                              : 'Visit the official website for admissions info'}
                          </div>
                        </div>
                      </div>

                      {/* Quick facts strip */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 0,
                        borderTop: "1px solid rgba(34,197,94,0.2)", borderBottom: "1px solid rgba(34,197,94,0.2)",
                        background: "rgba(255,255,255,0.5)" }}>
                        {[
                          profile.founded_year     && { label: "Est.", value: String(profile.founded_year) },
                          profile.student_count    && { label: "Students", value: profile.student_count >= 1000 ? Math.round(profile.student_count / 1000) + 'K+' : String(profile.student_count) },
                          profile.institution_type && { label: "Type", value: profile.institution_type.charAt(0).toUpperCase() + profile.institution_type.slice(1) },
                          profile.city             && { label: "Location", value: profile.city + (profile.state_region ? ', ' + profile.state_region : '') },
                        ].filter(Boolean).map((f, i) => (
                          <div key={f.label} style={{ padding: "12px 24px", flex: "1 1 140px",
                            borderLeft: i > 0 ? "1px solid rgba(34,197,94,0.2)" : "none" }}>
                            <div style={{ fontSize: 10, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>{f.label}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#14532d" }}>{f.value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Action buttons */}
                      <div style={{ padding: "18px 28px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px",
                            borderRadius: 10, background: "#16a34a", color: "white",
                            fontWeight: 700, fontSize: 14, textDecoration: "none", fontFamily: "inherit",
                            boxShadow: "0 2px 12px rgba(22,163,74,0.35)" }}
                          onMouseOver={e => e.currentTarget.style.background = "#15803d"}
                          onMouseOut={e => e.currentTarget.style.background = "#16a34a"}>
                          Apply Now <Icon.ExternalLink size={13}/>
                        </a>
                        <a href={profile.official_website} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px",
                            borderRadius: 10, border: "1px solid rgba(34,197,94,0.4)",
                            background: "rgba(255,255,255,0.6)", color: "#15803d",
                            fontWeight: 500, fontSize: 13.5, textDecoration: "none", fontFamily: "inherit" }}
                          onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.9)"}
                          onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.6)"}>
                          <Icon.Globe size={13}/> {websiteHost}
                        </a>
                      </div>
                    </div>
                  );
                })()}

                {/* ── 3×2 facts grid ── */}
                {[profile.founded_year, profile.student_count, profile.institution_type, profile.city, profile.country, profile.state_region].some(Boolean) && (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)", gap: 12 }}>
                    {[
                      profile.founded_year     && { emoji: "🏛️", label: "Founded",  value: profile.founded_year },
                      profile.student_count    && { emoji: "👥", label: "Students", value: profile.student_count >= 1000 ? Math.round(profile.student_count / 1000) + 'K+' : profile.student_count },
                      profile.institution_type && { emoji: "🎓", label: "Type",     value: profile.institution_type.charAt(0).toUpperCase() + profile.institution_type.slice(1) },
                      profile.city             && { emoji: "📍", label: "City",     value: profile.city },
                      profile.country          && { emoji: "🌍", label: "Country",  value: profile.country },
                      profile.state_region     && { emoji: "🗺️", label: "Region",   value: profile.state_region },
                    ].filter(Boolean).map(fact => (
                      <div key={fact.label} style={{ background: "white", borderRadius: 14,
                        border: "1px solid var(--line)", padding: "18px 20px",
                        display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 26, lineHeight: 1 }}>{fact.emoji}</span>
                        <div>
                          <div style={{ fontSize: 10.5, color: "var(--ink-4)", textTransform: "uppercase",
                            letterSpacing: "0.07em", marginBottom: 3 }}>{fact.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>{fact.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* YouTube card */}
                {profile.youtube_channel_url && (
                  <a href={profile.youtube_channel_url} target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 16,
                      padding: "20px 24px", borderRadius: 14,
                      border: "1px solid rgba(220,38,38,0.2)",
                      background: "linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%)",
                      transition: "box-shadow 0.15s" }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(220,38,38,0.15)"}
                    onMouseOut={e => e.currentTarget.style.boxShadow = "none"}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#dc2626",
                      display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <span style={{ color: "white", fontSize: 18, lineHeight: 1 }}>▶</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#7f1d1d", marginBottom: 2 }}>Official YouTube Channel</div>
                      <div style={{ fontSize: 12, color: "#dc2626" }}>Watch campus tours &amp; promo videos</div>
                    </div>
                    <Icon.ExternalLink size={14} color="#dc2626"/>
                  </a>
                )}

                {/* Institution highlights / characteristics */}
                {profile.characteristics?.length > 0 && (
                  <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--line)", padding: "20px 24px" }}>
                    <h4 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase",
                      letterSpacing: "0.07em", color: "var(--ink-4)" }}>Institution Highlights</h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {profile.characteristics.map(c => (
                        <span key={c} style={{ padding: "5px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                          background: "var(--green-soft)", border: "1px solid var(--green-soft-2)", color: "var(--green-deep)" }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ROR / OpenAlex IDs */}
                {(profile.ror_id || profile.openalex_id) && (
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {profile.ror_id && (
                      <a href={`https://ror.org/${profile.ror_id}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 11.5, color: "var(--ink-3)", textDecoration: "none",
                          padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "white" }}>
                        ROR: {profile.ror_id}
                      </a>
                    )}
                    {profile.openalex_id && (
                      <a href={`https://openalex.org/institutions/${profile.openalex_id}`} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6,
                          fontSize: 11.5, color: "var(--ink-3)", textDecoration: "none",
                          padding: "4px 10px", borderRadius: 6, border: "1px solid var(--line)", background: "white" }}>
                        OpenAlex: {profile.openalex_id}
                      </a>
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

// --- CountryDetail — exported so AppShell can render it at /app/countries/:slug ---
const UNI_PAGE_SIZE = 20;

export function CountryDetail({ country, go }) {
  const { isMobile, isTablet } = useBreakpoint();
  const onBack = () => window.history.back();
  const [uniRows, setUniRows] = useState(country._uniRows || country.top.map(name => ({ name, profs: 0 })));
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [uniTotal, setUniTotal] = useState(country.unis);
  const [uniQ, setUniQ] = useState('');
  const [uniState, setUniState] = useState('');
  const [uniPage, setUniPage] = useState(1);
  const [stateDropOpen, setStateDropOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const stateDropRef = useRef(null);

  useEffect(() => {
    const apiName = country._apiName || country.name;

    universityService.getByCountry(apiName)
      .then(res => {
        const unis = res.data.universities || [];
        if (unis.length > 0) {
          setUniRows(unis.map(u => ({
            name: u.name,
            affiliation: u.affiliation,
            state: u.state || '',
            profs: u.professor_count,
          })));
          setUniTotal(unis.length);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingUnis(false));
  }, [country.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close state dropdown on outside click
  useEffect(() => {
    if (!stateDropOpen) return;
    const handler = (e) => {
      if (stateDropRef.current && !stateDropRef.current.contains(e.target)) {
        setStateDropOpen(false);
        setStateSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [stateDropOpen]);

  const availableStates = [...new Set(uniRows.map(u => u.state).filter(Boolean))].sort();

  const stateFiltered = uniState
    ? uniRows.filter(u => u.state === uniState)
    : uniRows;

  const filteredUnis = uniQ.trim()
    ? stateFiltered.filter(u => u.name.toLowerCase().includes(uniQ.toLowerCase()))
    : stateFiltered;

  const isUniSearching = uniQ.trim().length > 0;
  const totalUniPages  = Math.ceil(filteredUnis.length / UNI_PAGE_SIZE);
  const pagedUnis      = isUniSearching
    ? filteredUnis
    : filteredUnis.slice((uniPage - 1) * UNI_PAGE_SIZE, uniPage * UNI_PAGE_SIZE);


  return (
    <div className="fade-in" style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <button className="btn btn-sm btn-ghost" onClick={onBack} style={{ marginLeft: -8, marginBottom: 16 }}>
        <Icon.Chevron size={12} style={{ transform: "rotate(180deg)" }}/> All countries
      </button>
      <div className="row gap-4" style={{ marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: isMobile ? 40 : 56, lineHeight: 1 }}>{country.flag}</span>
        <div>
          <h1 style={{ fontSize: isMobile ? 26 : 36, letterSpacing: "-0.025em" }}>{country.name}</h1>
          <div className="row gap-3 muted" style={{ marginTop: 4, fontSize: 14 }}>
            <span><span className="mono" style={{ color: "var(--ink)" }}>{uniTotal}</span> universities</span>
            <span><span className="mono" style={{ color: "var(--ink)" }}>{country.profs.toLocaleString()}</span> professors indexed</span>
            <span className="pill pill-green">Live data</span>
          </div>
        </div>
      </div>

      {/* Universities table */}
      <div className="card" style={{ padding: 0, marginBottom: 28, overflow: "hidden" }}>
        {/* Table header: title + search + state dropdown */}
        <div className="row between" style={{ padding: "14px 20px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)", gap: 12, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 500 }}>Universities</span>
            {!loadingUnis && (
              <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
                {filteredUnis.length !== uniRows.length
                  ? `${filteredUnis.length} of ${uniTotal}`
                  : uniTotal} total
              </span>
            )}
          </div>
          <div className="row gap-2">
            {/* University name search */}
            <div className="row gap-2" style={{ padding: "6px 10px", borderRadius: 7, border: "1px solid var(--line)", background: "white", width: isMobile ? "100%" : 220 }}>
              <Icon.Search size={13} color="var(--ink-4)"/>
              <input
                value={uniQ}
                onChange={e => { setUniQ(e.target.value); setUniPage(1); }}
                placeholder="Search universities…"
                style={{ border: 0, outline: 0, background: "transparent", flex: 1, fontSize: 12.5 }}
              />
              {uniQ && (
                <button onClick={() => { setUniQ(''); setUniPage(1); }} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}>
                  <Icon.X size={12} color="var(--ink-4)"/>
                </button>
              )}
            </div>

            {/* State / region dropdown */}
            {!loadingUnis && availableStates.length > 0 && (
              <div ref={stateDropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => { setStateDropOpen(v => !v); setStateSearch(''); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", borderRadius: 7,
                    border: `1px solid ${uniState ? "var(--green-deep)" : "var(--line)"}`,
                    background: uniState ? "var(--green-soft)" : "white",
                    color: uniState ? "var(--green-deep)" : "var(--ink)",
                    fontSize: 12.5, cursor: "pointer", whiteSpace: "nowrap",
                  }}
                >
                  <Icon.Filter size={12} color={uniState ? "var(--green-deep)" : "var(--ink-4)"}/>
                  {uniState || "All states"}
                  {uniState && (
                    <span
                      onClick={e => { e.stopPropagation(); setUniState(''); setUniPage(1); setStateDropOpen(false); }}
                      style={{ display: "grid", placeItems: "center", marginLeft: 2 }}
                    >
                      <Icon.X size={11}/>
                    </span>
                  )}
                  {!uniState && <Icon.ChevronDown size={11} color="var(--ink-4)"/>}
                </button>

                {stateDropOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 6px)", right: 0,
                    width: 240, background: "white", border: "1px solid var(--line)",
                    borderRadius: 10, boxShadow: "var(--shadow-2)", zIndex: 50,
                    overflow: "hidden",
                  }}>
                    {/* Search inside dropdown */}
                    <div className="row gap-2" style={{ padding: "8px 10px", borderBottom: "1px solid var(--line)" }}>
                      <Icon.Search size={12} color="var(--ink-4)"/>
                      <input
                        autoFocus
                        value={stateSearch}
                        onChange={e => setStateSearch(e.target.value)}
                        placeholder="Search state…"
                        style={{ border: 0, outline: 0, flex: 1, fontSize: 12.5, background: "transparent" }}
                      />
                      {stateSearch && (
                        <button onClick={() => setStateSearch('')} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}>
                          <Icon.X size={11} color="var(--ink-4)"/>
                        </button>
                      )}
                    </div>
                    {/* Options list */}
                    <div style={{ maxHeight: 240, overflowY: "auto" }}>
                      {/* All option */}
                      <button
                        onClick={() => { setUniState(''); setUniPage(1); setStateDropOpen(false); setStateSearch(''); }}
                        style={{
                          width: "100%", textAlign: "left", padding: "8px 12px",
                          border: 0, background: uniState === '' ? "var(--green-soft)" : "transparent",
                          color: uniState === '' ? "var(--green-deep)" : "var(--ink)",
                          fontSize: 13, cursor: "pointer", fontWeight: uniState === '' ? 600 : 400,
                        }}
                        onMouseOver={e => { if (uniState !== '') e.currentTarget.style.background = "var(--paper-2)"; }}
                        onMouseOut={e => { if (uniState !== '') e.currentTarget.style.background = "transparent"; }}
                      >
                        All states
                        <span className="mono muted" style={{ fontSize: 11, marginLeft: 6 }}>{uniRows.length}</span>
                      </button>
                      {availableStates
                        .filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()))
                        .map(s => {
                          const count = uniRows.filter(u => u.state === s).length;
                          return (
                            <button
                              key={s}
                              onClick={() => { setUniState(s); setUniPage(1); setStateDropOpen(false); setStateSearch(''); }}
                              style={{
                                width: "100%", textAlign: "left", padding: "8px 12px",
                                border: 0, background: uniState === s ? "var(--green-soft)" : "transparent",
                                color: uniState === s ? "var(--green-deep)" : "var(--ink)",
                                fontSize: 13, cursor: "pointer", fontWeight: uniState === s ? 600 : 400,
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                              }}
                              onMouseOver={e => { if (uniState !== s) e.currentTarget.style.background = "var(--paper-2)"; }}
                              onMouseOut={e => { if (uniState !== s) e.currentTarget.style.background = "transparent"; }}
                            >
                              <span>{s}</span>
                              <span className="mono muted" style={{ fontSize: 11 }}>{count}</span>
                            </button>
                          );
                        })}
                      {availableStates.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).length === 0 && (
                        <div className="muted" style={{ padding: "12px", fontSize: 12, textAlign: "center" }}>No states match "{stateSearch}"</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Column headers */}
        {!loadingUnis && uniRows.length > 0 && (
          <div className="row" style={{ padding: "8px 20px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
            <span style={{ width: 36, fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>#</span>
            <span style={{ flex: 1, fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>University</span>
            <span style={{ width: 180, fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>State / Region</span>
            <span style={{ width: 100, fontSize: 11, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500, textAlign: "right" }}>Professors</span>
          </div>
        )}

        {loadingUnis ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="row gap-3" style={{ padding: "14px 20px", borderTop: i ? "1px solid var(--line)" : 0, alignItems: "center" }}>
                <div style={{ width: 28, height: 10, borderRadius: 4, background: "var(--paper-3)" }}/>
                <div style={{ flex: 1, height: 12, borderRadius: 4, background: "var(--paper-3)", maxWidth: "50%" }}/>
                <div style={{ width: 120, height: 6, borderRadius: 4, background: "var(--paper-3)" }}/>
                <div style={{ width: 40, height: 10, borderRadius: 4, background: "var(--paper-3)" }}/>
              </div>
            ))}
          </>
        ) : filteredUnis.length === 0 ? (
          <div style={{ padding: "32px 20px", textAlign: "center" }}>
            <span className="muted" style={{ fontSize: 13 }}>
              {uniQ ? `No universities matching "${uniQ}"` : "No university data available."}
            </span>
          </div>
        ) : (
          pagedUnis.map((u, i) => {
            const globalRank = uniRows.indexOf(u); // preserve original rank even when filtered
            return (
              <div
                key={u.name + i}
                className="row"
                style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", alignItems: "center", cursor: "pointer", transition: "background 0.1s" }}
                onClick={() => go('university', { uni: { ...u, flag: country.flag, countryName: country.name, country: country._apiName } })}
                onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
                onMouseOut={e => e.currentTarget.style.background = ""}
              >
                {/* Rank */}
                <span className="mono" style={{ width: 36, fontSize: 12, color: globalRank < 3 ? "var(--green-deep)" : "var(--ink-4)", fontWeight: globalRank < 3 ? 600 : 400 }}>
                  {globalRank + 1}
                </span>
                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                </div>
                {/* State column */}
                <div style={{ width: 180, paddingRight: 12 }}>
                  {u.state ? (
                    <span
                      className="pill"
                      style={{ fontSize: 11, cursor: "pointer", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "inline-block" }}
                      onClick={e => { e.stopPropagation(); setUniState(u.state); setUniPage(1); }}
                      title={u.state}
                    >
                      {u.state}
                    </span>
                  ) : (
                    <span className="muted" style={{ fontSize: 12 }}>—</span>
                  )}
                </div>
                {/* Count */}
                <span className="mono" style={{ width: 100, fontSize: 13, fontWeight: 500, textAlign: "right", color: "var(--ink)" }}>
                  {u.profs.toLocaleString()}
                </span>
                {/* Chevron */}
                <span style={{ marginLeft: 12 }}>
                  <Icon.Chevron size={13} color="var(--ink-4)"/>
                </span>
              </div>
            );
          })
        )}

        {/* Pagination controls */}
        {!loadingUnis && !isUniSearching && totalUniPages > 1 && (
          <div className="row gap-2" style={{ justifyContent: "center", padding: "12px 20px", borderTop: "1px solid var(--line)", background: "var(--paper-2)", alignItems: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-sm"
              disabled={uniPage === 1}
              onClick={() => setUniPage(p => p - 1)}
              style={{ opacity: uniPage === 1 ? 0.4 : 1 }}
            >
              <Icon.Chevron size={13} style={{ transform: "rotate(180deg)" }}/> Prev
            </button>

            {[...Array(totalUniPages)].map((_, i) => {
              const p = i + 1;
              const show = p === 1 || p === totalUniPages || Math.abs(p - uniPage) <= 1;
              if (!show) {
                if (p === 2 || p === totalUniPages - 1) return <span key={p} className="muted" style={{ fontSize: 13 }}>…</span>;
                return null;
              }
              return (
                <button
                  key={p}
                  onClick={() => setUniPage(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 6, border: "1px solid var(--line)",
                    background: uniPage === p ? "var(--green-deep)" : "white",
                    color: uniPage === p ? "white" : "var(--ink)",
                    fontWeight: uniPage === p ? 600 : 400,
                    fontSize: 13, cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              );
            })}

            <button
              className="btn btn-sm"
              disabled={uniPage === totalUniPages}
              onClick={() => setUniPage(p => p + 1)}
              style={{ opacity: uniPage === totalUniPages ? 0.4 : 1 }}
            >
              Next <Icon.Chevron size={13}/>
            </button>

            <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
              {(uniPage - 1) * UNI_PAGE_SIZE + 1}–{Math.min(uniPage * UNI_PAGE_SIZE, filteredUnis.length)} of {filteredUnis.length}
            </span>
          </div>
        )}

        {/* Footer summary */}
        {!loadingUnis && uniRows.length > 0 && (
          <div style={{ padding: "10px 20px", borderTop: "1px solid var(--line)", background: "var(--paper-2)" }}>
            <span className="muted" style={{ fontSize: 12 }}>{uniTotal} universities · sorted by professor count</span>
          </div>
        )}
      </div>

    </div>
  );
}

const COUNTRIES_PAGE_SIZE = 12;

// --- Countries ---
function Countries({ go }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [q, setQ]               = useState("");
  const [page, setPage]         = useState(1);
  const [countryList, setCountryList] = useState(_countryCache || []);
  const [loading, setLoading]   = useState(!_countryCache);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    if (_countryCache) return;
    universityService.getAll()
      .then(res => {
        const built = buildCountryList(res.data);
        if (built.length > 0) { _countryCache = built; setCountryList(built); }
      })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

  // Reset to page 1 when search changes
  const handleQ = useCallback(e => { setQ(e.target.value); setPage(1); }, []);

  const filtered = countryList.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.top.join(" ").toLowerCase().includes(q.toLowerCase())
  );

  const isSearching  = q.trim().length > 0;
  const totalPages   = Math.ceil(filtered.length / COUNTRIES_PAGE_SIZE);
  const paged        = isSearching ? filtered : filtered.slice((page - 1) * COUNTRIES_PAGE_SIZE, page * COUNTRIES_PAGE_SIZE);
  const totalProfs   = countryList.reduce((s, c) => s + c.profs, 0);

  const openCountry  = (c) => go('country', { country: c });

  return (
    <div className="fade-in" style={{
      padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px",
      maxWidth: 1100, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", flexWrap: "wrap",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: 12, marginBottom: 20,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em" }}>
            Browse by <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>country</span>
          </h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            {loading
              ? "Loading…"
              : apiError
                ? "Could not load country data."
                : `${countryList.length} countries · ${totalProfs.toLocaleString()} indexed professors`}
          </p>
        </div>
        <div className="row gap-2" style={{
          alignItems: "center", padding: "7px 12px", borderRadius: 8,
          border: "1px solid var(--line)", background: "white",
          width: isMobile ? "100%" : 280,
        }}>
          <Icon.Search size={14} color="var(--ink-4)"/>
          <input value={q} onChange={handleQ} placeholder="Search country or university…"
            style={{ border: 0, outline: 0, background: "transparent", flex: 1, fontSize: 13 }}/>
          {q && (
            <button onClick={() => { setQ(''); setPage(1); }} style={{ border: 0, background: "transparent", cursor: "pointer", padding: 0, display: "grid", placeItems: "center" }}>
              <Icon.X size={12} color="var(--ink-4)"/>
            </button>
          )}
        </div>
      </div>

      {/* Top countries quick-links */}
      {!apiError && countryList.length > 0 && (
        <div className="card hatch" style={{ padding: 20, marginBottom: 16, background: "var(--paper-2)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", fontWeight: 500, marginBottom: 10 }}>
            Most professors indexed
          </div>
          <div className="row gap-3" style={{ flexWrap: "wrap" }}>
            {countryList.slice(0, 5).map(c => (
              <button key={c.code} className="row gap-2" onClick={() => openCountry(c)}
                style={{ padding: "8px 14px", border: "1px solid var(--line)", background: "white", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                <span style={{ fontSize: 16 }}>{c.flag}</span>{c.name}
                <span className="mono muted" style={{ fontSize: 11 }}>{c.profs.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 12 }}>
          {[...Array(isMobile ? 4 : 9)].map((_, i) => (
            <div key={i} className="card" style={{ padding: 20, height: 110 }}>
              <div style={{ height: 16, width: "60%", borderRadius: 4, background: "var(--paper-3)", marginBottom: 12 }}/>
              <div style={{ height: 11, width: "40%", borderRadius: 4, background: "var(--paper-3)" }}/>
            </div>
          ))}
        </div>
      ) : apiError ? (
        <div className="card" style={{ padding: "48px 32px", textAlign: "center" }}>
          <p style={{ fontWeight: 500, fontSize: 15 }}>Unable to reach the server</p>
          <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>Check your connection and reload the page.</p>
        </div>
      ) : paged.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <Icon.Search size={28} color="var(--ink-4)"/>
          <p className="muted" style={{ marginTop: 12, fontSize: 13 }}>No countries matching "{q}"</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)", gap: 12 }}>
          {paged.map(c => (
            <button key={c.code} onClick={() => openCountry(c)} className="card"
              style={{ padding: 20, textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "white" }}
              onMouseOver={e => e.currentTarget.style.borderColor = "var(--green-deep)"}
              onMouseOut={e => e.currentTarget.style.borderColor = "var(--line)"}>
              <div className="row between" style={{ alignItems: "flex-start" }}>
                <div>
                  <div className="row gap-2" style={{ alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 26 }}>{c.flag}</span>
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{c.name}</span>
                  </div>
                  <div className="row gap-3 muted" style={{ fontSize: 12 }}>
                    <span><span className="mono" style={{ color: "var(--ink)" }}>{c.unis}</span> universities</span>
                    <span><span className="mono" style={{ color: "var(--ink)" }}>{c.profs.toLocaleString()}</span> professors</span>
                  </div>
                </div>
                <Icon.Chevron size={14} color="var(--ink-4)"/>
              </div>
              <div className="row gap-1 mt-4" style={{ flexWrap: "wrap" }}>
                {c.top.slice(0, 3).map(u => <span key={u} className="pill">{u}</span>)}
                {c.top.length > 3 && <span className="pill pill-outline">+{c.top.length - 3} more</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination — only shown when not searching */}
      {!isSearching && !loading && totalPages > 1 && (
        <div className="row gap-2" style={{ justifyContent: "center", marginTop: 24, alignItems: "center" }}>
          <button
            className="btn btn-sm"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ opacity: page === 1 ? 0.4 : 1 }}
          >
            <Icon.Chevron size={13} style={{ transform: "rotate(180deg)" }}/> Prev
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const p = i + 1;
            // Show first, last, current ±1, with ellipsis
            const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
            if (!show) {
              if (p === 2 || p === totalPages - 1) return <span key={p} className="muted" style={{ fontSize: 13 }}>…</span>;
              return null;
            }
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, borderRadius: 6, border: "1px solid var(--line)",
                  background: page === p ? "var(--green-deep)" : "white",
                  color: page === p ? "white" : "var(--ink)",
                  fontWeight: page === p ? 600 : 400,
                  fontSize: 13, cursor: "pointer",
                }}
              >
                {p}
              </button>
            );
          })}

          <button
            className="btn btn-sm"
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ opacity: page === totalPages ? 0.4 : 1 }}
          >
            Next <Icon.Chevron size={13}/>
          </button>

          <span className="muted" style={{ fontSize: 12, marginLeft: 8 }}>
            {(page - 1) * COUNTRIES_PAGE_SIZE + 1}–{Math.min(page * COUNTRIES_PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
        </div>
      )}
    </div>
  );
}

// --- ReviewsFeed helpers ---
const POSITION_LABELS = {
  phd: 'PhD Student', masters: 'Masters Student', postdoc: 'Postdoc',
  ra: 'Research Assistant', colleague: 'Colleague', collaborator: 'Collaborator', other: 'Other',
};

function normalizeApiItem(r) {
  const name = r.professor_name || '';
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: r.id,
    profId: r.professor,
    profName: name,
    profSchool: null,
    profInitials: initials,
    overallRating: r.overall_rating || 0,
    stars: Math.min(5, Math.max(1, Math.round(r.overall_rating || 1))),
    role: POSITION_LABELS[r.position_type] || r.position_type || 'Reviewer',
    text: r.review_text || '',
    time: relativeDate(r.created_at),
    helpful: 0,
    teaching: r.teaching_quality,
    research: r.research_quality,
    mentorship: r.mentorship,
    availability: r.availability,
    careerSupport: r.career_support,
    isApi: true,
  };
}


function RatingStatsBar({ items }) {
  if (!items.length) return null;
  const total = items.length;
  const avg = items.reduce((s, i) => s + i.stars, 0) / total;
  const dist = [5, 4, 3, 2, 1].map(n => ({
    n, count: items.filter(i => Math.round(i.stars) === n).length,
  }));
  const maxCount = Math.max(...dist.map(d => d.count), 1);
  const apiItems = items.filter(i => i.isApi && i.teaching != null && i.teaching > 0);
  const catAvgs = apiItems.length > 0 ? [
    ['Teaching',     apiItems.reduce((s, i) => s + i.teaching, 0) / apiItems.length],
    ['Research',     apiItems.reduce((s, i) => s + i.research, 0) / apiItems.length],
    ['Mentorship',   apiItems.reduce((s, i) => s + i.mentorship, 0) / apiItems.length],
    ['Availability', apiItems.reduce((s, i) => s + i.availability, 0) / apiItems.length],
    ['Career support', apiItems.reduce((s, i) => s + i.careerSupport, 0) / apiItems.length],
  ] : null;

  return (
    <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Overall avg */}
        <div style={{ textAlign: 'center', minWidth: 72 }}>
          <div style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, fontFamily: '"Instrument Serif", serif', letterSpacing: '-0.03em' }}>
            {avg.toFixed(1)}
          </div>
          <Stars n={avg} size={14}/>
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
            {total} review{total !== 1 ? 's' : ''}
          </div>
        </div>
        {/* Star distribution */}
        <div style={{ flex: 1, minWidth: 130 }}>
          {dist.map(({ n, count }) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)', minWidth: 10, textAlign: 'right' }}>{n}</span>
              <Icon.Star size={10} color="var(--amber)"/>
              <div style={{ flex: 1, height: 6, background: 'var(--paper-3)', borderRadius: 3 }}>
                <div style={{
                  width: `${(count / maxCount) * 100}%`, height: '100%', borderRadius: 3,
                  background: n >= 4 ? 'var(--green-hi)' : n === 3 ? 'var(--amber)' : 'var(--red)',
                  transition: 'width 0.4s ease',
                }}/>
              </div>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 18, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
        {/* Category breakdown (only when API data available) */}
        {catAvgs && (
          <div style={{ flex: 1, minWidth: 180 }}>
            {catAvgs.map(([label, val]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)', minWidth: 96 }}>{label}</span>
                <div style={{ flex: 1, height: 5, background: 'var(--paper-3)', borderRadius: 3 }}>
                  <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: 3 }}/>
                </div>
                <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>{val.toFixed(1)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1 }}
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
          onClick={() => onChange(n)}>
          {(hov || value) >= n
            ? <Icon.StarF size={22} color="var(--amber)"/>
            : <Icon.Star size={22} color="var(--line-2)"/>}
        </button>
      ))}
    </div>
  );
}

function WriteReviewModal({ onClose, onSuccess }) {
  const [search, setSearch] = useState('');
  const [selectedProf, setSelectedProf] = useState(null);
  const [showDrop, setShowDrop] = useState(false);
  const [ratings, setRatings] = useState({ teaching_quality: 0, research_quality: 0, mentorship: 0, availability: 0, career_support: 0 });
  const [posType, setPosType] = useState('phd');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiErr, setApiErr] = useState(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef(null);

  const matches = search.length > 1
    ? professors.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 6)
    : [];
  const allRated = Object.values(ratings).every(v => v >= 1);
  const canSubmit = selectedProf && allRated && !submitting;

  const CRITERIA = [
    ['teaching_quality', 'Teaching quality'],
    ['research_quality', 'Research quality'],
    ['mentorship',       'Mentorship'],
    ['availability',     'Availability'],
    ['career_support',   'Career support'],
  ];

  function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    setApiErr(null);
    ratingService.create({
      professor: selectedProf.id,
      ...ratings,
      position_type: posType,
      review_text: reviewText,
    }).then(res => {
      setDone(true);
      onSuccess && onSuccess(res.data);
    }).catch(() => {
      setApiErr('Could not submit. Please try again.');
      setSubmitting(false);
    });
  }

  const backdropSt = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  };
  const boxSt = {
    background: 'var(--paper)', borderRadius: 16, width: '100%', maxWidth: 520,
    maxHeight: 'calc(100vh - 32px)', overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
    animation: 'modalIn 0.18s ease',
    padding: '24px',
  };

  if (done) {
    return ReactDOM.createPortal(
      <div style={backdropSt} onClick={onClose}>
        <div style={{ ...boxSt, textAlign: 'center', padding: '40px 32px' }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <h2 style={{ marginBottom: 8 }}>Review submitted!</h2>
          <p className="muted" style={{ marginBottom: 24 }}>
            Thank you for helping the community. Your review will appear after moderation.
          </p>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>,
      document.body
    );
  }

  return ReactDOM.createPortal(
    <div style={backdropSt} onClick={onClose}>
      <div style={boxSt} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Write a review</h2>
          <button className="btn btn-sm btn-ghost" onClick={onClose}><Icon.X size={16}/></button>
        </div>

        {/* Professor search */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--ink-2)' }}>Professor</div>
          {selectedProf ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 10 }}>
              <Avatar initials={selectedProf.initials} size={32}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{selectedProf.name}</div>
                <div className="muted" style={{ fontSize: 12 }}>{selectedProf.school}</div>
              </div>
              <button className="btn btn-sm btn-ghost"
                onClick={() => { setSelectedProf(null); setSearch(''); setTimeout(() => inputRef.current?.focus(), 50); }}>
                Change
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input ref={inputRef} className="input"
                placeholder="Search professor name…"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
              {showDrop && matches.length > 0 && (
                <div className="card" style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 10, padding: '4px 0', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                  {matches.map(p => (
                    <div key={p.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', cursor: 'pointer' }}
                      onMouseDown={e => e.preventDefault()}
                      onClick={() => { setSelectedProf(p); setSearch(''); setShowDrop(false); }}>
                      <Avatar initials={p.initials} size={28}/>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                        <div className="muted" style={{ fontSize: 11.5 }}>{p.school}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--ink-2)' }}>Your role</div>
          <select className="input" value={posType} onChange={e => setPosType(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box' }}>
            <option value="phd">PhD Student</option>
            <option value="masters">Masters Student</option>
            <option value="postdoc">Postdoc</option>
            <option value="ra">Research Assistant</option>
            <option value="colleague">Colleague</option>
            <option value="collaborator">Collaborator</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Criteria ratings */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: 'var(--ink-2)' }}>Rate each area</div>
          {CRITERIA.map(([key, label]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>{label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <StarPicker value={ratings[key]} onChange={v => setRatings(r => ({ ...r, [key]: v }))}/>
                {ratings[key] > 0 && <span className="mono muted" style={{ fontSize: 12, minWidth: 28 }}>{ratings[key]}/5</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Review text */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6, color: 'var(--ink-2)' }}>
            Review <span className="muted" style={{ fontWeight: 400 }}>(optional)</span>
          </div>
          <textarea className="input"
            placeholder="Share your honest experience with this professor…"
            value={reviewText} onChange={e => setReviewText(e.target.value)}
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', fontFamily: '"Instrument Serif", serif', fontSize: 15 }}
          />
        </div>

        {apiErr && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{apiErr}</p>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!canSubmit} onClick={submit}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const REVIEWS_PAGE_SIZE = 10;

// --- ReviewsFeed ---
function ReviewsFeed({ go }) {
  const { isMobile, isTablet } = useBreakpoint();
  const byId = Object.fromEntries(professors.map(p => [p.id, p]));
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [helpful, setHelpful] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('fmp_helpful') || '[]')); } catch { return new Set(); }
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    const params = { page, page_size: REVIEWS_PAGE_SIZE };
    if (filter === "4+") params.min_rating = 4;
    if (filter === "recent") params.ordering = '-created_at';
    ratingService.getAll(params)
      .then(res => {
        const data = res.data?.results ?? res.data;
        const count = res.data?.count ?? (Array.isArray(res.data) ? res.data.length : 0);
        setItems(Array.isArray(data) ? data.map(normalizeApiItem) : []);
        setTotalCount(count);
      })
      .catch(() => { setItems([]); setTotalCount(0); })
      .finally(() => setLoading(false));
  }, [page, filter]);

  const totalPages = Math.ceil(totalCount / REVIEWS_PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter]);

  function toggleHelpful(id) {
    setHelpful(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem('fmp_helpful', JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleNewReview(data) {
    setItems(prev => [normalizeApiItem(data), ...prev]);
    setTotalCount(c => c + 1);
    setShowWriteModal(false);
    showToast('Review submitted — pending moderation');
  }

  return (
    <div className="fade-in" style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 920, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em" }}>
          Reviews & <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>ratings</span>
        </h1>
        <span className="pill pill-outline">Free</span>
      </div>
      <p className="muted" style={{ marginBottom: 20 }}>
        Verified reviews from former and current students. Submitted anonymously, moderated for tone.
      </p>

      {/* Stats bar — computed from current page items */}
      {!loading && items.length > 0 && <RatingStatsBar items={items}/>}

      {/* Filters + write button */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[["all","All"],["4+","4+ stars"],["recent","Most recent"]].map(([id, l]) => (
          <button key={id} className={"chip " + (filter === id ? "selected" : "")} onClick={() => setFilter(id)}>{l}</button>
        ))}
        <button className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }} onClick={() => setShowWriteModal(true)}>
          <Icon.Plus size={12}/> Write a review
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ height: 16, width: '55%', background: 'var(--paper-3)', borderRadius: 6 }}/>
              <div style={{ height: 12, width: '35%', background: 'var(--paper-3)', borderRadius: 6 }}/>
              <div style={{ height: 12, width: '80%', background: 'var(--paper-3)', borderRadius: 6, marginTop: 6 }}/>
              <div style={{ height: 12, width: '65%', background: 'var(--paper-3)', borderRadius: 6 }}/>
            </div>
          ))}
        </div>
      )}

      {/* Review cards */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.length === 0 && (
            <div className="card" style={{ padding: '40px 32px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No reviews yet</div>
              <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
                Be the first to share your experience with a professor.
              </p>
              <button className="btn btn-primary" onClick={() => setShowWriteModal(true)}>
                <Icon.Plus size={13}/> Write the first review
              </button>
            </div>
          )}
          {items.map(item => {
            const prof = byId[item.profId];
            const isHelpful = helpful.has(item.id);
            return (
              <div key={item.id} className="card" style={{ padding: isMobile ? '14px 16px' : 20 }}>
                {/* Professor header */}
                <div
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12, cursor: prof ? 'pointer' : 'default' }}
                  onClick={() => prof && go('profDetail', { prof })}>
                  <Avatar initials={item.profInitials} size={40}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.2 }}>{item.profName}</div>
                    {item.profSchool && (
                      <div className="muted" style={{ fontSize: 12, marginTop: 1 }}>{item.profSchool}</div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Stars n={item.overallRating} size={13}/>
                      <span className="mono muted" style={{ fontSize: 12 }}>{item.overallRating.toFixed(1)}</span>
                    </div>
                  </div>
                  {prof && !isMobile && (
                    <button className="btn btn-sm" onClick={e => { e.stopPropagation(); go('profDetail', { prof }); }}>
                      View profile
                    </button>
                  )}
                </div>

                {/* Review body */}
                <div style={{ paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stars n={item.stars} size={13}/>
                      <span className="muted" style={{ fontSize: 12 }}>{item.role}</span>
                    </div>
                    <span className="muted" style={{ fontSize: 12 }}>{item.time}</span>
                  </div>

                  {/* Per-category breakdown (API items with criteria data) */}
                  {item.isApi && item.teaching > 0 && (
                    <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--paper-2)', borderRadius: 8 }}>
                      {[
                        ['Teaching',      item.teaching],
                        ['Research',      item.research],
                        ['Mentorship',    item.mentorship],
                        ['Availability',  item.availability],
                        ['Career support',item.careerSupport],
                      ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 11.5, color: 'var(--ink-3)', minWidth: 86 }}>{label}</span>
                          <div style={{ flex: 1, height: 4, background: 'var(--paper-3)', borderRadius: 2 }}>
                            <div style={{ width: `${(val / 5) * 100}%`, height: '100%', background: 'var(--green)', borderRadius: 2 }}/>
                          </div>
                          <span className="mono" style={{ fontSize: 11.5, color: 'var(--ink-3)', minWidth: 14 }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Review text */}
                  {item.text && (
                    <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 16, color: 'var(--ink-2)', margin: '0 0 12px', fontStyle: 'italic', lineHeight: 1.55 }}>
                      "{item.text}"
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-sm btn-ghost"
                      style={isHelpful ? { color: 'var(--green-deep)', fontWeight: 500 } : {}}
                      onClick={() => toggleHelpful(item.id)}>
                      <Icon.Check size={12}/> Helpful · {item.helpful + (isHelpful ? 1 : 0)}
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => showToast('Report submitted — thank you')}>
                      <Icon.AlertCircle size={12}/> Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div style={{ marginTop: 20 }}>
          <Pagination page={page} totalPages={totalPages} onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}/>
        </div>
      )}

      {/* Write Review Modal */}
      {showWriteModal && (
        <WriteReviewModal
          onClose={() => setShowWriteModal(false)}
          onSuccess={handleNewReview}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: isMobile ? 76 : 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--ink)', color: 'var(--paper)', padding: '10px 18px',
          borderRadius: 10, fontSize: 14, zIndex: 200, whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// --- Date helpers ---
function fmtDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeDate(iso) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7)  return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function deadlineUrgency(iso) {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  if (days < 0)  return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 21) return 'soon';
  return 'open';
}

// --- Pagination ---
const HIRING_PAGE_SIZE = 20;

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  // Build page list with ellipsis gaps
  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    const nums = new Set(
      [1, 2, page - 1, page, page + 1, totalPages - 1, totalPages].filter(n => n >= 1 && n <= totalPages)
    );
    [...nums].sort((a, b) => a - b).forEach((n, idx, arr) => {
      if (idx > 0 && n - arr[idx - 1] > 1) pages.push('…');
      pages.push(n);
    });
  }

  const btnSt = (active, disabled) => ({
    padding: '5px 10px', borderRadius: 7, border: '1px solid',
    background: active ? 'var(--ink)' : 'white',
    color: active ? 'var(--paper)' : 'var(--ink-2)',
    borderColor: active ? 'var(--ink)' : 'var(--line)',
    cursor: disabled || active ? 'default' : 'pointer',
    fontSize: 13, fontWeight: active ? 600 : 400,
    minWidth: 34, textAlign: 'center',
    opacity: disabled ? 0.4 : 1,
    fontFamily: 'inherit',
  });

  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', marginTop: 24, flexWrap: 'wrap' }}>
      <button style={btnSt(false, page === 1)} disabled={page === 1} onClick={() => onPage(page - 1)}>
        <Icon.Chevron size={12} style={{ transform: 'rotate(180deg)', display: 'inline-block', verticalAlign: 'middle' }}/> Prev
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} style={{ padding: '0 2px', color: 'var(--ink-4)', fontSize: 13 }}>…</span>
        ) : (
          <button key={p} style={btnSt(p === page, false)} onClick={() => p !== page && onPage(p)}>{p}</button>
        )
      )}
      <button style={btnSt(false, page === totalPages)} disabled={page === totalPages} onClick={() => onPage(page + 1)}>
        Next <Icon.Chevron size={12} style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
      </button>
    </div>
  );
}

// --- HiringDetailModal ---
function HiringDetailModal({ prof, go, onClose }) {
  const urgency     = deadlineUrgency(prof.hiringDeadline);
  const deadlineFmt = fmtDate(prof.hiringDeadline);
  const jd          = prof.jobDescription || '';

  const latestExpiry = prof.activeGrants.reduce((best, g) => {
    if (!g.end_date) return best;
    return !best || g.end_date > best ? g.end_date : best;
  }, null);
  const fundingThrough = fundingExpirySemester(latestExpiry);

  // Lock body scroll + Escape to close
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  const urgencyStyle = {
    expired: { bg: 'oklch(0.2 0.05 25)',  text: 'oklch(0.8 0.12 25)',  label: 'Expired' },
    urgent:  { bg: 'oklch(0.2 0.05 25)',  text: 'oklch(0.8 0.12 25)',  label: deadlineFmt },
    soon:    { bg: 'oklch(0.22 0.06 75)', text: 'oklch(0.82 0.13 75)', label: deadlineFmt },
    open:    { bg: 'var(--paper-3)',       text: 'var(--ink-2)',         label: deadlineFmt || 'Rolling / open' },
  }[urgency || 'open'];

  const confColor = prof.hiringConfidence >= 75 ? 'var(--green-deep)'
    : prof.hiringConfidence >= 40 ? 'oklch(0.55 0.12 75)' : 'var(--ink-4)';

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--paper)',
          borderRadius: 16,
          width: '100%', maxWidth: 660,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column',
        }}>

        {/* ── Sticky header ── */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--line)',
          position: 'sticky', top: 0, background: 'var(--paper)',
          borderRadius: '16px 16px 0 0', zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row gap-2" style={{ flexWrap: 'wrap', marginBottom: 6 }}>
                <span className="pill pill-green" style={{ fontSize: 11 }}>
                  <Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Hiring
                </span>
                {prof.hiring_positions.slice(0, 4).map(pos => (
                  <span key={pos} className="pill pill-blue" style={{ fontSize: 11 }}>{pos}</span>
                ))}
              </div>
              <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 3 }}>
                {prof.hiring_positions.length > 0
                  ? prof.hiring_positions.join(' / ') + ' — ' + prof.name
                  : `Open position — ${prof.name}`}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                {[prof.school, prof.dept && prof.dept !== 'Research Department' && prof.dept, prof.country].filter(Boolean).join(' · ')}
              </div>
            </div>
            <button onClick={onClose}
              style={{
                flexShrink: 0, background: 'var(--paper-2)', border: '1px solid var(--line)',
                cursor: 'pointer', color: 'var(--ink-3)', borderRadius: 8,
                width: 32, height: 32, display: 'grid', placeItems: 'center',
              }}>
              <Icon.X size={14}/>
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={{ padding: '0 24px 24px', flex: 1 }}>

          {/* Key facts grid */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10, margin: '18px 0',
          }}>
            {/* Intake semester */}
            <div style={{ background: 'oklch(0.98 0.03 75)', border: '1px solid oklch(0.9 0.06 75)',
              borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'oklch(0.5 0.1 75)', marginBottom: 5 }}>Intake</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.GraduationCap size={14} color="oklch(0.45 0.1 75)"/>
                <span style={{ fontWeight: 700, fontSize: 15, color: 'oklch(0.3 0.08 75)', lineHeight: 1 }}>
                  {prof.intakeSemester || '—'}
                </span>
              </div>
            </div>

            {/* Deadline */}
            <div style={{ background: urgencyStyle.bg, border: `1px solid ${urgencyStyle.bg}`,
              borderRadius: 10, padding: '12px 14px', filter: 'brightness(1.08)' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: urgencyStyle.text, opacity: 0.75, marginBottom: 5 }}>Deadline</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Clock size={14} color={urgencyStyle.text}/>
                <span style={{ fontWeight: 700, fontSize: 15, color: urgencyStyle.text, lineHeight: 1 }}>
                  {urgencyStyle.label}
                </span>
              </div>
            </div>

            {/* Funding through */}
            <div style={{ background: fundingThrough ? 'var(--green-soft)' : 'var(--paper-2)',
              border: `1px solid ${fundingThrough ? 'oklch(0.85 0.08 155)' : 'var(--line)'}`,
              borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: fundingThrough ? 'var(--green-deep)' : 'var(--ink-4)', marginBottom: 5 }}>
                Funding through
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon.Award size={14} color={fundingThrough ? 'var(--green-deep)' : 'var(--ink-4)'}/>
                <span style={{ fontWeight: 700, fontSize: 15,
                  color: fundingThrough ? 'var(--green-deep)' : 'var(--ink-4)', lineHeight: 1 }}>
                  {fundingThrough || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Position description */}
          {jd && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                color: 'var(--ink-4)', marginBottom: 8 }}>Position Description</div>
              <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.75, margin: '0 0 18px',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{jd}</p>
            </>
          )}

          {/* Funding & Grants */}
          {(prof.activeGrants.length > 0 || prof.fundingOpps.length > 0) && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
                color: 'var(--ink-4)', marginBottom: 10 }}>Funding & Grants</div>

              {prof.activeGrants.length > 0 && (
                <div style={{ border: '1px solid var(--line)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
                  {prof.activeGrants.map((g, gi) => {
                    const expiry = fundingExpirySemester(g.end_date);
                    const amtFmt = g.amount
                      ? g.amount >= 1000000
                        ? `$${(g.amount / 1000000).toFixed(1)}M`
                        : `$${Math.round(g.amount / 1000)}k`
                      : null;
                    const period = g.start_date && g.end_date
                      ? `${g.start_date.slice(0,4)} – ${g.end_date.slice(0,4)}`
                      : g.end_date ? `Until ${g.end_date.slice(0,4)}` : null;
                    return (
                      <div key={gi} style={{
                        padding: '12px 16px',
                        borderTop: gi ? '1px solid var(--line)' : 'none',
                        background: gi % 2 ? 'var(--paper-2)' : 'white',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                      }}>
                        <div style={{
                          flexShrink: 0, padding: '3px 8px', borderRadius: 5,
                          background: 'var(--green-soft)', border: '1px solid oklch(0.85 0.08 155)',
                          fontSize: 11, fontWeight: 700, color: 'var(--green-deep)',
                          whiteSpace: 'nowrap',
                        }}>{g.agency || 'Grant'}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink)', marginBottom: 3 }}>
                            {g.title ? g.title.slice(0, 80) + (g.title.length > 80 ? '…' : '') : 'Untitled grant'}
                          </div>
                          <div className="row gap-3" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                            {amtFmt && <span style={{ fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--ink)' }}>{amtFmt}</span>}
                            {period && <span>{period}</span>}
                            {g.status && <span style={{ textTransform: 'capitalize',
                              color: g.status === 'active' ? 'var(--green-deep)' : 'var(--ink-3)' }}>
                              {g.status}
                            </span>}
                          </div>
                        </div>
                        {expiry && (
                          <div style={{ flexShrink: 0, textAlign: 'right' }}>
                            <div style={{ fontSize: 10, color: 'var(--ink-4)', marginBottom: 2 }}>through</div>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--green-deep)' }}>{expiry}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {prof.fundingOpps.length > 0 && (
                <ul style={{ margin: '0 0 18px', paddingLeft: 18, fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.9 }}>
                  {prof.fundingOpps.slice(0, 5).map((fo, fi) => <li key={fi}>{fo}</li>)}
                </ul>
              )}
            </>
          )}

          {/* Professor snapshot */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
            color: 'var(--ink-4)', marginBottom: 10 }}>Professor</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start',
            background: 'var(--paper-2)', border: '1px solid var(--line)', borderRadius: 12, padding: '16px' }}>
            <Avatar prof={prof} size={52}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, lineHeight: 1.2 }}>{prof.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>
                {[prof.title !== 'Professor' && prof.title, prof.school, prof.country].filter(Boolean).join(' · ')}
              </div>
              <div className="row gap-2" style={{ marginTop: 10, flexWrap: 'wrap' }}>
                {prof.hIndex != null && (
                  <span className="pill pill-outline mono" style={{ fontSize: 11 }}>h‑index {prof.hIndex}</span>
                )}
                {prof.citations > 0 && (
                  <span className="pill pill-outline mono" style={{ fontSize: 11 }}>
                    {prof.citations >= 1000 ? `${(prof.citations/1000).toFixed(1)}k` : prof.citations} citations
                  </span>
                )}
                {prof.keywords.slice(0, 5).map(k => (
                  <span key={k} className="pill" style={{ fontSize: 11 }}>{k}</span>
                ))}
              </div>
              {prof.hiringConfidence > 0 && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 5, borderRadius: 99, background: 'var(--paper-3)', maxWidth: 160 }}>
                    <div style={{ height: '100%', width: `${prof.hiringConfidence}%`,
                      background: confColor, borderRadius: 99 }}/>
                  </div>
                  <span style={{ fontSize: 11.5, color: confColor, fontWeight: 600 }}>
                    {prof.hiringConfidence}% confidence
                  </span>
                </div>
              )}
            </div>
            {prof.homepage && (
              <a href={prof.homepage} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex',
                  alignItems: 'center', gap: 4, textDecoration: 'none', flexShrink: 0, paddingTop: 2 }}>
                <Icon.ExternalLink size={11}/> Lab page
              </a>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={onClose} style={{ fontSize: 13 }}>Dismiss</button>
            <button className="btn btn-ghost" style={{ fontSize: 13 }}
              onClick={() => { onClose(); go("profDetail", { prof }); }}>
              <Icon.User size={13}/> Full profile
            </button>
            <button className="btn btn-primary" style={{ fontSize: 13 }}
              onClick={() => { onClose(); go("compose", { compose: prof }); }}>
              <Icon.Send size={13}/> Reach out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
}

// --- HiringBoard ---
function HiringBoard({ go, tier, onUpgrade }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [hiringProfs, setHiringProfs] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [totalCount, setTotalCount]   = useState(0);
  const [q, setQ]                     = useState('');
  const [debouncedQ, setDebouncedQ]   = useState('');
  const [selectedProf, setSelectedProf] = useState(null);
  const [posFilter, setPosFilter]     = useState('All');
  const [sortBy, setSortBy]           = useState('deadline');
  const listRef = useRef(null);

  const POS_OPTIONS = ['All', 'PhD', 'Postdoc', 'RA', 'Research Engineer'];
  const SORT_OPTIONS = [
    { key: 'deadline',   label: 'Deadline',   ordering: 'hiring_deadline' },
    { key: 'confidence', label: 'Confidence', ordering: '-hiring_confidence' },
    { key: 'impact',     label: 'Impact',     ordering: '-citation_count' },
  ];

  // Debounce search — also resets to page 1
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [q]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [posFilter, sortBy]);

  useEffect(() => {
    if (tier === "free") { setLoading(false); return; }
    setLoading(true);
    const ordering = SORT_OPTIONS.find(s => s.key === sortBy)?.ordering || '-citation_count';
    const params = { is_hiring: true, ordering, page, page_size: HIRING_PAGE_SIZE };
    if (debouncedQ) params.search = debouncedQ;
    if (posFilter !== 'All') params.position_type = posFilter;
    professorService.getAll(params)
      .then(res => {
        const results = (res.data.results || res.data || []).map(p => transformProfessor(p));
        setHiringProfs(results);
        setTotalCount(res.data.count || results.length);
      })
      .catch(() => setHiringProfs([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier, page, debouncedQ, posFilter, sortBy]);

  const totalPages = Math.ceil(totalCount / HIRING_PAGE_SIZE) || 0;

  const goPage = (p) => {
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (tier === "free") {
    return <PaywallOverlay title="Hiring board — Pro feature" subtitle="See every posted PhD and postdoc opening in real time. Updated daily from department pages, EURAXESS, and Academic Jobs Online."/>;
  }

  return (
    <div className="fade-in" style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 1100, margin: "0 auto" }}>

      {/* Detail modal */}
      {selectedProf && (
        <HiringDetailModal prof={selectedProf} go={go} onClose={() => setSelectedProf(null)}/>
      )}

      {/* Header */}
      <div className="row between" style={{ marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em" }}>Hiring board</h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {loading
              ? "Loading…"
              : totalCount > 0
                ? `${totalCount.toLocaleString()} professors actively hiring · PhD & postdoc openings.`
                : "No hiring listings found."}
          </p>
        </div>
        <span className="pill pill-green"><Icon.Dot color="oklch(0.55 0.12 155)"/> Live data</span>
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 14px', borderRadius: 9, border: '1px solid var(--line)', background: 'white' }}>
        <Icon.Search size={14} color="var(--ink-4)"/>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search professors, keywords, departments…"
          style={{ border: 0, outline: 0, fontSize: 13.5, flex: 1, fontFamily: 'inherit', background: 'transparent' }}
        />
        {q && (
          <button onClick={() => setQ('')}
            style={{ background: 'none', border: 0, cursor: 'pointer', color: 'var(--ink-4)',
              display: 'grid', placeItems: 'center', padding: 2 }}>
            <Icon.X size={13}/>
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="row gap-2" style={{ marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="row gap-1" style={{ alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-4)', marginRight: 2 }}>Position:</span>
          {POS_OPTIONS.map(p => (
            <button key={p}
              onClick={() => setPosFilter(p)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid',
                borderColor: posFilter === p ? 'var(--green-deep)' : 'var(--line)',
                background: posFilter === p ? 'var(--green-soft)' : 'white',
                color: posFilter === p ? 'var(--green-deep)' : 'var(--ink-2)',
                fontSize: 12, fontWeight: posFilter === p ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit' }}>
              {p}
            </button>
          ))}
        </div>
        <div className="row gap-1" style={{ marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: 11.5, color: 'var(--ink-4)', marginRight: 2 }}>Sort:</span>
          {SORT_OPTIONS.map(s => (
            <button key={s.key}
              onClick={() => setSortBy(s.key)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid',
                borderColor: sortBy === s.key ? 'var(--green-deep)' : 'var(--line)',
                background: sortBy === s.key ? 'var(--green-soft)' : 'white',
                color: sortBy === s.key ? 'var(--green-deep)' : 'var(--ink-2)',
                fontSize: 12, fontWeight: sortBy === s.key ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit' }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div ref={listRef}>
        {loading ? (
          <div className="card" style={{ padding: 0 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ padding: '20px 24px', borderTop: i ? '1px solid var(--line)' : 0,
                display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 12, width: '18%', borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--paper-3), var(--paper-2), var(--paper-3))',
                    backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite' }}/>
                  <div style={{ height: 14, width: '55%', borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--paper-3), var(--paper-2), var(--paper-3))',
                    backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite' }}/>
                  <div style={{ height: 12, width: '35%', borderRadius: 4,
                    background: 'linear-gradient(90deg, var(--paper-3), var(--paper-2), var(--paper-3))',
                    backgroundSize: '200% 100%', animation: 'shimmer 1.4s linear infinite' }}/>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                  <div style={{ height: 30, width: 96, borderRadius: 7, background: 'var(--paper-3)',
                    animation: 'shimmer 1.4s linear infinite' }}/>
                  <div style={{ height: 28, width: 72, borderRadius: 7, background: 'var(--paper-3)',
                    animation: 'shimmer 1.4s linear infinite' }}/>
                </div>
              </div>
            ))}
          </div>
        ) : hiringProfs.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <Icon.Search size={32} color="var(--ink-4)"/>
            <h3 style={{ fontSize: 18, marginTop: 12 }}>No listings found</h3>
            <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
              {q
                ? `No results for "${q}". Try a different search term.`
                : posFilter !== 'All'
                  ? `No ${posFilter} positions found. Try a different position type.`
                  : "No professors are currently listed as hiring."}
            </p>
            {(q || posFilter !== 'All') && (
              <button className="btn" style={{ marginTop: 14 }} onClick={() => { setQ(''); setPosFilter('All'); }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="card" style={{ padding: 0 }}>
            {hiringProfs.map((prof, i) => {
              const urgency     = deadlineUrgency(prof.hiringDeadline);
              const deadlineFmt = fmtDate(prof.hiringDeadline);
              const postedFmt   = relativeDate(prof.dateDetected);
              const jd          = prof.jobDescription || '';
              const JD_LIMIT    = 180;

              // Unique agency labels from active grants
              const agencyBadges = [...new Set(prof.activeGrants.map(g => g.agency).filter(Boolean))].slice(0, 3);

              // Latest funding expiry for summary
              const latestExpiry = prof.activeGrants.reduce((best, g) => {
                if (!g.end_date) return best;
                return !best || g.end_date > best ? g.end_date : best;
              }, null);
              const fundingThrough = fundingExpirySemester(latestExpiry);

              const deadlinePill = urgency === 'expired'
                ? <span className="pill pill-red"><Icon.Clock size={11}/> Expired</span>
                : urgency === 'urgent'
                  ? <span className="pill pill-red"><Icon.Clock size={11}/> Deadline {deadlineFmt}</span>
                  : urgency === 'soon'
                    ? <span className="pill pill-amber"><Icon.Clock size={11}/> Deadline {deadlineFmt}</span>
                    : deadlineFmt
                      ? <span className="pill pill-outline"><Icon.Clock size={11}/> Deadline {deadlineFmt}</span>
                      : null;

              return (
                <div key={prof.id}
                  style={{ padding: "20px 24px", borderTop: i ? "1px solid var(--line)" : 0,
                    cursor: 'pointer' }}
                  onClick={() => setSelectedProf(prof)}>

                  {/* Top meta row: badges + dates */}
                  <div className="row gap-2" style={{ marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="pill pill-green"><Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Hiring</span>
                    {prof.hiring_positions.slice(0, 3).map(pos => (
                      <span key={pos} className="pill pill-blue" style={{ fontSize: 11 }}>{pos}</span>
                    ))}
                    {agencyBadges.map(a => (
                      <span key={a} className="pill" style={{ fontSize: 11, color: 'var(--green-deep)',
                        background: 'var(--green-soft)', border: '1px solid var(--green-soft-2)' }}>{a}</span>
                    ))}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {postedFmt && (
                        <span style={{ fontSize: 11.5, color: 'var(--ink-4)' }}>Posted {postedFmt}</span>
                      )}
                      {prof.intakeSemester && (
                        <span className="pill" style={{ fontSize: 11, background: 'oklch(0.97 0.04 75)',
                          color: 'oklch(0.4 0.1 75)', border: '1px solid oklch(0.88 0.08 75)' }}>
                          <Icon.GraduationCap size={10}/> {prof.intakeSemester}
                        </span>
                      )}
                      {deadlinePill}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Title */}
                      <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.3 }}>
                        {prof.hiring_positions.length > 0
                          ? prof.hiring_positions.join(' / ') + ' — ' + prof.name
                          : `Open position — ${prof.name}`}
                      </div>

                      {/* Institution */}
                      <div className="muted" style={{ fontSize: 12.5, marginTop: 3 }}>
                        {prof.school}
                        {prof.dept && prof.dept !== 'Research Department' ? ` · ${prof.dept}` : ''}
                        {prof.country ? ` · ${prof.country}` : ''}
                      </div>

                      {/* Funding summary row */}
                      {fundingThrough && (
                        <div className="row gap-2" style={{ marginTop: 8, padding: '6px 10px',
                          background: 'var(--green-soft)', borderRadius: 6, fontSize: 12,
                          color: 'var(--green-deep)', alignItems: 'center', display: 'inline-flex' }}>
                          <Icon.Award size={12}/>
                          <span>
                            {agencyBadges.length > 0 ? agencyBadges.join(' · ') + ' · ' : ''}
                            {latestExpiry && prof.activeGrants[0]?.amount
                              ? `$${prof.activeGrants[0].amount >= 1000000
                                  ? (prof.activeGrants[0].amount / 1000000).toFixed(1) + 'M'
                                  : Math.round(prof.activeGrants[0].amount / 1000) + 'k'} · ` : ''}
                            Funding through <strong>{fundingThrough}</strong>
                          </span>
                        </div>
                      )}

                      {/* Job description preview */}
                      {jd && (
                        <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6,
                          margin: '8px 0 0', overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' }}>
                          {jd}
                        </p>
                      )}

                      {/* Keywords + h-index */}
                      <div className="row gap-2" style={{ marginTop: 8, flexWrap: 'wrap' }}>
                        {prof.keywords.slice(0, 4).map(k => (
                          <span key={k} className="pill" style={{ fontSize: 11 }}>{k}</span>
                        ))}
                        {prof.hIndex != null && (
                          <span className="pill pill-outline mono" style={{ fontSize: 11 }}>h-index {prof.hIndex}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col gap-2" style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                      <button className="btn btn-sm btn-primary"
                        onClick={e => { e.stopPropagation(); go("compose", { compose: prof }); }}>
                        <Icon.Send size={12}/> Reach out
                      </button>
                      <button className="btn btn-sm btn-ghost"
                        onClick={e => e.stopPropagation()}>
                        <Icon.Bookmark size={12}/> Save
                      </button>
                      {prof.homepage && (
                        <a href={prof.homepage} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: 12, color: 'var(--ink-4)', display: 'flex',
                            alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                          <Icon.ExternalLink size={11}/> Lab page
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <>
          <Pagination page={page} totalPages={totalPages} onPage={goPage}/>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-4)', marginTop: 10 }}>
            Page {page} of {totalPages} · {totalCount.toLocaleString()} listings total
          </p>
        </>
      )}
    </div>
  );
}

// --- WhatsNew ---
const WN_TABS = [
  { id: 'all',     label: 'All',         Icon: Icon.Sparkles },
  { id: 'hiring',  label: 'Hiring',      Icon: Icon.Inbox    },
  { id: 'grants',  label: 'Grants',      Icon: Icon.Award    },
  { id: 'faculty', label: 'New Faculty', Icon: Icon.User     },
  { id: 'saved',   label: 'My Saved',    Icon: Icon.Bookmark },
];

const WN_TYPE = {
  'new-opening': {
    Icon:       Icon.Inbox,
    iconBg:     'oklch(0.96 0.04 75)',
    iconColor:  'oklch(0.5 0.16 65)',
    border:     'oklch(0.88 0.08 75)',
    label:      'Opening',
    pill:       { background: 'oklch(0.96 0.04 75)', color: 'oklch(0.42 0.14 65)', border: '1px solid oklch(0.88 0.08 75)' },
  },
  'new-grant': {
    Icon:       Icon.Award,
    iconBg:     'var(--green-soft)',
    iconColor:  'var(--green-deep)',
    border:     'var(--green-soft-2)',
    label:      'Grant',
    pill:       { background: 'var(--green-soft)', color: 'var(--green-deep)', border: '1px solid var(--green-soft-2)' },
  },
  'new-prof': {
    Icon:       Icon.User,
    iconBg:     'oklch(0.95 0.03 265)',
    iconColor:  'oklch(0.45 0.14 265)',
    border:     'oklch(0.88 0.06 265)',
    label:      'New faculty',
    pill:       { background: 'oklch(0.95 0.03 265)', color: 'oklch(0.4 0.14 265)', border: '1px solid oklch(0.88 0.06 265)' },
  },
};

const WN_PAGE_SIZE = 15;

function WhatsNew({ go, tier, onUpgrade }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [tab, setTab]           = useState('all');
  const [items, setItems]       = useState([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [synced, setSynced]     = useState(null);
  const [refreshKey, setRefresh] = useState(0);
  const [savedIds, setSavedIds] = useState(new Set());

  // Load saved IDs once
  useEffect(() => {
    savedService.getIds().then(r => {
      const ids = r.data?.ids || r.data || [];
      setSavedIds(new Set(ids.map(String)));
    }).catch(() => {});
  }, []);

  // Fetch on tab / page / refresh change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    whatsnewService.getFeed(tab, page, WN_PAGE_SIZE).then(({ items: newItems, count }) => {
      if (cancelled) return;
      setItems(newItems);
      setTotal(count);
      if (page === 1) setSynced(new Date());
    }).catch(() => {
      if (!cancelled) setItems([]);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [tab, page, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchTab = (id) => { setTab(id); setPage(1); };

  const handleSave = (prof, e) => {
    e.stopPropagation();
    savedService.toggle(prof.id).catch(() => {});
    setSavedIds(prev => {
      const next = new Set(prev);
      next.has(String(prof.id)) ? next.delete(String(prof.id)) : next.add(String(prof.id));
      return next;
    });
  };

  if (tier === 'free') {
    return <PaywallOverlay
      title="Live updates — Pro feature"
      subtitle="Get notified when professors in your shortlist post new openings, win grants, or get indexed. Refreshed automatically."
    />;
  }

  const totalPages = Math.ceil(total / WN_PAGE_SIZE);
  const syncedStr  = synced ? relativeTime(synced.toISOString()) : null;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="col gap-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="card" style={{ padding: '16px 20px', borderLeft: '3px solid var(--paper-3)' }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--paper-3)', flexShrink: 0 }}/>
            <div style={{ flex: 1 }}>
              <div style={{ height: 14, borderRadius: 4, background: 'var(--paper-3)', width: '45%', marginBottom: 8 }}/>
              <div style={{ height: 12, borderRadius: 4, background: 'var(--paper-3)', width: '65%', marginBottom: 6 }}/>
              <div style={{ height: 11, borderRadius: 4, background: 'var(--paper-3)', width: '80%', marginBottom: 10 }}/>
              <div style={{ display: 'flex', gap: 6 }}>
                {[50, 65, 55].map((w, j) => (
                  <div key={j} style={{ height: 20, width: w, borderRadius: 99, background: 'var(--paper-3)' }}/>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ── Feed card ─────────────────────────────────────────────────────────────
  const FeedCard = ({ item }) => {
    const meta    = WN_TYPE[item.type] || WN_TYPE['new-prof'];
    const TypeIcon = meta.Icon;
    const isSaved = savedIds.has(String(item.profId));
    const flagEmoji = item.prof?.country ? (COUNTRY_META[item.prof.country]?.flag || '') : '';
    const kwds    = (item.prof?.keywords || []).slice(0, 3);

    return (
      <div
        className="card"
        style={{
          padding: '16px 20px',
          cursor: 'pointer',
          transition: 'background 0.12s',
          borderLeft: `3px solid ${meta.border}`,
        }}
        onClick={() => go('profDetail', { prof: item.prof })}
        onMouseOver={e => e.currentTarget.style.background = 'var(--paper-2)'}
        onMouseOut={e => e.currentTarget.style.background = ''}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>

          {/* Type icon */}
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: meta.iconBg, display: 'grid', placeItems: 'center',
          }}>
            <TypeIcon size={17} color={meta.iconColor}/>
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Row 1: type pill + professor name + avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
              <span style={{
                fontSize: 10.5, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase',
                padding: '2px 7px', borderRadius: 99, flexShrink: 0,
                ...meta.pill,
              }}>{meta.label}</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', lineHeight: 1.2 }}>
                {item.prof?.name || '—'}
              </span>
            </div>

            {/* Row 2: affiliation + flag */}
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 4 }}>
              {flagEmoji && <span style={{ marginRight: 4 }}>{flagEmoji}</span>}
              {[item.prof?.school, item.prof?.dept].filter(Boolean).join(' · ')}
              {item.prof?.hIndex && (
                <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                  h-index {item.prof.hIndex}
                </span>
              )}
            </div>

            {/* Row 3: activity title (action description) */}
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)', marginBottom: 3 }}>
              {item.title}
            </div>

            {/* Row 4: note */}
            {item.note && (
              <div className="muted" style={{ fontSize: 12, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                {item.note}
              </div>
            )}

            {/* Row 5: keyword chips + footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {kwds.map(kw => (
                <span key={kw} className="pill pill-outline" style={{ fontSize: 10.5 }}>{kw}</span>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span className="muted" style={{ fontSize: 11.5 }}>
                  {relativeTime(item.timestamp) || 'recently'}
                </span>
                <button
                  onClick={e => handleSave(item.prof, e)}
                  title={isSaved ? 'Unsave' : 'Save'}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: 11.5, padding: '3px 6px', borderRadius: 6,
                    color: isSaved ? 'oklch(0.55 0.18 75)' : 'var(--ink-4)',
                    fontFamily: 'inherit',
                  }}
                >
                  {isSaved
                    ? <Icon.StarF size={13} color="oklch(0.65 0.18 75)"/>
                    : <Icon.Star  size={13}/>}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); go('compose', { prof: item.prof }); }}
                  title="Compose email"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 3,
                    fontSize: 11.5, padding: '3px 6px', borderRadius: 6,
                    color: 'var(--ink-4)', fontFamily: 'inherit',
                  }}
                >
                  <Icon.Mail size={12}/> Reach out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in" style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 860, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>What's new</h1>
          <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
            Live activity from the professor database
            {total > 0 && !loading && (
              <span style={{ marginLeft: 8, fontWeight: 500, color: 'var(--ink-3)' }}>
                · {total.toLocaleString()} {WN_TABS.find(t => t.id === tab)?.label.toLowerCase() || 'results'}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {syncedStr && <span className="muted" style={{ fontSize: 12 }}>Updated {syncedStr}</span>}
          <button
            onClick={() => { setPage(1); setRefresh(k => k + 1); }}
            className="btn btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Icon.Trend size={12}/> Refresh
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {WN_TABS.map(t => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 13px', borderRadius: 8,
                border: active ? '1.5px solid var(--green-deep)' : '1px solid var(--line)',
                background: active ? 'var(--green-soft)' : 'var(--paper)',
                color: active ? 'var(--green-deep)' : 'var(--ink-2)',
                fontWeight: active ? 600 : 400, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s',
              }}
            >
              <t.Icon size={13} color={active ? 'var(--green-deep)' : 'var(--ink-4)'}/>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Feed */}
      {loading ? (
        <Skeleton/>
      ) : items.length === 0 ? (
        <div className="card" style={{ padding: '52px 32px', textAlign: 'center' }}>
          {tab === 'saved' ? (
            <>
              <Icon.Bookmark size={32} color="var(--ink-4)"/>
              <p style={{ marginTop: 14, fontWeight: 600, fontSize: 15 }}>No saved professors yet</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                Save professors from Matches to track their activity here.
              </p>
            </>
          ) : (
            <>
              <Icon.Clock size={32} color="var(--ink-4)"/>
              <p style={{ marginTop: 14, fontWeight: 600, fontSize: 15 }}>No updates on this page</p>
              <p className="muted" style={{ fontSize: 13, marginTop: 6 }}>
                Check back soon — the database updates regularly.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="col gap-3">
          {items.map((item, i) => (
            <FeedCard key={`${item.type}-${item.profId}-${i}`} item={item}/>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination page={page} totalPages={totalPages} onPage={p => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}/>
      )}
    </div>
  );
}

// --- Main Discover export (routes to sub-views) ---
export default function Discover({ view, go, tier = "free", setTier, onUpgrade }) {
  if (view === "countries") return <Countries go={go}/>;
  if (view === "reviews")   return <ReviewsFeed go={go}/>;
  if (view === "hiring")    return <HiringBoard go={go} tier={tier} setTier={setTier} onUpgrade={onUpgrade}/>;
  if (view === "whatsnew")  return <WhatsNew go={go} tier={tier} setTier={setTier} onUpgrade={onUpgrade}/>;
  return null;
}
