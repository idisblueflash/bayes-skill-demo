/* McenerneyTerminal — animated terminal demo for McEnerney opening review.
   Three stages: 開篇診斷 → 重寫後重新檢查 → 達標. The signature visual move
   is the unstable-signal count climbing (1 → 7) with inline highlights of
   the actual 不穩定詞 (明明、卻、不焦慮才奇怪呢…) in the quoted draft. */
const { useState: useStateMC, useEffect: useEffectMC } = React;

// Highlight syntax: wrap unstable words in <…> inside the quote string.
function parseQuote(text) {
  return text.split(/<([^>]+)>/).map((t, i) => ({ text: t, mark: i % 2 === 1 }));
}

const MCEN_STAGES = [
  {
    tag: "開篇診斷", meta: "第 1 稿",
    quote: "確實有些 frustrated。",
    items: [
      { icon: "⚠", label: "不穩定信號", note: "只 1 個（McEnerney 目標 5–10）" },
      { icon: "⚠", label: "代價／收益", note: "代價立得穩，收益空著" },
      { icon: "✓", label: "Error 框架", note: "不是 gap，是 error，更有力" },
      { icon: "✓", label: "社群存在詞", note: "「別人」暗示了一群同行人" },
    ],
    status: "diagnosing opening",
  },
  {
    tag: "重寫後重新檢查", meta: "第 2 稿",
    quote: "你<明明>是社區的老人。看到新人一個晚上就做出來的成果，你心裡<不焦慮才奇怪呢>。",
    items: [
      { icon: "✓", label: "不穩定信號", note: "7 個達標 · 竟然 · 卻×3 · 明明 · 奇怪 · 不焦慮才奇怪" },
      { icon: "✓", label: "句尾留勁",   note: "雙重否定甩鞭子，比「很焦慮」重三倍" },
      { icon: "⚠", label: "鏡頭一致",   note: "思維導圖 ≠ 「丰富多彩的圖片」" },
    ],
    status: "re-checking draft",
  },
  {
    tag: "達標 · 可接主段", meta: "想法流水帳",
    items: [
      { icon: "✓", label: null, note: "不穩定信號密度達標" },
      { icon: "✓", label: null, note: "鏡頭對焦清晰（show don't tell）" },
      { icon: "✓", label: null, note: "對位主題「想法流水帳」" },
    ],
    status: "✦ 開篇就緒",
    final: true,
  },
];

const PRINTING_VERBS = ["diagnosing opening", "re-checking draft", "signing off"];

function McenRow({ visible, children }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-3px)",
      transition: "opacity .28s ease, transform .28s ease",
    }}>{children}</div>
  );
}

function McenIcon({ icon }) {
  const color = icon === "✓" ? "#6f9a64"
              : icon === "✗" ? "#c66b5e"
              : "#e4c578";
  return <span style={{ color, width: 14, flex: "none" }}>{icon}</span>;
}

function McenItem({ item, visible }) {
  return (
    <McenRow visible={visible}>
      <div style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "baseline",
        fontSize: 11.5 }}>
        <McenIcon icon={item.icon} />
        {item.label && (
          <span style={{ color: "#857255", width: 76, flex: "none",
            fontFamily: "var(--font-han)" }}>{item.label}</span>
        )}
        <span style={{ color: "#cbb892", flex: 1, minWidth: 0,
          fontFamily: "var(--font-han)" }}>{item.note}</span>
      </div>
    </McenRow>
  );
}

function McenQuote({ text, visible }) {
  const parts = parseQuote(text);
  return (
    <McenRow visible={visible}>
      <div style={{
        fontFamily: "var(--font-han)", fontSize: 11.5, lineHeight: 1.65,
        color: "#9a8765",
        paddingLeft: 9, borderLeft: "2px solid rgba(228,197,120,0.18)",
        marginBottom: 14,
      }}>
        「{parts.map((p, i) => p.mark
          ? <span key={i} style={{ color: "#e4c578", fontWeight: 700,
              padding: "0 2px", background: "rgba(228,197,120,0.10)" }}>{p.text}</span>
          : <span key={i}>{p.text}</span>
        )}」
      </div>
    </McenRow>
  );
}

function McenerneyTerminal() {
  const [step, setStep] = useStateMC(0);
  const [reveal, setReveal] = useStateMC(1);
  const [blink, setBlink] = useStateMC(true);

  const stage = MCEN_STAGES[step];
  const isFinal = !!stage.final;
  const hasQuote = !!stage.quote;
  // reveal sequence: header (1) → quote (2, if present) → items (3..)
  const itemStart = hasQuote ? 3 : 2;
  const totalReveal = (hasQuote ? 2 : 1) + stage.items.length;
  const printing = reveal < totalReveal;

  // print-out: reveal items top-to-bottom, one every 360ms
  useEffectMC(() => {
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
  useEffectMC(() => {
    if (printing) return;
    const holdMs = isFinal ? 3400 : 2000;
    const t = setTimeout(() => setStep((s) => (s + 1) % MCEN_STAGES.length), holdMs);
    return () => clearTimeout(t);
  }, [reveal, step]);

  useEffectMC(() => {
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
          color: "var(--on-navy-faint)" }}>mcenerney · opening-review</span>
      </div>

      {/* body */}
      <div style={{ padding: "14px 16px 14px", fontFamily: "var(--font-mono)",
        fontSize: 12, color: "#cbb892", minHeight: 248 }}>
        {/* header — reveal #1 */}
        <McenRow visible={reveal >= 1}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 10 }}>
            <span style={{ color: isFinal ? "#e4c578" : "#cbb892" }}>
              <span style={{ color: "#857255" }}>▸ </span>{stage.tag}
              {stage.meta && (
                <React.Fragment>
                  <span style={{ color: "#857255" }}> · </span>{stage.meta}
                </React.Fragment>
              )}
            </span>
            <span style={{ fontSize: 10.5, color: "#857255", fontVariantNumeric: "tabular-nums" }}>
              [{String(step + 1).padStart(2, "0")}/{MCEN_STAGES.length}]
            </span>
          </div>
        </McenRow>

        {/* quote — reveal #2 (if present) */}
        {hasQuote && <McenQuote text={stage.quote} visible={reveal >= 2} />}

        {/* items — reveal #itemStart..N */}
        <div style={{ minHeight: hasQuote ? 86 : 132 }}>
          {stage.items.map((it, i) => (
            <McenItem key={i} item={it} visible={reveal >= itemStart + i} />
          ))}
        </div>

        {/* status — always visible */}
        <div style={{ marginTop: 12, color: isFinal && !printing ? "#e4c578" : "#857255" }}>
          <span>
            {printing
              ? "$ mcenerney " + PRINTING_VERBS[step]
              : "$ " + stage.status}
            <span style={{ opacity: blink ? 1 : 0 }}> ▌</span>
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { McenerneyTerminal });
