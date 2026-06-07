// Browse-by-country, Reviews, Hiring board, What's new — and shared ProBadge / Paywall

function ProBadge() {
  return (
    <span style={{
      marginLeft: "auto",
      fontSize: 9,
      letterSpacing: "0.06em",
      background: "var(--ink)",
      color: "var(--paper)",
      padding: "2px 5px",
      borderRadius: 4,
      fontWeight: 600,
    }}>PRO</span>
  );
}

function PaywallOverlay({ title, subtitle, onUpgrade, onPreview }) {
  const { Icon } = FMP;
  return (
    <div className="fade-in" style={{ position: "relative", padding: "0 32px" }}>
      {/* Background preview, blurred */}
      <div style={{
        position: "absolute", inset: 0,
        filter: "blur(6px) saturate(0.8)",
        pointerEvents: "none",
        opacity: 0.6,
      }}>{onPreview}</div>

      <div className="card" style={{
        position: "relative",
        maxWidth: 540, margin: "120px auto 0",
        padding: "36px 32px",
        textAlign: "center",
        boxShadow: "var(--shadow-3)",
        border: "1px solid var(--green-soft-2)",
      }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center", margin: "0 auto" }}>
          <Icon.Sparkles size={24}/>
        </div>
        <h2 style={{ fontSize: 24, marginTop: 16, letterSpacing: "-0.02em" }}>
          {title}
        </h2>
        <p className="muted" style={{ fontSize: 14, maxWidth: 360, margin: "10px auto 0", lineHeight: 1.5 }}>
          {subtitle}
        </p>

        <div className="row gap-2" style={{ justifyContent: "center", marginTop: 24 }}>
          <button className="btn btn-primary btn-lg" onClick={onUpgrade}>
            <Icon.Sparkles size={13}/> Upgrade to Pro — $12/mo
          </button>
          <button className="btn btn-lg">7-day free trial</button>
        </div>

        <div className="row gap-4" style={{ justifyContent: "center", marginTop: 24, fontSize: 12, color: "var(--ink-3)" }}>
          <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> No credit card</span>
          <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> Cancel any time</span>
          <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> Student discount −40%</span>
        </div>
      </div>
    </div>
  );
}

// --- Browse by country (free) ---
function Countries({ go }) {
  const { Icon } = FMP;
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState(null);

  const list = FMP.COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.top.join(" ").toLowerCase().includes(q.toLowerCase())
  );

  if (selected) return <CountryDetail country={selected} onBack={() => setSelected(null)} go={go}/>;

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>
            Browse by <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>country</span>
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>
            {FMP.COUNTRIES.length} countries · {FMP.COUNTRIES.reduce((s, c) => s + c.profs, 0).toLocaleString()} indexed professors
          </p>
        </div>
        <div className="row gap-2" style={{ alignItems: "center", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "white", width: 280 }}>
          <Icon.Search size={14} color="var(--ink-4)"/>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search country or university…"
            style={{ border: 0, outline: 0, background: "transparent", flex: 1, fontSize: 13 }}/>
        </div>
      </div>

      {/* World map placeholder strip */}
      <div className="card hatch" style={{ padding: 20, marginBottom: 16, background: "var(--paper-2)", overflow: "hidden", position: "relative" }}>
        <div className="row between">
          <div>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", fontWeight: 500 }}>Most active right now</div>
            <div className="row gap-3" style={{ marginTop: 10 }}>
              {FMP.COUNTRIES.slice(0, 5).map(c => (
                <button key={c.code} className="row gap-2" onClick={() => setSelected(c)} style={{
                  padding: "8px 14px", border: "1px solid var(--line)", background: "white", borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: "pointer"
                }}>
                  <span style={{ fontSize: 16 }}>{c.flag}</span>{c.name}
                  <span className="mono muted" style={{ fontSize: 11 }}>{c.profs.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Country grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {list.map(c => (
          <button key={c.code} onClick={() => setSelected(c)} className="card" style={{
            padding: 20, textAlign: "left", cursor: "pointer", border: "1px solid var(--line)", background: "white",
          }}
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
              <span className="pill pill-outline">+{c.top.length - 3} more</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CountryDetail({ country, onBack, go }) {
  const { Icon } = FMP;
  const localProfs = FMP.professors.filter(p =>
    (country.code === "US" && p.country === "USA") ||
    (country.code === "CH" && p.country === "Switzerland") ||
    (country.code === "GB" && p.country === "UK") ||
    (country.code === "FR" && p.country === "France") ||
    (country.code === "JP" && p.country === "Japan")
  );
  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <button className="btn btn-sm btn-ghost" onClick={onBack} style={{ marginLeft: -8, marginBottom: 16 }}>
        <Icon.Chevron size={12} style={{ transform: "rotate(180deg)" }}/> All countries
      </button>
      <div className="row gap-4" style={{ marginBottom: 28, alignItems: "center" }}>
        <span style={{ fontSize: 56, lineHeight: 1 }}>{country.flag}</span>
        <div>
          <h1 style={{ fontSize: 36, letterSpacing: "-0.025em" }}>{country.name}</h1>
          <div className="row gap-3 muted" style={{ marginTop: 4, fontSize: 14 }}>
            <span><span className="mono" style={{ color: "var(--ink)" }}>{country.unis}</span> universities</span>
            <span><span className="mono" style={{ color: "var(--ink)" }}>{country.profs.toLocaleString()}</span> professors indexed</span>
            <span className="pill pill-green">Updated 14m ago</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: 15, marginBottom: 12 }}>Top universities</h3>
      <div className="card" style={{ padding: 0, marginBottom: 28 }}>
        {country.top.map((u, i) => (
          <div key={u} className="row between" style={{ padding: "16px 20px", borderTop: i ? "1px solid var(--line)" : 0, cursor: "pointer" }}
            onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
            onMouseOut={e => e.currentTarget.style.background = ""}>
            <div className="row gap-3">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--paper-3)", display: "grid", placeItems: "center", fontFamily: '"Instrument Serif", serif', fontStyle: "italic", color: "var(--ink-2)" }}>{u[0]}</div>
              <div>
                <div style={{ fontWeight: 500 }}>{u}</div>
                <div className="muted" style={{ fontSize: 12 }}>{Math.floor(Math.random()*800)+200} professors · {Math.floor(Math.random()*40)+5} new this month</div>
              </div>
            </div>
            <div className="row gap-2">
              <span className="pill pill-outline">{Math.floor(Math.random()*30)+5} openings</span>
              <Icon.Chevron size={14} color="var(--ink-4)"/>
            </div>
          </div>
        ))}
      </div>

      {localProfs.length > 0 && (
        <>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Featured professors</h3>
          <div className="card" style={{ padding: 0 }}>
            {localProfs.map((p, i) => (
              <div key={p.id} className="row gap-3" style={{ padding: 18, borderTop: i ? "1px solid var(--line)" : 0, cursor: "pointer" }}
                onClick={() => go("profDetail", { prof: p })}
                onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
                onMouseOut={e => e.currentTarget.style.background = ""}>
                <FMP.Avatar initials={p.initials}/>
                <div style={{ flex: 1 }}>
                  <div className="row gap-2"><span style={{ fontWeight: 500 }}>{p.name}</span><span className="muted">· {p.school}</span></div>
                  <div className="row gap-1 mt-1" style={{ flexWrap: "wrap" }}>
                    {p.keywords.slice(0, 3).map(k => <span key={k} className="pill">{k}</span>)}
                  </div>
                </div>
                <FMP.ScoreRing value={p.score} size={44}/>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// --- Reviews feed (free) ---
function ReviewsFeed({ go }) {
  const { Icon } = FMP;
  const [filter, setFilter] = React.useState("all");
  const byId = Object.fromEntries(FMP.professors.map(p => [p.id, p]));
  let items = FMP.REVIEWS.flatMap(r => r.snippets.map(s => ({ ...s, profId: r.profId, profRating: r.rating, profN: r.n, prof: byId[r.profId] })));
  if (filter === "4+") items = items.filter(i => i.stars >= 4);
  if (filter === "recent") items = items.slice().sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 920, margin: "0 auto" }}>
      <div className="row between" style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>
          Reviews & <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>ratings</span>
        </h1>
        <span className="pill pill-outline">Free</span>
      </div>
      <p className="muted" style={{ marginBottom: 24 }}>
        Verified reviews from former and current students. Submitted anonymously, moderated for tone.
      </p>

      <div className="row gap-2" style={{ marginBottom: 16 }}>
        {[["all", "All"], ["4+", "4+ stars"], ["recent", "Most recent"]].map(([id, l]) => (
          <button key={id} className={"chip " + (filter === id ? "selected" : "")} onClick={() => setFilter(id)}>{l}</button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button className="btn btn-sm"><Icon.Plus size={12}/> Write a review</button>
        </div>
      </div>

      <div className="col gap-3">
        {items.map((s, i) => (
          <div key={i} className="card" style={{ padding: 18 }}>
            <div className="row gap-3" style={{ marginBottom: 10, cursor: "pointer" }} onClick={() => go("profDetail", { prof: s.prof })}>
              <FMP.Avatar initials={s.prof.initials}/>
              <div style={{ flex: 1 }}>
                <div className="row gap-2"><span style={{ fontWeight: 500 }}>{s.prof.name}</span><span className="muted" style={{ fontSize: 12 }}>· {s.prof.school}</span></div>
                <div className="row gap-2 mt-1" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  <Stars n={s.profRating}/>
                  <span className="mono">{s.profRating.toFixed(1)}</span>
                  <span>· {s.profN} reviews</span>
                </div>
              </div>
              <button className="btn btn-sm">View profile</button>
            </div>

            <div style={{ paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <div className="row between" style={{ marginBottom: 6 }}>
                <div className="row gap-2">
                  <Stars n={s.stars}/>
                  <span className="muted" style={{ fontSize: 12 }}>{s.role}</span>
                </div>
                <span className="muted" style={{ fontSize: 12 }}>{s.time}</span>
              </div>
              <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 16, color: "var(--ink-2)", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                "{s.text}"
              </p>
              <div className="row gap-3 mt-3" style={{ fontSize: 12, color: "var(--ink-3)" }}>
                <button className="btn btn-sm btn-ghost"><Icon.Check size={12}/> Helpful · {s.helpful}</button>
                <button className="btn btn-sm btn-ghost"><Icon.Reply size={12}/> Reply</button>
                <button className="btn btn-sm btn-ghost"><Icon.X size={12}/> Report</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stars({ n }) {
  const full = Math.floor(n);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) =>
        i < full
          ? <FMP.Icon.StarF key={i} size={12} color="oklch(0.7 0.13 75)"/>
          : <FMP.Icon.Star key={i} size={12} color="var(--ink-4)"/>)}
    </span>
  );
}
window.Stars = Stars;

// --- Hiring board (PRO) ---
function HiringBoard({ go, tier, setTier, onUpgrade }) {
  const { Icon } = FMP;
  const byId = Object.fromEntries(FMP.professors.map(p => [p.id, p]));
  const items = FMP.HIRINGS.map(h => ({ ...h, prof: byId[h.profId] }));

  if (tier === "free") {
    return (
      <PaywallOverlay
        title="Hiring board is a Pro feature"
        subtitle="See live openings: PhD slots, postdoc positions, research-engineer roles — with stipends, deadlines, and direct application links. Updated daily."
        onUpgrade={onUpgrade}
        onPreview={renderHiringBoardContent({ items, go, locked: true })}
      />
    );
  }

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      {renderHiringBoardContent({ items, go, locked: false })}
    </div>
  );
}

function renderHiringBoardContent({ items, go, locked }) {
  const { Icon } = FMP;
  const urgencyMeta = {
    new:     { pill: "pill-green", label: "New" },
    closing: { pill: "pill-amber", label: "Closing soon" },
    rolling: { pill: "pill-blue",  label: "Rolling" },
    open:    { pill: "pill-outline", label: "Open" },
  };
  return (
    <>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <span className="pill pill-green"><Icon.Award size={11}/> {items.length} openings · {items.reduce((s, i) => s + i.slots, 0)} slots</span>
            <span className="pill pill-outline">Updated 14m ago</span>
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>
            Hiring <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>board</span>
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Funded positions posted by labs in your interests. Apply directly or draft AI outreach.
          </p>
        </div>
        <div className="row gap-2">
          <button className="btn"><Icon.Filter size={13}/> Filter</button>
          <button className="btn btn-primary"><Icon.Mail size={13}/> Get email alerts</button>
        </div>
      </div>

      <div className="row gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {["All", "PhD", "Postdoc", "Research Engineer", "Fully funded"].map(t => (
          <span key={t} className={"chip " + (t === "All" ? "selected" : "")}>{t}</span>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {items.map((h, i) => {
          const u = urgencyMeta[h.urgency];
          return (
            <div key={h.id} className="row gap-4" style={{ padding: 20, borderTop: i ? "1px solid var(--line)" : 0, cursor: locked ? "default" : "pointer" }}>
              <div className="col center" style={{ minWidth: 60, alignItems: "flex-start" }}>
                <FMP.Avatar initials={h.prof.initials}/>
                <span className="muted mono" style={{ fontSize: 11, marginTop: 6 }}>{h.slots} slot{h.slots > 1 ? "s" : ""}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="row gap-2" style={{ alignItems: "baseline", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 500, fontSize: 15 }}>{h.title}</span>
                  <span className={"pill " + u.pill}>{u.label}</span>
                </div>
                <div className="muted mt-1" style={{ fontSize: 12.5 }}>
                  <Icon.Building size={11} style={{ verticalAlign: "-2px", marginRight: 4 }}/>
                  {h.prof.name} · {h.prof.school}, {h.prof.country}
                </div>
                <div className="row gap-3 mt-2" style={{ fontSize: 12, color: "var(--ink-2)" }}>
                  <span className="row gap-1"><Icon.Award size={12} color="var(--green-hi)"/>{h.funding}</span>
                </div>
                <div className="row gap-3 mt-2" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                  <span className="row gap-1"><Icon.Clock size={11}/> Deadline: <strong style={{ color: "var(--ink-2)" }}>{h.deadline}</strong></span>
                  <span>· Posted {h.posted}</span>
                </div>
              </div>
              <div className="col gap-2" style={{ alignItems: "flex-end" }}>
                <button className="btn btn-sm"><Icon.ExternalLink size={12}/> Apply</button>
                <button className="btn btn-sm btn-primary" onClick={() => !locked && go("compose", { compose: h.prof })}>
                  <Icon.Send size={12}/> Draft email
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// --- What's new (PRO) ---
function WhatsNew({ go, tier, setTier, onUpgrade }) {
  const { Icon } = FMP;
  const byId = Object.fromEntries(FMP.professors.map(p => [p.id, p]));
  const items = FMP.WHATSNEW.map(w => ({ ...w, prof: w.profId ? byId[w.profId] : null }));

  if (tier === "free") {
    return (
      <PaywallOverlay
        title="Live updates are a Pro feature"
        subtitle="Get a daily feed of newly indexed professors, fresh papers, new grants, and live score changes — for labs in your interests. Be first to reach out."
        onUpgrade={onUpgrade}
        onPreview={renderWhatsNewContent({ items, go })}
      />
    );
  }

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 920, margin: "0 auto" }}>
      {renderWhatsNewContent({ items, go })}
    </div>
  );
}

function renderWhatsNewContent({ items, go }) {
  const { Icon } = FMP;
  const meta = {
    "new-prof":    { icon: "User",     tint: "var(--green)",  label: "New professor" },
    "new-grant":   { icon: "Award",    tint: "oklch(0.65 0.13 75)",   label: "New grant" },
    "new-paper":   { icon: "Book",     tint: "var(--blue)",   label: "New paper" },
    "new-opening": { icon: "Building", tint: "oklch(0.55 0.13 320)",  label: "New opening" },
    "score-up":    { icon: "Trend",    tint: "var(--green-hi)", label: "Score change" },
  };
  return (
    <>
      <div className="row between" style={{ marginBottom: 20 }}>
        <div>
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <span className="pill pill-green"><Icon.Dot color="oklch(0.55 0.12 155)"/> Live · {items.length} updates today</span>
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>
            What's <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>new</span>
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>
            Newly indexed records and changes that touch your interests.
          </p>
        </div>
        <button className="btn btn-primary"><Icon.Mail size={13}/> Email me a daily digest</button>
      </div>

      <div className="row gap-2" style={{ marginBottom: 16, flexWrap: "wrap" }}>
        {["All", "New profs", "New grants", "New papers", "Openings"].map((t, i) => (
          <span key={t} className={"chip " + (i === 0 ? "selected" : "")}>{t}</span>
        ))}
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: 0 }}>
        {items.map((it, i) => {
          const m = meta[it.type];
          const I = Icon[m.icon];
          return (
            <div key={i} className="row gap-3" style={{ padding: 18, borderTop: i ? "1px solid var(--line)" : 0, cursor: it.prof ? "pointer" : "default" }}
              onClick={() => it.prof && go("profDetail", { prof: it.prof })}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: m.tint + "20", color: m.tint, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <I size={16}/>
              </div>
              <div style={{ flex: 1 }}>
                <div className="row gap-2" style={{ alignItems: "baseline" }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{it.title}</span>
                  <span className="pill" style={{ background: m.tint + "20", color: m.tint }}>{m.label}</span>
                </div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{it.note}</div>
                {it.prof && (
                  <div className="row gap-2 mt-2" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                    <FMP.Avatar initials={it.prof.initials} size="sm"/>
                    <span>{it.prof.name} · {it.prof.school}</span>
                  </div>
                )}
              </div>
              <span className="muted mono" style={{ fontSize: 11, alignSelf: "flex-start" }}>{it.time}</span>
            </div>
          );
        })}
      </div>

      <div className="card mt-6" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
        <Icon.Clock size={16} color="var(--green-hi)"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>Next crawl in 3h 22m</div>
          <div className="muted" style={{ fontSize: 12 }}>You're tracking 8 interests across 12 sources. Last full sync was 14 minutes ago.</div>
        </div>
        <button className="btn">Sync sources</button>
      </div>
    </>
  );
}

window.ProBadge = ProBadge;
window.Countries = Countries;
window.ReviewsFeed = ReviewsFeed;
window.HiringBoard = HiringBoard;
window.WhatsNew = WhatsNew;
