#!/usr/bin/env python3
"""Select (or drop) SRT cues by index, writing a new SRT.

Pairs with a per-word SRT + a classification of which cue numbers are filler.
Use it to materialise the cut-list (the dropped cues) for review or for feeding
into cut_silence.py, or with --invert to write the cleaned transcript.

Indices come from --indices: a comma/space-separated list and/or @file
references. A file may be a JSON list, a JSON object whose values are lists
(all unioned, or restrict with --keys), or plain whitespace/comma-separated ints.

Example:
    # cut-list of filler words (tier A + B) for review
    python scripts/select_cues.py movie/bayes-demo.words.test10.srt \
        --indices @movie/filler_idx.test10.json -o movie/bayes-demo.filler.test10.srt
    # cleaned transcript (everything that is NOT filler)
    python scripts/select_cues.py movie/bayes-demo.words.test10.srt \
        --indices @movie/filler_idx.test10.json --invert -o movie/bayes-demo.clean.test10.srt
    # only the safe tier
    python scripts/select_cues.py in.srt --indices @cls.json --keys tierA -o out.srt
"""

import argparse
import json
import re
import sys
from pathlib import Path

TS_RE = re.compile(r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})")


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


def fmt_timestamp(seconds: float) -> str:
    millis = int(round(max(0.0, seconds) * 1000))
    h, millis = divmod(millis, 3_600_000)
    m, millis = divmod(millis, 60_000)
    s, millis = divmod(millis, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{millis:03d}"


def load_indices(tokens: list[str], keys: list[str] | None) -> set[int]:
    out: set[int] = set()
    for tok in tokens:
        if tok.startswith("@"):
            data = json.loads(Path(tok[1:]).read_text(encoding="utf-8")) \
                if tok.endswith(".json") else None
            if isinstance(data, list):
                out.update(int(x) for x in data)
            elif isinstance(data, dict):
                for k, v in data.items():
                    if k.startswith("_") or not isinstance(v, list):
                        continue
                    if keys and k not in keys:
                        continue
                    out.update(int(x) for x in v)
            else:  # plain-text int file
                out.update(int(x) for x in re.findall(r"-?\d+", Path(tok[1:]).read_text()))
        else:
            out.update(int(x) for x in re.findall(r"-?\d+", tok))
    return out


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", type=Path)
    p.add_argument("-o", "--output", type=Path, required=True)
    p.add_argument("--indices", nargs="+", required=True,
                   help="Cue numbers and/or @file references")
    p.add_argument("--keys", nargs="*", default=None,
                   help="When an @file is a JSON object, restrict to these keys (e.g. tierA)")
    p.add_argument("--invert", action="store_true", help="Keep cues NOT in the index set")
    args = p.parse_args(argv)

    if not args.input.exists():
        print(f"error: not found: {args.input}", file=sys.stderr)
        return 1

    cues = parse_srt(args.input)
    selected = load_indices(args.indices, args.keys)
    picked = [c for c in cues if (c[0] in selected) != args.invert]

    blocks = [
        f"{i}\n{fmt_timestamp(s)} --> {fmt_timestamp(e)}\n{t}\n"
        for i, (_, s, e, t) in enumerate(picked, start=1)
    ]
    args.output.write_text("\n".join(blocks), encoding="utf-8")
    total = sum(e - s for _, s, e, t in picked)
    print(f"{len(picked)}/{len(cues)} cues → {args.output} ({total:.1f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
