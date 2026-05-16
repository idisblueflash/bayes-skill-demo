#!/usr/bin/env python3
import json
import os
import subprocess
import sys

live_mode = os.environ.get("BAYES_LIVE_MODE", "false").lower() == "true"
state_file = "bayes_state.json"
fixture = open("tests/fixtures/minimal_bayes_scenario.txt").read()

print(f"[test] live_mode: {live_mode}")


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


# Clean up any existing state file
if os.path.exists(state_file):
    os.remove(state_file)

# Inject live_mode value directly into the prompt — no file mutation needed
prompt = f"live_mode is {live_mode}.\n\n{fixture}"

result = subprocess.run(
    ["claude", "-p", prompt,
     "--allowedTools", "Write,Read",
     "--model", "claude-haiku-4-5-20251001",
     "--output-format", "text"],
    capture_output=True,
)

if result.returncode != 0:
    fail(f"claude exited with status {result.returncode}: {result.stderr.decode()}")

if live_mode:
    if not os.path.exists(state_file):
        fail("bayes_state.json was not written even though live_mode is true")
    try:
        data = json.load(open(state_file))
    except json.JSONDecodeError as e:
        fail(f"bayes_state.json is not valid JSON: {e}")
    if "hypotheses" not in data:
        fail("missing 'hypotheses' key in bayes_state.json")
    print("JSON structure OK")
else:
    if os.path.exists(state_file):
        fail("bayes_state.json was written even though live_mode is false")

print("PASS")
