// Professor detail view + email composer + outreach tracker
function ProfDetail({ prof, go, savedIds, toggleSave }) {
  if (!prof) return null;
  const { Icon } = FMP;
  const saved = savedIds.has(prof.id);

  return (
    <div className="fade-in">
      {/* Header band */}
      <div style={{ padding: "20px 32px 0", borderBottom: "1px solid var(--line)" }}>
        <button className="btn btn-sm btn-ghost" onClick={() => go("matches")} style={{ marginBottom: 16, marginLeft: -8 }}>
          <Icon.Chevron size={12} style={{ transform: "rotate(180deg)" }}/> Back to matches
        </button>
        <div className="row gap-4" style={{ alignItems: "flex-start", maxWidth: 1100, margin: "0 auto" }}>
          <FMP.Avatar initials={prof.initials} size="xl"/>
          <div style={{ flex: 1 }}>
            <div className="row gap-2" style={{ marginBottom: 4 }}>
              {prof.accepting
                ? <span className="pill pill-green"><Icon.Dot color="oklch(0.5 0.12 155)" size={6}/> Accepting students</span>
                : <span className="pill pill-outline">Not accepting</span>}
              <span className="pill pill-outline">{prof.title}</span>
              <span className="pill pill-outline mono">h-index {prof.hIndex}</span>
            </div>
            <h1 style={{ fontSize: 36, letterSpacing: "-0.025em" }}>{prof.name}</h1>
            <div className="row gap-2 mt-1 muted" style={{ fontSize: 14 }}>
              <Icon.Building size={14}/> {prof.dept} · {prof.school} · {prof.country}
            </div>
            <div className="row gap-3 mt-3" style={{ fontSize: 13 }}>
              <a className="row gap-1" style={{ color: "var(--green-deep)" }}><Icon.Globe size={13}/> {prof.homepage}</a>
              <a className="row gap-1" style={{ color: "var(--green-deep)" }}><Icon.Mail size={13}/> {prof.email}</a>
              <a className="row gap-1" style={{ color: "var(--green-deep)" }}><Icon.ExternalLink size={13}/> Google Scholar</a>
              <a className="row gap-1" style={{ color: "var(--green-deep)" }}><Icon.ExternalLink size={13}/> ORCID</a>
            </div>
          </div>
          <div className="col gap-2" style={{ alignItems: "flex-end" }}>
            <FMP.ScoreRing value={prof.score} size={72}/>
            <span className="mono muted" style={{ fontSize: 11 }}>match score</span>
          </div>
        </div>
        <div className="row gap-2 mt-6" style={{ maxWidth: 1100, margin: "24px auto 0", padding: 0 }}>
          <button className="btn btn-primary" onClick={() => go("compose", { compose: prof })}>
            <Icon.Send size={13}/> Draft outreach email
          </button>
          <button className="btn" onClick={() => go("sop")}>
            <Icon.Sparkles size={13}/> Generate SOP for this lab
          </button>
          <button className="btn" onClick={() => toggleSave(prof.id)}>
            {saved ? <Icon.StarF size={14} color="oklch(0.7 0.13 75)"/> : <Icon.Star size={14}/>}
            {saved ? "Saved" : "Save to shortlist"}
          </button>
          <button className="btn"><Icon.Plus size={13}/> Add to comparison</button>
          <div style={{ marginLeft: "auto" }}>
            <button className="btn btn-ghost"><Icon.ExternalLink size={13}/> View source data</button>
          </div>
        </div>
        <div className="tabs" style={{ maxWidth: 1100, margin: "20px auto 0" }}>
          <div className="tab active">Overview</div>
          <div className="tab">Publications <span className="mono muted">· 64</span></div>
          <div className="tab">Grants <span className="mono muted">· 3 active</span></div>
          <div className="tab">Students <span className="mono muted">· 12</span></div>
          <div className="tab">Notes</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "28px 32px 64px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        {/* Main column */}
        <div className="col gap-4">
          {/* Why this match */}
          <div className="card" style={{ padding: 24 }}>
            <div className="row between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 16 }}><Icon.Sparkles size={14} color="var(--green-hi)" style={{ verticalAlign: "-2px", marginRight: 6 }}/> Why this match</h3>
              <span className="pill pill-outline mono">v23 ranking</span>
            </div>
            <ol style={{ paddingLeft: 18, margin: 0, color: "var(--ink-2)", fontSize: 13.5, lineHeight: 1.7 }}>
              {prof.reasons.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
            </ol>
            <div className="mt-4" style={{ padding: 14, borderRadius: 8, background: "var(--paper-2)" }}>
              <div className="row between" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 500 }}>Score breakdown</span>
                <span className="mono muted" style={{ fontSize: 11 }}>weighted: expertise·40 / funding·30 / activity·20 / reputation·10</span>
              </div>
              <div className="col gap-3">
                <FMP.Bar value={prof.breakdown.expertise}  label="Expertise match"/>
                <FMP.Bar value={prof.breakdown.funding}    label="Funding likelihood"/>
                <FMP.Bar value={prof.breakdown.activity}   label="Activity recency"/>
                <FMP.Bar value={prof.breakdown.reputation} label="Reputation"/>
              </div>
            </div>
          </div>

          {/* Recent papers */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}><Icon.Book size={14} style={{ verticalAlign: "-2px", marginRight: 6 }}/> Recent publications</h3>
            {[
              { t: prof.lastPaper, v: "NeurIPS 2025", c: 42, ago: "3 months ago", hi: true },
              { t: "Cross-Modal Alignment via Programmatic Verifiers", v: "ACL 2025", c: 28, ago: "6 months ago" },
              { t: "Long-Context Memory for Vision–Language Agents", v: "EMNLP 2024", c: 87, ago: "1 year ago" },
              { t: "Causal Probing of Multimodal Embeddings", v: "ICLR 2024", c: 134, ago: "1 year ago" },
            ].map((p, i) => (
              <div key={i} className="row gap-3" style={{ padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                <div className="col" style={{ flex: 1, gap: 4 }}>
                  <div className="row gap-2">
                    <span style={{ fontWeight: 450, fontSize: 14, color: p.hi ? "var(--green-deep)" : undefined }}>{p.t}</span>
                    {p.hi && <span className="pill pill-green">Cited in your draft</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>{p.v} · {p.ago} · <span className="mono">{p.c} citations</span></div>
                </div>
                <button className="btn btn-sm btn-ghost"><Icon.ExternalLink size={12}/></button>
              </div>
            ))}
          </div>

          {/* Advising notes */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}><Icon.User size={14} style={{ verticalAlign: "-2px", marginRight: 6 }}/> Advising style</h3>
            <p style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 18, color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>
              "{prof.advisingStyle}"
            </p>
            <div className="row gap-2 mt-4" style={{ flexWrap: "wrap" }}>
              <span className="pill pill-outline">Group size: ~12</span>
              <span className="pill pill-outline">Avg PhD time: 4.8 yrs</span>
              <span className="pill pill-outline">Last graduate: 2024</span>
              <span className="pill pill-outline">Industry connections: Google DeepMind, Anthropic</span>
            </div>
          </div>

          {/* Reviews */}
          <ProfReviews profId={prof.id}/>
        </div>

        {/* Right column */}
        <div className="col gap-4">
          {/* Funding card */}
          <div className="card" style={{ padding: 20 }}>
            <div className="row between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", fontWeight: 500 }}>Active funding</span>
              <span className="pill pill-green">3 active</span>
            </div>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 22, lineHeight: 1.2, color: "var(--ink)" }}>{prof.funding}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>Indicates likely funded openings through grant end-date.</div>
            <div className="mt-4" style={{ height: 1, background: "var(--line)" }}/>
            <div className="row between mt-3" style={{ fontSize: 12 }}>
              <span className="muted">Total active</span>
              <span className="mono" style={{ fontWeight: 500 }}>€2.4M</span>
            </div>
            <div className="row between mt-2" style={{ fontSize: 12 }}>
              <span className="muted">Open postings</span>
              <span className="pill pill-green">2 PhD slots</span>
            </div>
          </div>

          {/* Keywords */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", fontWeight: 500, marginBottom: 10 }}>Research keywords</div>
            <div className="row gap-1" style={{ flexWrap: "wrap" }}>
              {prof.keywords.map(k => <span key={k} className="pill">{k}</span>)}
              <span className="pill pill-outline">+ 6 more</span>
            </div>
          </div>

          {/* Data sources */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", fontWeight: 500, marginBottom: 10 }}>Data sources</div>
            <div className="col gap-2">
              {prof.sources.map(s => (
                <div key={s} className="row between" style={{ fontSize: 12.5 }}>
                  <span className="row gap-2"><Icon.Dot color="var(--green)" size={6}/>{s}</span>
                  <span className="muted mono" style={{ fontSize: 11 }}>synced 14m ago</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          <div className="card hatch" style={{ padding: 20, background: "var(--green-deep)", color: "var(--paper)", border: 0, position: "relative", overflow: "hidden" }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontSize: 20, marginBottom: 6 }}>Ready to write?</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 14, lineHeight: 1.5 }}>
              We'll pre-fill a draft referencing the {prof.lastPaper.split(" ").slice(0, 4).join(" ")}… paper.
            </div>
            <button className="btn" style={{ background: "var(--paper)", color: "var(--green-deep)", border: 0, width: "100%", justifyContent: "center" }} onClick={() => go("compose", { compose: prof })}>
              <Icon.Sparkles size={13}/> Draft email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Email composer ---
function Composer({ prof, go }) {
  const { Icon } = FMP;
  const [phase, setPhase] = React.useState("idle"); // idle | generating | ready | sent
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [opts, setOpts] = React.useState({ tone: "Earnest", length: "Concise", referencePaper: true, includeCV: true });

  if (!prof) {
    React.useEffect(() => go("matches"), []);
    return null;
  }

  const draft = () => {
    setPhase("generating");
    setTimeout(() => {
      setSubject(`PhD inquiry — alignment with your ${prof.lastPaper.split("(")[0].trim()} work`);
      setBody(generateDraft(prof, opts));
      setPhase("ready");
    }, 1400);
  };

  return (
    <div className="fade-in composer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", height: "calc(100vh - 56px)" }}>
      {/* Main editor */}
      <div className="col" style={{ overflow: "hidden" }}>
        <div className="row between" style={{ padding: "16px 32px", borderBottom: "1px solid var(--line)" }}>
          <button className="btn btn-sm btn-ghost" onClick={() => go("profDetail", { prof })}>
            <Icon.Chevron size={12} style={{ transform: "rotate(180deg)" }}/> Back
          </button>
          <div className="row gap-2 muted" style={{ fontSize: 12 }}>
            <span className="row gap-1"><Icon.Check size={12} color="var(--green)"/> Auto-saved</span>
            <span className="kbd">⌘ Enter</span> send
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "32px" }}>
          <div className="email-thread" style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line)" }}>
              <Field label="To">
                <div className="row gap-2">
                  <FMP.Avatar initials={prof.initials}/>
                  <div className="col" style={{ gap: 0 }}>
                    <span style={{ fontWeight: 500, fontSize: 13.5 }}>{prof.name}</span>
                    <span className="muted mono" style={{ fontSize: 12 }}>{prof.email}</span>
                  </div>
                </div>
              </Field>
            </div>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--line)" }}>
              <Field label="Subject">
                {phase === "generating"
                  ? <SkeletonLine w={"70%"}/>
                  : <input className="input" style={{ border: 0, padding: 0, fontSize: 16, fontWeight: 500 }}
                      placeholder="Click 'Draft with AI' to generate"
                      value={subject} onChange={e => setSubject(e.target.value)}/>}
              </Field>
            </div>
            <div style={{ padding: "20px", minHeight: 320 }}>
              {phase === "idle" && <ComposerEmptyState onDraft={draft}/>}
              {phase === "generating" && <ComposerGenerating prof={prof}/>}
              {(phase === "ready" || phase === "sent") && (
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 320,
                    border: 0,
                    outline: 0,
                    resize: "vertical",
                    fontSize: 14,
                    lineHeight: 1.65,
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    background: "transparent",
                  }}
                />
              )}
              {phase === "ready" && (
                <div className="mt-4" style={{ padding: 12, background: "var(--green-soft)", borderRadius: 8, fontSize: 12, color: "var(--green-deep)" }}>
                  <Icon.Check size={12}/> Grounded in: <strong>{prof.lastPaper}</strong> · grant: <strong>{prof.funding.split("·")[0]}</strong>
                </div>
              )}
            </div>

            {phase !== "idle" && phase !== "generating" && (
              <div className="row between" style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", background: "var(--paper-2)" }}>
                <div className="row gap-2">
                  <button className="btn btn-sm"><Icon.Plus size={12}/> Attach CV</button>
                  <button className="btn btn-sm" onClick={draft}><Icon.Sparkles size={12}/> Regenerate</button>
                </div>
                <div className="row gap-2">
                  <button className="btn btn-sm">Save draft</button>
                  <button className="btn btn-sm btn-primary" onClick={() => setPhase("sent")}>
                    <Icon.Send size={12}/> {phase === "sent" ? "Sent ✓" : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {phase === "sent" && (
            <div className="card fade-in" style={{ maxWidth: 720, margin: "16px auto 0", padding: 18, borderColor: "oklch(0.85 0.04 155)", background: "var(--green-soft)" }}>
              <div className="row gap-3">
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center" }}>
                  <Icon.Check size={16}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>Sent to {prof.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>We'll auto-follow-up in 7 days if no reply. Tracking opens & clicks.</div>
                </div>
                <button className="btn btn-sm" onClick={() => go("outreach")}>View in outreach →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Side panel */}
      <aside style={{ borderLeft: "1px solid var(--line)", background: "var(--paper-2)", padding: 20, overflow: "auto" }}>
        <div className="row gap-2" style={{ marginBottom: 4 }}>
          <Icon.Sparkles size={14} color="var(--green-hi)"/>
          <span style={{ fontWeight: 500, fontSize: 13 }}>AI assist</span>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>
          Tune voice and grounding. We only use facts from the database.
        </p>

        <div className="mt-4">
          <label className="label">Tone</label>
          <div className="row gap-1" style={{ flexWrap: "wrap" }}>
            {["Earnest", "Formal", "Direct", "Curious"].map(t => (
              <span key={t} className={"chip " + (opts.tone === t ? "selected" : "")} onClick={() => setOpts({ ...opts, tone: t })}>{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="label">Length</label>
          <div className="row gap-1">
            {["Brief", "Concise", "Detailed"].map(t => (
              <span key={t} className={"chip " + (opts.length === t ? "selected" : "")} onClick={() => setOpts({ ...opts, length: t })}>{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-6" style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", marginBottom: 10, fontWeight: 500 }}>Reference material</div>
          <Toggle label="Recent paper" sub={prof.lastPaper} checked={opts.referencePaper} onChange={v => setOpts({ ...opts, referencePaper: v })}/>
          <Toggle label="Your CV"      sub="alex_chen_cv.pdf" checked={opts.includeCV} onChange={v => setOpts({ ...opts, includeCV: v })}/>
          <Toggle label="Active grant" sub={prof.funding.split("·")[0].trim()} checked={true}/>
        </div>

        <div className="mt-6" style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", marginBottom: 10, fontWeight: 500 }}>Follow-up</div>
          <Toggle label="Auto follow-up" sub="If no reply within 7 days" checked={true}/>
          <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            Will only send if the professor opened the first email. Polite tone, references new papers if any.
          </div>
        </div>

        <div className="mt-6" style={{ padding: 14, background: "white", borderRadius: 8, border: "1px solid var(--line)", fontSize: 11.5, color: "var(--ink-3)" }}>
          <Icon.Award size={13} style={{ verticalAlign: "-2px", color: "var(--green-hi)" }}/> <strong>Spam guard:</strong> we throttle to 30 emails/day per sender. SPF & DKIM auto-configured.
        </div>
      </aside>
    </div>
  );
}

function ComposerEmptyState({ onDraft }) {
  return (
    <div className="col center" style={{ minHeight: 320, gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-soft)", display: "grid", placeItems: "center" }}>
        <FMP.Icon.Sparkles size={24} color="var(--green-deep)"/>
      </div>
      <div className="col center" style={{ gap: 6, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 500 }}>Draft with AI?</div>
        <div className="muted" style={{ fontSize: 13, maxWidth: 360 }}>
          We'll write a first version using their most recent paper, active grants, and your interests. You'll edit before sending.
        </div>
      </div>
      <div className="row gap-2 mt-2">
        <button className="btn btn-primary" onClick={onDraft}><FMP.Icon.Sparkles size={13}/> Draft with AI</button>
        <button className="btn">Start from scratch</button>
      </div>
    </div>
  );
}

function ComposerGenerating({ prof }) {
  const steps = [
    "Pulling recent papers from Semantic Scholar…",
    "Checking active grants…",
    "Matching your interests to their work…",
    "Composing…",
  ];
  const [stepIdx, setStepIdx] = React.useState(0);
  React.useEffect(() => {
    if (stepIdx < steps.length - 1) {
      const t = setTimeout(() => setStepIdx(stepIdx + 1), 320);
      return () => clearTimeout(t);
    }
  }, [stepIdx]);
  return (
    <div className="col" style={{ minHeight: 320, gap: 14, padding: "20px 0" }}>
      {steps.map((s, i) => (
        <div key={i} className="row gap-3" style={{ opacity: i <= stepIdx ? 1 : 0.35, transition: "opacity 0.2s" }}>
          {i < stepIdx
            ? <FMP.Icon.Check size={14} color="var(--green)"/>
            : i === stepIdx
              ? <span style={{ width: 14, height: 14, borderRadius: 999, border: "2px solid var(--line)", borderTopColor: "var(--green-deep)", display: "inline-block", animation: "spin 0.8s linear infinite" }}/>
              : <span style={{ width: 14, height: 14, borderRadius: 999, border: "2px solid var(--line)" }}/>}
          <span style={{ fontSize: 13.5 }}>{s}</span>
        </div>
      ))}
      <div className="mt-4" style={{ display: "flex", flexDirection: "column", gap: 6, opacity: 0.4 }}>
        <SkeletonLine w="80%"/>
        <SkeletonLine w="95%"/>
        <SkeletonLine w="60%"/>
        <SkeletonLine w="85%"/>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function SkeletonLine({ w = "70%" }) {
  return <div style={{ height: 10, width: w, background: "linear-gradient(90deg, var(--paper-3), var(--paper-2), var(--paper-3))", backgroundSize: "200% 100%", animation: "shimmer 1.4s linear infinite", borderRadius: 4 }}/>;
}

function Field({ label, children }) {
  return (
    <div className="row gap-3">
      <div style={{ width: 60, color: "var(--ink-4)", fontSize: 12 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Toggle({ label, sub, checked, onChange }) {
  return (
    <div className="row between" style={{ padding: "8px 0" }}>
      <div className="col" style={{ gap: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 450 }}>{label}</span>
        {sub && <span className="muted" style={{ fontSize: 11.5 }}>{sub}</span>}
      </div>
      <button onClick={() => onChange && onChange(!checked)} style={{
        width: 32, height: 18, borderRadius: 9999,
        background: checked ? "var(--green-deep)" : "var(--paper-3)",
        border: 0, padding: 2, cursor: "pointer", transition: "background 0.15s",
      }}>
        <span style={{ display: "block", width: 14, height: 14, background: "white", borderRadius: "50%", marginLeft: checked ? 14 : 0, transition: "margin 0.15s" }}/>
      </button>
    </div>
  );
}

function generateDraft(prof, opts) {
  const lastName = prof.name.replace(/^(Dr\.|Prof\.)\s*/, "").split(" ").pop();
  const paperShort = prof.lastPaper.replace(/\s*\([^)]*\)\s*$/, "");
  const intro = opts.tone === "Direct"
    ? `Dear Prof. ${lastName},\n\nI'm writing because I want to do a PhD in your group.`
    : `Dear Prof. ${lastName},\n\nI hope this finds you well — I'm Alex Chen, a final-year BSc student at the University of Washington.`;

  const body = `

I read your recent paper, "${paperShort}", with real interest — the way you handle grounded reasoning across modalities is closer to my own thinking than anything I've read this year. My undergrad thesis built a small vision–language model for chart understanding, which had similar failures around fine-grained spatial composition.

I noticed your ${prof.funding.split("·")[0].trim()} grant runs through ${prof.funding.match(/\d{4}–\d{4}/)?.[0]?.split("–")[1] || "2028"} and that your group page mentions openings. Could I ask whether you're considering students for ${opts.length === "Brief" ? "Fall 2026" : "the Fall 2026 cohort"}? I've attached a brief CV and a one-page research statement.

${opts.length === "Detailed" ? "\nA few specific directions I'd love to discuss:\n• Tactile-style grounding for VLMs in interactive settings\n• How verifier-based reasoning fares vs. self-consistency in agent loops\n• Whether the methods in your paper transfer to small (<3B) models\n\n" : ""}Thank you for your time. I understand how many of these emails you must receive, and I'd be grateful for even a brief reply.

Warmly,
Alex Chen
University of Washington · BSc Computer Science, 2024
alex.chen@uw.edu`;

  return intro + body;
}

// --- Outreach tracker ---
function Outreach({ go }) {
  const { Icon } = FMP;
  const [tab, setTab] = React.useState("all");
  const byId = Object.fromEntries(FMP.professors.map(p => [p.id, p]));
  let items = FMP.outreach.map(o => ({ ...o, prof: byId[o.profId] }));
  if (tab !== "all") items = items.filter(i => i.status === tab);

  const stats = [
    { label: "Sent",      v: 5,  c: "var(--ink)" },
    { label: "Open rate", v: "60%", c: "var(--blue)" },
    { label: "Replies",   v: "1 (20%)", c: "var(--green)" },
    { label: "Bounces",   v: "1 (20%)", c: "var(--red)" },
  ];

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="row between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>Outreach</h1>
          <p className="muted" style={{ marginTop: 6 }}>Sent emails, replies, and your follow-up queue.</p>
        </div>
        <button className="btn btn-primary" onClick={() => go("matches")}>
          <Icon.Plus size={13}/> New outreach
        </button>
      </div>

      <div className="row gap-2" style={{ marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 18 }}>
            <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 500, marginTop: 4, letterSpacing: "-0.02em", color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom: 12 }}>
        {[
          ["all", "All", FMP.outreach.length],
          ["replied", "Replied", 1],
          ["opened", "Opened", 1],
          ["no-reply", "No reply", 2],
          ["bounced", "Bounced", 1],
        ].map(([id, l, n]) => (
          <div key={id} className={"tab " + (tab === id ? "active" : "")} onClick={() => setTab(id)}>
            {l} <span className="mono muted" style={{ marginLeft: 4 }}>· {n}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Engagement</th>
              <th>Sent</th>
              <th>Next</th>
            </tr>
          </thead>
          <tbody>
            {items.map(o => {
              const meta = FMP.statusMeta[o.status];
              return (
                <tr key={o.id} className="clickable" onClick={() => go("profDetail", { prof: o.prof })}>
                  <td>
                    <div className="row gap-2">
                      <FMP.Avatar initials={o.prof.initials}/>
                      <div className="col" style={{ gap: 0 }}>
                        <span style={{ fontWeight: 500 }}>{o.prof.name}</span>
                        <span className="muted" style={{ fontSize: 11 }}>{o.prof.school}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.subject}</td>
                  <td><span className={"pill " + meta.pill}><FMP.Icon.Dot color={meta.dot} size={6}/>{meta.label}</span></td>
                  <td>
                    <div className="row gap-3" style={{ fontSize: 12 }}>
                      <span className="row gap-1 muted"><Icon.Eye size={12}/>{o.opens}</span>
                      <span className="row gap-1 muted"><Icon.ExternalLink size={11}/>{o.clicks}</span>
                      {o.status === "replied" && <span className="row gap-1" style={{ color: "var(--green-deep)" }}><Icon.Reply size={12}/>1</span>}
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 12 }}>{o.sent}</td>
                  <td className="muted" style={{ fontSize: 12 }}>
                    {o.nextFollowup
                      ? <span className="pill pill-amber"><Icon.Clock size={11}/> Follow-up {o.nextFollowup}</span>
                      : o.status === "replied"
                        ? <span className="pill pill-green">Replied {o.replyAt}</span>
                        : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 card" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
        <Icon.Sparkles size={16} color="var(--green-hi)"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>2 follow-ups queued for this week</div>
          <div className="muted" style={{ fontSize: 12 }}>
            We'll send only to professors who opened the first email. You can review each draft first.
          </div>
        </div>
        <button className="btn">Review queue</button>
      </div>
    </div>
  );
}

window.ProfDetail = ProfDetail;
window.Composer = Composer;
window.Outreach = Outreach;

// --- Professor reviews block (used on detail page) ---
function ProfReviews({ profId }) {
  const { Icon } = FMP;
  const data = (FMP.REVIEWS || []).find(r => r.profId === profId);
  if (!data) return null;
  const dist = [5, 4, 3, 2, 1].map(s => {
    const count = data.snippets.filter(x => x.stars === s).length;
    // Synthesize a distribution from rating average
    const synth = s === 5 ? Math.round(data.n * 0.55)
                : s === 4 ? Math.round(data.n * 0.28)
                : s === 3 ? Math.round(data.n * 0.10)
                : s === 2 ? Math.round(data.n * 0.05)
                : Math.round(data.n * 0.02);
    return { stars: s, count: Math.max(count, synth) };
  });
  const total = dist.reduce((a, b) => a + b.count, 0);

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="row between" style={{ marginBottom: 18 }}>
        <h3 style={{ fontSize: 16 }}><Icon.Star size={14} style={{ verticalAlign: "-2px", marginRight: 6 }}/> Student reviews</h3>
        <span className="pill pill-outline">Free</span>
      </div>

      <div className="row gap-6" style={{ marginBottom: 18, alignItems: "flex-start" }}>
        <div className="col" style={{ minWidth: 120 }}>
          <div style={{ fontSize: 44, lineHeight: 1, letterSpacing: "-0.03em", fontWeight: 500 }}>{data.rating.toFixed(1)}</div>
          <div className="mt-2"><window.Stars n={data.rating}/></div>
          <div className="muted mt-1" style={{ fontSize: 12 }}>{data.n} verified reviews</div>
        </div>
        <div className="col gap-1" style={{ flex: 1, maxWidth: 320 }}>
          {dist.map(d => (
            <div key={d.stars} className="row gap-2" style={{ alignItems: "center", fontSize: 12 }}>
              <span className="mono muted" style={{ width: 12 }}>{d.stars}</span>
              <Icon.StarF size={10} color="oklch(0.7 0.13 75)"/>
              <div className="bar" style={{ flex: 1 }}>
                <div className="bar-fill" style={{ width: (d.count / total * 100) + "%", background: "oklch(0.72 0.13 75)" }}/>
              </div>
              <span className="mono muted" style={{ width: 24, textAlign: "right" }}>{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="col gap-3" style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        {data.snippets.map((s, i) => (
          <div key={i}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <div className="row gap-2">
                <window.Stars n={s.stars}/>
                <span className="muted" style={{ fontSize: 12 }}>{s.role}</span>
              </div>
              <span className="muted" style={{ fontSize: 12 }}>{s.time}</span>
            </div>
            <p style={{ fontFamily: '"Instrument Serif", serif', fontSize: 16, color: "var(--ink-2)", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
              "{s.text}"
            </p>
            <div className="row gap-3 mt-2" style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
              <span className="row gap-1"><Icon.Check size={11}/> Helpful · {s.helpful}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row between mt-6" style={{ paddingTop: 16, borderTop: "1px solid var(--line)" }}>
        <span className="muted" style={{ fontSize: 12 }}>Reviews are anonymous and moderated.</span>
        <button className="btn btn-sm"><Icon.Plus size={12}/> Write a review</button>
      </div>
    </div>
  );
}

window.ProfReviews = ProfReviews;
