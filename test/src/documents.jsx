// CV Maker + SOP Generator

// --- Default CV data (mocked) ---
window.DEFAULT_CV = {
  name: "Alex Chen",
  email: "alex.chen@uw.edu",
  phone: "+1 (206) 555-0173",
  website: "alexchen.dev",
  github: "github.com/alexchen",
  scholar: "scholar.google.com/alexchen",
  address: "Seattle, WA",

  links: [
    { label: "LinkedIn", url: "linkedin.com/in/alexchen" },
    { label: "Twitter / X", url: "x.com/alexchen" },
  ],

  summary: "Final-year undergraduate in Computer Science with a research focus on multimodal large language models. Author on two workshop papers; seeking PhD positions for Fall 2026.",

  education: [
    { school: "University of Washington", degree: "B.Sc. Computer Science", dates: "2020 — 2024", gpa: "3.92 / 4.00", notes: "Honors. Coursework: ML, NLP, Optimization, Systems. Senior thesis with Prof. K. Hayashi on vision-language chart understanding.", link: "washington.edu" },
    { school: "Pacific Northwest Tech Institute", degree: "Visiting Student", dates: "Summer 2023", notes: "Research fellowship in machine learning theory." },
  ],

  research: [
    { role: "Undergraduate Researcher", lab: "UW NLP Lab", advisor: "Prof. K. Hayashi", dates: "2023 — present", link: "uwnlp.github.io", bullets: [
      "Built a 1.4B-parameter vision-language model for chart understanding; achieved +8% over OpenFlamingo baseline on ChartQA.",
      "Designed an evaluation harness covering 12 datasets and 4 perturbation regimes; merged upstream into lab repo (250+ stars).",
      "Co-authored workshop paper at NeurIPS Self-Supervised Learning workshop 2024.",
    ]},
    { role: "Research Intern", lab: "Allen Institute for AI", dates: "Summer 2024", link: "allenai.org", bullets: [
      "Investigated instruction-following failures in 7B open-weight LLMs across 40k held-out prompts.",
      "Findings adopted into AI2's open-instruct evaluation pipeline.",
    ]},
  ],

  publications: [
    { authors: "A. Chen, R. Park, K. Hayashi", title: "Chart-CLIP: Visually-Grounded Chart Understanding with Verifier Loops", venue: "NeurIPS SSL Workshop 2024", year: 2024, link: "arxiv.org/abs/2412.01234" },
    { authors: "L. Mendez, A. Chen, et al.", title: "Probing Multimodal Embedding Alignment", venue: "ICLR Tiny Papers", year: 2024, link: "arxiv.org/abs/2403.05678" },
  ],

  awards: [
    { name: "Mary Gates Research Scholarship", year: "2024", note: "$5,000 · top 4% of UW undergrads", link: "expd.uw.edu/mge" },
    { name: "Husky Promise Scholar", year: "2020 — 2024" },
    { name: "ACM ICPC Pacific NW · 4th place", year: "2023", link: "icpc.global" },
  ],

  skills: {
    "Languages": "Python, Rust, TypeScript, C++, SQL",
    "ML": "PyTorch, JAX, Hugging Face, vLLM, DeepSpeed",
    "Tools": "Git, Docker, Kubernetes, Weights & Biases, Slurm",
  },

  spoken: ["English (native)", "Mandarin (intermediate)", "Japanese (beginner)"],
};

// --- Default SOP ---
const DEFAULT_SOP = {
  targetProf: null, // user picks from saved profs
  paragraphs: [
    { heading: "Why I'm applying",      body: "" },
    { heading: "Research background",   body: "" },
    { heading: "Why this lab",          body: "" },
    { heading: "Future direction",      body: "" },
  ],
};

