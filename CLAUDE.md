# bayes-skill-demo

## Skill Versioning Convention

- Version format: semantic versioning (`MAJOR.MINOR.PATCH`)
- First real release of a skill starts at `0.1.0`, not `1.0.0` or `0.0.0`
- Bump version in `SKILL.md` frontmatter and add a CHANGELOG entry in the same commit
- Reconstruct version history from git log when adding versioning retroactively

## CHANGELOG

- Every skill directory should have a `CHANGELOG.md`
- Write CHANGELOG content in **Traditional Chinese (繁體中文)** — target users are non-technical and read it to decide whether to upgrade
- Use `### 新增` / `### 改進` / `### 修正` as section headers

## Skill File Structure

Each skill lives under `.claude/skills/<skill-name>/` and contains:
- `SKILL.md` — skill definition with `name`, `version`, `description` frontmatter
- `CHANGELOG.md` — version history in Traditional Chinese

## Releasing a Skill

Run `npm run release` (or `bash scripts/release.sh`) from the project root.

- GitHub release tag format: `skill-v{version}` (e.g. `skill-v0.3.0`)
- Release notes are auto-generated: CHANGELOG section for that version + Chinese installation instruction
- To test with a specific version without editing `SKILL.md`: `bash scripts/release.sh 0.1.0`
- Delete test releases on GitHub before publishing the real one

## Testing

Run `npm test` — executes `tests/run_all.py` which runs two E2E behavior tests via `claude -p`.

- Tests inject `BAYES_LIVE_MODE` env var into the prompt; they never mutate `SKILL.md`
- Test fixtures provide **data only** — no logic instructions; the skill handles all logic
- Use `--model claude-haiku-4-5-20251001` to reduce token cost in tests
- Do NOT use `--bare` flag in tests — it disables OAuth/keychain auth and breaks login

## live_mode Switch

- `live_mode: false` (default) — pure conversation mode, no files written; ships to community
- `live_mode: true` — developer-only, for Hackathon/Meetup live demos with the visualization web app
- Community users never need to touch this setting
- When using `sed` to flip the switch, always anchor the pattern: `s/^live_mode: false$/live_mode: true/` to avoid corrupting inline backtick references in the skill file
