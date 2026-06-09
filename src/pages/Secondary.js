import React, { useState, useEffect } from 'react';
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
          <button className="btn" style={{ background: "var(--paper)", color: "var(--green-deep)", border: 0 }} onClick={() => window.open('/privacy', '_blank')}>Privacy policy</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared legal page shell
// ─────────────────────────────────────────────────────────────────────────────
function LegalPage({ title, subtitle, children }) {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', fontFamily: 'inherit' }}>
      {/* Nav */}
      <nav className="topnav" style={{ background: 'transparent' }}>
        <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Icon.Logo /> Find My Professor
        </div>
        <button className="btn btn-ghost" style={{ marginLeft: 'auto' }} onClick={() => navigate(-1)}>← Back</button>
      </nav>

      {/* Header */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '56px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-deep)', letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 12 }}>Legal</div>
        <h1 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 10px' }}>{title}</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, margin: 0 }}>{subtitle}</p>
        <div style={{ height: 1, background: 'var(--line)', margin: '32px 0' }}/>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 740, margin: '0 auto', padding: '0 24px 96px', fontSize: 14.5,
        lineHeight: 1.78, color: 'var(--ink-2)' }}>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', margin: '0 0 10px',
        letterSpacing: '-0.01em' }}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}

function P({ children }) {
  return <p style={{ margin: '0 0 12px' }}>{children}</p>;
}

