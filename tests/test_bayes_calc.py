import sys
import pytest

sys.path.insert(0, ".claude/skills/bayesian-hypothesis-live")
from bayes_calc import bayes_update


def test_posteriors_sum_to_one():
    posteriors = bayes_update([0.5, 0.3, 0.2], [0.7, 0.2, 0.1])
    assert abs(sum(posteriors) - 1.0) < 1e-9


def test_correct_bayes_math():
    # P(H|E) ∝ prior × likelihood
    # [0.5*0.8, 0.3*0.2, 0.2*0.1] = [0.4, 0.06, 0.02] → total=0.48
    # normalized: [0.8333, 0.125, 0.0417]
    posteriors = bayes_update([0.5, 0.3, 0.2], [0.8, 0.2, 0.1])
    assert abs(posteriors[0] - round(0.4 / 0.48, 4)) < 1e-3
    assert abs(posteriors[1] - round(0.06 / 0.48, 4)) < 1e-3
    assert abs(posteriors[2] - round(0.02 / 0.48, 4)) < 1e-3


def test_uniform_likelihoods_preserve_priors():
    priors = [0.5, 0.3, 0.2]
    posteriors = bayes_update(priors, [0.6, 0.6, 0.6])
    for p, q in zip(priors, posteriors):
        assert abs(p - q) < 1e-3


def test_dominant_likelihood_shifts_probability():
    posteriors = bayes_update([0.33, 0.33, 0.34], [0.9, 0.05, 0.05])
    assert posteriors[0] > 0.8


def test_length_mismatch_raises():
    with pytest.raises(ValueError):
        bayes_update([0.5, 0.5], [0.3, 0.3, 0.4])


def test_all_zero_likelihoods_raises():
    with pytest.raises(ValueError):
        bayes_update([0.5, 0.3, 0.2], [0.0, 0.0, 0.0])


def test_two_hypotheses():
    posteriors = bayes_update([0.5, 0.5], [0.8, 0.2])
    assert abs(posteriors[0] - 0.8) < 1e-3
    assert abs(posteriors[1] - 0.2) < 1e-3


def test_output_rounded_to_four_decimals():
    posteriors = bayes_update([0.5, 0.3, 0.2], [0.7, 0.2, 0.1])
    for p in posteriors:
        assert p == round(p, 4)
