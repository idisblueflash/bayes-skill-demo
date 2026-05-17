#!/usr/bin/env python3
import subprocess
import sys

result = subprocess.run(["uv", "run", "behave"])
sys.exit(result.returncode)
