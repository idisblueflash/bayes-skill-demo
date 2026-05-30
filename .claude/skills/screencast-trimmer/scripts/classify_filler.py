#!/usr/bin/env python3
"""Heuristic classifier: identify per-word filler cues to cut from a transcript.

Reads a per-word SRT (from transcribe_words.py) and emits a JSON list of cue
numbers to drop, covering Tier A + G2 + G3 of the screencast-trimmer profile.
Use the output with select_cues.py (for review) or fold it into the combined
cut-list fed to cut_silence.py.

Rules applied (all combinable):

- **Consecutive duplicates** — adjacent cues with identical text (e.g. `我觉得 我觉得`,
  `注意 注意`, `他 他`, `来 来`). The duplicate is dropped, the first kept.
- **Standalone discourse fillers** — `OK` (any case) and `呢`.
- **G2 filler particles** — `就是`, `这个`, `一下`, `大概`, `这么`. `一个` is *not*
  included by default because it has both content and filler uses.
- **第N → 第M corrections** — `第三` followed within 3 cues / 2 s by a *different*
  `第N` is treated as a false start; the first one is dropped.
- **Repeat-start patterns** — when a known false-start token (`把`, `他的`,
  `我觉得`, `注意`, `来`, `把这个`) at cue i recurs at cue j in (i+2..i+4), the
  intervening cues i..j-1 are dropped (catches `他的 第一 他的 更新`, `把 这个 第一
  把 这个 …`, etc.).

What this does NOT catch: context-dependent G2 `一个`, content-vs-filler disambiguation
on `这个`/`就是` (a conservative over-cut is accepted), and G1 discourse glue
(`那么`/`那`/`然后`/`好`) which the saved profile excludes for choppiness.

Example:
    python scripts/classify_filler.py movie/bayes-demo.words.srt -o movie/drop_idx.json
    python scripts/classify_filler.py in.words.srt -o drop.json --review review.srt
"""

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path

TS_RE = re.compile(r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})")

G2_TOKENS = {"就是", "这个", "一下", "大概", "这么"}
NUMS = {"第一", "第二", "第三", "第四", "第五", "第六", "第七", "第八"}
REPEAT_STARTS = {"把", "他的", "我觉得", "注意", "来", "把这个"}

CORRECTION_GAP_SEC = 2.0       # how far apart 第N → 第M can be
CORRECTION_WINDOW_CUES = 3      # within how many cues
REPEAT_WINDOW_CUES = 4          # window for repeat-start pattern (i+2..i+4)


def parse_srt(path: Path) -> list[tuple[int, float, float, str]]:
    cues = []
    for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8-sig").strip()):
        lines = block.strip().splitlines()
        ts_idx = next((i for i, ln in enumerate(lines) if "-->" in ln), None)
        if ts_idx is None or ts_idx == 0:
            continue
        try:
            num = int(lines[0].strip())
        except ValueError:
            continue
        m = TS_RE.search(lines[ts_idx])
        if not m:
            continue
        g = [int(x) for x in m.groups()]
        start = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
        end = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
        text = "\n".join(lines[ts_idx + 1:]).strip()
        cues.append((num, start, end, text))
    return cues


def classify(cues: list[tuple[int, float, float, str]]) -> tuple[set[int], dict[int, str]]:
    drop: set[int] = set()
    reason: dict[int, str] = {}

    def mark(num: int, why: str) -> None:
        drop.add(num)
        reason.setdefault(num, why)

    # 1) consecutive duplicates
    for i in range(len(cues) - 1):
        if cues[i][3] and cues[i][3] == cues[i + 1][3]:
            mark(cues[i + 1][0], "dup")

    # 2) standalone fillers + G2
    for num, _, _, text in cues:
        if text.lower() == "ok":
            mark(num, "OK")
        elif text == "呢":
            mark(num, "呢")
        elif text in G2_TOKENS:
            mark(num, f"G2 {text}")

    # 3) 第N → 第M correction
    for i, (num, _, end, text) in enumerate(cues):
        if text not in NUMS:
            continue
        for j in range(i + 1, min(i + 1 + CORRECTION_WINDOW_CUES, len(cues))):
            n2, s2, _, t2 = cues[j]
            if t2 in NUMS and t2 != text and s2 - end < CORRECTION_GAP_SEC:
                mark(num, f"{text}->{t2} correction")
                break

    # 4) repeat-start pattern: cues[i].text == cues[j].text with j in (i+2..i+REPEAT_WINDOW_CUES],
    #    drop cues[i:j) — catches "他的 第一 他的", "把 这个 第一 把 这个", etc.
    for i in range(len(cues)):
        if cues[i][3] not in REPEAT_STARTS:
            continue
        for j in range(i + 2, min(i + 1 + REPEAT_WINDOW_CUES, len(cues))):
            if cues[j][3] == cues[i][3]:
                for k in range(i, j):
                    mark(cues[k][0], f"repeat-start {cues[i][3]}")
                break

    return drop, reason


def fmt_timestamp(seconds: float) -> str:
    millis = int(round(max(0.0, seconds) * 1000))
    h, millis = divmod(millis, 3_600_000)
    m, millis = divmod(millis, 60_000)
    s, millis = divmod(millis, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{millis:03d}"


def write_review(path: Path, cues: list, drop: set[int], reason: dict[int, str]) -> None:
    picked = [(n, s, e, f"[{reason.get(n, '?')}] {t}") for n, s, e, t in cues if n in drop]
    blocks = [
        f"{i}\n{fmt_timestamp(s)} --> {fmt_timestamp(e)}\n{t}\n"
        for i, (_, s, e, t) in enumerate(picked, start=1)
    ]
    path.write_text("\n".join(blocks), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", type=Path, help="Per-word SRT (from transcribe_words.py)")
    p.add_argument("-o", "--output", type=Path, required=True, help="JSON list of cue indices to drop")
    p.add_argument("--review", type=Path, default=None,
                   help="Optional SRT showing each dropped cue with its [reason] (for human review)")
    args = p.parse_args(argv)

    if not args.input.exists():
        print(f"error: not found: {args.input}", file=sys.stderr)
        return 1

    cues = parse_srt(args.input)
    drop, reason = classify(cues)

    durations = {n: e - s for n, s, e, _ in cues}
    total = sum(durations[n] for n in drop)
    args.output.write_text(json.dumps(sorted(drop)), encoding="utf-8")
    if args.review:
        write_review(args.review, cues, drop, reason)

    print(f"{len(drop)} drops / {len(cues)} cues, {total:.1f}s total → {args.output}"
          + (f", review → {args.review}" if args.review else ""))
    print("by reason:")
    for k, v in Counter(reason.values()).most_common():
        print(f"  {v:4}  {k}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
