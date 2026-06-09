import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Icon } from '../components/Icons';
import { professors, DEFAULT_CV } from '../data';
import { cvService, userDocumentService } from '../services/api';

function useBreakpoint() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return { isMobile: width < 640, isTablet: width >= 640 && width < 1024, isDesktop: width >= 1024 };
}

// ─────────────────────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────────────────────
const LBL = {
  fontSize: 11, fontWeight: 600, color: "var(--ink-3)",
  textTransform: "uppercase", letterSpacing: "0.06em",
  marginBottom: 4, display: "block",
};
const INP = {
  padding: "9px 11px", borderRadius: 7, border: "1px solid var(--line)",
  fontSize: 13.5, width: "100%", boxSizing: "border-box",
  background: "white", outline: "none", fontFamily: "inherit",
  transition: "border-color 0.12s, box-shadow 0.12s",
};
const focusOn  = e => { e.target.style.borderColor = "var(--green-deep)"; e.target.style.boxShadow = "0 0 0 3px rgba(0,110,70,0.09)"; };
const focusOff = e => { e.target.style.borderColor = "var(--line)"; e.target.style.boxShadow = "none"; };

// ─── Export utilities ────────────────────────────────────────
function escH(s = '') {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escLatex(s = '') {
  return String(s || '')
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&').replace(/%/g, '\\%').replace(/\$/g, '\\$')
    .replace(/#/g, '\\#').replace(/_/g, '\\_')
    .replace(/\{/g, '\\{').replace(/\}/g, '\\}')
    .replace(/\^/g, '\\^{}').replace(/~/g, '\\textasciitilde{}');
}
function downloadFile(content, filename, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}
function buildPrintHtml(cv, template = 'classic') {
  const isM = template === 'modern', isN = template === 'minimal';
  const ff  = (isM || isN) ? "'Helvetica Neue',Arial,sans-serif" : "Georgia,'Times New Roman',serif";
  const hdrCss = isM
    ? `h1{font-size:22pt;font-weight:700;letter-spacing:-0.02em;margin:0 0 4px}
       .contact{font-size:9.5pt;color:#555;display:flex;flex-wrap:wrap;gap:0 12px}
       .hdr{border-bottom:3px solid #1d4ed8;padding-bottom:12px;margin-bottom:16px}`
    : isN
    ? `h1{font-size:18pt;font-weight:300;letter-spacing:0.06em;text-transform:uppercase;margin:0 0 6px}
       .contact{font-size:9pt;color:#999;letter-spacing:0.04em;text-align:center}
       .hdr{text-align:center;border-bottom:1px solid #ddd;padding-bottom:14px;margin-bottom:18px}`
    : `h1{font-size:17pt;font-weight:700;margin:0 0 4px}
       .contact{font-size:9.5pt;color:#555}
       .hdr{text-align:center;margin-bottom:14px}`;
  const secTitle = isM
    ? `section>h2{font-size:9pt;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#1d4ed8;border-bottom:2px solid #1d4ed8;padding-bottom:2px;margin:14px 0 6px}`
    : isN
    ? `section>h2{font-size:8.5pt;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#aaa;margin:16px 0 7px}`
    : `section>h2{font-size:9pt;text-transform:uppercase;letter-spacing:0.1em;font-weight:700;border-bottom:1px solid #111;padding-bottom:2px;margin:13px 0 6px}`;
  const contactParts = [cv.email, cv.phone, cv.website, cv.github].filter(Boolean);
  const renderContact = () =>
    isN ? `<div class="contact">${escH(contactParts.join('   ·   '))}</div>`
        : isM ? `<div class="contact">${contactParts.map(p => `<span>${escH(p)}</span>`).join('')}</div>`
        : `<div class="contact">${escH(contactParts.join(' · '))}</div>`;
  const sec = (title, inner) => inner ? `<section><h2>${escH(title)}</h2>${inner}</section>` : '';
  const edHtml = cv.education.map(e =>
    `<div class="entry"><div class="row"><strong>${escH(e.school)}</strong><span class="date">${escH(e.dates)}</span></div>
    <div class="sub">${escH(e.degree)}${e.gpa ? ` · GPA ${escH(e.gpa)}` : ''}</div>
    ${e.notes ? `<div class="note">${escH(e.notes)}</div>` : ''}</div>`).join('');
  const resHtml = cv.research.map(r =>
    `<div class="entry"><div class="row"><strong>${escH(r.role)}</strong><span class="date">${escH(r.dates)}</span></div>
    <div class="sub">${escH(r.lab)}${r.advisor ? ` · Advisor: ${escH(r.advisor)}` : ''}</div>
    ${r.bullets.filter(Boolean).length ? `<ul>${r.bullets.filter(Boolean).map(b => `<li>${escH(b)}</li>`).join('')}</ul>` : ''}</div>`).join('');
  const pubHtml = cv.publications.map((p, i) =>
    `<div class="entry">${i+1}. <strong>${escH(p.title)}</strong>. ${escH(p.authors)}. <em>${escH(p.venue)}</em>, ${escH(p.year)}.${p.link ? ` ${escH(p.link)}` : ''}</div>`).join('');
  const awardHtml = cv.awards.map(a =>
    `<div class="row"><span>${escH(a.name)}${a.note ? ` — ${escH(a.note)}` : ''}</span><span class="date">${escH(a.year)}</span></div>`).join('');
  const skillHtml = Object.entries(cv.skills || {}).filter(([,v]) => v)
    .map(([cat, val]) => `<div><strong>${escH(cat)}:</strong> ${escH(val)}</div>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${escH(cv.name || 'CV')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:${ff};font-size:10.5pt;line-height:1.52;color:#111;padding:18mm 20mm}
  ${hdrCss} ${secTitle}
  .entry{margin-bottom:7px} .row{display:flex;justify-content:space-between;align-items:baseline}
  .sub{color:#444;font-style:${isM||isN?'normal':'italic'}} .date{color:#666;font-size:9pt;flex-shrink:0;margin-left:6px}
  .note{font-size:9pt;color:#555;margin-top:2px} ul{margin:3px 0 0 16px;padding:0} li{margin-bottom:2px} p{margin-bottom:10px}
  @media print{body{padding:0}@page{margin:18mm 20mm;size:letter}}
</style></head><body>
<div class="hdr"><h1>${escH(cv.name || 'Your Name')}</h1>${renderContact()}</div>
${cv.summary ? sec('Research Summary', `<p>${escH(cv.summary)}</p>`) : ''}
${cv.education.length ? sec('Education', edHtml) : ''}
${cv.research.length ? sec('Research Experience', resHtml) : ''}
${cv.publications.length ? sec('Publications', pubHtml) : ''}
${cv.awards.length ? sec('Honors & Awards', awardHtml) : ''}
${skillHtml ? sec('Technical Skills', skillHtml) : ''}
${cv.spoken && cv.spoken.length ? sec('Languages', `<p>${escH(cv.spoken.join(' · '))}</p>`) : ''}
</body></html>`;
}
function buildLatex(cv) {
  const e = escLatex;
  const contactParts = [cv.email, cv.phone, cv.website, cv.github].filter(Boolean);
  const edLines = cv.education.map(ed =>
    `  \\textbf{${e(ed.school)}} \\hfill ${e(ed.dates)} \\\\\n  \\textit{${e(ed.degree)}}${ed.gpa ? ` -- GPA ${e(ed.gpa)}` : ''}${ed.notes ? `\\\\\n  ${e(ed.notes)}` : ''}\n  \\vspace{4pt}`).join('\n\n');
  const resLines = cv.research.map(r => {
    const bls = r.bullets.filter(Boolean);
    return `  \\textbf{${e(r.role)}} \\hfill ${e(r.dates)} \\\\\n  \\textit{${e(r.lab)}}${r.advisor ? ` -- Advisor: ${e(r.advisor)}` : ''}${bls.length ? `\n  \\begin{itemize}[noitemsep,topsep=2pt]\n${bls.map(b => `    \\item ${e(b)}`).join('\n')}\n  \\end{itemize}` : ''}\n  \\vspace{4pt}`;
  }).join('\n\n');
  const pubLines = cv.publications.map((p, i) =>
    `  \\item[{[${i+1}]}] \\textbf{${e(p.title)}}. ${e(p.authors)}. \\textit{${e(p.venue)}}, ${e(p.year)}.${p.link ? ` \\url{${p.link}}` : ''}`).join('\n');
  const awardLines = cv.awards.map(a =>
    `  ${e(a.name)}${a.note ? ` -- ${e(a.note)}` : ''} \\hfill ${e(a.year)} \\\\`).join('\n');
  const skillLines = Object.entries(cv.skills || {}).filter(([,v]) => v)
    .map(([cat, val]) => `  \\textbf{${e(cat)}:} ${e(val)} \\\\`).join('\n');
  return `\\documentclass[letterpaper,11pt]{article}
\\usepackage[margin=1in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{parskip}
\\setlength{\\parskip}{0pt}

\\newcommand{\\CVSection}[1]{\\vspace{8pt}{\\large\\textbf{#1}}\\hrulefill\\vspace{2pt}\\par}

\\begin{document}

\\begin{center}
  {\\LARGE\\textbf{${e(cv.name || 'Your Name')}}}\\\\[4pt]
  ${contactParts.map(p => `\\texttt{${e(p)}}`).join(' $\\cdot$ ')}
\\end{center}
${cv.summary ? `\n\\CVSection{Research Summary}\n${e(cv.summary)}\n` : ''}${cv.education.length ? `\n\\CVSection{Education}\n${edLines}\n` : ''}${cv.research.length ? `\n\\CVSection{Research Experience}\n${resLines}\n` : ''}${cv.publications.length ? `\n\\CVSection{Publications}\n\\begin{enumerate}[label={[\\arabic*]},leftmargin=*,noitemsep]\n${pubLines}\n\\end{enumerate}\n` : ''}${cv.awards.length ? `\n\\CVSection{Honors \\& Awards}\n${awardLines}\n` : ''}${skillLines ? `\n\\CVSection{Technical Skills}\n${skillLines}\n` : ''}${cv.spoken && cv.spoken.length ? `\n\\CVSection{Languages}\n${e(cv.spoken.join(', '))}\n` : ''}
\\end{document}
`;
}
function printCV(cv, template) {
  const w = window.open('', '_blank');
  if (!w) { alert('Allow pop-ups to export as PDF'); return; }
  w.document.write(buildPrintHtml(cv, template));
  w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 400);
}

// ─────────────────────────────────────────────────────────────
// Form primitives
// ─────────────────────────────────────────────────────────────
function Inp({ label, value, onChange, placeholder, hint, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={LBL}>{label}</label>}
      <input type={type} style={INP} value={value || ""} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} onFocus={focusOn} onBlur={focusOff}/>
      {hint && <span style={{ fontSize: 11, color: "var(--ink-4)", lineHeight: 1.4 }}>{hint}</span>}
    </div>
  );
}

