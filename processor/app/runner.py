import json
from pathlib import Path

from app.pipeline.subtitle import create_subtitles
from app.pipeline.transcribe import transcribe
from app.utils.ai import AI
from app.utils.api import API
from app.utils.ffmpeg import FFMPEG
from app.utils.s3 import S3
from app.utils.types import JobPayload, JobStatus, ProcessingType
from app.utils.youtube import download_video


FONT_PATH = Path(__file__).resolve().parent / "assets" / "fonts" / "Anton.ttf"


def _normalize_moments(moments: list[dict], duration: float) -> list[dict]:
    normalized = []
    for moment in moments:
        try:
            start = max(0.0, float(moment["start"]))
            end = min(duration, float(moment["end"]))
        except (KeyError, TypeError, ValueError):
            continue
        if end <= start:
            continue
        item = {**moment, "start": start, "end": end}
        normalized.append(item)
    return normalized


def run_pipeline(
    payload: JobPayload,
    workspace: str,
    api: API | None = None,
    storage: S3 | None = None,
) -> dict:
    api = api or API()
    storage = storage or S3()
    ffmpeg = FFMPEG()
    root = Path(workspace)
    raw_dir = root / "raw"
    processed_dir = root / "processed"
    subtitle_dir = root / "subtitles"
    raw_dir.mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    api.update_job(payload.projectId, JobStatus.DOWNLOADING, 5)
    video_info = download_video(
        payload.source,
        payload.sourceUrl,
        payload.sourceKey,
        str(raw_dir),
    )
    video_path = video_info["video_path"]
    audio_path = video_info["audio_path"]

    api.update_job(payload.projectId, JobStatus.PREPROCESSING, 20)
    needs_transcript = (
        payload.processingType == ProcessingType.AI or payload.subtitlesEnabled
    )
    transcript = None
    transcript_key = None
    audio_key = None

    if needs_transcript:
        ffmpeg.extract_audio(
            video_path,
            audio_path,
            payload.fromDuration,
            payload.toDuration,
        )
        api.update_job(payload.projectId, JobStatus.TRANSCRIBING, 35)
        transcript = transcribe(audio_path)

        transcript_path = root / "transcript.json"
        transcript_path.write_text(
            json.dumps(transcript, ensure_ascii=False), encoding="utf-8"
        )
        transcript_key = f"processed/{payload.projectId}/transcript.json"
        audio_key = f"processed/{payload.projectId}/audio.mp3"
        storage.upload_file(str(transcript_path), transcript_key)
        storage.upload_file(audio_path, audio_key)

    if payload.processingType == ProcessingType.AI:
        if transcript is None:
            raise RuntimeError("AI processing requires a transcript")
        api.update_job(payload.projectId, JobStatus.ANALYZING, 60)
        moments = AI().identify_moments(transcript, payload.prompt or "")
    else:
        moments = [{"start": 0.0, "end": payload.duration}]

    moments = _normalize_moments(moments, payload.duration)
    api.update_job(payload.projectId, JobStatus.FINDING_CLIPS, 75)

    subtitle_paths: list[str] = []
    if payload.subtitlesEnabled and transcript is not None and moments:
        subtitle_paths = create_subtitles(
            transcript,
            moments,
            str(subtitle_dir),
            style_key=payload.subtitleStyleKey or "classic",
        )

    outputs = ffmpeg.extract_clips(
        video_path,
        str(processed_dir),
        {
            "moments": moments,
            "aspect_ratio": payload.aspectRatio.value,
            "subtitles": subtitle_paths,
            "source_offset": payload.fromDuration,
            "fonts_dir": str(FONT_PATH.parent),
        },
    )

    completed_clips = []
    first_thumbnail_key = None
    for output in outputs:
        index = output["index"]
        moment = output["moment"]
        output_key = f"processed/{payload.projectId}/clips/clip-{index}.mp4"
        thumbnail_key = (
            f"processed/{payload.projectId}/thumbnails/clip-{index}.jpg"
        )
        storage.upload_file(output["video_path"], output_key)
        storage.upload_file(output["thumbnail_path"], thumbnail_key)
        first_thumbnail_key = first_thumbnail_key or thumbnail_key

        subtitles_key = None
        if output["subtitle_path"]:
            subtitles_key = (
                f"processed/{payload.projectId}/subtitles/clip-{index}.ass"
            )
            storage.upload_file(output["subtitle_path"], subtitles_key)

        start = payload.fromDuration + float(moment["start"])
        end = payload.fromDuration + float(moment["end"])
        completed_clips.append(
            {
                "from": start,
                "to": end,
                "duration": end - start,
                "outputKey": output_key,
                "title": moment.get("title") or f"Clip {index}",
                "score": moment.get("score"),
                "thumbnailKey": thumbnail_key,
                "subtitlesKey": subtitles_key,
            }
        )

    api.update_job(
        payload.projectId,
        JobStatus.FINDING_CLIPS,
        95,
        transcriptKey=transcript_key,
        audioKey=audio_key,
        thumbnailKey=first_thumbnail_key,
    )
    api.complete_job(payload.projectId, completed_clips)
    return {"projectId": payload.projectId, "clips": len(completed_clips)}
