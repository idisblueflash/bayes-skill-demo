/* BayesTerminal — animated terminal demo for Thomas. Cycles through evidence
   rounds, smoothly animating posterior probability bars so the viewer sees
   H₁ collapse, H₂ rise, and H₆ emerge from nothing to tie for first. */
const { useState: useStateBT, useEffect: useEffectBT } = React;

const BAYES_ROUNDS = [
  { tag: "先驗",      src: "競爭假說設計",            H1: 20.0, H2: 25.0, H3: 25.0, H4: 20.0, H5: 10.0, H6: null },
  { tag: "證據 1",    src: "平台演算法行為",          H1: 27.1, H2: 27.1, H3: 13.5, H4: 14.4, H5:  9.0, H6: null },
  { tag: "證據 2",    src: "創作者留存研究",          H1: 13.3, H2: 26.6, H3: 15.1, H4: 15.1, H5:  6.9, H6: null },
  { tag: "證據 3",    src: "Build in Public 訪談",    H1:  6.4, H2: 27.9, H3: 20.2, H4: 24.5, H5:  8.6, H6: null },
  { tag: "證據 4",    src: "認知科學 · 認知固化",      H1:  4.4, H2: 38.1, H3: 31.0, H4: 14.6, H5:  7.3, H6: null },
  { tag: "證據 5",    src: "社群臨界點效應",           H1:  2.3, H2: 42.8, H3: 21.4, H4: 22.7, H5:  9.5, H6: null },
  { tag: "證據 6",    src: "長期日記 vs 引流文",       H1:  0.8, H2: 61.7, H3: 16.3, H4: 30.8, H5:  9.7, H6: null },
  { tag: "證據 7",    src: "遺漏優勢掃描",             H1:  0.2, H2: 58.3, H3: 23.8, H4: 15.9, H5:  6.7, H6: null },
  { tag: "證據 8",    src: "社群質量反向驗證",          H1:  0.2, H2: 62.7, H3: 29.9, H4:  7.1, H5:  4.8, H6: null },
  { tag: "新證據 ✦", src: "swyx · Learn in Public",  H1:  0.0, H2: 37.1, H3: 20.7, H4:  3.5, H5:  1.9, H6: 36.8 },
];

const HYP = [
  { key: "H1", label: "H₁ 曝光排名" },
  { key: "H2", label: "H₂ 認知複利" },
  { key: "H3", label: "H₃ 個人認知" },
  { key: "H4", label: "H₄ 社群關係" },
  { key: "H5", label: "H₅ 產品驗證" },
  { key: "H6", label: "H₆ 知識外化" },
];

function BayesBar({ label, value, prev, winner, dead, mover }) {
  // bars max around 62%; scale 1.5x so the leader nearly fills the track
  const width = value == null ? 0 : Math.min(100, value * 1.5);
  let fill = "#9a8765";
  if (winner) fill = "linear-gradient(90deg, #e4c578, #f0d68a)";
  else if (dead) fill = "#5a3838";

  // delta vs previous round
  const delta = (value == null || prev == null) ? null : value - prev;
  let arrow = " ", arrowColor = "transparent";
  if (delta != null && Math.abs(delta) >= 0.5) {
    arrow = delta > 0 ? "↑" : "↓";
    arrowColor = delta > 0 ? "#e4c578" : "#8a5757";
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
      padding: "1px 6px", marginLeft: -6, marginRight: -6, borderRadius: 4,
      background: mover ? "rgba(228,197,120,0.08)" : "transparent",
      transition: "background .5s" }}>
      <span style={{ width: 96, color: dead ? "#7a5050" : "#cbb892",
        opacity: value == null ? 0.45 : 1, transition: "opacity .5s" }}>{label}</span>
      <div style={{ flex: 1, height: 13, background: "rgba(228,197,120,0.07)",
        border: "1px solid rgba(228,197,120,0.18)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: width + "%", background: fill,
          transition: "width .9s cubic-bezier(.4,0,.2,1), background .4s",
          boxShadow: winner ? "0 0 12px rgba(228,197,120,0.55)"
                   : mover  ? "0 0 8px rgba(228,197,120,0.35)"
                            : "none" }} />
      </div>
      <span style={{ width: 12, textAlign: "center", color: arrowColor,
        transition: "color .4s", fontSize: 11 }}>{arrow}</span>
      <span style={{ width: 52, textAlign: "right", fontVariantNumeric: "tabular-nums",
        color: dead ? "#7a5050" : (winner ? "#f0d68a" : "#cbb892"),
        opacity: value == null ? 0.45 : 1, transition: "opacity .5s, color .4s" }}>
        {value == null ? "—" : value.toFixed(1) + "%"}
      </span>
    </div>
  );
}