// --- CV MAKER ---
function CVMaker({ go, versions, setVersions, currentId, setCurrentId }) {
  const { Icon } = FMP;

  // Current version + helpers
  const current = versions.find(v => v.id === currentId) || versions[0];
  const cv = current?.data || window.DEFAULT_CV;
  const setCV = (next) => {
    const value = typeof next === "function" ? next(cv) : next;
    setVersions(versions.map(v => v.id === current.id ? { ...v, data: value, updatedAt: "Just now" } : v));
  };

  const saveAsNew = () => {
    const name = prompt("Name this version:", `Copy of ${current.name}`);
    if (!name) return;
    const newV = { id: "cv" + Date.now(), name, updatedAt: "Just now", data: cv, label: "Variant" };
    setVersions([newV, ...versions]);
    setCurrentId(newV.id);
  };
  const renameCurrent = () => {
    const name = prompt("Rename version:", current.name);
    if (!name) return;
    setVersions(versions.map(v => v.id === current.id ? { ...v, name } : v));
  };
  const duplicateCurrent = () => {
    const newV = { ...current, id: "cv" + Date.now(), name: current.name + " (copy)", updatedAt: "Just now" };
    setVersions([newV, ...versions]);
    setCurrentId(newV.id);
  };
  const deleteCurrent = () => {
    if (versions.length <= 1) { alert("Keep at least one version."); return; }
    if (!confirm("Delete this version?")) return;
    const remaining = versions.filter(v => v.id !== current.id);
    setVersions(remaining);
    setCurrentId(remaining[0].id);
  };

  const [template, setTemplate] = React.useState("classic");
  const [openSection, setOpenSection] = React.useState("personal");

  // simple completion %: count filled fields
  const completionPct = React.useMemo(() => {
    let filled = 0, total = 0;
    const check = (v) => { total++; if (v && String(v).trim()) filled++; };
    check(cv.name); check(cv.email); check(cv.summary);
    cv.education.forEach(e => { check(e.school); check(e.degree); });
    cv.research.forEach(r => { check(r.role); check(r.lab); check(r.bullets.length); });
    check(cv.publications.length); check(cv.awards.length);
    return Math.round(filled / total * 100);
  }, [cv]);

  return (
    <div className="fade-in cv-grid" style={{ display: "grid", gridTemplateColumns: "minmax(360px, 1fr) 1.4fr", height: "calc(100vh - 56px)" }}>
      {/* Left: Form */}
      <div className="col" style={{ borderRight: "1px solid var(--line)", overflow: "hidden", background: "var(--paper-2)" }}>
        <div className="col" style={{ padding: "12px 20px", borderBottom: "1px solid var(--line)", background: "white", gap: 10 }}>
          <div className="row between">
            <div className="row gap-2">
              <h2 style={{ fontSize: 16 }}>CV Maker</h2>
              <span className="pill pill-outline">{versions.length} versions</span>
            </div>
            <div className="row gap-2" style={{ alignItems: "center" }}>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-3)" }}>{completionPct}%</div>
              <div className="bar" style={{ width: 60 }}><div className="bar-fill" style={{ width: completionPct + "%" }}/></div>
            </div>
          </div>
          <VersionsBar
            versions={versions}
            currentId={currentId}
            setCurrentId={setCurrentId}
            onNew={saveAsNew}
            onRename={renameCurrent}
            onDuplicate={duplicateCurrent}
            onDelete={deleteCurrent}
            kind="CV"
          />
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 32px" }}>
          <FormSection title="Personal" id="personal" open={openSection} setOpen={setOpenSection}>
            <Grid2>
              <Inp label="Full name"  value={cv.name}    onChange={v => setCV({ ...cv, name: v })}/>
              <Inp label="Email"      value={cv.email}   onChange={v => setCV({ ...cv, email: v })}/>
              <Inp label="Phone"      value={cv.phone}   onChange={v => setCV({ ...cv, phone: v })}/>
              <Inp label="Location"   value={cv.address} onChange={v => setCV({ ...cv, address: v })}/>
              <Inp label="Website"    value={cv.website} onChange={v => setCV({ ...cv, website: v })}/>
              <Inp label="GitHub"     value={cv.github}  onChange={v => setCV({ ...cv, github: v })}/>
              <Inp label="Google Scholar" value={cv.scholar} onChange={v => setCV({ ...cv, scholar: v })}/>
            </Grid2>
            <TextArea label="Research summary" placeholder="2–3 sentence pitch" value={cv.summary} onChange={v => setCV({ ...cv, summary: v })}/>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <div className="row between" style={{ marginBottom: 8 }}>
                <label className="label" style={{ marginBottom: 0 }}>Additional links</label>
                <span className="muted" style={{ fontSize: 11 }}>Rendered inline as "Label →" hyperlinks</span>
              </div>
              {(cv.links || []).map((lk, i) => (
                <div key={i} className="row gap-2 mt-2" style={{ alignItems: "center" }}>
                  <input className="input" style={{ width: 120, flex: "0 0 120px" }} placeholder="Label"
                    value={lk.label}
                    onChange={e => setCV({ ...cv, links: (cv.links || []).map((x, j) => j === i ? { ...x, label: e.target.value } : x) })}/>
                  <input className="input" style={{ flex: 1 }} placeholder="https://… or domain.tld"
                    value={lk.url}
                    onChange={e => setCV({ ...cv, links: (cv.links || []).map((x, j) => j === i ? { ...x, url: e.target.value } : x) })}/>
                  <button className="btn btn-sm btn-ghost" onClick={() => setCV({ ...cv, links: (cv.links || []).filter((_, j) => j !== i) })}>
                    <FMP.Icon.X size={12}/>
                  </button>
                </div>
              ))}
              <button className="btn btn-sm mt-2" style={{ borderStyle: "dashed" }}
                onClick={() => setCV({ ...cv, links: [...(cv.links || []), { label: "", url: "" }] })}>
                <FMP.Icon.Plus size={12}/> Add link
              </button>
            </div>
          </FormSection>

          <FormSection title="Education" id="education" open={openSection} setOpen={setOpenSection}>
            {cv.education.map((e, i) => (
              <RepeatBlock key={i} onRemove={() => setCV({ ...cv, education: cv.education.filter((_, j) => j !== i) })}>
                <Grid2>
                  <Inp label="School"  value={e.school}  onChange={v => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, school: v } : x) })}/>
                  <Inp label="Degree"  value={e.degree}  onChange={v => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, degree: v } : x) })}/>
                  <Inp label="Dates"   value={e.dates}   onChange={v => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, dates: v } : x) })}/>
                  <Inp label="GPA / Honors" value={e.gpa || ""} onChange={v => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, gpa: v } : x) })}/>
                </Grid2>
                <Inp label="Link (optional)" value={e.link || ""} onChange={v => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, link: v } : x) })}/>
                <TextArea label="Notes" value={e.notes || ""} onChange={v => setCV({ ...cv, education: cv.education.map((x, j) => j === i ? { ...x, notes: v } : x) })}/>
              </RepeatBlock>
            ))}
            <AddBtn onClick={() => setCV({ ...cv, education: [...cv.education, { school: "", degree: "", dates: "" }] })}>Add education</AddBtn>
          </FormSection>

          <FormSection title="Research experience" id="research" open={openSection} setOpen={setOpenSection}>
            {cv.research.map((r, i) => (
              <RepeatBlock key={i} onRemove={() => setCV({ ...cv, research: cv.research.filter((_, j) => j !== i) })}>
                <Grid2>
                  <Inp label="Role"     value={r.role}    onChange={v => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, role: v } : x) })}/>
                  <Inp label="Lab"      value={r.lab}     onChange={v => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, lab: v } : x) })}/>
                  <Inp label="Advisor"  value={r.advisor || ""} onChange={v => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, advisor: v } : x) })}/>
                  <Inp label="Dates"    value={r.dates}   onChange={v => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, dates: v } : x) })}/>
                </Grid2>
                <Inp label="Lab / Project URL (optional)" value={r.link || ""} onChange={v => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, link: v } : x) })}/>
                <BulletList bullets={r.bullets} onChange={bs => setCV({ ...cv, research: cv.research.map((x, j) => j === i ? { ...x, bullets: bs } : x) })}/>
              </RepeatBlock>
            ))}
            <AddBtn onClick={() => setCV({ ...cv, research: [...cv.research, { role: "", lab: "", dates: "", bullets: [""] }] })}>Add research experience</AddBtn>
          </FormSection>

          <FormSection title="Publications" id="pubs" open={openSection} setOpen={setOpenSection}>
            {cv.publications.map((p, i) => (
              <RepeatBlock key={i} onRemove={() => setCV({ ...cv, publications: cv.publications.filter((_, j) => j !== i) })}>
                <Inp label="Authors" value={p.authors} onChange={v => setCV({ ...cv, publications: cv.publications.map((x, j) => j === i ? { ...x, authors: v } : x) })}/>
                <Inp label="Title"   value={p.title}   onChange={v => setCV({ ...cv, publications: cv.publications.map((x, j) => j === i ? { ...x, title: v } : x) })}/>
                <Grid2>
                  <Inp label="Venue" value={p.venue}  onChange={v => setCV({ ...cv, publications: cv.publications.map((x, j) => j === i ? { ...x, venue: v } : x) })}/>
                  <Inp label="Year"  value={p.year}   onChange={v => setCV({ ...cv, publications: cv.publications.map((x, j) => j === i ? { ...x, year: v } : x) })}/>
                </Grid2>
                <Inp label="Paper link (arXiv / DOI / PDF)" value={p.link || ""} onChange={v => setCV({ ...cv, publications: cv.publications.map((x, j) => j === i ? { ...x, link: v } : x) })}/>
              </RepeatBlock>
            ))}
            <AddBtn onClick={() => setCV({ ...cv, publications: [...cv.publications, { authors: "", title: "", venue: "", year: "" }] })}>Add publication</AddBtn>
            <div className="row gap-2 mt-2" style={{ padding: 10, background: "var(--green-soft)", borderRadius: 6, fontSize: 12, color: "var(--green-deep)" }}>
              <Icon.Sparkles size={12}/> Connect Google Scholar to auto-import publications.
              <button className="btn btn-sm" style={{ marginLeft: "auto" }}>Connect</button>
            </div>
          </FormSection>

          <FormSection title="Awards & honors" id="awards" open={openSection} setOpen={setOpenSection}>
            {cv.awards.map((a, i) => (
              <RepeatBlock key={i} onRemove={() => setCV({ ...cv, awards: cv.awards.filter((_, j) => j !== i) })}>
                <Grid2>
                  <Inp label="Award" value={a.name} onChange={v => setCV({ ...cv, awards: cv.awards.map((x, j) => j === i ? { ...x, name: v } : x) })}/>
                  <Inp label="Year"  value={a.year} onChange={v => setCV({ ...cv, awards: cv.awards.map((x, j) => j === i ? { ...x, year: v } : x) })}/>
                </Grid2>
                <Inp label="Note" value={a.note || ""} onChange={v => setCV({ ...cv, awards: cv.awards.map((x, j) => j === i ? { ...x, note: v } : x) })}/>
                <Inp label="Link (optional)" value={a.link || ""} onChange={v => setCV({ ...cv, awards: cv.awards.map((x, j) => j === i ? { ...x, link: v } : x) })}/>
              </RepeatBlock>
            ))}
            <AddBtn onClick={() => setCV({ ...cv, awards: [...cv.awards, { name: "", year: "" }] })}>Add award</AddBtn>
          </FormSection>

          <FormSection title="Skills & languages" id="skills" open={openSection} setOpen={setOpenSection}>
            {Object.entries(cv.skills).map(([cat, val]) => (
              <Inp key={cat} label={cat} value={val} onChange={v => setCV({ ...cv, skills: { ...cv.skills, [cat]: v } })}/>
            ))}
            <TextArea label="Spoken languages" value={cv.spoken.join(", ")} onChange={v => setCV({ ...cv, spoken: v.split(",").map(s => s.trim()) })}/>
          </FormSection>
        </div>
      </div>

      {/* Right: Preview */}
      <div className="col" style={{ overflow: "hidden", background: "var(--paper-3)" }}>
        <div className="row between" style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "white", flexWrap: "wrap", gap: 8 }}>
          <div className="row gap-1">
            {[
              ["classic", "Classic"],
              ["modern", "Modern"],
              ["compact", "Compact"],
            ].map(([id, l]) => (
              <button key={id} className={"chip " + (template === id ? "selected" : "")} onClick={() => setTemplate(id)}>{l}</button>
            ))}
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm hide-mobile"><Icon.Sparkles size={12}/> AI polish</button>
            <button className="btn btn-sm hide-mobile">.tex</button>
            <button className="btn btn-sm btn-primary"><Icon.ExternalLink size={12}/> Download PDF</button>
          </div>
        </div>
        <ScaledPaper>
          <CVPreview cv={cv} template={template}/>
        </ScaledPaper>
      </div>
    </div>
  );
}

