import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { Avatar } from '../components/Shared';
import { useTier } from '../App';

// --- Pricing ---
export function Pricing() {
  const navigate = useNavigate();
  const { setTier } = useTier();
  const onBack = () => navigate(-1);
  const onCta = () => { setTier('pro'); navigate('/app/matches'); };
  const [billing, setBilling] = useState("monthly");
  const plans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      desc: "For getting a feel of the field.",
      cta: "Get started",
      features: [
        ["5 matches per week", true],
        ["Up to 5 outreach emails / week", true],
        ["1 saved professor", true],
        ["Basic ranking signals", true],
        ["AI email drafting", false],
        ["Auto follow-ups", false],
        ["Export CSV", false],
      ],
    },
    {
      name: "Student Pro",
      price: { monthly: 12, yearly: 8 },
      desc: "For the application season.",
      cta: "Start 7-day trial",
      highlighted: true,
      features: [
        ["Unlimited matches", true],
        ["Up to 30 emails per day", true],
        ["Unlimited saved & comparison", true],
        ["Custom weight tuning", true],
        ["AI email drafting (10 / day)", true],
        ["Auto follow-ups (7-14d)", true],
        ["Export CSV", true],
      ],
    },
    {
      name: "Lab / Institution",
      price: { monthly: "Custom", yearly: "Custom" },
      desc: "Seats for cohorts and labs.",
      cta: "Talk to sales",
      features: [
        ["Everything in Pro", true],
        ["Bulk seats (10+)", true],
        ["Admin dashboard", true],
        ["SSO / SAML", true],
        ["Dedicated success manager", true],
        ["Custom data sources", true],
        ["SLA & support", true],
      ],
    },
  ];

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <nav className="topnav" style={{ background: "transparent" }}>
        <div className="brand" onClick={onBack} style={{ cursor: "pointer" }}>
          <Icon.Logo /> Find My Professor
        </div>
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <button className="btn btn-ghost" onClick={onBack}>Back</button>
        </div>
      </nav>

      <section style={{ padding: "64px 32px 24px", textAlign: "center" }}>
        <span className="pill pill-outline" style={{ marginBottom: 14 }}>Pricing</span>
        <h1 style={{ fontSize: 52, letterSpacing: "-0.03em", maxWidth: 720, margin: "0 auto" }}>
          One coffee a week.{" "}
          <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", color: "var(--green-deep)" }}>
            One advisor for life.
          </span>
        </h1>
        <p className="muted" style={{ fontSize: 16, maxWidth: 540, margin: "16px auto 0" }}>
          No tricks. Cancel any time. Free plan stays free.
        </p>
        <div className="row gap-1" style={{ justifyContent: "center", marginTop: 32, padding: 4, borderRadius: 999, background: "var(--paper-3)", display: "inline-flex" }}>
          {["monthly", "yearly"].map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              padding: "6px 16px", border: 0, borderRadius: 999,
              background: billing === b ? "white" : "transparent",
              color: billing === b ? "var(--ink)" : "var(--ink-3)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              boxShadow: billing === b ? "var(--shadow-1)" : "none",
            }}>
              {b[0].toUpperCase() + b.slice(1)}{" "}
              {b === "yearly" && <span style={{ color: "var(--green-deep)", fontSize: 11, marginLeft: 4 }}>−33%</span>}
            </button>
          ))}
        </div>
      </section>

      <section style={{ padding: "32px 32px 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
          {plans.map(p => (
            <div key={p.name} className="card" style={{
              padding: 28,
              borderColor: p.highlighted ? "var(--green-deep)" : "var(--line)",
              borderWidth: p.highlighted ? 2 : 1,
              background: p.highlighted ? "var(--paper)" : "white",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}>
              {p.highlighted && (
                <span className="pill" style={{ position: "absolute", top: -10, left: 28, background: "var(--green-deep)", color: "var(--paper)" }}>
                  <Icon.Sparkles size={11}/> Most popular
                </span>
              )}
              <h3 style={{ fontSize: 18, letterSpacing: "-0.01em" }}>{p.name}</h3>
              <p className="muted" style={{ fontSize: 13, margin: "6px 0 20px" }}>{p.desc}</p>
              <div className="row" style={{ alignItems: "baseline", gap: 4, marginBottom: 24 }}>
                {typeof p.price[billing] === "number" ? (
                  <>
                    <span style={{ fontSize: 44, letterSpacing: "-0.03em", fontWeight: 480 }}>${p.price[billing]}</span>
                    <span className="muted">/ month</span>
                  </>
                ) : (
                  <span style={{ fontSize: 44, letterSpacing: "-0.03em", fontWeight: 480, fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}>
                    {p.price[billing]}
                  </span>
                )}
              </div>
              <button
                className={"btn " + (p.highlighted ? "btn-primary" : "")}
                style={{ width: "100%", justifyContent: "center", padding: 12 }}
                onClick={onCta}
              >
                {p.cta}
              </button>
              <div style={{ height: 1, background: "var(--line)", margin: "24px 0" }}/>
              <div className="col gap-2" style={{ flex: 1 }}>
                {p.features.map(([f, on]) => (
                  <div key={f} className="row gap-2" style={{ fontSize: 13, color: on ? "var(--ink)" : "var(--ink-4)" }}>
                    {on
                      ? <span style={{ width: 16, height: 16, borderRadius: 4, background: "var(--green-soft)", color: "var(--green-deep)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon.Check size={11}/></span>
                      : <span style={{ width: 16, height: 16, borderRadius: 4, background: "var(--paper-3)", color: "var(--ink-4)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon.X size={10}/></span>}
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ maxWidth: 1100, margin: "40px auto 0", padding: 24 }}>
          <div className="row between">
            <div>
              <h3 style={{ fontSize: 16 }}>Student discount</h3>
              <p className="muted" style={{ fontSize: 13, margin: "4px 0 0" }}>
                Verify with your <span className="mono">.edu</span> or <span className="mono">.ac.*</span> email for 40% off Pro for as long as you're enrolled.
              </p>
            </div>
            <button className="btn">Verify student status</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- Admin (institutional) view ---
export function Admin() {
  const navigate = useNavigate();
  const onBack = () => navigate(-1);
  const cohorts = [
    { name: "MIT EECS 2026 Applicants", seats: 42, used: 38, replies: 19 },
    { name: "Stanford Bio PhD Cohort",  seats: 30, used: 24, replies: 8 },
    { name: "ETH Career Center · MSc",  seats: 18, used: 14, replies: 11 },
  ];

  return (
    <div className="fade-in" style={{ minHeight: "100vh", background: "var(--paper)" }}>
      <nav className="topnav">
        <div className="brand" onClick={onBack} style={{ cursor: "pointer" }}>
          <Icon.Logo /> Find My Professor
        </div>
        <span className="pill pill-outline" style={{ marginLeft: 12 }}>
          <Icon.Building size={11}/> Admin · University of Washington
        </span>
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <button className="btn btn-sm" onClick={onBack}>Switch to student view</button>
          <Avatar initials="UW" tone="ink"/>
        </div>
      </nav>

      <div style={{ padding: "32px 32px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="row between" style={{ marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>Institution dashboard</h1>
            <p className="muted" style={{ marginTop: 6 }}>Aggregated, anonymized signals across your cohorts.</p>
          </div>
          <div className="row gap-2">
            <button className="btn"><Icon.ExternalLink size={13}/> Export report</button>
            <button className="btn btn-primary"><Icon.Plus size={13}/> Invite students</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 16 }}>
          {[
            ["Active students", "76", "+12 this week", "var(--green)"],
            ["Outreach sent",   "412", "+38 today", "var(--blue)"],
            ["Open rate",       "58%", "+4pp vs cohort median", undefined],
            ["Reply rate",      "21%", "Top quartile", "var(--green)"],
          ].map(([l, v, sub, c]) => (
            <div key={l} className="card" style={{ padding: 20 }}>
              <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</div>
              <div style={{ fontSize: 30, letterSpacing: "-0.02em", marginTop: 4, fontWeight: 500, color: c }}>{v}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="row between" style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
              <h3 style={{ fontSize: 15 }}>Cohorts</h3>
              <button className="btn btn-sm">Manage seats</button>
            </div>
            {cohorts.map((c, i) => (
              <div key={c.name} className="row gap-3" style={{ padding: "16px 20px", borderTop: i ? "1px solid var(--line)" : 0 }}>
                <div className="col" style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{c.used} / {c.seats} seats used · {c.replies} replies</div>
                  <div className="mt-2" style={{ maxWidth: 320 }}>
                    <div className="bar"><div className="bar-fill" style={{ width: (c.used / c.seats * 100) + "%" }}/></div>
                  </div>
                </div>
                <button className="btn btn-sm">View</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Top destination labs</h3>
            <p className="muted" style={{ fontSize: 12, marginTop: -8, marginBottom: 16 }}>Anonymized — what your students target most.</p>
            {[
              ["ETH Zürich · El-Sayed Lab", 18, "94%"],
              ["MIT · Okonkwo Lab", 14, "89%"],
              ["Stanford · Subramanian", 11, "78%"],
              ["U-Tokyo · Tanaka", 9, "86%"],
              ["Edinburgh · Reinhardt", 7, "82%"],
            ].map(([n, c, s], i) => (
              <div key={n} className="row between" style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line)" : 0, fontSize: 13 }}>
                <span style={{ flex: 1 }}>{n}</span>
                <span className="mono muted" style={{ width: 30 }}>{c}</span>
                <span className="pill pill-green" style={{ marginLeft: 8 }}>{s}</span>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 20, gridColumn: "1 / -1" }}>
            <h3 style={{ fontSize: 15, marginBottom: 14 }}>Field distribution & outcomes</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24 }}>
              {[
                ["CS / ML",      28, 22, "var(--green)"],
                ["Bio / Med",    18, 14, "var(--blue)"],
                ["Engineering",  14, 11, "var(--amber)"],
                ["Social Sci.",  10,  7, "oklch(0.55 0.1 320)"],
                ["Humanities",   6,   4, "oklch(0.55 0.1 25)"],
              ].map(([n, total, rep, c]) => (
                <div key={n}>
                  <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{n}</div>
                  <div className="row" style={{ alignItems: "baseline", gap: 6, marginTop: 4 }}>
                    <span className="mono" style={{ fontSize: 22, fontWeight: 500 }}>{total}</span>
                    <span className="muted" style={{ fontSize: 11 }}>students</span>
                  </div>
                  <div className="mt-3" style={{ height: 80, display: "flex", alignItems: "flex-end", gap: 4 }}>
                    {[3,5,8,4,6,9,12,7,11,14].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: h * 5, background: c, opacity: 0.35 + (i / 20), borderRadius: 2 }}/>
                    ))}
                  </div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 6 }}>{rep} replies · {Math.round(rep/total*100)}% rate</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card hatch" style={{ marginTop: 24, padding: 20, background: "var(--green-deep)", color: "var(--paper)", border: 0, display: "flex", gap: 16, alignItems: "center" }}>
          <Icon.Award size={24}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, fontStyle: "italic" }}>Privacy by design.</div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
              Per-student data is never visible to admins. You see counts, distributions, and outcomes — never names, drafts, or inboxes.
            </div>
          </div>
          <button className="btn" style={{ background: "var(--paper)", color: "var(--green-deep)", border: 0 }}>Privacy policy</button>
        </div>
      </div>
    </div>
  );
}
