import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../components/Icons';
import { userService, authService } from '../services/api';
import { INTERESTS } from '../data';

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
// Constants
// ─────────────────────────────────────────────────────────────
const DEGREE_TYPES = [
  "Bachelor's", "Master's", "PhD", "Associate's",
  "Diploma", "Certificate", "Other",
];

const TEST_TYPES = [
  { id: "ielts",    label: "IELTS",              hint: "0 – 9 band"     },
  { id: "toefl",    label: "TOEFL iBT",          hint: "0 – 120 pts"    },
  { id: "duolingo", label: "Duolingo English",   hint: "10 – 160 pts"   },
  { id: "pte",      label: "PTE Academic",       hint: "10 – 90 pts"    },
  { id: "gre_v",    label: "GRE Verbal",         hint: "130 – 170 pts"  },
  { id: "gre_q",    label: "GRE Quantitative",   hint: "130 – 170 pts"  },
  { id: "gre_awa",  label: "GRE AWA",            hint: "0 – 6 pts"      },
  { id: "sat",      label: "SAT",                hint: "400 – 1600 pts" },
  { id: "act",      label: "ACT",                hint: "1 – 36 pts"     },
  { id: "gmat",     label: "GMAT",               hint: "200 – 800 pts"  },
  { id: "other",    label: "Other",              hint: ""               },
];

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh",
  "Belgium","Brazil","Canada","Chile","China","Colombia","Czech Republic","Denmark",
  "Egypt","Ethiopia","Finland","France","Germany","Ghana","Greece","Hungary","India",
  "Indonesia","Iran","Iraq","Ireland","Israel","Italy","Japan","Jordan","Kenya",
  "South Korea","Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria",
  "Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia",
  "Saudi Arabia","Singapore","South Africa","Spain","Sri Lanka","Sudan","Sweden",
  "Switzerland","Taiwan","Thailand","Turkey","Uganda","Ukraine","United Kingdom",
  "United States","Venezuela","Vietnam","Other",
];

const GPA_SCALES = ["4.0", "5.0", "7.0", "10.0", "100"];

const TARGET_DEGREES  = ["PhD", "Master's", "Postdoc", "Research Fellowship", "Bachelor's"];
const TARGET_INTAKES  = [
  "Fall 2025","Spring 2026","Fall 2026","Spring 2027","Fall 2027","Spring 2028",
];

const DEFAULT_PROFILE = {
  name:              '',
  personalEmail:     '',
  eduEmail:          '',
  phone:             '',
  dob:               '',
  city:              '',
  country:           '',
  targetDegree:      'PhD',
  targetStart:       '',
  researchStatement: '',
  researchKeywords:  '',
  tests:             [],
  education:         [],
  selectedInterests: [],
  locationPrefs:     [],
  fundedOnly:        false,
  acceptingOnly:     false,
};

// Map backend desired_degree to the UI target degree label
const DB_DEGREE_TO_UI = { phd: 'PhD', masters: "Master's", postdoc: 'Postdoc' };
const UI_DEGREE_TO_DB = { 'PhD': 'phd', "Master's": 'masters', 'Postdoc': 'postdoc' };

function apiToProfile(apiData) {
  const pd = apiData.profile_data || {};
  return {
    ...DEFAULT_PROFILE,
    name:              pd.name              || apiData.user_name || '',
    personalEmail:     pd.personalEmail     || apiData.user_email || '',
    eduEmail:          pd.eduEmail          || '',
    phone:             pd.phone             || '',
    dob:               pd.dob               || '',
    city:              pd.city              || '',
    country:           pd.country           || '',
    targetDegree:      DB_DEGREE_TO_UI[apiData.desired_degree] || pd.targetDegree || 'PhD',
    targetStart:       pd.targetStart       || '',
    researchStatement: pd.researchStatement || '',
    researchKeywords:  pd.researchKeywords  || '',
    tests:             pd.tests             || [],
    education:         pd.education         || [],
    // Match preferences — research_interests stores structured IDs, location_preferences countries
    selectedInterests: Array.isArray(apiData.research_interests) ? apiData.research_interests : [],
    locationPrefs:     Array.isArray(apiData.location_preferences) ? apiData.location_preferences : [],
    fundedOnly:        pd.fundedOnly    || false,
    acceptingOnly:     pd.acceptingOnly || false,
  };
}