// helper: turn a value like "email@x.com", "github.com/foo", or "https://x.com" into a proper href
function asHref(v, type) {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (type === "email" || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) {
    return s.startsWith("mailto:") ? s : "mailto:" + s;
  }
  if (type === "tel" || /^\+?[\d\s\-().]{7,}$/.test(s)) {
    return s.startsWith("tel:") ? s : "tel:" + s.replace(/[\s()\-]/g, "");
  }
  if (/^https?:\/\//.test(s)) return s;
  return "https://" + s.replace(/^\/+/, "");
}

function CVLink({ href, type, children, color }) {
  const url = asHref(href, type);
  if (!url) return <span>{children}</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      color: color || "var(--green-deep)",
      textDecoration: "none",
      borderBottom: "1px solid currentColor",
      paddingBottom: 1,
    }}>{children}</a>
  );
}

// CV preview — letter-size mockup
function CVPreview({ cv, template }) {
  const isClassic = template === "classic";
  const isModern  = template === "modern";
  const isCompact = template === "compact";

  // Build the contact-line array: each item is { v, type }. Renders separated by " • "
  const contacts = [
    { v: cv.email,   type: "email" },
    { v: cv.phone,   type: "tel" },
    { v: cv.address, type: "text" }, // no link
  ].filter(c => c.v);

  const webItems = [
    { v: cv.website, type: "url" },
    { v: cv.github,  type: "url" },
    { v: cv.scholar, type: "url" },
    ...(cv.links || []).filter(l => l.url).map(l => ({ v: l.url, type: "url", label: l.label })),
  ].filter(c => c.v);

  const headerColor = isModern ? "var(--green-deep)" : "var(--ink)";
  const linkColor = isModern ? "var(--green-deep)" : "var(--ink)";

  const ContactInline = ({ list, color }) => (
    <>
      {list.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span style={{ margin: "0 8px", color: "var(--ink-4)" }}>•</span>}
          {c.type === "text"
            ? <span>{c.v}</span>
            : <CVLink href={c.v} type={c.type} color={color}>{c.label ? `${c.label} →` : c.v}</CVLink>}
        </React.Fragment>
      ))}
    </>
  );

  return (
    <div style={{
      width: 760, minHeight: 980,
      background: "white",
      boxShadow: "var(--shadow-3)",
      padding: isCompact ? "44px 56px" : "60px 64px",
      fontFamily: isClassic ? '"Instrument Serif", "EB Garamond", "Times New Roman", serif' : 'var(--font-body)',
      fontSize: isCompact ? 11 : 12,
      lineHeight: 1.55,
      color: "var(--ink)",
    }}>
      {/* Header */}
      {isModern ? (
        <header style={{ borderBottom: "2px solid var(--green-deep)", paddingBottom: 14, marginBottom: 24 }}>
          <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--green-deep)", margin: 0, lineHeight: 1.1 }}>{cv.name}</h1>
          <div style={{ fontSize: 11, marginTop: 6, color: "var(--ink-3)", letterSpacing: "0.01em" }}>
            <ContactInline list={contacts} color={linkColor}/>
          </div>
          {webItems.length > 0 && (
            <div style={{ fontSize: 11, marginTop: 2, color: "var(--ink-3)" }}>
              <ContactInline list={webItems} color={linkColor}/>
            </div>
          )}
        </header>
      ) : (
        <header style={{ textAlign: "center", marginBottom: 24, paddingBottom: 14, borderBottom: isClassic ? "1px solid var(--ink)" : "1px solid var(--line-2)" }}>
          <h1 style={{
            fontSize: isCompact ? 22 : 28,
            fontWeight: 500,
            letterSpacing: isClassic ? "0.14em" : "-0.02em",
            textTransform: isClassic ? "uppercase" : "none",
            margin: 0,
            lineHeight: 1.1,
          }}>{cv.name}</h1>
          <div style={{ fontSize: 10.5, marginTop: 8, color: "var(--ink-3)", letterSpacing: "0.02em" }}>
            <ContactInline list={contacts} color={linkColor}/>
          </div>
          {webItems.length > 0 && (
            <div style={{ fontSize: 10.5, marginTop: 2, color: "var(--ink-3)" }}>
              <ContactInline list={webItems} color={linkColor}/>
            </div>
          )}
        </header>
      )}

      {/* Summary */}
      {cv.summary && (
        <CVSection title="Research interests" classic={isClassic} modern={isModern}>
          <p style={{ fontStyle: isClassic ? "italic" : "normal", margin: 0, textAlign: "justify" }}>{cv.summary}</p>
        </CVSection>
      )}

      {/* Education */}
      <CVSection title="Education" classic={isClassic} modern={isModern}>
        {cv.education.map((e, i) => (
          <CVEntry key={i}
            title={e.link ? <CVLink href={e.link} type="url" color={linkColor}>{e.school}</CVLink> : e.school}
            subtitle={[e.degree, e.gpa].filter(Boolean).join(" — ")}
            dates={e.dates}
            notes={e.notes}
            last={i === cv.education.length - 1}/>
        ))}
      </CVSection>

      {/* Research */}
      <CVSection title="Research experience" classic={isClassic} modern={isModern}>
        {cv.research.map((r, i) => (
          <CVEntry key={i}
            title={
              <>
                {r.link ? <CVLink href={r.link} type="url" color={linkColor}>{r.lab}</CVLink> : r.lab}
                {r.advisor && <> — {r.advisor}</>}
              </>
            }
            subtitle={r.role}
            dates={r.dates}
            bullets={r.bullets}
            last={i === cv.research.length - 1}/>
        ))}
      </CVSection>

      {/* Publications */}
      {cv.publications?.length > 0 && (
        <CVSection title="Selected publications" classic={isClassic} modern={isModern}>
          <ol style={{ margin: 0, paddingLeft: 18, listStylePosition: "outside" }}>
            {cv.publications.map((p, i) => (
              <li key={i} style={{ marginBottom: 6, paddingLeft: 4 }}>
                {p.authors}.{" "}
                {p.link
                  ? <CVLink href={p.link} type="url" color={linkColor}><strong>"{p.title}."</strong></CVLink>
                  : <strong>"{p.title}."</strong>}{" "}
                <em>{p.venue}</em>, {p.year}.
                {p.link && (
                  <> <CVLink href={p.link} type="url" color={linkColor}><span style={{ fontStyle: "italic" }}>[link]</span></CVLink></>
                )}
              </li>
            ))}
          </ol>
        </CVSection>
      )}

      {/* Awards */}
      {cv.awards?.length > 0 && (
        <CVSection title="Awards & honors" classic={isClassic} modern={isModern}>
          {cv.awards.map((a, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "1fr 90px",
              gap: 16,
              marginBottom: 3,
              alignItems: "baseline",
            }}>
              <div style={{ minWidth: 0 }}>
                <strong>{a.name}</strong>
                {a.note && ` — ${a.note}`}
                {a.link && <> · <CVLink href={a.link} type="url" color={linkColor}><span style={{ fontStyle: "italic" }}>[details]</span></CVLink></>}
              </div>
              <div style={{ color: "var(--ink-3)", textAlign: "right" }}>{a.year}</div>
            </div>
          ))}
        </CVSection>
      )}

      {/* Skills */}
      <CVSection title="Technical skills" classic={isClassic} modern={isModern}>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "4px 14px", alignItems: "baseline" }}>
          {Object.entries(cv.skills).map(([cat, val]) => (
            <React.Fragment key={cat}>
              <div style={{ fontWeight: 600, color: "var(--ink-2)" }}>{cat}</div>
              <div>{val}</div>
            </React.Fragment>
          ))}
        </div>
      </CVSection>

      {/* Languages */}
      <CVSection title="Languages" classic={isClassic} modern={isModern}>
        <div>{cv.spoken.join("  •  ")}</div>
      </CVSection>
    </div>
  );
}

