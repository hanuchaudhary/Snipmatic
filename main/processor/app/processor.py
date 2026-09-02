from pathlib import Path

import modal

from app.pipeline.subtitle import create_subtitles
from app.pipeline.transcribe import transcribe
from app.utils.ai import AI
from app.utils.config import DOWNLOAD_PATH, PROCESS_PATH
from app.utils.ffmpeg import FFMPEG
from app.utils.youtube import download_video
from app.utils.types import JobPayload

ROOT = Path(__file__).resolve().parent.parent

image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("ffmpeg", "curl", "unzip", "ca-certificates")
    .env(
        {
            "DENO_INSTALL": "/root/.deno",
            "PATH": "/root/.deno/bin:/usr/local/bin:/usr/bin:/bin",
        }
    )
    .run_commands("curl -fsSL https://deno.land/install.sh | sh")
    .pip_install_from_requirements(str(ROOT / "requirements.txt"))
    .add_local_dir(Path(__file__).resolve().parent, remote_path="/root/app")
    .add_local_file(ROOT / "cookies.txt", remote_path="/root/cookies.txt")
)

app = modal.App("processor")

@app.function(
    image=image,
    timeout=60 * 60,
    secrets=[
        modal.Secret.from_name("custom-secret", required_keys=["AI_API_KEY"]),
        modal.Secret.from_dotenv(ROOT),
    ],
)
def process_video(payload: JobPayload):
    job_id = payload.id
    clip_type = payload.clipType
    
    video_info = download_video(payload.sourceKey, payload.source)

    video_path = video_info.get("video_path")
    audio_path = video_info.get("audio_path")

    ffmpeg = FFMPEG()
    ffmpeg.extract_audio(video_path, audio_path, payload.searchFrom, payload.searchTo)

    transcript = transcribe(audio_path)

    ai = AI()
    moments = ai.identify_moments(transcript, payload.prompt or "")

    ass_paths = create_subtitles(transcript, moments, DOWNLOAD_PATH)

    clips_path = f"{PROCESS_PATH}/clips"
    metadata = {
        "moments": moments,
        "aspect_ratio": payload.aspectRatio,
        "subtitles_key": payload.subtitleStyleKey,
        "subtitles": ass_paths,
        "bg_music": payload.bgMusicKey,
    }
    ffmpeg.extract_clips(video_path, clips_path, metadata)
    
@app.local_entrypoint()
def main():
    print(process_video.remote("https://youtu.be/8DNQ8DYgCJE"))