#!/usr/bin/env bash
# Test: live_mode: false — bayes_state.json must NOT be written
set -euo pipefail

SKILL_FILE=".claude/skills/bayesian-hypothesis-live/SKILL.md"
STATE_FILE="bayes_state.json"

echo "[test] live_mode: false"

# Guard: ensure live_mode is currently false
if ! grep -q "live_mode: false" "$SKILL_FILE"; then
  echo "SKIP: live_mode is not false in SKILL.md — set it to false before running this test"
  exit 0
fi

# Remove any existing state file so we get a clean read
rm -f "$STATE_FILE"

# Run the skill non-interactively (haiku + bare to minimise token cost)
claude -p "$(cat tests/fixtures/minimal_bayes_scenario.txt)" \
  --allowedTools "Write,Read" \
  --model claude-haiku-4-5-20251001 \
  --bare \
  --output-format text \
  > /dev/null

# Assert: file must NOT exist
if [ -f "$STATE_FILE" ]; then
  echo "FAIL: bayes_state.json was written even though live_mode is false"
  exit 1
fi

echo "PASS"
