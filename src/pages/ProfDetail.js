import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icon } from '../components/Icons';
import { ScoreRing, Bar, Stars } from '../components/Shared';
import { REVIEWS } from '../data';
import { ratingService, professorService, COUNTRY_META, scholarshipService } from '../services/api';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------
function profColor(id) {
  const colors = [
    ['#dbeafe','#1d4ed8'], ['#dcfce7','#15803d'], ['#fef9c3','#a16207'],
    ['#fce7f3','#9d174d'], ['#ede9fe','#6d28d9'], ['#ffedd5','#c2410c'],
    ['#e0f2fe','#0369a1'], ['#f0fdf4','#166534'],
  ];
  const [bg, fg] = colors[(parseInt(id, 10) || 0) % colors.length];
  return { bg, fg };
}

function Overline({ children, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 14 }}>
      {icon && React.createElement(icon, { size: 11 })}
      {children}
    </div>
  );
}

function SectionCard({ children, style }) {
  return (
    <div className="card" style={{ padding: 24, borderRadius: 12, ...style }}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfPhoto
// ---------------------------------------------------------------------------
function ProfPhoto({ prof, size = 112 }) {
  const [photoUrl, setPhotoUrl] = useState(prof.photoUrl || null);
  const [loading, setLoading]   = useState(!prof.photoUrl && !!prof.id);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (prof.photoUrl || !prof.id) { setLoading(false); return; }
    let cancelled = false;
    professorService.getPhoto(prof.id)
      .then(({ data }) => { if (!cancelled && data.photo_url) setPhotoUrl(data.photo_url); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [prof.id, prof.photoUrl]);

  const { bg, fg } = profColor(prof.id);
  const base = { width: size, height: size, borderRadius: '50%', flexShrink: 0, boxShadow: '0 0 0 4px white, 0 2px 16px rgba(0,0,0,0.10)' };

  if (loading) return (
    <div style={{ ...base, background: bg, display: 'grid', placeItems: 'center' }}>
      <div style={{ width: 24, height: 24, border: `2px solid ${fg}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}/>
    </div>
  );
  if (photoUrl && !imgError)
    return <img src={photoUrl} alt={prof.name} onError={() => setImgError(true)} style={{ ...base, objectFit: 'cover', display: 'block' }}/>;
  return (
    <div style={{ ...base, background: bg, color: fg, display: 'grid', placeItems: 'center', fontSize: size * 0.28, fontWeight: 700, letterSpacing: '-0.02em' }}>
      {prof.initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const STATUS_CFG = {
  active:     { bg: 'var(--green-soft)',  fg: 'var(--green-deep)', border: 'var(--green-soft-2)', dot: 'oklch(0.5 0.12 155)', label: 'Active' },
  emeritus:   { bg: '#eff6ff',            fg: '#1e40af',           border: '#bfdbfe',             dot: '#3b82f6',            label: 'Emeritus' },
  moved:      { bg: '#fffbeb',            fg: '#92400e',           border: '#fde68a',             dot: '#f59e0b',            label: 'Moved' },
  unverified: { bg: 'var(--paper-3)',     fg: 'var(--ink-3)',      border: 'var(--line)',         dot: 'var(--ink-4)',       label: 'Unverified' },
};

function StatusBadge({ status, size = 'sm' }) {
  const c = STATUS_CFG[status] || STATUS_CFG.unverified;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: size === 'lg' ? '4px 12px' : '3px 9px', borderRadius: 999, fontSize: size === 'lg' ? 12.5 : 11.5, fontWeight: 600, background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }}/>
      {c.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Stats strip  (h-index · citations · hiring confidence)
// ---------------------------------------------------------------------------
function StatStrip({ hIndex, citations, hiringConfidence }) {
  const items = [];
  if (hIndex != null) items.push({ value: hIndex, label: 'h-index' });
  if (citations > 0)  items.push({ value: citations.toLocaleString(), label: 'citations' });
  if (hiringConfidence > 0) items.push({ value: `${hiringConfidence}%`, label: 'hiring conf.', green: true });
  if (!items.length) return null;
  return (
    <div style={{ display: 'inline-flex', borderRadius: 10, border: '1px solid var(--line)', background: 'white', overflow: 'hidden', flexShrink: 0 }}>
      {items.map((it, i) => (
        <div key={it.label} style={{ padding: '10px 20px', borderLeft: i ? '1px solid var(--line)' : 'none', textAlign: 'center', minWidth: 72 }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.035em', color: it.green ? 'var(--green-deep)' : 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{it.value}</div>
          <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 3, letterSpacing: '0.02em', textTransform: 'uppercase', fontWeight: 500 }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Education timeline
// ---------------------------------------------------------------------------
const DEGREE_ORDER = { 'Ph.D.':1,'PhD':1,'D.Phil.':1,'DPhil':1,'Sc.D.':1,'ScD':1,'Postdoc':2,'M.S.':3,'MS':3,'M.Sc.':3,'MSc':3,'M.E.':3,'ME':3,'M.Tech.':3,'MTech':3,'M.Phil.':3,'MPhil':3,'MBA':3,'B.S.':4,'BS':4,'B.Sc.':4,'BSc':4,'B.E.':4,'BE':4,'B.Tech.':4,'BTech':4,'B.A.':4,'BA':4 };

function EducationTimeline({ history }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '16px 18px', borderRadius: 10, border: '1px dashed var(--line-2)', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
        Education history not yet available.
        <div style={{ fontSize: 11, marginTop: 4 }}>Can be added via the admin panel.</div>
      </div>
    );
  }
  const sorted = [...history].sort((a, b) => {
    const od = (DEGREE_ORDER[a.degree] ?? 5) - (DEGREE_ORDER[b.degree] ?? 5);
    return od !== 0 ? od : (b.year_end || 0) - (a.year_end || 0);
  });
  return (
    <div style={{ position: 'relative', paddingLeft: 28 }}>
      <div style={{ position: 'absolute', left: 8, top: 10, bottom: 10, width: 2, background: 'var(--line)', borderRadius: 2 }}/>
      <div className="col" style={{ gap: 20 }}>
        {sorted.map((edu, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: -24, top: 3, width: 10, height: 10, borderRadius: '50%', background: 'white', border: '2px solid var(--green-hi)', boxShadow: '0 0 0 2px white' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', lineHeight: 1.3 }}>
                  {edu.degree}{edu.field ? <span style={{ fontWeight: 400, color: 'var(--ink-2)' }}>, {edu.field}</span> : null}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 3 }}>{edu.institution}</div>
                {edu.advisor && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>Advisor: {edu.advisor}</div>}
                {edu.thesis  && <div style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic', marginTop: 2, lineHeight: 1.45 }}>"{edu.thesis}"</div>}
              </div>
              {(edu.year_end || edu.year_start) && (
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)', whiteSpace: 'nowrap', paddingTop: 1, flexShrink: 0 }}>
                  {edu.year_start && edu.year_end ? `${edu.year_start}–${edu.year_end}` : edu.year_end || edu.year_start}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Academic Background — Current Position + Education + Patents
// ---------------------------------------------------------------------------
function AcademicBackground({ prof }) {
  const raw = prof._raw || {};
  const hasEdu     = prof.educationHistory?.length > 0;
  const hasPatents = Array.isArray(raw.patents) && raw.patents.length > 0;

  return (
    <SectionCard>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <Icon.User size={15} color="var(--ink-3)"/>
        <h3 style={{ fontSize: 15.5, fontWeight: 600 }}>Academic Background</h3>
      </div>

      {/* Current Position */}
      <div style={{ marginBottom: 22 }}>
        <Overline>Current Position</Overline>
        <div style={{ padding: '16px 18px', borderRadius: 10, background: 'white', border: '1px solid var(--line)', borderLeft: '3px solid var(--green-deep)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 650, fontSize: 15.5, color: 'var(--ink)', lineHeight: 1.25, marginBottom: 4 }}>
                {prof.title || 'Professor'}
              </div>
              {prof.dept && prof.dept !== prof.school && (
                <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 6 }}>{prof.dept}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-2)', marginBottom: 3 }}>
                <Icon.Building size={13} color="var(--ink-4)"/>
                <span style={{ fontWeight: 500 }}>{prof.school}</span>
              </div>
              {(prof.state || prof.country) && (
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {COUNTRY_META[prof.country]?.flag && (
                    <span style={{ fontSize: 14, lineHeight: 1 }}>{COUNTRY_META[prof.country].flag}</span>
                  )}
                  {[prof.state, COUNTRY_META[prof.country]?.name || prof.country].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
            <StatusBadge status={prof.professorStatus}/>
          </div>
          {raw.lab_name && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', fontSize: 12.5, color: 'var(--ink-2)' }}>
              <span className="muted">Lab: </span>{raw.lab_name}
            </div>
          )}
        </div>
      </div>

      {/* Education */}
      <div style={{ marginBottom: hasPatents ? 22 : 0 }}>
        <Overline>Education</Overline>
        <EducationTimeline history={prof.educationHistory}/>
      </div>

      {/* Patents */}
      {hasPatents && (
        <div>
          <Overline>Patents</Overline>
          <div className="col" style={{ gap: 10 }}>
            {raw.patents.slice(0, 4).map((p, i) => (
              <div key={i} style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--paper-2)', border: '1px solid var(--line)' }}>
                <div style={{ fontWeight: 550, fontSize: 13.5, lineHeight: 1.35, marginBottom: 3 }}>{p.title || p}</div>
                {(p.number || p.year) && (
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                    {p.number && <span className="mono">{p.number}</span>}
                    {p.number && p.year && ' · '}
                    {p.year && <span>{p.year}</span>}
                  </div>
                )}
              </div>
            ))}
            {raw.patents.length > 4 && (
              <div style={{ fontSize: 12, color: 'var(--ink-4)', textAlign: 'center' }}>+{raw.patents.length - 4} more patents</div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Profile Accuracy (data completeness + freshness)
// ---------------------------------------------------------------------------
function ProfileAccuracy({ prof }) {
  const raw = prof._raw || {};

  const FIELDS = [
    { label: 'h-index & citations',  ok: raw.h_index != null && raw.citation_count != null, source: 'OpenAlex' },
    { label: 'Research keywords',    ok: (raw.research_keywords || []).length > 0,          source: 'OpenAlex' },
    { label: 'Homepage URL',         ok: !!raw.homepage_url,                                source: 'University' },
    { label: 'Email address',        ok: !!raw.email,                                       source: 'ORCID / Web' },
    { label: 'ORCID profile',        ok: !!raw.orcid,                                       source: 'ORCID' },
    { label: 'Profile photo',        ok: !!raw.photo_url,                                   source: 'Scholar' },
    { label: 'Hiring status',        ok: raw.is_hiring !== null && raw.is_hiring !== undefined, source: 'Web scraping' },
    { label: 'Education history',    ok: (raw.education_history || []).length > 0,          source: 'Manual entry' },
  ];

  const filledCount = FIELDS.filter(f => f.ok).length;
  const pct = Math.round(filledCount / FIELDS.length * 100);

  const daysSince = raw.last_scraped_at
    ? Math.floor((Date.now() - new Date(raw.last_scraped_at)) / 86400000)
    : null;

  const { freshColor, freshLabel, freshBg } = (() => {
    if (daysSince === null) return { freshColor: 'var(--ink-4)', freshLabel: 'Never verified', freshBg: 'var(--paper-2)' };
    if (daysSince < 7)      return { freshColor: '#15803d',      freshLabel: `${daysSince === 0 ? 'today' : daysSince + 'd ago'}`, freshBg: '#dcfce7' };
    if (daysSince < 30)     return { freshColor: '#92400e',      freshLabel: `${daysSince}d ago`, freshBg: '#fef9c3' };
    return                         { freshColor: '#991b1b',      freshLabel: `${Math.floor(daysSince/30)}mo ago`, freshBg: '#fef2f2' };
  })();

  const barColor = pct >= 75 ? 'var(--green-hi)' : pct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <SectionCard>
      <Overline icon={Icon.Eye}>Data Accuracy</Overline>

      {/* Score row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 30, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '-0.04em', color: pct >= 75 ? 'var(--green-deep)' : pct >= 50 ? '#92400e' : '#991b1b', lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>complete</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, background: freshBg, color: freshColor }}>
          <Icon.Clock size={10}/> {freshLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, borderRadius: 3, background: 'var(--line)', marginBottom: 18, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: barColor, width: pct + '%', transition: 'width 0.8s ease' }}/>
      </div>

      {/* Field checklist */}
      <div className="col" style={{ gap: 9 }}>
        {FIELDS.map(f => (
          <div key={f.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12.5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              {f.ok
                ? <Icon.Check size={13} color="#16a34a" strokeWidth={2.5}/>
                : <Icon.X    size={13} color="var(--ink-4)" strokeWidth={2}/>}
              <span style={{ color: f.ok ? 'var(--ink-2)' : 'var(--ink-4)', textDecoration: f.ok ? 'none' : 'none' }}>{f.label}</span>
            </span>
            {f.ok
              ? <span style={{ fontSize: 10.5, color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '0.01em' }}>{f.source}</span>
              : <span style={{ fontSize: 10.5, color: 'var(--ink-4)' }}>missing</span>}
          </div>
        ))}
      </div>

      {/* Data sources footer */}
      {prof.sources?.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Sourced from</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {prof.sources.map(s => (
              <span key={s} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green-hi)' }}/>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Outreach Signals — unique hiring-signal intelligence card
// ---------------------------------------------------------------------------
function OutreachSignals({ prof }) {
  const raw = prof._raw || {};

  // Build signal list
  const signals = [];
  if (raw.is_hiring)               signals.push({ strength: 'strong',   label: 'Actively hiring',              icon: '✓' });
  if (raw.has_active_grant)        signals.push({ strength: 'strong',   label: 'Has active research grant',    icon: '✓' });
  if (raw.hiring_confidence >= 70) signals.push({ strength: 'strong',   label: `${raw.hiring_confidence}% hiring confidence`, icon: '✓' });
  else if (raw.hiring_confidence >= 40) signals.push({ strength: 'moderate', label: `${raw.hiring_confidence}% hiring confidence`, icon: '~' });
  if (prof.professorStatus === 'active') signals.push({ strength: 'neutral',  label: 'Active faculty member',       icon: '✓' });
  if (prof.professorStatus === 'emeritus') signals.push({ strength: 'caution', label: 'Emeritus — verify availability', icon: '!' });
  if (prof.professorStatus === 'moved')    signals.push({ strength: 'caution', label: 'May have changed institution', icon: '!' });
  if (!raw.is_hiring && raw.hiring_confidence < 30) signals.push({ strength: 'caution', label: 'Low hiring signals detected', icon: '!' });

  const strongCount = signals.filter(s => s.strength === 'strong').length;
  const readiness = strongCount >= 3 ? 'high' : strongCount >= 2 ? 'good' : strongCount >= 1 ? 'moderate' : 'low';

  const READINESS = {
    high:     { label: 'Strong — contact now',           bg: '#dcfce7', fg: '#15803d', border: '#bbf7d0' },
    good:     { label: 'Good time to reach out',         bg: '#ecfdf5', fg: '#166534', border: '#a7f3d0' },
    moderate: { label: 'Moderate — worth a try',         bg: '#fef9c3', fg: '#92400e', border: '#fde68a' },
    low:      { label: 'Weak signals — proceed carefully', bg: 'var(--paper-2)', fg: 'var(--ink-3)', border: 'var(--line)' },
  };
  const rc = READINESS[readiness];

  // Deadline countdown
  const deadline     = raw.hiring_deadline ? new Date(raw.hiring_deadline) : null;
  const daysLeft     = deadline ? Math.ceil((deadline - Date.now()) / 86400000) : null;
  const deadlineUrgent = daysLeft !== null && daysLeft <= 14 && daysLeft > 0;

  // Academic calendar
  const month      = new Date().getMonth(); // 0–11
  const seasons    = [
    { months: [8,9,10],  label: 'Peak hiring season',         color: '#15803d', bg: '#dcfce7' },
    { months: [11,0],    label: 'Application review period',  color: '#1e40af', bg: '#eff6ff' },
    { months: [1,2],     label: 'Spring hiring window',       color: '#166534', bg: '#ecfdf5' },
    { months: [3,4,5],   label: 'Late-cycle opportunities',   color: '#92400e', bg: '#fef9c3' },
    { months: [6,7],     label: 'Summer — lower activity',    color: 'var(--ink-3)', bg: 'var(--paper-2)' },
  ];
  const currentSeason = seasons.find(s => s.months.includes(month)) || seasons[4];

  const signalColors = { strong: { dot: '#16a34a', text: 'var(--ink-2)' }, moderate: { dot: '#f59e0b', text: 'var(--ink-2)' }, neutral: { dot: 'var(--green-hi)', text: 'var(--ink-3)' }, caution: { dot: '#f59e0b', text: '#92400e' } };

  return (
    <SectionCard>
      <Overline icon={Icon.Trend}>Outreach Signals</Overline>

      {/* Readiness pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, background: rc.bg, border: `1px solid ${rc.border}`, marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 650, color: rc.fg }}>{rc.label}</span>
        <span style={{ fontSize: 11, color: rc.fg, opacity: 0.75, fontWeight: 500 }}>{strongCount} strong</span>
      </div>

      {/* Signal list */}
      {signals.length > 0 && (
        <div className="col" style={{ gap: 8, marginBottom: 14 }}>
          {signals.map((s, i) => {
            const sc = signalColors[s.strength];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, background: s.strength === 'caution' ? '#fef9c3' : s.strength === 'strong' ? 'var(--green-soft)' : 'var(--paper-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: sc.dot }}>
                  {s.icon}
                </span>
                <span style={{ color: sc.text }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Deadline countdown */}
      {deadline && daysLeft > 0 && (
        <div style={{ padding: '10px 12px', borderRadius: 8, background: deadlineUrgent ? '#fef2f2' : '#fffbeb', border: `1px solid ${deadlineUrgent ? '#fecaca' : '#fde68a'}`, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 650, color: deadlineUrgent ? '#991b1b' : '#92400e' }}>
            ⏰ {daysLeft === 1 ? 'Deadline tomorrow' : `${daysLeft} days until deadline`}
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 3 }}>
            {deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      )}

      {/* Academic season */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
        <Icon.Clock size={12} color="var(--ink-4)"/>
        <span style={{ fontSize: 12, fontWeight: 500, color: currentSeason.color }}>{currentSeason.label}</span>
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Research Metrics card — big-number display
// ---------------------------------------------------------------------------
function MetricsCard({ hIndex, citations, hiringConfidence, lastScrapedAt }) {
  const hasMain = hIndex != null || citations > 0;
  return (
    <SectionCard>
      <Overline>Research Metrics</Overline>
      {hasMain && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {hIndex != null && (
            <div style={{ padding: '16px 12px', borderRadius: 10, background: 'var(--paper-2)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>{hIndex}</div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>h-index</div>
            </div>
          )}
          {citations > 0 && (
            <div style={{ padding: '16px 12px', borderRadius: 10, background: 'var(--paper-2)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <div style={{ fontSize: citations >= 100000 ? 20 : citations >= 10000 ? 24 : 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--ink)', fontFamily: 'var(--font-mono)' }}>
                {citations >= 1000 ? `${(citations / 1000).toFixed(citations >= 100000 ? 0 : 1)}K` : citations}
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>citations</div>
            </div>
          )}
        </div>
      )}
      <div className="col" style={{ gap: 10 }}>
        {hiringConfidence > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span className="muted">Hiring confidence</span>
            <span className="mono" style={{ fontWeight: 700, color: hiringConfidence >= 70 ? 'var(--green-deep)' : 'var(--ink)' }}>{hiringConfidence}%</span>
          </div>
        )}
        {lastScrapedAt && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, paddingTop: hiringConfidence > 0 ? 10 : 0, borderTop: hiringConfidence > 0 ? '1px solid var(--line)' : 'none' }}>
            <span className="muted">Last updated</span>
            <span className="mono muted">{new Date(lastScrapedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// ProfReviews
// ---------------------------------------------------------------------------
function ProfReviews({ profId }) {
  const isRealProf = typeof profId === 'number';
  const [apiSummary, setApiSummary] = useState(null);
  const [apiRatings, setApiRatings] = useState([]);
  const [loadingApi, setLoadingApi] = useState(isRealProf);

  useEffect(() => {
    if (!isRealProf) return;
    setLoadingApi(true);
    Promise.all([ratingService.getSummary(profId), ratingService.getAll({ professor: profId, page_size: 5 })])
      .then(([sumRes, listRes]) => { setApiSummary(sumRes.data); setApiRatings((listRes.data.results || listRes.data || []).slice(0, 5)); })
      .catch(() => {})
      .finally(() => setLoadingApi(false));
  }, [profId, isRealProf]);

  const RatingBars = ({ dist, total }) => (
    <div className="col gap-2">
      {dist.map(d => (
        <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span className="mono muted" style={{ width: 10 }}>{d.stars}</span>
          <Icon.StarF size={10} color="oklch(0.7 0.13 75)"/>
          <div className="bar" style={{ flex: 1 }}>
            <div className="bar-fill" style={{ width: (d.count / total * 100) + '%', background: 'oklch(0.72 0.13 75)' }}/>
          </div>
          <span className="mono muted" style={{ width: 22, textAlign: 'right' }}>{d.count}</span>
        </div>
      ))}
    </div>
  );

  if (!isRealProf) {
    const data = REVIEWS.find(r => r.profId === profId);
    if (!data) return null;
    const dist  = [5,4,3,2,1].map(s => ({ stars: s, count: s===5?Math.round(data.n*0.55):s===4?Math.round(data.n*0.28):s===3?Math.round(data.n*0.10):s===2?Math.round(data.n*0.05):Math.round(data.n*0.02) }));
    const total = dist.reduce((a, b) => a + b.count, 0);
    return (
      <SectionCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15.5, fontWeight: 600 }}><Icon.Star size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Student reviews</h3>
          <span className="pill pill-outline">Free</span>
        </div>
        <div style={{ display: 'flex', gap: 24, marginBottom: 20, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 48, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 600 }}>{data.rating.toFixed(1)}</div>
            <div className="mt-2"><Stars n={data.rating}/></div>
            <div className="muted mt-2" style={{ fontSize: 12 }}>{data.n} reviews</div>
          </div>
          <div style={{ flex: 1, maxWidth: 300 }}><RatingBars dist={dist} total={total}/></div>
        </div>
        <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          {data.snippets.map((s, i) => (
            <div key={i} style={{ marginBottom: i < data.snippets.length - 1 ? 20 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Stars n={s.stars}/><span className="muted" style={{ fontSize: 12 }}>{s.role}</span></div>
                <span className="muted" style={{ fontSize: 12 }}>{s.time}</span>
              </div>
              <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 16, color: 'var(--ink-2)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>"{s.text}"</p>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
          <span className="muted" style={{ fontSize: 12 }}>Reviews are anonymous and moderated.</span>
          <button className="btn btn-sm"><Icon.Plus size={12}/> Write a review</button>
        </div>
      </SectionCard>
    );
  }

  if (loadingApi) return (
    <SectionCard>
      <h3 style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 14 }}><Icon.Star size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Student reviews</h3>
      <span className="muted" style={{ fontSize: 13 }}>Loading reviews…</span>
    </SectionCard>
  );

  if (!apiSummary || apiSummary.total_ratings === 0) return (
    <SectionCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15.5, fontWeight: 600 }}><Icon.Star size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Student reviews</h3>
        <span className="pill pill-outline">Free</span>
      </div>
      <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-3)' }}>
        <Icon.Star size={32} color="var(--ink-4)"/>
        <p style={{ marginTop: 14, fontSize: 13 }}>No reviews yet for this professor.</p>
        <button className="btn btn-sm btn-primary" style={{ marginTop: 12 }}><Icon.Plus size={12}/> Write the first review</button>
      </div>
    </SectionCard>
  );

  const avgRating = parseFloat(apiSummary.average_rating) || 0;
  const totalN    = apiSummary.total_ratings || 0;
  const dist      = [5,4,3,2,1].map(s => ({ stars: s, count: parseInt(apiSummary.rating_distribution?.[String(s)] || 0) }));
  const total     = dist.reduce((a, b) => a + b.count, 0) || 1;

  return (
    <SectionCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15.5, fontWeight: 600 }}><Icon.Star size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Student reviews</h3>
        <span className="pill pill-outline">Free</span>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 20, alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 48, lineHeight: 1, letterSpacing: '-0.04em', fontWeight: 600 }}>{avgRating.toFixed(1)}</div>
          <div className="mt-2"><Stars n={avgRating}/></div>
          <div className="muted mt-2" style={{ fontSize: 12 }}>{totalN} reviews</div>
        </div>
        <div style={{ flex: 1, maxWidth: 300 }}><RatingBars dist={dist} total={total}/></div>
      </div>
      {apiRatings.length > 0 && (
        <div style={{ paddingTop: 20, borderTop: '1px solid var(--line)' }}>
          {apiRatings.map((r, i) => (
            <div key={r.id || i} style={{ marginBottom: i < apiRatings.length - 1 ? 18 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}><Stars n={r.overall_rating}/><span className="muted" style={{ fontSize: 12 }}>{r.reviewer_type || 'Student'}</span></div>
                <span className="muted" style={{ fontSize: 12 }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}</span>
              </div>
              {r.review_text && <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 16, color: 'var(--ink-2)', margin: 0, fontStyle: 'italic', lineHeight: 1.6 }}>"{r.review_text}"</p>}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
        <span className="muted" style={{ fontSize: 12 }}>Reviews are anonymous and moderated.</span>
        <button className="btn btn-sm"><Icon.Plus size={12}/> Write a review</button>
      </div>
    </SectionCard>
  );
}

// ---------------------------------------------------------------------------
// Top Venues chip row (derived from publications array)
// ---------------------------------------------------------------------------
function TopVenues({ publications }) {
  const venues = useMemo(() => {
    const counts = {};
    publications.forEach(p => { if (p.venue) counts[p.venue] = (counts[p.venue] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([v]) => v);
  }, [publications]);
  if (!venues.length) return null;
  return (
    <div style={{ paddingTop: 14, borderTop: '1px solid var(--line)' }}>
      <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Top venues</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {venues.map(v => (
          <span key={v} style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11.5, background: 'var(--paper-2)', border: '1px solid var(--line)', color: 'var(--ink-3)', fontWeight: 500 }}>{v}</span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Publications tab
// ---------------------------------------------------------------------------
function TabPublications({ publications, loading }) {
  const [sortBy, setSortBy] = useState('year');
  const sorted = [...publications].sort((a, b) => sortBy === 'year' ? (b.year - a.year) : (b.citation_count - a.citation_count));

  if (loading) return <div style={{ padding: '56px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading publications…</div>;
  if (!publications.length) return (
    <SectionCard style={{ textAlign: 'center', padding: 48 }}>
      <Icon.Book size={32} color="var(--ink-4)"/>
      <p style={{ marginTop: 14, color: 'var(--ink-4)', fontSize: 13 }}>No publications found for this professor.</p>
    </SectionCard>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <span className="muted" style={{ fontSize: 13 }}>{publications.length} publications</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sort by</span>
          {[['year','Year'],['citation_count','Citations']].map(([v,l]) => (
            <button key={v} className={'chip' + (sortBy === v ? ' selected' : '')} style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => setSortBy(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12 }}>
        {sorted.map((p, i) => (
          <div key={p.id} style={{ padding: '20px 24px', borderTop: i ? '1px solid var(--line)' : 'none' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.45, marginBottom: 6 }}>{p.title}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 12.5, color: 'var(--ink-3)' }}>
                  {p.venue  && <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{p.venue}</span>}
                  {p.year   && <span className="mono">{p.year}</span>}
                  {p.authors && <span>{p.authors.length > 80 ? p.authors.slice(0,80)+'…' : p.authors}</span>}
                </div>
                {p.abstract && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{p.abstract.length > 200 ? p.abstract.slice(0,200)+'…' : p.abstract}</p>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontSize: 20, fontWeight: 700, lineHeight: 1, color: 'var(--ink)' }}>{(p.citation_count || 0).toLocaleString()}</div>
                  <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>citations</div>
                </div>
                {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" style={{ textDecoration: 'none' }}><Icon.ExternalLink size={11}/> DOI</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grants tab
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Funding tip — cross-reference grant agencies with matching scholarships
// ---------------------------------------------------------------------------
const AGENCY_TIPS = {
  'NSF':       { name: 'NSF GRFP',       full: 'NSF Graduate Research Fellowship' },
  'NIH':       { name: 'NIH-funded',      full: 'Ford Foundation Fellowship' },
  'DOD':       { name: 'NDSEG',           full: 'NDSEG Fellowship' },
  'DARPA':     { name: 'NDSEG',           full: 'NDSEG Fellowship' },
  'DOE':       { name: 'DOE SCGSR',       full: 'DOE SCGSR Program' },
  'DAAD':      { name: 'DAAD',            full: 'DAAD Scholarship' },
  'MEXT':      { name: 'MEXT',            full: 'Japan MEXT Scholarship' },
  'SIMONS':    { name: 'Simons',          full: 'Simons Graduate Fellowship' },
  'GOOGLE':    { name: 'Google PhD',      full: 'Google PhD Fellowship' },
  'MICROSOFT': { name: 'MSR',             full: 'Microsoft Research PhD Fellowship' },
  'IBM':       { name: 'IBM PhD',         full: 'IBM PhD Fellowship' },
  'NVIDIA':    { name: 'NVIDIA',          full: 'NVIDIA Graduate Fellowship' },
};

function FundingTipBanner({ grants }) {
  const [tips, setTips] = React.useState([]);

  React.useEffect(() => {
    if (!grants || !grants.length) return;
    const activeAgencies = grants
      .filter(g => g.status === 'active')
      .map(g => (g.agency || '').toUpperCase());

    const matched = new Map();
    activeAgencies.forEach(agency => {
      Object.entries(AGENCY_TIPS).forEach(([key, tip]) => {
        if (agency.includes(key) && !matched.has(tip.name)) {
          matched.set(tip.name, { ...tip, agency });
        }
      });
    });

    if (matched.size > 0) {
      setTips(Array.from(matched.values()).slice(0, 2));
      return;
    }

    // Fallback: try API search with first agency name
    const firstAgency = (grants.find(g => g.status === 'active') || grants[0])?.agency || '';
    if (!firstAgency) return;
    const term = firstAgency.split(/[\s,]/)[0];
    if (!term || term.length < 3) return;

    scholarshipService.getAll({ search: term, page_size: 2 })
      .then(r => {
        const results = r.data.results || [];
        if (results.length) {
          setTips(results.map(s => ({ name: s.short_name || s.name, full: s.name, agency: firstAgency })));
        }
      })
      .catch(() => {});
  }, [grants]);

  if (!tips.length) return null;

  return (
    <div style={{ marginBottom: 24, padding: '14px 18px', background: '#eff6ff', border: '1px solid #bfdbfe',
      borderRadius: 10, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <Icon.Award size={16} color="#2563eb" style={{ marginTop: 1, flexShrink: 0 }}/>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1d4ed8', marginBottom: 4 }}>
          Funding tip
        </div>
        <div style={{ fontSize: 12.5, color: '#1e40af', lineHeight: 1.55 }}>
          This professor has active {tips[0]?.agency || ''} funding.
          Consider applying for{' '}
          {tips.map((t, i) => (
            <span key={i}>
              {i > 0 ? ' or ' : ''}
              <strong>{t.name}</strong>
            </span>
          ))}
          {' '}to co-fund your graduate studies.
        </div>
      </div>
      <a href="/app/scholarships" style={{ fontSize: 12, fontWeight: 600, color: '#2563eb',
        textDecoration: 'none', background: 'white', border: '1px solid #bfdbfe', borderRadius: 7,
        padding: '5px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
        See fellowships →
      </a>
    </div>
  );
}

function TabGrants({ grants, loading }) {
  if (loading) return <div style={{ padding: '56px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading grants…</div>;
  if (!grants.length) return (
    <SectionCard style={{ textAlign: 'center', padding: 48 }}>
      <Icon.Award size={32} color="var(--ink-4)"/>
      <p style={{ marginTop: 14, color: 'var(--ink-4)', fontSize: 13 }}>No grant records found for this professor.</p>
    </SectionCard>
  );

  const active    = grants.filter(g => g.status === 'active');
  const completed = grants.filter(g => g.status !== 'active');
  const totalAmt  = grants.reduce((s, g) => s + (parseFloat(g.amount) || 0), 0);
  const fmtAmt    = n => !n ? null : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(0)}K` : `$${n.toLocaleString()}`;
  const fmtDate   = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;
  const SS = {
    active:    { background: 'var(--green-soft)', color: 'var(--green-deep)', border: '1px solid var(--green-soft-2)' },
    completed: { background: 'var(--paper-2)',    color: 'var(--ink-3)',      border: '1px solid var(--line)' },
    pending:   { background: '#fffbeb',            color: '#92400e',           border: '1px solid #fde68a' },
  };

  return (
    <div>
      <FundingTipBanner grants={active}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[{ label:'Total grants', value:grants.length },{ label:'Active', value:active.length, green:true },{ label:'Total funding', value:fmtAmt(totalAmt)||'—' }].map(({label,value,green}) => (
          <SectionCard key={label} style={{ padding: '16px 20px' }}>
            <div className="mono" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color: green ? 'var(--green-deep)' : 'var(--ink)' }}>{value}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 5 }}>{label}</div>
          </SectionCard>
        ))}
      </div>
      {active.length > 0 && (<><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 12 }}>Active grants</div><div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24, borderRadius: 12 }}>{active.map((g, i) => <GrantRow key={g.id} g={g} i={i} SS={SS} fmtAmt={fmtAmt} fmtDate={fmtDate}/>)}</div></>)}
      {completed.length > 0 && (<><div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-4)', marginBottom: 12 }}>Completed / pending</div><div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 12 }}>{completed.map((g, i) => <GrantRow key={g.id} g={g} i={i} SS={SS} fmtAmt={fmtAmt} fmtDate={fmtDate}/>)}</div></>)}
    </div>
  );
}

