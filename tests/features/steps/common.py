import json
import os
import subprocess
from behave import given, when, then

STATE_FILE = "bayes_state.json"
FIXTURES = {
    "單條": "tests/fixtures/single_evidence_analysis.txt",
    "兩條": "tests/fixtures/two_evidence_scenario.txt",
}


@given("live_mode 為 {mode}")
def step_set_live_mode(context, mode):
    context.live_mode = mode.strip()


@given("已提供單條證據場景")
def step_single_evidence(context):
    context.fixture = open(FIXTURES["單條"]).read()


@given("已提供兩條證據場景")
def step_two_evidence(context):
    context.fixture = open(FIXTURES["兩條"]).read()


@when("執行技能分析")
def step_run_analysis(context):
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)

    result = subprocess.run(
        ["claude", "-p", f"live_mode is {context.live_mode}.\n\n{context.fixture}",
         "--allowedTools", "Write,Read,Bash",
         "--model", "claude-haiku-4-5-20251001",
         "--output-format", "text"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, f"claude exited {result.returncode}: {result.stderr}"
    context.output = result.stdout
    context.state = json.load(open(STATE_FILE)) if os.path.exists(STATE_FILE) else None


@then("bayes_state.json 不應被寫入")
def step_file_not_written(context):
    assert context.state is None, "bayes_state.json was written even though live_mode is false"


@then("bayes_state.json 應被寫入")
def step_file_written(context):
    assert context.state is not None, "bayes_state.json was not written"


@then("輸出應包含概似度表格")
def step_has_likelihood_table(context):
    assert "| 概似度 |" in context.output, "likelihood table not found in output"


@then("輸出應包含方向性結論句")
def step_has_signal_sentence(context):
    verdicts = ["強力支持", "輕微支持", "未能區分"]
    assert any(v in context.output for v in verdicts), "no signal verdict found in output"


@then("bayes_state.json 應包含完整結構")
def step_has_complete_structure(context):
    data = context.state
    assert data is not None, "bayes_state.json not written"
    for key in ("hypotheses", "steps"):
        assert key in data, f"missing key '{key}'"
    assert len(data["steps"]) > 0, "'steps' is empty"
    n = len(data["hypotheses"])
    for step in data["steps"]:
        for field in ("step", "evidence", "values"):
            assert field in step, f"step {step.get('step', '?')} missing '{field}'"
        assert len(step["values"]) == n, "values count != hypotheses count"
        for v in step["values"]:
            assert "prior" in v and "posterior" in v, "value missing prior/posterior"


@then("每步後驗機率之和應約等於一")
def step_posteriors_normalized(context):
    for step in context.state["steps"]:
        posteriors = [v["posterior"] for v in step["values"] if v["posterior"] is not None]
        if posteriors:
            total = sum(posteriors)
            assert abs(total - 1.0) <= 0.02, \
                f"step {step['step']} posteriors sum to {total:.4f}"


@then("步驟應累積而非覆寫")
def step_cumulative(context):
    steps = context.state["steps"]
    assert len(steps) >= 2, f"expected ≥2 steps, got {len(steps)}"
    assert len({s["step"] for s in steps}) >= 2, "step indices not unique"


@then("每步先驗應等於上步後驗")
def step_rolling_prior(context):
    steps = sorted(context.state["steps"], key=lambda s: s["step"])
    assert len(steps) >= 2, "need at least 2 steps"
    for i in range(1, len(steps)):
        prev, curr = steps[i - 1], steps[i]
        for j, (pv, cv) in enumerate(zip(prev["values"], curr["values"])):
            if pv["posterior"] is None or cv["prior"] is None:
                continue
            assert abs(pv["posterior"] - cv["prior"]) <= 0.02, \
                f"step {curr['step']} prior[{j}]={cv['prior']} != " \
                f"step {prev['step']} posterior[{j}]={pv['posterior']}"
