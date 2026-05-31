/* DemoModal — window-chrome overlay showing a step's demo. For crew members with an
   `audit` field, the terminal window itself acts as a single-edit card; navigation
   buttons below page between edits. Green = added, strikethrough = removed. */
const { useState: useStateModal, useEffect: useEffectModal } = React;

const DIM_NUMERALS = ["①", "②", "③", "④", "⑤", "⑥", "⑦"];

function DiffText({ parts }) {
  return (
    <div style={{
      fontFamily: "var(--font-han)", fontSize: 16, lineHeight: 2.0, color: "var(--ink)",
      padding: "14px 20px 20px",
    }}>
      {parts.map((p, i) => {
        if (p.kind === "add") return (
          <span key={i} style={{
            background: "rgba(106,154,100,0.32)", color: "#1f4a2a", fontWeight: 600,
            padding: "2px 3px", borderRadius: 3, boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
          }}>{p.text}</span>
        );
        if (p.kind === "del") return (
          <span key={i} style={{
            textDecoration: "line-through", textDecorationColor: "#b34a3a",
            textDecorationThickness: 2, color: "#9a6650", opacity: 0.85,
          }}>{p.text}</span>
        );
        return <span key={i}>{p.text}</span>;
      })}
    </div>
  );
}

function PagerBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      fontFamily: "var(--font-han)", fontSize: 14, fontWeight: 600,
      color: disabled ? "var(--ink-faint)" : "var(--cream)",
      background: disabled ? "rgba(58,48,36,0.06)" : "linear-gradient(150deg, var(--navy), var(--navy-deep))",
      border: `1px solid ${disabled ? "var(--line)" : "var(--line-gold)"}`,
      borderRadius: 999, padding: "8px 18px",
      cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.5 : 1,
      transition: "transform .15s, opacity .15s",
    }}>{children}</button>
  );
}

