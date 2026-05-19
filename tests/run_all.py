#!/usr/bin/env python3
import subprocess
import sys

results = []

r = subprocess.run(["uv", "run", "pytest", "tests/test_bayes_calc.py", "-v"])
results.append(r.returncode)
print()

r = subprocess.run(["uv", "run", "behave"])
results.append(r.returncode)

sys.exit(1 if any(rc != 0 for rc in results) else 0)
