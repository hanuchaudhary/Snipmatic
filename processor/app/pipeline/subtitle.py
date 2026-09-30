import logging
import os
import re
import subprocess
from pathlib import Path

from app.utils.config import DOWNLOAD_PATH

logger = logging.getLogger(__name__)

WORDS_PER_CHUNK = 4
MAX_CHUNK_CHARS = 28
MAX_GAP_S = 0.7
MIN_WORD_S = 0.04
SYNC_OFFSET_S = 0.0
SENTENCE_END = (".", "?", "!")
PLAY_RES_X = 1080
PLAY_RES_Y = 1920
X264_PRESET = "medium"
X264_CRF = 20

ASS_HEADER = """[Script Info]
Title: Clip {index}
ScriptType: v4.00+
PlayResX: {play_res_x}
PlayResY: {play_res_y}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{font_path},92,&H00ffffff,&H0000ff4d,&H00000000,&H00000000,0,0,0,0,100,100,1,0,3,7,5.5,2,60,60,280,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _cs(seconds: float) -> int:
    return int(round(seconds * 100))


def _format_ass_time(seconds: float) -> str:
    total = max(0, _cs(seconds))
    hours, rem = divmod(total, 360000)
    minutes, rem = divmod(rem, 6000)
    secs, centiseconds = divmod(rem, 100)
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def _clean_text(text: str) -> str:
    text = re.sub(r"[\\{}]", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _collect_words(transcript: dict) -> list[dict]:
    words = []
    for segment in transcript.get("segments") or []:
        for word in segment.get("words") or []:
            text = _clean_text(word.get("text") or "")
            start = word.get("start")
            end = word.get("end")
            if not text or start is None or end is None:
                continue
            start = float(start)
            end = max(float(end), start + MIN_WORD_S)
            words.append({"text": text, "start": start, "end": end})

    words.sort(key=lambda w: w["start"])
    for cur, nxt in zip(words, words[1:]):
        if cur["end"] > nxt["start"]:
            cur["end"] = max(cur["start"] + MIN_WORD_S, nxt["start"])
            if nxt["start"] < cur["end"]:
                nxt["start"] = cur["end"]
                nxt["end"] = max(nxt["end"], nxt["start"] + MIN_WORD_S)
    return words


def _words_for_clip(words: list[dict], clip_start: float, clip_end: float) -> list[dict]:
    duration = clip_end - clip_start
    clip_words = []
    for word in words:
        if word["start"] >= clip_end:
            break
        if word["end"] <= clip_start:
            continue
        start = max(0.0, word["start"] - clip_start + SYNC_OFFSET_S)
        end = min(duration, word["end"] - clip_start + SYNC_OFFSET_S)
        if end > start:
            clip_words.append({"text": word["text"], "start": start, "end": end})
    return clip_words


def _chunk_words(words: list[dict]) -> list[list[dict]]:
    chunks = []
    current = []
    chars = 0
    for word in words:
        if current:
            gap = word["start"] - current[-1]["end"]
            if (
                len(current) >= WORDS_PER_CHUNK
                or gap > MAX_GAP_S
                or chars + 1 + len(word["text"]) > MAX_CHUNK_CHARS
                or current[-1]["text"].endswith(SENTENCE_END)
            ):
                chunks.append(current)
                current = []
                chars = 0
        chars += len(word["text"]) + (1 if current else 0)
        current.append(word)
    if current:
        chunks.append(current)
    return chunks


def _karaoke_text(chunk: list[dict]) -> str:
    parts = []
    for i, word in enumerate(chunk):
        start_cs = _cs(word["start"])
        end_cs = _cs(chunk[i + 1]["start"]) if i + 1 < len(chunk) else _cs(word["end"])
        duration_cs = max(1, end_cs - start_cs)
        parts.append(f"{{\\k{duration_cs}}}{word['text']}")
    return " ".join(parts)


def build_ass(words: list[dict], index: int, font_path: str = None) -> str:
    lines = [ASS_HEADER.format(index=index, play_res_x=PLAY_RES_X, play_res_y=PLAY_RES_Y, font_path=font_path)]
    if font_path:
        lines.append(f"Style: Default,{font_path},92,&H00ffffff,&H0000ff4d,&H00000000,&H00000000,0,0,0,0,100,100,1,0,3,7,5.5,2,60,60,280,1")
    else:
        lines.append(f"Style: Default,Arial Black,72,&H00FFFFFF,&H0000FFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,4,0,2,80,80,180,1")
    for chunk in _chunk_words(words):
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        if _cs(end) <= _cs(start):
            continue
        lines.append(
            f"Dialogue: 0,{_format_ass_time(start)},{_format_ass_time(end)},Default,,0,0,0,,{_karaoke_text(chunk)}\n"
        )
    return "".join(lines)


def create_subtitles(transcript: dict, moments: list, output_dir: str = DOWNLOAD_PATH, font_path: str = None) -> list[str]:
    os.makedirs(output_dir, exist_ok=True)
    all_words = _collect_words(transcript)
    ass_paths = []

    for i, moment in enumerate(moments, start=1):
        start = moment.get("start")
        end = moment.get("end")
        if start is None or end is None or end <= start:
            continue

        clip_words = _words_for_clip(all_words, float(start), float(end))
        ass_path = os.path.join(output_dir, f"clip_{i}.ass")
        with open(ass_path, "w", encoding="utf-8") as f:
            f.write(build_ass(clip_words, i, font_path))
        ass_paths.append(ass_path)
        logger.info("Created subtitles for clip %s: %s", i, ass_path)

    return ass_paths


def _parse_ass_time(value: str) -> float:
    hours, minutes, rest = value.split(":")
    return int(hours) * 3600 + int(minutes) * 60 + float(rest)


def parse_ass_events(ass_path: str) -> list[dict]:
    events = []
    with open(ass_path, encoding="utf-8") as f:
        for line in f:
            if not line.startswith("Dialogue:"):
                continue
            parts = line.strip().split(",", 9)
            if len(parts) < 10:
                continue
            start = _parse_ass_time(parts[1])
            end = _parse_ass_time(parts[2])
            words = []
            t = start
            for match in re.finditer(r"\{\\k(\d+)\}([^\{]*)", parts[9]):
                duration = int(match.group(1)) / 100.0
                text = match.group(2).strip()
                if text:
                    words.append({"text": text, "start": t, "end": t + duration})
                t += duration
            if words:
                events.append({"start": start, "end": end, "words": words})
    return events


def burn_ass(video_path: str, ass_path: str, output_path: str, fonts_dir: str | None = None):
    ass_file = Path(ass_path).resolve()
    video_file = Path(video_path).resolve()
    out_file = Path(output_path).resolve()

    vf = f"ass={ass_file.name}"
    if fonts_dir:
        fonts = str(Path(fonts_dir).resolve()).replace("\\", "/").replace(":", r"\:")
        vf += f":fontsdir='{fonts}'"

    cmd = [
        "ffmpeg", "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(video_file),
        "-vf", vf,
        "-c:v", "libx264", "-preset", X264_PRESET, "-crf", str(X264_CRF),
        "-pix_fmt", "yuv420p",
        "-c:a", "copy",
        "-movflags", "+faststart",
        str(out_file),
    ]

    result = subprocess.run(cmd, capture_output=True, text=True, cwd=ass_file.parent)
    if result.returncode != 0:
        raise RuntimeError(f"ass burn failed: {result.stderr[-2000:]}")