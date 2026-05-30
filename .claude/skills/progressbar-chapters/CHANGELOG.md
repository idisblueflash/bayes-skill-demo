# 更新日誌

記錄 `progressbar-chapters` 每次版本的重要變更。

## [0.1.0] - 2026-05-30

### 新增
- 首次發布：自動為影片切章節並產出 `chapters.json`，可直接餵給 [jemma-progressbar](https://github.com/) 的 Remotion 元件渲染步驟進度條
- LLM（Claude）負責讀字幕、按話題轉折切 3–7 章，每章給 5–10 字的中文標題與一句概括，嚴格遵守 jemma `segment-to-progress.md` prompt 規範
- 內附 `remap_for_cut.py`：當影片是 [[screencast-trimmer]] 剪過的版本時，用「原始句字幕 + 剪輯範圍」直接重映射時間軸，省下對剪輯後影片重跑 20 分鐘以上的 Whisper
- 字幕來源支援三條路徑：jemma 內建 `transcribe.py`（全新影片）、`remap_for_cut.py`（剪過的影片）、現成的 SRT/TXT
