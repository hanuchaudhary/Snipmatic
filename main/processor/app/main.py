from dotenv import load_dotenv

from utils.youtube import download_video
from utils.ai import AI
from utils.ffmpeg import FFMPEG
from utils.config import DOWNLOAD_PATH

def main():
    load_dotenv()
    # ai = AI()
    # ai.identify_moments("Mai hu shaktimaan")
    video_path = download_video("https://youtu.be/2PuFyjAs7JA")
    video_path = f"{DOWNLOAD_PATH}/{video_path}"
    audio_path = f"{DOWNLOAD_PATH}/{video_path}.mp3"
    print(video_path, audio_path)
    ffmpeg = FFMPEG()
    ffmpeg.extract_audio(video_path, audio_path)



if __name__ == "__main__":
    main()
