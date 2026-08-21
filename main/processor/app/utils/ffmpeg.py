import os

import ffmpeg
from pathlib import Path
import subprocess

ASPECT_FILTERS = {
    "9:16": "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920",
    "16:9": "crop='min(iw,ih*16/9)':'min(ih,iw*9/16)',scale=1920:1080",
    "1:1":  "crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080",
    "4:5":  "crop='min(iw,ih*4/5)':'min(ih,iw*5/4)',scale=1080:1350",
}

class FFMPEG:
    def __init__(self):
        self.ffmpeg = ffmpeg

    def extract_audio(self, video_path: str, audio_path: str, from_: float, to: float):
        try:
            self.ffmpeg.input(video_path).output(audio_path).ss(from_).t(to).run()
        except ffmpeg.Error as e:
            print(f"Error extracting audio: {e.stderr.decode('utf-8')}")
            raise e
        except Exception as e:
            print(f"Error extracting audio: {e}")
            raise e

    def extract_clips(self, original_video_path: str, clips_path: str, metadata: dict):
        os.makedirs(clips_path, exist_ok=True)
        aspect_ratio = metadata.get("aspect_ratio", "9:16")
        moments = metadata.get("moments") or []
        subtitles = metadata.get("subtitles") or []
        bg_music = metadata.get("bg_music") or None
        layout = metadata.get("layout") or None

        crop_scale = ASPECT_FILTERS.get(aspect_ratio, ASPECT_FILTERS["9:16"])

        for i, moment in enumerate(moments):
            start, end = moment.get("start"), moment.get("end")
            if start is None or end is None or end <= start:
                continue

            duration = end - start
            output_path = os.path.join(clips_path, f"clip_{i + 1}.mp4")
            subtitle_path = subtitles[i] if i < len(subtitles) else None
            has_subs = bool(subtitle_path and os.path.exists(subtitle_path))

            vf = crop_scale
            if has_subs:
                ass_escaped = str(Path(subtitle_path).resolve()).replace(":", r"\:").replace("'", r"\'")
                vf = f"{crop_scale},ass='{ass_escaped}'"

            cmd = [
                "ffmpeg", "-y",
                "-ss", str(start), "-i", original_video_path, "-t", str(duration),
                "-vf", vf,
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "128k",
                output_path,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Error extracting clip {i + 1}: {result.stderr[-2000:]}")
                raise RuntimeError(result.stderr[-2000:])

            print(f"Extracted clip {start} → {end} -> {output_path}")
