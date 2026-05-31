/* FeynmanTerminal — animated terminal demo for Feynman. Cycles through draft
   revisions of an 80-character article; each round shows Feynman's specific
   "slips" (錯字 / 重複 / 機制缺 / 名字層 / 自相矛盾), with the flag list
   morphing as drafts iterate. Includes the dramatic round-4 regression where
   the user voice-typed and introduced a fresh wave of slips. */
const { useState: useStateFT, useEffect: useEffectFT } = React;

const FEYNMAN_DRAFTS = [
  {
    tag: "草稿 #1", meta: "80 字 · 第一遍",
    quote: "想法流水账能让人学得更快更多更快。他可以释放你脑中的注意力，让你能学到更多知识…",
    flags: [
      ["名字層", "「流水帳」是貶義，你欠讀者一個定義"],
      ["機制缺", "為什麼「寫下來」就能釋放注意力？"],
    ],
  },
  {
    tag: "草稿 #2", meta: "重寫後 · 約 290 字",
    quote: "你的總結過程雖然不輕鬆，但「不輕鬆」才能輕鬆地激活你的腦細胞…",
    flags: [
      ["自相矛盾", "「不輕鬆才能輕鬆地激活」——聽起來機靈，意思繞拧"],
      ["對比弱",   "跑步類比沒對到 AI 那邊（單方陳述 vs 反差）"],
    ],
  },
  {
    tag: "終稿", meta: "三個機制全部閉環",
    quote: "抛球（更多）· AI 加速（更快）· 跑步（更深）",
    flags: [],
    final: true,
  },
];

const FINAL_CHECKS = [
  "✓ 抛球類比閉環（為什麼能學更多）",
  "✓ AI 加速明說（為什麼更快）",
  "✓ 跑步對比到位（為什麼自己總結才更深）",
];

function FeynmanRow({ visible, children }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-3px)",
      transition: "opacity .28s ease, transform .28s ease",
    }}>{children}</div>
  );
}

function FeynmanFlag({ type, note, visible }) {
  return (
    <FeynmanRow visible={visible}>
      <div style={{ display: "flex", gap: 10, marginBottom: 5, alignItems: "baseline",
        fontFamily: "var(--font-mono)", fontSize: 11.5 }}>
        <span style={{ color: "#c66b5e", width: 12, flex: "none" }}>✗</span>
        <span style={{ color: "#857255", width: 62, flex: "none",
          fontFamily: "var(--font-han)" }}>{type}</span>
        <span style={{ color: "#cbb892", flex: 1, minWidth: 0,
          fontFamily: "var(--font-han)" }}>{note}</span>
      </div>
    </FeynmanRow>
  );
}

function FeynmanCheck({ text, visible }) {
  return (
    <FeynmanRow visible={visible}>
      <div style={{ color: "#6f9a64", fontFamily: "var(--font-han)",
        fontSize: 11.5, marginBottom: 5 }}>{text}</div>
    </FeynmanRow>
  );
}

function FeynmanTerminal() {
  const [step, setStep] = useStateFT(0);
  const [reveal, setReveal] = useStateFT(1);
  const [blink, setBlink] = useStateFT(true);

  const draft = FEYNMAN_DRAFTS[step];
  const isFinal = !!draft.final;
  const items = isFinal ? FINAL_CHECKS : draft.flags;
  // sequential items: header (1) + quote (2) + each flag/check (3..)
  const totalReveal = 2 + items.length;
  const printing = reveal < totalReveal;

  // print-out: reveal items top-to-bottom, one every 360ms
  useEffectFT(() => {
    setReveal(1);
    let n = 1;
    const id = setInterval(() => {
      n += 1;
      setReveal(n);
      if (n >= totalReveal) clearInterval(id);
    }, 360);
    return () => clearInterval(id);
  }, [step]);

  // hold after fully printed, then advance
  useEffectFT(() => {
    if (printing) return;
    const holdMs = isFinal ? 3400 : 2000;
    const t = setTimeout(() => setStep((s) => (s + 1) % FEYNMAN_DRAFTS.length), holdMs);
    return () => clearTimeout(t);
  }, [reveal, step]);

  useEffectFT(() => {
    const t = setInterval(() => setBlink((b) => !b), 520);
    return () => clearInterval(t);
  }, []);

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
          color: "var(--on-navy-faint)" }}>feynman · feynman-80-words</span>
      </div>

      {/* body */}
      <div style={{ padding: "14px 16px 14px", fontFamily: "var(--font-mono)",
        fontSize: 12, color: "#cbb892", minHeight: 232 }}>
        {/* header — reveal #1 */}
        <FeynmanRow visible={reveal >= 1}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 10 }}>
            <span style={{ color: isFinal ? "#e4c578" : "#cbb892" }}>
              <span style={{ color: "#857255" }}>▸ </span>{draft.tag}
              <span style={{ color: "#857255" }}> · </span>{draft.meta}
            </span>
            <span style={{ fontSize: 10.5, color: "#857255", fontVariantNumeric: "tabular-nums" }}>
              [{String(step + 1).padStart(2, "0")}/{FEYNMAN_DRAFTS.length}]
            </span>
          </div>
        </FeynmanRow>

        {/* quote — reveal #2 */}
        <FeynmanRow visible={reveal >= 2}>
          <div style={{
            fontFamily: "var(--font-han)", fontSize: 11.5, lineHeight: 1.65,
            color: isFinal ? "#cbb892" : "#9a8765",
            paddingLeft: 9, borderLeft: "2px solid " + (isFinal ? "#e4c578" : "rgba(228,197,120,0.18)"),
            marginBottom: 14, minHeight: 42, transition: "border-color .5s, color .5s",
          }}>
            {isFinal ? draft.quote : "「" + draft.quote + "」"}
          </div>
        </FeynmanRow>

        {/* flags or final checks — reveal #3..N, one per tick */}
        <div style={{ minHeight: 72 }}>
          {isFinal
            ? FINAL_CHECKS.map((t, i) => (
                <FeynmanCheck key={i} text={t} visible={reveal >= 3 + i} />
              ))
            : draft.flags.map(([type, note], i) => (
                <FeynmanFlag key={i} type={type} note={note} visible={reveal >= 3 + i} />
              ))}
        </div>

        {/* status — always visible, swaps copy based on printing/done */}
        <div style={{ marginTop: 12, color: isFinal && !printing ? "#e4c578" : "#857255" }}>
          {isFinal ? (
            printing
              ? <span>$ feynman closing<span style={{ opacity: blink ? 1 : 0 }}> ▌</span></span>
              : <span>✦ 卡點 0 · 文章可發布<span style={{ opacity: blink ? 1 : 0 }}> ▌</span></span>
          ) : (
            <span>
              ⊘ 卡點 <span style={{ color: "#c66b5e" }}>{draft.flags.length}</span>
              <span> · $ feynman {printing ? "scanning" : "-read"}</span>
              <span style={{ opacity: blink ? 1 : 0 }}> ▌</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FeynmanTerminal });
