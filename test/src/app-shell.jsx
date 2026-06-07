// Main app: sidebar layout + Matches dashboard
function AppShell({ initial = "matches", onNav, signOut, tier = "free", setTier }) {
  const { Icon } = FMP;
  const [route, setRoute] = React.useState(initial);
  const [selectedProf, setSelectedProf] = React.useState(null);
  const [composing, setComposing] = React.useState(null);
  const [savedIds, setSavedIds] = React.useState(new Set(FMP.professors.filter(p => p.saved).map(p => p.id)));
  React.useEffect(() => { setRoute(initial); }, [initial]);

  // --- Document versioning state ---
  const [cvVersions, setCvVersions] = React.useState(() => [
    { id: "cv1", name: "Master CV",          updatedAt: "2 days ago",  data: window.DEFAULT_CV, label: "Master" },
    { id: "cv2", name: "ETH application",    updatedAt: "1 day ago",   data: window.DEFAULT_CV, label: "Tailored" },
    { id: "cv3", name: "Industry version",   updatedAt: "5 days ago",  data: window.DEFAULT_CV, label: "Variant" },
  ]);
  const [currentCvId, setCurrentCvId] = React.useState("cv2");

  const [sopVersions, setSopVersions] = React.useState(() => [
    { id: "sop1", name: "For Mariam El-Sayed (ETH)", profId: "p1", updatedAt: "1 day ago",  status: "ready", words: 612 },
    { id: "sop2", name: "For Daniel Okonkwo (MIT)",   profId: "p2", updatedAt: "4 days ago", status: "draft", words: 488 },
    { id: "sop3", name: "Generic — multimodal ML",    profId: null, updatedAt: "1 week ago", status: "ready", words: 540 },
  ]);
  const [currentSopId, setCurrentSopId] = React.useState("sop1");
  // Default interests come from onboarding. Default funded=true per user request.
  const [prefs, setPrefs] = React.useState({
    interests: new Set(["ai_ml", "nlp"]),
    fundedOnly: true,
  });
  const togglePref = (id) => {
    const next = new Set(prefs.interests);
    next.has(id) ? next.delete(id) : next.add(id);
    setPrefs({ ...prefs, interests: next });
  };

  const go = (r, opts = {}) => {
    setRoute(r);
    if (opts.prof) setSelectedProf(opts.prof);
    if (opts.compose) setComposing(opts.compose);
  };

  const toggleSave = (id) => {
    const next = new Set(savedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSavedIds(next);
  };

  const navItems = [
    { id: "matches",  label: "Matches",   icon: "Sparkles", badge: 24 },
    { id: "saved",    label: "Saved",     icon: "Bookmark", badge: savedIds.size },
    { id: "outreach", label: "Outreach",  icon: "Inbox",    badge: 5 },
    { id: "profile",  label: "Profile",   icon: "User" },
    { id: "settings", label: "Settings",  icon: "Settings" },
  ];

  return (
    <div className="app">
      <nav className="topnav">
        <div className="brand" onClick={() => onNav("landing")} style={{ cursor: "pointer" }}><Icon.Logo /> Find My Professor</div>
        <div className="row gap-2" style={{ marginLeft: 24, flex: 1, maxWidth: 480 }}>
          <div className="row gap-2" style={{ width: "100%", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--line)", background: "white", color: "var(--ink-4)", fontSize: 13 }}>
            <Icon.Search size={14}/>
            <span style={{ flex: 1 }}>Search professors, labs, papers…</span>
            <span className="kbd">⌘K</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <button className="btn btn-sm" onClick={() => onNav("pricing")}>
            <Icon.Sparkles size={12}/> Upgrade
          </button>
          <button className="btn btn-icon"><Icon.Mail size={14}/></button>
          <FMP.Avatar initials="AC" tone="ink"/>
        </div>
      </nav>

      <div className="main">
        <aside className="sidebar">
          <div className="side-section">Workspace</div>
          {navItems.map(n => {
            const I = Icon[n.icon];
            return (
              <div key={n.id} className={"nav-item" + (route === n.id ? " active" : "")} onClick={() => go(n.id)}>
                <I size={14}/> {n.label}
                {n.badge != null && <span className="nav-badge">{n.badge}</span>}
              </div>
            );
          })}
          <div className="side-section">Discover</div>
          <div className={"nav-item" + (route === "countries" ? " active" : "")} onClick={() => go("countries")}>
            <Icon.Globe size={14}/> Browse by country
          </div>
          <div className={"nav-item" + (route === "reviews" ? " active" : "")} onClick={() => go("reviews")}>
            <Icon.Star size={14}/> Reviews & ratings
          </div>
          <div className={"nav-item" + (route === "hiring" ? " active" : "")} onClick={() => go("hiring")}>
            <Icon.Award size={14}/> Hiring board <window.ProBadge/>
          </div>
          <div className={"nav-item" + (route === "whatsnew" ? " active" : "")} onClick={() => go("whatsnew")}>
            <Icon.Sparkles size={14}/> What's new <window.ProBadge/>
          </div>

          <div className="side-section">Documents</div>
          <div className={"nav-item" + (route === "docs" ? " active" : "")} onClick={() => go("docs")}>
            <Icon.Inbox size={14}/> All documents
            <span className="nav-badge">{cvVersions.length + sopVersions.length}</span>
          </div>
          <div className={"nav-item" + (route === "cv" ? " active" : "")} onClick={() => go("cv")}>
            <Icon.Book size={14}/> CV Maker
          </div>
          <div className={"nav-item" + (route === "sop" ? " active" : "")} onClick={() => go("sop")}>
            <Icon.Sparkles size={14}/> SOP Generator
          </div>

          <div style={{ marginTop: "auto", padding: 12 }}>
            {tier === "free" ? (
              <div className="card" style={{ padding: 14, background: "var(--green-deep)", color: "var(--paper)", border: 0 }}>
                <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 18, fontStyle: "italic", marginBottom: 4 }}>You're on Free</div>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>5 outreach / week. Upgrade for hiring board & live updates.</div>
                <button className="btn btn-sm" style={{ background: "var(--paper)", color: "var(--green-deep)", border: 0, width: "100%", justifyContent: "center" }} onClick={() => onNav("pricing")}>
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
          {route === "matches"  && <Matches go={go} savedIds={savedIds} toggleSave={toggleSave} prefs={prefs} setPrefs={setPrefs} togglePref={togglePref}/>}
          {route === "saved"    && <SavedView go={go} savedIds={savedIds} toggleSave={toggleSave}/>}
          {route === "outreach" && <Outreach go={go}/>}
          {route === "profile"  && <ProfileView/>}
          {route === "settings" && <SettingsView/>}
          {route === "countries"&& <window.Countries go={go}/>}
          {route === "reviews"  && <window.ReviewsFeed go={go}/>}
          {route === "hiring"   && <window.HiringBoard go={go} tier={tier} setTier={setTier} onUpgrade={() => onNav("pricing")}/>}
          {route === "whatsnew" && <window.WhatsNew    go={go} tier={tier} setTier={setTier} onUpgrade={() => onNav("pricing")}/>}
          {route === "cv"       && <window.CVMaker     go={go} versions={cvVersions} setVersions={setCvVersions} currentId={currentCvId} setCurrentId={setCurrentCvId}/>}
          {route === "sop"      && <window.SOPMaker    go={go} versions={sopVersions} setVersions={setSopVersions} currentId={currentSopId} setCurrentId={setCurrentSopId}/>}
          {route === "docs"     && <window.AllDocs     go={go} cvVersions={cvVersions} setCvVersions={setCvVersions} sopVersions={sopVersions} setSopVersions={setSopVersions} setCurrentCvId={setCurrentCvId} setCurrentSopId={setCurrentSopId}/>}
          {route === "profDetail" && <ProfDetail prof={selectedProf} go={go} savedIds={savedIds} toggleSave={toggleSave}/>}
          {route === "compose"  && <Composer prof={composing} go={go}/>}
        </main>
      </div>
    </div>
  );
}

// --- Matches list ---
function Matches({ go, savedIds, toggleSave, prefs, setPrefs, togglePref }) {
  const { Icon } = FMP;
  const [filter, setFilter] = React.useState({ accepting: false, region: "All", sort: "score" });
  const [view, setView] = React.useState("list");
  const [editingInterests, setEditingInterests] = React.useState(false);

  // Build interest keyword set
  const interestKeywords = new Set();
  FMP.INTERESTS.forEach(cat => {
    if (prefs.interests.has(cat.id)) cat.keywords.forEach(k => interestKeywords.add(k.toLowerCase()));
  });

  let profs = [...FMP.professors];
  const noInterests = prefs.interests.size === 0;

  if (!noInterests) {
    profs = profs.filter(p => p.keywords.some(k => interestKeywords.has(k.toLowerCase())));
  }
  if (prefs.fundedOnly) profs = profs.filter(p => !!p.funding);
  if (filter.accepting) profs = profs.filter(p => p.accepting);
  if (filter.region !== "All") profs = profs.filter(p =>
    (filter.region === "Europe"   && ["Switzerland","UK","France"].includes(p.country)) ||
    (filter.region === "Americas" && p.country === "USA") ||
    (filter.region === "Asia"     && p.country === "Japan")
  );
  if (filter.sort === "score") profs.sort((a, b) => b.score - a.score);
  if (filter.sort === "recent") profs.sort((a, b) => b.breakdown.activity - a.breakdown.activity);

  const totalCount = FMP.professors.length;
  const selectedInterests = FMP.INTERESTS.filter(c => prefs.interests.has(c.id));

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="row between" style={{ marginBottom: 24 }}>
        <div>
          <div className="row gap-2" style={{ marginBottom: 8 }}>
            <span className="pill pill-green"><Icon.Dot color="oklch(0.55 0.12 155)"/> Fresh — synced 14 min ago</span>
            <span className="pill pill-outline mono">v23 ranking</span>
          </div>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>
            <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>Good morning, Alex.</span>
          </h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 4 }}>
            {profs.length} of {totalCount} advisors match your preferences{prefs.fundedOnly ? " — funded only" : ""}.
          </p>
        </div>
        <div className="row gap-2">
          <button className="btn"><Icon.Filter size={13}/> Refine</button>
          <button className="btn btn-primary"><Icon.Sparkles size={13}/> Re-rank</button>
        </div>
      </div>

      {/* Preferences bar — interests + funding */}
      <PreferenceBar
        prefs={prefs}
        setPrefs={setPrefs}
        togglePref={togglePref}
        editing={editingInterests}
        setEditing={setEditingInterests}
        selectedInterests={selectedInterests}
      />

      {/* Filter bar */}
      <div className="row gap-2" style={{ margin: "16px 0", flexWrap: "wrap" }}>
        <FilterPill active={filter.accepting} onClick={() => setFilter({ ...filter, accepting: !filter.accepting })} icon="Check">
          Accepting students
        </FilterPill>
        <Dropdown
          label={`Region: ${filter.region}`}
          options={["All", "Americas", "Europe", "Asia"]}
          onPick={v => setFilter({ ...filter, region: v })}/>
        <Dropdown
          label={"Sort: " + (filter.sort === "score" ? "Match score" : "Activity recency")}
          options={[["Match score", "score"], ["Activity recency", "recent"]]}
          onPick={v => setFilter({ ...filter, sort: v })}/>
        <div style={{ marginLeft: "auto" }} className="row gap-1">
          <SegBtn active={view === "list"}  onClick={() => setView("list")}>List</SegBtn>
          <SegBtn active={view === "compare"} onClick={() => setView("compare")}>Compare</SegBtn>
        </div>
      </div>

      {profs.length === 0 ? (
        <EmptyMatches noInterests={noInterests} fundedOnly={prefs.fundedOnly}
          onEdit={() => setEditingInterests(true)}
          onDropFunded={() => setPrefs({ ...prefs, fundedOnly: false })}/>
      ) : view === "list" ? (
        <div className="card" style={{ padding: 0 }}>
          {profs.map((p, i) => (
            <MatchRow key={p.id} prof={p} onOpen={() => go("profDetail", { prof: p })}
              onCompose={() => go("compose", { compose: p })}
              saved={savedIds.has(p.id)}
              onSave={() => toggleSave(p.id)}
              first={i === 0} last={i === profs.length - 1}
              interestKeywords={interestKeywords}/>
          ))}
        </div>
      ) : (
        <Compare profs={profs.slice(0, 3)} go={go}/>
      )}

      <div className="row gap-2 mt-6" style={{ padding: 16, background: "var(--paper-2)", borderRadius: 10, fontSize: 12.5, color: "var(--ink-2)" }}>
        <Icon.Sparkles size={14} color="var(--green-hi)"/>
        <div>Next scheduled crawl: <strong>tomorrow 04:00 UTC</strong>. We're tracking {prefs.interests.size} of your interests across 12 sources. <a style={{ color: "var(--green-deep)", textDecoration: "underline", cursor: "pointer" }} onClick={() => setEditingInterests(true)}>Edit interests →</a></div>
      </div>
    </div>
  );
}

