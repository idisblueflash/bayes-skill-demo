#!/usr/bin/env python3
"""Cut silent ranges out of a video using an SRT of silence cues.

Reads silence ranges from an SRT (any cue whose text starts with "[silence" — as
produced by detect_silence_srt.py / merge_srt.py; if no such cues exist, every
cue is treated as a range to remove), computes the complementary "keep" segments,
and re-encodes them into a single output via one ffmpeg select/aselect filtergraph
so audio and video stay in sync.

Example:
    python scripts/cut_silence.py movie/bayes-demo.mov movie/bayes-demo.merged.srt -o movie/bayes-demo.cut.mov
    python scripts/cut_silence.py in.mov silence.srt -o out.mov --pad 0.15
"""

import argparse
import re
import subprocess
import sys
import tempfile
from pathlib import Path

TS_RE = re.compile(r"(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})")


def parse_silence_ranges(path: Path) -> list[tuple[float, float]]:
    """Return silence ranges (start, end) in seconds from an SRT file."""
    raw = path.read_text(encoding="utf-8-sig").strip()
    labelled: list[tuple[float, float]] = []
    every: list[tuple[float, float]] = []
    for block in re.split(r"\n\s*\n", raw):
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
        every.append((start, end))
        if text.lower().startswith("[silence"):
            labelled.append((start, end))
    return labelled or every


def media_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    return float(out)


def video_fps(path: Path) -> float:
    """Container frame rate (r_frame_rate) used as the CFR target. Defaults to 60."""
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=r_frame_rate",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        capture_output=True, text=True, check=True,
    ).stdout.strip()
    try:
        num, den = out.split("/")
        return float(num) / float(den)
    except (ValueError, ZeroDivisionError):
        return 60.0


def merge_ranges(ranges: list[tuple[float, float]], pad: float) -> list[tuple[float, float]]:
    """Shrink each silence range by `pad` on both ends, then merge overlaps."""
    shrunk = []
    for s, e in ranges:
        s2, e2 = s + pad, e - pad
        if e2 > s2:
            shrunk.append((s2, e2))
    shrunk.sort()
    merged: list[tuple[float, float]] = []
    for s, e in shrunk:
        if merged and s <= merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


def keep_segments(silence: list[tuple[float, float]], duration: float) -> list[tuple[float, float]]:
    """Complement of the silence ranges over [0, duration]."""
    segs: list[tuple[float, float]] = []
    cursor = 0.0
    for s, e in silence:
        if s > cursor:
            segs.append((cursor, s))
        cursor = max(cursor, e)
    if cursor < duration:
        segs.append((cursor, duration))
    return [(s, e) for s, e in segs if e - s > 0.001]


def build_filter(segs: list[tuple[float, float]], fps: float) -> str:
    expr = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in segs)
    # Force constant frame rate first: ReplayKit/screen recordings are VFR, and
    # select+setpts=N/FRAME_RATE/TB only stays in sync with the (sample-accurate)
    # audio when the video is truly CFR.
    return (
        f"[0:v]fps={fps:.6f},select='{expr}',setpts=N/FRAME_RATE/TB[v];"
        f"[0:a]aselect='{expr}',asetpts=N/SR/TB[a]"
    )


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("video", type=Path, help="Source video file")
    p.add_argument("srt", type=Path, help="SRT containing silence ranges")
    p.add_argument("-o", "--output", type=Path, required=True, help="Output video path")
    p.add_argument("--pad", type=float, default=0.1,
                   help="Seconds of silence to keep at each cut edge (default: 0.1)")
    p.add_argument("--crf", type=int, default=18, help="x264 quality, lower=better (default: 18)")
    p.add_argument("--preset", default="veryfast", help="x264 speed preset (default: veryfast)")
    p.add_argument("--end", type=float, default=None,
                   help="Only process the first N seconds of the source (for quick test runs)")
    args = p.parse_args(argv)

    for f in (args.video, args.srt):
        if not f.exists():
            print(f"error: not found: {f}", file=sys.stderr)
            return 1

    duration = media_duration(args.video)
    if args.end is not None:
        duration = min(duration, args.end)
    fps = video_fps(args.video)

    silence = merge_ranges(parse_silence_ranges(args.srt), args.pad)
    silence = [(max(0.0, s), min(e, duration)) for s, e in silence if s < duration and e > 0]
    segs = keep_segments(silence, duration)
    if not segs:
        print("error: nothing left to keep after cutting", file=sys.stderr)
        return 1

    removed = duration - sum(e - s for s, e in segs)
    print(f"Source {duration:.1f}s (fps {fps:.2f}) → keeping {len(segs)} segment(s), "
          f"removing {removed:.1f}s ({removed / duration * 100:.0f}%)")

    with tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False) as fh:
        fh.write(build_filter(segs, fps))
        filter_path = fh.name

    cmd = ["ffmpeg", "-y", "-hide_banner"]
    if args.end is not None:
        cmd += ["-t", f"{args.end:.3f}"]  # limit decoding to speed up test runs
    cmd += [
        "-i", str(args.video),
        "-filter_complex_script", filter_path,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", args.preset, "-crf", str(args.crf),
        "-fps_mode", "passthrough",
        "-c:a", "aac", "-b:a", "192k",
        str(args.output),
    ]
    print("Running ffmpeg (re-encoding)…")
    proc = subprocess.run(cmd)
    Path(filter_path).unlink(missing_ok=True)
    if proc.returncode != 0:
        print("error: ffmpeg failed", file=sys.stderr)
        return proc.returncode

    print(f"Done → {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
