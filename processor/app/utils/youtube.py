import base64
import binascii
import os
from pathlib import Path

import yt_dlp

from app.utils.s3 import S3
from app.utils.types import VideoSource


def _cookie_file(output_dir: Path) -> str | None:
    encoded_cookie_contents = os.environ.get("YT_COOKIES_CONTENT_B64")
    if encoded_cookie_contents:
        try:
            cookie_contents = base64.b64decode(
                "".join(encoded_cookie_contents.split()), validate=True
            ).decode("utf-8")
        except (binascii.Error, UnicodeDecodeError) as error:
            raise ValueError(
                "YT_COOKIES_CONTENT_B64 must be a Base64-encoded UTF-8 cookies.txt"
            ) from error
    else:
        cookie_contents = os.environ.get("YT_COOKIES_CONTENT")

    if cookie_contents:
        # Modal secrets are injected as environment variables. Keep their
        # contents out of logs and reject values flattened by copy/paste.
        cookie_contents = cookie_contents.replace("\r\n", "\n")
        lines = cookie_contents.splitlines()
        if not lines or lines[0].strip() not in {
            "# Netscape HTTP Cookie File",
            "# HTTP Cookie File",
        }:
            raise ValueError(
                "YT_COOKIES_CONTENT must contain an intact Netscape-format cookies.txt"
            )
        cookie_rows = [line for line in lines if line and not line.startswith("#")]
        if not cookie_rows or any(line.count("\t") < 6 for line in cookie_rows):
            raise ValueError(
                "YT_COOKIES_CONTENT must preserve newlines and tab-separated cookie fields"
            )
        path = output_dir / "cookies.txt"
        path.write_text(cookie_contents, encoding="utf-8")
        return str(path)

    configured = os.environ.get("YT_COOKIES_FILE")
    if configured and Path(configured).exists():
        return configured

    local = Path(__file__).resolve().parents[2] / "cookies.txt"
    return str(local) if local.exists() else None


def download_video(
    source: VideoSource,
    source_url: str | None,
    source_key: str | None,
    output_dir: str,
):
    destination = Path(output_dir)
    destination.mkdir(parents=True, exist_ok=True)

    if source == VideoSource.UPLOAD:
        if not source_key:
            raise ValueError("Missing S3 source key")
        suffix = Path(source_key).suffix or ".mp4"
        video_path = destination / f"source{suffix}"
        S3().download_file(source_key, str(video_path))
        return {
            "video_path": str(video_path),
            "audio_path": str(destination / "audio.mp3"),
        }

    if not source_url:
        raise ValueError("Missing YouTube source URL")

    options = {
        "merge_output_format": "mp4",
        "outtmpl": str(destination / "source.%(ext)s"),
        "format": "bestvideo[height<=720]+bestaudio/best",
    }
    cookie_file = _cookie_file(destination)
    if cookie_file:
        options["cookiefile"] = cookie_file

    try:
        with yt_dlp.YoutubeDL(options) as ydl:
            info = ydl.extract_info(source_url, download=True)
            prepared = Path(ydl.prepare_filename(info))
            merged = destination / "source.mp4"
            video_path = merged if merged.exists() else prepared
            if not video_path.exists():
                candidates = [
                    path
                    for path in destination.glob("source.*")
                    if path.suffix not in {".part", ".ytdl"}
                ]
                if not candidates:
                    raise RuntimeError("yt-dlp did not produce a video file")
                video_path = candidates[0]
            return {
                "video_path": str(video_path),
                "audio_path": str(destination / "audio.mp3"),
            }
    except yt_dlp.utils.DownloadError as error:
        raise RuntimeError(str(error)) from None
