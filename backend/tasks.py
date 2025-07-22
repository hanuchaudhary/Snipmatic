# tasks.py (Celery tasks and processing logic)
from celery import Celery
from models import ClipRequest, ViralMoment, ClipResponse
from helper import (
    download_video,
    extract_audio,
    transcribe_audio_whisperx,
    find_viral_moments,
    create_clip,
    get_video_info,
    cleanup_files
)
import os
import uuid
import zipfile
from concurrent.futures import ThreadPoolExecutor, as_completed

# Celery configuration
celery_app = Celery(
    'clipper',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)

# Configure queues
celery_app.conf.task_routes = {
    'tasks.download_task': {'queue': 'download'},
    'tasks.transcribe_task': {'queue': 'transcribe'},
    'tasks.clip_task': {'queue': 'clip'}
}

task_status_store = {}


# In-memory task status (replace with Redis in production)

def update_task_status(task_id, status, progress=0, message="", result=None):
    """Update task status in storage"""
    task_status_store[task_id] = {
        "status": status,
        "progress": progress,
        "message": message,
        "result": result
    }

@celery_app.task(name='tasks.download_task')
def download_task(task_id, url):
    """Download video task"""
    try:
        update_task_status(task_id, "DOWNLOADING", 10, "Downloading video")
        video_path = download_video(url)
        update_task_status(task_id, "DOWNLOADED", 30, "Video downloaded")
        return video_path
    except Exception as e:
        update_task_status(task_id, "FAILED", message=f"Download failed: {str(e)}")
        raise

@celery_app.task(
    name='tasks.transcribe_task',task_status_store = {}
    rate_limit='2/m'  # Max 2 transcriptions per minute per worker
)
def transcribe_task(task_id, video_path):
    """Transcription task"""
    try:
        update_task_status(task_id, "EXTRACTING_AUDIO", 40, "Extracting audio")
        audio_path = extract_audio(video_path)
        
        update_task_status(task_id, "TRANSCRIBING", 60, "Transcribing audio")
        segments = transcribe_audio_whisperx(audio_path)
        
        update_task_status(task_id, "ANALYZING", 80, "Finding viral moments")
        video_info = get_video_info(video_path)
        viral_moments = find_viral_moments(segments, video_info)
        
        return {
            "video_path": video_path,
            "viral_moments": viral_moments,
            "audio_path": audio_path
        }
    except Exception as e:
        update_task_status(task_id, "FAILED", message=f"Transcription failed: {str(e)}")
        raise
    finally:
        # Cleanup audio file immediately
        if 'audio_path' in locals():
            cleanup_files(audio_path)

@celery_app.task(name='tasks.clip_task')
def clip_task(task_id, video_path, clip_data, aspect_ratio, multiple_clips):
    """Clip generation task"""
    try:
        update_task_status(task_id, "CREATING_CLIPS", 90, "Generating clips")
        clip_paths = []
        
        if multiple_clips:
            # Process all viral moments
            with ThreadPoolExecutor(max_workers=5) as executor:
                futures = [
                    executor.submit(
                        create_clip, 
                        video_path, 
                        moment.start_time, 
                        moment.end_time, 
                        aspect_ratio
                    )
                    for moment in clip_data["viral_moments"]
                ]
                
                for future in as_completed(futures):
                    clip_path = future.result()
                    clip_paths.append(clip_path)
        else:
            # Process only the best viral moment
            best_moment = max(
                clip_data["viral_moments"], 
                key=lambda x: x.confidence_score
            )
            clip_path = create_clip(
                video_path, 
                best_moment.start_time, 
                best_moment.end_time, 
                aspect_ratio
            )
            clip_paths.append(clip_path)
        
        # Create ZIP if multiple clips
        zip_path = None
        if multiple_clips and len(clip_paths) > 1:
            zip_path = f'clipper_clips/{task_id}.zip'
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for i, clip in enumerate(clip_paths):
                    clip_name = f"clip_{i+1}_{os.path.basename(clip)}"
                    zipf.write(clip, clip_name)
        
        # Prepare result
        result = {
            "viral_moments": clip_data["viral_moments"],
            "clip_paths": clip_paths,
            "zip_path": zip_path
        }
        
        update_task_status(
            task_id, 
            "COMPLETED", 
            100, 
            "Clips created successfully", 
            result
        )
        
        return result
    except Exception as e:
        update_task_status(task_id, "FAILED", message=f"Clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file after processing
        cleanup_files(video_path)

def create_ai_clip_task(task_id, request):
    """Orchestrate AI clip creation workflow"""
    try:
        # Step 1: Download video
        video_path = download_task.delay(task_id, request.url).get()
        
        # Step 2: Transcribe and find viral moments
        transcribe_result = transcribe_task.delay(
            task_id, 
            video_path
        ).get()
        
        # Step 3: Create clips
        clip_task.delay(
            task_id,
            video_path,
            {
                "viral_moments": transcribe_result["viral_moments"]
            },
            request.aspectRatio,
            request.multipleClips
        )
    except Exception as e:
        update_task_status(task_id, "FAILED", message=f"AI processing failed: {str(e)}")

def create_manual_clip_task(task_id, request):
    """Orchestrate manual clip creation workflow"""
    try:
        # Step 1: Download video
        video_path = download_task.delay(task_id, request.url).get()
        
        # Step 2: Create clip directly
        clip_path = create_clip(
            video_path,
            time_to_seconds(request.startTime),
            time_to_seconds(request.endTime),
            request.aspectRatio
        )
        
        # Prepare result
        result = {
            "clip_paths": [clip_path],
            "zip_path": None
        }
        
        update_task_status(
            task_id, 
            "COMPLETED", 
            100, 
            "Manual clip created successfully", 
            result
        )
    except Exception as e:
        update_task_status(task_id, "FAILED", message=f"Manual clip failed: {str(e)}")
    finally:
        # Cleanup video file after processing
        cleanup_files(video_path)