function GrantRow({ g, i, SS, fmtAmt, fmtDate }) {
  const st = SS[g.status] || SS.completed;
  return (
    <div style={{ padding: '20px 24px', borderTop: i ? '1px solid var(--line)' : 'none' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', ...st }}>{g.status.toUpperCase()}</span>
          <div style={{ fontWeight: 550, fontSize: 14, lineHeight: 1.45, margin: '8px 0 5px' }}>{g.title}</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 12.5, color: 'var(--ink-3)' }}>
            <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{g.agency}</span>
            {(fmtDate(g.start_date) || fmtDate(g.end_date)) && <span className="mono">{fmtDate(g.start_date)}{g.end_date ? ` – ${fmtDate(g.end_date)}` : ''}</span>}
          </div>
          {g.description && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{g.description.length > 180 ? g.description.slice(0,180)+'…' : g.description}</p>}
        </div>
        {fmtAmt(g.amount) && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--green-deep)', lineHeight: 1 }}>{fmtAmt(g.amount)}</div>
            <div className="muted" style={{ fontSize: 10, marginTop: 2 }}>awarded</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Students tab
// ---------------------------------------------------------------------------
function TabStudents({ prof }) {
  const raw = prof._raw || {};
  const positions = raw.hiring_positions || [];
  const isHiring  = raw.is_hiring;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
      <div className="col gap-4">
        <SectionCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15.5, fontWeight: 600 }}><Icon.User size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Lab recruitment</h3>
            {isHiring ? <span className="pill pill-green"><Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Actively hiring</span> : <span className="pill pill-outline">Not currently hiring</span>}
          </div>
          {positions.length > 0 ? (
            <>
              <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Open positions</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {positions.map(p => <span key={p} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500, background: 'var(--green-soft)', color: 'var(--green-deep)', border: '1px solid var(--green-soft-2)' }}>{p}</span>)}
              </div>
              {raw.hiring_deadline && (
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: '#fffbeb', border: '1px solid #fde68a', fontSize: 12.5, color: '#92400e', display: 'flex', gap: 8 }}>
                  <Icon.Award size={13}/>
                  <span>Application deadline: <strong>{new Date(raw.hiring_deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong></span>
                </div>
              )}
            </>
          ) : <p style={{ color: 'var(--ink-4)', fontSize: 13, margin: 0 }}>No specific positions listed. Check the professor's homepage for current openings.</p>}
        </SectionCard>

        <SectionCard>
          <h3 style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 14 }}><Icon.Sparkles size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Advising style</h3>
          <p style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 18, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>"{prof.advisingStyle}"</p>
        </SectionCard>

        {(raw.funding_opportunities || []).length > 0 && (
          <SectionCard>
            <h3 style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 14 }}><Icon.Award size={14} style={{ verticalAlign: '-2px', marginRight: 7 }}/> Funding opportunities</h3>
            <div className="col gap-2">
              {raw.funding_opportunities.map((f, i) => (
                <div key={i} style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--green-soft)', fontSize: 13, color: 'var(--green-deep)', display: 'flex', gap: 8 }}>
                  <Icon.Dot color="var(--green-hi)" size={6}/>{f}
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      <div className="col gap-4">
        <SectionCard style={{ background: 'var(--green-deep)', color: 'var(--paper)', border: 0 }}>
          <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontSize: 20, marginBottom: 8 }}>Interested in this lab?</div>
          <div style={{ fontSize: 12.5, opacity: 0.85, marginBottom: 16, lineHeight: 1.6 }}>{isHiring && positions.length > 0 ? `Recruiting for ${positions.slice(0,2).join(' & ')}.` : 'Reach out directly to express your interest.'}</div>
          <button className="btn" style={{ background: 'var(--paper)', color: 'var(--green-deep)', border: 0, width: '100%', justifyContent: 'center', fontWeight: 600 }}><Icon.Send size={13}/> Draft outreach email</button>
        </SectionCard>

        <SectionCard>
          <Overline>Lab statistics</Overline>
          <div className="col gap-3">
            {[{ label:'h-index', value:raw.h_index??'—' },{ label:'Citations', value:raw.citation_count!=null?raw.citation_count.toLocaleString():'—' },{ label:'Hiring confidence', value:raw.hiring_confidence!=null?`${raw.hiring_confidence}%`:'—' }].map(({label,value}) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span className="muted">{label}</span>
                <span className="mono" style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notes tab
// ---------------------------------------------------------------------------
function TabNotes({ profId }) {
  const KEY = `fmp-notes-${profId}`;
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } });
  const [text, setText]   = useState('');
  const [editId, setEditId]   = useState(null);
  const [editText, setEditText] = useState('');
  const ref = useRef(null);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(notes)); }, [notes, KEY]);

  const addNote    = () => { const t = text.trim(); if (!t) return; setNotes([{ id: Date.now(), text: t, createdAt: new Date().toISOString() }, ...notes]); setText(''); };
  const startEdit  = n => { setEditId(n.id); setEditText(n.text); };
  const saveEdit   = id => { if (!editText.trim()) return; setNotes(notes.map(n => n.id === id ? { ...n, text: editText.trim(), updatedAt: new Date().toISOString() } : n)); setEditId(null); };
  const deleteNote = id => setNotes(notes.filter(n => n.id !== id));
  const fmtDate    = iso => { const d = new Date(iso), diff = Date.now()-d; return diff<60000?'just now':diff<3600000?`${Math.floor(diff/60000)}m ago`:diff<86400000?`${Math.floor(diff/3600000)}h ago`:d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };

  return (
    <div style={{ maxWidth: 760 }}>
      <SectionCard style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Add a note</div>
        <textarea ref={ref} value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter'&&(e.metaKey||e.ctrlKey)) addNote(); }}
          placeholder="Write anything — questions to ask, things you noticed, follow-up items…" rows={3}
          style={{ width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid var(--line)',fontSize:13.5,fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box',lineHeight:1.6,color:'var(--ink)',background:'white' }}
        />
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10 }}>
          <span className="muted" style={{ fontSize:12 }}><span className="kbd">⌘ Enter</span> to save</span>
          <button className="btn btn-sm btn-primary" onClick={addNote} disabled={!text.trim()}><Icon.Plus size={12}/> Save note</button>
        </div>
      </SectionCard>
      {notes.length === 0
        ? <div style={{ textAlign:'center',padding:'56px 0',color:'var(--ink-4)' }}><Icon.Book size={32} color="var(--ink-4)"/><p style={{ marginTop:14,fontSize:13 }}>No notes yet.</p></div>
        : <div className="col gap-3">
            {notes.map(n => (
              <SectionCard key={n.id} style={{ padding: 20 }}>
                {editId === n.id
                  ? <><textarea value={editText} onChange={e=>setEditText(e.target.value)} autoFocus rows={3} style={{ width:'100%',padding:'8px 10px',borderRadius:7,border:'1px solid var(--green-hi)',fontSize:13.5,fontFamily:'inherit',resize:'vertical',outline:'none',boxSizing:'border-box',lineHeight:1.6,color:'var(--ink)',background:'white' }}/><div style={{ display:'flex',gap:8,marginTop:10 }}><button className="btn btn-sm btn-primary" onClick={() => saveEdit(n.id)}>Save</button><button className="btn btn-sm" onClick={() => setEditId(null)}>Cancel</button></div></>
                  : <><p style={{ margin:'0 0 14px',fontSize:14,lineHeight:1.7,color:'var(--ink)',whiteSpace:'pre-wrap' }}>{n.text}</p><div style={{ display:'flex',justifyContent:'space-between',fontSize:12 }}><span className="muted">{fmtDate(n.updatedAt||n.createdAt)}{n.updatedAt&&<span style={{ marginLeft:6,fontStyle:'italic' }}>· edited</span>}</span><div style={{ display:'flex',gap:8 }}><button className="btn btn-sm btn-ghost" onClick={() => startEdit(n)}><Icon.Plus size={11}/> Edit</button><button className="btn btn-sm btn-ghost" onClick={() => deleteNote(n.id)} style={{ color:'var(--ink-4)' }}><Icon.X size={11}/> Delete</button></div></div></>}
              </SectionCard>
            ))}
          </div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProfDetail — main export
// ---------------------------------------------------------------------------
export default function ProfDetail({ prof, go, savedIds, toggleSave }) {
  const saved = savedIds ? savedIds.has(prof?.id) : false;
  const raw   = prof?._raw || {};

  const [activeTab, setActiveTab] = useState('overview');

  const [publications, setPublications] = useState([]);
  const [pubsLoaded,   setPubsLoaded]   = useState(false);
  useEffect(() => {
    if (typeof prof.id !== 'number') { setPubsLoaded(true); return; }
    professorService.getPublications(prof.id)
      .then(res => setPublications(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setPubsLoaded(true));
  }, [prof.id]);

  const [grants,       setGrants]       = useState([]);
  const [grantsLoaded, setGrantsLoaded] = useState(false);
  useEffect(() => {
    if (activeTab !== 'grants' || grantsLoaded || typeof prof.id !== 'number') return;
    professorService.getGrants(prof.id)
      .then(res => setGrants(res.data.results || res.data || []))
      .catch(() => {})
      .finally(() => setGrantsLoaded(true));
  }, [activeTab, prof.id, grantsLoaded]);

  const activeGrants = grants.filter(g => g.status === 'active');

  // Country metadata
  const countryMeta = COUNTRY_META[prof?.country] || null;
  const flag        = countryMeta?.flag || null;

  const TABS = [
    { id: 'overview',     label: 'Overview' },
    { id: 'publications', label: 'Publications', count: pubsLoaded ? publications.length : null },
    { id: 'grants',       label: 'Grants',       count: grantsLoaded ? (activeGrants.length ? `${activeGrants.length} active` : grants.length || null) : null },
    { id: 'students',     label: 'Students' },
    { id: 'notes',        label: 'Notes' },
  ];

  if (!prof) return null;

  return (
    <div className="fade-in">

      {/* ── Hero header ──────────────────────────────────────────── */}
      <div style={{ background: 'var(--paper-2)', borderBottom: '1px solid var(--line)', padding: '24px 40px 0' }}>
        <button className="btn btn-sm btn-ghost" onClick={() => go('matches')}
          style={{ marginBottom: 24, marginLeft: -8, color: 'var(--ink-3)' }}>
          <Icon.Chevron size={12} style={{ transform: 'rotate(180deg)' }}/> Back to matches
        </button>

        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>

            {/* Photo */}
            <ProfPhoto prof={prof} size={112}/>

            {/* Identity */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              <h1 style={{ fontSize: 34, fontWeight: 680, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
                {prof.name}
              </h1>

              {/* Designation */}
              <div style={{ fontSize: 16, fontWeight: 560, color: 'var(--ink-2)', marginBottom: 6, lineHeight: 1.3 }}>
                {prof.title || 'Professor'}
                {prof.dept && prof.dept !== prof.school && (
                  <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}> · {prof.dept}</span>
                )}
              </div>

              {/* University + location + flag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 14, color: 'var(--ink-3)', marginBottom: 20, flexWrap: 'wrap' }}>
                <Icon.Building size={14} color="var(--ink-4)"/>
                <span style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{prof.school}</span>
                {(prof.state || prof.country) && (
                  <>
                    <span style={{ color: 'var(--line-2)' }}>·</span>
                    {flag && <span style={{ fontSize: 18, lineHeight: 1, userSelect: 'none' }}>{flag}</span>}
                    <span>{[prof.state, countryMeta?.name || prof.country].filter(Boolean).join(', ')}</span>
                  </>
                )}
              </div>

              {/* Stats strip */}
              <StatStrip hIndex={prof.hIndex} citations={prof.citations} hiringConfidence={raw.hiring_confidence > 0 ? raw.hiring_confidence : 0}/>

              {/* Status + hiring pills */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, marginBottom: 18 }}>
                {prof.accepting
                  ? <span className="pill pill-green" style={{ fontSize: 12, padding: '4px 11px' }}><Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Accepting students</span>
                  : <span className="pill pill-outline" style={{ fontSize: 12, padding: '4px 11px' }}>Not accepting</span>}
                <StatusBadge status={prof.professorStatus} size="lg"/>
              </div>

              {/* Links */}
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, paddingBottom: 4 }}>
                {prof.homepage && <a href={prof.homepage} target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:5,color:'var(--green-deep)',textDecoration:'none',fontWeight:500 }}><Icon.Globe size={13}/> Homepage</a>}
                {prof.email    && <a href={`mailto:${prof.email}`} style={{ display:'flex',alignItems:'center',gap:5,color:'var(--green-deep)',textDecoration:'none',fontWeight:500 }}><Icon.Mail size={13}/> {prof.email}</a>}
                {raw.google_scholar_id && <a href={`https://scholar.google.com/citations?user=${raw.google_scholar_id}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:5,color:'var(--green-deep)',textDecoration:'none',fontWeight:500 }}><Icon.ExternalLink size={13}/> Google Scholar</a>}
                {raw.orcid     && <a href={`https://orcid.org/${raw.orcid}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex',alignItems:'center',gap:5,color:'var(--green-deep)',textDecoration:'none',fontWeight:500 }}><Icon.ExternalLink size={13}/> ORCID</a>}
              </div>
            </div>

            {/* Match score */}
            <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:8,flexShrink:0,paddingTop:8 }}>
              <ScoreRing value={prof.score} size={80}/>
              <span className="mono muted" style={{ fontSize:11,letterSpacing:'0.04em',textTransform:'uppercase' }}>match score</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex',gap:10,marginTop:24 }}>
            <button className="btn btn-primary btn-lg" onClick={() => go('compose',{compose:prof})}><Icon.Send size={14}/> Draft outreach email</button>
            <button className="btn btn-lg" onClick={() => toggleSave && toggleSave(prof.id)}>{saved?<Icon.StarF size={15} color="oklch(0.7 0.13 75)"/>:<Icon.Star size={15}/>}{saved?'Saved':'Save to shortlist'}</button>
            <button className="btn btn-lg" onClick={() => setActiveTab('notes')}><Icon.Plus size={14}/> Add note</button>
          </div>

          {/* Tabs */}
          <div className="tabs" style={{ marginTop: 24 }}>
            {TABS.map(t => (
              <div key={t.id} className={'tab'+(activeTab===t.id?' active':'')} onClick={() => setActiveTab(t.id)}>
                {t.label}{t.count!=null&&<span className="mono muted"> · {t.count}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ──────────────────────────────────────────── */}
      <div style={{ padding: '32px 40px 72px', maxWidth: 1100, margin: '0 auto' }}>

        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>

            {/* Left column */}
            <div className="col gap-5">

              <AcademicBackground prof={prof}/>

              {/* Why this match */}
              <SectionCard style={{ padding: 28 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
                  <h3 style={{ fontSize:15.5,fontWeight:600 }}><Icon.Sparkles size={14} color="var(--green-hi)" style={{ verticalAlign:'-2px',marginRight:8 }}/>Why this match</h3>
                  <span className="pill pill-outline mono">v23 ranking</span>
                </div>
                <ol style={{ paddingLeft:20,margin:'0 0 20px',color:'var(--ink-2)',fontSize:13.5,lineHeight:1.75 }}>
                  {prof.reasons.map((r, i) => <li key={i} style={{ marginBottom:2 }}>{r}</li>)}
                </ol>
                <div style={{ padding:18,borderRadius:10,background:'var(--paper-2)',border:'1px solid var(--line)' }}>
                  <div style={{ fontSize:12,fontWeight:600,color:'var(--ink-3)',marginBottom:14 }}>Score breakdown</div>
                  <div className="col gap-4">
                    <Bar value={prof.breakdown.expertise}  label="Expertise match"/>
                    <Bar value={prof.breakdown.funding}    label="Funding likelihood"/>
                    <Bar value={prof.breakdown.activity}   label="Activity recency"/>
                    <Bar value={prof.breakdown.reputation} label="Reputation"/>
                  </div>
                </div>
              </SectionCard>

              {/* Recent publications */}
              <SectionCard style={{ padding: 28 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18 }}>
                  <h3 style={{ fontSize:15.5,fontWeight:600 }}><Icon.Book size={14} style={{ verticalAlign:'-2px',marginRight:8 }}/>Recent publications</h3>
                  {pubsLoaded && publications.length > 4 && (
                    <button className="btn btn-sm btn-ghost" onClick={() => setActiveTab('publications')}>View all {publications.length} <Icon.Chevron size={11}/></button>
                  )}
                </div>
                {!pubsLoaded ? (
                  <span className="muted" style={{ fontSize:13 }}>Loading…</span>
                ) : publications.length === 0 ? (
                  <span className="muted" style={{ fontSize:13 }}>No publications found.</span>
                ) : (
                  <>
                    {publications.slice(0, 4).map((p, i) => (
                      <div key={p.id} style={{ display:'flex',gap:12,padding:'16px 0',borderTop:i?'1px solid var(--line)':'none' }}>
                        <div style={{ flex:1,display:'flex',flexDirection:'column',gap:5 }}>
                          <div style={{ fontWeight:500,fontSize:14,lineHeight:1.45 }}>{p.title}</div>
                          <div className="muted" style={{ fontSize:12.5 }}>
                            {p.venue && <span style={{ fontWeight:600,color:'var(--ink-2)' }}>{p.venue}</span>}
                            {p.venue && p.year && ' · '}
                            {p.year  && <span className="mono">{p.year}</span>}
                            {p.citation_count > 0 && <span className="mono"> · {p.citation_count.toLocaleString()} citations</span>}
                          </div>
                        </div>
                        {p.doi && <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-ghost" style={{ textDecoration:'none',flexShrink:0 }}><Icon.ExternalLink size={12}/></a>}
                      </div>
                    ))}
                    {pubsLoaded && <TopVenues publications={publications}/>}
                  </>
                )}
              </SectionCard>

              <ProfReviews profId={prof.id}/>
            </div>

            {/* Right column */}
            <div className="col gap-5">

              {/* Research keywords */}
              <SectionCard>
                <Overline>Research Keywords</Overline>
                <div style={{ display:'flex',flexWrap:'wrap',gap:7 }}>
                  {prof.keywords.length > 0
                    ? prof.keywords.map(k => <span key={k} style={{ padding:'5px 13px',borderRadius:999,fontSize:12.5,fontWeight:500,background:'var(--paper-2)',color:'var(--ink-2)',border:'1px solid var(--line)',letterSpacing:'-0.01em' }}>{k}</span>)
                    : <span className="muted" style={{ fontSize:13 }}>No keywords listed.</span>}
                </div>
              </SectionCard>

              {/* Outreach Signals — unique feature */}
              <OutreachSignals prof={prof}/>

              {/* Research Metrics */}
              <MetricsCard hIndex={prof.hIndex} citations={prof.citations} hiringConfidence={raw.hiring_confidence} lastScrapedAt={raw.last_scraped_at}/>

              {/* Active funding */}
              {prof.funding && (
                <SectionCard>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                    <Overline>Active Funding</Overline>
                    <button className="btn btn-sm btn-ghost" style={{ marginTop:-4 }} onClick={() => setActiveTab('grants')}>View grants</button>
                  </div>
                  <div style={{ fontFamily:'"Instrument Serif", serif',fontSize:18,lineHeight:1.4,color:'var(--ink)' }}>{prof.funding}</div>
                  <div className="muted" style={{ fontSize:12,marginTop:8 }}>Indicates likely funded openings through grant end-date.</div>
                </SectionCard>
              )}

              {/* Data Accuracy */}
              <ProfileAccuracy prof={prof}/>

              {/* Advising style */}
              <SectionCard>
                <Overline>Advising Style</Overline>
                <p style={{ fontFamily:'"Instrument Serif", serif',fontStyle:'italic',fontSize:17,color:'var(--ink-2)',lineHeight:1.65,margin:0 }}>"{prof.advisingStyle}"</p>
                {(raw.hiring_positions||[]).length > 0 && (
                  <div style={{ display:'flex',gap:7,flexWrap:'wrap',marginTop:14 }}>
                    {raw.hiring_positions.map(p => <span key={p} className="pill pill-green">{p}</span>)}
                  </div>
                )}
              </SectionCard>

              {/* Draft CTA */}
              <SectionCard style={{ background:'var(--green-deep)',color:'var(--paper)',border:0,padding:24 }}>
                <div style={{ fontFamily:'"Instrument Serif", serif',fontStyle:'italic',fontSize:21,marginBottom:8,lineHeight:1.3 }}>Ready to write?</div>
                <div style={{ fontSize:13,opacity:0.82,marginBottom:18,lineHeight:1.6 }}>Draft a personalised email referencing their latest research.</div>
                <button className="btn" style={{ background:'var(--paper)',color:'var(--green-deep)',border:0,width:'100%',justifyContent:'center',fontWeight:600 }} onClick={() => go('compose',{compose:prof})}><Icon.Sparkles size={13}/> Draft email</button>
              </SectionCard>

            </div>
          </div>
        )}

        {activeTab === 'publications' && <TabPublications publications={publications} loading={!pubsLoaded}/>}
        {activeTab === 'grants'       && <TabGrants grants={grants} loading={!grantsLoaded}/>}
        {activeTab === 'students'     && <TabStudents prof={prof}/>}
        {activeTab === 'notes'        && <TabNotes profId={prof.id}/>}
      </div>
    </div>
  );
}
