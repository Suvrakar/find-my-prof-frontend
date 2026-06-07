// Main app — top-level routing and Tweaks
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "headlineFont": "sans",
  "density": "comfortable",
  "palette": "oxford",
  "tier": "free"
}/*EDITMODE-END*/;

function App() {
  const [route, setRoute] = useState("landing"); // landing | onboarding | app | pricing | admin
  const [appRoute, setAppRoute] = useState("matches");
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks
  useEffect(() => {
    const root = document.documentElement;
    const headlineFont = tweaks.headlineFont === "serif"
      ? '"Instrument Serif", "Cormorant Garamond", Georgia, serif'
      : '"Instrument Sans", "Söhne", ui-sans-serif, system-ui, sans-serif';
    root.style.setProperty("--font-display", headlineFont);

    document.body.classList.toggle("density-compact", tweaks.density === "compact");

    if (tweaks.palette === "ink") {
      root.style.setProperty("--green-deep", "oklch(0.18 0.005 100)");
      root.style.setProperty("--green",      "oklch(0.32 0.01 100)");
      root.style.setProperty("--green-soft", "oklch(0.92 0.005 100)");
      root.style.setProperty("--green-hi",   "oklch(0.50 0.01 100)");
    } else if (tweaks.palette === "claret") {
      root.style.setProperty("--green-deep", "oklch(0.30 0.08 25)");
      root.style.setProperty("--green",      "oklch(0.42 0.10 25)");
      root.style.setProperty("--green-soft", "oklch(0.92 0.035 25)");
      root.style.setProperty("--green-hi",   "oklch(0.55 0.12 25)");
    } else {
      // oxford (default)
      root.style.setProperty("--green-deep", "oklch(0.22 0.045 155)");
      root.style.setProperty("--green",      "oklch(0.32 0.055 155)");
      root.style.setProperty("--green-soft", "oklch(0.92 0.025 155)");
      root.style.setProperty("--green-hi",   "oklch(0.55 0.08 155)");
    }
  }, [tweaks]);

  const onNav = (where) => {
    if (where === "pricing") setRoute("pricing");
    else if (where === "admin") setRoute("admin");
    else if (where === "landing") setRoute("landing");
    else if (where === "how") {
      setRoute("landing");
      setTimeout(() => window.scrollTo({ top: 700, behavior: "smooth" }), 50);
    }
    else setAppRoute(where);
  };

  return (
    <>
      {route === "landing" && (
        <Landing
          onCta={() => setRoute("onboarding")}
          onSignIn={() => setRoute("app")}
          onNav={onNav}
        />
      )}
      {route === "onboarding" && (
        <Onboarding onComplete={() => setRoute("app")}/>
      )}
      {route === "app" && (
        <AppShell
          initial={appRoute}
          tier={tweaks.tier}
          setTier={(v) => setTweak("tier", v)}
          onNav={(w) => {
            if (w === "landing") setRoute("landing");
            else if (w === "pricing") setRoute("pricing");
            else if (w === "admin") setRoute("admin");
            else setAppRoute(w);
          }}
        />
      )}
      {route === "pricing" && <Pricing onBack={() => setRoute("landing")} onCta={() => setRoute("onboarding")}/>}
      {route === "admin" && <Admin onBack={() => setRoute("landing")}/>}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Typography"/>
        <TweakRadio label="Headlines"
          value={tweaks.headlineFont}
          options={[
            { value: "sans", label: "Sans" },
            { value: "serif", label: "Serif" },
          ]}
          onChange={v => setTweak("headlineFont", v)}/>
        <TweakSection label="Density"/>
        <TweakRadio label="Spacing"
          value={tweaks.density}
          options={[
            { value: "comfortable", label: "Comfy" },
            { value: "compact", label: "Compact" },
          ]}
          onChange={v => setTweak("density", v)}/>
        <TweakSection label="Palette"/>
        <TweakRadio label="Accent"
          value={tweaks.palette}
          options={[
            { value: "oxford", label: "Oxford" },
            { value: "ink", label: "Ink" },
            { value: "claret", label: "Claret" },
          ]}
          onChange={v => setTweak("palette", v)}/>
        <TweakSection label="Plan tier"/>
        <TweakRadio label="Tier"
          value={tweaks.tier}
          options={[
            { value: "free", label: "Free" },
            { value: "pro", label: "Pro" },
          ]}
          onChange={v => setTweak("tier", v)}/>
        <TweakSection label="Jump to"/>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {[
            ["Landing", () => setRoute("landing")],
            ["Onboarding", () => setRoute("onboarding")],
            ["Matches", () => { setRoute("app"); setAppRoute("matches"); }],
            ["Countries", () => { setRoute("app"); setAppRoute("countries"); }],
            ["Reviews", () => { setRoute("app"); setAppRoute("reviews"); }],
            ["CV Maker", () => { setRoute("app"); setAppRoute("cv"); }],
            ["SOP Gen", () => { setRoute("app"); setAppRoute("sop"); }],
            ["Hiring (PRO)", () => { setRoute("app"); setAppRoute("hiring"); }],
            ["What's new (PRO)", () => { setRoute("app"); setAppRoute("whatsnew"); }],
            ["Outreach", () => { setRoute("app"); setAppRoute("outreach"); }],
            ["Pricing", () => setRoute("pricing")],
            ["Admin", () => setRoute("admin")],
          ].map(([l, fn]) => (
            <button key={l} onClick={fn} style={{
              padding: "6px 8px", fontSize: 11, border: "1px solid rgba(0,0,0,.1)",
              background: "rgba(255,255,255,.6)", borderRadius: 6, cursor: "pointer",
              color: "#29261b",
            }}>{l}</button>
          ))}
        </div>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
