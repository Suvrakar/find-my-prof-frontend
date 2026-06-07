import React, { useState, useEffect } from 'react';
import { Icon } from '../components/Icons';
import { Avatar, Toggle } from '../components/Shared';
import { gmailAuthService, outreachEmailService } from '../services/api';

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

function ComposerEmptyState({ onDraft }) {
  return (
    <div className="col center" style={{ minHeight: 320, gap: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--green-soft)", display: "grid", placeItems: "center" }}>
        <Icon.Sparkles size={24} color="var(--green-deep)"/>
      </div>
      <div className="col center" style={{ gap: 6, textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 500 }}>Draft with AI?</div>
        <div className="muted" style={{ fontSize: 13, maxWidth: 360 }}>
          We'll write a first version using their most recent paper, active grants, and your interests. You'll edit before sending.
        </div>
      </div>
      <div className="row gap-2 mt-2">
        <button className="btn btn-primary" onClick={onDraft}><Icon.Sparkles size={13}/> Draft with AI</button>
        <button className="btn">Start from scratch</button>
      </div>
    </div>
  );
}

function ComposerGenerating() {
  const steps = [
    "Pulling recent papers from Semantic Scholar…",
    "Checking active grants…",
    "Matching your interests to their work…",
    "Composing…",
  ];
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    if (stepIdx < steps.length - 1) {
      const t = setTimeout(() => setStepIdx(s => s + 1), 320);
      return () => clearTimeout(t);
    }
  }, [stepIdx, steps.length]);
  return (
    <div className="col" style={{ minHeight: 320, gap: 14, padding: "20px 0" }}>
      {steps.map((s, i) => (
        <div key={i} className="row gap-3" style={{ opacity: i <= stepIdx ? 1 : 0.35, transition: "opacity 0.2s" }}>
          {i < stepIdx
            ? <Icon.Check size={14} color="var(--green)"/>
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
    </div>
  );
}

function generateDraft(prof, opts) {
  const lastName = prof.name.replace(/^(Dr\.|Prof\.)\s*/, "").split(" ").pop();
  const lastPaper = prof.lastPaper || 'recent work';
  const funding = prof.funding || '';
  const paperShort = lastPaper.replace(/\s*\([^)]*\)\s*$/, "");
  const intro = opts.tone === "Direct"
    ? `Dear Prof. ${lastName},\n\nI'm writing because I want to do a PhD in your group.`
    : `Dear Prof. ${lastName},\n\nI hope this finds you well — I'm Alex Chen, a final-year BSc student at the University of Washington.`;

  const grantMatch = funding.match(/\d{4}–\d{4}/);
  const grantEnd = grantMatch ? grantMatch[0].split("–")[1] : "2028";
  const grantName = funding.split("·")[0].trim() || 'research';

  return `${intro}

I read your recent paper, "${paperShort}", with real interest — the way you handle grounded reasoning across modalities is closer to my own thinking than anything I've read this year. My undergrad thesis built a small vision–language model for chart understanding, which had similar failures around fine-grained spatial composition.

I noticed your ${grantName} grant runs through ${grantEnd} and that your group page mentions openings. Could I ask whether you're considering students for ${opts.length === "Brief" ? "Fall 2026" : "the Fall 2026 cohort"}? I've attached a brief CV and a one-page research statement.
${opts.length === "Detailed" ? `
A few specific directions I'd love to discuss:
• Tactile-style grounding for VLMs in interactive settings
• How verifier-based reasoning fares vs. self-consistency in agent loops
• Whether the methods in your paper transfer to small (<3B) models

` : ""}Thank you for your time. I understand how many of these emails you must receive, and I'd be grateful for even a brief reply.

Warmly,
Alex Chen
University of Washington · BSc Computer Science, 2024
alex.chen@uw.edu`;
}

export default function Composer({ prof, go }) {
  const [phase, setPhase]   = useState("idle");
  const [subject, setSubject] = useState("");
  const [body, setBody]     = useState("");
  const [opts, setOpts]     = useState({ tone: "Earnest", length: "Concise", referencePaper: true, includeCV: true });
  const [gmail, setGmail]   = useState({ connected: false, email: '' });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    if (!prof) go("matches");
  }, [prof, go]);

  useEffect(() => {
    gmailAuthService.status()
      .then(r => setGmail(r.data))
      .catch(() => {});
  }, []);

  if (!prof) return null;

  function connectGmail() {
    gmailAuthService.start()
      .then(res => {
        const popup = window.open(res.data.auth_url, 'gmail_oauth', 'width=600,height=700,left=200,top=100');
        const handler = (e) => {
          if (e.data?.type === 'gmail_oauth_success') {
            window.removeEventListener('message', handler);
            setGmail({ connected: true, email: e.data.email || '' });
            popup?.close();
          }
        };
        window.addEventListener('message', handler);
      })
      .catch(() => {});
  }

  async function sendEmail() {
    if (!gmail.connected) { connectGmail(); return; }
    if (!prof.email) { setSendError('No email address found for this professor.'); return; }
    setSending(true);
    setSendError('');
    try {
      await outreachEmailService.send({
        prof_email:    prof.email,
        subject,
        body_text:     body,
        professor_id:  prof.id,
        prof_name:     prof.name,
        prof_affil:    prof.school || '',
      });
      setPhase("sent");
    } catch (err) {
      setSendError(err?.response?.data?.error || 'Send failed — please try again.');
    } finally {
      setSending(false);
    }
  }

  const draft = () => {
    setPhase("generating");
    setTimeout(() => {
      setSubject(`PhD inquiry — alignment with your ${(prof.lastPaper || 'recent work').split("(")[0].trim()} work`);
      setBody(generateDraft(prof, opts));
      setPhase("ready");
    }, 1400);
  };

  return (
    <div className="fade-in composer-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", height: "calc(100vh - 56px)" }}>
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
                  <Avatar initials={prof.initials}/>
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
                  ? <SkeletonLine w="70%"/>
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
                  style={{ width: "100%", minHeight: 320, border: 0, outline: 0, resize: "vertical", fontSize: 14, lineHeight: 1.65, color: "var(--ink)", fontFamily: "var(--font-body)", background: "transparent" }}
                />
              )}
              {phase === "ready" && (
                <div className="mt-4" style={{ padding: 12, background: "var(--green-soft)", borderRadius: 8, fontSize: 12, color: "var(--green-deep)" }}>
                  <Icon.Check size={12}/> Grounded in: <strong>{prof.lastPaper || 'recent work'}</strong>{prof.funding && <> · grant: <strong>{prof.funding.split("·")[0]}</strong></>}
                </div>
              )}
            </div>

            {phase !== "idle" && phase !== "generating" && (
              <div className="col" style={{ borderTop: "1px solid var(--line)", background: "var(--paper-2)" }}>
                {!gmail.connected && (
                  <div className="row gap-2" style={{ padding: "8px 20px", background: "#fffbeb", borderBottom: "1px solid #fbbf24", fontSize: 12, color: "#92400e", alignItems: "center" }}>
                    <Icon.Mail size={12} color="#d97706"/>
                    <span>Gmail not connected.</span>
                    <button className="btn btn-sm" style={{ fontSize: 11, padding: "2px 8px" }} onClick={connectGmail}>Connect Gmail</button>
                  </div>
                )}
                {sendError && (
                  <div style={{ padding: "6px 20px", fontSize: 12, color: "var(--red)", background: "#fff1f2" }}>{sendError}</div>
                )}
                <div className="row between" style={{ padding: "12px 20px" }}>
                  <div className="row gap-2">
                    <button className="btn btn-sm"><Icon.Plus size={12}/> Attach CV</button>
                    <button className="btn btn-sm" onClick={draft}><Icon.Sparkles size={12}/> Regenerate</button>
                  </div>
                  <div className="row gap-2">
                    <button className="btn btn-sm">Save draft</button>
                    {phase === "sent" ? (
                      <button className="btn btn-sm btn-primary" disabled>
                        <Icon.Check size={12}/> Sent
                      </button>
                    ) : (
                      <button className="btn btn-sm btn-primary" onClick={sendEmail} disabled={sending || !subject || !body}>
                        <Icon.Send size={12}/> {sending ? "Sending…" : (gmail.connected ? "Send" : "Connect & Send")}
                      </button>
                    )}
                  </div>
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
          <Toggle label="Recent paper" sub={prof.lastPaper || ''} checked={opts.referencePaper} onChange={v => setOpts({ ...opts, referencePaper: v })}/>
          <Toggle label="Your CV" sub="alex_chen_cv.pdf" checked={opts.includeCV} onChange={v => setOpts({ ...opts, includeCV: v })}/>
          {prof.funding && <Toggle label="Active grant" sub={prof.funding.split("·")[0].trim()} checked={true}/>}
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
