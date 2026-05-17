#!/usr/bin/env python3
"""
Verifies that bayes_state.json accumulates steps across multiple evidence items
rather than overwriting with only the latest.
Always runs with live_mode=true.
"""
import json
import os
import subprocess
import sys

state_file = "bayes_state.json"
fixture = open("tests/fixtures/two_evidence_scenario.txt").read()

print("[test] Cumulative steps (live_mode: true)")


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


if os.path.exists(state_file):
    os.remove(state_file)

result = subprocess.run(
    ["claude", "-p", f"live_mode is true.\n\n{fixture}",
     "--allowedTools", "Write,Read",
     "--model", "claude-haiku-4-5-20251001",
     "--output-format", "text"],
    capture_output=True,
)

if result.returncode != 0:
    fail(f"claude exited with status {result.returncode}: {result.stderr.decode()}")

if not os.path.exists(state_file):
    fail("bayes_state.json was not written")

try:
    data = json.load(open(state_file))
except json.JSONDecodeError as e:
    fail(f"bayes_state.json is not valid JSON: {e}")

if "steps" not in data:
    fail("missing 'steps' key")

steps = data["steps"]
if len(steps) < 2:
    fail(f"expected ≥2 steps, got {len(steps)} — skill is overwriting instead of appending")

step_indices = [s.get("step") for s in steps]
if len(set(step_indices)) < 2:
    fail(f"step indices are not unique: {step_indices}")

print(f"Found {len(steps)} steps with indices {step_indices}")
print("Cumulative write OK")
print("PASS")
