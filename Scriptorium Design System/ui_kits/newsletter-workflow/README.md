# UI Kit — Newsletter Workflow (game-style)

A high-fidelity, interactive recreation of the **電子報寫作工作流程** presentation in the Scriptorium fantasy-map aesthetic. Built for a Hackathon demo: the writing pipeline reads as an RPG **world map**, each step a numbered island-realm, each AI agent a character.

## Run it
Open `index.html`. It renders a fixed **1280×720** stage that letterboxes to fit any viewport (the deck/game scaling pattern).

## Interactions
- **Chapter select** (top-right pennants `1–5`) or **click a realm marker** on the map → the portrait panel, speech bubble, and bottom workflow strip update to that stage.
- **播放流程 (Play)** → animates the journey: realms light up in path order (1→2→3→5→4), the **golden path draws** along the map, and a celebratory **可發布的電子報** ribbon resolves at the end. Becomes **重新播放 (Replay)**.
- **查看 Demo** (portrait panel, or any crew card) → opens the **demo modal** with browser-window chrome. It tries to load the step's screenshot from `assets/demo/NN-*.png`; if absent it shows a labelled placeholder with the expected path. **Drop real screenshots into `assets/demo/` to fill these.**

## Files
| File | Role |
|---|---|
| `index.html` | Stage shell, font/CSS load, React+Babel mount, fit-to-viewport scaling. |
| `colors_and_type.css` | Copy of the system tokens (kept local so the kit is self-contained). |
| `data.js` | The workflow model — realms, crew, copy, map marker positions (`window.WF`). |
| `Icons.jsx` | Stroke-SVG icons + `Shield`, `Flourish` helpers. |
| `MapStage.jsx` | Map backdrop, heraldic pennant markers, vignette, golden path SVG. |
| `PortraitPanel.jsx` | Framed character portrait + speech bubble + chips + demo button. |
| `WorkflowStrip.jsx` | Bottom strip: per-realm flow steps, or the 5-member crew grid. |
| `DemoModal.jsx` | Window-chrome overlay for step demos (image or placeholder). |
| `App.jsx` | Composition, chapter-select header, play-through state machine. |

## Component coverage
Heraldic banners/shields · pennant map markers · portrait + speech bubble · chips (Agent/Skill) · gilt primary button · IO-pill flow steps · crew cards (default/active/dim) · final-output ribbon · modal window chrome.

## Notes & gaps
- **Only Thomas (realm 1) has character art.** Realms 2–4 and the five crew members render an intentional "Portrait · 待補 / to be drawn" placeholder (shield + label). Drop art into `assets/` and wire it in `PortraitFrame` when available.
- Demo screenshots are **placeholders** by design — supply `assets/demo/*.png`.
- Map marker positions in `data.js` (`pos:{x,y}` as % of the backdrop) are tuned to the provided low-res `map.png`; re-tune if you swap in a higher-resolution map.
