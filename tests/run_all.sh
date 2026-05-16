#!/usr/bin/env bash
# Run all live_mode tests in sequence
set -euo pipefail

PASS=0
FAIL=0

run_test() {
  local script="$1"
  if bash "$script"; then
    PASS=$((PASS + 1))
  else
    FAIL=$((FAIL + 1))
  fi
  echo ""
}

run_test tests/test_live_mode_off.sh
run_test tests/test_live_mode_on.sh

echo "Results: ${PASS} passed, ${FAIL} failed"
[ "$FAIL" -eq 0 ]
