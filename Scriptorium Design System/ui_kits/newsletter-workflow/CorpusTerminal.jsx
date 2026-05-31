/* CorpusTerminal — animated terminal demo for Corpus (語料搜尋). Three stages:
   parse the natural-language query, surface file matches grouped by facet,
   and synthesize cross-cutting themes. Mirrors FeynmanTerminal's print-out
   rhythm so the two skills feel like siblings. */
const { useState: useStateCT, useEffect: useEffectCT } = React;

const CORPUS_STAGES = [
  {
    tag: "查詢解析",
    items: [
      { kind: "label", text: "概念面向：學得慢 · 學不會 · 沒效率 · 停留表面" },
      { kind: "label", text: "搜尋範圍：234 篇社群貼文 · 12 個討論串" },
    ],
    status: "scan ready · 234 posts indexed",
  },
  {
    tag: "命中結果", meta: "按面向分群",
    items: [
      { kind: "hit", path: "ecfdfb/07-ai-_.md",          facet: "停留表面" },
      { kind: "hit", path: "asuka-vibe-coding.md",        facet: "焦慮 · 沒產出" },
      { kind: "hit", path: "ecfdfb/ai-3-408c6b.md",       facet: "代碼屎山" },
      { kind: "hit", path: "chatgpt-1000-days.md",        facet: "碎片化" },
      { kind: "hit", path: "vibe-coding/ai-bcbbce.md",   facet: "一上來就被勸退" },
    ],
    status: "5 hits · grouped by facet",
  },
  {
    tag: "跨貼文主題", meta: "萃取自 8 篇",
    items: [
      { kind: "theme", title: "「快 vs 淺」的張力",    detail: "表面快，堆出來卻撐不住（代碼屎山）" },
      { kind: "theme", title: "「輸入 vs 輸出」失衡",   detail: "只看不做 → 浮表面；只做不學 → 耗存量" },
      { kind: "theme", title: "時間 ≠ 產出",            detail: "幾百小時、幾百美金 → 「到底在干嘛」" },
    ],
    status: "✦ corpus 報告就緒",
    final: true,
  },
];

const PRINTING_VERBS = ["parsing query", "matching corpus", "synthesizing themes"];

function CorpusRow({ visible, children }) {
  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-3px)",
      transition: "opacity .28s ease, transform .28s ease",
    }}>{children}</div>
  );
}

function CorpusItem({ item, visible }) {
  if (item.kind === "label") {
    return (
      <CorpusRow visible={visible}>
        <div style={{ color: "#9a8765", fontFamily: "var(--font-han)",
          fontSize: 11.5, marginBottom: 6, paddingLeft: 8 }}>
          {item.text}
        </div>
      </CorpusRow>
    );
  }
  if (item.kind === "hit") {
    return (
      <CorpusRow visible={visible}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12,
          marginBottom: 5, fontSize: 11.5 }}>
          <span style={{ color: "#857255", flex: "none" }}>·</span>
          <span style={{ color: "#cbb892", fontFamily: "var(--font-mono)",
            flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" }}>{item.path}</span>
          <span style={{ color: "#e4c578", fontFamily: "var(--font-han)",
            flex: "none", fontSize: 11 }}>[{item.facet}]</span>
        </div>
      </CorpusRow>
    );
  }
  if (item.kind === "theme") {
    return (
      <CorpusRow visible={visible}>
        <div style={{ marginBottom: 9 }}>
          <div style={{ color: "#e4c578", fontFamily: "var(--font-han)", fontSize: 12 }}>
            ✦ {item.title}
          </div>
          <div style={{ color: "#9a8765", fontFamily: "var(--font-han)",
            paddingLeft: 14, marginTop: 2, fontSize: 11 }}>
            {item.detail}
          </div>
        </div>
      </CorpusRow>
    );
  }
  return null;
}

function CorpusTerminal() {
  const [step, setStep] = useStateCT(0);
  const [reveal, setReveal] = useStateCT(1);
  const [blink, setBlink] = useStateCT(true);

  const stage = CORPUS_STAGES[step];
  const isFinal = !!stage.final;
  const totalReveal = 1 + stage.items.length; // header + each item
  const printing = reveal < totalReveal;

  // print-out: reveal items top-to-bottom, one every 360ms
  useEffectCT(() => {
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
  useEffectCT(() => {
    if (printing) return;
    const holdMs = isFinal ? 3400 : 2000;
    const t = setTimeout(() => setStep((s) => (s + 1) % CORPUS_STAGES.length), holdMs);
    return () => clearTimeout(t);
  }, [reveal, step]);

  useEffectCT(() => {
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
          color: "var(--on-navy-faint)" }}>corpus-search · community</span>
      </div>

      {/* body */}
      <div style={{ padding: "14px 16px 14px", fontFamily: "var(--font-mono)",
        fontSize: 12, color: "#cbb892", minHeight: 232 }}>
        {/* header — reveal #1 */}
        <CorpusRow visible={reveal >= 1}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
            marginBottom: 12 }}>
            <span style={{ color: isFinal ? "#e4c578" : "#cbb892" }}>
              <span style={{ color: "#857255" }}>▸ </span>{stage.tag}
              {stage.meta && (
                <React.Fragment>
                  <span style={{ color: "#857255" }}> · </span>{stage.meta}
                </React.Fragment>
              )}
            </span>
            <span style={{ fontSize: 10.5, color: "#857255", fontVariantNumeric: "tabular-nums" }}>
              [{String(step + 1).padStart(2, "0")}/{CORPUS_STAGES.length}]
            </span>
          </div>
        </CorpusRow>

        {/* items — reveal #2..N, one per tick */}
        <div style={{ minHeight: 140 }}>
          {stage.items.map((it, i) => (
            <CorpusItem key={i} item={it} visible={reveal >= 2 + i} />
          ))}
        </div>

        {/* status — always visible, swaps copy on printing vs done */}
        <div style={{ marginTop: 10, color: isFinal && !printing ? "#e4c578" : "#857255" }}>
          <span>
            {printing
              ? "$ corpus " + PRINTING_VERBS[step]
              : "$ " + stage.status}
            <span style={{ opacity: blink ? 1 : 0 }}> ▌</span>
          </span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CorpusTerminal });
