#!/usr/bin/env python3
"""Transcribe audio/video to a per-word SRT using faster-whisper.

Emits one SRT cue per word with its own start/end time. For Chinese (no spaces),
Whisper's "words" come out roughly per-character / per-token, giving the per-字
granularity needed for karaoke-style subtitles. The output drops straight into
this project's merge_srt.py / cut_silence.py pipeline.

On Apple Silicon, CTranslate2 runs on CPU; --compute-type int8 is the fast path.
The model is downloaded and cached on first use (large-v3 is ~3 GB).

Example:
    python scripts/transcribe_words.py movie/bayes-demo.m4a
    python scripts/transcribe_words.py in.m4a -o words.srt --model medium --language zh
"""

import argparse
import sys
from pathlib import Path


def fmt_timestamp(seconds: float) -> str:
    if seconds < 0:
        seconds = 0.0
    millis = int(round(seconds * 1000))
    h, millis = divmod(millis, 3_600_000)
    m, millis = divmod(millis, 60_000)
    s, millis = divmod(millis, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{millis:03d}"


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("input", type=Path, help="Audio or video file (decoded via ffmpeg)")
    p.add_argument("-o", "--output", type=Path, default=None,
                   help="Output SRT path (default: <input>.words.srt)")
    p.add_argument("--model", default="large-v3",
                   help="Whisper model size/name (tiny|base|small|medium|large-v3, default: large-v3)")
    p.add_argument("--language", default="zh", help="Language code, e.g. zh, en (default: zh)")
    p.add_argument("--device", default="auto", help="auto|cpu|cuda (default: auto)")
    p.add_argument("--compute-type", default="int8",
                   help="CTranslate2 compute type, e.g. int8, int8_float16, float16 (default: int8)")
    p.add_argument("--beam-size", type=int, default=5, help="Beam size (default: 5)")
    p.add_argument("--no-vad", action="store_true",
                   help="Disable the VAD silence filter (on by default; helps timing on gappy audio)")
    args = p.parse_args(argv)

    if not args.input.exists():
        print(f"error: input not found: {args.input}", file=sys.stderr)
        return 1

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("error: faster-whisper not installed. Run:\n"
              "    .venv/bin/pip install faster-whisper", file=sys.stderr)
        return 1

    out_path = args.output or args.input.with_suffix(".words.srt")

    print(f"Loading model '{args.model}' (device={args.device}, compute={args.compute_type})…",
          file=sys.stderr)
    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)

    print(f"Transcribing {args.input} (language={args.language}, vad={not args.no_vad})…",
          file=sys.stderr)
    segments, info = model.transcribe(
        str(args.input),
        language=args.language,
        beam_size=args.beam_size,
        word_timestamps=True,
        vad_filter=not args.no_vad,
    )

    blocks: list[str] = []
    idx = 0
    for seg in segments:  # lazy generator — transcription happens here
        for w in (seg.words or []):
            if w.start is None or w.end is None:
                continue
            text = w.word.strip()
            if not text:
                continue
            end = max(w.end, w.start + 0.001)
            idx += 1
            blocks.append(f"{idx}\n{fmt_timestamp(w.start)} --> {fmt_timestamp(end)}\n{text}\n")
        # progress on stderr so stdout stays clean
        print(f"\r  {fmt_timestamp(seg.end)} · {idx} words", end="", file=sys.stderr, flush=True)

    print(file=sys.stderr)
    out_path.write_text("\n".join(blocks), encoding="utf-8")
    print(f"Wrote {idx} word cue(s) → {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