function profileToApi(profile) {
  return {
    desired_degree:        UI_DEGREE_TO_DB[profile.targetDegree] || 'phd',
    research_interests:    profile.selectedInterests || [],
    location_preferences:  profile.locationPrefs || [],
    profile_data: {
      name:              profile.name,
      personalEmail:     profile.personalEmail,
      eduEmail:          profile.eduEmail,
      phone:             profile.phone,
      dob:               profile.dob,
      city:              profile.city,
      country:           profile.country,
      targetDegree:      profile.targetDegree,
      targetStart:       profile.targetStart,
      researchStatement: profile.researchStatement,
      researchKeywords:  profile.researchKeywords,
      tests:             profile.tests,
      education:         profile.education,
      fundedOnly:        profile.fundedOnly,
      acceptingOnly:     profile.acceptingOnly,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Shared style tokens
// ─────────────────────────────────────────────────────────────
const INP = {
  width: "100%", padding: "8px 11px", borderRadius: 8,
  border: "1px solid var(--line)", fontSize: 13.5,
  fontFamily: "inherit", color: "var(--ink)", outline: "none",
  background: "white", boxSizing: "border-box",
};
const SEL  = { ...INP, cursor: "pointer", appearance: "auto" };
const LABEL = {
  fontSize: 11, fontWeight: 700, color: "var(--ink-4)",
  textTransform: "uppercase", letterSpacing: "0.07em",
  marginBottom: 5, display: "block",
};

// ─────────────────────────────────────────────────────────────
// Profile completeness widget
// ─────────────────────────────────────────────────────────────
function ProfileCompleteness({ profile, avatarUrl }) {
  const checks = [
    { label: "Full name",              done: !!profile.name },
    { label: "Profile photo",          done: !!avatarUrl },
    { label: "Education history",      done: (profile.education || []).length > 0 },
    { label: "Research interests",     done: (profile.selectedInterests || []).length >= 1,
      tip: "Match Preferences section" },
    { label: "Target countries",       done: (profile.locationPrefs || []).length > 0,
      tip: "Match Preferences section" },
    { label: "Target degree & intake", done: !!(profile.targetDegree && profile.targetStart) },
    { label: "Research statement",     done: !!profile.researchStatement },
    { label: "Test scores",            done: (profile.tests || []).length > 0 },
  ];
  const done = checks.filter(c => c.done).length;
  const pct  = Math.round((done / checks.length) * 100);
  if (pct === 100) return null;
  const next     = checks.find(c => !c.done);
  const barColor = pct >= 75 ? "var(--green-deep)" : pct >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{ marginBottom: 24, padding: "16px 20px", borderRadius: 12,
      border: "1px solid var(--line)", background: "var(--paper-2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
            Profile {pct}% complete
          </div>
          {next && (
            <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
              Tip: add your <strong>{next.label.toLowerCase()}</strong>
              {next.tip ? ` (${next.tip})` : ''} to improve match quality
            </div>
          )}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: barColor, minWidth: 48, textAlign: "right" }}>
          {pct}%
        </div>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: "var(--line)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 3,
          background: barColor, transition: "width 0.4s ease" }}/>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginTop: 12 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5,
            fontSize: 11.5, color: c.done ? "var(--green-deep)" : "var(--ink-4)" }}>
            {c.done
              ? <Icon.Check size={11}/>
              : <div style={{ width: 11, height: 11, borderRadius: "50%", flexShrink: 0,
                  border: "1.5px solid #d1d5db" }}/>}
            <span style={{ textDecoration: c.done ? "line-through" : "none", opacity: c.done ? 0.55 : 1 }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Section card
// ─────────────────────────────────────────────────────────────
function Section({ title, icon, children, editing, onEdit, onSave, badge }) {
  const I = Icon[icon];
  return (
    <div style={{ background: "white", borderRadius: 14, border: "1px solid var(--line)",
      marginBottom: 16, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "15px 22px",
        borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
        {I && (
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--ink)",
            color: "white", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <I size={13}/>
          </div>
        )}
        <span style={{ fontWeight: 650, fontSize: 14, flex: 1 }}>{title}</span>
        {badge && (
          <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: "var(--green-soft)", color: "var(--green-deep)",
            border: "1px solid var(--green-soft-2, #86efac)" }}>
            {badge}
          </span>
        )}
        {editing ? (
          <button onClick={onSave}
            style={{ padding: "5px 16px", borderRadius: 7, border: "none",
              background: "var(--green-deep)", color: "white",
              fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            Save
          </button>
        ) : (
          <button onClick={onEdit}
            style={{ padding: "5px 14px", borderRadius: 7, border: "1px solid var(--line)",
              background: "white", color: "var(--ink-2)",
              fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
            Edit
          </button>
        )}
      </div>
      <div style={{ padding: "20px 22px" }}>{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Read-mode field
// ─────────────────────────────────────────────────────────────
function FieldRow({ label, value, span }) {
  return (
    <div style={{ gridColumn: span ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em",
        color: "var(--ink-4)", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: value ? "var(--ink)" : "var(--ink-4)", fontStyle: value ? "normal" : "italic" }}>
        {value || "Not set"}
      </div>
    </div>
  );
}

// Two-column grid helper
function Grid({ cols = 2, gap = "16px 24px", children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap }}>
      {children}
    </div>
  );
}

// Dashed add button
function AddBtn({ onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        width: "100%", padding: "9px 0", borderRadius: 9,
        border: "1.5px dashed var(--line-2, #d1d5db)", background: "var(--paper-2)",
        cursor: "pointer", fontSize: 13, color: "var(--ink-3)", fontFamily: "inherit",
        marginTop: 8 }}>
      <Icon.Plus size={13}/> {children}
    </button>
  );
}

// Cancel link
function CancelBtn({ onClick }) {
  return (
    <div style={{ textAlign: "right", marginTop: 14 }}>
      <button onClick={onClick}
        style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid var(--line)",
          background: "white", fontSize: 12.5, cursor: "pointer", color: "var(--ink-3)",
          fontFamily: "inherit" }}>
        Cancel
      </button>
    </div>
  );
}

// Group INTERESTS by category (stable object, computed once)
const INTERESTS_BY_CATEGORY = INTERESTS.reduce((acc, item) => {
  (acc[item.category] = acc[item.category] || []).push(item);
  return acc;
}, {});

// ─────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { isMobile, isTablet } = useBreakpoint();
  const [profile,      setProfile]      = useState(DEFAULT_PROFILE);
  const [avatarUrl,    setAvatarUrl]    = useState('');
  const [loading,      setLoading]      = useState(true);
  const [editSection,  setEditSection]  = useState(null);
  const [draft,        setDraft]        = useState({});
  const [saveError,    setSaveError]    = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError,  setAvatarError]  = useState('');
  const fileInputRef = useRef(null);

  // Load profile from API on mount
  useEffect(() => {
    userService.getProfile()
      .then(({ data }) => {
        setProfile(apiToProfile(data));
        setAvatarUrl(data.avatar_url || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarClick = () => {
    if (!avatarUploading) fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const { data } = await authService.uploadAvatar(file);
      setAvatarUrl(data.avatar_url);
    } catch (err) {
      setAvatarError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const startEdit = section => {
    setEditSection(section);
    setSaveError('');
    setDraft(JSON.parse(JSON.stringify(profile)));
  };
  const saveEdit = async () => {
    setProfile(draft);
    setEditSection(null);
    try {
      await userService.updateProfile(profileToApi(draft));
    } catch {
      setSaveError('Changes saved locally but failed to sync with server.');
    }
  };
  const cancel   = () => setEditSection(null);
  const upd      = (k, v) => setDraft(d => ({ ...d, [k]: v }));

  // ── test helpers
  const addTest    = () => setDraft(d => ({ ...d, tests: [...(d.tests || []),
    { id: Date.now().toString(), name: "ielts", score: "", regNumber: "", expiry: "" }] }));
  const updTest    = (id, k, v) => setDraft(d => ({ ...d,
    tests: d.tests.map(t => t.id === id ? { ...t, [k]: v } : t) }));
  const removeTest = id => setDraft(d => ({ ...d, tests: d.tests.filter(t => t.id !== id) }));

  // ── education helpers
  const addEdu    = () => setDraft(d => ({ ...d, education: [...(d.education || []),
    { id: Date.now().toString(), degree: "Bachelor's", field: "", institution: "",
      gpa: "", gpaScale: "4.0", startYear: "", endYear: "", current: false }] }));
  const updEdu    = (id, k, v) => setDraft(d => ({ ...d,
    education: d.education.map(e => e.id === id ? { ...e, [k]: v } : e) }));
  const removeEdu = id => setDraft(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));

  // ── match preference helpers
  const toggleInterest = id => setDraft(d => {
    const s = new Set(d.selectedInterests || []);
    s.has(id) ? s.delete(id) : s.add(id);
    return { ...d, selectedInterests: [...s] };
  });
  const addLocation = country => setDraft(d => {
    if (!country || (d.locationPrefs || []).includes(country)) return d;
    return { ...d, locationPrefs: [...(d.locationPrefs || []), country] };
  });
  const removeLocation = country => setDraft(d => ({
    ...d, locationPrefs: (d.locationPrefs || []).filter(c => c !== country),
  }));

  // ── small helper to derive initials for avatar
  const initials = (profile.name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

  if (loading) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--ink-4)", fontSize: 14 }}>
        Loading profile…
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflow: "auto" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? "16px 16px 72px" : isTablet ? "20px 24px 72px" : "28px 32px 72px" }}>

        {/* ── Page header ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 28 }}>
          {/* Clickable avatar */}
          <div
            onClick={handleAvatarClick}
            title="Click to upload a profile photo"
            style={{ position: "relative", width: 60, height: 60, flexShrink: 0,
              cursor: avatarUploading ? "wait" : "pointer" }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar"
                style={{ width: 60, height: 60, borderRadius: 16, objectFit: "cover",
                  display: "block", border: "1px solid var(--line)" }}/>
            ) : (
              <div style={{ width: 60, height: 60, borderRadius: 16, background: "var(--ink)",
                color: "white", display: "grid", placeItems: "center",
                fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {avatarUploading ? "…" : initials}
              </div>
            )}
            {/* Camera overlay on hover */}
            <div style={{ position: "absolute", inset: 0, borderRadius: 16,
              background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center",
              justifyContent: "center", opacity: 0, transition: "opacity 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}>
              <Icon.Camera size={18} color="white"/>
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }} onChange={handleFileChange}/>

          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>
              {profile.name || "Your Profile"}
            </h1>
            <p style={{ color: "var(--ink-4)", marginTop: 4, fontSize: 13.5 }}>
              Personal info, academic background, and match preferences — all used to rank professors for you.
            </p>
          </div>
        </div>

        {avatarError && (
          <div style={{ marginBottom: 14, padding: "9px 14px", borderRadius: 8,
            background: "#fff5f5", border: "1px solid #fdd", color: "#c0392b", fontSize: 13 }}>
            {avatarError}
          </div>
        )}

        {saveError && (
          <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 8,
            background: "#fff5f5", border: "1px solid #fdd", color: "#c0392b", fontSize: 13 }}>
            {saveError}
          </div>
        )}

        {/* ── Profile completeness ────────────────────────── */}
        <ProfileCompleteness profile={profile} avatarUrl={avatarUrl}/>

        {/* ══════════════════════════════════════════════════
            SECTION 1 — Personal Information
        ══════════════════════════════════════════════════ */}
        <Section title="Personal Information" icon="User"
          editing={editSection === "personal"}
          onEdit={() => startEdit("personal")}
          onSave={saveEdit}>

          {editSection === "personal" ? (
            <>
              <Grid>
                <div>
                  <label style={LABEL}>Full name</label>
                  <input style={INP} value={draft.name || ""} placeholder="Your full name"
                    onChange={e => upd("name", e.target.value)}/>
                </div>
                <div>
                  <label style={LABEL}>Date of birth</label>
                  <input style={INP} type="date" value={draft.dob || ""}
                    onChange={e => upd("dob", e.target.value)}/>
                </div>
                <div>
                  <label style={LABEL}>City</label>
                  <input style={INP} value={draft.city || ""} placeholder="e.g. Seattle"
                    onChange={e => upd("city", e.target.value)}/>
                </div>
                <div>
                  <label style={LABEL}>Country</label>
                  <select style={SEL} value={draft.country || ""}
                    onChange={e => upd("country", e.target.value)}>
                    <option value="">— Select country —</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Phone number</label>
                  <input style={INP} value={draft.phone || ""} placeholder="+1 206 555 0000"
                    onChange={e => upd("phone", e.target.value)}/>
                </div>
                <div>
                  <label style={LABEL}>Personal email</label>
                  <input style={INP} type="email" value={draft.personalEmail || ""}
                    placeholder="you@gmail.com" onChange={e => upd("personalEmail", e.target.value)}/>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={LABEL}>Institutional / education email</label>
                  <input style={INP} type="email" value={draft.eduEmail || ""}
                    placeholder="you@university.edu" onChange={e => upd("eduEmail", e.target.value)}/>
                </div>
              </Grid>
              <CancelBtn onClick={cancel}/>
            </>
          ) : (
            <Grid>
              <FieldRow label="Full name"          value={profile.name}/>
              <FieldRow label="Date of birth"      value={profile.dob
                ? new Date(profile.dob + "T12:00:00").toLocaleDateString("en-US",
                    { year: "numeric", month: "long", day: "numeric" })
                : ""}/>
              <FieldRow label="City"               value={profile.city}/>
              <FieldRow label="Country"            value={profile.country}/>
              <FieldRow label="Phone"              value={profile.phone}/>
              <FieldRow label="Personal email"     value={profile.personalEmail}/>
              <FieldRow label="Education email"    value={profile.eduEmail} span/>
            </Grid>
          )}
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — Test Scores
        ══════════════════════════════════════════════════ */}
        <Section title="Test Scores" icon="Award"
          editing={editSection === "tests"}
          onEdit={() => startEdit("tests")}
          onSave={saveEdit}>

          {editSection === "tests" ? (
            <>
              {(draft.tests || []).map((t, i) => {
                const meta = TEST_TYPES.find(x => x.id === t.name) || TEST_TYPES[TEST_TYPES.length - 1];
                return (
                  <div key={t.id} style={{ padding: "14px 16px", borderRadius: 10,
                    border: "1px solid var(--line)", marginBottom: 12,
                    background: "var(--paper-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-4)",
                        textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        Test {i + 1}
                      </span>
                      <button onClick={() => removeTest(t.id)}
                        style={{ marginLeft: "auto", background: "none", border: "none",
                          cursor: "pointer", color: "var(--ink-4)", display: "flex",
                          alignItems: "center", gap: 4, fontSize: 12, fontFamily: "inherit" }}>
                        <Icon.X size={12}/> Remove
                      </button>
                    </div>
                    <Grid>
                      <div>
                        <label style={LABEL}>Test name</label>
                        <select style={SEL} value={t.name}
                          onChange={e => updTest(t.id, "name", e.target.value)}>
                          {TEST_TYPES.map(tt => (
                            <option key={tt.id} value={tt.id}>{tt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={LABEL}>
                          Score{meta.hint ? <span style={{ fontWeight: 400, textTransform: "none",
                            letterSpacing: 0 }}> ({meta.hint})</span> : ""}
                        </label>
                        <input style={INP} value={t.score} placeholder="e.g. 7.5"
                          onChange={e => updTest(t.id, "score", e.target.value)}/>
                      </div>
                      <div>
                        <label style={LABEL}>Registration / test number</label>
                        <input style={INP} value={t.regNumber} placeholder="Optional"
                          onChange={e => updTest(t.id, "regNumber", e.target.value)}/>
                      </div>
                      <div>
                        <label style={LABEL}>Expiration date</label>
                        <input style={INP} type="date" value={t.expiry}
                          onChange={e => updTest(t.id, "expiry", e.target.value)}/>
                      </div>
                    </Grid>
                  </div>
                );
              })}
              <AddBtn onClick={addTest}>Add test score</AddBtn>
              <CancelBtn onClick={cancel}/>
            </>
          ) : (profile.tests || []).length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {profile.tests.map(t => {
                const meta    = TEST_TYPES.find(x => x.id === t.name) || { label: t.name };
                const now     = Date.now();
                const expMs   = t.expiry ? new Date(t.expiry + "T12:00:00") - now : null;
                const expired = expMs !== null && expMs < 0;
                const soon    = expMs !== null && !expired && expMs < 90 * 86400000;
                return (
                  <div key={t.id} style={{
                    padding: "14px 18px", borderRadius: 12, minWidth: 140,
                    border: `1px solid ${expired ? "#fca5a5" : soon ? "#fcd34d" : "var(--line)"}`,
                    background: expired ? "#fff5f5" : soon ? "#fffbeb" : "var(--paper-2)",
                  }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-4)",
                      textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
                      {meta.label}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
                      color: "var(--ink)", lineHeight: 1 }}>
                      {t.score || "—"}
                    </div>
                    {t.expiry && (
                      <div style={{ fontSize: 11, marginTop: 5,
                        color: expired ? "#dc2626" : soon ? "#d97706" : "var(--ink-4)" }}>
                        {expired ? "Expired" : "Exp."}{" "}
                        {new Date(t.expiry + "T12:00:00").toLocaleDateString("en-US",
                          { month: "short", year: "numeric" })}
                      </div>
                    )}
                    {t.regNumber && (
                      <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3,
                        fontFamily: "monospace" }}>
                        #{t.regNumber}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--ink-4)", fontSize: 13 }}>
              No test scores added yet. Click <strong>Edit</strong> to add IELTS, GRE, TOEFL, SAT, etc.
            </div>
          )}
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 3 — Education
        ══════════════════════════════════════════════════ */}
        <Section title="Education" icon="Book"
          editing={editSection === "education"}
          onEdit={() => startEdit("education")}
          onSave={saveEdit}>

          {editSection === "education" ? (
            <>
              {(draft.education || []).map((e, i) => (
                <div key={e.id} style={{ padding: "14px 16px", borderRadius: 10,
                  border: "1px solid var(--line)", marginBottom: 12, background: "var(--paper-2)" }}>
                  <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-4)",
                      textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Degree {i + 1}
                    </span>
                    <button onClick={() => removeEdu(e.id)}
                      style={{ marginLeft: "auto", background: "none", border: "none",
                        cursor: "pointer", color: "var(--ink-4)", display: "flex",
                        alignItems: "center", gap: 4, fontSize: 12, fontFamily: "inherit" }}>
                      <Icon.X size={12}/> Remove
                    </button>
                  </div>
                  <Grid>
                    <div>
                      <label style={LABEL}>Degree type</label>
                      <select style={SEL} value={e.degree}
                        onChange={ev => updEdu(e.id, "degree", ev.target.value)}>
                        {DEGREE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL}>Field / Major</label>
                      <input style={INP} value={e.field} placeholder="e.g. Computer Science"
                        onChange={ev => updEdu(e.id, "field", ev.target.value)}/>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={LABEL}>Institution</label>
                      <input style={INP} value={e.institution} placeholder="University name"
                        onChange={ev => updEdu(e.id, "institution", ev.target.value)}/>
                    </div>
                    <div>
                      <label style={LABEL}>GPA</label>
                      <div style={{ display: "flex", gap: 6 }}>
                        <input style={{ ...INP, flex: 1 }} value={e.gpa} placeholder="3.9"
                          onChange={ev => updEdu(e.id, "gpa", ev.target.value)}/>
                        <select style={{ ...SEL, width: 90 }} value={e.gpaScale}
                          onChange={ev => updEdu(e.id, "gpaScale", ev.target.value)}>
                          {GPA_SCALES.map(s => <option key={s} value={s}>/ {s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={LABEL}>Years</label>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input style={{ ...INP, flex: 1 }} value={e.startYear} placeholder="2020"
                          onChange={ev => updEdu(e.id, "startYear", ev.target.value)}/>
                        <span style={{ color: "var(--ink-4)", fontSize: 13, flexShrink: 0 }}>–</span>
                        <input style={{ ...INP, flex: 1 }} disabled={e.current}
                          value={e.current ? "" : e.endYear}
                          placeholder={e.current ? "Present" : "2024"}
                          onChange={ev => updEdu(e.id, "endYear", ev.target.value)}/>
                      </div>
                      <label style={{ display: "flex", alignItems: "center", gap: 7,
                        marginTop: 8, cursor: "pointer", fontSize: 12.5,
                        color: "var(--ink-3)", userSelect: "none" }}>
                        <input type="checkbox" checked={!!e.current}
                          onChange={ev => updEdu(e.id, "current", ev.target.checked)}/>
                        Currently enrolled
                      </label>
                    </div>
                  </Grid>
                </div>
              ))}
              <AddBtn onClick={addEdu}>Add degree</AddBtn>
              <CancelBtn onClick={cancel}/>
            </>
          ) : (profile.education || []).length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {profile.education.map(e => {
                const abbr =
                  e.degree === "PhD"       ? "PhD" :
                  e.degree === "Master's"  ? "MS"  :
                  e.degree === "Bachelor's"? "BS"  : e.degree?.slice(0, 2).toUpperCase() || "?";
                return (
                  <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "14px 16px", borderRadius: 10,
                    border: "1px solid var(--line)", background: "var(--paper-2)" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: "var(--ink)",
                      color: "white", display: "grid", placeItems: "center",
                      fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {abbr}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>
                        {e.degree}{e.field ? ` in ${e.field}` : ""}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--ink-3)", marginTop: 2 }}>
                        {e.institution || "Institution not set"}
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 6,
                        fontSize: 12, color: "var(--ink-4)", flexWrap: "wrap" }}>
                        {e.gpa && (
                          <span style={{ fontFamily: "monospace" }}>
                            GPA {e.gpa} / {e.gpaScale || "4.0"}
                          </span>
                        )}
                        {(e.startYear || e.endYear || e.current) && (
                          <span>
                            {e.startYear}
                            {(e.startYear && (e.endYear || e.current)) ? " – " : ""}
                            {e.current ? "Present" : e.endYear}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "28px 0", color: "var(--ink-4)", fontSize: 13 }}>
              No education history added yet.
            </div>
          )}
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 4 — Research Interests
        ══════════════════════════════════════════════════ */}
        <Section title="Research Interests & Goals" icon="Sparkles"
          editing={editSection === "research"}
          onEdit={() => startEdit("research")}
          onSave={saveEdit}>

          {editSection === "research" ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL}>Research statement</label>
                <textarea rows={5} value={draft.researchStatement || ""}
                  placeholder="Describe your research interests, goals, and background…"
                  onChange={e => upd("researchStatement", e.target.value)}
                  style={{ ...INP, resize: "vertical", lineHeight: 1.65 }}/>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={LABEL}>Keywords / Research areas</label>
                <input style={INP} value={draft.researchKeywords || ""}
                  placeholder="e.g. NLP, Computer Vision, Quantum Computing"
                  onChange={e => upd("researchKeywords", e.target.value)}/>
                <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 5 }}>
                  Comma-separated — used in your CV and outreach emails.
                </div>
              </div>
              <Grid>
                <div>
                  <label style={LABEL}>Target degree</label>
                  <select style={SEL} value={draft.targetDegree || ""}
                    onChange={e => upd("targetDegree", e.target.value)}>
                    {TARGET_DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Target intake</label>
                  <select style={SEL} value={draft.targetStart || ""}
                    onChange={e => upd("targetStart", e.target.value)}>
                    <option value="">— Select —</option>
                    {TARGET_INTAKES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </Grid>
              <CancelBtn onClick={cancel}/>
            </>
          ) : (
            <>
              {profile.researchStatement && (
                <p style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic",
                  fontSize: 16, lineHeight: 1.65, color: "var(--ink-2)", margin: "0 0 16px" }}>
                  "{profile.researchStatement}"
                </p>
              )}
              {!profile.researchStatement && (
                <p style={{ fontSize: 13, color: "var(--ink-4)", fontStyle: "italic", margin: "0 0 14px" }}>
                  No research statement yet — add one to personalise your outreach emails.
                </p>
              )}
              {profile.researchKeywords && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                  {profile.researchKeywords.split(",").map(k => k.trim()).filter(Boolean).map(k => (
                    <span key={k} style={{ padding: "3px 11px", borderRadius: 20,
                      background: "var(--paper-3)", border: "1px solid var(--line)",
                      fontSize: 12.5, color: "var(--ink-2)" }}>
                      {k}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {profile.targetDegree && (
                  <span style={{ padding: "4px 12px", borderRadius: 20,
                    background: "var(--green-soft)", border: "1px solid var(--green-soft-2, #86efac)",
                    color: "var(--green-deep)", fontSize: 12.5, fontWeight: 600 }}>
                    {profile.targetDegree}
                  </span>
                )}
                {profile.targetStart && (
                  <span style={{ padding: "4px 12px", borderRadius: 20,
                    background: "var(--paper-3)", border: "1px solid var(--line)",
                    color: "var(--ink-3)", fontSize: 12.5 }}>
                    Target: {profile.targetStart}
                  </span>
                )}
              </div>
            </>
          )}
        </Section>

        {/* ══════════════════════════════════════════════════
            SECTION 5 — Match Preferences
        ══════════════════════════════════════════════════ */}
        <Section
          title="Match Preferences"
          icon="Filter"
          badge={
            (profile.selectedInterests || []).length > 0 || (profile.locationPrefs || []).length > 0
              ? `${(profile.selectedInterests || []).length} interest${(profile.selectedInterests || []).length !== 1 ? 's' : ''}`
              : null
          }
          editing={editSection === "matchprefs"}
          onEdit={() => startEdit("matchprefs")}
          onSave={saveEdit}>

          {editSection === "matchprefs" ? (
            <>
              {/* ── Interest chips ── */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ ...LABEL, marginBottom: 12 }}>
                  Research interests
                  <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0,
                    color: "var(--ink-4)", marginLeft: 6 }}>
                    — pick all that apply
                  </span>
                </label>
                {Object.entries(INTERESTS_BY_CATEGORY).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--ink-4)",
                      textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
                      {cat}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {items.map(item => {
                        const on = (draft.selectedInterests || []).includes(item.id);
                        return (
                          <span key={item.id} onClick={() => toggleInterest(item.id)}
                            style={{ padding: "5px 13px", borderRadius: 20, cursor: "pointer",
                              fontSize: 12.5, userSelect: "none", transition: "all 0.1s",
                              border: on ? "1.5px solid var(--green-deep)" : "1.5px solid var(--line)",
                              background: on ? "var(--green-soft)" : "var(--paper-2)",
                              color: on ? "var(--green-deep)" : "var(--ink-3)",
                              fontWeight: on ? 600 : 400 }}>
                            {item.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Location preferences ── */}
              <div style={{ marginBottom: 20 }}>
                <label style={LABEL}>Preferred countries to study in</label>
                <select style={{ ...SEL, marginBottom: 8 }} defaultValue=""
                  onChange={e => { addLocation(e.target.value); e.target.value = ""; }}>
                  <option value="" disabled>— Add a country —</option>
                  {COUNTRIES.filter(c => !(draft.locationPrefs || []).includes(c)).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {(draft.locationPrefs || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(draft.locationPrefs || []).map(c => (
                      <span key={c} style={{ display: "flex", alignItems: "center", gap: 5,
                        padding: "4px 8px 4px 12px", borderRadius: 20,
                        background: "var(--ink)", color: "white", fontSize: 12.5 }}>
                        {c}
                        <button onClick={() => removeLocation(c)}
                          style={{ background: "none", border: "none", cursor: "pointer",
                            color: "rgba(255,255,255,0.65)", padding: 2,
                            display: "flex", alignItems: "center" }}>
                          <Icon.X size={10}/>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {(draft.locationPrefs || []).length === 0 && (
                  <div style={{ fontSize: 11.5, color: "var(--ink-4)" }}>
                    Leave empty to search all countries.
                  </div>
                )}
              </div>

              {/* ── Filter toggles ── */}
              <div style={{ padding: "16px 18px", borderRadius: 10,
                border: "1px solid var(--line)", background: "var(--paper-2)",
                display: "flex", flexDirection: "column", gap: 14, marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-4)",
                  textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Filters applied to your matches
                </div>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10,
                  cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={!!draft.fundedOnly}
                    onChange={e => upd("fundedOnly", e.target.checked)}
                    style={{ marginTop: 2, width: 15, height: 15,
                      accentColor: "var(--green-deep)", cursor: "pointer" }}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                      Funded positions only
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>
                      Hide professors without active grants or funding information
                    </div>
                  </div>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: 10,
                  cursor: "pointer", userSelect: "none" }}>
                  <input type="checkbox" checked={!!draft.acceptingOnly}
                    onChange={e => upd("acceptingOnly", e.target.checked)}
                    style={{ marginTop: 2, width: 15, height: 15,
                      accentColor: "var(--green-deep)", cursor: "pointer" }}/>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                      Actively accepting students only
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-4)", marginTop: 2 }}>
                      Only show professors with open positions on their lab page
                    </div>
                  </div>
                </label>
              </div>

              <CancelBtn onClick={cancel}/>
            </>
          ) : (
            // ── Read mode ──
            (profile.selectedInterests || []).length === 0 &&
            (profile.locationPrefs || []).length === 0 &&
            !profile.fundedOnly && !profile.acceptingOnly ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: "var(--ink-4)", fontSize: 13 }}>
                No match preferences set yet.{" "}
                <strong style={{ color: "var(--ink-3)" }}>Edit</strong> to choose your research areas,
                target countries, and funding filters — this directly improves your matches.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {(profile.selectedInterests || []).length > 0 && (
                  <div>
                    <div style={LABEL}>Research interests</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(profile.selectedInterests || []).map(id => {
                        const interest = INTERESTS.find(i => i.id === id);
                        return interest ? (
                          <span key={id} style={{ padding: "4px 12px", borderRadius: 20,
                            background: "var(--green-soft)", border: "1px solid var(--green-soft-2, #86efac)",
                            color: "var(--green-deep)", fontSize: 12.5, fontWeight: 600 }}>
                            {interest.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {(profile.locationPrefs || []).length > 0 && (
                  <div>
                    <div style={LABEL}>Preferred countries</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {(profile.locationPrefs || []).map(c => (
                        <span key={c} style={{ padding: "4px 12px", borderRadius: 20,
                          background: "var(--paper-3)", border: "1px solid var(--line)",
                          color: "var(--ink-2)", fontSize: 12.5 }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(profile.fundedOnly || profile.acceptingOnly) && (
                  <div>
                    <div style={LABEL}>Active filters</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {profile.fundedOnly && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5,
                          padding: "4px 12px", borderRadius: 20,
                          background: "var(--green-soft)", border: "1px solid var(--green-soft-2, #86efac)",
                          color: "var(--green-deep)", fontSize: 12.5, fontWeight: 500 }}>
                          <Icon.Check size={11}/> Funded only
                        </span>
                      )}
                      {profile.acceptingOnly && (
                        <span style={{ display: "flex", alignItems: "center", gap: 5,
                          padding: "4px 12px", borderRadius: 20,
                          background: "var(--green-soft)", border: "1px solid var(--green-soft-2, #86efac)",
                          color: "var(--green-deep)", fontSize: 12.5, fontWeight: 500 }}>
                          <Icon.Check size={11}/> Actively accepting
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </Section>

      </div>
    </div>
  );
}