function TA({ label, value, onChange, placeholder, rows = 3, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={LBL}>{label}</label>}
      <textarea style={{ ...INP, resize: "vertical" }} value={value || ""}
        onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        onFocus={focusOn} onBlur={focusOff}/>
      {hint && <span style={{ fontSize: 11, color: "var(--ink-4)", lineHeight: 1.4 }}>{hint}</span>}
    </div>
  );
}

function G2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}

function BulletList({ bullets, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={LBL}>Key contributions</label>
      {bullets.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "var(--ink-4)", fontSize: 18, lineHeight: "36px", userSelect: "none", flexShrink: 0, marginTop: -1 }}>·</span>
          <input style={{ ...INP, flex: 1, padding: "7px 10px" }} value={b}
            onChange={e => onChange(bullets.map((x, j) => j === i ? e.target.value : x))}
            placeholder={`Contribution #${i + 1}…`} onFocus={focusOn} onBlur={focusOff}/>
          <button onClick={() => onChange(bullets.filter((_, j) => j !== i))}
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: 4, display: "flex", flexShrink: 0 }}>
            <Icon.X size={11}/>
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...bullets, ""])}
        style={{ marginTop: 2, padding: "6px 10px", borderRadius: 6, border: "1px dashed var(--line)", background: "none",
          cursor: "pointer", fontSize: 12.5, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 4, alignSelf: "flex-start" }}>
        <Icon.Plus size={11}/> Add bullet
      </button>
    </div>
  );
}

