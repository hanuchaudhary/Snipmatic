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
FFMPEG_BINARY = os.environ.get("FFMPEG_BINARY") or "ffmpeg"

class FFMPEG:
    def __init__(self):
        self.ffmpeg = ffmpeg

    def extract_audio(self, video_path: str, audio_path: str, from_: float | None = None, to: float | None = None):
        try:
            input_kwargs = {}
            output_kwargs = {}
            if from_ is not None:
                input_kwargs["ss"] = from_
            if to is not None and from_ is not None:
                output_kwargs["t"] = to - from_
            elif to is not None:
                output_kwargs["t"] = to
            self.ffmpeg.input(video_path, **input_kwargs).output(audio_path, **output_kwargs).run(cmd=FFMPEG_BINARY)
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
        source_offset = float(metadata.get("source_offset") or 0)
        fonts_dir = metadata.get("fonts_dir")
        outputs = []

        crop_scale = ASPECT_FILTERS.get(aspect_ratio, ASPECT_FILTERS["9:16"])

        for i, moment in enumerate(moments):
            start, end = moment.get("start"), moment.get("end")
            if start is None or end is None or end <= start:
                continue

            duration = end - start
            output_path = os.path.join(clips_path, f"clip_{i + 1}.mp4")
            thumbnail_path = os.path.join(clips_path, f"clip_{i + 1}.jpg")
            subtitle_path = subtitles[i] if i < len(subtitles) else None
            has_subs = bool(subtitle_path and os.path.exists(subtitle_path))

            vf = crop_scale
            if has_subs:
                ass_escaped = str(Path(subtitle_path).resolve()).replace(":", r"\:").replace("'", r"\'")
                fonts = f":fontsdir='{str(Path(fonts_dir).resolve())}'" if fonts_dir else ""
                vf = f"{crop_scale},ass='{ass_escaped}'{fonts}"

            cmd = [
                FFMPEG_BINARY, "-y",
                "-ss", str(source_offset + start), "-i", original_video_path, "-t", str(duration),
                "-vf", vf,
                "-c:v", "libx264", "-preset", "medium", "-crf", "20",
                "-c:a", "aac", "-b:a", "128k",
                output_path,
            ]

            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Error extracting clip {i + 1}: {result.stderr[-2000:]}")
                raise RuntimeError(result.stderr[-2000:])

            thumbnail = subprocess.run(
                [
                    FFMPEG_BINARY, "-y", "-hide_banner", "-loglevel", "error",
                    "-ss", "0.5", "-i", output_path, "-frames:v", "1",
                    "-q:v", "2", thumbnail_path,
                ],
                capture_output=True,
                text=True,
            )
            if thumbnail.returncode != 0:
                raise RuntimeError(f"thumbnail generation failed: {thumbnail.stderr[-2000:]}")

            outputs.append(
                {
                    "index": i + 1,
                    "video_path": output_path,
                    "thumbnail_path": thumbnail_path,
                    "subtitle_path": subtitle_path if has_subs else None,
                    "moment": moment,
                }
            )
            print(f"Extracted clip {start} → {end} -> {output_path}")

        return outputs
