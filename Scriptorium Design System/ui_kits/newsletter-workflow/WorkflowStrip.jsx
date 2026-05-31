/* WorkflowStrip — bottom parchment strip: the active realm's flow, or the crew grid. */

function FlowStep({ label, last }) {
  return (
    <React.Fragment>
      <div style={{
        fontFamily: "var(--font-han)", fontSize: 12.5, lineHeight: 1.4, color: "var(--ink)",
        background: "var(--cream)", border: "1px solid var(--line-gold)", borderRadius: "var(--r-sm)",
        padding: "9px 13px", textAlign: "center", maxWidth: 160, boxShadow: "var(--shadow-card)",
      }}>{label}</div>
      {!last && <span style={{ color: "var(--gold)", flex: "none" }}><IconArrow size={18} /></span>}
    </React.Fragment>
  );
}

function CrewCard({ member, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      textAlign: "left", cursor: "pointer", flex: 1, minWidth: 130,
      background: "var(--cream)", border: `1px solid ${active ? "var(--line-gold)" : "var(--line)"}`,
      borderRadius: "var(--r-md)", padding: "11px 13px",
      boxShadow: active ? "var(--shadow-card), var(--glow-gold)" : "var(--shadow-card)",
      opacity: active ? 1 : 0.86, transition: "all .25s",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = active ? 1 : 0.86; e.currentTarget.style.transform = "none"; }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 600, color: "var(--realm-5)" }}>{member.name}</div>
      <div style={{ fontFamily: "var(--font-han)", fontSize: 12.5, fontWeight: 600, color: "var(--ink-strong)", margin: "4px 0 3px" }}>{member.role}</div>
      <div style={{ fontFamily: "var(--font-han)", fontSize: 11.5, lineHeight: 1.5, color: "var(--ink-faint)" }}>{member.job}</div>
    </button>
  );
}

function WorkflowStrip({ realm, crew, onCrewDemo }) {
  return (
    <div style={{
      position: "relative", background: "var(--vellum)", border: "1px solid var(--line-gold)",
      borderRadius: "var(--r-xl)", boxShadow: "var(--shadow-raise), var(--shadow-inset)",
      padding: "16px 22px 18px",
    }}>
      <span style={{ position: "absolute", inset: 6, border: "1px solid var(--line)", borderRadius: 16, pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Shield accent={realm.accent} size={34}>{realm.num}</Shield>
        <div style={{ fontFamily: "var(--font-han)", fontSize: 15, fontWeight: 600, color: "var(--ink-strong)" }}>{realm.title}</div>
        <span style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: 12.5, color: "var(--ink-faint)" }}>{realm.en}</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: "var(--font-han)", fontSize: 11.5, color: "var(--ink-dim)" }}>
          <span style={{ color: "var(--ink-faint)" }}>輸入</span> {realm.io.in}
          <span style={{ color: "var(--gold)", margin: "0 7px" }}>→</span>
          <span style={{ color: "var(--ink-faint)" }}>產出</span> <b style={{ color: "var(--ink-strong)" }}>{realm.io.out}</b>
        </span>
      </div>

      {realm.crew ? (
        <div style={{ display: "flex", gap: 10 }}>
          {crew.map((m) => <CrewCard key={m.id} member={m} active onClick={() => onCrewDemo(m)} />)}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {realm.flow.map((s, i) => <FlowStep key={i} label={s} last={i === realm.flow.length - 1} />)}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WorkflowStrip });