function AddBtn({ children, onClick }) {
  return (
    <button onClick={onClick}
      style={{ width: "100%", padding: "9px 14px", borderRadius: 8, border: "1.5px dashed var(--line)", background: "transparent",
        cursor: "pointer", fontSize: 13, color: "var(--ink-3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
      onMouseOver={e => { e.currentTarget.style.borderColor = "var(--green-deep)"; e.currentTarget.style.color = "var(--green-deep)"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = "var(--line)"; e.currentTarget.style.color = "var(--ink-3)"; }}>
      <Icon.Plus size={12}/> {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Completion ring (SVG)
// ─────────────────────────────────────────────────────────────
function CompletionRing({ pct }) {
  const r = 13, c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);
  const color = pct >= 80 ? "var(--green-deep)" : pct >= 40 ? "#f59e0b" : "var(--line)";
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      <circle cx="20" cy="20" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3"/>
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={c.toFixed(1)} strokeDashoffset={off.toFixed(1)}
        strokeLinecap="round" transform="rotate(-90 20 20)"
        style={{ transition: "stroke-dashoffset 0.45s, stroke 0.3s" }}/>
      <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
        style={{ fontSize: "9.5px", fontWeight: 700, fill: "var(--ink-2)", fontFamily: "system-ui" }}>
        {pct}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Collapsible repeat block
// ─────────────────────────────────────────────────────────────
function RepeatBlock({ summary, onRemove, children }) {
  const [open, setOpen] = useState(!summary);
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 9, overflow: "hidden", marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", padding: "10px 12px", background: open ? "white" : "var(--paper-2)",
          gap: 8, cursor: "pointer", userSelect: "none" }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: summary ? 500 : 400, color: summary ? "var(--ink)" : "var(--ink-4)" }}>
          {summary || <span style={{ fontStyle: "italic" }}>Untitled entry</span>}
        </span>
        <div style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", display: "flex", flexShrink: 0 }}>
          <Icon.ChevronDown size={13} color="var(--ink-3)"/>
        </div>
        <button onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: "2px 3px", display: "flex", flexShrink: 0, borderRadius: 4 }}
          onMouseOver={e => e.currentTarget.style.color = "var(--red)"}
          onMouseOut={e => e.currentTarget.style.color = "var(--ink-4)"}>
          <Icon.X size={12}/>
        </button>
      </div>
      {open && (
        <div style={{ padding: "16px 14px 18px", borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 13 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section navigation
// ─────────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "personal",   label: "Personal",      icon: "User"     },
  { id: "education",  label: "Education",     icon: "Book"     },
  { id: "research",   label: "Research",      icon: "Sparkles" },
  { id: "pubs",       label: "Publications",  icon: "Trend"    },
  { id: "awards",     label: "Awards",        icon: "Award"    },
  { id: "skills",     label: "Skills",        icon: "Settings" },
];

function sectionDot(id, cv) {
  switch (id) {
    case "personal":  return cv.name && cv.email ? "full" : cv.name ? "part" : "empty";
    case "education": return cv.education.length >= 2 ? "full" : cv.education.length === 1 ? "part" : "empty";
    case "research":  return cv.research.length >= 2 ? "full" : cv.research.length === 1 ? "part" : "empty";
    case "pubs":      return cv.publications.length >= 1 ? "full" : "empty";
    case "awards":    return cv.awards.length >= 1 ? "full" : "empty";
    case "skills":    return Object.values(cv.skills || {}).some(v => v) ? "full" : "empty";
    default:          return "empty";
  }
}

function sectionCount(id, cv) {
  if (id === "education")  return cv.education.length    || null;
  if (id === "research")   return cv.research.length     || null;
  if (id === "pubs")       return cv.publications.length || null;
  if (id === "awards")     return cv.awards.length       || null;
  return null;
}

// ─────────────────────────────────────────────────────────────
// Version picker dropdown
// ─────────────────────────────────────────────────────────────
const LABEL_COLORS = { Master: "var(--green-deep)", Tailored: "#2563eb", Variant: "#9333ea" };

function VersionPicker({ versions, currentId, setCurrentId, onNew, onRename, onDuplicate }) {
  const [open, setOpen] = useState(false);
  const cur = versions.find(v => v.id === currentId) || versions[0];
  // No versions yet (API still loading) — show a placeholder
  if (!cur) return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px",
      borderRadius: 8, border: "1px solid var(--line)", background: "var(--paper-2)",
      fontSize: 13, color: "var(--ink-4)" }}>
      <button onClick={onNew} className="btn btn-sm" style={{ fontSize: 12 }}>
        <Icon.Plus size={11}/> Create your first CV
      </button>
    </div>
  );
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)}
        style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 10px",
          borderRadius: 8, border: "1px solid var(--line)", background: "var(--paper-2)",
          cursor: "pointer", fontSize: 13, fontWeight: 500, maxWidth: "100%" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: LABEL_COLORS[cur.label] || "var(--ink-3)", flexShrink: 0 }}/>
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cur.name}</span>
        <span style={{ fontSize: 11, color: "var(--ink-4)", flexShrink: 0 }}>{cur.updatedAt}</span>
        <div style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", display: "flex" }}>
          <Icon.ChevronDown size={12} color="var(--ink-3)"/>
        </div>
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }}/>
          <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, zIndex: 21,
            background: "white", border: "1px solid var(--line)", borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" }}>
            {versions.map(v => (
              <div key={v.id} onClick={() => { setCurrentId(v.id); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", cursor: "pointer",
                  background: v.id === currentId ? "var(--green-soft)" : "white",
                  borderBottom: "1px solid var(--line)" }}
                onMouseOver={e => { if (v.id !== currentId) e.currentTarget.style.background = "var(--paper-2)"; }}
                onMouseOut={e => { if (v.id !== currentId) e.currentTarget.style.background = "white"; }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: LABEL_COLORS[v.label] || "var(--ink-3)", flexShrink: 0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.name}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-4)" }}>Updated {v.updatedAt}</div>
                </div>
                {v.id === currentId && <Icon.Check size={12} color="var(--green-deep)"/>}
              </div>
            ))}
            <div style={{ display: "flex", padding: "6px 6px 6px", gap: 4, background: "var(--paper-2)" }}>
              <button onClick={() => { onNew(); setOpen(false); }} className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 12 }}>
                <Icon.Plus size={11}/> New
              </button>
              <button onClick={() => { onDuplicate(); setOpen(false); }} className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 12 }}>
                Duplicate
              </button>
              <button onClick={() => { onRename(); setOpen(false); }} className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: "center", fontSize: 12 }}>
                Rename
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CV Preview templates
// ─────────────────────────────────────────────────────────────
function PreviewSection({ title, template, children }) {
  if (template === "modern") return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
        color: "#1d4ed8", borderBottom: "2px solid #1d4ed8", paddingBottom: 3, marginBottom: 7 }}>
        {title}
      </div>
      {children}
    </div>
  );
  if (template === "minimal") return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase",
        color: "#aaa", marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700,
        borderBottom: "1px solid #111", marginBottom: 6, paddingBottom: 2 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function CVPreview({ cv, template = "classic" }) {
  const sans  = "system-ui,-apple-system,'Helvetica Neue',sans-serif";
  const serif = "Georgia,'Times New Roman',serif";
  const isM = template === "modern", isN = template === "minimal";
  const ff  = (isM || isN) ? sans : serif;
  const fsz = isN ? 11.5 : 11;
  const lh  = isN ? 1.65 : 1.5;
  const pad = isM ? "30px 34px" : "36px 36px";

  return (
    <div style={{ fontFamily: ff, fontSize: fsz, lineHeight: lh, color: "#111", padding: pad, maxWidth: 680, boxSizing: "border-box" }}>

      {/* Header */}
      {isM ? (
        <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "3px solid #1d4ed8" }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>{cv.name || "Your Name"}</div>
          <div style={{ fontSize: 10.5, marginTop: 5, color: "#555", display: "flex", flexWrap: "wrap", gap: "0 14px" }}>
            {[cv.email, cv.phone, cv.website, cv.github].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
          </div>
        </div>
      ) : isN ? (
        <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #ddd" }}>
          <div style={{ fontSize: 19, fontWeight: 300, letterSpacing: "0.06em", textTransform: "uppercase" }}>{cv.name || "Your Name"}</div>
          <div style={{ fontSize: 10, marginTop: 7, color: "#999", letterSpacing: "0.05em" }}>
            {[cv.email, cv.phone, cv.website, cv.github].filter(Boolean).join("   ·   ")}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>{cv.name || "Your Name"}</div>
          <div style={{ fontSize: 10, marginTop: 4, color: "#555" }}>
            {[cv.email, cv.phone, cv.website, cv.github].filter(Boolean).join(" · ")}
          </div>
        </div>
      )}

      {cv.summary && (
        <PreviewSection title="Research Summary" template={template}>
          <p style={{ margin: 0, lineHeight: lh }}>{cv.summary}</p>
        </PreviewSection>
      )}

      {cv.education.length > 0 && (
        <PreviewSection title="Education" template={template}>
          {cv.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700 }}>{e.school}</span>
                <span style={{ color: "#666", fontSize: 10 }}>{e.dates}</span>
              </div>
              <div style={{ fontStyle: isM || isN ? "normal" : "italic", color: "#444" }}>
                {e.degree}{e.gpa ? ` · GPA ${e.gpa}` : ""}
              </div>
              {e.notes && <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{e.notes}</div>}
            </div>
          ))}
        </PreviewSection>
      )}

      {cv.research.length > 0 && (
        <PreviewSection title="Research Experience" template={template}>
          {cv.research.map((r, i) => (
            <div key={i} style={{ marginBottom: 9 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700 }}>{r.role}</span>
                <span style={{ color: "#666", fontSize: 10 }}>{r.dates}</span>
              </div>
              <div style={{ fontStyle: isM || isN ? "normal" : "italic", color: "#444" }}>
                {r.lab}{r.advisor ? ` · Advisor: ${r.advisor}` : ""}
              </div>
              {r.bullets.filter(Boolean).length > 0 && (
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  {r.bullets.filter(Boolean).map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </PreviewSection>
      )}

      {cv.publications.length > 0 && (
        <PreviewSection title="Publications" template={template}>
          {cv.publications.map((p, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              {isM || isN
                ? <div>{i + 1}. <strong>{p.title}</strong>. {p.authors}. <em>{p.venue}</em>, {p.year}.{p.link ? <span style={{ color: "#555" }}> {p.link}</span> : ""}</div>
                : <div><strong>{p.title}.</strong><br/><span style={{ color: "#444" }}>{p.authors}. <em>{p.venue}</em>, {p.year}.{p.link ? <span style={{ color: "#666" }}> [{p.link}]</span> : ""}</span></div>
              }
            </div>
          ))}
        </PreviewSection>
      )}

      {cv.awards.length > 0 && (
        <PreviewSection title="Honors & Awards" template={template}>
          {cv.awards.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
              <span>{a.name}{a.note ? ` — ${a.note}` : ""}</span>
              <span style={{ color: "#666", fontSize: 10, flexShrink: 0, marginLeft: 8 }}>{a.year}</span>
            </div>
          ))}
        </PreviewSection>
      )}

      {Object.keys(cv.skills || {}).length > 0 && (
        <PreviewSection title="Technical Skills" template={template}>
          {Object.entries(cv.skills).map(([cat, val]) => val ? (
            <div key={cat} style={{ marginBottom: 3 }}>
              <span style={{ fontWeight: 700 }}>{cat}: </span><span>{val}</span>
            </div>
          ) : null)}
        </PreviewSection>
      )}

      {cv.spoken && cv.spoken.length > 0 && (
        <PreviewSection title="Languages" template={template}>
          <p style={{ margin: 0 }}>{cv.spoken.join(" · ")}</p>
        </PreviewSection>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section form panels
// ─────────────────────────────────────────────────────────────
function PersonalForm({ cv, setCV }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <G2>
        <Inp label="Full name" value={cv.name} onChange={v => setCV({ ...cv, name: v })} placeholder="Alex Chen"/>
        <Inp label="Email" value={cv.email} onChange={v => setCV({ ...cv, email: v })} placeholder="alex@univ.edu"/>
        <Inp label="Phone" value={cv.phone} onChange={v => setCV({ ...cv, phone: v })} placeholder="+1 (206) 555-0123"/>
        <Inp label="Location" value={cv.address} onChange={v => setCV({ ...cv, address: v })} placeholder="Seattle, WA"/>
        <Inp label="Website" value={cv.website} onChange={v => setCV({ ...cv, website: v })} placeholder="alexchen.dev"/>
        <Inp label="GitHub" value={cv.github} onChange={v => setCV({ ...cv, github: v })} placeholder="github.com/alexchen"/>
      </G2>
      <Inp label="Google Scholar" value={cv.scholar} onChange={v => setCV({ ...cv, scholar: v })} placeholder="scholar.google.com/citations?user=…"/>
      <TA label="Research summary" value={cv.summary} onChange={v => setCV({ ...cv, summary: v })}
        placeholder="2–3 sentences: what problem do you study, how, and what have you achieved?"
        rows={3} hint="Appears at the top of your CV. Be specific — name methods, datasets, or results."/>
      <div>
        <label style={{ ...LBL, marginBottom: 8 }}>Additional links</label>
        {(cv.links || []).map((lk, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input style={{ ...INP, width: 110 }} placeholder="Label" value={lk.label}
              onChange={e => setCV({ ...cv, links: (cv.links||[]).map((x,j) => j===i ? {...x, label: e.target.value} : x) })}
              onFocus={focusOn} onBlur={focusOff}/>
            <input style={{ ...INP, flex: 1 }} placeholder="https://…" value={lk.url}
              onChange={e => setCV({ ...cv, links: (cv.links||[]).map((x,j) => j===i ? {...x, url: e.target.value} : x) })}
              onFocus={focusOn} onBlur={focusOff}/>
            <button onClick={() => setCV({ ...cv, links: (cv.links||[]).filter((_,j) => j!==i) })}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-4)", padding: 4 }}>
              <Icon.X size={11}/>
            </button>
          </div>
        ))}
        <button onClick={() => setCV({ ...cv, links: [...(cv.links||[]), { label: "", url: "" }] })}
          style={{ padding: "6px 10px", borderRadius: 6, border: "1px dashed var(--line)", background: "none",
            cursor: "pointer", fontSize: 12.5, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 4 }}>
          <Icon.Plus size={11}/> Add link
        </button>
      </div>
    </div>
  );
}

function EducationForm({ cv, setCV }) {
  const upd = (i, patch) => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, ...patch } : x) });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {cv.education.map((e, i) => (
        <RepeatBlock key={i} summary={e.school ? `${e.school}${e.degree ? " · " + e.degree : ""}` : ""}
          onRemove={() => setCV({ ...cv, education: cv.education.filter((_, j) => j !== i) })}>
          <G2>
            <Inp label="Institution" value={e.school} placeholder="Stanford University" onChange={v => upd(i, { school: v })}/>
            <Inp label="Degree" value={e.degree} placeholder="Ph.D. Computer Science" onChange={v => upd(i, { degree: v })}/>
            <Inp label="Dates" value={e.dates} placeholder="Sept 2021 – Present" onChange={v => upd(i, { dates: v })}/>
            <Inp label="GPA" value={e.gpa || ""} placeholder="3.95 / 4.0" onChange={v => upd(i, { gpa: v })}/>
          </G2>
          <TA label="Notes / Distinctions" value={e.notes || ""} onChange={v => upd(i, { notes: v })}
            placeholder="Thesis topic · Advisor · Honors…" rows={2}/>
        </RepeatBlock>
      ))}
      <AddBtn onClick={() => setCV({ ...cv, education: [...cv.education, { school: "", degree: "", dates: "", gpa: "", notes: "" }] })}>
        Add institution
      </AddBtn>
    </div>
  );
}

function ResearchForm({ cv, setCV }) {
  const upd = (i, patch) => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, ...patch } : x) });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {cv.research.map((r, i) => (
        <RepeatBlock key={i} summary={r.role ? `${r.role}${r.lab ? " · " + r.lab : ""}` : ""}
          onRemove={() => setCV({ ...cv, research: cv.research.filter((_, j) => j !== i) })}>
          <G2>
            <Inp label="Role / Title" value={r.role} placeholder="Research Assistant" onChange={v => upd(i, { role: v })}/>
            <Inp label="Lab / Group" value={r.lab} placeholder="NLP Lab" onChange={v => upd(i, { lab: v })}/>
            <Inp label="Advisor" value={r.advisor || ""} placeholder="Prof. Smith" onChange={v => upd(i, { advisor: v })}/>
            <Inp label="Dates" value={r.dates} placeholder="June 2022 – Aug 2023" onChange={v => upd(i, { dates: v })}/>
          </G2>
          <BulletList bullets={r.bullets || []}
            onChange={bs => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, bullets: bs } : x) })}/>
        </RepeatBlock>
      ))}
      <AddBtn onClick={() => setCV({ ...cv, research: [...cv.research, { role: "", lab: "", dates: "", advisor: "", bullets: [""] }] })}>
        Add research position
      </AddBtn>
    </div>
  );
}

