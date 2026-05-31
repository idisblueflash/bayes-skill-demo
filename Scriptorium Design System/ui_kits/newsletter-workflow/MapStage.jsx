/* MapStage — the world-map backdrop. */
function MapStage() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <img src={`assets/map.png?v=${window.IMG_V}`} alt="" style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
        filter: "saturate(1.02) contrast(1.02)",
      }} />
      {/* warm vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(120% 90% at 50% 38%, transparent 55%, rgba(40,33,22,0.34) 100%)" }} />
    </div>
  );
}

Object.assign(window, { MapStage });
