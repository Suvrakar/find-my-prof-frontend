import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Icon } from '../components/Icons';
import { scholarshipService, userScholarshipService } from '../services/api';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const PAGE_SIZE = 9;

const TYPE_META = {
  government: { label: "Government",  color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  fellowship:  { label: "Fellowship",  color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  university:  { label: "University",  color: "#9333ea", bg: "#faf5ff", border: "#e9d5ff" },
  industry:    { label: "Industry",    color: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  private:     { label: "Private",     color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
};

const FIELD_LABELS = {
  cs: "CS", ai: "AI/ML", engineering: "Engineering", sciences: "Sciences",
  math: "Mathematics", social: "Social Sci", humanities: "Humanities",
  bio: "Life Sci", policy: "Policy", any: "Any Field",
};

const TYPE_FILTERS = [
  { id: "all",        label: "All" },
  { id: "government", label: "Government" },
  { id: "fellowship", label: "Fellowship" },
  { id: "university", label: "University" },
  { id: "industry",   label: "Industry" },
  { id: "private",    label: "Private" },
];

const FIELD_FILTERS = [
  { id: "all",         label: "All Fields" },
  { id: "cs",          label: "CS" },
  { id: "ai",          label: "AI / ML" },
  { id: "engineering", label: "Engineering" },
  { id: "sciences",    label: "Sciences" },
  { id: "math",        label: "Mathematics" },
  { id: "bio",         label: "Life Sciences" },
  { id: "social",      label: "Social Sciences" },
  { id: "any",         label: "Any Field" },
];

const COUNTRY_FILTERS = [
  { id: "all",          label: "All Countries" },
  { id: "USA",          label: "🇺🇸 USA" },
  { id: "UK",           label: "🇬🇧 UK" },
  { id: "Europe",       label: "🇪🇺 Europe" },
  { id: "Global",       label: "🌐 Global" },
  { id: "Canada",       label: "🇨🇦 Canada" },
  { id: "Japan",        label: "🇯🇵 Japan" },
  { id: "Germany",      label: "🇩🇪 Germany" },
  { id: "South Korea",  label: "🇰🇷 South Korea" },
  { id: "Switzerland",  label: "🇨🇭 Switzerland" },
  { id: "Australia",    label: "🇦🇺 Australia" },
  { id: "Singapore",    label: "🇸🇬 Singapore" },
  { id: "China",        label: "🇨🇳 China" },
  { id: "Sweden",       label: "🇸🇪 Sweden" },
];

const AMOUNT_FILTERS = [
  { id: "all",  label: "Any Amount",   min: 0,      max: null   },
  { id: "low",  label: "Under $25k",   min: null,   max: 25000  },
  { id: "mid",  label: "$25k–$40k",    min: 25000,  max: 40000  },
  { id: "high", label: "Over $40k",    min: 40000,  max: null   },
];

const STATUS_CHOICES = [
  { id: 'saved',       label: 'Saved',       color: '#6b7280' },
  { id: 'researching', label: 'Researching', color: '#2563eb' },
  { id: 'applying',    label: 'Applying',    color: '#d97706' },
  { id: 'submitted',   label: 'Submitted',   color: '#7c3aed' },
  { id: 'awarded',     label: 'Awarded',     color: '#16a34a' },
  { id: 'rejected',    label: 'Rejected',    color: '#dc2626' },
];

const SEL = {
  padding: "7px 10px", borderRadius: 8, border: "1px solid var(--line)",
  fontSize: 12.5, background: "white", cursor: "pointer",
  outline: "none", fontFamily: "inherit", color: "var(--ink-2)",
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return dv;
}

function deadlineStatus(dateStr) {
  if (!dateStr) return { label: "Rolling", color: "#aaa" };
  const ms   = new Date(dateStr) - Date.now();
  const days = Math.ceil(ms / 86400000);
  if (days < 0)   return { label: "Closed",            color: "#d1d5db", urgent: false };
  if (days <= 30) return { label: `${days}d left`,    color: "#dc2626", urgent: true  };
  if (days <= 90) return { label: `${days}d left`,    color: "#d97706", urgent: false };
  const d = new Date(dateStr);
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    color: "#6b7280", urgent: false,
  };
}

function fmtAmount(n) {
  if (!n) return '—';
  const num = parseFloat(n);
  if (num >= 100000) return `$${(num / 1000).toFixed(0)}k+`;
  if (num >= 1000)   return `$${(num / 1000).toFixed(0)}k`;
  return `$${num}`;
}

function Stars({ n }) {
  return (
    <span style={{ display: "flex", gap: 1, alignItems: "center" }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="10" height="10" viewBox="0 0 10 10" fill={i <= n ? "#f59e0b" : "#e5e7eb"}>
          <polygon points="5,1 6.5,3.8 9.5,4.2 7.2,6.3 7.9,9.3 5,7.7 2.1,9.3 2.8,6.3 0.5,4.2 3.5,3.8"/>
        </svg>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// Card (shared by Browse + Recommended tabs)
// ─────────────────────────────────────────────────────────────
function ScholarshipCard({ s, saved, userEntry, onToggleSave, onOpen, matchScore, matchReasons }) {
  const tm  = TYPE_META[s.type] || TYPE_META.private;
  const dl  = deadlineStatus(s.deadline);
  const [hov, setHov] = useState(false);

  const statusInfo = userEntry ? STATUS_CHOICES.find(c => c.id === userEntry.status) : null;

  return (
    <div
      onClick={() => onOpen(s)}
      onMouseOver={() => setHov(true)} onMouseOut={() => setHov(false)}
      style={{
        background: "white", borderRadius: 12,
        border: `1px solid ${hov ? "#d1d5db" : "var(--line)"}`,
        boxShadow: hov ? "0 4px 20px rgba(0,0,0,0.09)" : "0 1px 3px rgba(0,0,0,0.04)",
        overflow: "hidden", cursor: "pointer", display: "flex", flexDirection: "column",
        transition: "box-shadow 0.15s, border-color 0.15s", position: "relative",
      }}>
      <div style={{ height: 3, background: tm.color, flexShrink: 0 }}/>

      <div style={{ padding: "16px 18px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            background: tm.bg, border: `1px solid ${tm.border}`, color: tm.color,
            letterSpacing: "0.03em", flexShrink: 0 }}>
            {tm.label.toUpperCase()}
          </span>
          <Stars n={s.prestige}/>
          {s.flag && <span style={{ fontSize: 13 }}>{s.flag}</span>}
          {statusInfo && (
            <span style={{ fontSize: 10.5, padding: "2px 8px", borderRadius: 20,
              background: statusInfo.color + '18', color: statusInfo.color,
              fontWeight: 700, flexShrink: 0, marginLeft: 2 }}>
              {statusInfo.label.toUpperCase()}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: dl.color,
            background: dl.urgent ? "#fef2f2" : "transparent",
            padding: dl.urgent ? "2px 7px" : 0, borderRadius: 20 }}>
            {dl.label}
          </span>
        </div>

        {/* Title */}
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 700, letterSpacing: "-0.01em", lineHeight: 1.3, color: "var(--ink)" }}>
            {s.name}
          </div>
          {s.short_name && <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>{s.short_name}</div>}
        </div>

        {/* Match score bar (Recommended tab only) */}
        {matchScore != null && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
              <span style={{ color: "var(--ink-4)" }}>Match score</span>
              <span style={{ fontWeight: 700, color: matchScore >= 70 ? "#16a34a" : matchScore >= 40 ? "#d97706" : "#6b7280" }}>
                {matchScore}pts
              </span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: "var(--paper-3)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.min(100, (matchScore / 120) * 100)}%`,
                background: matchScore >= 70 ? "#16a34a" : matchScore >= 40 ? "#d97706" : "#9ca3af",
                borderRadius: 99, transition: "width 0.5s" }}/>
            </div>
            {matchReasons && matchReasons.length > 0 && (
              <div style={{ marginTop: 5, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {matchReasons.slice(0, 2).map((r, i) => (
                  <span key={i} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 20,
                    background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Amount + facts */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--green-deep)", letterSpacing: "-0.02em" }}>
            {fmtAmount(s.amount_usd)}
          </span>
          <span style={{ fontSize: 12, color: "var(--ink-4)" }}>/yr · {s.duration || 'varies'}</span>
          {s.tuition && (
            <span style={{ fontSize: 11, color: "var(--green-deep)", background: "var(--green-soft)",
              padding: "1px 7px", borderRadius: 20, fontWeight: 600, flexShrink: 0 }}>
              + tuition
            </span>
          )}
        </div>

        {/* Description */}
        <p style={{ fontSize: 12.5, color: "var(--ink-3)", lineHeight: 1.55, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {s.description}
        </p>

        {/* Level + field badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {(s.level || []).map(l => (
            <span key={l} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 20,
              background: "var(--paper-3)", color: "var(--ink-3)", border: "1px solid var(--line)" }}>
              {l}
            </span>
          ))}
          {(s.fields || []).slice(0, 2).map(f => (
            <span key={f} style={{ fontSize: 10.5, padding: "2px 7px", borderRadius: 20,
              background: "var(--paper-2)", color: "var(--ink-3)", border: "1px solid var(--line)" }}>
              {FIELD_LABELS[f] || f}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 18px", borderTop: "1px solid var(--line)", background: "var(--paper-2)",
        display: "flex", alignItems: "center", gap: 8 }}>
        <button onClick={e => { e.stopPropagation(); onToggleSave(s.id); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 6px",
            borderRadius: 6, display: "flex", alignItems: "center", gap: 5,
            color: saved ? "#dc2626" : "var(--ink-4)", fontSize: 12, fontWeight: 500 }}>
          {saved
            ? <svg width="14" height="14" fill="#dc2626" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          }
          {saved ? "Saved" : "Save"}
        </button>
        <div style={{ flex: 1 }}/>
        <button onClick={e => { e.stopPropagation(); onOpen(s); }}
          style={{ fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 7,
            background: "none", border: "1px solid var(--line)", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5, color: "var(--ink-2)" }}>
          Details <Icon.Chevron size={12}/>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Detail Drawer
// ─────────────────────────────────────────────────────────────
function ScholarshipDrawer({ s, onClose, saved, onToggleSave, userEntry, onStatusChange }) {
  const tm = TYPE_META[s.type] || TYPE_META.private;
  const dl = deadlineStatus(s.deadline);
  const statusInfo = userEntry ? STATUS_CHOICES.find(c => c.id === userEntry.status) : null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.35)" }}/>
      <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 901, width: 480,
        background: "white", boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column", overflow: "hidden" }}>

        <div style={{ height: 4, background: tm.color, flexShrink: 0 }}/>

        {/* Header */}
        <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                  background: tm.bg, border: `1px solid ${tm.border}`, color: tm.color }}>
                  {tm.label.toUpperCase()}
                </span>
                <Stars n={s.prestige}/>
                {s.flag && <span style={{ fontSize: 14 }}>{s.flag}</span>}
                {statusInfo && (
                  <span style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 20, fontWeight: 700,
                    background: statusInfo.color + '18', color: statusInfo.color }}>
                    {statusInfo.label.toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
                {s.name}
              </div>
              {s.short_name && <div style={{ fontSize: 12.5, color: "var(--ink-4)", marginTop: 4 }}>{s.short_name}</div>}
            </div>
            <button onClick={onClose}
              style={{ background: "none", border: "1px solid var(--line)", borderRadius: 8, padding: "6px 8px",
                cursor: "pointer", display: "flex", color: "var(--ink-3)", flexShrink: 0 }}>
              <Icon.X size={15}/>
            </button>
          </div>

          {/* Status selector (if tracking) */}
          {userEntry && (
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, color: "var(--ink-4)", fontWeight: 600 }}>Status:</span>
              <select
                value={userEntry.status}
                onClick={e => e.stopPropagation()}
                onChange={e => { e.stopPropagation(); onStatusChange(userEntry.id, e.target.value); }}
                style={{ ...SEL, fontSize: 11.5, padding: "4px 8px" }}>
                {STATUS_CHOICES.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "20px 24px 32px" }}>
          {/* Amount fact box */}
          <div style={{ padding: "16px 18px", background: "var(--paper-2)", borderRadius: 10,
            border: "1px solid var(--line)", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: "var(--green-deep)", letterSpacing: "-0.02em" }}>
                {fmtAmount(s.amount_usd)}
              </span>
              <span style={{ fontSize: 14, color: "var(--ink-4)" }}>
                {s.amount_raw ? `(${s.amount_raw})` : 'per year'} · {s.duration || 'varies'}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 12.5 }}>
              {[
                ["Tuition",  s.tuition ? "✓ Covered" : "Not included", s.tuition ? "var(--green-deep)" : "var(--ink-4)"],
                ["Deadline", dl.label, dl.color],
                ["Level",    (s.level || []).join(", ") || "—", "var(--ink-2)"],
                ["Country",  `${s.flag || ''} ${s.country || '—'}`.trim(), "var(--ink-2)"],
              ].map(([k, v, c]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, color: "var(--ink-4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            {s.citizenship && (
              <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)", paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                <strong>Citizenship:</strong> {s.citizenship}
              </div>
            )}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
            color: "var(--ink-4)", marginBottom: 8 }}>About</div>
          <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-2)", margin: "0 0 20px" }}>
            {s.description}
          </p>

          {s.eligibility && <>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
              color: "var(--ink-4)", marginBottom: 8 }}>Eligibility</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, color: "var(--ink-2)", margin: "0 0 20px" }}>
              {s.eligibility}
            </p>
          </>}

          {(s.fields || []).length > 0 && <>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em",
              color: "var(--ink-4)", marginBottom: 10 }}>Fields</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {s.fields.map(f => (
                <span key={f} style={{ fontSize: 12, padding: "4px 11px", borderRadius: 20,
                  background: "var(--paper-3)", border: "1px solid var(--line)", color: "var(--ink-2)" }}>
                  {FIELD_LABELS[f] || f}
                </span>
              ))}
            </div>
          </>}

          {(s.tags || []).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {s.tags.map(t => (
                <span key={t} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20,
                  background: tm.bg, border: `1px solid ${tm.border}`, color: tm.color, fontWeight: 500 }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--line)", background: "var(--paper-2)",
          display: "flex", gap: 10 }}>
          <button onClick={() => onToggleSave(s.id)}
            style={{ padding: "9px 16px", borderRadius: 9, border: "1px solid var(--line)",
              background: saved ? "#fef2f2" : "white", cursor: "pointer",
              fontSize: 13, fontWeight: 600, color: saved ? "#dc2626" : "var(--ink-3)",
              display: "flex", alignItems: "center", gap: 6 }}>
            {saved
              ? <svg width="14" height="14" fill="#dc2626" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            }
            {saved ? "Saved" : "Save"}
          </button>
          {(s.apply_url || s.homepage_url) ? (
            <a href={s.apply_url || s.homepage_url} target="_blank" rel="noreferrer"
              onClick={e => e.stopPropagation()}
              style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none",
                background: "var(--ink)", color: "white", cursor: "pointer",
                fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center",
                justifyContent: "center", gap: 6, textDecoration: "none" }}>
              <Icon.ExternalLink size={13}/> Apply / Official Site
            </a>
          ) : (
            <div style={{ flex: 1, padding: "9px 0", borderRadius: 9,
              background: "var(--paper-3)", color: "var(--ink-4)",
              fontSize: 12.5, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 6 }}>
              No link available
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterBar (Browse tab)
// ─────────────────────────────────────────────────────────────
function FilterBar({ search, setSearch, typeF, setTypeF, fieldF, setFieldF,
                     countryF, setCountryF, amountF, setAmountF }) {
  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--line)",
      padding: "14px 16px", marginBottom: 22, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>

      <div style={{ display: "flex", alignItems: "center", gap: 7, background: "var(--paper-2)",
        border: "1px solid var(--line)", borderRadius: 8, padding: "7px 11px", minWidth: 200, flex: 1, maxWidth: 280 }}>
        <Icon.Search size={13} color="var(--ink-4)"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search scholarships…"
          style={{ border: "none", background: "none", outline: "none", fontSize: 12.5,
            width: "100%", fontFamily: "inherit", color: "var(--ink)" }}/>
        {search && (
          <button onClick={() => setSearch("")}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: 0 }}>
            <Icon.X size={11}/>
          </button>
        )}
      </div>

      <div style={{ width: 1, height: 24, background: "var(--line)" }}/>

      <div style={{ display: "flex", gap: 2, padding: 3, background: "var(--paper-2)", borderRadius: 9 }}>
        {TYPE_FILTERS.map(f => (
          <button key={f.id} onClick={() => setTypeF(f.id)}
            style={{ padding: "4px 11px", borderRadius: 7, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: typeF === f.id ? 600 : 400,
              background: typeF === f.id ? "white" : "transparent",
              color: typeF === f.id ? "var(--ink)" : "var(--ink-3)",
              boxShadow: typeF === f.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              transition: "all 0.1s", whiteSpace: "nowrap" }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginLeft: "auto", alignItems: "center" }}>
        <select style={SEL} value={fieldF}   onChange={e => setFieldF(e.target.value)}>
          {FIELD_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <select style={SEL} value={countryF} onChange={e => setCountryF(e.target.value)}>
          {COUNTRY_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <select style={SEL} value={amountF}  onChange={e => setAmountF(e.target.value)}>
          {AMOUNT_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pagination component
// ─────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32 }}>
      <button onClick={() => onPage(Math.max(1, page - 1))} disabled={page === 1}
        style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)",
          background: "white", cursor: page === 1 ? "default" : "pointer",
          fontSize: 13, fontWeight: 500, color: page === 1 ? "var(--ink-4)" : "var(--ink-2)",
          opacity: page === 1 ? 0.45 : 1 }}>
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => {
        const near = n === 1 || n === totalPages || Math.abs(n - page) <= 1;
        const isEllipsis = !near && (n === 2 || n === totalPages - 1);
        if (!near && !isEllipsis) return null;
        if (isEllipsis) return <span key={n} style={{ color: "var(--ink-4)", fontSize: 13 }}>…</span>;
        return (
          <button key={n} onClick={() => onPage(n)}
            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid",
              borderColor: page === n ? "var(--green-deep)" : "var(--line)",
              background: page === n ? "var(--green-deep)" : "white",
              color: page === n ? "white" : "var(--ink-2)",
              cursor: "pointer", fontSize: 13, fontWeight: page === n ? 700 : 400 }}>
            {n}
          </button>
        );
      })}
      <button onClick={() => onPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
        style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid var(--line)",
          background: "white", cursor: page === totalPages ? "default" : "pointer",
          fontSize: 13, fontWeight: 500, color: page === totalPages ? "var(--ink-4)" : "var(--ink-2)",
          opacity: page === totalPages ? 0.45 : 1 }}>
        Next →
      </button>
      <span style={{ marginLeft: 8, fontSize: 12, color: "var(--ink-4)" }}>
        Page {page} of {totalPages}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ background: "white", borderRadius: 12, border: "1px solid var(--line)",
          overflow: "hidden", height: 280 }}>
          <div style={{ height: 3, background: "var(--paper-3)" }}/>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            {[40, 20, 30, 60, 80, 45].map((w, j) => (
              <div key={j} style={{ height: j === 2 ? 28 : 14, width: `${w}%`,
                background: "var(--paper-3)", borderRadius: 6, animation: "pulse 1.5s infinite" }}/>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Browse Tab
// ─────────────────────────────────────────────────────────────
function BrowseTab({ entryMap, onToggleSave, onOpen, onStatusChange }) {
  const [search,   setSearch]   = useState('');
  const [typeF,    setTypeF]    = useState('all');
  const [fieldF,   setFieldF]   = useState('all');
  const [countryF, setCountryF] = useState('all');
  const [amountF,  setAmountF]  = useState('all');
  const [page,     setPage]     = useState(1);
  const [items,    setItems]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);

  const dSearch = useDebounce(search, 400);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [dSearch, typeF, fieldF, countryF, amountF]);

  useEffect(() => {
    setLoading(true);
    const amtRange = AMOUNT_FILTERS.find(a => a.id === amountF) || AMOUNT_FILTERS[0];
    const params = { page, page_size: PAGE_SIZE };
    if (dSearch)            params.search = dSearch;
    if (typeF !== 'all')    params.type = typeF;
    if (fieldF !== 'all')   params.fields = fieldF;
    if (countryF !== 'all') params.country = countryF;
    if (amtRange.min)       params.amount_min = amtRange.min;
    if (amtRange.max)       params.amount_max = amtRange.max;

    scholarshipService.getAll(params)
      .then(r => { setItems(r.data.results || []); setTotal(r.data.count || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, dSearch, typeF, fieldF, countryF, amountF]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handlePage = (n) => {
    setPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <FilterBar
        search={search} setSearch={setSearch}
        typeF={typeF} setTypeF={setTypeF}
        fieldF={fieldF} setFieldF={setFieldF}
        countryF={countryF} setCountryF={setCountryF}
        amountF={amountF} setAmountF={setAmountF}
      />

      {(dSearch || typeF !== 'all' || fieldF !== 'all' || countryF !== 'all' || amountF !== 'all') && !loading && (
        <div style={{ fontSize: 12.5, color: "var(--ink-4)", marginBottom: 14 }}>
          Showing <strong style={{ color: "var(--ink-2)" }}>{total}</strong> scholarships
          {dSearch && <> matching <em>"{dSearch}"</em></>}
        </div>
      )}

      {loading ? (
        <SkeletonGrid />
      ) : items.length > 0 ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
            {items.map(s => (
              <ScholarshipCard key={s.id} s={s}
                saved={!!entryMap[s.id]}
                userEntry={entryMap[s.id] || null}
                onToggleSave={onToggleSave}
                onOpen={onOpen}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPage={handlePage}/>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-4)" }}>
          <Icon.Search size={32} color="var(--line)"/>
          <p style={{ marginTop: 16, fontSize: 14 }}>No scholarships match your filters.</p>
          <button onClick={() => { setSearch(''); setTypeF('all'); setFieldF('all'); setCountryF('all'); setAmountF('all'); }}
            style={{ marginTop: 8, padding: "7px 18px", borderRadius: 8, border: "1px solid var(--line)",
              background: "white", cursor: "pointer", fontSize: 13 }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// My Applications Tab
// ─────────────────────────────────────────────────────────────
function MyAppsTab({ entries, onOpen, onStatusChange, onRemove, isAuth }) {
  if (!isAuth) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)" }}>
        <Icon.Bookmark size={40} color="var(--line)"/>
        <p style={{ marginTop: 18, fontSize: 15, fontWeight: 600, color: "var(--ink-2)" }}>Sign in to track applications</p>
        <p style={{ marginTop: 6, fontSize: 13 }}>Log in to save scholarships and track your application progress.</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)" }}>
        <Icon.GraduationCap size={40} color="var(--line)"/>
        <p style={{ marginTop: 18, fontSize: 15, fontWeight: 600, color: "var(--ink-2)" }}>No tracked scholarships yet</p>
        <p style={{ marginTop: 6, fontSize: 13 }}>Save scholarships from the Browse tab to start tracking your applications.</p>
      </div>
    );
  }

  const grouped = {};
  STATUS_CHOICES.forEach(c => { grouped[c.id] = []; });
  entries.forEach(e => {
    const key = e.status || 'saved';
    if (grouped[key]) grouped[key].push(e);
    else grouped['saved'].push(e);
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ fontSize: 13.5, color: "var(--ink-3)" }}>
          Tracking <strong style={{ color: "var(--ink)" }}>{entries.length}</strong> scholarship{entries.length !== 1 ? 's' : ''}
        </div>
      </div>

      {STATUS_CHOICES.map(col => {
        const colEntries = grouped[col.id] || [];
        if (colEntries.length === 0) return null;
        return (
          <div key={col.id} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: col.color, flexShrink: 0 }}/>
              <span style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: "0.05em", color: "var(--ink-2)" }}>
                {col.label}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>({colEntries.length})</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {colEntries.map(entry => (
                <AppCard key={entry.id} entry={entry}
                  onOpen={() => onOpen(entry.scholarship)}
                  onStatusChange={onStatusChange}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AppCard({ entry, onOpen, onStatusChange, onRemove }) {
  const s  = entry.scholarship;
  const tm = TYPE_META[s.type] || TYPE_META.private;
  const dl = deadlineStatus(s.deadline);
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid var(--line)",
      overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ height: 3, background: tm.color }}/>
      <div style={{ padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5, flexWrap: "wrap" }}>
              {s.flag && <span style={{ fontSize: 13 }}>{s.flag}</span>}
              <span style={{ fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                background: tm.bg, color: tm.color }}>
                {tm.label.toUpperCase()}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: dl.color,
                background: dl.urgent ? "#fef2f2" : "transparent",
                padding: dl.urgent ? "2px 6px" : 0, borderRadius: 16 }}>
                {dl.label}
              </span>
            </div>
            <button onClick={onOpen}
              style={{ fontSize: 14.5, fontWeight: 700, background: "none", border: "none", cursor: "pointer",
                color: "var(--ink)", padding: 0, textAlign: "left", lineHeight: 1.3 }}>
              {s.name}
            </button>
            {s.short_name && <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>{s.short_name}</div>}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--green-deep)" }}>
              {fmtAmount(s.amount_usd)}
            </span>
            <select
              value={entry.status}
              onChange={e => onStatusChange(entry.id, e.target.value)}
              style={{ ...SEL, fontSize: 11.5, padding: "4px 8px" }}>
              {STATUS_CHOICES.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes toggle */}
        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
          <button onClick={() => setShowNotes(!showNotes)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: 0, fontSize: 12 }}>
            {showNotes ? '▾ Hide notes' : '▸ Notes' + (entry.notes ? ' · ' + entry.notes.slice(0, 40) + (entry.notes.length > 40 ? '…' : '') : '')}
          </button>
          <button onClick={() => onRemove(entry.id)}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer",
              color: "var(--ink-4)", padding: "2px 6px", borderRadius: 6, fontSize: 11.5,
              display: "flex", alignItems: "center", gap: 4 }}>
            <Icon.X size={11}/> Remove
          </button>
        </div>

        {showNotes && (
          <div style={{ marginTop: 8 }}>
            <NoteEditor entryId={entry.id} initialNotes={entry.notes}/>
          </div>
        )}
      </div>
    </div>
  );
}

function NoteEditor({ entryId, initialNotes }) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);

  const save = useCallback((val) => {
    userScholarshipService.update(entryId, { notes: val }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }).catch(() => {});
  }, [entryId]);

  const onChange = (val) => {
    setNotes(val);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(val), 800);
  };

  return (
    <div>
      <textarea
        value={notes}
        onChange={e => onChange(e.target.value)}
        placeholder="Add notes…"
        rows={3}
        style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)",
          fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none",
          boxSizing: "border-box", lineHeight: 1.6, color: "var(--ink)", background: "var(--paper-2)" }}
      />
      {saved && <div style={{ fontSize: 11, color: "var(--green-deep)", marginTop: 3 }}>Saved</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Recommended Tab
// ─────────────────────────────────────────────────────────────
function RecommendedTab({ entryMap, onToggleSave, onOpen, onStatusChange, isAuth }) {
  const [items,           setItems]           = useState([]);
  const [profileComplete, setProfileComplete] = useState(true);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);

  useEffect(() => {
    if (!isAuth) { setLoading(false); return; }
    scholarshipService.getRecommended()
      .then(r => {
        setItems(r.data.results || []);
        setProfileComplete(r.data.profile_complete !== false);
      })
      .catch(e => setError(e.response?.status === 401 ? 'auth' : 'error'))
      .finally(() => setLoading(false));
  }, [isAuth]);

  if (!isAuth) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)" }}>
        <Icon.Sparkles size={40} color="var(--line)"/>
        <p style={{ marginTop: 18, fontSize: 15, fontWeight: 600, color: "var(--ink-2)" }}>Sign in to see recommendations</p>
        <p style={{ marginTop: 6, fontSize: 13 }}>Log in and complete your profile to get personalised scholarship matches.</p>
      </div>
    );
  }

  if (loading) return <SkeletonGrid/>;

  if (error === 'auth') {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--ink-4)" }}>
        <Icon.Sparkles size={40} color="var(--line)"/>
        <p style={{ marginTop: 18, fontSize: 14 }}>Please sign in to view recommendations.</p>
      </div>
    );
  }

  return (
    <div>
      {!profileComplete && (
        <div style={{ padding: "14px 18px", background: "#fffbeb", border: "1px solid #fde68a",
          borderRadius: 10, marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <Icon.AlertCircle size={16} color="#d97706"/>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#92400e", fontSize: 13 }}>Profile incomplete</div>
            <div style={{ fontSize: 12.5, color: "#b45309", marginTop: 2 }}>
              Add research interests and degree level to your profile for better matches.
            </div>
          </div>
          <a href="/app/profile" style={{ fontSize: 12, fontWeight: 600, color: "#d97706",
            background: "none", border: "1px solid #fde68a", borderRadius: 7,
            padding: "5px 12px", textDecoration: "none", flexShrink: 0 }}>
            Edit Profile →
          </a>
        </div>
      )}

      {items.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
          {items.map(s => (
            <ScholarshipCard key={s.id} s={s}
              saved={!!entryMap[s.id]}
              userEntry={entryMap[s.id] || null}
              onToggleSave={onToggleSave}
              onOpen={onOpen}
              matchScore={s.match_score}
              matchReasons={s.match_reasons}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--ink-4)" }}>
          <Icon.Sparkles size={32} color="var(--line)"/>
          <p style={{ marginTop: 16, fontSize: 14 }}>No recommendations yet. Complete your profile first.</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────
const TABS = [
  { id: 'browse',      label: 'Browse' },
  { id: 'myapps',      label: 'My Applications' },
  { id: 'recommended', label: 'Recommended ✨' },
];

export default function Scholarships() {
  const [activeTab,   setActiveTab]   = useState('browse');
  const [entries,     setEntries]     = useState([]);   // UserScholarship[]
  const [detail,      setDetail]      = useState(null);

  const isAuth = !!localStorage.getItem('auth_token');

  // Load user's tracked scholarships
  const refreshEntries = useCallback(() => {
    if (!isAuth) return;
    userScholarshipService.getAll()
      .then(r => setEntries(r.data.results || r.data || []))
      .catch(() => {});
  }, [isAuth]);

  useEffect(() => { refreshEntries(); }, [refreshEntries]);

  // Build map: scholarship_id → UserScholarship entry
  const entryMap = {};
  entries.forEach(e => {
    if (e.scholarship) entryMap[e.scholarship.id] = e;
  });

  // Toggle save — API or localStorage fallback
  const [localSaved, setLocalSaved] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('scholarship-saves') || '[]')); } catch { return new Set(); }
  });

  const handleToggleSave = async (scholarshipId) => {
    if (!isAuth) {
      setLocalSaved(prev => {
        const n = new Set(prev);
        n.has(scholarshipId) ? n.delete(scholarshipId) : n.add(scholarshipId);
        try { localStorage.setItem('scholarship-saves', JSON.stringify([...n])); } catch {}
        return n;
      });
      return;
    }
    try {
      await userScholarshipService.toggle(scholarshipId);
      refreshEntries();
    } catch {}
  };

  const isSaved = (id) => isAuth ? !!entryMap[id] : localSaved.has(id);

  const handleStatusChange = async (entryId, newStatus) => {
    try {
      await userScholarshipService.update(entryId, { status: newStatus });
      setEntries(prev => prev.map(e => e.id === entryId ? { ...e, status: newStatus } : e));
    } catch {}
  };

  const handleRemove = async (entryId) => {
    try {
      await userScholarshipService.remove(entryId);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch {}
  };

  // When drawer is open and entry changes, update detail
  const drawerEntry = detail ? (entryMap[detail.id] || null) : null;

  return (
    <div style={{ height: "100%", overflow: "auto", background: "var(--paper-2)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 28px 60px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>
              Scholarships & Fellowships
            </h1>
            <p style={{ color: "var(--ink-4)", marginTop: 5, fontSize: 13.5 }}>
              Curated funding opportunities for graduate research worldwide.
            </p>
          </div>
          {isAuth && entries.length > 0 && (
            <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
              <div style={{ textAlign: "center", padding: "10px 16px", background: "white",
                borderRadius: 10, border: "1px solid var(--line)", minWidth: 72 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{entries.length}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 1 }}>Tracking</div>
              </div>
              <div style={{ textAlign: "center", padding: "10px 16px", background: "white",
                borderRadius: 10, border: "1px solid var(--line)", minWidth: 72 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#16a34a" }}>
                  {entries.filter(e => e.status === 'awarded').length}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 1 }}>Awarded</div>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 2, padding: 4, background: "var(--paper-3)", borderRadius: 11,
          width: "fit-content", marginBottom: 24, border: "1px solid var(--line)" }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13.5, fontWeight: activeTab === tab.id ? 700 : 400,
                background: activeTab === tab.id ? "white" : "transparent",
                color: activeTab === tab.id ? "var(--ink)" : "var(--ink-3)",
                boxShadow: activeTab === tab.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                transition: "all 0.12s", whiteSpace: "nowrap" }}>
              {tab.label}
              {tab.id === 'myapps' && isAuth && entries.length > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, padding: "1px 7px",
                  borderRadius: 20, background: "var(--green-soft)", color: "var(--green-deep)" }}>
                  {entries.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'browse' && (
          <BrowseTab
            entryMap={entryMap}
            onToggleSave={handleToggleSave}
            onOpen={setDetail}
            onStatusChange={handleStatusChange}
          />
        )}
        {activeTab === 'myapps' && (
          <MyAppsTab
            entries={entries}
            onOpen={setDetail}
            onStatusChange={handleStatusChange}
            onRemove={handleRemove}
            isAuth={isAuth}
          />
        )}
        {activeTab === 'recommended' && (
          <RecommendedTab
            entryMap={entryMap}
            onToggleSave={handleToggleSave}
            onOpen={setDetail}
            onStatusChange={handleStatusChange}
            isAuth={isAuth}
          />
        )}
      </div>

      {detail && (
        <ScholarshipDrawer
          s={detail}
          onClose={() => setDetail(null)}
          saved={isSaved(detail.id)}
          onToggleSave={handleToggleSave}
          userEntry={drawerEntry}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