function PublicationsForm({ cv, setCV }) {
  const upd = (i, patch) => setCV({ ...cv, publications: cv.publications.map((x, j) => j === i ? { ...x, ...patch } : x) });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {cv.publications.map((p, i) => (
        <RepeatBlock key={i} summary={p.title ? p.title.slice(0, 55) + (p.title.length > 55 ? "…" : "") : ""}
          onRemove={() => setCV({ ...cv, publications: cv.publications.filter((_, j) => j !== i) })}>
          <Inp label="Title" value={p.title} placeholder="Attention Is All You Need" onChange={v => upd(i, { title: v })}/>
          <Inp label="Authors" value={p.authors} placeholder="Chen A, Smith B, et al." onChange={v => upd(i, { authors: v })}/>
          <G2>
            <Inp label="Venue" value={p.venue} placeholder="NeurIPS 2024" onChange={v => upd(i, { venue: v })}/>
            <Inp label="Year" value={p.year} placeholder="2024" onChange={v => upd(i, { year: v })}/>
          </G2>
          <Inp label="arXiv / DOI" value={p.link || ""} placeholder="arxiv.org/abs/2401.00001" onChange={v => upd(i, { link: v })}/>
        </RepeatBlock>
      ))}
      <AddBtn onClick={() => setCV({ ...cv, publications: [...cv.publications, { authors: "", title: "", venue: "", year: "", link: "" }] })}>
        Add publication
      </AddBtn>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px",
        background: "var(--green-soft)", borderRadius: 8, fontSize: 12, color: "var(--green-deep)", marginTop: 2 }}>
        <Icon.Sparkles size={12}/>
        <span style={{ flex: 1 }}>Connect Google Scholar to auto-import publications.</span>
        <button className="btn btn-sm">Connect</button>
      </div>
    </div>
  );
}

function AwardsForm({ cv, setCV }) {
  const upd = (i, patch) => setCV({ ...cv, awards: cv.awards.map((x, j) => j === i ? { ...x, ...patch } : x) });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {cv.awards.map((a, i) => (
        <RepeatBlock key={i} summary={a.name ? `${a.name}${a.year ? " (" + a.year + ")" : ""}` : ""}
          onRemove={() => setCV({ ...cv, awards: cv.awards.filter((_, j) => j !== i) })}>
          <G2>
            <Inp label="Award name" value={a.name} placeholder="NSF Graduate Fellowship" onChange={v => upd(i, { name: v })}/>
            <Inp label="Year" value={a.year} placeholder="2024" onChange={v => upd(i, { year: v })}/>
          </G2>
          <Inp label="Organization / note" value={a.note || ""} placeholder="National Science Foundation"
            onChange={v => upd(i, { note: v })}/>
        </RepeatBlock>
      ))}
      <AddBtn onClick={() => setCV({ ...cv, awards: [...cv.awards, { name: "", year: "", note: "" }] })}>
        Add award
      </AddBtn>
    </div>
  );
}

function SkillsForm({ cv, setCV }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(cv.skills || {}).map(([cat, val]) => (
        <Inp key={cat} label={cat} value={val}
          onChange={v => setCV({ ...cv, skills: { ...cv.skills, [cat]: v } })}
          placeholder="Python, PyTorch, TensorFlow, JAX…"/>
      ))}
      <TA label="Spoken languages" value={(cv.spoken || []).join(", ")}
        onChange={v => setCV({ ...cv, spoken: v.split(",").map(s => s.trim()).filter(Boolean) })}
        placeholder="English (native), Mandarin (fluent), French (conversational)"
        rows={2} hint="Separate languages with commas"/>
    </div>
  );
}

const SECTION_FORMS = {
  personal:  (cv, setCV) => <PersonalForm cv={cv} setCV={setCV}/>,
  education: (cv, setCV) => <EducationForm cv={cv} setCV={setCV}/>,
  research:  (cv, setCV) => <ResearchForm cv={cv} setCV={setCV}/>,
  pubs:      (cv, setCV) => <PublicationsForm cv={cv} setCV={setCV}/>,
  awards:    (cv, setCV) => <AwardsForm cv={cv} setCV={setCV}/>,
  skills:    (cv, setCV) => <SkillsForm cv={cv} setCV={setCV}/>,
};

// ─────────────────────────────────────────────────────────────
// CV Maker — main
// ─────────────────────────────────────────────────────────────
const TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern",  label: "Modern"  },
  { id: "minimal", label: "Minimal" },
];