// One CV entry — bulletproof grid layout (title left, dates right, never overlaps)
function CVEntry({ title, subtitle, dates, notes, bullets, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 14 }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 16,
        alignItems: "baseline",
      }}>
        <div style={{ fontWeight: 600, minWidth: 0 }}>{title}</div>
        <div style={{ color: "var(--ink-3)", whiteSpace: "nowrap", fontSize: "0.92em" }}>{dates}</div>
      </div>
      {subtitle && (
        <div style={{ fontStyle: "italic", color: "var(--ink-2)", marginTop: 1 }}>{subtitle}</div>
      )}
      {notes && (
        <div style={{ color: "var(--ink-2)", marginTop: 4, fontSize: "0.95em" }}>{notes}</div>
      )}
      {bullets && bullets.filter(b => b && b.trim()).length > 0 && (
        <ul style={{ margin: "5px 0 0 0", paddingLeft: 18, listStylePosition: "outside" }}>
          {bullets.filter(b => b && b.trim()).map((b, j) => (
            <li key={j} style={{ marginBottom: 2, paddingLeft: 4 }}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CVSection({ title, classic, modern, children }) {
  return (
    <section style={{ marginBottom: 18 }}>
      <h2 style={{
        fontSize: classic ? 10.5 : 11.5,
        fontWeight: 600,
        letterSpacing: classic ? "0.16em" : "0.06em",
        textTransform: "uppercase",
        color: modern ? "var(--green-deep)" : "var(--ink)",
        borderBottom: modern ? "none" : (classic ? "1px solid var(--ink)" : "1px solid var(--line-2)"),
        paddingBottom: 5,
        marginBottom: 10,
        marginTop: 0,
      }}>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

// --- Form helpers ---
function FormSection({ title, id, open, setOpen, children }) {
  const isOpen = open === id;
  return (
    <div style={{ marginBottom: 8, borderRadius: 8, background: "white", border: "1px solid var(--line)" }}>
      <button onClick={() => setOpen(isOpen ? null : id)} style={{
        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", background: "transparent", border: 0, cursor: "pointer", fontFamily: "inherit",
      }}>
        <span style={{ fontWeight: 500, fontSize: 13.5 }}>{title}</span>
        <FMP.Icon.ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}/>
      </button>
      {isOpen && <div style={{ padding: "0 16px 16px" }}>{children}</div>}
    </div>
  );
}
function Grid2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>{children}</div>; }
function Inp({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value || ""} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}
function TextArea({ label, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <label className="label">{label}</label>
      <textarea className="input textarea" value={value || ""} placeholder={placeholder} onChange={e => onChange(e.target.value)}/>
    </div>
  );
}
function RepeatBlock({ children, onRemove }) {
  return (
    <div style={{ padding: 12, background: "var(--paper-2)", borderRadius: 6, marginBottom: 8, position: "relative" }}>
      {children}
      <button className="btn btn-sm btn-ghost" onClick={onRemove} style={{ position: "absolute", top: 6, right: 6, color: "var(--ink-4)" }}>
        <FMP.Icon.X size={12}/>
      </button>
    </div>
  );
}
function AddBtn({ onClick, children }) {
  return (
    <button className="btn btn-sm" onClick={onClick} style={{ width: "100%", justifyContent: "center", borderStyle: "dashed" }}>
      <FMP.Icon.Plus size={12}/> {children}
    </button>
  );
}
function BulletList({ bullets, onChange }) {
  return (
    <div style={{ marginTop: 4 }}>
      <label className="label">Bullets</label>
      <div className="col gap-1">
        {bullets.map((b, i) => (
          <div key={i} className="row gap-2" style={{ alignItems: "center" }}>
            <span style={{ color: "var(--ink-4)" }}>•</span>
            <input className="input" value={b} onChange={e => onChange(bullets.map((x, j) => j === i ? e.target.value : x))} style={{ flex: 1 }}/>
            <button className="btn btn-sm btn-ghost" onClick={() => onChange(bullets.filter((_, j) => j !== i))}><FMP.Icon.X size={11}/></button>
          </div>
        ))}
        <button className="btn btn-sm btn-ghost" onClick={() => onChange([...bullets, ""])} style={{ alignSelf: "flex-start" }}>
          <FMP.Icon.Plus size={11}/> Add bullet
        </button>
      </div>
    </div>
  );
}

// --- SOP GENERATOR ---
function SOPMaker({ go, versions, setVersions, currentId, setCurrentId }) {
  const { Icon } = FMP;

  const current = versions.find(v => v.id === currentId) || versions[0];
  const data = current?.data || { meta: {}, paragraphs: [], phase: "idle", tone: "Earnest", targetId: current?.profId || "p1" };
  const setData = (next) => {
    const value = typeof next === "function" ? next(data) : next;
    setVersions(versions.map(v => v.id === current.id ? { ...v, data: value, updatedAt: "Just now", profId: value.targetId || v.profId } : v));
  };

  // Initialize data shape if not present (for older mock versions)
  React.useEffect(() => {
    if (current && !current.data) {
      setVersions(versions.map(v => v.id === current.id ? {
        ...v,
        data: {
          targetId: v.profId || "p1",
          meta: {
            fieldGenericName: "machine learning",
            program: "PhD in Computer Science",
            intake: "Fall 2026",
            background: "I built a 1.4B-parameter vision-language model for chart understanding and interned at AI2, where I dug into instruction-following failures in open-weight LLMs.",
            motivation: "I want to understand why multimodal models still fail at compositional spatial reasoning — and to build systems that can be trusted to read a scientific figure.",
          },
          paragraphs: v.status === "ready" ? [] : DEFAULT_SOP.paragraphs,
          phase: v.status === "ready" ? "idle" : "idle",
          tone: "Earnest",
        },
      } : v));
    }
  }, [current?.id]);

  const targetId = data?.targetId || "p1";
  const meta = data?.meta || { fieldGenericName: "", program: "", intake: "", background: "", motivation: "" };
  const phase = data?.phase || "idle";
  const paragraphs = data?.paragraphs || DEFAULT_SOP.paragraphs;
  const tone = data?.tone || "Earnest";

  const setTargetId = (id) => setData({ ...data, targetId: id });
  const setMeta = (m) => setData({ ...data, meta: m });
  const setPhase = (p) => setData({ ...data, phase: p });
  const setParagraphs = (p) => setData({ ...data, paragraphs: p, phase: "ready" });
  const setTone = (t) => setData({ ...data, tone: t });

  const target = FMP.professors.find(p => p.id === targetId);

  const generate = () => {
    setPhase("generating");
    setTimeout(() => {
      setData({ ...data, phase: "ready", paragraphs: buildSOP(target, meta, tone) });
    }, 1800);
  };

  // versioning actions
  const saveAsNew = () => {
    const name = prompt("Name this version:", `For ${target?.name || "..."}`);
    if (!name) return;
    const newV = {
      id: "sop" + Date.now(), name, profId: targetId,
      updatedAt: "Just now", status: phase === "ready" ? "ready" : "draft",
      words: paragraphs.reduce((s, p) => s + (p.body ? p.body.split(/\s+/).filter(Boolean).length : 0), 0),
      data: { ...data },
    };
    setVersions([newV, ...versions]);
    setCurrentId(newV.id);
  };
  const renameCurrent = () => {
    const name = prompt("Rename version:", current.name);
    if (!name) return;
    setVersions(versions.map(v => v.id === current.id ? { ...v, name } : v));
  };
  const duplicateCurrent = () => {
    const newV = { ...current, id: "sop" + Date.now(), name: current.name + " (copy)", updatedAt: "Just now" };
    setVersions([newV, ...versions]);
    setCurrentId(newV.id);
  };
  const deleteCurrent = () => {
    if (versions.length <= 1) { alert("Keep at least one version."); return; }
    if (!confirm("Delete this version?")) return;
    const remaining = versions.filter(v => v.id !== current.id);
    setVersions(remaining);
    setCurrentId(remaining[0].id);
  };

  // word count
  const wordCount = paragraphs.reduce((s, p) => s + (p.body ? p.body.trim().split(/\s+/).filter(Boolean).length : 0), 0);

  return (
    <div className="fade-in sop-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", height: "calc(100vh - 56px)" }}>
      {/* Left: Config */}
      <aside style={{ borderRight: "1px solid var(--line)", background: "var(--paper-2)", overflow: "auto", padding: "20px 24px" }}>
        <div className="row gap-2" style={{ marginBottom: 8 }}>
          <Icon.Sparkles size={14} color="var(--green-hi)"/>
          <span style={{ fontWeight: 500, fontSize: 13 }}>SOP Generator</span>
          <span className="pill pill-outline" style={{ marginLeft: "auto" }}>{versions.length} versions</span>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 0, marginBottom: 12 }}>
          One Statement of Purpose, tailored per professor. Grounded in real research.
        </p>

        <VersionsBar
          versions={versions}
          currentId={currentId}
          setCurrentId={setCurrentId}
          onNew={saveAsNew}
          onRename={renameCurrent}
          onDuplicate={duplicateCurrent}
          onDelete={deleteCurrent}
          kind="SOP"
        />

        <div className="mt-4"/>
        <label className="label">Target professor</label>
        <select className="input" value={targetId} onChange={e => setTargetId(e.target.value)}>
          {FMP.professors.map(p => (
            <option key={p.id} value={p.id}>{p.name} · {p.school}</option>
          ))}
        </select>

        {target && (
          <div className="card mt-3" style={{ padding: 12 }}>
            <div className="row gap-2">
              <FMP.Avatar initials={target.initials}/>
              <div className="col" style={{ gap: 0 }}>
                <span style={{ fontWeight: 500, fontSize: 13 }}>{target.name}</span>
                <span className="muted" style={{ fontSize: 11 }}>{target.dept} · {target.school}</span>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 11.5, marginTop: 8, fontStyle: "italic", fontFamily: '"Instrument Serif", serif' }}>
              "{target.lastPaper}"
            </div>
          </div>
        )}

        <div className="mt-4">
          <Inp label="Program & degree" value={meta.program} onChange={v => setMeta({ ...meta, program: v })}/>
          <Inp label="Intake" value={meta.intake} onChange={v => setMeta({ ...meta, intake: v })}/>
          <Inp label="Field (plain English)" value={meta.fieldGenericName} onChange={v => setMeta({ ...meta, fieldGenericName: v })}/>
          <TextArea label="Your background (1–2 sentences)" value={meta.background} onChange={v => setMeta({ ...meta, background: v })}/>
          <TextArea label="What you want to figure out" value={meta.motivation} onChange={v => setMeta({ ...meta, motivation: v })}/>
        </div>

        <div className="mt-4">
          <label className="label">Tone</label>
          <div className="row gap-1" style={{ flexWrap: "wrap" }}>
            {["Earnest", "Formal", "Confident", "Reflective"].map(t => (
              <span key={t} className={"chip " + (tone === t ? "selected" : "")} onClick={() => setTone(t)}>{t}</span>
            ))}
          </div>
        </div>

        <button className="btn btn-primary mt-6" style={{ width: "100%", justifyContent: "center", padding: 12 }} onClick={generate}>
          <Icon.Sparkles size={13}/> {phase === "ready" ? "Regenerate" : "Generate SOP"}
        </button>

        <div className="mt-4" style={{ padding: 12, background: "var(--paper-3)", borderRadius: 6, fontSize: 11.5, color: "var(--ink-3)" }}>
          <Icon.Award size={12} color="var(--green-hi)"/> Grounded in: <strong>{target?.lastPaper.split("(")[0]}</strong> · funding: <strong>{target?.funding?.split("·")[0]}</strong>.
        </div>
      </aside>

      {/* Right: SOP preview/editor */}
      <div className="col" style={{ background: "var(--paper-3)", overflow: "hidden" }}>
        <div className="row between" style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)", background: "white", flexWrap: "wrap", gap: 8 }}>
          <div className="row gap-2">
            <span className="muted" style={{ fontSize: 12 }}>{wordCount} words</span>
            <span className="muted" style={{ fontSize: 12 }}>·</span>
            <span className="muted" style={{ fontSize: 12 }}>~{Math.max(1, Math.round(wordCount / 250))} page{wordCount > 250 ? "s" : ""}</span>
          </div>
          <div className="row gap-2">
            <button className="btn btn-sm hide-mobile">.docx</button>
            <button className="btn btn-sm btn-primary"><Icon.ExternalLink size={12}/> Download PDF</button>
          </div>
        </div>
        <window.ScaledPaper paperWidth={720}>
          <div style={{
            width: 720, minHeight: 980,
            background: "white",
            boxShadow: "var(--shadow-3)",
            padding: "64px 80px",
            fontFamily: '"Instrument Serif", "EB Garamond", "Times New Roman", serif',
            fontSize: 13,
            lineHeight: 1.8,
            color: "var(--ink)",
          }}>
            <header style={{ textAlign: "center", marginBottom: 36, paddingBottom: 16, borderBottom: "1px solid var(--line-2)" }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", margin: 0 }}>Statement of Purpose</h1>
              <div style={{ fontSize: 12, marginTop: 10, color: "var(--ink-3)", fontStyle: "italic", letterSpacing: "0.01em" }}>
                {meta.program} · {meta.intake} · {target?.school}
              </div>
            </header>

            {phase === "generating" && (
              <div className="col gap-3" style={{ paddingTop: 40 }}>
                {["Reviewing professor's recent work…", "Mapping your background to their research…", "Drafting in " + tone.toLowerCase() + " tone…"].map((s, i) => (
                  <div key={i} className="row gap-3" style={{ fontSize: 13, color: "var(--ink-2)" }}>
                    <span style={{ width: 14, height: 14, borderRadius: 999, border: "2px solid var(--line)", borderTopColor: "var(--green-deep)", display: "inline-block", animation: "spin 0.8s linear infinite" }}/>
                    <span style={{ fontFamily: "var(--font-body)" }}>{s}</span>
                  </div>
                ))}
              </div>
            )}

            {phase === "idle" && (
              <div className="col center" style={{ minHeight: 600, gap: 16, textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-soft)", display: "grid", placeItems: "center" }}>
                  <Icon.Sparkles size={24} color="var(--green-deep)"/>
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 16, fontWeight: 500 }}>Generate a draft to begin</div>
                <div className="muted" style={{ fontSize: 13, maxWidth: 360, fontFamily: "var(--font-body)" }}>
                  We'll write a 4-paragraph SOP grounded in {target?.name}'s most recent paper and your stated background.
                </div>
              </div>
            )}

            {phase === "ready" && paragraphs.map((p, i) => (
              <section key={i} style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--green-deep)",
                  margin: 0,
                  marginBottom: 8,
                }}>{p.heading}</h3>
                <div
                  contentEditable suppressContentEditableWarning
                  onBlur={e => setParagraphs(paragraphs.map((x, j) => j === i ? { ...x, body: e.target.innerText } : x))}
                  style={{ outline: "none", textAlign: "justify", hyphens: "auto" }}>
                  {p.body}
                </div>
              </section>
            ))}

            {phase === "ready" && (
              <footer style={{ fontSize: 11, fontFamily: "var(--font-body)", marginTop: 48, paddingTop: 16, borderTop: "1px solid var(--line-2)", textAlign: "center", color: "var(--ink-3)" }}>
                Alex Chen · {meta.intake} application · <span style={{ fontStyle: "italic" }}>Click any paragraph to edit</span>
              </footer>
            )}
          </div>
        </window.ScaledPaper>
      </div>
    </div>
  );
}