function UL({ items }) {
  return (
    <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>
      {items.map((it, i) => <li key={i} style={{ marginBottom: 6 }}>{it}</li>)}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Terms of Service
// ─────────────────────────────────────────────────────────────────────────────
export function TermsOfService() {
  return (
    <LegalPage
      title="Terms of Service"
      subtitle="Effective date: June 10, 2026 · Last updated: June 10, 2026"
    >
      <Section title="1. Acceptance of Terms">
        <P>By accessing or using Find My Professor ("the Service," "we," "our") at findmyprofessor.me, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</P>
        <P>We may update these terms at any time. Continued use of the Service after changes are posted constitutes acceptance of the revised terms.</P>
      </Section>

      <Section title="2. Description of Service">
        <P>Find My Professor is an AI-powered academic advisor discovery platform that helps students find, evaluate, and reach out to research advisors and professors. Core features include:</P>
        <UL items={[
          'Professor discovery and matching based on research interests',
          'AI-assisted outreach email drafting',
          'CV and Statement of Purpose (SOP) builder',
          'Scholarship discovery and matching',
          'Application pipeline tracking',
        ]}/>
        <P>Certain features require a paid subscription ("Pro"). Free plan users have access to a limited feature set as described on the Pricing page.</P>
      </Section>

      <Section title="3. Accounts">
        <P>You must create an account to use most features. You agree to:</P>
        <UL items={[
          'Provide accurate information when registering',
          'Keep your password confidential',
          'Notify us immediately of any unauthorized access',
          'Be at least 16 years old (or the minimum age of digital consent in your country)',
        ]}/>
        <P>You are responsible for all activity that occurs under your account.</P>
      </Section>

      <Section title="4. Acceptable Use">
        <P>You agree not to use the Service to:</P>
        <UL items={[
          'Send unsolicited bulk emails or spam to professors',
          'Misrepresent your identity, credentials, or research background',
          'Scrape, crawl, or systematically extract data from the Service',
          'Attempt to reverse-engineer, decompile, or access non-public parts of the platform',
          'Use the Service for any unlawful purpose',
          'Harass, intimidate, or threaten professors or other users',
        ]}/>
        <P>We reserve the right to suspend or terminate accounts that violate these terms.</P>
      </Section>

      <Section title="5. Gmail Integration">
        <P>If you connect your Gmail account to send outreach emails, you authorize Find My Professor to compose and send emails on your behalf using the Gmail API. We access only the minimum scopes required to send email. We do not read, store, or analyze the content of your inbox.</P>
        <P>You can revoke this access at any time from your Google Account settings at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--green-deep)' }}>myaccount.google.com/permissions</a>.</P>
      </Section>

      <Section title="6. Payments and Subscriptions">
        <P>Paid plans are billed through Paddle, our payment processor. By subscribing you agree to Paddle's terms of service. Subscription fees are charged at the start of each billing cycle (monthly or annual).</P>
        <UL items={[
          'You may cancel at any time; access continues until the end of the current billing period',
          'Refunds are handled at our discretion — contact us within 7 days of a charge for review',
          'We reserve the right to change pricing with 30 days notice',
        ]}/>
      </Section>

      <Section title="7. Intellectual Property">
        <P>All content, design, and code comprising the Service is owned by Find My Professor or its licensors. You retain ownership of content you create (CVs, SOPs, email drafts). By using the Service you grant us a limited, non-exclusive license to store and process your content solely to provide the Service.</P>
      </Section>

      <Section title="8. Disclaimers">
        <P>The Service is provided "as is" without warranties of any kind. We do not guarantee that professor information is current or accurate — data is sourced from public academic databases and may be out of date. We do not guarantee that using the Service will result in acceptance to any program or a response from any professor.</P>
      </Section>

      <Section title="9. Limitation of Liability">
        <P>To the fullest extent permitted by law, Find My Professor shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability for any claim shall not exceed the amount you paid us in the 12 months preceding the claim.</P>
      </Section>

      <Section title="10. Termination">
        <P>You may delete your account at any time from your profile settings. We may suspend or terminate your access if you violate these terms, with or without notice. Upon termination, your right to use the Service ceases immediately.</P>
      </Section>

      <Section title="11. Governing Law">
        <P>These terms are governed by the laws of the jurisdiction in which Find My Professor operates, without regard to conflict of law principles.</P>
      </Section>

      <Section title="12. Contact">
        <P>Questions about these terms? Email us at <a href="mailto:contact@findmyprofessor.me" style={{ color: 'var(--green-deep)' }}>contact@findmyprofessor.me</a>.</P>
      </Section>
    </LegalPage>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Privacy Policy
// ─────────────────────────────────────────────────────────────────────────────
export function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      subtitle="Effective date: June 10, 2026 · Last updated: June 10, 2026"
    >
      <Section title="1. Overview">
        <P>Find My Professor ("we," "us") takes your privacy seriously. This policy explains what data we collect, how we use it, who we share it with, and your rights. We collect only what we need to provide the Service.</P>
      </Section>

      <Section title="2. Information We Collect">
        <P><strong>Account data</strong> — username, email address, and password (stored as a secure hash) when you register. If you sign in with Google, we receive your name, email, and Google account ID.</P>
        <P><strong>Profile and document data</strong> — CV content, SOP drafts, research interests, and any other information you enter into the platform.</P>
        <P><strong>Outreach data</strong> — email templates and professor contact records you create. If you connect Gmail, we send emails on your behalf but do not store your inbox or read incoming mail.</P>
        <P><strong>Usage data</strong> — pages visited, features used, and interactions with the Service, collected via Google Analytics 4. This data is aggregated and anonymized.</P>
        <P><strong>Payment data</strong> — transactions are processed by Paddle. We do not store your card number; we receive only a subscription status and plan identifier.</P>
        <P><strong>Technical data</strong> — IP address, browser type, and device information collected automatically with each request.</P>
      </Section>

      <Section title="3. How We Use Your Data">
        <UL items={[
          'To provide, operate, and improve the Service',
          'To match you with relevant professors and scholarships using AI',
          'To send outreach emails on your behalf (Gmail integration)',
          'To process payments and manage your subscription',
          'To send transactional emails (account confirmations, password resets)',
          'To analyze aggregate usage patterns and improve the product',
          'To detect and prevent fraud or abuse',
        ]}/>
        <P>We do not sell your personal data to third parties.</P>
      </Section>

      <Section title="4. Third-Party Services">
        <P>We use the following third-party services that may process your data:</P>
        <UL items={[
          'Google OAuth / Gmail API — for sign-in and email sending',
          'Google Analytics 4 — for anonymized usage analytics',
          'Paddle — for payment processing and subscription management',
          'Backblaze B2 — for storing profile avatar images',
          'Neon — for secure cloud database hosting',
          'Resend — for transactional email delivery',
        ]}/>
        <P>Each service operates under its own privacy policy and data processing agreements. We only share the minimum data required for each service to function.</P>
      </Section>

      <Section title="5. Data Retention">
        <P>We retain your account and document data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or billing compliance purposes.</P>
        <P>Anonymized analytics data may be retained indefinitely.</P>
      </Section>

      <Section title="6. Cookies">
        <P>We use session cookies to keep you logged in and localStorage to store your authentication token. Google Analytics sets its own cookies for analytics tracking. We do not use advertising cookies or cross-site tracking.</P>
      </Section>

      <Section title="7. Your Rights">
        <P>Depending on your location, you may have the right to:</P>
        <UL items={[
          'Access a copy of the personal data we hold about you',
          'Correct inaccurate data',
          'Request deletion of your data ("right to be forgotten")',
          'Object to or restrict certain processing',
          'Port your data to another service',
          'Withdraw consent at any time (e.g., revoking Gmail access)',
        ]}/>
        <P>To exercise any of these rights, email <a href="mailto:contact@findmyprofessor.me" style={{ color: 'var(--green-deep)' }}>contact@findmyprofessor.me</a>. We will respond within 30 days.</P>
      </Section>

      <Section title="8. Children's Privacy">
        <P>The Service is not directed at children under 16. We do not knowingly collect personal data from anyone under 16. If you believe a child has provided us with data, please contact us and we will delete it promptly.</P>
      </Section>

      <Section title="9. Security">
        <P>We use industry-standard measures including HTTPS encryption in transit, hashed passwords, and access-controlled databases. No system is 100% secure — if you discover a vulnerability, please disclose it responsibly to <a href="mailto:contact@findmyprofessor.me" style={{ color: 'var(--green-deep)' }}>contact@findmyprofessor.me</a>.</P>
      </Section>

      <Section title="10. Changes to This Policy">
        <P>We may update this policy periodically. If we make material changes, we will notify you by email or a prominent notice in the app at least 14 days before the changes take effect.</P>
      </Section>

      <Section title="11. Contact">
        <P>For privacy questions or data requests: <a href="mailto:contact@findmyprofessor.me" style={{ color: 'var(--green-deep)' }}>contact@findmyprofessor.me</a></P>
      </Section>
    </LegalPage>
  );
}
