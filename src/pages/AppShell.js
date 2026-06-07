import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { ScoreRing, Bar, Avatar } from '../components/Shared';
import { professors, outreach, INTERESTS, statusMeta, DEFAULT_CV } from '../data';
import { ProBadge } from '../components/Shared';
import { professorService, transformProfessor, authService, savedService, metaService, cvService, pipelineService, deadlineService, gmailAuthService, outreachEmailService, paymentService } from '../services/api';
import { useTier, useAuth } from '../App';

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

// --- FilterPill ---
function FilterPill({ active, icon, onClick, children }) {
  const I = icon ? Icon[icon] : null;
  return (
    <button className={"chip" + (active ? " selected" : "")} onClick={onClick} style={{ padding: "6px 12px" }}>
      {I && <I size={12}/>}{children}
    </button>
  );
}

// --- Dropdown ---
function Dropdown({ label, options, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="chip" onClick={() => setOpen(!open)} style={{ padding: "6px 12px" }}>
        {label} <Icon.ChevronDown size={12}/>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 4 }}/>
          <div className="card fade-in" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, padding: 4, minWidth: 160, zIndex: 5, boxShadow: "var(--shadow-2)", whiteSpace: "nowrap" }}>
            {options.map(o => {
              const [lab, val] = Array.isArray(o) ? o : [o, o];
              return (
                <div key={val} className="nav-item" style={{ fontSize: 13 }} onClick={() => { onPick(val); setOpen(false); }}>{lab}</div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// --- SegBtn ---
function SegBtn({ active, onClick, children }) {
  return (
    <button className="chip" onClick={onClick} style={{ padding: "5px 10px", background: active ? "var(--ink)" : "white", color: active ? "var(--paper)" : "var(--ink-2)", borderColor: active ? "var(--ink)" : "var(--line)" }}>
      {children}
    </button>
  );
}

// --- Compare view ---
function Compare({ profs, go }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="table">
        <thead>
          <tr><th>Professor</th><th>Score</th><th>Expertise</th><th>Funding</th><th>Activity</th><th>Reputation</th><th>Accepting</th><th></th></tr>
        </thead>
        <tbody>
          {profs.map(p => (
            <tr key={p.id} className="clickable" onClick={() => go("profDetail", { prof: p })}>
              <td>
                <div className="row gap-2">
                  <Avatar initials={p.initials}/>
                  <div className="col" style={{ gap: 0 }}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{p.school}</span>
                  </div>
                </div>
              </td>
              <td><span className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{p.score}</span></td>
              <td><Bar value={p.breakdown.expertise}/></td>
              <td><Bar value={p.breakdown.funding}/></td>
              <td><Bar value={p.breakdown.activity}/></td>
              <td><Bar value={p.breakdown.reputation}/></td>
              <td>{p.accepting ? <span className="pill pill-green">Yes</span> : <span className="pill pill-outline">No</span>}</td>
              <td><Icon.Chevron size={14}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Deterministic color for initials avatar based on prof id
function _profColor(id) {
  const colors = [
    ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fef9c3','#a16207'],
    ['#fce7f3','#9d174d'], ['#ede9fe','#6d28d9'], ['#ffedd5','#c2410c'],
    ['#e0f2fe','#0369a1'], ['#f0fdf4','#166534'],
  ];
  return colors[(parseInt(id, 10) || 0) % colors.length];
}

// --- MatchRowPhoto — shows cached photo_url or deterministic colored initials
function MatchRowPhoto({ prof }) {
  const [imgError, setImgError] = useState(false);
  const [bg, fg] = _profColor(prof.id);

  if (prof.photoUrl && !imgError) {
    return (
      <img src={prof.photoUrl} alt={prof.name} onError={() => setImgError(true)}
        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover',
          flexShrink: 0, border: '1px solid var(--line)' }}/>
    );
  }
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background: bg,
      color: fg, display: 'grid', placeItems: 'center',
      fontSize: 13, fontWeight: 700, flexShrink: 0, border: '1px solid var(--line)' }}>
      {prof.initials}
    </div>
  );
}

// --- MatchRow ---
function MatchRow({ prof, onOpen, onCompose, saved, onSave, first, interestKeywords }) {
  const { isMobile } = useBreakpoint();
  const matchKw = (k) => interestKeywords && interestKeywords.has(k.toLowerCase());
  const countryFlags = { "USA": "🇺🇸", "UK": "🇬🇧", "Switzerland": "🇨🇭", "France": "🇫🇷", "Japan": "🇯🇵", "Germany": "🇩🇪", "Canada": "🇨🇦" };
  const flag = countryFlags[prof.country] || "🌐";

  const statusPill = prof.accepting
    ? prof.hiringConfidence >= 75
      ? <span className="pill pill-green" style={{ fontSize: 10.5 }}><Icon.Check size={9}/> Confirmed</span>
      : prof.hiringConfidence >= 25
        ? <span className="pill" style={{ fontSize: 10.5, background: "oklch(0.22 0.06 75)", color: "oklch(0.8 0.13 75)", border: "1px solid oklch(0.35 0.1 75)" }}><Icon.Dot color="oklch(0.7 0.13 75)" size={6}/> Likely hiring</span>
        : <span className="pill pill-green" style={{ fontSize: 10.5 }}><Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Accepting</span>
    : <span className="pill pill-outline" style={{ fontSize: 10.5 }}>Not accepting</span>;

  if (isMobile) {
    return (
      <div style={{
        padding: "14px 16px",
        borderTop: first ? "none" : "1px solid var(--line)",
        cursor: "pointer",
      }}
        onClick={onOpen}
        onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
        onMouseOut={e => e.currentTarget.style.background = ""}
      >
        {/* Top: avatar + name + score */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
          <MatchRowPhoto prof={prof}/>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{prof.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {flag} {prof.school}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
            <ScoreRing value={prof.score}/>
          </div>
        </div>

        {/* Status pill + dept */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7, flexWrap: "wrap" }}>
          {statusPill}
          <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{prof.dept}</span>
        </div>

        {/* Keywords */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {prof.keywords.slice(0, 3).map(k => (
            <span key={k} className={"pill " + (matchKw(k) ? "pill-green" : "")} style={{ fontSize: 11 }}>
              {matchKw(k) && <Icon.Check size={9}/>}{k}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
          <button className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onSave}>
            {saved ? <Icon.StarF size={13} color="oklch(0.7 0.13 75)"/> : <Icon.Star size={13}/>}
            {saved ? "Saved" : "Save"}
          </button>
          <button className="btn btn-sm btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={onCompose}>
            <Icon.Send size={11}/> Reach out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="row gap-4" style={{
      padding: "20px 20px",
      borderTop: first ? "none" : "1px solid var(--line)",
      cursor: "pointer",
    }}
      onClick={onOpen}
      onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
      onMouseOut={e => e.currentTarget.style.background = ""}
    >
      <div className="col gap-1" style={{ alignItems: "center" }}>
        <ScoreRing value={prof.score}/>
        <MatchRowPhoto prof={prof}/>
      </div>
      <div className="col" style={{ flex: 1, gap: 6, minWidth: 0 }}>
        <div className="row gap-1" style={{ fontSize: 11.5, color: "var(--ink-3)", alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>{flag}</span>
          <span>{prof.country}</span>
          <Icon.Chevron size={10} color="var(--ink-4)"/>
          <span style={{ fontWeight: 500, color: "var(--ink-2)" }}>{prof.school}</span>
          <Icon.Chevron size={10} color="var(--ink-4)"/>
          <span className="muted">{prof.dept}</span>
        </div>
        <div className="row gap-2" style={{ alignItems: "baseline", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 500, fontSize: 16 }}>{prof.name}</span>
          <span className="muted" style={{ fontSize: 13 }}>· {prof.title}</span>
          {statusPill}
          {prof.professorStatus === 'emeritus' && (
            <span className="pill" style={{ fontSize: 11, color: "var(--ink-3)", background: "var(--paper-3)", border: "1px solid var(--line)" }}>Emeritus</span>
          )}
          {prof.professorStatus === 'moved' && (
            <span className="pill" style={{ fontSize: 11, color: "oklch(0.8 0.1 75)", background: "oklch(0.2 0.04 75)", border: "1px solid oklch(0.35 0.08 75)" }}>Moved</span>
          )}
          {prof.professorStatus === 'unverified' && (
            <span className="pill" style={{ fontSize: 11, color: "oklch(0.82 0.1 50)", background: "oklch(0.2 0.04 50)", border: "1px solid oklch(0.35 0.08 50)" }}>Homepage 404</span>
          )}
        </div>
        <div className="muted" style={{ fontSize: 12 }}>
          <span className="mono">h={prof.hIndex}</span>
          <span style={{ margin: "0 10px", color: "var(--line-2)" }}>·</span>
          <span className="mono">{prof.citations.toLocaleString()} citations</span>
        </div>
        <div className="row gap-1" style={{ flexWrap: "wrap", marginTop: 2 }}>
          {prof.keywords.slice(0, 4).map(k => (
            <span key={k} className={"pill " + (matchKw(k) ? "pill-green" : "")}>
              {matchKw(k) && <Icon.Check size={10}/>}{k}
            </span>
          ))}
          {prof.dataCompleteness < 50 && (
            <span className="pill" style={{ fontSize: 11, color: "var(--ink-3)", background: "var(--paper-3)", border: "1px solid var(--line)" }}>Partial profile</span>
          )}
        </div>
        <div className="row gap-2" style={{ marginTop: 4, fontSize: 12, color: "var(--ink-2)" }}>
          <Icon.Sparkles size={12} color="var(--green-hi)"/>
          <span>{prof.reasons[0]}</span>
        </div>
        {prof.funding && (
          <div className="row gap-2 mt-2" style={{ padding: "8px 10px", background: "var(--green-soft)", borderRadius: 6, fontSize: 12, color: "var(--green-deep)", alignItems: "center" }}>
            <Icon.Award size={13}/>
            <span style={{ fontWeight: 500 }}>Funded:</span>
            <span className="mono">{prof.funding}</span>
          </div>
        )}
      </div>
      <div className="col gap-2" style={{ alignItems: "flex-end" }} onClick={e => e.stopPropagation()}>
        <button className="btn btn-sm btn-ghost" onClick={onSave}>
          {saved ? <Icon.StarF size={14} color="oklch(0.7 0.13 75)"/> : <Icon.Star size={14}/>}
          {saved ? "Saved" : "Save"}
        </button>
        <button className="btn btn-sm btn-primary" onClick={onCompose}>
          <Icon.Send size={12}/> Reach out
        </button>
      </div>
    </div>
  );
}

// --- EmptyMatches ---
function EmptyMatches({ noInterests, fundedOnly, onEdit, onDropFunded }) {
  return (
    <div className="card" style={{ padding: 48, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--paper-3)", display: "grid", placeItems: "center", margin: "0 auto" }}>
        <Icon.Search size={24} color="var(--ink-4)"/>
      </div>
      <h3 style={{ fontSize: 18, marginTop: 14 }}>No professors match your filters</h3>
      <p className="muted" style={{ fontSize: 13, maxWidth: 380, margin: "8px auto 18px" }}>
        {noInterests
          ? "Select at least one research interest to see matches."
          : fundedOnly
            ? "Try broadening your interests, or include positions without confirmed funding."
            : "Try broadening your interests or removing region filters."}
      </p>
      <div className="row gap-2" style={{ justifyContent: "center" }}>
        <button className="btn btn-primary" onClick={onEdit}><Icon.Plus size={13}/> Edit interests</button>
        {fundedOnly && <button className="btn" onClick={onDropFunded}>Include unfunded positions</button>}
      </div>
    </div>
  );
}

// --- PreferenceBar ---
function PreferenceBar({ prefs, setPrefs, togglePref, editing, setEditing, selectedInterests }) {
  const { isMobile } = useBreakpoint();
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", borderColor: "var(--green-soft-2)" }}>
      <div style={{
        padding: isMobile ? "12px 14px" : "14px 18px",
        background: "linear-gradient(180deg, var(--green-soft) 0%, transparent 100%)",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: 10,
      }}>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon.Sparkles size={14}/>
          </div>
          <div className="col" style={{ gap: 0 }}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Research preferences</span>
            <span className="muted" style={{ fontSize: 11.5 }}>
              {prefs.fundedOnly ? <span>Funded positions · filtered matches</span> : "Filtered by your interests below"}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <button
            onClick={() => setPrefs({ ...prefs, fundedOnly: !prefs.fundedOnly })}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "6px 10px", borderRadius: 8, flex: isMobile ? 1 : "none",
              justifyContent: isMobile ? "center" : "flex-start",
              border: "1px solid " + (prefs.fundedOnly ? "var(--green-deep)" : "var(--line)"),
              background: prefs.fundedOnly ? "var(--green-deep)" : "white",
              color: prefs.fundedOnly ? "var(--paper)" : "var(--ink-2)",
              fontSize: 12.5, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}>
            <Icon.Award size={13}/> {isMobile ? "Funded only" : "Funded positions only"}
          </button>
          <button className="btn btn-sm" style={{ flex: isMobile ? 1 : "none", justifyContent: isMobile ? "center" : "flex-start" }} onClick={() => setEditing(!editing)}>
            {editing ? "Done" : "Edit interests"}
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="row gap-2" style={{ padding: "12px 18px 16px", flexWrap: "wrap", borderTop: "1px solid var(--line)" }}>
          {selectedInterests.length === 0
            ? <span className="muted" style={{ fontSize: 12.5 }}>No interests selected — <span style={{ color: "var(--green-deep)", textDecoration: "underline", cursor: "pointer" }} onClick={() => setEditing(true)}>add some</span> to filter your list.</span>
            : selectedInterests.map(cat => {
                const I = Icon[cat.icon];
                return (
                  <span key={cat.id} className="row gap-1" style={{ padding: "5px 10px 5px 8px", borderRadius: 999, background: "var(--green-deep)", color: "var(--paper)", fontSize: 12.5, fontWeight: 500, alignItems: "center" }}>
                    {I && <I size={12}/>} {cat.label}
                    <button onClick={() => togglePref(cat.id)} style={{ background: "transparent", border: 0, color: "var(--paper)", opacity: 0.7, cursor: "pointer", padding: 0, marginLeft: 4, display: "grid", placeItems: "center" }}>
                      <Icon.X size={11}/>
                    </button>
                  </span>
                );
              })}
        </div>
      ) : (
        <div style={{ padding: "12px 18px 18px", borderTop: "1px solid var(--line)" }}>
          {/* Group interests by category */}
          {["Technology", "Sciences", "Social Sciences", "Humanities"].map(cat => {
            const catItems = INTERESTS.filter(i => i.category === cat);
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, color: "var(--ink-4)", marginBottom: 8 }}>{cat}</div>
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  {catItems.map(item => {
                    const I = Icon[item.icon];
                    const on = prefs.interests.has(item.id);
                    return (
                      <button key={item.id}
                        onClick={() => togglePref(item.id)}
                        className="row gap-1"
                        style={{ padding: "6px 11px", borderRadius: 8, border: "1px solid " + (on ? "var(--green-deep)" : "var(--line)"), background: on ? "var(--green-deep)" : "white", color: on ? "var(--paper)" : "var(--ink-2)", fontSize: 12.5, fontWeight: 500, cursor: "pointer", transition: "all 0.12s" }}>
                        {on ? <Icon.Check size={11}/> : (I ? <I size={11}/> : null)} {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>
            <Icon.Sparkles size={11} color="var(--green-hi)"/> Each area expands into dozens of sub-topics for flexible matching across all academic fields.
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton row shown while loading
function MatchSkeleton() {
  const { isMobile } = useBreakpoint();
  const sh = (w) => (
    <div style={{ height: 12, width: w, borderRadius: 4, background: "linear-gradient(90deg, var(--paper-3), var(--paper-2), var(--paper-3))", backgroundSize: "200% 100%", animation: "shimmer 1.4s linear infinite" }}/>
  );
  return (
    <div className="row gap-3" style={{ padding: isMobile ? "14px 16px" : "20px 20px", borderTop: "1px solid var(--line)" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--paper-3)", animation: "shimmer 1.4s linear infinite", flexShrink: 0 }}/>
      <div className="col gap-2" style={{ flex: 1 }}>
        {sh("45%")} {sh("65%")} {sh("55%")}
      </div>
    </div>
  );
}

// --- PageNav (shared pagination component) ---
const MATCHES_PAGE_SIZE = 10;

function PageNav({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
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
  const s = (active, disabled) => ({
    padding: '5px 10px', borderRadius: 7, border: '1px solid',
    background: active ? 'var(--ink)' : 'white',
    color: active ? 'var(--paper)' : 'var(--ink-2)',
    borderColor: active ? 'var(--ink)' : 'var(--line)',
    cursor: disabled || active ? 'default' : 'pointer',
    fontSize: 13, fontWeight: active ? 600 : 400,
    minWidth: 34, textAlign: 'center',
    opacity: disabled ? 0.4 : 1, fontFamily: 'inherit',
  });
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center', marginTop: 20, flexWrap: 'wrap' }}>
      <button style={s(false, page === 1)} disabled={page === 1} onClick={() => onPage(page - 1)}>
        <Icon.Chevron size={12} style={{ transform: 'rotate(180deg)', display: 'inline-block', verticalAlign: 'middle' }}/> Prev
      </button>
      {pages.map((p, i) =>
        p === '…'
          ? <span key={`e${i}`} style={{ padding: '0 2px', color: 'var(--ink-4)', fontSize: 13 }}>…</span>
          : <button key={p} style={s(p === page, false)} onClick={() => p !== page && onPage(p)}>{p}</button>
      )}
      <button style={s(false, page === totalPages)} disabled={page === totalPages} onClick={() => onPage(page + 1)}>
        Next <Icon.Chevron size={12} style={{ display: 'inline-block', verticalAlign: 'middle' }}/>
      </button>
    </div>
  );
}

// --- Matches ---
function Matches({ go, savedIds, toggleSave, prefs, setPrefs, togglePref, cvVersions = [] }) {
  const { isMobile, isTablet } = useBreakpoint();
  const { user } = useAuth();
  const [filter, setFilter] = useState({ accepting: false, region: "All", sort: "score" });
  const [view, setView] = useState("list");
  const [editingInterests, setEditingInterests] = useState(false);

  // API state
  const [apiProfs, setApiProfs] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [apiError, setApiError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage]         = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalDbCount, setTotalDbCount] = useState(null);
  const listRef = useRef(null);

  // Wrap parent setters so interest/pref changes always reset to page 1
  const wrappedSetPrefs   = (p)  => { setPage(1); setPrefs(p); };
  const wrappedTogglePref = (id) => { setPage(1); togglePref(id); };

  // Fetch total DB count once (unfiltered) for the hero stat
  useEffect(() => {
    professorService.getAll({ page_size: 1 })
      .then(res => setTotalDbCount(res.data.count || 0))
      .catch(() => {});
  }, []);

  const selectedCats = INTERESTS.filter(c => prefs.interests.has(c.id));

  // All keyword terms (lowercase) from selected interests — used for highlighting only
  const interestKeywords = new Set();
  selectedCats.forEach(cat => cat.keywords.forEach(k => interestKeywords.add(k.toLowerCase())));

  // Stable filter key — changes when any filter/interest changes (not on page change)
  const filterKey = [
    filter.accepting, filter.region, prefs.fundedOnly,
    [...prefs.interests].sort().join(','),
  ].join('|');

  // Build API params from current filters.
  // Uses ?topics= OR-filter instead of ?search= (DRF SearchFilter ANDs words which gave only 2 results
  // because OpenAlex tags everyone as "Computer science", not subfield terms).
  const buildParams = (pg) => {
    const params = { page: pg, ordering: '-citation_count', page_size: MATCHES_PAGE_SIZE };
    if (filter.accepting || prefs.fundedOnly) params.is_hiring = true;
    if (filter.region === "Americas") params.country = "USA";
    if (filter.region === "Europe")   params.country = "Europe";
    if (filter.region === "Asia")     params.country = "China";
    if (selectedCats.length > 0) {
      const allTopics = [...new Set(selectedCats.flatMap(c => c.db_topics || []))];
      if (allTopics.length > 0) params.topics = allTopics.join(',');
    }
    return params;
  };

  // Fetch (replace) whenever page or filters change
  useEffect(() => {
    setLoading(true);
    setApiProfs([]);
    setApiError(false);
    professorService.getAll(buildParams(page))
      .then(res => {
        const results = (res.data.results || res.data || []).map(transformProfessor);
        setApiProfs(results);
        setTotalCount(res.data.count || results.length);
      })
      .catch(() => {
        setApiProfs([]);
        setTotalCount(0);
        setApiError(true);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterKey, retryCount]);

  const totalPages = Math.ceil(totalCount / MATCHES_PAGE_SIZE) || 0;

  const goPage = (p) => {
    setPage(p);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Client-side sort (sort is not sent to API — only citation_count ordering from backend)
  let profs = [...apiProfs];
  if (filter.accepting) profs = profs.filter(p => p.accepting);
  if (filter.sort === "score")  profs.sort((a, b) => b.score - a.score);
  if (filter.sort === "recent") profs.sort((a, b) => b.breakdown.activity - a.breakdown.activity);

  const noInterests = prefs.interests.size === 0;

  // Time-aware greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.username || 'there';

  return (
    <div className="fade-in" style={{
      padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px",
      maxWidth: 1100, margin: "0 auto",
    }}>

      {/* ── Hero header ── */}
      <div style={{ marginBottom: 24 }}>
        <div className="row gap-2" style={{ marginBottom: 10, flexWrap: "wrap" }}>
          <span className="pill pill-green">
            <Icon.Dot color="oklch(0.55 0.12 155)"/> Live database
          </span>
          <span className="pill pill-outline mono">ranked by match score</span>
        </div>
        <div className="row between" style={{ alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em", margin: 0 }}>
              <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>
                {timeGreeting}, {displayName}.
              </span>
            </h1>
            <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>
              {loading
                ? "Loading matches…"
                : apiError
                  ? "Could not reach the server."
                  : totalCount > 0
                    ? `${totalCount.toLocaleString()} professors${selectedCats.length > 0 ? ` in ${selectedCats.map(c => c.label).join(', ')}` : ''}${prefs.fundedOnly ? " — funded only" : ""}.`
                    : "No professors found for current filters. Try broadening your interests."}
            </p>
          </div>
          <div className="row gap-2">
            <button className="btn btn-primary"><Icon.Sparkles size={13}/> Re-rank</button>
          </div>
        </div>
      </div>

      {/* ── CV gate banner ── */}
      {user && cvVersions.length === 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fbbf24', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>📄</span>
          <div style={{ flex: 1, fontSize: 13 }}>
            <strong>Get better matches</strong> — create a CV so we can rank labs by your research profile.
          </div>
          <button className="btn btn-sm" onClick={() => go('cv')}
            style={{ background: '#92400e', color: 'white', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Create CV →
          </button>
        </div>
      )}

      {/* ── Stats strip ── */}
      {totalDbCount !== null && totalDbCount > 0 && !isMobile && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "white",
            border: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--green-soft)",
              display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon.Building size={15} color="var(--green-deep)"/>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {totalDbCount.toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>professors indexed</div>
            </div>
          </div>
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "white",
            border: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--green-soft)",
              display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon.Award size={15} color="var(--green-deep)"/>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                {loading ? "…" : totalCount.toLocaleString()}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>
                {noInterests ? "available to browse" : "in your research areas"}
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 18px", borderRadius: 12, background: "white",
            border: "1px solid var(--line)", display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--green-soft)",
              display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon.Globe size={15} color="var(--green-deep)"/>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>40+</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>countries covered</div>
            </div>
          </div>
        </div>
      )}

      <PreferenceBar prefs={prefs} setPrefs={wrappedSetPrefs} togglePref={wrappedTogglePref} editing={editingInterests} setEditing={setEditingInterests} selectedInterests={selectedCats}/>

      {/* ── No-interests nudge (non-blocking) ── */}
      {noInterests && !loading && profs.length > 0 && (
        <div style={{ margin: "12px 0", padding: "10px 16px", borderRadius: 9,
          background: "var(--paper-2)", border: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
          <Icon.Sparkles size={14} color="var(--green-hi)"/>
          <span style={{ color: "var(--ink-2)" }}>
            Showing all professors by citation count.{" "}
            <span style={{ color: "var(--green-deep)", cursor: "pointer", textDecoration: "underline" }}
              onClick={() => setEditingInterests(true)}>
              Add research interests
            </span>{" "}
            to personalise your matches.
          </span>
        </div>
      )}

      <div style={{ margin: "12px 0", display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <FilterPill active={filter.accepting} onClick={() => { setPage(1); setFilter({ ...filter, accepting: !filter.accepting }); }} icon="Check">
          Accepting
        </FilterPill>
        <Dropdown label={`Region: ${filter.region}`} options={["All", "Americas", "Europe", "Asia"]} onPick={v => { setPage(1); setFilter({ ...filter, region: v }); }}/>
        <Dropdown label={"Sort: " + (filter.sort === "score" ? "Match" : "Recent")} options={[["Match score", "score"], ["Activity recency", "recent"]]} onPick={v => setFilter({ ...filter, sort: v })}/>
        <div style={{ marginLeft: isMobile ? 0 : "auto" }} className="row gap-1">
          <SegBtn active={view === "list"} onClick={() => setView("list")}>List</SegBtn>
          <SegBtn active={view === "compare"} onClick={() => setView("compare")}>Compare</SegBtn>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: 0 }}>
          {[...Array(MATCHES_PAGE_SIZE)].map((_, i) => <MatchSkeleton key={i}/>)}
        </div>
      ) : apiError ? (
        <div className="card" style={{ padding: "40px 32px", textAlign: "center" }}>
          <Icon.AlertCircle size={28} color="var(--ink-4)"/>
          <p style={{ marginTop: 12, fontWeight: 500, fontSize: 15 }}>Unable to reach the server</p>
          <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>Check your connection or try again in a moment.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }}
            onClick={() => setRetryCount(n => n + 1)}>
            Retry
          </button>
        </div>
      ) : profs.length === 0 ? (
        <EmptyMatches noInterests={noInterests} fundedOnly={prefs.fundedOnly}
          onEdit={() => setEditingInterests(true)}
          onDropFunded={() => wrappedSetPrefs({ ...prefs, fundedOnly: false })}/>
      ) : view === "list" ? (
        <>
          <div ref={listRef} className="card" style={{ padding: 0 }}>
            {profs.map((p, i) => (
              <MatchRow key={p.id} prof={p}
                onOpen={() => go("profDetail", { prof: p })}
                onCompose={() => go("compose", { compose: p })}
                saved={savedIds.has(p.id)}
                onSave={() => toggleSave(p.id)}
                first={i === 0}
                interestKeywords={interestKeywords}/>
            ))}
          </div>
          <PageNav page={page} totalPages={totalPages} onPage={goPage}/>
          {totalPages > 1 && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-4)', marginTop: 8 }}>
              Page {page} of {totalPages} · {totalCount.toLocaleString()} professors
            </p>
          )}
        </>
      ) : (
        <Compare profs={profs.slice(0, 3)} go={go}/>
      )}

      {totalDbCount !== null && totalDbCount > 0 && (
        <div className="row gap-2 mt-6" style={{ padding: 14, background: "var(--paper-2)", borderRadius: 10, fontSize: 12.5, color: "var(--ink-2)" }}>
          <Icon.Sparkles size={14} color="var(--green-hi)"/>
          <div>
            <strong>{totalDbCount.toLocaleString()} professors</strong> across 40+ countries, updated continuously.{" "}
            <span style={{ color: "var(--green-deep)", textDecoration: "underline", cursor: "pointer" }}
              onClick={() => setEditingInterests(true)}>Edit interests →</span>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SavedView ---
function SavedView({ go, savedIds, toggleSave }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [profs, setProfs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    savedService.getAll()
      .then(res => {
        const rows = res.data.results || res.data || [];
        setProfs(rows.map(sp => transformProfessor(sp.professor_details)));
      })
      .catch(() => setProfs([]))
      .finally(() => setLoading(false));
  // Re-fetch whenever the saved count changes (toggle happened)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedIds.size]);

  return (
    <div className="fade-in" style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em", marginBottom: 8 }}>
        Saved <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>({profs.length})</span>
      </h1>
      <p className="muted" style={{ marginBottom: 24 }}>Your shortlist. Drag to reorder, or compare side-by-side.</p>
      {loading ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "var(--ink-3)" }}>Loading…</div>
      ) : profs.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <Icon.Bookmark size={32} color="var(--ink-4)"/>
          <h3 style={{ fontSize: 18, marginTop: 12 }}>No saved professors yet</h3>
          <p className="muted" style={{ fontSize: 13 }}>Hit the Star button on any professor to add them here.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          {profs.map((p, i) => (
            <MatchRow key={p.id} prof={p}
              onOpen={() => go("profDetail", { prof: p })}
              onCompose={() => go("compose", { compose: p })}
              saved={savedIds.has(p.id)}
              onSave={() => toggleSave(p.id)}
              first={i === 0}/>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Outreach ---
const OUTREACH_STATUS = {
  sent:     { pill: 'pill-blue',    dot: 'var(--blue)',   label: 'Sent' },
  opened:   { pill: 'pill-amber',   dot: 'var(--amber, #d97706)', label: 'Opened' },
  replied:  { pill: 'pill-green',   dot: 'var(--green)',  label: 'Replied' },
  bounced:  { pill: 'pill-red',     dot: 'var(--red)',    label: 'Bounced' },
  no_reply: { pill: 'pill-outline', dot: 'var(--ink-4)',  label: 'No reply' },
};

function outreachRelTime(isoStr) {
  if (!isoStr) return '—';
  const secs = (Date.now() - new Date(isoStr)) / 1000;
  if (secs < 3600)  return `${Math.max(1, Math.round(secs / 60))}m ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)}h ago`;
  return `${Math.round(secs / 86400)}d ago`;
}

function outreachInitials(name) {
  return (name || '').split(' ').filter(w => /[A-Za-z]/.test(w)).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function Outreach({ go }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [tab, setTab]       = useState("all");
  const [emails, setEmails] = useState([]);
  const [stats, setStats]   = useState(null);
  const [gmail, setGmail]   = useState({ connected: false, email: '' });
  const [loading, setLoading] = useState(true);
  const [gmailError, setGmailError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [gmailRes, emailsRes, statsRes] = await Promise.all([
        gmailAuthService.status().catch(() => ({ data: { connected: false, email: '' } })),
        outreachEmailService.getAll().catch(() => ({ data: [] })),
        outreachEmailService.getStats().catch(() => ({ data: { total: 0, opened: 0, replied: 0, bounced: 0, open_rate: 0, reply_rate: 0 } })),
      ]);
      if (!cancelled) {
        setGmail(gmailRes.data);
        setEmails(gmailRes.data?.connected ? (emailsRes.data?.results || emailsRes.data || []) : []);
        setStats(statsRes.data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function connectGmail() {
    setGmailError('');
    gmailAuthService.start()
      .then(res => {
        const popup = window.open(res.data.auth_url, 'gmail_oauth', 'width=600,height=700,left=200,top=100');
        const handler = (e) => {
          if (e.data?.type === 'gmail_oauth_success') {
            window.removeEventListener('message', handler);
            setGmail({ connected: true, email: e.data.email || '' });
            popup?.close();
          } else if (e.data?.type === 'gmail_oauth_error') {
            window.removeEventListener('message', handler);
            setGmailError(e.data.message || 'Gmail connection failed.');
            popup?.close();
          }
        };
        window.addEventListener('message', handler);
      })
      .catch(err => {
        const msg = err?.response?.data?.error || 'Failed to start Gmail connection. Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are configured.';
        setGmailError(msg);
      });
  }

  function disconnectGmail() {
    gmailAuthService.disconnect()
      .then(() => setGmail({ connected: false, email: '' }))
      .catch(() => {});
  }

  const filtered = tab === "all" ? emails : emails.filter(e => e.status === tab);

  const statCards = [
    { label: "Sent",      v: stats?.total    ?? "—", c: "var(--ink)" },
    { label: "Open rate", v: stats ? `${stats.open_rate}%`  : "—", c: "var(--blue)" },
    { label: "Replies",   v: stats ? `${stats.replied} (${stats.reply_rate}%)` : "—", c: "var(--green)" },
    { label: "Bounces",   v: stats?.bounced  ?? "—", c: "var(--red)" },
  ];

  const TABS = [
    ["all",      "All",       emails.length],
    ["replied",  "Replied",   emails.filter(e => e.status === 'replied').length],
    ["opened",   "Opened",    emails.filter(e => e.status === 'opened').length],
    ["no_reply", "No reply",  emails.filter(e => e.status === 'no_reply').length],
    ["bounced",  "Bounced",   emails.filter(e => e.status === 'bounced').length],
  ];

  return (
    <div className="fade-in" style={{
      padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px",
      maxWidth: 1100, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", flexWrap: "wrap",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: 12, marginBottom: 24,
      }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em" }}>Outreach</h1>
          <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>Sent emails, replies, and tracking.</p>
        </div>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {gmail.connected ? (
            <div className="row gap-2" style={{ padding: "6px 12px", background: "var(--green-soft)", borderRadius: 8, fontSize: 12, color: "var(--green-deep)", alignItems: "center" }}>
              <Icon.Check size={12}/>
              <span style={{ fontWeight: 500 }}>{isMobile ? gmail.email.split('@')[0] : gmail.email}</span>
              <button className="btn btn-sm" style={{ fontSize: 11, padding: "2px 8px", marginLeft: 4 }} onClick={disconnectGmail}>Disconnect</button>
            </div>
          ) : (
            <button className="btn" onClick={connectGmail}>
              <Icon.Mail size={13}/> Connect Gmail
            </button>
          )}
          <button className="btn btn-primary" onClick={() => go("matches")}>
            <Icon.Plus size={13}/> {isMobile ? "New" : "New outreach"}
          </button>
        </div>
      </div>

      {/* Connect Gmail banner */}
      {!gmail.connected && (
        <div className="card row gap-3" style={{ padding: "16px 20px", marginBottom: gmailError ? 8 : 20, background: "#fffbeb", borderColor: "#fbbf24", alignItems: "center" }}>
          <Icon.Mail size={20} color="#d97706"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13.5 }}>Connect Gmail to send and track outreach emails</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
              Link your personal Gmail account — emails are sent from your address and we track opens automatically.
            </div>
          </div>
          <button className="btn btn-primary" onClick={connectGmail}>Connect Gmail</button>
        </div>
      )}
      {gmailError && (
        <div style={{ marginBottom: 20, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, fontSize: 13, color: "#991b1b" }}>
          {gmailError}
        </div>
      )}

      {/* Stats */}
      <div style={{ marginBottom: 24, display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12 }}>
        {statCards.map(s => (
          <div key={s.label} className="card" style={{ padding: 18 }}>
            <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: "-0.02em", color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 12 }}>
        {TABS.map(([id, l, n]) => (
          <div key={id} className={"tab " + (tab === id ? "active" : "")} onClick={() => setTab(id)}>
            {l} <span className="mono muted" style={{ marginLeft: 4 }}>· {n}</span>
          </div>
        ))}
      </div>

      {/* Email table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }} className="muted">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="col center" style={{ padding: isMobile ? "40px 20px" : "56px 32px", gap: 12 }}>
            <Icon.Inbox size={36} color="var(--ink-4)"/>
            <div style={{ fontWeight: 500, fontSize: 15 }}>No emails yet</div>
            <div className="muted" style={{ fontSize: 13, textAlign: "center", maxWidth: 340 }}>
              {gmail.connected
                ? "Open a professor profile and use the Composer to send your first email."
                : "Connect Gmail first, then compose emails from any professor profile."}
            </div>
            {gmail.connected
              ? <button className="btn btn-primary btn-sm" onClick={() => go("matches")}>Browse professors</button>
              : <button className="btn btn-primary btn-sm" onClick={connectGmail}>Connect Gmail</button>}
          </div>
        ) : isMobile ? (
          /* Mobile: card list instead of table */
          <div>
            {filtered.map((o, i) => {
              const meta = OUTREACH_STATUS[o.status] || OUTREACH_STATUS['sent'];
              return (
                <div key={o.id} style={{ padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--line)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e0e7ff", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, color: "#6366f1", flexShrink: 0 }}>
                    {outreachInitials(o.prof_name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontWeight: 500, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.prof_name}</span>
                      <span className={"pill " + meta.pill} style={{ flexShrink: 0 }}><Icon.Dot color={meta.dot} size={6}/>{meta.label}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{o.subject}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-4)" }}>{outreachRelTime(o.sent_at)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr><th>Professor</th><th>Subject</th><th>Status</th><th>Opens</th><th>Sent</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const meta = OUTREACH_STATUS[o.status] || OUTREACH_STATUS['sent'];
                return (
                  <tr key={o.id} className="clickable">
                    <td>
                      <div className="row gap-2">
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0e7ff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "#6366f1", flexShrink: 0 }}>
                          {outreachInitials(o.prof_name)}
                        </div>
                        <div className="col" style={{ gap: 0 }}>
                          <span style={{ fontWeight: 500 }}>{o.prof_name}</span>
                          <span className="muted" style={{ fontSize: 11 }}>{o.prof_affil || o.prof_email}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.subject}</td>
                    <td><span className={"pill " + meta.pill}><Icon.Dot color={meta.dot} size={6}/>{meta.label}</span></td>
                    <td>
                      <span className="row gap-1 muted" style={{ fontSize: 12 }}><Icon.Eye size={12}/>{o.opens}</span>
                    </td>
                    <td className="muted" style={{ fontSize: 12 }}>{outreachRelTime(o.sent_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- SettingsView (inline) ---
function TogglePill({ on: initialOn }) {
  const [v, setV] = useState(!!initialOn);
  return (
    <button onClick={() => setV(!v)} style={{ width: 32, height: 18, borderRadius: 9999, background: v ? "var(--green-deep)" : "var(--paper-3)", border: 0, padding: 2, cursor: "pointer" }}>
      <span style={{ display: "block", width: 14, height: 14, background: "white", borderRadius: "50%", marginLeft: v ? 14 : 0, transition: "margin 0.15s" }}/>
    </button>
  );
}

function SettingsRow({ label, hint, right, customRight }) {
  return (
    <div className="row between" style={{ padding: "14px 20px" }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 450 }}>{label}</div>
        {hint && <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{hint}</div>}
      </div>
      <div>{customRight ?? right}</div>
    </div>
  );
}

function SettingSection({ title, children }) {
  return (
    <div className="card" style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
        <h3 style={{ fontSize: 14 }}>{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}

function BillingSection() {
  const { tier } = useTier();
  const { user } = useAuth();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [billingErr, setBillingErr] = useState(null);
  const [cancelDone, setCancelDone] = useState(false);

  const MONTHLY = process.env.REACT_APP_PADDLE_MONTHLY_PRICE_ID || '';
  const YEARLY  = process.env.REACT_APP_PADDLE_YEARLY_PRICE_ID  || '';

  function startCheckout(priceId, key) {
    const Paddle = window.Paddle;
    if (!Paddle) { setBillingErr('Payment system not loaded. Please refresh the page.'); return; }
    if (!priceId) { setBillingErr('Price not configured yet.'); return; }
    setCheckoutLoading(key);
    setBillingErr(null);
    try {
      Paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customData: { userId: user?.id, username: user?.username },
        settings: {
          successUrl: `${window.location.origin}/app/matches?payment=success`,
        },
      });
    } catch (e) {
      setBillingErr('Could not open checkout. Please try again.');
    }
    setCheckoutLoading(null);
  }

  function handleCancel() {
    if (!window.confirm('Cancel your subscription? You\'ll keep Pro access until the end of the billing period.')) return;
    setCancelLoading(true);
    setBillingErr(null);
    paymentService.cancel()
      .then(() => { setCancelDone(true); })
      .catch(e => { setBillingErr(e.response?.data?.error || 'Could not cancel subscription.'); })
      .finally(() => setCancelLoading(false));
  }

  function handleUpdatePayment() {
    setUpdateLoading(true);
    setBillingErr(null);
    paymentService.getUpdatePaymentUrl()
      .then(res => { window.open(res.data.url, '_blank', 'noopener'); })
      .catch(e => { setBillingErr(e.response?.data?.error || 'Could not get payment update link.'); })
      .finally(() => setUpdateLoading(false));
  }

  return (
    <SettingSection title="Account & billing">
      {tier === 'pro' ? (
        <>
          <SettingsRow
            label="Plan"
            right={<span className="pill pill-green" style={{ fontWeight: 600 }}>Pro</span>}
            hint="Unlimited matches, outreach, AI drafting, and all Pro features."
          />
          {cancelDone ? (
            <SettingsRow
              label="Subscription"
              hint="Your subscription will cancel at the end of the billing period."
              right={<span className="pill pill-outline" style={{ fontSize: 11 }}>Cancels at period end</span>}
            />
          ) : (
            <SettingsRow
              label="Manage subscription"
              hint="Update payment method or cancel your subscription."
              right={
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" onClick={handleUpdatePayment} disabled={updateLoading}>
                    {updateLoading ? 'Loading…' : <><Icon.ExternalLink size={12}/> Update card</>}
                  </button>
                  <button className="btn btn-sm" onClick={handleCancel} disabled={cancelLoading}
                    style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                    {cancelLoading ? 'Cancelling…' : 'Cancel plan'}
                  </button>
                </div>
              }
            />
          )}
        </>
      ) : (
        <>
          <SettingsRow
            label="Plan"
            right={<span className="pill pill-outline">Free</span>}
            hint="Upgrade to Pro for unlimited outreach, auto follow-ups, hiring board, and more."
          />
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)' }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10, color: 'var(--ink-2)' }}>Upgrade to Pro</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" disabled={checkoutLoading === 'yearly'}
                onClick={() => startCheckout(YEARLY, 'yearly')}>
                <Icon.Sparkles size={12}/>
                {checkoutLoading === 'yearly' ? 'Opening…' : 'Yearly — $8/mo (save 33%)'}
              </button>
              <button className="btn btn-sm" disabled={checkoutLoading === 'monthly'}
                onClick={() => startCheckout(MONTHLY, 'monthly')}>
                {checkoutLoading === 'monthly' ? 'Opening…' : 'Monthly — $12/mo'}
              </button>
            </div>
          </div>
        </>
      )}
      {billingErr && (
        <div style={{ padding: '8px 20px', fontSize: 12, color: 'var(--red)' }}>{billingErr}</div>
      )}
      <SettingsRow label="Email signature" right={<button className="btn btn-sm">Edit</button>} hint="Appears at the bottom of every outreach email."/>
      <SettingsRow label="Sender identity" right={<span className="muted mono">{user?.email || '—'}</span>} hint="Used as the reply-to address for outreach."/>
    </SettingSection>
  );
}

function SettingsView() {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div className="fade-in" style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 920, margin: "0 auto" }}>
      <h1 style={{ fontSize: isMobile ? 24 : 32, letterSpacing: "-0.025em", marginBottom: 4 }}>Settings</h1>
      <p className="muted" style={{ marginBottom: 24 }}>Notifications, data sources, sender identity, privacy.</p>

      <BillingSection/>

      <SettingSection title="Data sources">
        {[["ORCID",true,"synced 14m ago"],["Semantic Scholar",true,"synced 14m ago"],["arXiv",true,"synced 1h ago"],["PubMed",false,"off"],["NIH RePORTER",false,"off"],["NSF Awards",true,"synced 6h ago"],["CORDIS (EU grants)",true,"synced 6h ago"],["LinkedIn",false,"disabled — ToS"]].map(([n, on, s]) => (
          <SettingsRow key={n} label={n} hint={s} customRight={<TogglePill on={on}/>}/>
        ))}
      </SettingSection>

      <SettingSection title="Notifications">
        <SettingsRow label="Weekly digest" hint="Top 5 new matches every Monday" customRight={<TogglePill on/>}/>
        <SettingsRow label="Reply notifications" hint="Instant push when a professor replies" customRight={<TogglePill on/>}/>
        <SettingsRow label="Funding alerts" hint="When a saved professor wins a new grant" customRight={<TogglePill on={false}/>}/>
        <SettingsRow label="Marketing emails" hint="Tips, blog posts, etc." customRight={<TogglePill on={false}/>}/>
      </SettingSection>

      <SettingSection title="Privacy & data">
        <SettingsRow label="Personalization" hint="Use my click & reply behavior to improve matching" customRight={<TogglePill on/>}/>
        <SettingsRow label="Analytics" hint="Anonymized usage signals" customRight={<TogglePill on/>}/>
        <SettingsRow label="Export all data" right={<button className="btn btn-sm"><Icon.ExternalLink size={12}/> Download</button>}/>
        <SettingsRow label="Delete account" right={<button className="btn btn-sm" style={{ color: "var(--red)", borderColor: "var(--red-soft)" }}>Delete</button>} hint="Right to be forgotten · GDPR"/>
      </SettingSection>
    </div>
  );
}

// --- Route wrapper components for lazy-loaded pages ---
function DiscoverRoute({ Discover, ...props }) {
  if (!Discover) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  return <Discover {...props} />;
}

function DocsRoute({ Documents, ...props }) {
  if (!Documents) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  return <Documents {...props} />;
}

function ProfDetailRoute({ ProfDetail, go, savedIds, toggleSave }) {
  const { state } = useLocation();
  if (!ProfDetail) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  if (!state?.prof) return <Navigate to="/app/matches" replace />;
  return <ProfDetail prof={state.prof} go={go} savedIds={savedIds} toggleSave={toggleSave} />;
}

function ComposerRoute({ Composer, go }) {
  const { state } = useLocation();
  if (!Composer) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  if (!state?.prof) return <Navigate to="/app/matches" replace />;
  return <Composer prof={state.prof} go={go} />;
}

function UniversityRoute({ UniversityPage, go }) {
  const { state } = useLocation();
  if (!UniversityPage) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  if (!state?.uni) return <Navigate to="/app/countries" replace />;
  return <UniversityPage uni={state.uni} go={go} />;
}

function CountryDetailRoute({ CountryDetail, go }) {
  const { state } = useLocation();
  if (!CountryDetail) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  if (!state?.country) return <Navigate to="/app/countries" replace />;
  return <CountryDetail country={state.country} go={go} />;
}

function ScholarshipsRoute({ Scholarships }) {
  if (!Scholarships) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  return <Scholarships />;
}

function ProfileRoute({ ProfilePage }) {
  if (!ProfilePage) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  return <ProfilePage />;
}

function PipelineRoute({ Pipeline }) {
  if (!Pipeline) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  return <Pipeline />;
}

function CalendarRoute({ CalendarPage }) {
  if (!CalendarPage) return <div style={{ padding: 32, color: "var(--ink-3)" }}>Loading…</div>;
  return <CalendarPage />;
}

// --- AppShell (main export) ---
export default function AppShell() {
  const { tier, setTier } = useTier();
  const { user, token, clearAuth } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const [savedIds, setSavedIds] = useState(new Set());

  // Load saved IDs from API on mount
  useEffect(() => {
    savedService.getIds()
      .then(res => setSavedIds(new Set(res.data.ids)))
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Poll /api/meta/ every 5 min — show refresh banner when new data is available
  const [showRefreshBanner, setShowRefreshBanner] = useState(false);
  const metaVersionRef = useRef(null);
  useEffect(() => {
    // Seed with current version on mount (silent)
    metaService.get()
      .then(res => { metaVersionRef.current = res.data.version; })
      .catch(() => {});
    const interval = setInterval(() => {
      metaService.get()
        .then(res => {
          const v = res.data.version;
          if (metaVersionRef.current !== null && v !== metaVersionRef.current) {
            setShowRefreshBanner(true);
          }
          metaVersionRef.current = v;
        })
        .catch(() => {});
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  const [cvVersions, setCvVersions] = useState([]);
  const [currentCvId, setCurrentCvId] = useState(null);

  // Load CV versions from API when authenticated
  useEffect(() => {
    if (!token) return;
    cvService.getAll().then(({ data }) => {
      const list = data.results || data || [];
      if (!list.length) return;
      const versions = list.map(cv => ({
        id:        cv.id,
        name:      cv.name,
        label:     cv.label || '',
        target:    cv.target || '',
        data:      cv.content || {},
        keywords:  cv.keywords || [],
        template:  cv.template || 'classic',
        is_primary: cv.is_primary,
        updatedAt: new Date(cv.updated_at).toLocaleDateString(),
      }));
      setCvVersions(versions);
      const primary = versions.find(v => v.is_primary) || versions[0];
      if (primary) setCurrentCvId(primary.id);
    }).catch(() => {});
  }, [token]);

  const [sopVersions, setSopVersions] = useState(() => [
    { id: "sop1", name: "For Mariam El-Sayed (ETH)", label: "Tailored", updatedAt: "1 day ago",  data: null },
    { id: "sop2", name: "For Daniel Okonkwo (MIT)",   label: "Tailored", updatedAt: "4 days ago", data: null },
    { id: "sop3", name: "Generic — multimodal ML",    label: "Master",   updatedAt: "1 week ago", data: null },
  ]);
  const [currentSopId, setCurrentSopId] = useState("sop1");

  const [prefs, setPrefs] = useState({ interests: new Set(["ai_ml", "nlp"]), fundedOnly: false });
  const togglePref = (id) => {
    const next = new Set(prefs.interests);
    next.has(id) ? next.delete(id) : next.add(id);
    setPrefs({ ...prefs, interests: next });
  };

  // Dynamically import pages
  const [ProfDetail, setProfDetail] = useState(null);
  const [Composer, setComposer] = useState(null);
  const [Discover, setDiscover]             = useState(null);
  const [UniversityPage, setUniversityPage]   = useState(null);
  const [CountryDetail, setCountryDetail]     = useState(null);
  const [Documents, setDocuments]             = useState(null);
  const [Scholarships, setScholarships]       = useState(null);
  const [ProfilePage,  setProfilePage]        = useState(null);
  const [Pipeline,     setPipeline]           = useState(null);
  const [CalendarPage, setCalendarPage]       = useState(null);

  useEffect(() => {
    import('./ProfDetail').then(m => setProfDetail(() => m.default));
    import('./Composer').then(m => setComposer(() => m.default));
    import('./Discover').then(m => {
      setDiscover(() => m.default);
      setUniversityPage(() => m.UniversityPage);
      setCountryDetail(() => m.CountryDetail);
    });
    import('./Documents').then(m => setDocuments(() => m.default));
    import('./Scholarships').then(m => setScholarships(() => m.default));
    import('./Profile').then(m => setProfilePage(() => m.default));
    import('./Pipeline').then(m => setPipeline(() => m.default));
    import('./Calendar').then(m => setCalendarPage(() => m.default));
  }, []);

  const toSlug = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const go = (r, opts = {}) => {
    if (r === 'profDetail' && opts.prof) {
      navigate(`/app/professor/${opts.prof.id}`, { state: { prof: opts.prof } });
    } else if (r === 'compose' && opts.compose) {
      navigate(`/app/compose/${opts.compose.id}`, { state: { prof: opts.compose } });
    } else if (r === 'university' && opts.uni) {
      navigate(`/app/university/${toSlug(opts.uni.name)}`, { state: { uni: opts.uni } });
    } else if (r === 'country' && opts.country) {
      navigate(`/app/countries/${toSlug(opts.country.name)}`, { state: { country: opts.country } });
    } else {
      navigate(`/app/${r}`);
    }
  };

  const toggleSave = (id) => {
    const prev = new Set(savedIds);
    const next = new Set(savedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSavedIds(next);
    savedService.toggle(id).catch(() => setSavedIds(prev));
  };

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    clearAuth();
    setSavedIds(new Set());
    navigate('/');
  };

  const isActive = (id) =>
    pathname === `/app/${id}` || pathname.startsWith(`/app/${id}/`);

  const isDocsActive = () => ['docs', 'cv', 'sop'].some(p => isActive(p));

  const docsProps = {
    go, cvVersions, setCvVersions, currentCvId, setCurrentCvId,
    sopVersions, setSopVersions, currentSopId, setCurrentSopId,
  };

  return (
    <div className="app">
      <nav className="topnav">
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: "pointer" }}><Icon.Logo /> Find My Professor</div>
        <div className="topnav-search row gap-2" style={{ marginLeft: 24, flex: 1, maxWidth: 480 }}>
          <div className="row gap-2" style={{ width: "100%", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "white", color: "var(--ink-4)", fontSize: 13 }}>
            <Icon.Search size={14}/>
            <span style={{ flex: 1 }}>Search professors, labs, papers…</span>
            <span className="kbd">⌘K</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }} className="topnav-extras row gap-2">
          <button className="btn btn-sm" onClick={() => navigate('/pricing')}>
            <Icon.Sparkles size={12}/> Upgrade
          </button>
          <button className="btn btn-icon"><Icon.Mail size={14}/></button>
          <Avatar initials={user ? user.username.slice(0, 2).toUpperCase() : "?"} tone="ink"/>
          <button className="btn btn-sm" onClick={handleLogout} style={{ color: "var(--ink-3)" }}>
            Sign out
          </button>
        </div>
        {/* Mobile: just avatar */}
        <div style={{ marginLeft: "auto" }} className="topnav-mobile-actions row gap-2">
          <Avatar initials={user ? user.username.slice(0, 2).toUpperCase() : "?"} tone="ink"/>
        </div>
      </nav>

      {/* ── New data banner ── */}
      {showRefreshBanner && (
        <div style={{
          position: "sticky", top: 0, zIndex: 20,
          display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
          padding: "9px 20px",
          background: "oklch(0.25 0.06 155)", color: "white",
          fontSize: 13, fontWeight: 500,
        }}>
          <Icon.Sparkles size={14}/>
          New professors have been added — refresh to see them.
          <button onClick={() => window.location.reload()}
            style={{ marginLeft: 8, padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.12)", color: "white", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            Refresh
          </button>
          <button onClick={() => setShowRefreshBanner(false)}
            style={{ marginLeft: 4, background: "transparent", border: 0, color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: 4, display: "grid", placeItems: "center" }}>
            <Icon.X size={13}/>
          </button>
        </div>
      )}

      <div className="main">
        <aside className="sidebar">

          {/* ── DISCOVER ── */}
          <div className="side-section">Discover</div>
          <div className={"nav-item" + (isActive("matches") ? " active" : "")} onClick={() => navigate('/app/matches')}>
            <Icon.Sparkles size={14}/> My Matches
            <span className="nav-badge">24</span>
          </div>
          <div className={"nav-item" + (isActive("countries") ? " active" : "")} onClick={() => navigate('/app/countries')}>
            <Icon.Globe size={14}/> Browse by Country
          </div>
          <div className={"nav-item" + (isActive("reviews") ? " active" : "")} onClick={() => navigate('/app/reviews')}>
            <Icon.Star size={14}/> Reviews & Ratings
          </div>
          <div className={"nav-item" + (isActive("whatsnew") ? " active" : "")} onClick={() => navigate('/app/whatsnew')}>
            <Icon.Zap size={14}/> What's New <ProBadge/>
          </div>

          {/* ── APPLY ── */}
          <div className="side-section">Apply</div>
          <div className={"nav-item" + (isActive("outreach") ? " active" : "")} onClick={() => navigate('/app/outreach')}>
            <Icon.Inbox size={14}/> Outreach
            <span className="nav-badge">5</span>
          </div>
          <div className={"nav-item" + (isActive("saved") ? " active" : "")} onClick={() => navigate('/app/saved')}>
            <Icon.Bookmark size={14}/> Saved Professors
            {savedIds.size > 0 && <span className="nav-badge">{savedIds.size}</span>}
          </div>
          <div className={"nav-item" + (isActive("hiring") ? " active" : "")} onClick={() => navigate('/app/hiring')}>
            <Icon.Award size={14}/> Hiring Board <ProBadge/>
          </div>
          <div className={"nav-item" + (isActive("pipeline") ? " active" : "")} onClick={() => navigate('/app/pipeline')}>
            <Icon.Kanban size={14}/> App. Pipeline
          </div>

          {/* ── FUND ── */}
          <div className="side-section">Fund</div>
          <div className={"nav-item" + (isActive("scholarships") ? " active" : "")} onClick={() => navigate('/app/scholarships')}>
            <Icon.Award size={14}/> Scholarships
          </div>
          <div className={"nav-item" + (isDocsActive() ? " active" : "")} onClick={() => navigate('/app/docs')}>
            <Icon.FileText size={14}/> All Documents
            {(cvVersions.length + sopVersions.length) > 0 &&
              <span className="nav-badge">{cvVersions.length + sopVersions.length}</span>}
          </div>
          <div className={"nav-item" + (isActive("calendar") ? " active" : "")} onClick={() => navigate('/app/calendar')}>
            <Icon.Calendar size={14}/> Deadline Calendar
          </div>

          {/* ── PROFILE ── */}
          <div className="side-section">Profile</div>
          <div className={"nav-item" + (isActive("profile") ? " active" : "")} onClick={() => navigate('/app/profile')}>
            <Icon.User size={14}/> Research Profile
          </div>
          <div className={"nav-item" + (isActive("settings") ? " active" : "")} onClick={() => navigate('/app/settings')}>
            <Icon.Settings size={14}/> Settings
          </div>

          <div style={{ marginTop: "auto", padding: 12 }}>
            {tier === "free" ? (
              <div className="card" style={{ padding: 14, background: "var(--green-deep)", color: "var(--paper)", border: 0 }}>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18, fontStyle: "italic", marginBottom: 4 }}>You're on Free</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>5 outreach / week. Upgrade for hiring board & live updates.</div>
                <button className="btn btn-sm" style={{ background: "var(--paper)", color: "var(--green-deep)", border: 0, width: "100%", justifyContent: "center" }} onClick={() => navigate('/pricing')}>
                  See plans
                </button>
              </div>
            ) : (
              <div className="card" style={{ padding: 14, background: "white" }}>
                <div className="row gap-2" style={{ marginBottom: 6 }}>
                  <span style={{ width: 20, height: 20, borderRadius: 4, background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600 }}>PRO</span>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>Student Pro</span>
                </div>
                <div className="muted" style={{ fontSize: 11.5 }}>Unlimited matches · auto follow-ups · hiring board · live updates.</div>
              </div>
            )}
          </div>
        </aside>

        <main className="content">
          <Routes>
            <Route index element={<Navigate to="matches" replace />} />
            <Route path="matches" element={<Matches go={go} savedIds={savedIds} toggleSave={toggleSave} prefs={prefs} setPrefs={setPrefs} togglePref={togglePref} cvVersions={cvVersions}/>} />
            <Route path="saved" element={<SavedView go={go} savedIds={savedIds} toggleSave={toggleSave}/>} />
            <Route path="outreach" element={<Outreach go={go}/>} />
            <Route path="profile" element={<ProfileRoute ProfilePage={ProfilePage}/>} />
            <Route path="settings" element={<SettingsView/>} />
            <Route path="countries" element={<DiscoverRoute Discover={Discover} view="countries" go={go}/>} />
            <Route path="countries/:countrySlug" element={<CountryDetailRoute CountryDetail={CountryDetail} go={go}/>} />
            <Route path="reviews" element={<DiscoverRoute Discover={Discover} view="reviews" go={go}/>} />
            <Route path="hiring" element={<DiscoverRoute Discover={Discover} view="hiring" go={go} tier={tier} setTier={setTier} onUpgrade={() => navigate('/pricing')}/>} />
            <Route path="whatsnew" element={<DiscoverRoute Discover={Discover} view="whatsnew" go={go} tier={tier} setTier={setTier} onUpgrade={() => navigate('/pricing')}/>} />
            <Route path="docs" element={<DocsRoute Documents={Documents} view="docs" {...docsProps}/>} />
            <Route path="cv" element={<DocsRoute Documents={Documents} view="cv" {...docsProps}/>} />
            <Route path="sop" element={<DocsRoute Documents={Documents} view="sop" {...docsProps}/>} />
            <Route path="professor/:profId" element={<ProfDetailRoute ProfDetail={ProfDetail} go={go} savedIds={savedIds} toggleSave={toggleSave}/>} />
            <Route path="compose/:profId" element={<ComposerRoute Composer={Composer} go={go}/>} />
            <Route path="university/:slug" element={<UniversityRoute UniversityPage={UniversityPage} go={go}/>} />
            <Route path="scholarships" element={<ScholarshipsRoute Scholarships={Scholarships}/>} />
            <Route path="pipeline"    element={<PipelineRoute Pipeline={Pipeline}/>} />
            <Route path="calendar"    element={<CalendarRoute CalendarPage={CalendarPage}/>} />
          </Routes>
        </main>
      </div>

      {/* ── Bottom navigation — mobile only ── */}
      <nav className="bottom-nav">
        {[
          { path: 'matches',  icon: <Icon.Sparkles size={20}/>, label: 'Matches',  badge: 24 },
          { path: 'countries', icon: <Icon.Globe size={20}/>,   label: 'Explore',  badge: 0 },
          { path: 'outreach', icon: <Icon.Inbox size={20}/>,    label: 'Outreach', badge: 5 },
          { path: 'saved',    icon: <Icon.Bookmark size={20}/>, label: 'Saved',    badge: savedIds.size },
        ].map(({ path, icon, label, badge }) => (
          <div
            key={path}
            className={"bottom-nav-item" + (isActive(path) ? " active" : "")}
            onClick={() => { setMoreOpen(false); navigate(`/app/${path}`); }}
          >
            {badge > 0 && <span className="bottom-nav-badge">{badge}</span>}
            {icon}
            <span>{label}</span>
          </div>
        ))}
        <div
          className={"bottom-nav-item" + (moreOpen ? " active" : "")}
          onClick={() => setMoreOpen(o => !o)}
        >
          <Icon.MoreHoriz size={20}/>
          <span>More</span>
        </div>
      </nav>

      {/* ── More drawer — mobile only ── */}
      {moreOpen && (
        <>
          <div className="mobile-drawer-backdrop" onClick={() => setMoreOpen(false)}/>
          <div className="mobile-drawer">
            <div className="drawer-handle"/>

            <div className="drawer-section">Discover</div>
            {[
              { path: 'reviews',  icon: <Icon.Star size={16}/>,    label: 'Reviews & Ratings' },
              { path: 'whatsnew', icon: <Icon.Zap size={16}/>,     label: "What's New",        pro: true },
            ].map(({ path, icon, label, pro }) => (
              <div key={path} className={"drawer-item" + (isActive(path) ? " active" : "")}
                onClick={() => { setMoreOpen(false); navigate(`/app/${path}`); }}>
                <span className="drawer-item-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {pro && <ProBadge/>}
                <Icon.Chevron size={14} color="var(--ink-4)"/>
              </div>
            ))}

            <div className="drawer-section">Apply</div>
            {[
              { path: 'hiring',   icon: <Icon.Award size={16}/>,   label: 'Hiring Board',      pro: true },
              { path: 'pipeline', icon: <Icon.Kanban size={16}/>,  label: 'App. Pipeline' },
            ].map(({ path, icon, label, pro }) => (
              <div key={path} className={"drawer-item" + (isActive(path) ? " active" : "")}
                onClick={() => { setMoreOpen(false); navigate(`/app/${path}`); }}>
                <span className="drawer-item-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {pro && <ProBadge/>}
                <Icon.Chevron size={14} color="var(--ink-4)"/>
              </div>
            ))}

            <div className="drawer-section">Workspace</div>
            {[
              { path: 'scholarships', icon: <Icon.GraduationCap size={16}/>, label: 'Scholarships' },
              { path: 'docs',         icon: <Icon.FileText size={16}/>,      label: 'All Documents', badge: cvVersions.length + sopVersions.length },
              { path: 'calendar',     icon: <Icon.Calendar size={16}/>,      label: 'Deadline Calendar' },
            ].map(({ path, icon, label, badge }) => (
              <div key={path} className={"drawer-item" + (isDocsActive() && path === 'docs' ? " active" : isActive(path) ? " active" : "")}
                onClick={() => { setMoreOpen(false); navigate(`/app/${path}`); }}>
                <span className="drawer-item-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
                <Icon.Chevron size={14} color="var(--ink-4)"/>
              </div>
            ))}

            <div className="drawer-section">Account</div>
            {[
              { path: 'profile',  icon: <Icon.User size={16}/>,     label: 'Research Profile' },
              { path: 'settings', icon: <Icon.Settings size={16}/>, label: 'Settings' },
            ].map(({ path, icon, label }) => (
              <div key={path} className={"drawer-item" + (isActive(path) ? " active" : "")}
                onClick={() => { setMoreOpen(false); navigate(`/app/${path}`); }}>
                <span className="drawer-item-icon">{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                <Icon.Chevron size={14} color="var(--ink-4)"/>
              </div>
            ))}

            <div style={{ padding: "8px 16px 4px" }}>
              <div className="drawer-item" style={{ borderRadius: 12, color: "var(--red)" }}
                onClick={() => { setMoreOpen(false); handleLogout(); }}>
                <span className="drawer-item-icon" style={{ background: "var(--red-soft)" }}>
                  <Icon.X size={16} color="var(--red)"/>
                </span>
                <span style={{ flex: 1 }}>Sign out</span>
              </div>
            </div>

            <div style={{ height: 16 }}/>
          </div>
        </>
      )}

    </div>
  );
}
