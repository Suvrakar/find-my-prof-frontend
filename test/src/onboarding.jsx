// Onboarding flow — multi-step
function Onboarding({ onComplete }) {
  const { Icon } = FMP;
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    name: "Alex Chen",
    email: "alex.chen@uw.edu",
    degree: "PhD",
    field: "",
    statement: "I'm interested in multimodal large language models, especially how they reason about visual scenes through language. My undergrad thesis built a small vision-language model for chart understanding.",
    interests: ["NLP", "Multimodal Learning", "LLM Reasoning"],
    weights: { expertise: 40, funding: 30, activity: 20, reputation: 10 },
    locations: ["Europe", "North America"],
    startDate: "Fall 2026",
    languages: ["English"],
  });

  const stepNames = ["About you", "Your research", "Preferences", "Match weights", "Review"];

  const next = () => step < stepNames.length - 1 ? setStep(step + 1) : onComplete(data);
  const back = () => step > 0 && setStep(step - 1);

  return (
    <div style={{ minHeight: "100vh", background: "var(--paper)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <nav className="topnav" style={{ background: "transparent" }}>
        <div className="brand"><Icon.Logo /> Find My Professor</div>
        <div style={{ marginLeft: "auto" }} className="muted" style={{ fontSize: 12 }}>
          <span className="kbd" style={{ marginRight: 8 }}>Esc</span>Save & exit
        </div>
      </nav>

      {/* Step header */}
      <div style={{ padding: "32px 0 0", maxWidth: 720, width: "100%", margin: "0 auto" }}>
        <div className="row gap-2" style={{ padding: "0 32px" }}>
          {stepNames.map((s, i) => (
            <React.Fragment key={i}>
              <div className={"step-dot " + (i < step ? "done" : i === step ? "active" : "")}>
                {i < step ? <Icon.Check size={12}/> : i + 1}
              </div>
              {i < stepNames.length - 1 && <div className="step-line"/>}
            </React.Fragment>
          ))}
        </div>
        <div style={{ padding: "32px" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", letterSpacing: "0.08em" }}>
            STEP {step + 1} / {stepNames.length}
          </div>
          <h1 style={{ fontSize: 36, marginTop: 8, letterSpacing: "-0.03em" }}>
            {[
              "Let's get to know you.",
              <>What do you want to <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}>research?</span></>,
              "Where, and when?",
              "How should we weigh matches?",
              "Looks good?",
            ][step]}
          </h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 8 }}>
            {[
              "Just the basics. We use this to filter relevant openings.",
              "A paragraph is better than tags — our embedding model picks up nuance.",
              "We'll exclude professors outside these constraints.",
              "Set the personality of your matches. You can re-balance any time.",
              "Confirm and we'll generate your first shortlist.",
            ][step]}
          </p>
        </div>
      </div>

      {/* Step content */}
      <div className="fade-in" key={step} style={{ flex: 1, maxWidth: 720, width: "100%", margin: "0 auto", padding: "0 32px 32px" }}>
        {step === 0 && <StepAbout data={data} setData={setData}/>}
        {step === 1 && <StepResearch data={data} setData={setData}/>}
        {step === 2 && <StepPreferences data={data} setData={setData}/>}
        {step === 3 && <StepWeights data={data} setData={setData}/>}
        {step === 4 && <StepReview data={data}/>}
      </div>

      {/* Footer nav */}
      <div style={{ borderTop: "1px solid var(--line)", padding: "16px 32px", background: "white" }}>
        <div className="row between" style={{ maxWidth: 720, margin: "0 auto" }}>
          <button className="btn" onClick={back} disabled={step === 0} style={{ opacity: step === 0 ? 0.5 : 1 }}>Back</button>
          <div className="row gap-2 muted" style={{ fontSize: 12 }}>
            <span className="kbd">Enter</span> to continue
          </div>
          <button className="btn btn-primary" onClick={next}>
            {step === stepNames.length - 1 ? "Generate matches" : "Continue"} <Icon.Chevron size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function StepAbout({ data, setData }) {
  return (
    <div className="card" style={{ padding: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="label">Full name</label>
          <input className="input" value={data.name} onChange={e => setData({ ...data, name: e.target.value })}/>
        </div>
        <div>
          <label className="label">Academic email</label>
          <input className="input" value={data.email} onChange={e => setData({ ...data, email: e.target.value })}/>
        </div>
      </div>
      <div className="mt-4">
        <label className="label">Degree you're applying for</label>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {["PhD", "Master's (research)", "Master's (taught)", "Postdoc"].map(d => (
            <span key={d}
              className={"chip " + (data.degree === d ? "selected" : "")}
              onClick={() => setData({ ...data, degree: d })}>
              {data.degree === d && <FMP.Icon.Check size={12}/>}{d}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4">
        <label className="label">Current institution & status</label>
        <input className="input" placeholder="e.g. University of Washington, BSc 2024" defaultValue="University of Washington — BSc Computer Science, 2024"/>
      </div>
    </div>
  );
}

function StepResearch({ data, setData }) {
  const suggested = ["NLP", "Multimodal Learning", "LLM Reasoning", "Reinforcement Learning", "Robotics", "Computer Vision", "Synthetic Biology", "Computational Neuroscience", "Bayesian ML", "Operations Research", "Causal Inference", "Speech"];
  const toggle = (k) => {
    const has = data.interests.includes(k);
    setData({ ...data, interests: has ? data.interests.filter(x => x !== k) : [...data.interests, k] });
  };
  return (
    <div className="card" style={{ padding: 28 }}>
      <label className="label">Research statement (paragraph)</label>
      <textarea className="input textarea"
        value={data.statement}
        onChange={e => setData({ ...data, statement: e.target.value })}
        style={{ minHeight: 140 }}/>
      <div className="row between mt-2" style={{ fontSize: 11, color: "var(--ink-4)" }}>
        <span><FMP.Icon.Sparkles size={11}/> Embedded with all-MiniLM · 384 dim</span>
        <span className="num">{data.statement.length} chars</span>
      </div>

      <div className="mt-6">
        <label className="label">Tags we extracted (edit freely)</label>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {suggested.map(k => (
            <span key={k} className={"chip " + (data.interests.includes(k) ? "selected" : "")} onClick={() => toggle(k)}>
              {data.interests.includes(k) ? <FMP.Icon.Check size={12}/> : <FMP.Icon.Plus size={12}/>}
              {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPreferences({ data, setData }) {
  const locs = ["North America", "Europe", "UK", "Asia–Pacific", "Latin America", "Africa", "Middle East", "Remote OK"];
  const dates = ["Spring 2026", "Fall 2026", "Spring 2027", "Fall 2027", "Flexible"];
  const toggle = (key, v) => {
    const arr = data[key];
    setData({ ...data, [key]: arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v] });
  };
  return (
    <div className="card" style={{ padding: 28 }}>
      <label className="label">Preferred regions</label>
      <div className="row gap-2" style={{ flexWrap: "wrap" }}>
        {locs.map(l => (
          <span key={l} className={"chip " + (data.locations.includes(l) ? "selected" : "")} onClick={() => toggle("locations", l)}>
            <FMP.Icon.Globe size={12}/> {l}
          </span>
        ))}
      </div>

      <div className="mt-6">
        <label className="label">Target start</label>
        <div className="row gap-2" style={{ flexWrap: "wrap" }}>
          {dates.map(d => (
            <span key={d} className={"chip " + (data.startDate === d ? "selected" : "")} onClick={() => setData({ ...data, startDate: d })}>{d}</span>
          ))}
        </div>
      </div>

      <div className="mt-6" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label className="label">Funding requirement</label>
          <select className="input" defaultValue="Fully funded only">
            <option>Fully funded only</option>
            <option>Funding preferred</option>
            <option>Self-funded ok</option>
          </select>
        </div>
        <div>
          <label className="label">Languages spoken</label>
          <input className="input" defaultValue="English, Mandarin (intermediate)"/>
        </div>
      </div>

      <div className="mt-6 row gap-2" style={{ padding: "12px 14px", background: "var(--paper-2)", borderRadius: 8, fontSize: 12.5, color: "var(--ink-2)" }}>
        <FMP.Icon.Sparkles size={14} color="var(--green-hi)"/>
        Tip: leaving regions broad gets you more matches now; you can always narrow later from the dashboard.
      </div>
    </div>
  );
}

function StepWeights({ data, setData }) {
  const setW = (k, v) => setData({ ...data, weights: { ...data.weights, [k]: v } });
  const total = Object.values(data.weights).reduce((a, b) => a + b, 0);
  const items = [
    { k: "expertise",  l: "Expertise match",   d: "Semantic + keyword fit with your research statement." },
    { k: "funding",    l: "Funding likelihood",d: "Active grants, posted openings, recent hires." },
    { k: "activity",   l: "Activity recency",  d: "Publications, conference talks, group-page updates." },
    { k: "reputation", l: "Reputation",        d: "h-index, citations, lab pedigree. Use sparingly." },
  ];
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="row between" style={{ marginBottom: 14, fontSize: 12, color: "var(--ink-3)" }}>
        <span>Slide to weight each signal. They auto-normalize.</span>
        <span className="mono">total: {total}</span>
      </div>
      <div className="col gap-4">
        {items.map(({ k, l, d }) => (
          <div key={k}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 13.5 }}>{l}</div>
                <div className="muted" style={{ fontSize: 12 }}>{d}</div>
              </div>
              <div className="mono" style={{ fontSize: 13, color: "var(--ink)", minWidth: 36, textAlign: "right" }}>
                {Math.round(data.weights[k] / total * 100)}%
              </div>
            </div>
            <input type="range" min="0" max="100" value={data.weights[k]} onChange={e => setW(k, +e.target.value)} style={{ width: "100%", accentColor: "var(--green-deep)" }}/>
          </div>
        ))}
      </div>

      <div className="mt-6" style={{ padding: 16, borderRadius: 8, background: "var(--paper-2)" }}>
        <div className="row between" style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Composite formula</span>
          <span className="pill pill-outline">Editable any time</span>
        </div>
        <div className="mono" style={{ fontSize: 12, color: "var(--ink-2)", lineHeight: 1.7 }}>
          score = {Object.entries(data.weights).map(([k, v]) => `${(v/total).toFixed(2)} × ${k}`).join(" + ")}
        </div>
      </div>
    </div>
  );
}

function StepReview({ data }) {
  const total = Object.values(data.weights).reduce((a, b) => a + b, 0);
  return (
    <div className="card" style={{ padding: 28 }}>
      <div className="row gap-4" style={{ marginBottom: 24 }}>
        <FMP.Avatar initials={data.name.split(" ").map(s => s[0]).join("").slice(0, 2)} size="lg"/>
        <div>
          <h3 style={{ fontSize: 22 }}>{data.name}</h3>
          <div className="muted">{data.email} · {data.degree} · Target: {data.startDate}</div>
        </div>
      </div>

      <ReviewRow label="Statement" value={
        <div style={{ fontStyle: "italic", color: "var(--ink-2)", fontFamily: '"Instrument Serif", serif', fontSize: 16, lineHeight: 1.5 }}>"{data.statement}"</div>
      }/>
      <ReviewRow label="Interests" value={
        <div className="row gap-1" style={{ flexWrap: "wrap" }}>
          {data.interests.map(t => <span key={t} className="pill">{t}</span>)}
        </div>
      }/>
      <ReviewRow label="Regions" value={data.locations.join(" · ")}/>
      <ReviewRow label="Weights" value={
        <div className="col gap-2" style={{ maxWidth: 320 }}>
          {Object.entries(data.weights).map(([k, v]) => (
            <FMP.Bar key={k} label={k} value={Math.round(v/total*100)}/>
          ))}
        </div>
      }/>

      <div className="mt-6 row gap-2" style={{ padding: "12px 14px", background: "var(--green-soft)", borderRadius: 8, fontSize: 12.5, color: "var(--green-deep)" }}>
        <FMP.Icon.Sparkles size={14}/> Estimated matches: <strong>~240 candidates</strong> · top 24 will load in your dashboard.
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16, padding: "14px 0", borderTop: "1px solid var(--line)" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--ink-4)" }}>{label}</div>
      <div style={{ fontSize: 13.5 }}>{value}</div>
    </div>
  );
}

window.Onboarding = Onboarding;
