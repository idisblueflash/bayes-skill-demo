#!/usr/bin/env python3
"""
Verifies bayes_state.json structure depth and probability normalization.
Always runs with live_mode=true.
"""
import json
import os
import subprocess
import sys

state_file = "bayes_state.json"
fixture = open("tests/fixtures/minimal_bayes_scenario.txt").read()

print("[test] JSON structure + math correctness (live_mode: true)")


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

# Top-level keys
for key in ("hypotheses", "steps"):
    if key not in data:
        fail(f"missing top-level key '{key}'")

if not isinstance(data["steps"], list) or len(data["steps"]) == 0:
    fail("'steps' must be a non-empty list")

n_hypotheses = len(data["hypotheses"])
if n_hypotheses == 0:
    fail("'hypotheses' list is empty")

# Per-step checks
for step in data["steps"]:
    sid = step.get("step", "?")

    for field in ("step", "evidence", "values"):
        if field not in step:
            fail(f"step {sid} missing field '{field}'")

    values = step["values"]
    if not isinstance(values, list) or len(values) == 0:
        fail(f"step {sid} 'values' must be a non-empty list")

    if len(values) != n_hypotheses:
        fail(f"step {sid} has {len(values)} values but {n_hypotheses} hypotheses")

    for i, v in enumerate(values):
        for field in ("prior", "posterior"):
            if field not in v:
                fail(f"step {sid} values[{i}] missing '{field}'")

    # Posteriors must sum to ~1.0
    posteriors = [v["posterior"] for v in values if v["posterior"] is not None]
    if posteriors:
        total = sum(posteriors)
        if abs(total - 1.0) > 0.02:
            fail(f"step {sid} posteriors sum to {total:.4f}, expected ~1.0")

print("Structure OK")
print("Normalization OK")
print("PASS")
