import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icons';
import { ScoreRing, Bar, Avatar } from '../components/Shared';
import { professors } from '../data';
import { useAuth } from '../App';

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Responsive breakpoint hook ────────────────────────────────────────────────
function useBreakpoint() {
  const [width, setWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));
  useEffect(() => {
    const fn = () => setWidth(window.innerWidth);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);
  return {
    isMobile:  width < 640,
    isTablet:  width >= 640 && width < 1024,
    isDesktop: width >= 1024,
  };
}

// ── Scene illustration: Plane → trajectory → graduation milestone ─────────────
function JourneyDecor({ style }) {
  return (
    <svg
      viewBox="0 0 520 290"
      preserveAspectRatio="xMinYMax meet"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ display: 'block', pointerEvents: 'none', ...style }}
    >
      <defs>
        <filter id="ms-drop" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="black" floodOpacity="0.08"/>
        </filter>
      </defs>

      {/* ── LOW-OPACITY LAYER: static decorations ── */}
      <g opacity="0.13">
        <path d="M42,258 C80,190 310,70 470,38" strokeWidth="1.5" strokeDasharray="6 9" strokeOpacity="0.75"/>
        <circle cx="86"  cy="212" r="2.8" fill="currentColor" stroke="none" fillOpacity="0.65"/>
        <circle cx="163" cy="160" r="2.8" fill="currentColor" stroke="none" fillOpacity="0.65"/>
        <circle cx="261" cy="110" r="3.2" fill="currentColor" stroke="none" fillOpacity="0.75"/>
        <circle cx="368" cy="67"  r="2.8" fill="currentColor" stroke="none" fillOpacity="0.65"/>
        <g strokeWidth="1.4">
          <g transform="rotate(90)">
            <ellipse cx="0" cy="0" rx="3" ry="22"/>
            <path d="M-2.5,-3 L-21,9 L-19,15 L-2.5,4"/>
            <path d="M2.5,-3 L21,9 L19,15 L2.5,4"/>
            <path d="M-2.5,13 L-11,21 L-9,24 L-2.5,16"/>
            <path d="M2.5,13 L11,21 L9,24 L2.5,16"/>
          </g>
          <animateMotion dur="60s" repeatCount="indefinite" rotate="auto" calcMode="linear" path="M42,258 C80,190 310,70 470,38"/>
        </g>
        <g transform="translate(470,38)" strokeWidth="1.4">
          <circle cx="0" cy="-14" r="36" strokeWidth="1" strokeDasharray="3 5" strokeOpacity="0.5"/>
          <polygon points="0,-28 22,-16 0,-4 -22,-16" strokeWidth="1.5"/>
          <path d="M-13,-13 L-13,-4 Q0,5 13,-4 L13,-13" strokeWidth="1.5"/>
          <line x1="22" y1="-16" x2="22" y2="2" strokeWidth="1.3"/>
          <circle cx="22" cy="6" r="4" strokeWidth="1.3"/>
          <line x1="34" y1="-34" x2="41" y2="-41" strokeWidth="1.1" strokeOpacity="0.7"/>
          <line x1="42" y1="-28" x2="51" y2="-28" strokeWidth="1.1" strokeOpacity="0.7"/>
          <line x1="36" y1="-20" x2="43" y2="-13" strokeWidth="1.1" strokeOpacity="0.7"/>
        </g>
      </g>

      {/* ── MILESTONE CARDS ── */}

      {/* Milestone 1 — Profile Complete — green — 20% = 12s */}
      <g opacity="0">
        <path d="M86,210 L94,198 L100,198" strokeWidth="0.6" strokeDasharray="2 2" stroke="#15803d" fill="none" opacity="0.55"/>
        <rect x="100" y="174" width="144" height="48" rx="8" fill="white" stroke="none" filter="url(#ms-drop)"/>
        <rect x="100" y="174" width="4" height="48" rx="2" fill="#16a34a" stroke="none"/>
        <circle cx="119" cy="198" r="9.5" fill="#dcfce7" stroke="none"/>
        <path d="M115,198 L118,201.5 L123,194.5" stroke="#15803d" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="134" y="193" fontSize="7.5" fontWeight="700" fill="#111827" fontFamily="Inter,system-ui,sans-serif" stroke="none">Profile Complete</text>
        <text x="134" y="205" fontSize="6.2" fill="#6b7280" fontFamily="Inter,system-ui,sans-serif" stroke="none">Research interests mapped</text>
        <animate attributeName="opacity" values="0;0;0.78;0.78;0;0" keyTimes="0;0.2;0.21;0.35;0.37;1" dur="60s" repeatCount="indefinite"/>
      </g>

      {/* Milestone 2 — Matching Started — blue — 40% = 24s */}
      <g opacity="0">
        <path d="M163,158 L171,146 L177,146" strokeWidth="0.6" strokeDasharray="2 2" stroke="#1d4ed8" fill="none" opacity="0.55"/>
        <rect x="177" y="122" width="144" height="48" rx="8" fill="white" stroke="none" filter="url(#ms-drop)"/>
        <rect x="177" y="122" width="4" height="48" rx="2" fill="#3b82f6" stroke="none"/>
        <circle cx="196" cy="146" r="9.5" fill="#dbeafe" stroke="none"/>
        <circle cx="194.5" cy="144.5" r="4.5" stroke="#2563eb" strokeWidth="1.5" fill="none"/>
        <path d="M198,148 L201,151" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <text x="211" y="141" fontSize="7.5" fontWeight="700" fill="#111827" fontFamily="Inter,system-ui,sans-serif" stroke="none">Matching Started</text>
        <text x="211" y="153" fontSize="6.2" fill="#6b7280" fontFamily="Inter,system-ui,sans-serif" stroke="none">AI scanning 10,000+ professors</text>
        <animate attributeName="opacity" values="0;0;0.78;0.78;0;0" keyTimes="0;0.4;0.41;0.55;0.57;1" dur="60s" repeatCount="indefinite"/>
      </g>

      {/* Milestone 3 — Top Picks Found — amber — 60% = 36s */}
      <g opacity="0">
        <path d="M261,108 L269,96 L275,96" strokeWidth="0.6" strokeDasharray="2 2" stroke="#b45309" fill="none" opacity="0.55"/>
        <rect x="275" y="72" width="144" height="48" rx="8" fill="white" stroke="none" filter="url(#ms-drop)"/>
        <rect x="275" y="72" width="4" height="48" rx="2" fill="#f59e0b" stroke="none"/>
        <circle cx="294" cy="96" r="9.5" fill="#fef3c7" stroke="none"/>
        <polygon points="294,90.2 295.5,94.0 299.5,94.2 296.4,96.8 297.4,100.7 294,98.5 290.6,100.7 291.6,96.8 288.5,94.2 292.5,94.0" fill="#f59e0b" stroke="none"/>
        <text x="309" y="91" fontSize="7.5" fontWeight="700" fill="#111827" fontFamily="Inter,system-ui,sans-serif" stroke="none">Top Picks Found</text>
        <text x="309" y="103" fontSize="6.2" fill="#6b7280" fontFamily="Inter,system-ui,sans-serif" stroke="none">3 perfect advisor matches</text>
        <animate attributeName="opacity" values="0;0;0.78;0.78;0;0" keyTimes="0;0.6;0.61;0.75;0.77;1" dur="60s" repeatCount="indefinite"/>
      </g>

      {/* Milestone 4 — Outreach Ready — green — 80% = 48s */}
      <g opacity="0">
        <path d="M366,65 L360,54 L252,54" strokeWidth="0.6" strokeDasharray="2 2" stroke="#15803d" fill="none" opacity="0.55"/>
        <rect x="248" y="30" width="144" height="48" rx="8" fill="white" stroke="none" filter="url(#ms-drop)"/>
        <rect x="248" y="30" width="4" height="48" rx="2" fill="#16a34a" stroke="none"/>
        <circle cx="267" cy="54" r="9.5" fill="#dcfce7" stroke="none"/>
        <rect x="261.5" y="49.5" width="11" height="9" rx="1.5" fill="none" stroke="#15803d" strokeWidth="1.4"/>
        <path d="M261.5,49.5 L267,55.5 L272.5,49.5" stroke="#15803d" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        <text x="282" y="49" fontSize="7.5" fontWeight="700" fill="#111827" fontFamily="Inter,system-ui,sans-serif" stroke="none">Outreach Ready</text>
        <text x="282" y="61" fontSize="6.2" fill="#6b7280" fontFamily="Inter,system-ui,sans-serif" stroke="none">Personalized emails drafted</text>
        <animate attributeName="opacity" values="0;0;0.78;0.78;0;0" keyTimes="0;0.8;0.81;0.95;0.97;1" dur="60s" repeatCount="indefinite"/>
      </g>
    </svg>
  );
}

