#!/usr/bin/env python3
"""
Bayesian posterior calculator.
Usage: python3 bayes_calc.py '{"priors": [0.5, 0.3, 0.2], "likelihoods": [0.7, 0.2, 0.1]}'
Output: {"posteriors": [0.7447, 0.2128, 0.0426]}
"""
import json
import sys


def bayes_update(priors: list, likelihoods: list) -> list:
    if len(priors) != len(likelihoods):
        raise ValueError(
            f"priors length ({len(priors)}) != likelihoods length ({len(likelihoods)})"
        )
    unnormalized = [p * l for p, l in zip(priors, likelihoods)]
    total = sum(unnormalized)
    if total == 0:
        raise ValueError("all likelihoods are zero — cannot normalize")
    return [round(u / total, 4) for u in unnormalized]


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(
            'Usage: python3 bayes_calc.py \'{"priors": [...], "likelihoods": [...]}\'',
            file=sys.stderr,
        )
        sys.exit(1)
    data = json.loads(sys.argv[1])
    posteriors = bayes_update(data["priors"], data["likelihoods"])
    print(json.dumps({"posteriors": posteriors}))
