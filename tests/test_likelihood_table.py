#!/usr/bin/env python3
"""
Verifies that the skill outputs a likelihood table (| 假說 | 概似度 | 理由 |)
in its conversational response when processing evidence.
"""
import os
import subprocess
import sys

fixture = open("tests/fixtures/single_evidence_analysis.txt").read()

print("[test] Likelihood table in output (live_mode: false)")


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

if "| 概似度 |" not in result.stdout:
    fail(f"likelihood table not found in output.\nGot:\n{result.stdout[:800]}")

print("Likelihood table found")
print("PASS")
