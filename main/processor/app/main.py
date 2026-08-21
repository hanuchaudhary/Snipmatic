from app.pipeline.subtitle import create_subtitles
from app.pipeline.transcribe import transcribe
from app.utils.ai import AI
from app.utils.config import DOWNLOAD_PATH, PROCESS_PATH
from app.utils.ffmpeg import FFMPEG
from app.utils.types import JobPayload
from app.utils.types import ClipType, VideoSource
from app.utils.youtube import download_video
from dotenv import load_dotenv

load_dotenv()



payload = JobPayload(
    jobId="123",
    clipType=ClipType.MANUAL,
    sourceKey="https://youtu.be/BbG1qc_Hnb4",
    source=VideoSource.YOUTUBE,
    # from_=0,
    # to=10,
    prompt="",
)

def main():
    job_id = payload.jobId
    clip_type = payload.clipType
    
    video_info = download_video(payload.sourceKey, payload.source)

    video_path = video_info.get("video_path")
    audio_path = video_info.get("audio_path")

    ffmpeg = FFMPEG()
    # might be error from and to
    ffmpeg.extract_audio(video_path, audio_path, payload.from_, payload.to)

    transcript = transcribe(audio_path)

    ai = AI()
    moments = ai.identify_moments(transcript, payload.prompt)

    ass_paths = create_subtitles(transcript, moments, DOWNLOAD_PATH, payload.subtitlesKey)

    clips_path = f"{PROCESS_PATH}/clips"
    metadata = {
        "moments": moments,
        "aspect_ratio": payload.aspectRatio,
        "subtitles_key": payload.subtitlesKey,
        "subtitles": ass_paths,
        "bg_music": payload.bgMusicKey,
        "layout": payload.layoutKey,
    }
    ffmpeg.extract_clips(video_path, clips_path, metadata)

if __name__ == "__main__":
    main()