// --- Preference bar (interests + funded toggle) ---
function PreferenceBar({ prefs, setPrefs, togglePref, editing, setEditing, selectedInterests }) {
  const { Icon } = FMP;
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", borderColor: "var(--green-soft-2)" }}>
      <div className="row between" style={{ padding: "14px 18px", background: "linear-gradient(180deg, var(--green-soft) 0%, transparent 100%)" }}>
        <div className="row gap-2" style={{ alignItems: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center" }}>
            <Icon.Sparkles size={14}/>
          </div>
          <div className="col" style={{ gap: 0 }}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>Your research preferences</span>
            <span className="muted" style={{ fontSize: 12 }}>
              Only professors matching these interests {prefs.fundedOnly && <span>— with <strong style={{ color: "var(--green-deep)" }}>active funding</strong></span>} will appear.
            </span>
          </div>
        </div>
        <div className="row gap-2">
          {/* Funded-only toggle */}
          <button
            onClick={() => setPrefs({ ...prefs, fundedOnly: !prefs.fundedOnly })}
            className="row gap-2"
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid " + (prefs.fundedOnly ? "var(--green-deep)" : "var(--line)"),
              background: prefs.fundedOnly ? "var(--green-deep)" : "white",
              color: prefs.fundedOnly ? "var(--paper)" : "var(--ink-2)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
            }}>
            <Icon.Award size={13}/> Funded positions only
            <span style={{
              width: 26, height: 14, borderRadius: 9999, padding: 2,
              background: prefs.fundedOnly ? "oklch(1 0 0 / 0.3)" : "var(--paper-3)",
              display: "inline-block", marginLeft: 4,
            }}>
              <span style={{ display: "block", width: 10, height: 10, background: "white", borderRadius: "50%", marginLeft: prefs.fundedOnly ? 12 : 0, transition: "margin 0.15s" }}/>
            </span>
          </button>
          <button className="btn btn-sm" onClick={() => setEditing(!editing)}>
            {editing ? "Done" : "Edit interests"}
          </button>
        </div>
      </div>

      {!editing ? (
        <div className="row gap-2" style={{ padding: "12px 18px 16px", flexWrap: "wrap", borderTop: "1px solid var(--line)" }}>
          {selectedInterests.length === 0
            ? <span className="muted" style={{ fontSize: 12.5 }}>No interests selected — <a style={{ color: "var(--green-deep)", textDecoration: "underline", cursor: "pointer" }} onClick={() => setEditing(true)}>add some</a> to filter your list.</span>
            : selectedInterests.map(cat => {
                const I = FMP.Icon[cat.icon];
                return (
                  <span key={cat.id} className="row gap-1" style={{
                    padding: "5px 10px 5px 8px",
                    borderRadius: 999,
                    background: "var(--green-deep)",
                    color: "var(--paper)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    alignItems: "center",
                  }}>
                    <I size={12}/> {cat.label}
                    <button onClick={() => togglePref(cat.id)} style={{ background: "transparent", border: 0, color: "var(--paper)", opacity: 0.7, cursor: "pointer", padding: 0, marginLeft: 4, display: "grid", placeItems: "center" }}>
                      <Icon.X size={11}/>
                    </button>
                  </span>
                );
              })}
        </div>
      ) : (
        <div style={{ padding: "12px 18px 18px", borderTop: "1px solid var(--line)" }}>
          <div className="muted" style={{ fontSize: 11.5, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 500 }}>
            Choose research areas — tap to toggle
          </div>
          <div className="row gap-2" style={{ flexWrap: "wrap" }}>
            {FMP.INTERESTS.map(cat => {
              const I = FMP.Icon[cat.icon];
              const on = prefs.interests.has(cat.id);
              return (
                <button key={cat.id}
                  onClick={() => togglePref(cat.id)}
                  className="row gap-1"
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid " + (on ? "var(--green-deep)" : "var(--line)"),
                    background: on ? "var(--green-deep)" : "white",
                    color: on ? "var(--paper)" : "var(--ink-2)",
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}>
                  {on ? <Icon.Check size={12}/> : <I size={12}/>} {cat.label}
                </button>
              );
            })}
          </div>
          <div className="muted" style={{ fontSize: 11.5, marginTop: 12 }}>
            <Icon.Sparkles size={11} color="var(--green-hi)"/> We expand each area into its sub-topics — e.g. <strong>AI / ML</strong> includes NLP, multimodal, RL, CV, causal inference.
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyMatches({ noInterests, fundedOnly, onEdit, onDropFunded }) {
  const { Icon } = FMP;
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

function MatchRow({ prof, onOpen, onCompose, saved, onSave, first, last, interestKeywords }) {
  const { Icon } = FMP;
  const matchKw = (k) => interestKeywords && interestKeywords.has(k.toLowerCase());
  const countryFlags = { "USA": "🇺🇸", "UK": "🇬🇧", "Switzerland": "🇨🇭", "France": "🇫🇷", "Japan": "🇯🇵", "Germany": "🇩🇪", "Canada": "🇨🇦" };
  const flag = countryFlags[prof.country] || "🌐";
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
      <FMP.ScoreRing value={prof.score}/>
      <div className="col" style={{ flex: 1, gap: 6, minWidth: 0 }}>
        {/* Hierarchy crumb: country → university → professor */}
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
          {prof.accepting
            ? <span className="pill pill-green"><Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Accepting</span>
            : <span className="pill pill-outline">Not accepting</span>}
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
        </div>
        <div className="row gap-2" style={{ marginTop: 4, fontSize: 12, color: "var(--ink-2)" }}>
          <Icon.Sparkles size={12} color="var(--green-hi)"/>
          <span>{prof.reasons[0]}</span>
        </div>
        {/* Funding callout — emphasized as the "last step" of the hierarchy */}
        {prof.funding && (
          <div className="row gap-2 mt-2" style={{
            padding: "8px 10px",
            background: "var(--green-soft)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--green-deep)",
            alignItems: "center",
          }}>
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

function FilterPill({ active, icon, onClick, children }) {
  const I = icon ? FMP.Icon[icon] : null;
  return (
    <button className={"chip" + (active ? " selected" : "")} onClick={onClick} style={{ padding: "6px 12px" }}>
      {I && <I size={12}/>}{children}
    </button>
  );
}

function Dropdown({ label, options, onPick }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button className="chip" onClick={() => setOpen(!open)} style={{ padding: "6px 12px" }}>
        {label} <FMP.Icon.ChevronDown size={12}/>
      </button>
      {open && (
        <div className="card fade-in" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, padding: 4, minWidth: 180, zIndex: 5, boxShadow: "var(--shadow-2)" }}>
          {options.map(o => {
            const [lab, val] = Array.isArray(o) ? o : [o, o];
            return (
              <div key={val} className="nav-item" style={{ fontSize: 13 }} onClick={() => { onPick(val); setOpen(false); }}>{lab}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SegBtn({ active, onClick, children }) {
  return (
    <button className="chip" onClick={onClick} style={{ padding: "5px 10px", background: active ? "var(--ink)" : "white", color: active ? "var(--paper)" : "var(--ink-2)", borderColor: active ? "var(--ink)" : "var(--line)" }}>
      {children}
    </button>
  );
}

function Compare({ profs, go }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <table className="table">
        <thead>
          <tr>
            <th>Professor</th>
            <th>Score</th>
            <th>Expertise</th>
            <th>Funding</th>
            <th>Activity</th>
            <th>Reputation</th>
            <th>Accepting</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {profs.map(p => (
            <tr key={p.id} className="clickable" onClick={() => go("profDetail", { prof: p })}>
              <td>
                <div className="row gap-2">
                  <FMP.Avatar initials={p.initials}/>
                  <div className="col" style={{ gap: 0 }}>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{p.school}</span>
                  </div>
                </div>
              </td>
              <td><span className="mono" style={{ fontSize: 16, fontWeight: 500 }}>{p.score}</span></td>
              <td><FMP.Bar value={p.breakdown.expertise}/></td>
              <td><FMP.Bar value={p.breakdown.funding}/></td>
              <td><FMP.Bar value={p.breakdown.activity}/></td>
              <td><FMP.Bar value={p.breakdown.reputation}/></td>
              <td>{p.accepting ? <span className="pill pill-green">Yes</span> : <span className="pill pill-outline">No</span>}</td>
              <td><FMP.Icon.Chevron size={14}/></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SavedView({ go, savedIds, toggleSave }) {
  const profs = FMP.professors.filter(p => savedIds.has(p.id));
  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, letterSpacing: "-0.025em", marginBottom: 8 }}>Saved <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400, color: "var(--ink-3)" }}>({profs.length})</span></h1>
      <p className="muted" style={{ marginBottom: 24 }}>Your shortlist. Drag to reorder, or compare side-by-side.</p>
      {profs.length === 0
        ? <div className="card" style={{ padding: 48, textAlign: "center" }}>
            <FMP.Icon.Bookmark size={32} color="var(--ink-4)"/>
            <h3 style={{ fontSize: 18, marginTop: 12 }}>No saved professors yet</h3>
            <p className="muted" style={{ fontSize: 13 }}>Star matches you want to come back to.</p>
          </div>
        : <div className="card" style={{ padding: 0 }}>
            {profs.map((p, i) => (
              <MatchRow key={p.id} prof={p}
                onOpen={() => go("profDetail", { prof: p })}
                onCompose={() => go("compose", { compose: p })}
                saved={savedIds.has(p.id)}
                onSave={() => toggleSave(p.id)}
                first={i === 0}/>
            ))}
          </div>}
    </div>
  );
}

window.AppShell = AppShell;