function buildSOP(prof, meta, tone) {
  const lastName = prof.name.replace(/^(Dr\.|Prof\.)\s*/, "").split(" ").pop();
  const paperShort = prof.lastPaper.replace(/\s*\([^)]*\)\s*$/, "");
  const venue = prof.lastPaper.match(/\(([^)]+)\)/)?.[1] || "their recent paper";
  const grantSrc = prof.funding?.split("·")[0]?.trim() || "active funding";
  const opener = tone === "Confident"
    ? `I'm applying to ${prof.school}'s ${meta.program} because I want to do the most consequential work of my career in ${meta.fieldGenericName}, and Prof. ${lastName}'s lab is, in my honest assessment, the best fit anywhere in the world for what I want to build.`
    : tone === "Reflective"
      ? `When I started reading about ${meta.fieldGenericName} three years ago, I expected the technical part to be the hard part. It turned out the harder problem — and the one I've been quietly obsessed with since — is the one Prof. ${lastName} writes about.`
      : tone === "Formal"
        ? `It is with considered interest that I apply for the ${meta.program} at ${prof.school}, with the intention of pursuing my doctoral research under the supervision of Prof. ${lastName}.`
        : `I'm applying to ${prof.school}'s ${meta.program} because Prof. ${lastName}'s work on ${paperShort.toLowerCase()} sits at the exact intersection of what I've spent the last two years trying to understand.`;

  return [
    { heading: "Why I'm applying",
      body: `${opener} ${meta.motivation} My intended start is ${meta.intake}.` },
    { heading: "Research background",
      body: `${meta.background} Through this work I learned that strong empirical claims in ${meta.fieldGenericName} require careful evaluation — a habit I see reflected in the way the ${lastName} lab presents results. My undergraduate thesis pushed me from "can a model do X" to "how do we know it does X for the right reasons", which is the question I want my PhD to be about.` },
    { heading: "Why this lab",
      body: `I read "${paperShort}" (${venue}) twice over a weekend, the second time with notes. The verifier-loop framing answered something I'd been wrestling with in my own work — that compositional reasoning failures look fundamentally different from token-prediction errors and deserve different machinery. Your ${grantSrc} runs through the years of my proposed PhD, which means the infrastructure for ambitious empirical work is in place. The lab's track record of placing students into research roles after graduation reflects the kind of mentorship I want.` },
    { heading: "Future direction",
      body: `If admitted, I'd like to spend my first year building on your verifier-based reasoning approach but extending it to grounded, multi-step interactive settings — environments where a model has to plan, act, and observe. I want to ask whether the verification machinery transfers, and what breaks when the model's actions change the input. Longer-term, I see myself contributing to ${meta.fieldGenericName} as a researcher who builds artifacts that are publicly trusted because their failures are characterized, not just their successes. I would be honored to do that work in your group.` },
  ];
}

