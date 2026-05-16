# Changelog

All notable changes to `bayesian-hypothesis-live` will be documented here.

## [0.3.0] - 2026-05-15

### Changed
- Bayesian math tables (likelihood estimates and update table) are no longer printed to the conversation
- Per-evidence output is now a single plain-language signal summary, keeping sessions readable for non-Bayesian audiences
- Full math is still computed internally and written to `bayes_state.json`
- An optional `<details>` collapsible block is available for auditing during Q&A

## [0.2.0] - 2026-05-15

### Added
- Reader-friendly stage-summary table with a "reason" column (調查前 / 現在 / 原因 format)
- Final posterior table updated to the same plain-language format — no Bayesian jargon exposed to end users

## [0.1.0] - 2026-05-12

### Added
- Initial release of the Live Demo variant of `bayesian-hypothesis`
- Writes probability state to `/tmp/bayes_state.json` after each Bayesian update, enabling real-time visualization
