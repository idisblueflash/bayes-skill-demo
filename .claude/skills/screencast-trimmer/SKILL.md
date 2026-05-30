---
name: screencast-trimmer
version: 0.2.0
description: Turn a raw screen-recording / demo video into a tight cut by removing dead air, spoken filler, and non-essential clauses while keeping audio and video in sync. Trigger when the user wants to "tighten this demo video", "cut the silence / dead air", "remove filler words", "trim my screencast", "make a tighter demo", or 「幫我剪掉影片的空白」「把這個 demo 影片剪緊一點」「去掉口頭禪」. Works on any talking-head or screencast where there are pauses (e.g. waiting on an AI) and verbal filler to remove.
---

# Screencast Trimmer

Convert a long, loosely-paced screen recording into a tight demo. The workflow removes three layers, each optional and additive:

1. **Dead air** — silent ranges (e.g. waiting on an AI to respond).
2. **Spoken filler** — 语气词 / 口头禅 / repetitions / false starts.
3. **Non-essential clauses** — redundant restatements, meta-narration, tangents (an editorial judgment *you* make as the LLM).

All cuts are collected into a single time-range list and applied **once** from the original file, then verified for A/V sync.

## Prerequisites

- `ffmpeg` + `ffprobe` on PATH.
- `faster-whisper` installed in the project `.venv` (only needed for the filler / editorial layers): `uv pip install --python .venv/bin/python faster-whisper`.
- Scripts live in `.claude/skills/screencast-trimmer/scripts/`. Below, `SK=.claude/skills/screencast-trimmer/scripts`.

## ⚠️ Critical learnings (read before cutting)

1. **Screen recordings are usually VFR — this desyncs audio if cut naively.** ReplayKit/screen captures report a constant `r_frame_rate` (e.g. 60) but a lower real `avg_frame_rate` (e.g. 44). A `select,setpts=N/FRAME_RATE/TB` filter then packs frames at the wrong rate and video drifts ahead of audio. `cut_silence.py` already forces CFR with an `fps` filter before selecting. **Always confirm afterward that the output's video and audio stream durations match** (see Stage 6).
2. **Quiet recordings need a lower silence threshold.** Run `volumedetect` first. If `mean_volume` is around −40 dB, the default `-30dB` flags speech as silence. Set `--noise` a few dB *below* the mean (e.g. `--noise=-45dB`). Pass it with `=` because a leading `-` looks like a flag.
3. **Cut once, from the original.** Filler and editorial timestamps are on the *original* timeline. Never stack a second cut on an already-cut file — combine all ranges into one list and cut the original.
4. **Confirm editorial removals before encoding.** Removing whole clauses changes content; show the candidate clauses (text + duration + reason) and get the user's OK first. Dead-air and obvious-filler cuts are low-risk; clause cuts are not.
5. **Test on a slice first.** Use `cut_silence.py --end 600` (and transcribe a 10-min clip) to validate before committing to a full re-encode.

## Stage 1 — Probe

```bash
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,r_frame_rate -of default=noprint_wrappers=1 INPUT
ffprobe -v error -select_streams v:0 -show_entries stream=avg_frame_rate -of default=noprint_wrappers=1 INPUT   # VFR check: avg vs r_frame_rate
ffmpeg -hide_banner -nostats -i INPUT -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"        # threshold tuning
```

## Stage 2 — Detect dead air

```bash
python3 $SK/detect_silence_srt.py INPUT --noise=-45dB --min-duration 2 -o OUT.silence.srt
```
- `--noise` from Stage 1 (below mean_volume). `--min-duration` 2 ≈ real dead air; 0.5 also catches breath pauses.
- Output: one cue per silent range, labeled `[silence N.NNs]`.

## Stage 3 — Per-word transcript (only for filler / editorial layers)

```bash
.venv/bin/python $SK/transcribe_words.py INPUT --model large-v3 --language zh -o OUT.words.srt
```
- Emits **one cue per word**, each with its own start/end. For Chinese (no spaces), words are per-字 / per-token — exactly the granularity needed.
- `large-v3` is a ~3 GB first-time download and runs on CPU (int8) on Apple Silicon — slow but accurate; `base`/`small` for quick checks. Validate on a short clip first.

## Stage 4 — Editorial pass (you, the LLM)

