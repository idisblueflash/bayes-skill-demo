#!/usr/bin/env python3
"""Remap a sentence-level SRT to the timeline of a cut video, output as a
jemma-progressbar-compatible `.txt` (one line per sentence, prefixed with
`[HH:MM:SS]`).

Use this when the video you want chapters for is the *output* of
screencast-trimmer (or any other ranges-removed cut) and you already have:
  - the original sentence SRT (pre-cut), and
  - the cut-list SRT (the ranges that were removed).

Avoids re-running Whisper on the cut video, which on CPU can take 20+ min.

Example:
    python scripts/remap_for_cut.py \
        --orig-srt movie/bayes-demo.srt \
        --cutlist movie/bayes-demo.cutlist.full.srt \
        -o movie/bayes-demo.final.txt
"""

import argparse
import re
import sys
from pathlib import Path

TS_RE = re.compile(r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})")


def parse_srt(path: Path) -> list[tuple[float, float, str]]:
    out = []
    for block in re.split(r"\n\s*\n", path.read_text(encoding="utf-8-sig").strip()):
        lines = block.strip().splitlines()
        ts_idx = next((i for i, ln in enumerate(lines) if "-->" in ln), None)
        if ts_idx is None:
            continue
        m = TS_RE.search(lines[ts_idx])
        if not m:
            continue
        g = [int(x) for x in m.groups()]
        start = g[0] * 3600 + g[1] * 60 + g[2] + g[3] / 1000
        end = g[4] * 3600 + g[5] * 60 + g[6] + g[7] / 1000
        text = "\n".join(lines[ts_idx + 1:]).strip()
        out.append((start, end, text))
    return out


def fmt_hms(seconds: float) -> str:
    # truncate to whole seconds after rounding to ms (matches the SRT-style HMS
    # convention where the seconds field is the integer floor of the timestamp)
    millis = int(round(max(0.0, seconds) * 1000))
    h, millis = divmod(millis, 3_600_000)
    m, millis = divmod(millis, 60_000)
    s, _ = divmod(millis, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--orig-srt", type=Path, required=True, help="Original sentence-level SRT (pre-cut)")
    p.add_argument("--cutlist", type=Path, required=True, help="Cut-list SRT (ranges removed by the cut)")
    p.add_argument("-o", "--output", type=Path, required=True, help="Output .txt (jemma-progressbar format)")
    args = p.parse_args(argv)

    if not args.orig_srt.exists() or not args.cutlist.exists():
        print("error: input file(s) not found", file=sys.stderr)
        return 1

    cuts = sorted((s, e) for s, e, _ in parse_srt(args.cutlist))
    sentences = parse_srt(args.orig_srt)

    def cut_before(t: float) -> float:
        return sum(min(e, t) - s for s, e in cuts if s < t)

    def fully_in_cut(s: float, e: float) -> bool:
        return any(cs <= s and e <= ce for cs, ce in cuts)

    out = []
    for s, e, text in sentences:
        if fully_in_cut(s, e):
            continue
        out.append(f"[{fmt_hms(s - cut_before(s))}] {text}")

    args.output.write_text("\n".join(out), encoding="utf-8")
    print(f"remapped {len(out)} / {len(sentences)} sentences → {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
