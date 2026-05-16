# bayes-skill-demo

A Claude Code skill for stepwise Bayesian hypothesis validation. Feed it competing hypotheses and evidence one by one; it updates the posterior probabilities after each step and shows a concise likelihood table.

Optionally pairs with a live visualization web app for Hackathon / Meetup demos.

## Install the skill

Download the latest release zip from the [Releases page](../../releases), then tell your Claude Code:

```
幫我安裝這個 skill，zip 檔在這裡：~/Downloads/bayesian-hypothesis-live-v0.5.0.zip
```

## Use the skill

In any Claude Code session:

```
/bayesian-hypothesis-live
```

Follow the prompts to set up competing hypotheses, then add evidence one by one. After each update you'll see a likelihood table and updated posteriors.

## Live Demo mode (developer only)

By default the skill runs in pure conversation mode — no files written. To pair it with the real-time visualization web app for a demo:

**1. Enable live mode**

In `.claude/skills/bayesian-hypothesis-live/SKILL.md`, change:

```
live_mode: false
```
to:
```
live_mode: true
```

**2. Start the visualization server**

```bash
npm start
```

Open http://localhost:3000 (or project on a second screen). The browser updates automatically after each Bayesian step.

**3. After the demo, turn live mode off**

Change `live_mode` back to `false`.

## Release a new version

1. Bump `version` in `.claude/skills/bayesian-hypothesis-live/SKILL.md`
2. Add an entry to `.claude/skills/bayesian-hypothesis-live/CHANGELOG.md`
3. Commit, then run:

```bash
npm run release
```

## Run tests

```bash
npm test
```

Tests verify the `live_mode` switch: `false` must not write `bayes_state.json`, `true` must write valid JSON.

## Files

| Path | Purpose |
|------|---------|
| `.claude/skills/bayesian-hypothesis-live/SKILL.md` | Skill definition — edit `live_mode` here |
| `.claude/skills/bayesian-hypothesis-live/CHANGELOG.md` | Version history (Traditional Chinese) |
| `scripts/release.sh` | Packages the skill and publishes to GitHub Releases |
| `tests/` | E2E behavior tests for the live_mode switch |
| `server.js` | Live demo server — file watcher + SSE + static files |
| `public/index.html` | Live demo frontend — animated probability bars |
| `bayes_state.json` | Shared state written by skill (live mode only) |
