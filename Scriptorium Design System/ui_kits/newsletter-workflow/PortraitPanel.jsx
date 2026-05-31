/* PortraitPanel — the framed character portrait with a speech bubble. */

function ChipRow({ realm }) {
  const chip = (k, v, cls) => (
    <span style={{
      fontFamily: "var(--font-han)", fontSize: 12, fontWeight: 600, padding: "4px 11px", borderRadius: 999,
      display: "inline-flex", alignItems: "center", gap: 6,
      color: cls === "agent" ? "var(--cream)" : "var(--gold-glow)",
      background: cls === "agent" ? "rgba(242,236,226,0.12)" : "rgba(228,197,120,0.14)",
      border: `1px solid ${cls === "agent" ? "rgba(242,236,226,0.3)" : "var(--line-gold)"}`,
    }}>
      <span style={{ fontFamily: "var(--font-caps)", letterSpacing: ".1em", textTransform: "uppercase", fontSize: 9.5, opacity: .85 }}>{k}</span>{v}
    </span>
  );
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
      {realm.agent && chip("Agent", realm.agent, "agent")}
      {chip("Skill", realm.skill, "skill")}
    </div>
  );
}

function PortraitFrame({ realm }) {
  return (
    <div style={{
      width: 168, flex: "none", alignSelf: "stretch", borderRadius: "var(--r-md)", overflow: "hidden",
      border: "1px solid var(--line-gold)", position: "relative",
      background: `linear-gradient(165deg, ${realm.accentHex}22, var(--paper-deep))`,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <img src={`assets/${realm.slug}-stand.png?v=${window.IMG_V}`} alt={realm.agent || realm.skill} style={{ width: "118%", display: "block", marginBottom: -6 }} />
      <span style={{ position: "absolute", inset: 5, border: "1px solid var(--line)", borderRadius: 8, pointerEvents: "none" }} />
    </div>
  );
}

function PortraitPanel({ realm, onViewDemo }) {
  return (
    <div style={{
      display: "flex", gap: 16, padding: 16, position: "relative",
      background: "var(--vellum)", border: "1px solid var(--line-gold)", borderRadius: "var(--r-xl)",
      boxShadow: "var(--shadow-raise), var(--shadow-inset)", width: 430,
    }}>
      <span style={{ position: "absolute", inset: 6, border: "1px solid var(--line)", borderRadius: 18, pointerEvents: "none" }} />
      <PortraitFrame realm={realm} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-caps)", letterSpacing: ".2em", textTransform: "uppercase",
          fontSize: 11, color: "var(--gold-deep)" }}>第 {realm.num} 章 · {realm.en}</div>
        <div style={{ fontFamily: "var(--font-han)", fontSize: 24, fontWeight: 700, color: "var(--ink-strong)", margin: "3px 0 10px" }}>{realm.title}</div>
        <ChipRow realm={realm} />
        {/* speech bubble */}
        <div style={{ position: "relative", background: "var(--cream)", border: "1px solid var(--line-gold)",
          borderRadius: "var(--r-md)", padding: "12px 14px", marginTop: 2 }}>
          <span style={{ position: "absolute", left: -8, top: 20, width: 13, height: 13, background: "var(--cream)",
            borderLeft: "1px solid var(--line-gold)", borderBottom: "1px solid var(--line-gold)", transform: "rotate(45deg)" }} />
          <div style={{ fontFamily: "var(--font-han)", fontSize: 13.5, lineHeight: 1.66, color: "var(--ink)" }}>{realm.say}</div>
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={onViewDemo} style={{
          marginTop: 12, alignSelf: "flex-start", cursor: "pointer",
          fontFamily: "var(--font-han)", fontSize: 13.5, fontWeight: 600, color: "var(--gold-glow)",
          display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 999,
          background: "linear-gradient(150deg, var(--navy), var(--navy-deep))", border: "1px solid var(--line-gold)",
          boxShadow: "var(--shadow-card)", transition: "transform .15s, box-shadow .15s",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow-raise), var(--glow-gold)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
          查看 Demo
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { PortraitPanel });
