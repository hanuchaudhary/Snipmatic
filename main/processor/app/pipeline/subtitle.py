import os
import re

from app.utils.config import DOWNLOAD_PATH
import subprocess
from pathlib import Path

WORDS_PER_CHUNK = 4
PLAY_RES_X = 1080
PLAY_RES_Y = 1920

ASS_HEADER = """[Script Info]
Title: Clip {index}
ScriptType: v4.00+
PlayResX: {play_res_x}
PlayResY: {play_res_y}
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial Black,72,&H00FFFFFF,&H0000FFFF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,4,0,2,80,80,180,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _format_ass_time(seconds: float) -> str:
    seconds = max(0.0, seconds)
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centiseconds = int(round((seconds - int(seconds)) * 100))
    if centiseconds == 100:
        secs += 1
        centiseconds = 0
        if secs == 60:
            secs = 0
            minutes += 1
            if minutes == 60:
                minutes = 0
                hours += 1
    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def _escape_ass_text(text: str) -> str:
    text = text.strip()
    text = text.replace("\\", r"\\")
    text = text.replace("{", r"\{").replace("}", r"\}")
    text = re.sub(r"\s+", " ", text)
    return text


def _collect_words(transcript: dict) -> list[dict]:
    words = []
    for segment in transcript.get("segments") or []:
        for word in segment.get("words") or []:
            text = (word.get("text") or "").strip()
            start = word.get("start")
            end = word.get("end")
            if not text or start is None or end is None:
                continue
            words.append({"text": text, "start": float(start), "end": float(end)})
    return words


def _words_for_clip(words: list[dict], clip_start: float, clip_end: float) -> list[dict]:
    clip_words = []
    for word in words:
        if word["start"] < clip_end and word["end"] > clip_start:
            start = max(0.0, word["start"] - clip_start)
            end = min(clip_end - clip_start, word["end"] - clip_start)
            if end > start:
                clip_words.append({
                    "text": word["text"],
                    "start": start,
                    "end": end,
                })
    return clip_words


def _chunk_words(words: list[dict]) -> list[list[dict]]:
    chunks = []
    for i in range(0, len(words), WORDS_PER_CHUNK):
        chunk = words[i:i + WORDS_PER_CHUNK]
        if chunk:
            chunks.append(chunk)
    return chunks


def _karaoke_text(chunk: list[dict]) -> str:
    parts = []
    for word in chunk:
        duration_cs = max(1, int(round((word["end"] - word["start"]) * 100)))
        parts.append(f"{{\\k{duration_cs}}}{_escape_ass_text(word['text'])}")
    return " ".join(parts)


def build_ass(words: list[dict], index: int) -> str:
    lines = [ASS_HEADER.format(index=index, play_res_x=PLAY_RES_X, play_res_y=PLAY_RES_Y)]
    for chunk in _chunk_words(words):
        start = chunk[0]["start"]
        end = chunk[-1]["end"]
        if end <= start:
            continue
        lines.append(
            f"Dialogue: 0,{_format_ass_time(start)},{_format_ass_time(end)},Default,,0,0,0,,{_karaoke_text(chunk)}\n"
        )
    return "".join(lines)


def create_subtitles(transcript: dict, moments: list, output_dir: str = DOWNLOAD_PATH) -> list[str]:
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
            f.write(build_ass(clip_words, i))
        ass_paths.append(ass_path)
        print(f"Created subtitles for clip {i}: {ass_path}")

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

def burn_ass(video_path: str, ass_path: str, output_path: str):
    """Burn .ass subtitles using ffmpeg's libass filter (fast, respects styles + karaoke)."""
    ass_escaped = str(Path(ass_path).resolve()).replace(":", r"\:").replace("'", r"\'")

    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vf", f"ass='{ass_escaped}'",
        "-c:v", "libx264", "-preset", "medium", "-crf", "20",
        "-c:a", "copy",
        output_path,
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ass burn failed: {result.stderr[-2000:]}")
