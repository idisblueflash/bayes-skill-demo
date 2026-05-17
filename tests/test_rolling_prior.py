#!/usr/bin/env python3
"""
Verifies that each step's prior equals the previous step's posterior
(the rolling update rule: posterior[N-1] becomes prior[N]).
Always runs with live_mode=true.
"""
import json
import os
import subprocess
import sys

state_file = "bayes_state.json"
fixture = open("tests/fixtures/two_evidence_scenario.txt").read()

print("[test] Rolling prior: prior[N] == posterior[N-1] (live_mode: true)")


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

steps = sorted(data.get("steps", []), key=lambda s: s["step"])
if len(steps) < 2:
    fail(f"need at least 2 steps to check rolling prior, got {len(steps)}")

for i in range(1, len(steps)):
    prev, curr = steps[i - 1], steps[i]
    prev_posteriors = [v["posterior"] for v in prev["values"]]
    curr_priors = [v["prior"] for v in curr["values"]]

    for j, (expected, actual) in enumerate(zip(prev_posteriors, curr_priors)):
        if expected is None or actual is None:
            continue
        if abs(expected - actual) > 0.02:
            fail(
                f"step {curr['step']} prior[{j}]={actual} != "
                f"step {prev['step']} posterior[{j}]={expected}"
            )

print(f"Rolling prior OK across {len(steps)} steps")
print("PASS")
