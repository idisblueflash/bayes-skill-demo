#!/usr/bin/env python3
"""
Verifies that the skill outputs a signal sentence containing one of the
canonical verdict phrases (強力支持 / 輕微支持 / 未能區分) after processing evidence.
"""
import subprocess
import sys

fixture = open("tests/fixtures/single_evidence_analysis.txt").read()

print("[test] Signal sentence in output (live_mode: false)")

VERDICTS = ["強力支持", "輕微支持", "未能區分"]


def fail(msg):
    print(f"FAIL: {msg}")
    sys.exit(1)


result = subprocess.run(
    ["claude", "-p", f"live_mode is false.\n\n{fixture}",
     "--allowedTools", "Write,Read",
     "--model", "claude-haiku-4-5-20251001",
     "--output-format", "text"],
    capture_output=True,
    text=True,
)

if result.returncode != 0:
    fail(f"claude exited with status {result.returncode}: {result.stderr}")

matched = [v for v in VERDICTS if v in result.stdout]
if not matched:
    fail(f"no signal verdict found in output.\nGot:\n{result.stdout[:800]}")

print(f"Signal verdict found: {matched[0]}")
print("PASS")
