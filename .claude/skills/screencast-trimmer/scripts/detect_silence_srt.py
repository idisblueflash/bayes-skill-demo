#!/usr/bin/env python3
"""Detect non-vocal (silent) ranges in an audio/video file and write them as an SRT.

Uses ffmpeg's `silencedetect` audio filter to locate quiet ranges, then emits one
SRT cue per silent range. Reusable across projects.

Example:
    python scripts/detect_silence_srt.py movie/bayes-demo.m4a
    python scripts/detect_silence_srt.py input.mp4 -o gaps.srt --noise -35dB --min-duration 1.0
"""

import argparse
import re
import subprocess
import sys
from pathlib import Path

SILENCE_START_RE = re.compile(r"silence_start:\s*(-?[\d.]+)")
SILENCE_END_RE = re.compile(r"silence_end:\s*(-?[\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)")


def media_duration(path: Path) -> float | None:
    """Return media duration in seconds via ffprobe, or None if unavailable."""
    try:
        out = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                str(path),
            ],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
        return float(out)
    except (subprocess.CalledProcessError, ValueError):
        return None


def detect_silences(path: Path, noise: str, min_duration: float) -> list[tuple[float, float]]:
    """Run ffmpeg silencedetect and return a list of (start, end) silent ranges in seconds."""
    proc = subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-nostats",
            "-i", str(path),
            "-af", f"silencedetect=noise={noise}:d={min_duration}",
            "-f", "null", "-",
        ],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        raise RuntimeError(f"ffmpeg failed:\n{proc.stderr}")

    # silencedetect writes to stderr
    log = proc.stderr
    ranges: list[tuple[float, float]] = []
    pending_start: float | None = None

    for line in log.splitlines():
        if (m := SILENCE_START_RE.search(line)) is not None:
            pending_start = max(0.0, float(m.group(1)))
        elif (m := SILENCE_END_RE.search(line)) is not None:
            end = float(m.group(1))
            start = pending_start if pending_start is not None else end - float(m.group(2))
            ranges.append((max(0.0, start), end))
            pending_start = None

    # A trailing silence that runs to EOF has no silence_end line; close it at duration.
    if pending_start is not None:
        dur = media_duration(path)
        if dur is not None and dur > pending_start:
            ranges.append((pending_start, dur))

    return ranges


def fmt_timestamp(seconds: float) -> str:
    """Format seconds as SRT timestamp HH:MM:SS,mmm."""
    if seconds < 0:
        seconds = 0.0
    millis = int(round(seconds * 1000))
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    secs, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def write_srt(ranges: list[tuple[float, float]], out_path: Path) -> None:
    blocks = []
    for idx, (start, end) in enumerate(ranges, start=1):
        gap = end - start
        blocks.append(
            f"{idx}\n"
            f"{fmt_timestamp(start)} --> {fmt_timestamp(end)}\n"
            f"[silence {gap:.2f}s]\n"
        )
    out_path.write_text("\n".join(blocks), encoding="utf-8")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", type=Path, help="Path to the audio/video file")
    parser.add_argument("-o", "--output", type=Path, default=None,
                        help="Output SRT path (default: <input>.silence.srt)")
    parser.add_argument("--noise", default="-30dB",
                        help="Silence threshold, e.g. -30dB or 0.001 (default: -30dB)")
    parser.add_argument("--min-duration", type=float, default=0.5,
                        help="Minimum silence length in seconds to report (default: 0.5)")
    args = parser.parse_args(argv)

    if not args.input.exists():
        print(f"error: input not found: {args.input}", file=sys.stderr)
        return 1

    out_path = args.output or args.input.with_suffix(args.input.suffix + ".silence.srt")

    ranges = detect_silences(args.input, args.noise, args.min_duration)
    write_srt(ranges, out_path)

    total = sum(end - start for start, end in ranges)
    print(f"Found {len(ranges)} silent range(s), {total:.1f}s total → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