function DemoModal({ data, editNum, onSetEditNum, onClose }) {
  const [imgOk, setImgOk] = useStateModal(false);

  // Reset image-loaded flag on data change.
  useEffectModal(() => {
    setImgOk(false);
    if (!data || data.audit) return;
    const img = new Image();
    img.onload = () => setImgOk(true);
    img.src = data.shot;
  }, [data]);

  // Derive current audit index from the URL-supplied editNum (1-based), clamped.
  const isAudit = !!data && !!data.audit;
  const edits = isAudit ? data.audit.edits : [];
  const maxIdx = edits.length - 1;
  const auditIdx = isAudit ? Math.max(0, Math.min(maxIdx, (editNum || 1) - 1)) : 0;

  const goTo = (idx) => {
    if (!isAudit || idx < 0 || idx > maxIdx) return;
    onSetEditNum(idx + 1);
  };

  // Keyboard: Esc closes; arrow keys page through audit edits.
  useEffectModal(() => {
    if (!data) return;
    const onKey = (e) => {
      if (e.key === "Escape") return onClose();
      if (!isAudit) return;
      if (e.key === "ArrowLeft" && auditIdx > 0) goTo(auditIdx - 1);
      if (e.key === "ArrowRight" && auditIdx < maxIdx) goTo(auditIdx + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [data, auditIdx, maxIdx]);

  if (!data) return null;
  const edit = isAudit ? edits[auditIdx] : null;
  const dimName = isAudit && edit ? data.framework.dims[edit.dimIndex] : "";
  const dimNumeral = isAudit && edit ? (DIM_NUMERALS[edit.dimIndex] || "·") : "";

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center",
      padding: 28, background: "rgba(29,36,51,0.74)", backdropFilter: "blur(6px)",
    }}>
      <div style={{
        width: "min(900px, 100%)", height: "min(88vh, 620px)", overflow: "hidden",
        background: "var(--vellum)", border: "1px solid var(--line-gold)", borderRadius: "var(--r-xl)",
        boxShadow: "var(--shadow-raise)", position: "relative",
        display: "flex", flexDirection: "row",
      }}>
        <div style={{ flex: 1, minWidth: 0, padding: 22, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
            <Shield accent={data.accent || "var(--realm-5)"} size={46}>{data.roman || data.num || "✦"}</Shield>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-han)", fontSize: 19, fontWeight: 700, color: "var(--ink-strong)" }}>{data.title}</div>
              <div style={{ fontFamily: "var(--font-caps)", letterSpacing: ".14em", textTransform: "uppercase",
                fontSize: 10.5, color: "var(--gold-deep)", marginTop: 4 }}>{data.skill || data.role}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(58,48,36,0.06)", border: "1px solid var(--line)",
              color: "var(--ink-dim)", width: 34, height: 34, borderRadius: 10, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center" }}><IconClose /></button>
          </div>

          {/* The terminal window IS the card. */}
          <div style={{ border: "1px solid var(--line-gold)", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--paper)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 12px",
              background: "linear-gradient(var(--navy), var(--navy-deep))", borderBottom: "1px solid var(--line-gold)" }}>
              <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#c66b5e" }} />
              <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#cba24a" }} />
              <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#6f9a64" }} />
              <span style={{ marginLeft: 10, fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--on-navy-faint)" }}>
                {isAudit ? `${edit.file}  ·  ${edit.source}` : data.src}
              </span>
            </div>
            {isAudit ? (
              <React.Fragment>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "14px 20px 0" }}>
                  <span style={{
                    fontFamily: "var(--font-han)", fontSize: 14, fontWeight: 700,
                    color: "var(--cream)", background: "linear-gradient(150deg, var(--navy), var(--navy-deep))",
                    border: "1px solid var(--line-gold)", borderRadius: 999, padding: "4px 12px",
                  }}>{dimNumeral}「{dimName}」</span>
                  <span style={{ fontFamily: "var(--font-han)", fontSize: 15, fontWeight: 700, color: "var(--ink-strong)" }}>
                    {edit.title}
                  </span>
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--ink-faint)" }}>
                    {edit.file} L{edit.line}
                  </span>
                </div>
                <DiffText parts={edit.parts} />
              </React.Fragment>
            ) : (
              <div style={{ minHeight: 260, display: "flex", alignItems: "center", justifyContent: "center", padding: imgOk ? 0 : 36 }}>
                {imgOk ? (
                  <img src={data.shot} alt="" style={{ width: "100%", display: "block" }} />
                ) : (
                  <div style={{ textAlign: "center", color: "var(--ink-faint)" }}>
                    <div style={{ width: 60, height: 60, margin: "0 auto 16px", borderRadius: 15,
                      border: "2px dashed var(--line-gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--gold)" }}>
                      <IconImage />
                    </div>
                    <div style={{ fontFamily: "var(--font-han)", fontSize: 14, fontWeight: 600, color: "var(--ink-dim)" }}>Demo 截圖待補</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--gold-deep)",
                      background: "rgba(163,135,95,0.12)", padding: "5px 11px", borderRadius: 7, display: "inline-block", marginTop: 11 }}>{data.shot}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {isAudit ? (
            <div style={{ marginTop: "auto", paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
                <PagerBtn onClick={() => goTo(auditIdx - 1)} disabled={auditIdx === 0}>← 上一條</PagerBtn>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "var(--ink-strong)",
                  minWidth: 48, textAlign: "center" }}>{auditIdx + 1} / {edits.length}</span>
                <PagerBtn onClick={() => goTo(auditIdx + 1)} disabled={auditIdx === maxIdx}>下一條 →</PagerBtn>
              </div>
              <div style={{
                display: "flex", justifyContent: "center", gap: 22, marginTop: 12,
                fontFamily: "var(--font-han)", fontSize: 12, color: "var(--ink-faint)",
              }}>
                <span><span style={{
                  display: "inline-block", width: 22, height: 12, verticalAlign: "middle",
                  background: "rgba(106,154,100,0.32)", borderRadius: 3, marginRight: 6,
                }} />新增的字</span>
                <span><span style={{
                  display: "inline-block", verticalAlign: "middle", marginRight: 6, color: "#9a6650",
                  textDecoration: "line-through", textDecorationColor: "#b34a3a", textDecorationThickness: 2,
                }}>刪除</span>刪掉的字</span>
              </div>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-han)", fontSize: 14, lineHeight: 1.65, color: "var(--ink-dim)", marginTop: 15 }}>{data.desc}</p>
          )}
        </div>
        <div style={{
          width: 300, flex: "none", alignSelf: "stretch", overflow: "hidden",
          background: `radial-gradient(120% 80% at 50% 18%, ${data.accent || "var(--realm-5)"}, var(--navy-deep))`,
          borderLeft: "1px solid var(--line-gold)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
        }}>
          <img src={`assets/${data.slug}-stand.png?v=${window.IMG_V}`} alt={data.name || data.title} style={{ height: 420, display: "block" }} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DemoModal });
