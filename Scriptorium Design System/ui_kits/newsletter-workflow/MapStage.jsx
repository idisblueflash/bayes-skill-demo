/* MapStage — the world-map backdrop with heraldic pennants and the golden path. */
function MapStage({ realms }) {
  // build a polyline through realm centers, in journey order 1→2→3→5→4 (map path)
  const order = ["r1", "r2", "r3", "r5", "r4"];
  const pts = order.map((id) => {
    const r = realms.find((x) => x.id === id);
    return `${r.pos.x},${r.pos.y}`;
  }).join(" ");

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <img src={`assets/map.png?v=${window.IMG_V}`} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: "saturate(1.02) contrast(1.02)",
      }} />
      {/* warm vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(120% 90% at 50% 38%, transparent 55%, rgba(40,33,22,0.34) 100%)" }} />

      {/* golden path overlay */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <polyline points={pts} fill="none" stroke="rgba(128,99,57,0.35)" strokeWidth="0.5" strokeDasharray="1.4 1.4" strokeLinecap="round" />
        <polyline points={pts} fill="none" stroke="var(--gold-glow)" strokeWidth="0.6" strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 1.5px var(--gold-glow))" }} />
      </svg>

    </div>
  );
}

Object.assign(window, { MapStage });