// ─────────────────────────────────────────────────────────────
// Generic Export Modal  (used by both CV and SOP)
// ─────────────────────────────────────────────────────────────
function ExportModal({ badge, filename, onClose, children }) {
  const contentRef = useRef(null);
  const [dlState, setDlState] = useState('idle');

  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: filename || badge || 'Document',
    pageStyle: `@page { margin: 0.75in; size: letter; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`,
  });

  const handleDownload = async () => {
    if (!contentRef.current || dlState === 'generating') return;
    setDlState('generating');
    try {
      const canvas = await html2canvas(contentRef.current, {
        scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff', allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf   = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
      const pageW = pdf.internal.pageSize.getWidth();
      const nativeW = (canvas.width  / 2) * 0.75;
      const nativeH = (canvas.height / 2) * 0.75;
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, nativeH * (pageW / nativeW));
      pdf.save(`${(filename || 'document').replace(/\s+/g, '_')}.pdf`);
      setDlState('done');
      setTimeout(() => setDlState('idle'), 2000);
    } catch (err) {
      console.error('PDF export error:', err);
      alert(`PDF export failed: ${err.message || err}`);
      setDlState('idle');
    }
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const btn = { display: "flex", alignItems: "center", gap: 6, cursor: "pointer", borderRadius: 8, fontSize: 13, fontWeight: 600 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div style={{ flexShrink: 0, height: 54, background: "white", borderBottom: "1px solid var(--line)",
        display: "flex", alignItems: "center", padding: "0 18px", gap: 10, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <button onClick={onClose}
          style={{ ...btn, background: "none", border: "1px solid transparent", color: "var(--ink-3)", padding: "6px 10px", fontWeight: 400 }}
          onMouseOver={e => { e.currentTarget.style.background = "var(--paper-2)"; e.currentTarget.style.borderColor = "var(--line)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "transparent"; }}>
          <Icon.Chevron size={14} style={{ transform: "rotate(180deg)" }}/> Back
        </button>
        <div style={{ width: 1, height: 20, background: "var(--line)", flexShrink: 0 }}/>
        <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>Export Preview</span>
        {badge && (
          <span style={{ fontSize: 11.5, padding: "2px 9px", borderRadius: 20,
            background: "var(--paper-3)", border: "1px solid var(--line)", color: "var(--ink-3)", fontWeight: 500 }}>
            {badge}
          </span>
        )}
        <div style={{ flex: 1 }}/>
        <button onClick={handleDownload} disabled={dlState === 'generating'}
          style={{ ...btn, background: "var(--ink)", color: "white", border: "none",
            padding: "8px 18px", opacity: dlState === 'generating' ? 0.65 : 1, transition: "opacity 0.12s" }}
          onMouseOver={e => { if (dlState !== 'generating') e.currentTarget.style.opacity = "0.85"; }}
          onMouseOut={e => e.currentTarget.style.opacity = dlState === 'generating' ? "0.65" : "1"}>
          {dlState === 'generating'
            ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }}/> Generating…</>
            : dlState === 'done' ? <><Icon.Check size={14}/> Downloaded!</>
            : <><Icon.Download size={14}/> Download PDF</>}
        </button>
        <button onClick={reactToPrintFn}
          style={{ ...btn, background: "none", border: "1px solid var(--line)", color: "var(--ink-2)", padding: "8px 16px" }}
          onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
          onMouseOut={e => e.currentTarget.style.background = "none"}>
          <Icon.Printer size={14}/> Print
        </button>
        <button onClick={onClose}
          style={{ ...btn, background: "none", border: "1px solid var(--line)", color: "var(--ink-3)", padding: "6px 8px" }}
          onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
          onMouseOut={e => e.currentTarget.style.background = "none"}>
          <Icon.X size={14}/>
        </button>
      </div>
      {/* Canvas */}
      <div style={{ flex: 1, overflow: "auto", background: "#3d3d3d", padding: "40px 32px 60px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ background: "white", boxShadow: "0 4px 6px rgba(0,0,0,0.1), 0 16px 48px rgba(0,0,0,0.35)", minHeight: 960 }}>
            <div ref={contentRef}>{children}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 20, fontSize: 11.5, color: "#888" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Icon.Download size={12} color="#777"/>
              <strong style={{ color: "#bbb" }}>Download PDF</strong> — saves directly to your machine
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Icon.Printer size={12} color="#777"/>
              <strong style={{ color: "#bbb" }}>Print</strong> — opens print dialog
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function CVMaker({ versions, setVersions, currentId, setCurrentId }) {
  const { isMobile } = useBreakpoint();
  const [mobileTab, setMobileTab] = useState('edit'); // 'edit' | 'preview'
  const cur = versions.find(v => v.id === currentId) || versions[0];
  const cv  = cur?.data || DEFAULT_CV;

  // Debounce ref for auto-save
  const saveTimer = useRef(null);
  const isApiId   = id => typeof id === 'number' || (typeof id === 'string' && !id.startsWith('cv'));

  const setCV = next => {
    const val = typeof next === "function" ? next(cv) : next;
    setVersions(prev => prev.map(v => v.id === cur.id ? { ...v, data: val, updatedAt: "Just now" } : v));
    // Debounced persist to API
    if (isApiId(cur.id)) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        cvService.update(cur.id, { content: val }).catch(() => {});
      }, 800);
    }
  };

  const saveAsNew = async () => {
    const name = prompt("Name this version:", `Copy of ${cur?.name || 'My CV'}`);
    if (!name) return;
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const { data } = await cvService.create({ name, label: 'Variant', content: cv, template: 'classic' });
        const n = { id: data.id, name: data.name, label: data.label || 'Variant', target: data.target || '',
          data: data.content || cv, keywords: data.keywords || [], template: data.template || 'classic',
          updatedAt: 'Just now' };
        setVersions(prev => [n, ...prev]);
        setCurrentId(n.id);
      } catch {}
    } else {
      const n = { id: "cv" + Date.now(), name, updatedAt: "Just now", data: cv, label: "Variant" };
      setVersions(prev => [n, ...prev]); setCurrentId(n.id);
    }
  };

  const renameCur = async () => {
    const name = prompt("Rename version:", cur.name);
    if (!name) return;
    setVersions(prev => prev.map(v => v.id === cur.id ? { ...v, name } : v));
    if (isApiId(cur.id)) {
      cvService.update(cur.id, { name }).catch(() => {});
    }
  };

  const dupCur = async () => {
    const token = localStorage.getItem('auth_token');
    if (token && isApiId(cur.id)) {
      try {
        const { data } = await cvService.create({
          name: cur.name + " (copy)", label: cur.label || 'Variant',
          content: cv, template: cur.template || 'classic',
        });
        const n = { id: data.id, name: data.name, label: data.label || 'Variant', target: data.target || '',
          data: data.content || cv, keywords: data.keywords || [], template: data.template || 'classic',
          updatedAt: 'Just now' };
        setVersions(prev => [n, ...prev]); setCurrentId(n.id);
      } catch {}
    } else {
      const n = { ...cur, id: "cv" + Date.now(), name: cur.name + " (copy)", updatedAt: "Just now" };
      setVersions(prev => [n, ...prev]); setCurrentId(n.id);
    }
  };

  const [activeSection, setActiveSection] = useState("personal");
  const [template, setTemplate]           = useState(cur?.template || "classic");
  const [zoom, setZoom]                   = useState(100);
  const [showPDF, setShowPDF]             = useState(false);

  // Keyword extraction
  const [kwModal, setKwModal]       = useState(false);
  const [kwList, setKwList]         = useState(cur?.keywords || []);
  const [kwInput, setKwInput]       = useState('');
  const [kwLoading, setKwLoading]   = useState(false);

  // Keep kwList in sync when switching CV versions
  useEffect(() => { setKwList(cur?.keywords || []); }, [currentId]);

  const handleExtractKeywords = async () => {
    if (!isApiId(cur.id)) return;
    setKwLoading(true);
    try {
      const { data } = await cvService.extractKeywords(cur.id);
      setKwList(data.keywords || []);
      setKwModal(true);
    } catch { alert('Could not extract keywords. Please try again.'); }
    finally { setKwLoading(false); }
  };

  const handleConfirmKeywords = async () => {
    if (!isApiId(cur.id)) return;
    try {
      await cvService.update(cur.id, { keywords: kwList });
      setVersions(prev => prev.map(v => v.id === cur.id ? { ...v, keywords: kwList } : v));
      setKwModal(false);
    } catch { alert('Could not save keywords.'); }
  };

  const handleMatchProfessors = async () => {
    if (!isApiId(cur.id)) return;
    try {
      const { data } = await cvService.matchProfessors(cur.id);
      sessionStorage.setItem('cv_match_results', JSON.stringify(data));
      window.location.href = '/app/professors?cv_match=true';
    } catch { alert('Match failed. Please try again.'); }
  };

  const handleMatchScholarships = async () => {
    if (!isApiId(cur.id)) return;
    try {
      const { data } = await cvService.matchScholarships(cur.id);
      sessionStorage.setItem('cv_scholarship_match', JSON.stringify(data));
      window.location.href = '/app/scholarships?tab=recommended';
    } catch { alert('Match failed. Please try again.'); }
  };

  const doExportPDF   = () => setShowPDF(true);
  const doExportLatex = () => downloadFile(buildLatex(cv), (cv.name || 'cv').replace(/\s+/g, '_') + '.tex', 'text/x-latex');

  const completionPct = useMemo(() => {
    let filled = 0, total = 0;
    const chk = v => { total++; if (v && String(v).trim()) filled++; };
    chk(cv.name); chk(cv.email); chk(cv.summary);
    cv.education.forEach(e  => { chk(e.school); chk(e.degree); });
    cv.research.forEach(r   => { chk(r.role); chk(r.lab); chk(r.bullets.some(b => b) ? "ok" : ""); });
    chk(cv.publications.length ? "ok" : "");
    chk(cv.awards.length ? "ok" : "");
    return total ? Math.round(filled / total * 100) : 0;
  }, [cv]);

  // No CV versions yet — show a loading/empty prompt after all hooks
  if (!cur) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: 'calc(100vh - 56px)', gap: 14 }}>
      <Icon.FileText size={36} style={{ opacity: 0.25 }}/>
      <div style={{ fontSize: 15, color: 'var(--ink-3)' }}>No CV yet — create your first one.</div>
      <button className="btn btn-primary" onClick={() => {
        const name = prompt('Name your CV:', 'My CV');
        if (!name) return;
        const token = localStorage.getItem('auth_token');
        if (token) {
          cvService.create({ name, label: 'Master', content: DEFAULT_CV, template: 'classic', is_primary: true })
            .then(({ data }) => {
              const n = { id: data.id, name: data.name, label: data.label || 'Master', target: '',
                data: data.content || DEFAULT_CV, keywords: [], template: 'classic', updatedAt: 'Just now', is_primary: true };
              setVersions([n]);
              setCurrentId(n.id);
            }).catch(() => {});
        } else {
          const n = { id: 'cv' + Date.now(), name, label: 'Master', data: DEFAULT_CV, updatedAt: 'Just now' };
          setVersions([n]); setCurrentId(n.id);
        }
      }}><Icon.Plus size={13}/> Create CV</button>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(360px,410px) 1fr", height: isMobile ? "auto" : "calc(100vh - 56px)", overflow: isMobile ? "visible" : "hidden" }}>

      {/* Mobile tab switcher */}
      {isMobile && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "white" }}>
          {[['edit','Edit CV'],['preview','Preview']].map(([id,label]) => (
            <button key={id} onClick={() => setMobileTab(id)}
              style={{ flex:1, padding:"10px 0", border:0, background:"none", cursor:"pointer",
                fontSize:13, fontWeight: mobileTab===id ? 600 : 400,
                color: mobileTab===id ? "var(--ink)" : "var(--ink-4)",
                borderBottom: mobileTab===id ? "2px solid var(--ink)" : "2px solid transparent",
                marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── LEFT: editor ── */}
      <div style={{ display: isMobile && mobileTab !== 'edit' ? "none" : "flex", flexDirection: "column", borderRight: isMobile ? "none" : "1px solid var(--line)", overflow: isMobile ? "visible" : "hidden", background: "white" }}>

        {/* Header */}
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--ink)", color: "white",
              display: "grid", placeItems: "center", fontFamily: '"Instrument Serif",serif',
              fontStyle: "italic", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>C</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>CV Maker</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)" }}>
                {kwList.length > 0
                  ? <span style={{ color: 'var(--green-deep)' }}>{kwList.length} keywords · Ready to match</span>
                  : 'All changes saved'}
              </div>
            </div>
            <CompletionRing pct={completionPct}/>
          </div>
          <VersionPicker versions={versions} currentId={currentId} setCurrentId={setCurrentId}
            onNew={saveAsNew} onRename={renameCur} onDuplicate={dupCur}/>
          {/* Action row: extract keywords + match */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={handleExtractKeywords} disabled={kwLoading || !isApiId(cur?.id)}
              className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
              {kwLoading ? 'Extracting…' : <><Icon.Zap size={11}/> {kwList.length ? 'Update Keywords' : 'Extract Keywords'}</>}
            </button>
            <button onClick={handleMatchProfessors} disabled={kwList.length === 0}
              className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 11,
                background: kwList.length ? 'var(--ink)' : undefined,
                color: kwList.length ? 'white' : undefined }}>
              Match Profs
            </button>
            <button onClick={handleMatchScholarships} disabled={kwList.length === 0}
              className="btn btn-sm btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
              Match $
            </button>
          </div>
        </div>

        {/* Nav + form */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

          {/* Section nav */}
          <div style={{ width: 96, borderRight: "1px solid var(--line)", overflow: "auto",
            background: "var(--paper-2)", flexShrink: 0 }}>
            {SECTIONS.map(s => {
              const I     = Icon[s.icon];
              const dot   = sectionDot(s.id, cv);
              const cnt   = sectionCount(s.id, cv);
              const active = activeSection === s.id;
              const dotC  = dot === "full" ? "var(--green-deep)" : dot === "part" ? "#f59e0b" : "#d1d5db";
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{ width: "100%", padding: "12px 6px 10px", border: 0, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    background: active ? "white" : "transparent",
                    borderLeft: `3px solid ${active ? "var(--green-deep)" : "transparent"}`,
                    transition: "background 0.1s" }}>
                  <div style={{ position: "relative" }}>
                    {I && <I size={17} color={active ? "var(--green-deep)" : "var(--ink-3)"}/>}
                    <span style={{ position: "absolute", top: -2, right: -4, width: 6, height: 6,
                      borderRadius: "50%", background: dotC, border: "1.5px solid white" }}/>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, lineHeight: 1.2, textAlign: "center",
                    color: active ? "var(--green-deep)" : "var(--ink-3)" }}>
                    {s.label}
                  </span>
                  {cnt > 0 && (
                    <span style={{ fontSize: 9.5, color: active ? "var(--green-deep)" : "var(--ink-4)",
                      background: active ? "var(--green-soft)" : "var(--paper-3)",
                      borderRadius: 10, padding: "1px 6px", fontWeight: 500 }}>
                      {cnt}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Form content */}
          <div style={{ flex: 1, overflow: "auto", padding: "18px 16px 40px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </span>
              {(() => {
                const cnt = sectionCount(activeSection, cv);
                return cnt > 0 ? (
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", background: "var(--paper-3)",
                    borderRadius: 10, padding: "2px 8px" }}>
                    {cnt} {cnt === 1 ? "entry" : "entries"}
                  </span>
                ) : null;
              })()}
            </div>
            {SECTION_FORMS[activeSection]?.(cv, setCV)}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", background: "var(--paper-2)",
          display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={doExportPDF}><Icon.ExternalLink size={12}/> Export PDF</button>
          <button className="btn btn-sm" onClick={doExportLatex}>LaTeX</button>
          <span style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 4 }}>
            {completionPct < 100 ? `${100 - completionPct}% left to complete` : "CV complete!"}
          </span>
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }}>
            <Icon.ExternalLink size={11}/> Share
          </button>
        </div>
      </div>

      {/* ── RIGHT: preview ── */}
      <div style={{ display: isMobile && mobileTab !== 'preview' ? "none" : "flex", flexDirection: "column", overflow: isMobile ? "visible" : "hidden", background: "#c8c8c8", minHeight: isMobile ? "80vw" : undefined }}>

        {/* Controls bar */}
        <div style={{ padding: "9px 14px", background: "white", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
          {/* Template switcher */}
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase",
            letterSpacing: "0.06em" }}>Template</span>
          <div style={{ display: "flex", gap: 3, padding: 3, background: "var(--paper-2)", borderRadius: 8 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                style={{ padding: "4px 13px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 12.5, fontWeight: template === t.id ? 600 : 400,
                  background: template === t.id ? "white" : "transparent",
                  color: template === t.id ? "var(--ink)" : "var(--ink-3)",
                  boxShadow: template === t.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  transition: "all 0.12s" }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Zoom */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <button onClick={() => setZoom(z => Math.max(50, z - 8))}
              style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--line)",
                background: "white", cursor: "pointer", display: "grid", placeItems: "center",
                fontSize: 16, fontWeight: 300, lineHeight: 1, color: "var(--ink-2)" }}>
              −
            </button>
            <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500, minWidth: 38, textAlign: "center" }}>
              {zoom}%
            </span>
            <button onClick={() => setZoom(z => Math.min(160, z + 8))}
              style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--line)",
                background: "white", cursor: "pointer", display: "grid", placeItems: "center",
                fontSize: 16, fontWeight: 300, lineHeight: 1, color: "var(--ink-2)" }}>
              +
            </button>
          </div>

          <button className="btn btn-sm btn-primary" style={{ marginLeft: 4 }} onClick={doExportPDF}>
            <Icon.ExternalLink size={12}/> Export PDF
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          <div style={{ zoom: `${zoom}%`, maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)" }}>
              <CVPreview cv={cv} template={template}/>
            </div>
          </div>
        </div>
      </div>

      {showPDF && (
        <ExportModal badge={TEMPLATES.find(t => t.id === template)?.label} filename={cv.name || 'cv'} onClose={() => setShowPDF(false)}>
          <CVPreview cv={cv} template={template}/>
        </ExportModal>
      )}

      {/* ── Keyword Review Modal ── */}
      {kwModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)' }} onClick={e => { if (e.target === e.currentTarget) setKwModal(false); }}>
          <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 520, maxWidth: '95vw',
            maxHeight: '80vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>Keywords extracted from your CV</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>Remove irrelevant ones or add custom terms. These are used for professor and scholarship matching.</div>
              </div>
              <button onClick={() => setKwModal(false)} className="btn btn-sm btn-ghost"><Icon.X size={14}/></button>
            </div>
            {/* Chip list */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {kwList.map((kw, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'var(--green-soft)', border: '1px solid var(--green-deep)', borderRadius: 20,
                  padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>
                  {kw}
                  <button onClick={() => setKwList(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'var(--ink-3)' }}>×</button>
                </span>
              ))}
              {kwList.length === 0 && <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>No keywords yet — add some below.</span>}
            </div>
            {/* Add keyword */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input value={kwInput} onChange={e => setKwInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && kwInput.trim()) { setKwList(prev => [...prev, kwInput.trim()]); setKwInput(''); } }}
                placeholder="Add keyword and press Enter…"
                style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 13 }}/>
              <button onClick={() => { if (kwInput.trim()) { setKwList(prev => [...prev, kwInput.trim()]); setKwInput(''); } }}
                className="btn btn-sm">Add</button>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setKwModal(false)} className="btn btn-sm btn-ghost">Cancel</button>
              <button onClick={handleConfirmKeywords} className="btn btn-sm"
                style={{ background: 'var(--ink)', color: 'white' }}>
                Confirm & Save ({kwList.length} keywords)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SOP Maker
