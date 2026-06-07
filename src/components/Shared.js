import React from 'react';
import { Icon } from './Icons';

export function ScoreRing({ value = 78, size = 56 }) {
  return (
    <div className="score-ring" style={{ '--pct': value, width: size, height: size }}>
      <span style={{ fontSize: size < 50 ? 11 : 14 }}>{value}</span>
    </div>
  );
}

export function Bar({ value, label, color }) {
  return (
    <div className="col gap-1" style={{ width: "100%" }}>
      {label && (
        <div className="row between" style={{ fontSize: 11, color: "var(--ink-3)" }}>
          <span>{label}</span>
          <span className="num" style={{ color: "var(--ink-2)" }}>{value}</span>
        </div>
      )}
      <div className="bar">
        <div className="bar-fill" style={{ width: `${value}%`, background: color || "var(--green)" }}/>
      </div>
    </div>
  );
}

export function Avatar({ initials, size = "md", tone }) {
  const cls = size === "lg" ? "avatar avatar-lg" : size === "xl" ? "avatar avatar-xl" : "avatar";
  const bg = tone === "ink" ? "var(--ink)" : undefined;
  const color = tone === "ink" ? "var(--paper)" : undefined;
  const smStyle = size === "sm" ? { width: 24, height: 24, fontSize: 10 } : {};
  return <div className={cls} style={{ background: bg, color, ...smStyle }}>{initials}</div>;
}

export function Stars({ n }) {
  const full = Math.floor(n);
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {Array.from({ length: 5 }, (_, i) =>
        i < full
          ? <Icon.StarF key={i} size={12} color="oklch(0.7 0.13 75)"/>
          : <Icon.Star key={i} size={12} color="var(--ink-4)"/>
      )}
    </span>
  );
}

export function ProBadge() {
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

export function SoonBadge() {
  return (
    <span style={{
      marginLeft: "auto",
      fontSize: 9,
      letterSpacing: "0.06em",
      background: "var(--ink-3)",
      color: "var(--paper)",
      padding: "2px 5px",
      borderRadius: 4,
      fontWeight: 600,
    }}>SOON</span>
  );
}

export function Toggle({ label, sub, checked, onChange }) {
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