window.CVMaker = CVMaker;
window.SOPMaker = SOPMaker;

// --- Paper that auto-scales to fit container width ---
function ScaledPaper({ children, paperWidth = 760 }) {
  const wrapRef = React.useRef(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const update = () => {
      if (!wrapRef.current) return;
      const availW = wrapRef.current.clientWidth - 32; // padding allowance
      setScale(Math.min(1, availW / paperWidth));
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, [paperWidth]);

  return (
    <div ref={wrapRef} style={{ flex: 1, overflow: "auto", padding: "20px 16px", display: "flex", justifyContent: "center" }}>
      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        width: paperWidth,
        // reserve vertical space at scaled height so scrollbars work
        marginBottom: scale < 1 ? -((1 - scale) * 1000) : 0,
      }}>
        {children}
      </div>
    </div>
  );
}
window.ScaledPaper = ScaledPaper;

// --- Shared Versions bar (dropdown + actions) ---
function VersionsBar({ versions, currentId, setCurrentId, onNew, onRename, onDuplicate, onDelete, kind }) {
  const { Icon } = FMP;
  const [open, setOpen] = React.useState(false);
  const current = versions.find(v => v.id === currentId) || versions[0];

  return (
    <div style={{ position: "relative" }}>
      <div className="row gap-1" style={{ alignItems: "stretch" }}>
        <button onClick={() => setOpen(!open)} className="row gap-2" style={{
          flex: 1, padding: "8px 10px",
          borderRadius: 6,
          border: "1px solid var(--line)",
          background: "var(--paper-2)",
          cursor: "pointer",
          alignItems: "center",
          fontSize: 12.5,
          textAlign: "left",
        }}>
          <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icon.Book size={12}/>
          </span>
          <div className="col" style={{ gap: 0, flex: 1, minWidth: 0, overflow: "hidden" }}>
            <span style={{ fontWeight: 500, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{current?.name || "Untitled"}</span>
            <span className="muted" style={{ fontSize: 10.5 }}>Saved {current?.updatedAt}</span>
          </div>
          <Icon.ChevronDown size={12} color="var(--ink-4)"/>
        </button>
        <button onClick={onNew} className="btn btn-sm" title="Save as new version" style={{ paddingLeft: 8, paddingRight: 8 }}>
          <Icon.Plus size={12}/>
        </button>
      </div>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 20 }}/>
          <div className="card fade-in" style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
            zIndex: 21, padding: 4, boxShadow: "var(--shadow-2)", maxHeight: 380, overflow: "auto"
          }}>
            <div style={{ padding: "8px 10px", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--ink-4)", fontWeight: 500 }}>
              All {kind} versions
            </div>
            {versions.map(v => (
              <div key={v.id}
                onClick={() => { setCurrentId(v.id); setOpen(false); }}
                className="row gap-2"
                style={{
                  padding: "8px 10px",
                  borderRadius: 6,
                  background: v.id === currentId ? "var(--green-soft)" : "transparent",
                  cursor: "pointer",
                  alignItems: "center",
                  margin: "2px 0",
                }}
                onMouseOver={e => v.id !== currentId && (e.currentTarget.style.background = "var(--paper-2)")}
                onMouseOut={e => v.id !== currentId && (e.currentTarget.style.background = "transparent")}>
                {v.id === currentId
                  ? <span style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--green-deep)", color: "var(--paper)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon.Check size={9}/></span>
                  : <span style={{ width: 14, height: 14, borderRadius: "50%", border: "1px solid var(--line-2)", flexShrink: 0 }}/>}
                <div className="col" style={{ gap: 0, flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                  <span className="muted" style={{ fontSize: 10.5 }}>{v.updatedAt}{v.words ? ` · ${v.words} words` : ""}{v.label ? ` · ${v.label}` : ""}</span>
                </div>
              </div>
            ))}
            <div style={{ height: 1, background: "var(--line)", margin: "6px 4px" }}/>
            <div className="row gap-1" style={{ padding: 4, flexWrap: "wrap" }}>
              <button className="btn btn-sm" onClick={() => { onNew(); setOpen(false); }} style={{ flex: 1, justifyContent: "center" }}>
                <Icon.Plus size={11}/> New
              </button>
              <button className="btn btn-sm" onClick={() => { onDuplicate(); setOpen(false); }} style={{ flex: 1, justifyContent: "center" }}>
                Duplicate
              </button>
              <button className="btn btn-sm" onClick={() => { onRename(); setOpen(false); }} style={{ flex: 1, justifyContent: "center" }}>
                Rename
              </button>
              <button className="btn btn-sm" onClick={() => { onDelete(); setOpen(false); }} style={{ flex: 1, justifyContent: "center", color: "var(--red)" }}>
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
window.VersionsBar = VersionsBar;

// --- All documents overview ---
function AllDocs({ go, cvVersions, setCvVersions, sopVersions, setSopVersions, setCurrentCvId, setCurrentSopId }) {
  const { Icon } = FMP;
  const byId = Object.fromEntries(FMP.professors.map(p => [p.id, p]));

  const openCV = (id) => { setCurrentCvId(id); go("cv"); };
  const openSOP = (id) => { setCurrentSopId(id); go("sop"); };

  const createCV = () => {
    const name = prompt("Name this CV:", "Untitled CV");
    if (!name) return;
    const newV = { id: "cv" + Date.now(), name, updatedAt: "Just now", data: window.DEFAULT_CV, label: "Variant" };
    setCvVersions([newV, ...cvVersions]);
    openCV(newV.id);
  };
  const createSOP = () => {
    const name = prompt("Name this SOP:", "Untitled SOP");
    if (!name) return;
    const newV = { id: "sop" + Date.now(), name, profId: null, updatedAt: "Just now", status: "draft", words: 0 };
    setSopVersions([newV, ...sopVersions]);
    openSOP(newV.id);
  };

  return (
    <div className="fade-in" style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
      <div className="row between" style={{ marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 32, letterSpacing: "-0.025em" }}>
            My <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic", fontWeight: 400 }}>documents</span>
          </h1>
          <p className="muted" style={{ marginTop: 6 }}>{cvVersions.length} CVs · {sopVersions.length} SOPs · all versions are auto-saved.</p>
        </div>
        <div className="row gap-2">
          <button className="btn" onClick={createCV}><Icon.Plus size={13}/> New CV</button>
          <button className="btn btn-primary" onClick={createSOP}><Icon.Sparkles size={13}/> New SOP</button>
        </div>
      </div>

      {/* CV section */}
      <div style={{ marginBottom: 32 }}>
        <div className="row gap-2" style={{ marginBottom: 12, alignItems: "baseline" }}>
          <h3 style={{ fontSize: 16 }}>CVs</h3>
          <span className="muted" style={{ fontSize: 12 }}>· {cvVersions.length} versions</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {cvVersions.map(v => (
            <button key={v.id} onClick={() => openCV(v.id)} className="card" style={{
              padding: 0, textAlign: "left", cursor: "pointer", overflow: "hidden",
              border: "1px solid var(--line)", background: "white", display: "flex", flexDirection: "column",
            }}
              onMouseOver={e => e.currentTarget.style.borderColor = "var(--green-deep)"}
              onMouseOut={e => e.currentTarget.style.borderColor = "var(--line)"}>
              {/* Mini preview */}
              <div style={{
                height: 130,
                background: "linear-gradient(180deg, white 0%, var(--paper-2) 100%)",
                padding: "16px 20px",
                position: "relative",
                overflow: "hidden",
                borderBottom: "1px solid var(--line)",
              }}>
                <div style={{ fontSize: 8.5, lineHeight: 1.4, color: "var(--ink-3)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                    {v.data?.name || "Untitled"}
                  </div>
                  <div style={{ marginBottom: 8, opacity: 0.7 }}>{v.data?.email}</div>
                  <div style={{ fontWeight: 600, fontSize: 8.5, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2, color: "var(--ink-2)" }}>Education</div>
                  <div style={{ opacity: 0.7 }}>{v.data?.education?.[0]?.school}</div>
                  <div style={{ opacity: 0.5, fontStyle: "italic" }}>{v.data?.education?.[0]?.degree}</div>
                </div>
              </div>
              <div style={{ padding: "12px 16px", flex: 1 }}>
                <div className="row between" style={{ alignItems: "baseline" }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{v.name}</div>
                  <span className="pill pill-outline" style={{ fontSize: 10 }}>{v.label || "CV"}</span>
                </div>
                <div className="muted" style={{ fontSize: 11.5, marginTop: 4 }}>Updated {v.updatedAt}</div>
              </div>
            </button>
          ))}
          {/* New card */}
          <button onClick={createCV} className="card hatch" style={{
            padding: 24, textAlign: "center", cursor: "pointer",
            border: "1px dashed var(--line-2)", background: "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
            color: "var(--ink-3)", minHeight: 220,
          }}>
            <Icon.Plus size={22}/>
            <span style={{ fontSize: 13, fontWeight: 500 }}>New CV version</span>
            <span style={{ fontSize: 11 }}>Start from blank or template</span>
          </button>
        </div>
      </div>

      {/* SOP section */}
      <div>
        <div className="row gap-2" style={{ marginBottom: 12, alignItems: "baseline" }}>
          <h3 style={{ fontSize: 16 }}>Statements of purpose</h3>
          <span className="muted" style={{ fontSize: 12 }}>· {sopVersions.length} versions</span>
        </div>
        <div className="card" style={{ padding: 0 }}>
          {sopVersions.map((v, i) => {
            const target = v.profId ? byId[v.profId] : null;
            return (
              <div key={v.id} className="row gap-3" style={{
                padding: 16, borderTop: i ? "1px solid var(--line)" : 0, cursor: "pointer",
              }}
                onClick={() => openSOP(v.id)}
                onMouseOver={e => e.currentTarget.style.background = "var(--paper-2)"}
                onMouseOut={e => e.currentTarget.style.background = ""}>
                <div style={{ width: 36, height: 44, background: "white", border: "1px solid var(--line)", borderRadius: 4, padding: "4px 5px", flexShrink: 0 }}>
                  <div style={{ height: 2, background: "var(--ink-2)", marginBottom: 3 }}/>
                  <div style={{ height: 1, background: "var(--line-2)", marginBottom: 2 }}/>
                  <div style={{ height: 1, background: "var(--line-2)", marginBottom: 2 }}/>
                  <div style={{ height: 1, background: "var(--line-2)", marginBottom: 2 }}/>
                  <div style={{ height: 1, background: "var(--line-2)", marginBottom: 2, width: "60%" }}/>
                </div>
                <div className="col" style={{ flex: 1, gap: 2 }}>
                  <div className="row gap-2">
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{v.name}</span>
                    {v.status === "ready"
                      ? <span className="pill pill-green">Ready</span>
                      : <span className="pill pill-amber">Draft</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {target ? <>For {target.name} · {target.school}</> : "No target professor yet"}
                  </div>
                  <div className="muted" style={{ fontSize: 11.5 }}>
                    Updated {v.updatedAt} · {v.words || 0} words · ~{Math.max(1, Math.round((v.words || 0) / 250))} page
                  </div>
                </div>
                <div className="row gap-1" onClick={e => e.stopPropagation()}>
                  <button className="btn btn-sm" onClick={() => openSOP(v.id)}>Open</button>
                  <button className="btn btn-sm btn-ghost"><Icon.ExternalLink size={12}/></button>
                </div>
              </div>
            );
          })}
          <div style={{ padding: 12, borderTop: "1px solid var(--line)" }}>
            <button className="btn btn-sm" style={{ width: "100%", justifyContent: "center", borderStyle: "dashed" }} onClick={createSOP}>
              <Icon.Plus size={12}/> New SOP version
            </button>
          </div>
        </div>
      </div>

      <div className="card mt-6" style={{ padding: 18, display: "flex", gap: 14, alignItems: "center" }}>
        <Icon.Award size={16} color="var(--green-hi)"/>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, fontSize: 13.5 }}>Versions are auto-saved</div>
          <div className="muted" style={{ fontSize: 12 }}>Every edit creates a snapshot. Rename, duplicate, or delete from inside the editor.</div>
        </div>
      </div>
    </div>
  );
}
window.AllDocs = AllDocs;
