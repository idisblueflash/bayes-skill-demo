# bayes-skill-demo

Live Bayesian hypothesis visualization for Claude Code hackathon demos. The `bayesian-hypothesis-live` skill updates `bayes_state.json` after every Bayesian step; the web app watches that file and animates the probability bars in real time.

## Usage

**1. Start the visualization server**

```bash
node server.js
```

Open http://localhost:3000 in a browser (or project on a second screen).

**2. Run the skill in Claude Code**

In a new Claude Code session, use the `bayesian-hypothesis-live` skill:

```
/bayesian-hypothesis-live
```

Follow the prompts to set up competing hypotheses and add evidence. After each Bayesian update the skill writes to `bayes_state.json` and the browser updates automatically.

## How it works

```
Claude Code skill  →  bayes_state.json  →  SSE  →  browser bars animate
```

- `server.js` watches the project directory for changes to `bayes_state.json`
- Connected browsers receive updates via Server-Sent Events
- The page shows the current evidence, animated probability bars, and a history of all steps

## Files

| File | Purpose |
|------|---------|
| `server.js` | Node.js server — file watcher + SSE endpoint + static file serving |
| `public/index.html` | Frontend — probability bars, evidence card, history |
| `bayes_state.json` | Shared state written by the skill, read by the server |
| `.claude/skills/bayesian-hypothesis-live/` | Claude Code skill that drives the updates |