// ─────────────────────────────────────────────────────────────
const DEFAULT_SOP = {
  authorName: "", authorEmail: "", institution: "", program: "",
  targetProf: "", profCustom: "",
  opening: "", research: "", whyLab: "", future: "", closing: "",
};

const SOP_SECTIONS = [
  { id: "info",     label: "Setup",    icon: "User"     },
  { id: "opening",  label: "Opening",  icon: "Sparkles" },
  { id: "research", label: "Research", icon: "Trend"    },
  { id: "whylab",   label: "Why Lab",  icon: "Building" },
  { id: "future",   label: "Goals",    icon: "Star"     },
];

const SOP_TONES = [
  { id: "academic",     label: "Academic"  },
  { id: "professional", label: "Formal"    },
  { id: "personal",     label: "Personal"  },
];

function sopSectionDot(id, sop) {
  const wc = s => (s || "").split(/\s+/).filter(Boolean).length;
  switch (id) {
    case "info":     return (sop.authorName && (sop.targetProf || sop.profCustom)) ? "full" : sop.authorName ? "part" : "empty";
    case "opening":  return wc(sop.opening)  >= 80  ? "full" : wc(sop.opening)  >= 20 ? "part" : "empty";
    case "research": return wc(sop.research) >= 100 ? "full" : wc(sop.research) >= 30 ? "part" : "empty";
    case "whylab":   return wc(sop.whyLab)   >= 80  ? "full" : wc(sop.whyLab)   >= 20 ? "part" : "empty";
    case "future":   return wc(sop.future)   >= 50  ? "full" : wc(sop.future)   >= 15 ? "part" : "empty";
    default: return "empty";
  }
}

// ── Letter Preview ──────────────────────────────────────────
function SOPPreview({ sop, tone }) {
  const serif = "Georgia,'Times New Roman',serif";
  const sans  = "'Helvetica Neue',Arial,sans-serif";
  const ff    = tone === "professional" ? sans : serif;
  const lh    = tone === "academic" ? 1.92 : tone === "professional" ? 1.75 : 1.85;
  const indent = tone === "professional" ? 0 : "2em";
  const prof    = professors.find(p => String(p.id) === String(sop.targetProf));
  const profLast = prof ? prof.name.split(" ").pop() : (sop.profCustom || null);
  const greeting = profLast ? `Dear Prof. ${profLast},` : "Dear Selection Committee,";
  const today    = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const paras    = [sop.opening, sop.research, sop.whyLab, sop.future, sop.closing].filter(p => p && p.trim());
  const ph = txt => <span style={{ color: "#ccc", fontStyle: "italic" }}>{txt}</span>;
  return (
    <div style={{ fontFamily: ff, fontSize: 11.5, lineHeight: lh, color: "#111", padding: "44px 52px" }}>
      <p style={{ marginTop: 0, marginBottom: 28, fontSize: 11, color: "#555" }}>{today}</p>
      {tone === "professional" && sop.program && (
        <p style={{ margin: "0 0 14px", fontWeight: 600, fontSize: 12 }}>Re: Application — {sop.program}</p>
      )}
      <p style={{ margin: "0 0 18px" }}>{greeting}</p>
      {paras.length > 0
        ? paras.map((para, i) => (
            <p key={i} style={{ margin: "0 0 18px", lineHeight: lh, textIndent: i === 0 ? 0 : indent }}>{para}</p>
          ))
        : <>
            <p style={{ margin: "0 0 18px" }}>{ph("Your opening paragraph will appear here…")}</p>
            <p style={{ margin: "0 0 18px", textIndent: indent }}>{ph("Research background…")}</p>
            <p style={{ margin: "0 0 18px", textIndent: indent }}>{ph("Why this lab…")}</p>
          </>
      }
      <p style={{ marginTop: 28, marginBottom: 4 }}>Sincerely,</p>
      <p style={{ margin: 0, fontWeight: 700 }}>{sop.authorName || ph("Your Name")}</p>
      {(sop.institution || sop.program) && (
        <p style={{ margin: "2px 0 0", color: "#555", fontSize: 11 }}>
          {[sop.institution, sop.program].filter(Boolean).join(" · ")}
        </p>
      )}
      {sop.authorEmail && <p style={{ margin: "2px 0 0", color: "#777", fontSize: 10.5 }}>{sop.authorEmail}</p>}
    </div>
  );
}

// ── Info form ───────────────────────────────────────────────
function SOPInfoForm({ sop, setSOP }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <G2>
        <Inp label="Your full name"      value={sop.authorName}  onChange={v => setSOP({...sop, authorName: v})}  placeholder="Alex Chen"/>
        <Inp label="Email"               value={sop.authorEmail} onChange={v => setSOP({...sop, authorEmail: v})} placeholder="alex@univ.edu"/>
        <Inp label="Current institution" value={sop.institution} onChange={v => setSOP({...sop, institution: v})} placeholder="University of Washington"/>
        <Inp label="Program applying to" value={sop.program}     onChange={v => setSOP({...sop, program: v})}     placeholder="Ph.D. Computer Science"/>
      </G2>
      <div>
        <label style={LBL}>Target professor</label>
        <select style={INP} value={sop.targetProf || ""} onChange={e => setSOP({...sop, targetProf: e.target.value})}
          onFocus={focusOn} onBlur={focusOff}>
          <option value="">None / Generic letter</option>
          {professors.map(p => <option key={p.id} value={p.id}>{p.name} · {p.school}</option>)}
        </select>
      </div>
      <Inp label="Or enter professor's last name manually" value={sop.profCustom || ""}
        onChange={v => setSOP({...sop, profCustom: v})} placeholder="e.g. Smith"
        hint="Used in greeting only if no professor selected above"/>
    </div>
  );
}

// ── Paragraph form (shared for all body sections) ───────────
const SOP_PARA_META = {
  opening:  { target: 120, ph: "Explain your motivation for a PhD. What problem drives you? Be specific and personal.", tips: ["Open with your research motivation — not 'I have always been interested in…'", "Name a concrete unsolved problem that excites you", "150–200 words is ideal"] },
  research: { target: 200, ph: "Describe your strongest research experience. What did you build, discover, or prove? Use numbers.",      tips: ["Lead with your best result or contribution", "Name the method, dataset, or system you built", "Connect explicitly to the PhD you're applying for"] },
  whyLab:   { target: 150, ph: "Why this professor specifically? Cite a paper or grant. Connect your work to their open problems.",       tips: ["Name a specific paper (title + key finding)", "Mention a grant or project if you know it", "Show you've read their recent work, not just their website"] },
  future:   { target: 100, ph: "Where do you want to take your research in 5 years? What open problem will you tackle?",                 tips: ["Be ambitious but specific — not just 'improve AI'", "Connect to the lab's ongoing directions", "100–150 words is enough"] },
  closing:  { target: 50,  ph: "Optional: Thank the committee, express enthusiasm, mention any visit or upcoming conference.",            tips: ["Keep it brief — 2–3 sentences max", "Express genuine enthusiasm", "This paragraph is optional"] },
};

