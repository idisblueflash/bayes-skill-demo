#!/usr/bin/env python3
"""Merge two or more SRT files into one, ordered by start time.

Typical use: weave silence/dead-air cues (from detect_silence_srt.py) into a
transcript SRT so you get a single chronological timeline.

By default the merge is lossless: every cue keeps its original timing, so cues
may overlap (auto-generated transcripts often pad each cue up to the next, which
means silence ranges sit *inside* a transcript cue). Pass --clip to trim each
cue's end to the next cue's start, producing a clean non-overlapping SRT.

Example:
    python scripts/merge_srt.py movie/bayes-demo.srt movie/bayes-demo.silence.srt -o movie/bayes-demo.merged.srt
    python scripts/merge_srt.py a.srt b.srt -o out.srt --clip
"""

import argparse
import re
import sys
from pathlib import Path

TS_RE = re.compile(
    r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})"
)


def parse_srt(path: Path) -> list[tuple[float, float, str]]:
    """Parse an SRT file into a list of (start, end, text) tuples (seconds)."""
    cues: list[tuple[float, float, str]] = []
    raw = path.read_text(encoding="utf-8-sig").strip()
    if not raw:
        return cues
    for block in re.split(r"\n\s*\n", raw):
        lines = block.strip().splitlines()
        if len(lines) < 2:
            continue
        # The timestamp line is the first line containing "-->".
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
        cues.append((start, end, text))
    return cues


def fmt_timestamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0.0
    millis = int(round(seconds * 1000))
    h, millis = divmod(millis, 3_600_000)
    m, millis = divmod(millis, 60_000)
    s, millis = divmod(millis, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{millis:03d}"


def clip_overlaps(cues: list[tuple[float, float, str]]) -> list[tuple[float, float, str]]:
    """Trim each cue's end to the next cue's start so nothing overlaps."""
    out: list[tuple[float, float, str]] = []
    for i, (start, end, text) in enumerate(cues):
        if i + 1 < len(cues):
            next_start = cues[i + 1][0]
            if end > next_start:
                end = max(start + 0.001, next_start)
        out.append((start, end, text))
    return out


def write_srt(cues: list[tuple[float, float, str]], out_path: Path) -> None:
    blocks = [
        f"{i}\n{fmt_timestamp(s)} --> {fmt_timestamp(e)}\n{t}\n"
        for i, (s, e, t) in enumerate(cues, start=1)
    ]
    out_path.write_text("\n".join(blocks), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("inputs", type=Path, nargs="+", help="Two or more SRT files to merge")
    p.add_argument("-o", "--output", type=Path, required=True, help="Output SRT path")
    p.add_argument("--clip", action="store_true",
                   help="Trim overlapping cue ends so the output never overlaps")
    args = p.parse_args(argv)

    if len(args.inputs) < 2:
        print("error: provide at least two SRT files to merge", file=sys.stderr)
        return 1

    all_cues: list[tuple[float, float, str]] = []
    for path in args.inputs:
        if not path.exists():
            print(f"error: input not found: {path}", file=sys.stderr)
            return 1
        all_cues.extend(parse_srt(path))

    all_cues.sort(key=lambda c: (c[0], c[1]))
    if args.clip:
        all_cues = clip_overlaps(all_cues)

    write_srt(all_cues, args.output)
    print(f"Merged {len(args.inputs)} files → {len(all_cues)} cues → {args.output}"
          + (" (clipped)" if args.clip else " (lossless)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
