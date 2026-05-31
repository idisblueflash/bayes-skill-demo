/* Shared SVG icons + tiny helpers — attached to window for Babel scripts. */
const { createElement: h } = React;

function Icon({ d, size = 16, stroke = 2, fill = "none", style, viewBox = "0 0 24 24" }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={fill === "none" ? "currentColor" : "none"}
         strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const IconClose = (p) => (
  <svg width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconArrow = (p) => (
  <svg width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="13 6 19 12 13 18" />
  </svg>
);
const IconImage = (p) => (
  <svg width={p.size||26} height={p.size||26} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={p.style}>
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.6" /><path d="M21 15l-5-5L5 21" />
  </svg>
);

// Ornamental flourish ❦ between rules
function Flourish({ label, color = "var(--gold)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, color }}>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,var(--line-gold),transparent)" }} />
      <span style={{ fontSize: 14 }}>{label || "❦"}</span>
      <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,var(--line-gold),transparent)" }} />
    </div>
  );
}

// Heraldic shield holding a numeral
function Shield({ children, accent = "var(--navy)", size = 52 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25, flex: "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size * 0.45,
      color: "var(--gold-glow)", background: `linear-gradient(150deg, ${accent}, var(--navy-deep))`,
      border: "1px solid var(--line-gold)", boxShadow: "var(--shadow-card)"
    }}>{children}</div>
  );
}

Object.assign(window, { Icon, IconClose, IconArrow, IconImage, Flourish, Shield });
