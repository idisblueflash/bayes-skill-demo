/* MainWindow — the pop-up summoned by clicking the avatar. Two columns:
   LEFT  = the standing character against a heraldic panel + name banner.
   RIGHT = "what he did" — chips, description, the IO flow pipeline, and a
           browser-chrome demo screenshot. For the crew realm (r5) the right
           column is the five-member grid; clicking a member opens DemoModal. */
const { useState: useStateMW, useEffect: useEffectMW } = React; // popup main window

/* connected IO pipeline of flow steps */
function FlowPipeline({ steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{
            fontFamily: "var(--font-han)", fontSize: 12.5, lineHeight: 1.4, color: "var(--ink)",
            background: "var(--cream)", border: "1px solid var(--line-gold)", borderRadius: "var(--r-sm)",
            padding: "8px 12px", textAlign: "center", boxShadow: "var(--shadow-card)",
          }}>{s}</div>
          {i < steps.length - 1 && <span style={{ color: "var(--gold)", flex: "none" }}><IconArrow size={16} /></span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* browser-window-chrome demo screenshot (image if present, else labelled placeholder) */
function DemoShot({ src, shot }) {
  const [ok, setOk] = useStateMW(false);
  useEffectMW(() => {
    setOk(false);
    const img = new Image();
    img.onload = () => setOk(true);
    img.src = shot;
  }, [shot]);
  return (
    <div style={{ border: "1px solid var(--line-gold)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--paper)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px",
        background: "linear-gradient(var(--navy), var(--navy-deep))", borderBottom: "1px solid var(--line-gold)" }}>
        <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#c66b5e" }} />
        <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#cba24a" }} />
        <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#6f9a64" }} />
        <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--on-navy-faint)" }}>{src}</span>
      </div>
      <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: ok ? 0 : 30 }}>
        {ok ? <img src={shot} alt="" style={{ width: "100%", display: "block" }} /> : (
          <div style={{ textAlign: "center", color: "var(--ink-faint)" }}>
            <div style={{ width: 56, height: 56, margin: "0 auto 14px", borderRadius: 14,
              border: "2px dashed var(--line-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
              <IconImage />
            </div>
            <div style={{ fontFamily: "var(--font-han)", fontSize: 13.5, fontWeight: 600, color: "var(--ink-dim)" }}>Demo 截圖待補</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--gold-deep)",
              background: "rgba(163,135,95,0.12)", padding: "5px 11px", borderRadius: 7, display: "inline-block", marginTop: 10 }}>{shot}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CrewMini({ member, onOpen }) {
  return (
    <button onClick={() => onOpen(member)} style={{
      textAlign: "center", cursor: "pointer", background: "transparent", border: "none",
      padding: "4px 4px 12px", transition: "transform .2s",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.filter = "drop-shadow(0 14px 12px rgba(0,0,0,.45)) drop-shadow(0 0 18px var(--gold-glow))";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        const img = e.currentTarget.querySelector("img");
        if (img) img.style.filter = "drop-shadow(0 10px 8px rgba(0,0,0,.35))";
      }}>
      <img src={`assets/${member.slug}-sit.png?v=${window.IMG_V}`} alt={member.name} draggable="false" style={{
        height: 240, width: "auto", display: "block", userSelect: "none",
        filter: "drop-shadow(0 10px 8px rgba(0,0,0,.35))", transition: "filter .25s",
      }} />
      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--realm-5)", lineHeight: 1, marginTop: 8 }}>{member.name}</div>
      <div style={{ fontFamily: "var(--font-han)", fontSize: 12.5, fontWeight: 600, color: "var(--ink-strong)", marginTop: 4 }}>{member.role}</div>
    </button>
  );
}

function Chip({ k, v, kind }) {
  const agent = kind === "agent";
  return (
    <span style={{
      fontFamily: "var(--font-han)", fontSize: 12, fontWeight: 600, padding: "5px 12px", borderRadius: 999,
      display: "inline-flex", alignItems: "center", gap: 6,
      color: agent ? "var(--cream)" : "var(--gold-deep)",
      background: agent ? "linear-gradient(150deg, var(--navy), var(--navy-deep))" : "rgba(228,197,120,0.16)",
      border: `1px solid ${agent ? "var(--line-gold)" : "var(--line-gold)"}`,
    }}>
      <span style={{ fontFamily: "var(--font-caps)", letterSpacing: ".1em", textTransform: "uppercase", fontSize: 9.5,
        opacity: .85, color: agent ? "var(--gold-glow)" : "var(--gold-deep)" }}>{k}</span>{v}
    </span>
  );
}

const THANKS_CREDITS = [
  { name: "Min",     initial: "M",  role: "「用 AI 發電」社區 + 管理員", note: "組織了這次寫作專題" },
  { name: "張讀行",  initial: "讀", role: null,                          note: "建議用可視化展示寫作效果" },
  { name: "文宣",    initial: "宣", role: null,                          note: "流程圖啟發了我的遊戲化展示" },
  { name: "Betty",   initial: "B",  role: null,                          note: "FB 插圖設計啟發了我簡潔的細節展示" },
  { name: "Keke",    initial: "K",  role: null,                          note: "啟發了開發 Corpus 工具" },
];

function ThanksCircle({ initial }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: "50%", flex: "none",
      background: "linear-gradient(140deg, #c89a6a, #8a5e3a)",
      border: "1px solid var(--line-gold)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700,
      color: "var(--cream)",
      boxShadow: "0 4px 10px -4px rgba(0,0,0,0.5)",
    }}>{initial}</div>
  );
}

