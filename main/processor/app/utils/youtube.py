import os
from pathlib import Path

import yt_dlp

from app.utils.config import DOWNLOAD_PATH
from app.utils.types import ClipType
from app.utils.s3 import S3

_LOCAL_COOKIES = Path(__file__).resolve().parents[2] / "cookies.txt"
COOKIE_FILE = os.environ.get(
    "YT_COOKIES_FILE",
    "/root/cookies.txt" if Path("/root/cookies.txt").exists() else str(_LOCAL_COOKIES),
)

ydl_opts = {
    "merge_output_format": "mp4",
    "outtmpl": f"{DOWNLOAD_PATH}/%(id)s.%(ext)s",
    "format": "bestvideo[height<=720]+bestaudio/best",  # dev medium quality TOOD
    "cookiefile": COOKIE_FILE,
}


def download_video(url: str, clip_type: ClipType):
    os.makedirs(DOWNLOAD_PATH, exist_ok=True)
    if clip_type == ClipType.MANUAL:
        s3 = S3()
        s3.download_file("snipmatic-videos", url, f"{DOWNLOAD_PATH}/{url.split('/')[-1]}")
        return {
            "video_path": f"{DOWNLOAD_PATH}/{url.split('/')[-1]}",
            "audio_path": f"{DOWNLOAD_PATH}/{url.split('/')[-1].split('.')[0]}.mp3",
        }
    else:    
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info: dict = ydl.extract_info(url, download=True)
                file_extension = info.get("ext")
                video_id = info.get("id")
                return {
                    "video_path": f"{DOWNLOAD_PATH}/{video_id}.{file_extension}",
                    "audio_path": f"{DOWNLOAD_PATH}/{video_id}.mp3",
                }
        except yt_dlp.utils.DownloadError as e:
            raise RuntimeError(str(e)) from None