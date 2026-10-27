import os
import tempfile
from pathlib import Path

import modal

ROOT = Path(__file__).resolve().parent.parent
APP_DIR = Path(__file__).resolve().parent

image = (
    modal.Image.debian_slim(python_version="3.12")
    .apt_install("ffmpeg", "curl", "unzip", "ca-certificates")
    .run_commands("curl -fsSL https://deno.land/install.sh | DENO_INSTALL=/usr/local sh")
    .pip_install_from_requirements(str(ROOT / "requirements.txt"))
    .pip_install("nvidia-cublas-cu12", "nvidia-cudnn-cu12==9.*")
    .env(
        {
            "HF_HOME": "/root/.cache/huggingface",
            "WHISPER_DEVICE": "cuda",
            "WHISPER_COMPUTE_TYPE": "float16",
            "LD_LIBRARY_PATH": "/usr/local/lib/python3.12/site-packages/nvidia/cublas/lib:/usr/local/lib/python3.12/site-packages/nvidia/cudnn/lib",
        }
    )
    .run_commands(
        'python -c "from huggingface_hub import snapshot_download; snapshot_download(\'Systran/faster-whisper-small\')"'
    )
    .add_local_dir(APP_DIR, remote_path="/root/app")
)

app = modal.App("processor")
processor_secret = modal.Secret.from_name(
    os.environ.get("MODAL_PROCESSOR_SECRET", "processor-secrets"),
    required_keys=[
        "AI_API_KEY",
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_REGION",
        "S3_BUCKET_NAME",
        "REDIS_URL",
    ],
)


@app.function(
    image=image,
    gpu="T4",
    cpu=4,
    memory=8192,
    # ephemeral_disk=20 * 1024,
    timeout=60 * 60,
    max_containers=4,
    secrets=[processor_secret],
)
def process_video(payload: dict):
    from app.runner import run_pipeline
    from app.utils.types import JobPayload

    job = JobPayload.model_validate(payload)
    with tempfile.TemporaryDirectory(prefix=f"clip-{job.projectId}-") as workspace:
        return run_pipeline(job, workspace)


@app.local_entrypoint()
def main(payload_path: str):
    import json
    payload = json.loads(Path(payload_path).read_text(encoding="utf-8"))
    print(process_video.remote(payload))