// ── Standalone graduation cap ─────────────────────────────────────────────────
function GradCapDecor({ style }) {
  return (
    <svg viewBox="0 0 100 82" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: 'block', pointerEvents: 'none', ...style }}>
      <polygon points="50,6 95,26 50,46 5,26"/>
      <path d="M20,30 L20,54 Q50,68 80,54 L80,30"/>
      <line x1="95" y1="26" x2="95" y2="52"/>
      <circle cx="95" cy="58" r="5.5"/>
    </svg>
  );
}

// ── Universities ──────────────────────────────────────────────────────────────
const WIKI = 'https://commons.wikimedia.org/wiki/Special:FilePath/';
const UNIS = [
  { name: 'MIT',              wiki: 'MIT_logo.svg' },
  { name: 'Stanford',         wiki: 'Stanford_wordmark_2012.svg' },
  { name: 'Harvard',          wiki: 'Harvard_University_logo.svg' },
  { name: 'Oxford',           wiki: 'University_of_Oxford.svg' },
  { name: 'ETH Zürich',       wiki: 'ETH_Zurich_Logo_black.svg' },
  { name: 'UC Berkeley',      wiki: 'UC_Berkeley_wordmark.svg' },
  { name: 'Caltech',          wiki: 'Caltech_Logo.svg' },
  { name: 'Princeton',        wiki: 'Princeton_logo.svg' },
  { name: 'Yale',             wiki: 'Yale_University_logo.svg' },
  { name: 'Columbia',         wiki: 'Columbia_University_Logo.png' },
  { name: 'Cornell',          wiki: 'Cornell_University_Logo.svg' },
  { name: 'CMU',              wiki: 'Carnegie_Mellon_University_wordmark.svg' },
  { name: 'U of Toronto',     wiki: 'University_of_Toronto_Logo.svg' },
  { name: 'TU Munich',        wiki: 'TUM_Logo.svg' },
  { name: 'Imperial College', wiki: 'Imperial_College_London_new_logo.svg' },
  { name: 'NUS',              wiki: 'National_University_of_Singapore_logo.svg' },
  { name: 'EPFL',             wiki: 'Logo_EPFL.svg' },
];