function ThanksList() {
  return (
    <div style={{ padding: "2px 0" }}>
      <div style={{ fontFamily: "var(--font-caps)", letterSpacing: ".16em",
        textTransform: "uppercase", fontSize: 11, color: "var(--gold-deep)",
        marginTop: 6, marginBottom: 6 }}>致謝 · Special Thanks</div>
      <div style={{ fontFamily: "var(--font-han)", fontSize: 13, color: "var(--ink-dim)",
        marginBottom: 18, lineHeight: 1.5 }}>
        這份電子報能走完一整個工作流，是因為這些人——
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {THANKS_CREDITS.map((c) => (
          <div key={c.name} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <ThanksCircle initial={c.initial} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-han)", fontSize: 15, fontWeight: 700,
                color: "var(--ink-strong)", lineHeight: 1.2 }}>{c.name}</div>
              {c.role && <div style={{ fontFamily: "var(--font-han)", fontSize: 12,
                color: "var(--gold-deep)", marginTop: 2 }}>{c.role}</div>}
              <div style={{ fontFamily: "var(--font-han)", fontSize: 13.5,
                color: "var(--ink)", marginTop: 3, lineHeight: 1.5 }}>{c.note}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MainWindow({ realm, crew, subSlug, subEditNum, onOpenSub, onSetSubEdit, onCloseSub, onClose }) {
  // Nested crew-member demo is driven by the routed `subSlug` (URL hash).
  const subMember = subSlug ? crew.find((m) => m.slug === subSlug) : null;
  const sub = subMember ? {
    ...subMember,
    accent: "var(--realm-5)", roman: "Ⅴ",
    title: subMember.name + " · " + subMember.role,
    skill: subMember.role,
    src: "sub-agent · " + subMember.name,
  } : null;

  useEffectMW(() => {
    if (!realm) return;
    const onKey = (e) => { if (e.key === "Escape") { if (sub) onCloseSub(); else onClose(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [realm, sub, onCloseSub, onClose]);

  if (!realm) return null;
  const charName = realm.agent || realm.skill;

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: "absolute", inset: 0, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "30px 30px", background: "rgba(20,17,12,0.62)", backdropFilter: "blur(5px)",
    }}>
      <div style={{
        width: "min(940px, 100%)", height: 660, display: "flex", overflow: "hidden",
        background: "var(--vellum)", border: "1px solid var(--line-gold)", borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-raise)", position: "relative", animation: "popIn .4s ease forwards",
      }}>
        {/* ===== LEFT — standing avatar ===== */}
        <div style={{
          width: 300, flex: "none", position: "relative", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "flex-end",
          background: `radial-gradient(120% 80% at 50% 18%, ${realm.accentHex}, var(--navy-deep))`,
          borderRight: "1px solid var(--line-gold)", overflow: "hidden",
        }}>
          <span style={{ position: "absolute", inset: 10, border: "1px solid var(--line-navy)", borderRadius: 14, pointerEvents: "none" }} />
          {/* engraved chapter numeral watermark */}
          <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 120, lineHeight: 1,
            color: "rgba(228,197,120,0.10)", pointerEvents: "none", userSelect: "none" }}>{realm.roman}</div>
          <div style={{ marginTop: 26, marginBottom: 0, zIndex: 1 }}>
            <AvatarFigure realm={realm} height={realm.slug === "thomas" ? 360 : 420} />
          </div>
          {/* name banner */}
          <div style={{ width: "100%", padding: "14px 18px 18px", textAlign: "center", zIndex: 1,
            background: "linear-gradient(0deg, var(--navy-deep), transparent)" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "var(--cream)", lineHeight: 1 }}>{charName}</div>
            <div style={{ fontFamily: "var(--font-caps)", letterSpacing: ".18em", textTransform: "uppercase",
              fontSize: 10.5, color: "var(--gold-glow)", marginTop: 6 }}>第 {realm.num} 章 · {realm.en}</div>
          </div>
        </div>

        {/* ===== RIGHT — what they did ===== */}
        <div style={{ flex: 1, minWidth: 0, padding: "24px 26px 28px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-caps)", letterSpacing: ".2em", textTransform: "uppercase",
                fontSize: 11, color: "var(--gold-deep)" }}>{realm.en}</div>
              <div style={{ fontFamily: "var(--font-han)", fontSize: 27, fontWeight: 700, color: "var(--ink-strong)", margin: "3px 0 0" }}>{realm.title}</div>
            </div>
            <button onClick={onClose} style={{ flex: "none", background: "rgba(58,48,36,0.06)", border: "1px solid var(--line)",
              color: "var(--ink-dim)", width: 36, height: 36, borderRadius: 10, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center" }}><IconClose /></button>
          </div>

          {realm.slug === "published" ? (
            <ThanksList />
          ) : (
            <React.Fragment>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "14px 0 14px" }}>
                {realm.agent && <Chip k="Agent" v={realm.agent} kind="agent" />}
                <Chip k="Skill" v={realm.skill} kind="skill" />
                <Chip k="In" v={realm.io.in} />
                <Chip k="Out" v={realm.io.out} />
              </div>

              {(() => {
                const prompt = realm.prompt || { cmd: "@draft.md", body: (realm.agent || realm.skill) + " 你看看" };
                return (
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink)",
                    background: "var(--cream)", border: "1px solid var(--line-gold)", borderRadius: "var(--r-sm)",
                    padding: "9px 13px", marginBottom: 14, boxShadow: "var(--shadow-card)",
                    display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.5,
                  }}>
                    <span style={{ color: "var(--gold-deep)", fontWeight: 700, flex: "none" }}>&gt;</span>
                    <span style={{ minWidth: 0, wordBreak: "break-word" }}>
                      {prompt.cmd && <><span style={{ color: "var(--gold-deep)" }}>{prompt.cmd}</span>{" "}</>}
                      {prompt.body}
                    </span>
                  </div>
                );
              })()}

              {realm.crew ? (
                <React.Fragment>
                  <div style={{ fontFamily: "var(--font-caps)", letterSpacing: ".16em", textTransform: "uppercase",
                    fontSize: 11, color: "var(--gold-deep)", marginBottom: 12 }}>校正小組 · The Crew</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {crew.map((m) => <CrewMini key={m.id} member={m} onOpen={(mm) => onOpenSub(mm.slug)} />)}
                  </div>
                </React.Fragment>
              ) : (
                realm.slug === "thomas"    ? <BayesTerminal />
                : realm.slug === "feynman"  ? <FeynmanTerminal />
                : realm.slug === "corpus"   ? <CorpusTerminal />
                : realm.slug === "mcenerney" ? <McenerneyTerminal />
                : <DemoShot src={realm.src} shot={realm.shot} />
              )}
            </React.Fragment>
          )}
        </div>
      </div>

      {/* nested crew-member demo */}
      <DemoModal data={sub} editNum={subEditNum} onSetEditNum={onSetSubEdit} onClose={onCloseSub} />
    </div>
  );
}

Object.assign(window, { MainWindow });
