// Landing page
function Landing({ onCta, onSignIn, onNav }) {
  const { Icon } = FMP;
  return (
    <div className="landing fade-in">
      {/* Nav */}
      <nav className="topnav" style={{ background: "transparent", borderBottom: "1px solid transparent", padding: "0 32px" }}>
        <div className="brand"><Icon.Logo /> Find My Professor</div>
        <div className="row gap-4" style={{ marginLeft: 32 }}>
          <a className="nav-item" style={{ padding: "6px 10px" }} onClick={() => onNav("how")}>How it works</a>
          <a className="nav-item" style={{ padding: "6px 10px" }} onClick={() => onNav("pricing")}>Pricing</a>
          <a className="nav-item" style={{ padding: "6px 10px" }} onClick={() => onNav("admin")}>For institutions</a>
        </div>
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <button className="btn btn-ghost" onClick={onSignIn}>Sign in</button>
          <button className="btn btn-primary" onClick={onCta}>Start free</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 32px 56px" }}>
        <div className="hero-wrap" style={{ maxWidth: 1100 }}>
          <div className="row gap-2" style={{ marginBottom: 28 }}>
            <span className="pill pill-green">
              <Icon.Sparkles size={12}/> AI matching · 184,000+ professors indexed
            </span>
          </div>
          <h1 style={{ fontSize: 64, lineHeight: 1.02, letterSpacing: "-0.035em", maxWidth: 900, fontWeight: 480 }}>
            Find the right professor.<br/>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400, color: "var(--green-deep)" }}>Not the famous one.</span>
          </h1>
          <p style={{ fontSize: 19, color: "var(--ink-2)", maxWidth: 620, marginTop: 22, lineHeight: 1.45 }}>
            We crawl ORCID, Semantic Scholar, arXiv, PubMed and university directories every day. Then we match you to advisors who fit your research — and are actually accepting students.
          </p>
          <div className="row gap-3 mt-6">
            <button className="btn btn-primary btn-lg" onClick={onCta}>
              Start matching — free <Icon.Chevron size={14}/>
            </button>
            <button className="btn btn-lg" onClick={() => onNav("how")}>
              See how it works
            </button>
          </div>
          <div className="row gap-4 mt-6" style={{ color: "var(--ink-3)", fontSize: 12.5 }}>
            <span className="row gap-1"><Icon.Check size={13} color="var(--green)"/> No credit card</span>
            <span className="row gap-1"><Icon.Check size={13} color="var(--green)"/> 5 matches free / week</span>
            <span className="row gap-1"><Icon.Check size={13} color="var(--green)"/> GDPR compliant</span>
          </div>
        </div>

        {/* Hero "match card" preview */}
        <div className="hero-wrap" style={{ marginTop: 56 }}>
          <HeroPreview />
        </div>
      </section>

      {/* Logos band */}
      <section style={{ padding: "32px 32px", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
        <div className="hero-wrap row gap-6" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-4)" }}>
            Sourced from
          </div>
          {["ORCID", "Semantic Scholar", "arXiv", "PubMed", "NIH RePORTER", "NSF Awards", "CORDIS", "OpenAlex"].map(s => (
            <span key={s} style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18, color: "var(--ink-3)", fontStyle: "italic" }}>{s}</span>
          ))}
        </div>
      </section>

      {/* Three-step */}
      <section style={{ padding: "88px 32px" }}>
        <div className="hero-wrap">
          <div className="row between" style={{ alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <div className="pill pill-outline" style={{ marginBottom: 12 }}>How it works</div>
              <h2 style={{ fontSize: 40, letterSpacing: "-0.03em", maxWidth: 520 }}>
                Three steps from <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}>lost</span> to <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}>shortlist</span>.
              </h2>
            </div>
            <p style={{ color: "var(--ink-3)", maxWidth: 360, fontSize: 14 }}>
              No more 90-tab afternoons reading lab pages. Tell us what you want to research; we do the legwork.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {[
              { n: "01", t: "Describe your research", d: "Paste a paragraph from your statement, or pick tags. We embed it semantically — synonyms count.", icon: "Sparkles" },
              { n: "02", t: "Get a ranked shortlist", d: "Composite scores from expertise, funding signals, recent activity, and reputation. Every match comes with reasoning.", icon: "Trend" },
              { n: "03", t: "Outreach that lands", d: "Personalized emails grounded in real papers and grants. Track opens, replies, and follow-ups in one inbox.", icon: "Send" },
            ].map((s, i) => {
              const I = FMP.Icon[s.icon];
              return (
                <div key={i} className="card" style={{ padding: 24 }}>
                  <div className="row between" style={{ marginBottom: 20 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.06em" }}>{s.n}</span>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green-soft)", color: "var(--green-deep)", display: "grid", placeItems: "center" }}>
                      <I size={16}/>
                    </div>
                  </div>
                  <h3 style={{ fontSize: 20, marginBottom: 8 }}>{s.t}</h3>
                  <p style={{ color: "var(--ink-3)", fontSize: 13.5, margin: 0 }}>{s.d}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ padding: "16px 32px 96px" }}>
        <div className="hero-wrap">
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
            <FeatureCard
              title="Match scores you can explain"
              body="Every recommendation breaks into four signals — expertise, funding, activity, reputation — so you understand the fit before reading a single paper."
              big
            >
              <div className="card" style={{ padding: 18, marginTop: 18 }}>
                <div className="row gap-3">
                  <FMP.Avatar initials="ME" size="lg"/>
                  <div className="col" style={{ flex: 1, gap: 2 }}>
                    <div style={{ fontWeight: 500 }}>Dr. Mariam El-Sayed</div>
                    <div className="muted" style={{ fontSize: 12 }}>Associate Professor · ETH Zürich</div>
                  </div>
                  <FMP.ScoreRing value={94}/>
                </div>
                <div className="col gap-3 mt-4">
                  <FMP.Bar value={96} label="Expertise"/>
                  <FMP.Bar value={92} label="Funding"/>
                  <FMP.Bar value={95} label="Activity"/>
                  <FMP.Bar value={88} label="Reputation"/>
                </div>
              </div>
            </FeatureCard>
            <FeatureCard
              title="Only labs that are actually hiring"
              body="We cross-reference grant cycles, recent group-page edits, and posted openings — so emeritus profiles don't waste your week."
            >
              <div className="card" style={{ padding: 14, marginTop: 14 }}>
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  <span className="pill pill-green"><FMP.Icon.Check size={11}/> Active grant 2028</span>
                  <span className="pill pill-green"><FMP.Icon.Check size={11}/> 2 PhD openings</span>
                  <span className="pill pill-amber">No reply 14d</span>
                  <span className="pill pill-red">Emeritus</span>
                  <span className="pill pill-blue">New lab — small group</span>
                </div>
              </div>
            </FeatureCard>
            <FeatureCard
              title="Emails grounded in real papers"
              body="The composer drafts a personalized note referencing a real recent paper. You edit, you send. No hallucinated citations."
            >
              <div className="card mono" style={{ padding: 14, marginTop: 14, fontSize: 11.5, lineHeight: 1.55, color: "var(--ink-2)" }}>
                Dear Prof. Okonkwo,<br/><br/>
                I read your <span style={{ background: "var(--green-soft)", padding: "0 2px" }}>Nature 2025 paper on programmable mammalian gene circuits</span> over the weekend...
              </div>
            </FeatureCard>
            <FeatureCard
              title="Inbox you can trust"
              body="Track opens, clicks, replies, bounces. Auto follow-ups only if the professor opened. Throttle to stay off spam filters."
            >
              <div className="card" style={{ marginTop: 14 }}>
                {[
                  { d: "Replied", c: "var(--green)" },
                  { d: "Opened",  c: "var(--blue)" },
                  { d: "No reply",c: "var(--amber)" },
                ].map((x, i) => (
                  <div key={i} className="row between" style={{ padding: "10px 14px", borderBottom: i<2 ? "1px solid var(--line)" : "none", fontSize: 12.5 }}>
                    <span className="row gap-2"><FMP.Icon.Dot color={x.c}/>{x.d}</span>
                    <span className="mono muted">{[3,7,2][i]}</span>
                  </div>
                ))}
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section style={{ background: "var(--green-deep)", color: "var(--paper)", padding: "72px 32px" }}>
        <div className="hero-wrap row between" style={{ alignItems: "flex-end" }}>
          <div style={{ maxWidth: 620 }}>
            <h2 style={{ color: "var(--paper)", fontSize: 44, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              The good advisor is out there. <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", opacity: 0.85 }}>You just haven't found them yet.</span>
            </h2>
          </div>
          <button className="btn btn-lg" style={{ background: "var(--paper)", color: "var(--green-deep)", border: 0 }} onClick={onCta}>
            Get my first 5 matches — free <FMP.Icon.Chevron size={14}/>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "40px 32px", borderTop: "1px solid var(--line)" }}>
        <div className="hero-wrap row between" style={{ fontSize: 12, color: "var(--ink-3)" }}>
          <div className="brand"><FMP.Icon.Logo size={18}/> Find My Professor</div>
          <div className="row gap-6">
            <span>Privacy</span><span>Terms</span><span>For institutions</span><span>Status</span>
          </div>
          <div>© 2026</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, body, children, big }) {
  return (
    <div className="card" style={{ padding: 28, gridColumn: big ? "span 1" : "auto", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <h3 style={{ fontSize: 22, letterSpacing: "-0.02em", marginBottom: 10 }}>{title}</h3>
        <p style={{ color: "var(--ink-3)", margin: 0, fontSize: 14, lineHeight: 1.5 }}>{body}</p>
      </div>
      {children}
    </div>
  );
}

function HeroPreview() {
  const { Icon } = FMP;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", boxShadow: "var(--shadow-3)" }}>
      <div className="row between" style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", background: "var(--paper-2)" }}>
        <div className="row gap-2" style={{ fontSize: 12, color: "var(--ink-3)" }}>
          <Icon.Dot size={9} color="oklch(0.7 0.12 25)"/><Icon.Dot size={9} color="oklch(0.78 0.12 80)"/><Icon.Dot size={9} color="oklch(0.7 0.12 155)"/>
          <span style={{ marginLeft: 12 }} className="mono">findmyprofessor.app/matches</span>
        </div>
        <span className="pill pill-outline mono" style={{ fontSize: 10 }}>Live preview</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 420 }}>
        <div style={{ background: "var(--paper-2)", borderRight: "1px solid var(--line)", padding: "14px 12px" }}>
          <div className="side-section">Workspace</div>
          {[
            { i: "Sparkles", l: "Matches", n: 24, a: true },
            { i: "Bookmark", l: "Saved", n: 6 },
            { i: "Inbox",    l: "Outreach", n: 5 },
            { i: "User",     l: "Profile" },
          ].map((x, i) => {
            const I = Icon[x.i];
            return (
              <div key={i} className={"nav-item" + (x.a ? " active" : "")}>
                <I size={14}/> {x.l}
                {x.n && <span className="nav-badge">{x.n}</span>}
              </div>
            );
          })}
        </div>
        <div style={{ padding: 20 }}>
          <div className="row between" style={{ marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 22 }}>24 matches for you</h3>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Updated 14 minutes ago · ranked by composite score</div>
            </div>
            <div className="row gap-2">
              <span className="pill pill-outline"><Icon.Filter size={11}/> Filters</span>
              <span className="pill pill-outline">Score ↓</span>
            </div>
          </div>
          {FMP.professors.slice(0, 3).map((p, i) => (
            <div key={p.id} className="row gap-3" style={{ padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
              <FMP.Avatar initials={p.initials}/>
              <div className="col" style={{ flex: 1, gap: 2 }}>
                <div className="row gap-2">
                  <span style={{ fontWeight: 500 }}>{p.name}</span>
                  {p.accepting && <span className="pill pill-green">Accepting students</span>}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{p.title} · {p.dept} · {p.school}</div>
                <div className="row gap-1 mt-1" style={{ flexWrap: "wrap" }}>
                  {p.keywords.slice(0, 3).map(k => <span key={k} className="pill">{k}</span>)}
                </div>
              </div>
              <FMP.ScoreRing value={p.score} size={48}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.Landing = Landing;
