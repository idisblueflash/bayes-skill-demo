#!/usr/bin/env python3
import os
import subprocess
import sys

passed = 0
failed = 0


def run_test(script: str, env: dict = None):
    global passed, failed
    result = subprocess.run(
        ["python3", script],
        env={**os.environ, **(env or {})},
    )
    if result.returncode == 0:
        passed += 1
    else:
        failed += 1
    print()


run_test("tests/test_live_mode.py", {"BAYES_LIVE_MODE": "false"})
run_test("tests/test_live_mode.py", {"BAYES_LIVE_MODE": "true"})
run_test("tests/test_json_structure.py")
run_test("tests/test_cumulative_steps.py")
run_test("tests/test_likelihood_table.py")
run_test("tests/test_signal_sentence.py")

print(f"Results: {passed} passed, {failed} failed")
sys.exit(1 if failed > 0 else 0)
