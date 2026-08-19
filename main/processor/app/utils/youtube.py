import math
import yt_dlp
import time

from utils.config import DOWNLOAD_PATH

def download_video(url: str):
    video_id = math.floor(time.time() * 1000)
    ydl_opts = {
        'outtmpl': f'{DOWNLOAD_PATH}/{video_id}',
        'format': 'bestvideo+bestaudio/best',
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return video_id