function UniLogo({ uni }) {
  const [state, setState] = useState('loading');
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0 40px', flexShrink: 0 }}>
      {state !== 'error' ? (
        <img src={`${WIKI}${uni.wiki}`} alt={uni.name} height={28}
          style={{
            objectFit: 'contain', display: 'block', maxWidth: 120,
            filter: 'grayscale(100%) opacity(0.42)',
            opacity: state === 'ok' ? 1 : 0,
            transition: 'opacity 0.4s ease, filter 0.22s ease',
          }}
          onLoad={() => setState('ok')}
          onError={() => setState('error')}
          onMouseOver={e => { e.currentTarget.style.filter = 'grayscale(100%) opacity(0.72)'; }}
          onMouseOut={e => { e.currentTarget.style.filter = 'grayscale(100%) opacity(0.42)'; }}
        />
      ) : (
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '-0.025em', color: '#c0c6cc', whiteSpace: 'nowrap', userSelect: 'none' }}>
          {uni.name}
        </span>
      )}
    </div>
  );
}

function UniMarquee() {
  const track = [...UNIS, ...UNIS];
  return (
    <div style={{
      background: '#ffffff', flexShrink: 0, height: 72,
      display: 'flex', alignItems: 'center',
      borderTop: '1px solid #eaecef', overflow: 'hidden',
      maskImage: 'linear-gradient(to right, transparent 0%, #000 clamp(32px,8vw,110px), #000 calc(100% - clamp(32px,8vw,110px)), transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 clamp(32px,8vw,110px), #000 calc(100% - clamp(32px,8vw,110px)), transparent 100%)',
    }}>
      <div className="marquee-inner" style={{ animationDuration: '70s' }}>
        {track.map((u, i) => <UniLogo key={i} uni={u}/>)}
      </div>
    </div>
  );
}

// ── Floating professor card ───────────────────────────────────────────────────
function ProfCard({ prof }) {
  if (!prof) return null;
  return (
    <div className="card" style={{
      padding: '14px 16px', borderRadius: 14,
      boxShadow: '0 8px 32px -8px oklch(0.18 0.02 155 / 0.18), 0 2px 8px oklch(0.18 0.02 155 / 0.06)',
    }}>
      <div className="row gap-2" style={{ alignItems: 'flex-start' }}>
        <Avatar initials={prof.initials}/>
        <div className="col" style={{ flex: 1, gap: 2, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.3 }}>{prof.name}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.4 }}>
            {prof.dept}<br/>{prof.school}
          </div>
          <div className="row gap-1" style={{ marginTop: 6, flexWrap: 'wrap' }}>
            {prof.accepting && (
              <span className="pill pill-green" style={{ fontSize: 10, padding: '2px 6px' }}>
                <Icon.Check size={9}/> Accepting
              </span>
            )}
            {(prof.keywords || []).slice(0, 2).map(k => (
              <span key={k} className="pill" style={{ fontSize: 10, padding: '2px 6px' }}>{k}</span>
            ))}
          </div>
        </div>
        <ScoreRing value={prof.score} size={42}/>
      </div>
    </div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
