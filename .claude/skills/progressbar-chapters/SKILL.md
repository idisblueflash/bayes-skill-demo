---
name: progressbar-chapters
version: 0.1.0
description: Auto-generate a `chapters.json` (5–10-char Chinese titles, content-based boundaries) that drops into jemma-progressbar's Remotion components to render a step progress bar over a video. Trigger when the user wants to "make a progress bar for my video", "auto-chapter this demo", "generate chapters for the progress bar", or 「自動分章節」「給影片做進度條」「自動切章節」. Claude does the LLM chapter-splitting; jemma-progressbar's scripts/components do the transcription and rendering.
---

# Progressbar Chapters

Produce a `chapters.json` for jemma-progressbar (`{video_duration_sec, chapters:[{index,title,start_sec,end_sec,summary}]}`) by reading the video's transcript and splitting it into **3–7 content-based chapters**. The output drops straight into `ProgressSteps` (or any other Remotion component in `jemma-progressbar-main`) to render the bar over the video.

## Pipeline

1. **Get a transcript** of the target video (sentence-level, with `[HH:MM:SS]` timestamps).
2. **Split into chapters** (this is the LLM step — done by you, Claude, following the rules below).
3. **Write `chapters.json`** next to the video.
4. **Render** with jemma-progressbar's Remotion components.

## Stage 1 — Transcript

Pick the path that fits the situation:

- **Fresh video**, no transcript yet → use the upstream tool:
  ```bash
  python jemma-progressbar-main/scripts/transcribe.py <video>
  # produces <video>.srt and <video>.txt (the .txt has [HH:MM:SS] sentence per line — what you want)
  ```
  Requires `openai-whisper` (`bash jemma-progressbar-main/scripts/install-whisper.sh`).

- **Cut video** produced by the [[screencast-trimmer]] skill (the video is the result of a `cut_silence.py` pass) → don't re-transcribe; **remap** the pre-cut transcript to the post-cut timeline:
  ```bash
  python .claude/skills/progressbar-chapters/scripts/remap_for_cut.py \
      --orig-srt <original_sentence>.srt --cutlist <cutlist>.srt -o <final>.txt
  ```
  Fast (sub-second), reuses an accurate large-v3 transcript instead of paying for another 20+ min CPU pass.

- **Existing `.srt`/`.txt` with timestamps** → just feed it in.

## Stage 2 — LLM chapter split (you do this)

Read the `.txt` end-to-end, understand what the video is *about*, then split by **topic transitions, not by even time slicing**. Follow `jemma-progressbar-main/prompts/segment-to-progress.md`:

- **3–7 chapters** (too many = fragmented; too few = coarse).
- **Title: 5–10 Chinese chars**, content-focused — no position words (`开头` / `结尾` / `第一部分` / `总结`).
- **Summary: under ~10 chars**, declarative (no narrator voice like `介绍了…` / `讲到了…`).
- **start_sec / end_sec are integers** (seconds, not `"01:30"`).
- **Seamless**: chapter N `start_sec` = chapter N−1 `end_sec`. First chapter starts at 0; last chapter ends at `video_duration_sec`.
- `video_duration_sec` = ceiling of the last timestamp (or the muxed video's actual duration).

## Stage 3 — Write `chapters.json`

Schema (matches the prompt's example):

```json
{
  "video_duration_sec": 1171,
  "chapters": [
    { "index": 1, "title": "...", "start_sec": 0,   "end_sec": 99,   "summary": "..." },
    { "index": 2, "title": "...", "start_sec": 99,  "end_sec": 175,  "summary": "..." }
  ]
}
```

Save next to the video (e.g. `movie/<name>.chapters.json`).

## Stage 4 — Render with jemma-progressbar

Use the components in `jemma-progressbar-main/src/components/`:

```tsx
import progressData from './<name>.chapters.json';
import { ProgressSteps } from './src/components';

<ProgressSteps theme="jemma-purple" steps={progressData.chapters.map(c => c.title)} />
```

For a bar that advances with playback, tie it to the current frame's seconds:

```tsx
const currentChapter = progressData.chapters.findIndex(
  c => frame / fps >= c.start_sec && frame / fps < c.end_sec
);
```

Available themes: `jemma-purple`, `ocean-blue`, `forest-green`, `sunset-orange`, `mono-black`. See `jemma-progressbar-main/README.md`.

## Tips for good chapters

- Look for explicit transitions in the transcript (`那么我们…`, `OK 然后…`, change of subject, "now we…", etc.) — those mark the boundaries.
- Titles should let a viewer who skips to that chapter understand what's about to happen.
- Don't pad with framing chapters — if there's no real intro content, start with the first substantive topic.
- The video's actual duration (from ffprobe) is the source of truth for `video_duration_sec`; the last `[HH:MM:SS]` in the transcript can lag by a second or two.

## Script reference

| Script | Purpose |
|---|---|
| `remap_for_cut.py` | Translate an original sentence SRT + cut-list SRT into a post-cut `.txt` in jemma format (paired with [[screencast-trimmer]]). |
| `jemma-progressbar-main/scripts/transcribe.py` | Whisper transcribe to `.srt` + `.txt` (upstream tool). |
