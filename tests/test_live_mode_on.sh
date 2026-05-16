#!/usr/bin/env bash
# Test: live_mode: true — bayes_state.json must be written with valid structure
set -euo pipefail

SKILL_FILE=".claude/skills/bayesian-hypothesis-live/SKILL.md"
STATE_FILE="bayes_state.json"

echo "[test] live_mode: true"

# Guard: ensure live_mode is currently false before we flip it
if ! grep -q "live_mode: false" "$SKILL_FILE"; then
  echo "SKIP: live_mode is not false in SKILL.md — this test manages the switch itself, start from false"
  exit 0
fi

# Flip to true
sed -i '' 's/live_mode: false/live_mode: true/' "$SKILL_FILE"

# Ensure we restore on exit, even if the test fails
restore() { sed -i '' 's/live_mode: true/live_mode: false/' "$SKILL_FILE"; }
trap restore EXIT

# Remove any existing state file
rm -f "$STATE_FILE"

# Run the skill non-interactively
claude -p "$(cat tests/fixtures/minimal_bayes_scenario.txt)" \
  --allowedTools "Write,Read" \
  --output-format text \
  > /dev/null

# Assert 1: file must exist
if [ ! -f "$STATE_FILE" ]; then
  echo "FAIL: bayes_state.json was not written even though live_mode is true"
  exit 1
fi

# Assert 2: file must be valid JSON with expected structure
python3 - <<'EOF'
import json, sys
with open("bayes_state.json") as f:
    d = json.load(f)
assert "hypotheses" in d, "missing 'hypotheses' key"
assert "steps" in d, "missing 'steps' key"
assert len(d["steps"]) >= 1, "steps array is empty"
step = d["steps"][-1]
assert "evidence" in step, "missing 'evidence' in last step"
assert "values" in step, "missing 'values' in last step"
print("JSON structure OK")
EOF

echo "PASS"
