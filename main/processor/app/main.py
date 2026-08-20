from dotenv import load_dotenv
from app.utils.config import DOWNLOAD_PATH, PROCESS_PATH

load_dotenv()

from app.utils.youtube import download_video
from app.utils.ai import AI
from app.utils.ffmpeg import FFMPEG
from app.pipeline.transcribe import transcribe
from app.pipeline.subtitle import create_subtitles

def main():
    print("Starting video processing pipeline...")
    video_info = download_video("https://youtu.be/BbG1qc_Hnb4")
    video_path = video_info.get("video_path")
    audio_path = video_info.get("audio_path")
    print("Downloaded video and audio...")
    print("Extracting audio...")
    ffmpeg = FFMPEG()
    ffmpeg.extract_audio(video_path, audio_path)
    print("Extracted audio...")
    print("Transcribing audio...")
    transcript = transcribe(audio_path)
    print("Transcribed audio...")
    print("Transcript: ", transcript)
    print("Identifying moments...")
    ai = AI()
    moments = ai.identify_moments(transcript)
    print("Identified moments...")
    print("Moments: ", moments)
    print("Creating subtitles...")
    ass_paths = create_subtitles(transcript, moments, DOWNLOAD_PATH)
    print("Created subtitles...")
    print("Subtitle files: ", ass_paths)
    print("Extracting clips...")
    clips_path = f"{PROCESS_PATH}/clips"
    metadata = {
        "moments": moments,
        "aspect_ratio": "9:16",
        "subtitles": ass_paths,
    }
    ffmpeg.extract_clips(video_path, clips_path, metadata)
    print("Extracted clips...")

if __name__ == "__main__":
    main()