function SOPParaForm({ field, sop, setSOP, onGenerate, generating }) {
  const meta  = SOP_PARA_META[field];
  const value = sop[field] || "";
  const wc    = value.split(/\s+/).filter(Boolean).length;
  const pct   = Math.min(wc / meta.target * 100, 100);
  const wcCol = wc >= meta.target ? "var(--green-deep)" : wc >= meta.target * 0.5 ? "#f59e0b" : "var(--ink-4)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 3, background: "var(--line)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: wcCol, transition: "width 0.3s, background 0.3s", borderRadius: 3 }}/>
        </div>
        <span style={{ fontSize: 11, color: wcCol, fontWeight: 600, minWidth: 76, textAlign: "right", fontFamily: "var(--font-mono)" }}>
          {wc} / {meta.target} words
        </span>
      </div>
      <textarea style={{ ...INP, resize: "vertical", minHeight: 164 }} value={value} rows={9}
        onChange={e => setSOP({...sop, [field]: e.target.value})}
        placeholder={meta.ph} onFocus={focusOn} onBlur={focusOff}/>
      {/* Draft with AI */}
      <button onClick={() => onGenerate(field)} disabled={generating}
        style={{ padding: "8px 14px", borderRadius: 8, border: "none", cursor: generating ? "not-allowed" : "pointer",
          background: "var(--green-soft)", color: "var(--green-deep)", fontSize: 12.5, fontWeight: 600,
          display: "flex", alignItems: "center", gap: 6, opacity: generating ? 0.65 : 1,
          alignSelf: "flex-start", transition: "opacity 0.12s" }}>
        <Icon.Sparkles size={13}/>
        {generating ? "Generating…" : "Draft with AI"}
      </button>
      {/* Tips */}
      <div style={{ padding: "10px 13px", background: "var(--paper-3)", borderRadius: 9, fontSize: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--ink-2)", marginBottom: 6 }}>
          <Icon.Sparkles size={11} color="var(--green-hi)"/> Writing tips
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, color: "var(--ink-3)", lineHeight: 1.85 }}>
          {meta.tips.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </div>
    </div>
  );
}

