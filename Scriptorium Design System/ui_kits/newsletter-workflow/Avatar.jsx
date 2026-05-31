/* Avatar — the character placed directly on the world map (no window chrome).
   On the MAP he uses the seated "studying at his desk" pose, planted on the
   realm's map position (static — no floating). The standing pose is used in the
   MainWindow popup. Click the figure or the prompt to open the popup. */
const { useState: useStateAv } = React; // game-style on-map avatar

const STAGE_W = 1280, STAGE_H = 720;
const DRAG_THRESHOLD = 3;

function pointerToStagePos(e) {
  const stage = document.getElementById("stage");
  if (!stage) return null;
  const rect = stage.getBoundingClientRect();
  const round1 = (v) => Math.round(v * 10) / 10;
  return {
    x: round1(((e.clientX - rect.left) / rect.width) * 100),
    y: round1(((e.clientY - rect.top) / rect.height) * 100),
  };
}

/* The figure — per-realm placeholder art that can be swapped by filename. Reused in MainWindow. */
function AvatarFigure({ realm, pose = "stand", height = 430, hovered = false }) {
  const src = `assets/${realm.slug}-${pose === "sit" ? "sit" : "stand"}.png?v=${window.IMG_V}`;
  return (
    <img src={src} alt={realm.agent || realm.skill} draggable="false" style={{
      height, display: "block", userSelect: "none",
      filter: hovered
        ? "drop-shadow(0 16px 14px rgba(0,0,0,.45)) drop-shadow(0 0 22px var(--gold-glow))"
        : "drop-shadow(0 16px 14px rgba(0,0,0,.5))",
      transition: "filter .3s",
    }} />
  );
}

function Avatar({ realm, position, active, dragging, onDragStart, onDragMove, onDragEnd, onOpen }) {
  const [hov, setHov] = useStateAv(false);
  const drag = React.useRef({ pointerId: null, startX: 0, startY: 0, moved: false, suppressClick: false });
  const label = realm.agent || realm.skill;

  // seated figure planted at the realm's map position
  const figH = 176;
  const figW = figH * 0.75;
  const p = position || realm.pos;
  const baseX = (p.x / 100) * STAGE_W;     // realm contact point (bottom-center)
  const baseY = (p.y / 100) * STAGE_H;

  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false, suppressClick: false };
    onDragStart(realm.id);
  };

  const handlePointerMove = (e) => {
    if (drag.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.current.moved = true;
    const pos = pointerToStagePos(e);
    if (pos) onDragMove(realm.id, pos);
  };

  const finishPointer = (e) => {
    if (drag.current.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) drag.current.moved = true;
    const pos = pointerToStagePos(e) || p;
    const moved = drag.current.moved;
    drag.current.suppressClick = moved;
    drag.current.pointerId = null;
    onDragEnd(realm.id, pos, moved);
  };

  const handleClick = (e) => {
    if (drag.current.suppressClick) {
      drag.current.suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onOpen();
  };

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: dragging ? 9 : active ? 7 : 6, pointerEvents: "none",
      opacity: active || hov ? 1 : 0.7, transition: "opacity .2s"
    }}>
      {/* ---- The seated figure, planted on the ground ---- */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointer}
        onPointerCancel={finishPointer}
        onClick={handleClick}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position: "absolute", left: baseX, top: baseY, transform: `translate(-50%, -100%) scale(${dragging ? 1.05 : 1})`,
          cursor: dragging ? "grabbing" : "grab", pointerEvents: "auto", touchAction: "none", transition: dragging ? "none" : "transform .15s" }}
      >
        {/* soft contact shadow on the ground */}
        <div style={{
          position: "absolute", bottom: -6, left: "50%", transform: "translateX(-50%)",
          width: figW * 0.92, height: 26, borderRadius: "50%",
          background: `radial-gradient(50% 50% at 50% 50%, rgba(20,17,12,${hov ? 0.5 : 0.42}), transparent 72%)`,
          filter: "blur(3px)",
        }} />
        <AvatarFigure realm={realm} pose="sit" height={figH} hovered={hov || active} />
        {/* floating "click" indicator above the head (opacity pulse only — no drift) */}
        {active && <div style={{
          position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
          animation: "pulseHint 1.9s ease-in-out infinite",
          display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          fontFamily: "var(--font-han)", fontSize: 11, fontWeight: 600, color: "var(--navy-deep)",
          padding: "4px 10px", borderRadius: 999, background: "var(--gold-glow)",
          border: "1px solid var(--gold-bright)", boxShadow: "0 6px 16px -6px rgba(0,0,0,.6)",
        }}>點擊</div>}
      </div>
      <div style={{
        position: "absolute", left: baseX, top: baseY + 8, transform: "translateX(-50%)",
        pointerEvents: "none", whiteSpace: "nowrap", textAlign: "center",
        fontFamily: "var(--font-han)", fontSize: 12.5, fontWeight: 700, color: "var(--gold-glow)",
        padding: "4px 9px", borderRadius: 999,
        background: "linear-gradient(150deg, rgba(29,36,51,0.9), rgba(17,22,33,0.92))",
        border: "1px solid var(--line-gold)", boxShadow: "0 8px 18px -10px rgba(0,0,0,.7)",
      }}>{label}</div>
    </div>
  );
}

Object.assign(window, { Avatar, AvatarFigure });