Reconstruct sentences from the word SRT (join tokens in index order; you already have the timestamps per cue) and classify:

**Filler tiers** (per word/token):
- **Tier A (safe to cut):** repetitions (`我觉得我觉得`), false starts (`把这个第一把这个`), 语气词 (`呢`/`嗯`/`啊`), stray `OK`. Clean to remove from audio.
- **Tier B (aggressive, choppy):** discourse glue — `然后`, `那`, `好`, `那么`, `这个`, `就是`. These hold sentences together; cutting many sub-0.5 s words makes jump-cuts. Prefer Tier B for *display-subtitle* cleanup, not audio cutting.

**Non-essential clauses** (the high-value layer): redundant restatements, meta-narration ("I'll tell it to…"), tangential backstory, abandoned false starts. **Keep** the substantive steps. Flag genuinely borderline calls (e.g. content that shows interactivity, or repetition that demonstrates iteration) and let the user decide.

For the per-word filler layer, use the heuristic classifier (covers Tier A + G2 + G3 of the saved cutting profile — duplicates, standalone `OK`/`呢`, G2 fillers, `第N→第M` corrections, repeat-start false starts):
```bash
python3 $SK/classify_filler.py OUT.words.srt -o drop_idx.json --review review.filler.srt
```
This is a fast, deterministic first pass — review the output and add/remove indices as needed. For sentence-level editorial removal (if ever invoked), do that judgment yourself and store as data (e.g. `filler_idx.json` with named lists). Then materialize a reviewable cut-list with `select_cues.py`:
```bash
python3 $SK/select_cues.py OUT.words.srt --indices @filler_idx.json --keys tierA -o review.filler.srt
python3 $SK/select_cues.py OUT.words.srt --indices @filler_idx.json --invert -o cleaned.transcript.srt   # for display subtitles
```
Present clause candidates as a table (`[idx-range] mm:ss-mm:ss (Ns) reason “text”`) and confirm before proceeding.

## Stage 5 — Build the combined cut-list

Union all ranges to remove — silence (shrink each by your pad for breathing room), Tier A filler word ranges, and confirmed editorial clause spans — then merge overlaps and write an SRT where **no cue text starts with `[silence`** (use e.g. `[cut]`). That matters: `cut_silence.py` removes only `[silence`-labeled cues *if any exist*, otherwise it removes **every** cue — so a uniformly-labeled cut-list makes it remove all of them.

(Do this in a short inline Python step: parse the SRTs, collect ranges, sort, merge `if s <= prev_end`, write the SRT.)

## Stage 6 — Cut once + verify sync

```bash
python3 $SK/cut_silence.py INPUT cutlist.srt -o OUT.mov --pad 0          # pad 0: padding already baked into the ranges
ffprobe -v error -show_entries stream=codec_type,duration -of default=noprint_wrappers=1 OUT.mov
```
The two stream durations **must match within ~0.1 s**. If video is ~25 % shorter than audio, the VFR/CFR fix didn't apply — stop and investigate. `Non-monotonic DTS` warnings at cut boundaries are harmless as long as durations match.

`cut_silence.py` re-encodes (CRF 18, veryfast) — necessary for frame-accurate concatenation. Use `--end N` to limit to the first N seconds for a test.

## Script reference

| Script | Purpose | Key flags |
|---|---|---|
| `detect_silence_srt.py` | silent ranges → SRT | `--noise=-45dB --min-duration 2` |
| `transcribe_words.py` | per-word SRT (faster-whisper) | `--model large-v3 --language zh` |
| `classify_filler.py` | heuristic Tier A + G2 + G3 → drop-idx JSON | `--review` for human-readable cut-list |
| `select_cues.py` | pick/drop SRT cues by index | `--indices @f.json --keys tierA --invert` |
| `merge_srt.py` | weave SRTs by timestamp | `--clip` (non-overlapping) |
| `cut_silence.py` | remove ranges from video (CFR-safe) | `--pad --end --crf --preset` |

## Typical flow

1. Probe (duration, VFR, volume).
2. Detect silence → silence SRT.
3. (optional) Transcribe per-word; do the editorial pass; confirm clauses.
4. Build one combined cut-list.
5. Cut once from the original; verify A/V sync.
6. Iterate: ask if more clauses can go (diminishing returns — name the tradeoffs).