function BayesTerminal() {
  const [step, setStep] = useStateBT(0);
  const [blink, setBlink] = useStateBT(true);

  useEffectBT(() => {
    const isLast = step === BAYES_ROUNDS.length - 1;
    const delay = step === 0 ? 1200 : isLast ? 3600 : 1400;
    const t = setTimeout(() => setStep((s) => (s + 1) % BAYES_ROUNDS.length), delay);
    return () => clearTimeout(t);
  }, [step]);

  useEffectBT(() => {
    const t = setInterval(() => setBlink((b) => !b), 520);
    return () => clearInterval(t);
  }, []);

  const round = BAYES_ROUNDS[step];
  const prev  = step === 0 ? null : BAYES_ROUNDS[step - 1];
  const isFinal = step === BAYES_ROUNDS.length - 1;

  // biggest mover this round (by absolute Δ), excluding null→value transitions
  let moverKey = null, moverMag = 0;
  if (prev) {
    HYP.forEach((h) => {
      if (round[h.key] == null || prev[h.key] == null) return;
      const d = Math.abs(round[h.key] - prev[h.key]);
      if (d > moverMag) { moverMag = d; moverKey = h.key; }
    });
    // H₆ entering the race is itself a "mover"
    if (prev.H6 == null && round.H6 != null) moverKey = "H6";
  }

  return (
    <div style={{
      border: "1px solid var(--line-gold)", borderRadius: "var(--r-md)",
      overflow: "hidden", background: "#0f0d09",
      boxShadow: "0 6px 20px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(228,197,120,0.05)",
    }}>
      {/* chrome */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px",
        background: "linear-gradient(var(--navy), var(--navy-deep))",
        borderBottom: "1px solid var(--line-gold)" }}>
        <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#c66b5e" }} />
        <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#cba24a" }} />
        <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#6f9a64" }} />
        <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 11.5,
          color: "var(--on-navy-faint)" }}>thomas · bayesian-hypothesis-live</span>
      </div>

      {/* body */}
      <div style={{ padding: "14px 16px 14px", fontFamily: "var(--font-mono)",
        fontSize: 12, color: "#cbb892", minHeight: 248 }}>
        {/* round header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
          marginBottom: 12 }}>
          <span style={{ color: "#e4c578" }}>
            <span style={{ color: "#857255" }}>▸ </span>{round.tag}
            <span style={{ color: "#857255" }}> · </span>{round.src}
          </span>
          <span style={{ fontSize: 10.5, color: "#857255", fontVariantNumeric: "tabular-nums" }}>
            [{String(step + 1).padStart(2, "0")}/{BAYES_ROUNDS.length}]
          </span>
        </div>

        {/* bars */}
        {HYP.map((h) => {
          const v = round[h.key];
          const p = prev ? prev[h.key] : null;
          const isWinner = isFinal && (h.key === "H2" || h.key === "H6");
          const isDead   = isFinal && h.key === "H1";
          return <BayesBar key={h.key} label={h.label} value={v} prev={p}
                   winner={isWinner} dead={isDead}
                   mover={!isFinal && h.key === moverKey} />;
        })}

        {/* conclusion / prompt */}
        <div style={{ marginTop: 10, minHeight: 18, color: "#e4c578" }}>
          {isFinal
            ? <span>✓ H₂ + H₆ 並列首位（73.9%）· H₁ 已排除<span style={{ opacity: blink ? 1 : 0 }}> ▌</span></span>
            : <span style={{ color: "#857255" }}>$ updating posterior<span style={{ opacity: blink ? 1 : 0 }}> ▌</span></span>}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BayesTerminal });