// ── Main SOPMaker ───────────────────────────────────────────
function SOPMaker({ versions, setVersions, currentId, setCurrentId }) {
  const cur = versions.find(v => v.id === currentId) || versions[0];
  const sop = cur?.data || DEFAULT_SOP;

  const setSOP = next => {
    const val = typeof next === "function" ? next(sop) : next;
    setVersions(versions.map(v => v.id === cur.id ? { ...v, data: val, updatedAt: "Just now" } : v));
  };

  const saveAsNew = () => {
    const name = prompt("Name this version:", `Copy of ${cur.name}`);
    if (!name) return;
    const n = { id: "sop" + Date.now(), name, updatedAt: "Just now", data: sop, label: "Tailored" };
    setVersions([n, ...versions]); setCurrentId(n.id);
  };
  const renameCur = () => {
    const name = prompt("Rename:", cur.name);
    if (!name) return;
    setVersions(versions.map(v => v.id === cur.id ? { ...v, name } : v));
  };
  const dupCur = () => {
    const n = { ...cur, id: "sop" + Date.now(), name: cur.name + " (copy)", updatedAt: "Just now" };
    setVersions([n, ...versions]); setCurrentId(n.id);
  };

  const { isMobile } = useBreakpoint();
  const [mobileTab, setMobileTab]         = useState("edit");
  const [activeSection, setActiveSection] = useState("info");
  const [tone, setTone]                   = useState("academic");
  const [zoom, setZoom]                   = useState(100);
  const [showPDF, setShowPDF]             = useState(false);
  const [generating, setGenerating]       = useState(false);

  const wordCount = useMemo(() =>
    ["opening", "research", "whyLab", "future", "closing"]
      .reduce((s, k) => s + (sop[k] || "").split(/\s+/).filter(Boolean).length, 0),
    [sop]
  );
  const TARGET_WORDS = 650;
  const wordPct = Math.min(Math.round(wordCount / TARGET_WORDS * 100), 100);
  const toneName = SOP_TONES.find(t => t.id === tone)?.label || "Academic";

  const onGenerate = () => { setGenerating(true); setTimeout(() => setGenerating(false), 1800); };

  return (
    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(360px,410px) 1fr", height: isMobile ? "auto" : "calc(100vh - 56px)", overflow: isMobile ? "visible" : "hidden" }}>

      {/* Mobile tab switcher */}
      {isMobile && (
        <div style={{ display: "flex", borderBottom: "1px solid var(--line)", background: "white" }}>
          {[['edit','Edit SOP'],['preview','Preview']].map(([id,label]) => (
            <button key={id} onClick={() => setMobileTab(id)}
              style={{ flex:1, padding:"10px 0", border:0, background:"none", cursor:"pointer",
                fontSize:13, fontWeight: mobileTab===id ? 600 : 400,
                color: mobileTab===id ? "var(--ink)" : "var(--ink-4)",
                borderBottom: mobileTab===id ? "2px solid var(--ink)" : "2px solid transparent",
                marginBottom:-1 }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── LEFT: editor ── */}
      <div style={{ display: isMobile && mobileTab !== 'edit' ? "none" : "flex", flexDirection: "column", borderRight: isMobile ? "none" : "1px solid var(--line)", overflow: isMobile ? "visible" : "hidden", background: "white" }}>

        {/* Header */}
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--green-deep)", color: "white",
              display: "grid", placeItems: "center", fontFamily: '"Instrument Serif",serif',
              fontStyle: "italic", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>S</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: "-0.01em" }}>SOP Maker</div>
              <div style={{ fontSize: 11, color: "var(--ink-4)" }}>All changes saved</div>
            </div>
            <CompletionRing pct={wordPct}/>
          </div>
          <VersionPicker versions={versions} currentId={currentId} setCurrentId={setCurrentId}
            onNew={saveAsNew} onRename={renameCur} onDuplicate={dupCur}/>
        </div>

        {/* Section nav + form */}
        <div style={{ flex: 1, overflow: isMobile ? "visible" : "hidden", display: "flex" }}>

          {/* Section nav */}
          <div style={{ width: 96, borderRight: "1px solid var(--line)", overflow: "auto", background: "var(--paper-2)", flexShrink: 0 }}>
            {SOP_SECTIONS.map(s => {
              const I      = Icon[s.icon];
              const dot    = sopSectionDot(s.id, sop);
              const active = activeSection === s.id;
              const dotC   = dot === "full" ? "var(--green-deep)" : dot === "part" ? "#f59e0b" : "#d1d5db";
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  style={{ width: "100%", padding: "12px 6px 10px", border: 0, cursor: "pointer",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    background: active ? "white" : "transparent",
                    borderLeft: `3px solid ${active ? "var(--green-deep)" : "transparent"}`,
                    transition: "background 0.1s" }}>
                  <div style={{ position: "relative" }}>
                    {I && <I size={17} color={active ? "var(--green-deep)" : "var(--ink-3)"}/>}
                    <span style={{ position: "absolute", top: -2, right: -4, width: 6, height: 6,
                      borderRadius: "50%", background: dotC, border: "1.5px solid white" }}/>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 400, lineHeight: 1.2,
                    textAlign: "center", color: active ? "var(--green-deep)" : "var(--ink-3)" }}>
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Form content */}
          <div style={{ flex: 1, overflow: "auto", padding: "18px 16px 40px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 18 }}>
              {SOP_SECTIONS.find(s => s.id === activeSection)?.label}
            </div>
            {activeSection === "info"
              ? <SOPInfoForm sop={sop} setSOP={setSOP}/>
              : <SOPParaForm
                  field={activeSection === "whylab" ? "whyLab" : activeSection}
                  sop={sop} setSOP={setSOP} onGenerate={onGenerate} generating={generating}/>
            }
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "10px 14px", borderTop: "1px solid var(--line)", background: "var(--paper-2)",
          display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowPDF(true)}>
            <Icon.ExternalLink size={12}/> Export PDF
          </button>
          <span style={{ fontSize: 11, color: wordCount >= TARGET_WORDS ? "var(--green-deep)" : "var(--ink-4)", fontFamily: "var(--font-mono)", marginLeft: 4 }}>
            {wordCount} / {TARGET_WORDS} words
          </span>
          <button className="btn btn-sm btn-ghost" style={{ marginLeft: "auto" }}>
            <Icon.ExternalLink size={11}/> Share
          </button>
        </div>
      </div>

      {/* ── RIGHT: preview ── */}
      <div style={{ display: isMobile && mobileTab !== 'preview' ? "none" : "flex", flexDirection: "column", overflow: isMobile ? "visible" : "hidden", background: "#c8c8c8" }}>

        {/* Controls bar */}
        <div style={{ padding: isMobile ? "9px 12px" : "9px 18px", background: "white", borderBottom: "1px solid var(--line)",
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Tone</span>
          <div style={{ display: "flex", gap: 3, padding: 3, background: "var(--paper-2)", borderRadius: 8 }}>
            {SOP_TONES.map(t => (
              <button key={t.id} onClick={() => setTone(t.id)}
                style={{ padding: "4px 13px", borderRadius: 6, border: "none", cursor: "pointer",
                  fontSize: 12.5, fontWeight: tone === t.id ? 600 : 400,
                  background: tone === t.id ? "white" : "transparent",
                  color: tone === t.id ? "var(--ink)" : "var(--ink-3)",
                  boxShadow: tone === t.id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                  transition: "all 0.12s" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
            <button onClick={() => setZoom(z => Math.max(50, z - 8))}
              style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--line)", background: "white",
                cursor: "pointer", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 300, color: "var(--ink-2)" }}>−</button>
            <span style={{ fontSize: 12, color: "var(--ink-2)", fontWeight: 500, minWidth: 38, textAlign: "center" }}>{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(160, z + 8))}
              style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid var(--line)", background: "white",
                cursor: "pointer", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 300, color: "var(--ink-2)" }}>+</button>
          </div>
          <button className="btn btn-sm btn-primary" style={{ marginLeft: 4 }} onClick={() => setShowPDF(true)}>
            <Icon.ExternalLink size={12}/> Export PDF
          </button>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          <div style={{ zoom: `${zoom}%`, maxWidth: 680, margin: "0 auto" }}>
            <div style={{ background: "white", boxShadow: "0 8px 40px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.1)" }}>
              <SOPPreview sop={sop} tone={tone}/>
            </div>
          </div>
        </div>
      </div>

      {showPDF && (
        <ExportModal badge={toneName} filename={sop.authorName ? `${sop.authorName}_SOP` : 'sop'} onClose={() => setShowPDF(false)}>
          <SOPPreview sop={sop} tone={tone}/>
        </ExportModal>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// All documents
// ─────────────────────────────────────────────────────────────
const DOC_FILTER_PILLS = [
  { id: 'all',        label: 'All' },
  { id: 'cv',         label: 'CV' },
  { id: 'sop',        label: 'SOP' },
  { id: 'transcript', label: 'Transcript' },
  { id: 'rec_letter', label: 'Rec Letter' },
  { id: 'other',      label: 'Other' },
];

const DOC_TYPE_LABELS = {
  cv: 'CV', sop: 'SOP', transcript: 'Transcript',
  rec_letter: 'Rec Letter', other: 'Other',
};

function AllDocs({ go, cvVersions, setCvVersions, sopVersions, setSopVersions, setCurrentCvId, setCurrentSopId }) {
  const { isMobile, isTablet } = useBreakpoint();
  const [uploads, setUploads]         = useState([]);
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [uploading, setUploading]     = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadName, setUploadName]   = useState('');
  const [uploadType, setUploadType]   = useState('other');
  const [uploadTarget, setUploadTarget] = useState('');
  const [uploadFile, setUploadFile]   = useState(null);
  const fileRef = useRef(null);

  // Load uploaded docs on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    userDocumentService.getAll().then(({ data }) => {
      setUploads(data.results || data || []);
    }).catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('name', uploadName || uploadFile.name);
      fd.append('doc_type', uploadType);
      fd.append('target', uploadTarget);
      const { data } = await userDocumentService.upload(fd);
      setUploads(prev => [data, ...prev]);
      setUploadModal(false);
      setUploadName(''); setUploadType('other'); setUploadTarget(''); setUploadFile(null);
    } catch { alert('Upload failed. Please try again.'); }
    finally { setUploading(false); }
  };

  const handleDeleteUpload = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    await userDocumentService.remove(id).catch(() => {});
    setUploads(prev => prev.filter(u => u.id !== id));
  };

  // Combine all items into a unified list
  const allItems = [
    ...cvVersions.map(v => ({ ...v, _kind: 'cv',  _type: 'cv',  _display: v.name })),
    ...sopVersions.map(v => ({ ...v, _kind: 'sop', _type: 'sop', _display: v.name })),
    ...uploads.map(u => ({ ...u, _kind: 'upload', _type: u.doc_type, _display: u.name })),
  ];

  const visible = allItems.filter(item => {
    const matchFilter = filter === 'all' || item._type === filter;
    const matchSearch = !search || item._display.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const total = cvVersions.length + sopVersions.length + uploads.length;

  return (
    <div style={{ padding: isMobile ? "16px" : isTablet ? "20px 24px" : "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 24 : 30, letterSpacing: "-0.025em" }}>Documents</h1>
          <p style={{ color: "var(--ink-3)", marginTop: 6, fontSize: 14 }}>
            {total} document{total !== 1 ? 's' : ''} — CVs, SOPs, and uploaded files.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={() => setUploadModal(true)}><Icon.Upload size={13}/> Upload File</button>
          <button className="btn" onClick={() => go("cv")}><Icon.Plus size={13}/> New CV</button>
          <button className="btn btn-primary" onClick={() => go("sop")}><Icon.Sparkles size={13}/> New SOP</button>
        </div>
      </div>

      {/* Filter + search bar */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
        {DOC_FILTER_PILLS.map(p => (
          <button key={p.id} onClick={() => setFilter(p.id)}
            className={"chip" + (filter === p.id ? " selected" : "")} style={{ padding: "5px 12px" }}>
            {p.label}
          </button>
        ))}
        <div style={{ flex: 1, minWidth: 180, position: 'relative', maxWidth: 280 }}>
          <Icon.Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            style={{ width: '100%', padding: '6px 10px 6px 28px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 13, boxSizing: 'border-box' }}/>
        </div>
      </div>

      {/* Document grid */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--ink-4)' }}>
          <Icon.FileText size={32} style={{ opacity: 0.3, marginBottom: 12 }}/>
          <div style={{ fontSize: 14 }}>No documents found.</div>
          {filter !== 'all' && <button className="btn btn-sm btn-ghost" style={{ marginTop: 10 }} onClick={() => setFilter('all')}>Show all</button>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {visible.map(item => {
            if (item._kind === 'cv') return (
              <div key={'cv-' + item.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--ink)", color: "white",
                    display: "grid", placeItems: "center", fontFamily: '"Instrument Serif",serif',
                    fontStyle: "italic", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>C</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>CV · {item.label || 'Version'}</div>
                  </div>
                </div>
                {item.target && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 6 }}>For: {item.target}</div>}
                {item.keywords?.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--green-deep)', marginBottom: 8 }}>{item.keywords.length} keywords</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 12 }}>Updated {item.updatedAt}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => { setCurrentCvId(item.id); go("cv"); }}>Edit</button>
                </div>
              </div>
            );
            if (item._kind === 'sop') return (
              <div key={'sop-' + item.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: "var(--green-soft)",
                    display: "grid", placeItems: "center", fontFamily: '"Instrument Serif",serif',
                    fontStyle: "italic", fontSize: 15, fontWeight: 700, color: "var(--green-deep)", flexShrink: 0 }}>S</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>SOP · {item.label || 'Version'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 12 }}>Updated {item.updatedAt}</div>
                <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setCurrentSopId(item.id); go("sop"); }}>Edit</button>
              </div>
            );
            // Uploaded file
            return (
              <div key={'upload-' + item.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f3f4f6',
                    display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon.Paperclip size={16} color="var(--ink-3)"/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{DOC_TYPE_LABELS[item.doc_type] || item.doc_type}</div>
                  </div>
                </div>
                {item.target && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 6 }}>For: {item.target}</div>}
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 12 }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.file_url && (
                    <a href={item.file_url} download target="_blank" rel="noreferrer"
                      className="btn btn-sm" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>
                      <Icon.Download size={11}/> Download
                    </a>
                  )}
                  <button onClick={() => handleDeleteUpload(item.id)}
                    className="btn btn-sm btn-ghost" style={{ color: '#ef4444' }}>
                    <Icon.Trash size={11}/>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload modal */}
      {uploadModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.4)' }} onClick={e => { if (e.target === e.currentTarget) setUploadModal(false); }}>
          <div style={{ background: 'white', borderRadius: 14, padding: 24, width: 440, maxWidth: '95vw',
            boxShadow: '0 24px 60px rgba(0,0,0,0.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Upload File</div>
              <button onClick={() => setUploadModal(false)} className="btn btn-sm btn-ghost"><Icon.X size={14}/></button>
            </div>
            {/* Drop zone */}
            <div onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--line)', borderRadius: 10, padding: '24px 16px',
                textAlign: 'center', cursor: 'pointer', marginBottom: 14,
                background: uploadFile ? 'var(--green-soft)' : 'var(--paper-2)' }}>
              <input ref={fileRef} type="file" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) { setUploadFile(f); setUploadName(prev => prev || f.name); } }}/>
              {uploadFile
                ? <div style={{ fontSize: 13, color: 'var(--green-deep)', fontWeight: 500 }}>{uploadFile.name}</div>
                : <><Icon.Upload size={20} style={{ opacity: 0.4, marginBottom: 8 }}/><div style={{ fontSize: 13, color: 'var(--ink-4)' }}>Click to select a file</div></>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="Document name"
                style={{ padding: '8px 11px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 13 }}/>
              <select value={uploadType} onChange={e => setUploadType(e.target.value)}
                style={{ padding: '8px 11px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 13 }}>
                {DOC_FILTER_PILLS.filter(p => p.id !== 'all').map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
              <input value={uploadTarget} onChange={e => setUploadTarget(e.target.value)} placeholder="For: (e.g. MIT application)"
                style={{ padding: '8px 11px', border: '1px solid var(--line)', borderRadius: 7, fontSize: 13 }}/>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <button onClick={() => setUploadModal(false)} className="btn btn-sm btn-ghost">Cancel</button>
              <button onClick={handleUpload} disabled={!uploadFile || uploading}
                className="btn btn-sm" style={{ background: 'var(--ink)', color: 'white' }}>
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────
export default function Documents({ view, go, cvVersions, setCvVersions, currentCvId, setCurrentCvId, sopVersions, setSopVersions, currentSopId, setCurrentSopId }) {
  if (view === "cv")   return <CVMaker  versions={cvVersions}  setVersions={setCvVersions}  currentId={currentCvId}  setCurrentId={setCurrentCvId}/>;
  if (view === "sop")  return <SOPMaker go={go} versions={sopVersions} setVersions={setSopVersions} currentId={currentSopId} setCurrentId={setCurrentSopId}/>;
  if (view === "docs") return <AllDocs  go={go} cvVersions={cvVersions} setCvVersions={setCvVersions} sopVersions={sopVersions} setSopVersions={setSopVersions} setCurrentCvId={setCurrentCvId} setCurrentSopId={setCurrentSopId}/>;
  return null;
}
