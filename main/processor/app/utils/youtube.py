import yt_dlp

from app.utils.config import DOWNLOAD_PATH

ydl_opts = {
    'outtmpl': f'{DOWNLOAD_PATH}/%(id)s.%(ext)s', 
    'format': 'bestvideo[height<=720]+bestaudio/best', # dev medium quality TOOD
    "cookiesfrombrowser": ("chrome",),
}

def download_video(url: str):
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info: dict = ydl.extract_info(url, download=True)
        file_extension = info.get("ext")
        video_id = info.get("id")
        return {
            "video_path": f"{DOWNLOAD_PATH}/{video_id}.{file_extension}",
            "audio_path": f"{DOWNLOAD_PATH}/{video_id}.mp3",
        }