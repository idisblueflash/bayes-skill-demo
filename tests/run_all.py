#!/usr/bin/env python3
import subprocess
import sys

passed = 0
failed = 0


def run_test(live_mode: bool):
    global passed, failed
    result = subprocess.run(
        ["python3", "tests/test_live_mode.py"],
        env={**__import__("os").environ, "BAYES_LIVE_MODE": str(live_mode).lower()},
    )
    if result.returncode == 0:
        passed += 1
    else:
        failed += 1
    print()


run_test(False)
run_test(True)

print(f"Results: {passed} passed, {failed} failed")
sys.exit(1 if failed > 0 else 0)