function Step({ n, icon, title, body, delay, visible, compact }) {
  const I = Icon[icon];
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease`,
      background: 'white', border: '1px solid var(--line)',
      borderRadius: 16, padding: compact ? '22px 22px 26px' : '28px 28px 32px',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', right: 12, top: -2,
        fontSize: compact ? 56 : 84, fontWeight: 700,
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        color: 'var(--paper-2)', lineHeight: 1,
        userSelect: 'none', pointerEvents: 'none', letterSpacing: '-0.04em',
      }}>
        {n}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: 'var(--green-soft)', display: 'grid', placeItems: 'center',
        marginBottom: 16, position: 'relative',
      }}>
        {I && <I size={18} color="var(--green-deep)"/>}
      </div>
      <h3 style={{ fontSize: compact ? 16 : 19, marginBottom: 10, position: 'relative', letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ color: 'var(--ink-3)', fontSize: compact ? 13 : 13.5, margin: 0, lineHeight: 1.6, position: 'relative' }}>{body}</p>
    </div>
  );
}

// ── Stat ──────────────────────────────────────────────────────────────────────
function Stat({ value, label, sub, delay, visible, compact }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: compact ? '28px 20px' : '44px 24px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    }}>
      <div style={{
        fontSize: compact ? 44 : 58, fontWeight: 400, letterSpacing: '-0.04em',
        fontFamily: '"Instrument Serif", serif', fontStyle: 'italic',
        color: 'var(--green-deep)', lineHeight: 1, marginBottom: 8,
      }}>
        {value}
      </div>
      <div style={{ fontWeight: 500, fontSize: compact ? 14 : 15, color: 'var(--ink)', marginBottom: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const isSmall = isMobile || isTablet; // anything below desktop

  const [stepsRef,  stepsVisible]  = useReveal();
  const [statsRef,  statsVisible]  = useReveal();
  const [feat1Ref,  feat1Visible]  = useReveal();
  const [feat2Ref,  feat2Visible]  = useReveal();
  const [feat3Ref,  feat3Visible]  = useReveal();
  const [ctaRef,    ctaVisible]    = useReveal(0.2);

  const prof0 = professors?.[0];
  const prof1 = professors?.[1];
  const prof2 = professors?.[2];

  // Derived responsive values
  const hPad = isMobile ? '0 20px' : isTablet ? '0 32px' : '0 40px';
  const secPad = isMobile ? '64px 20px' : isTablet ? '80px 32px' : '100px 40px';

  return (
    <div className="landing" style={{ overflowX: 'hidden' }}>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="topnav" style={{
        background: 'oklch(0.985 0.005 100 / 0.88)',
        backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--line)',
        padding: isMobile ? '0 16px' : '0 40px',
      }}>
        <div className="brand"><Icon.Logo /> Find My Professor</div>

        {/* Nav links — hidden on mobile */}
        {!isMobile && (
          <div className="row gap-1" style={{ marginLeft: 28 }}>
            {[
              { label: 'How it works', action: () => document.getElementById('how').scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Pricing',      action: () => navigate('/pricing') },
            ].map(({ label, action }) => (
              <button key={label} onClick={action} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px 12px', borderRadius: 7,
                fontSize: 13, color: 'var(--ink-3)', fontWeight: 450,
                fontFamily: 'inherit', transition: 'color 0.12s, background 0.12s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = 'var(--paper-2)'; }}
              onMouseOut={e => { e.currentTarget.style.color = 'var(--ink-3)'; e.currentTarget.style.background = 'none'; }}>
                {label}
              </button>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto' }} className="row gap-2">
          <button className="btn btn-ghost" style={{ fontSize: 13 }} onClick={() => openAuthModal('signin')}>
            Sign in
          </button>
          <button className="btn btn-primary" style={{ fontSize: 13 }} onClick={() => openAuthModal('signup')}>
            {isMobile ? 'Get started' : 'Get started free'}
          </button>
        </div>
      </nav>

      {/* ── Hero + Marquee ────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        // Fixed viewport height on desktop; auto on mobile/tablet so content isn't clipped
        height: isSmall ? 'auto' : 'calc(100vh - 56px)',
        minHeight: isSmall ? 0 : 480,
      }}>

        {/* Hero */}
        <section style={{
          flex: 1,
          padding: isSmall
            ? (isMobile ? '56px 20px 48px' : '64px 32px 56px')
            : '0 40px',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center',
          background: 'var(--paper)',
        }}>
          {/* Dot-grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, var(--green-soft) 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px', opacity: 0.55,
          }}/>
          {/* Radial glow */}
          <div style={{
            position: 'absolute', top: -180, left: '28%',
            width: 720, height: 720,
            background: 'radial-gradient(ellipse, oklch(0.75 0.08 155 / 0.12) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}/>

          {/* Journey illustration — desktop only; too small to read on mobile */}
          {!isMobile && (
            <JourneyDecor style={{
              position: 'absolute', inset: 0, zIndex: 2,
              width: '100%', height: '100%',
              color: 'var(--green-deep)',
            }}/>
          )}

          <div style={{ maxWidth: 1120, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isSmall ? '1fr' : '1fr 400px',
              gap: isSmall ? 0 : 72,
              alignItems: 'center',
            }}>

              {/* Text column */}
              <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                <div style={{ marginBottom: isMobile ? 20 : 28, animation: 'landingFadeUp 0.5s 0s ease both' }}>
                  <span className="pill pill-green" style={{ fontSize: isMobile ? 11 : 12, padding: '5px 12px', gap: 8 }}>
                    <span className="live-dot"/>
                    184,000+ professors indexed · updated daily
                  </span>
                </div>

                <h1 style={{
                  fontSize: isMobile ? 40 : isTablet ? 52 : 62,
                  lineHeight: 1.02, letterSpacing: '-0.04em', fontWeight: 480,
                  animation: 'landingFadeUp 0.55s 0.07s ease both',
                }}>
                  Find the right<br/>
                  professor for<br/>
                  <span style={{
                    fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontWeight: 400,
                    background: 'linear-gradient(125deg, var(--green-deep) 0%, oklch(0.45 0.085 155) 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>
                    your research.
                  </span>
                </h1>

                <p style={{
                  fontSize: isMobile ? 15.5 : 17,
                  color: 'var(--ink-3)', lineHeight: 1.6,
                  maxWidth: isMobile ? '100%' : 500,
                  marginTop: isMobile ? 16 : 22,
                  animation: 'landingFadeUp 0.55s 0.14s ease both',
                }}>
                  We crawl ORCID, arXiv, Semantic Scholar and university directories every day —
                  then rank advisors who fit your research and are <em>actually</em> accepting students.
                </p>

                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 10,
                  marginTop: isMobile ? 24 : 32,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  animation: 'landingFadeUp 0.55s 0.21s ease both',
                }}>
                  <button className="btn btn-primary btn-lg" style={{ fontSize: 14, gap: 10, borderRadius: 10 }}
                    onClick={() => openAuthModal('signup')}>
                    Start matching — free <Icon.Chevron size={13}/>
                  </button>
                  <button className="btn btn-lg" style={{ fontSize: 14, borderRadius: 10 }}
                    onClick={() => document.getElementById('how').scrollIntoView({ behavior: 'smooth' })}>
                    How it works
                  </button>
                </div>

                <div style={{
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center',
                  gap: '8px 20px',
                  marginTop: isMobile ? 16 : 24,
                  color: 'var(--ink-4)', fontSize: 12.5,
                  justifyContent: isMobile ? 'center' : 'flex-start',
                  animation: 'landingFadeUp 0.55s 0.28s ease both',
                }}>
                  {['No credit card required', '5 free matches per week', 'GDPR compliant'].map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                      <Icon.Check size={12} color="var(--green)"/> {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cards column — desktop only */}
              {!isSmall && (
                <div style={{ position: 'relative', height: 420, animation: 'landingFadeUp 0.65s 0.18s ease both' }}>
                  {[prof2, prof1, prof0].map((prof, idx) => {
                    const configs = [
                      { top: 260, left: 22, opacity: 0.8,  delay: 0.3  },
                      { top: 136, left: 11, opacity: 0.92, delay: 0.42 },
                      { top: 10,  left: 0,  opacity: 1,    delay: 0.54 },
                    ];
                    const c = configs[idx];
                    return (
                      <div key={idx} style={{
                        position: 'absolute', width: '100%',
                        top: c.top, left: c.left, zIndex: idx + 1,
                        opacity: c.opacity,
                        animation: `cardSlideIn 0.48s ${c.delay}s ease both`,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <ProfCard prof={prof}/>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* University marquee */}
        <UniMarquee/>

      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--paper)', padding: hPad }}>
        <div ref={statsRef} style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          borderBottom: '1px solid var(--line)',
        }}>
          <Stat value="184K+" label="Professors indexed"        sub="Updated daily from 12 sources"    delay={0}   visible={statsVisible} compact={isMobile}/>
          <Stat value="50+"   label="Countries covered"         sub="Asia, Europe, Americas & beyond"  delay={0.1} visible={statsVisible} compact={isMobile}/>
          <Stat value="4×"    label="Faster than manual search" sub="Average time to build a shortlist" delay={0.2} visible={statsVisible} compact={isMobile}/>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" style={{ padding: secPad, position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <GradCapDecor style={{ position: 'absolute', width: 215, bottom: -28, right: -22, opacity: 0.09, transform: 'rotate(-13deg)', color: 'var(--green-deep)' }}/>
          {!isMobile && <GradCapDecor style={{ position: 'absolute', width: 155, top: 22, left: -16, opacity: 0.08, transform: 'rotate(17deg)', color: 'var(--green-deep)' }}/>}
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 36 : 56 }}>
            <div className="pill pill-outline" style={{ marginBottom: 14, fontSize: 11 }}>How it works</div>
            <h2 style={{ fontSize: isMobile ? 30 : isTablet ? 38 : 46, letterSpacing: '-0.035em', marginBottom: 14 }}>
              From idea to shortlist in{' '}
              <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic' }}>minutes</span>.
            </h2>
            <p style={{ color: 'var(--ink-3)', fontSize: isMobile ? 14 : 15.5, maxWidth: 480, margin: '0 auto', lineHeight: 1.55 }}>
              No more 40-tab afternoons reading lab pages. Tell us your research — we do the legwork.
            </p>
          </div>

          <div ref={stepsRef} style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 16,
          }}>
            <Step n="01" icon="Sparkles"
              title="Describe your research"
              body="Paste a paragraph from your statement or pick from 60+ research tags. We embed it semantically — synonyms count."
              delay={0} visible={stepsVisible} compact={isSmall}/>
            <Step n="02" icon="Trend"
              title="Get a ranked shortlist"
              body="Composite scores from expertise, funding signals, recent activity, and reputation. Every match explains its reasoning."
              delay={isMobile ? 0 : 0.1} visible={stepsVisible} compact={isSmall}/>
            {/* Step 3 spans full width on tablet (2-col grid → 3rd card fills row) */}
            <div style={isTablet ? { gridColumn: '1 / -1' } : undefined}>
              <Step n="03" icon="Send"
                title="Reach out with confidence"
                body="AI-drafted emails referencing a real recent paper. Track opens, replies, and follow-ups in one inbox."
                delay={isMobile ? 0 : 0.2} visible={stepsVisible} compact={isSmall}/>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section style={{
        padding: isMobile ? '0 20px 64px' : isTablet ? '0 32px 80px' : '0 40px 100px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {!isMobile && <GradCapDecor style={{ position: 'absolute', width: 225, top: '8%', right: -24, opacity: 0.08, transform: 'rotate(-11deg)', color: 'var(--green-deep)' }}/>}
          {!isMobile && <GradCapDecor style={{ position: 'absolute', width: 185, top: '55%', left: -20, opacity: 0.07, transform: 'rotate(13deg)', color: 'var(--green-deep)' }}/>}
        </div>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          {/* Feature 1 — scores */}
          <div ref={feat1Ref} style={{
            display: 'grid',
            gridTemplateColumns: isSmall ? '1fr' : '1.1fr 1fr',
            gap: isSmall ? 32 : 64,
            alignItems: 'center',
            padding: isSmall ? '48px 0' : '76px 0',
            borderTop: '1px solid var(--line)',
            opacity: feat1Visible ? 1 : 0,
            transform: feat1Visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.65s ease, transform 0.65s ease',
          }}>
            <div>
              <div className="pill pill-outline" style={{ marginBottom: 16, fontSize: 11 }}>Match scores</div>
              <h3 style={{ fontSize: isMobile ? 26 : isTablet ? 30 : 34, letterSpacing: '-0.03em', marginBottom: 14 }}>
                Every score is fully explained.
              </h3>
              <p style={{ color: 'var(--ink-3)', fontSize: isMobile ? 14 : 15.5, lineHeight: 1.65, margin: 0 }}>
                Four signals — expertise fit, funding activity, publication recency, and field reputation —
                broken down so you understand the match before reading a single paper.
              </p>
            </div>
            <div className="card" style={{ padding: 22, borderRadius: 16 }}>
              <div className="row gap-3" style={{ marginBottom: 20 }}>
                <Avatar initials="ME" size="lg"/>
                <div className="col" style={{ flex: 1, gap: 3, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>Dr. Mariam El-Sayed</div>
                  <div className="muted" style={{ fontSize: 12 }}>Associate Professor · ETH Zürich</div>
                  <span className="pill pill-green" style={{ alignSelf: 'flex-start', fontSize: 10, marginTop: 2 }}>
                    <Icon.Check size={9}/> Accepting students
                  </span>
                </div>
                <ScoreRing value={94}/>
              </div>
              <div className="col gap-4">
                <Bar value={96} label="Expertise"/>
                <Bar value={92} label="Funding"/>
                <Bar value={95} label="Activity"/>
                <Bar value={88} label="Reputation"/>
              </div>
            </div>
          </div>

          {/* Feature 2 — hiring signals */}
          <div ref={feat2Ref} style={{
            display: 'grid',
            gridTemplateColumns: isSmall ? '1fr' : '1fr 1.1fr',
            gap: isSmall ? 32 : 64,
            alignItems: 'center',
            padding: isSmall ? '48px 0' : '76px 0',
            borderTop: '1px solid var(--line)',
            opacity: feat2Visible ? 1 : 0,
            transform: feat2Visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.65s ease, transform 0.65s ease',
          }}>
            {/* On mobile/tablet: show text first, card second */}
            <div style={{ order: isSmall ? -1 : 0 }}>
              <div className="pill pill-outline" style={{ marginBottom: 16, fontSize: 11 }}>Hiring signals</div>
              <h3 style={{ fontSize: isMobile ? 26 : isTablet ? 30 : 34, letterSpacing: '-0.03em', marginBottom: 14 }}>
                Only labs actually hiring.
              </h3>
              <p style={{ color: 'var(--ink-3)', fontSize: isMobile ? 14 : 15.5, lineHeight: 1.65, margin: 0 }}>
                We cross-reference grant cycles, recent group-page edits, and posted openings.
                Emeritus profiles and closed labs are filtered out before you see them.
              </p>
            </div>
            <div className="card" style={{ padding: 22, borderRadius: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Lab signals
              </div>
              <div className="col gap-2">
                {[
                  { label: 'Active NIH grant through 2028',    type: 'green' },
                  { label: '2 PhD positions posted this term', type: 'green' },
                  { label: 'Lab site updated 3 days ago',      type: 'blue'  },
                  { label: 'No reply to recent emails (14d)',  type: 'amber' },
                  { label: 'Emeritus — not accepting',         type: 'red'   },
                ].map((item, i) => (
                  <div key={i} className="row gap-2" style={{ padding: '9px 12px', background: 'var(--paper-2)', borderRadius: 8, fontSize: 13 }}>
                    <span className={`pill pill-${item.type}`} style={{ fontSize: 10, minWidth: 54, justifyContent: 'center', flexShrink: 0 }}>
                      {item.type === 'green' ? '● Active' : item.type === 'blue' ? '● Recent' : item.type === 'amber' ? '● Slow' : '✕ Closed'}
                    </span>
                    <span style={{ color: 'var(--ink-2)' }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3 — email */}
          <div ref={feat3Ref} style={{
            display: 'grid',
            gridTemplateColumns: isSmall ? '1fr' : '1.1fr 1fr',
            gap: isSmall ? 32 : 64,
            alignItems: 'center',
            padding: isSmall ? '48px 0' : '76px 0',
            borderTop: '1px solid var(--line)',
            opacity: feat3Visible ? 1 : 0,
            transform: feat3Visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.65s ease, transform 0.65s ease',
          }}>
            <div>
              <div className="pill pill-outline" style={{ marginBottom: 16, fontSize: 11 }}>Email outreach</div>
              <h3 style={{ fontSize: isMobile ? 26 : isTablet ? 30 : 34, letterSpacing: '-0.03em', marginBottom: 14 }}>
                Emails grounded in real papers.
              </h3>
              <p style={{ color: 'var(--ink-3)', fontSize: isMobile ? 14 : 15.5, lineHeight: 1.65, margin: 0 }}>
                The composer drafts a personalized note referencing an actual recent publication.
                You edit. You send. No hallucinated citations, no generic templates.
              </p>
            </div>
            <div className="card" style={{ padding: 22, borderRadius: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
                Draft · AI-generated
              </div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.75, color: 'var(--ink-2)' }}>
                <span style={{ color: 'var(--ink-4)' }}>To: </span>okonkwo@mit.edu<br/>
                <span style={{ color: 'var(--ink-4)' }}>Subject: </span>PhD inquiry — gene circuits<br/>
                <br/>
                Dear Prof. Okonkwo,<br/><br/>
                I read your{' '}
                <span style={{ background: 'var(--green-soft)', borderRadius: 4, padding: '1px 5px', color: 'var(--green-deep)', fontFamily: 'var(--font-body)' }}>
                  Nature 2025 paper on programmable mammalian gene circuits
                </span>
                {' '}and your approach to modular design resonates with my work on...
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm">Send via Gmail</button>
                <button className="btn btn-sm">Edit draft</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section ref={ctaRef} style={{
        background: 'var(--green-deep)',
        padding: isMobile ? '72px 24px' : isTablet ? '88px 32px' : '104px 40px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, oklch(0.9 0.02 155 / 0.07) 1px, transparent 1px)',
          backgroundSize: '26px 26px', pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'absolute', top: -120, right: -80, width: 500, height: 500,
          background: 'radial-gradient(ellipse, oklch(0.45 0.07 155 / 0.22) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}/>
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <GradCapDecor style={{ position: 'absolute', width: isMobile ? 180 : 275, top: -28, left: -32, opacity: 0.13, transform: 'rotate(-14deg)', color: 'oklch(0.88 0.04 155)' }}/>
          <GradCapDecor style={{ position: 'absolute', width: isMobile ? 120 : 185, bottom: -14, right: -20, opacity: 0.13, transform: 'rotate(18deg)', color: 'oklch(0.88 0.04 155)' }}/>
        </div>

        <div style={{
          maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative',
          opacity: ctaVisible ? 1 : 0,
          transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <h2 style={{
            color: 'var(--paper)',
            fontSize: isMobile ? 32 : isTablet ? 42 : 50,
            letterSpacing: '-0.038em', lineHeight: 1.08, marginBottom: 20,
          }}>
            The right advisor is out there.{' '}
            <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', opacity: 0.78 }}>
              Let's find them.
            </span>
          </h2>
          <p style={{ color: 'oklch(0.72 0.025 155)', fontSize: isMobile ? 14.5 : 16, lineHeight: 1.6, marginBottom: 36 }}>
            Join researchers who built their PhD shortlist in days, not months.
          </p>
          <button className="btn btn-lg" style={{
            background: 'var(--paper)', color: 'var(--green-deep)',
            border: 0, fontSize: isMobile ? 14 : 15, fontWeight: 600,
            padding: isMobile ? '13px 24px' : '15px 30px', borderRadius: 11,
            boxShadow: '0 4px 24px oklch(0.12 0.02 155 / 0.35)',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px oklch(0.12 0.02 155 / 0.45)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px oklch(0.12 0.02 155 / 0.35)'; }}
          onClick={() => openAuthModal('signup')}>
            Get my first 5 matches — free <Icon.Chevron size={13}/>
          </button>
          <div style={{ marginTop: 16, color: 'oklch(0.62 0.02 155)', fontSize: 12.5 }}>
            No credit card · Cancel anytime · 5 free matches every week
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ padding: isMobile ? '28px 20px' : '32px 40px', borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'space-between',
          gap: isMobile ? 14 : 0,
          fontSize: 12.5, color: 'var(--ink-3)',
          textAlign: isMobile ? 'center' : undefined,
        }}>
          <div className="brand" style={{ fontSize: 14 }}><Icon.Logo /> Find My Professor</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 24px', justifyContent: 'center' }}>
            {[
              { label: 'Privacy', path: '/privacy' },
              { label: 'Terms',   path: '/terms' },
              { label: 'Pricing', path: '/pricing' },
            ].map(({ label, path }) => (
              <span key={label} onClick={() => navigate(path)}
                style={{ cursor: 'pointer', transition: 'color 0.12s' }}
                onMouseOver={e => { e.currentTarget.style.color = 'var(--ink)'; }}
                onMouseOut={e => { e.currentTarget.style.color = 'var(--ink-3)'; }}>
                {label}
              </span>
            ))}
          </div>
          <div>© 2026 Find My Professor</div>
        </div>
      </footer>
    </div>
  );
}
