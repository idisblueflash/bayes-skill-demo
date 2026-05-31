/* App — composes the game-style workflow screen on a fixed 1280×720 stage. */
const { useState, useEffect } = React;

/* Hash routing: each popup state is addressable via the URL hash.
   `#/<realm-slug>`           — realm popup
   `#/crew/<crew-slug>`       — crew sub-agent modal (first edit)
   `#/crew/<crew-slug>/<n>`   — crew sub-agent modal, n-th edit (1-based) */
function parseHash() {
  let h = window.location.hash || "";
  if (h.startsWith("#")) h = h.slice(1);
  if (h.startsWith("/")) h = h.slice(1);
  const parts = h.split("/").filter(Boolean);
  if (parts[0] === "crew" && parts[1]) {
    const n = parts[2] ? parseInt(parts[2], 10) : NaN;
    return { realmSlug: "crew", crewSlug: parts[1], editNum: Number.isFinite(n) && n > 0 ? n : null };
  }
  return { realmSlug: parts[0] || null, crewSlug: null, editNum: null };
}

function buildHash({ realmSlug, crewSlug, editNum }) {
  if (!realmSlug) return "#/";
  if (realmSlug === "crew" && crewSlug) {
    if (editNum && editNum > 1) return `#/crew/${crewSlug}/${editNum}`;
    return `#/crew/${crewSlug}`;
  }
  return `#/${realmSlug}`;
}

function Header({ title, subtitle }) {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, zIndex: 8, padding: "16px 28px",
      display: "flex", alignItems: "center", gap: 18,
      background: "linear-gradient(180deg, rgba(29,36,51,0.55), rgba(29,36,51,0))",
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--cream)",
          letterSpacing: ".01em", lineHeight: 1.05, textShadow: "0 2px 12px rgba(29,36,51,0.6)" }}>{title}</div>
        <div style={{ fontFamily: "var(--font-han)", fontSize: 12.5, color: "var(--on-navy-dim)", marginTop: 4,
          maxWidth: 560, textShadow: "0 1px 6px rgba(29,36,51,0.7)" }}>{subtitle}</div>
      </div>
    </div>
  );
}

function App() {
  const WF = window.WF;
  const [route, setRoute] = useState(parseHash);
  const [highlightId, setHighlightId] = useState("r1");

  const activeRealm = route.realmSlug ? WF.realms.find((r) => r.slug === route.realmSlug) : null;

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (activeRealm) setHighlightId(activeRealm.id);
  }, [activeRealm && activeRealm.id]);

  const navigate = (next) => {
    const target = buildHash(next);
    if (target !== window.location.hash) window.location.hash = target;
  };

  const openRealm = (id) => {
    const realm = WF.realms.find((r) => r.id === id);
    if (realm) navigate({ realmSlug: realm.slug });
  };
  const closePopup = () => navigate({ realmSlug: null });
  const openSub = (slug) => navigate({ realmSlug: "crew", crewSlug: slug });
  const closeSub = () => navigate({ realmSlug: "crew" });
  const setSubEdit = (n) => navigate({ realmSlug: "crew", crewSlug: route.crewSlug, editNum: n });

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <MapStage realms={WF.realms} />
      <Header title={WF.title} subtitle={WF.subtitle} />

      {/* Realm avatars stand directly on the map; click any one to open its main window. */}
      {WF.realms.map((realm) => (
        <Avatar
          key={realm.id}
          realm={realm}
          active={realm.id === highlightId}
          onOpen={() => openRealm(realm.id)}
        />
      ))}

      <MainWindow
        realm={activeRealm}
        crew={WF.crew}
        subSlug={route.crewSlug}
        subEditNum={route.editNum}
        onOpenSub={openSub}
        onSetSubEdit={setSubEdit}
        onCloseSub={closeSub}
        onClose={closePopup}
      />
    </div>
  );
}

Object.assign(window, { App });
