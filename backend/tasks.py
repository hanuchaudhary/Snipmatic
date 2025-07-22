from celery import Celery, chain
from models import ClipRequest, ViralMoment, ClipResponse
from status_store import update_task_status
from helper import (
    download_video,
    extract_audio,
    transcribe_audio_whisperx,
    find_viral_moments,
    create_clip,
    get_video_info,
    cleanup_files,
    time_to_seconds
)
import os
import uuid
import zipfile
import logging
import signal
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

broker_url = 'rediss://default:AbMlAAIjcDEwY2E3NTBjOGM1MmQ0OTVhYjY5OTZkNmRmYjU5NGYzZHAxMA@summary-molly-45861.upstash.io:6379?ssl_cert_reqs=CERT_NONE'
backend_url = 'rediss://default:AbMlAAIjcDEwY2E3NTBjOGM1MmQ0OTVhYjY5OTZkNmRmYjU5NGYzZHAxMA@summary-molly-45861.upstash.io:6379?ssl_cert_reqs=CERT_NONE'


# Celery configuration
celery_app = Celery(
    'clipper',
    broker=broker_url,
    backend=backend_url
)

# Configure queues and routing
celery_app.conf.task_routes = {
    'tasks.download_task': {'queue': 'download'},
    'tasks.transcribe_task': {'queue': 'transcribe'},
    'tasks.clip_task': {'queue': 'clip'},
}

# Add queue configuration
celery_app.conf.task_create_missing_queues = True

class TimeoutError(Exception):
    pass

def timeout_handler(signum, frame):
    raise TimeoutError("Function call timed out")

def with_timeout(timeout_seconds):
    """Decorator to add timeout to function calls"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Set the signal handler
            old_handler = signal.signal(signal.SIGALRM, timeout_handler)
            signal.alarm(timeout_seconds)
            
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                # Reset the alarm
                signal.alarm(0)
                signal.signal(signal.SIGALRM, old_handler)
        return wrapper
    return decorator

@celery_app.task(name='tasks.download_task')
def download_task(task_id, url, aspect_ratio=None, multiple_clips=None, clip_type="AI", start_time=None, end_time=None):
    """Download video task - handles queuing of next task"""
    logger.info(f"[DOWNLOAD] Starting download task for task_id: {task_id}, url: {url}")
    logger.info(f"[DOWNLOAD] Task {task_id}: clip_type={clip_type}, aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
    
    try:
        logger.info(f"[DOWNLOAD] Task {task_id}: Updating status to DOWNLOADING")
        update_task_status(task_id, "DOWNLOADING", 10, "Downloading video")
        
        logger.info(f"[DOWNLOAD] Task {task_id}: Calling download_video function")
        video_path = download_video(url)
        logger.info(f"[DOWNLOAD] Task {task_id}: Video downloaded to {video_path}")
        
        update_task_status(task_id, "DOWNLOADED", 30, "Video downloaded")
        
        if clip_type == "AI":
            logger.info(f"[DOWNLOAD] Task {task_id}: Queuing transcribe task to transcribe queue")
            transcribe_task.apply_async(
                args=[task_id, video_path, url, aspect_ratio, multiple_clips],
                queue='transcribe'
            )
            logger.info(f"[DOWNLOAD] Task {task_id}: Transcribe task queued successfully")
        else:  # MANUAL
            logger.info(f"[DOWNLOAD] Task {task_id}: Queuing manual clip task to clip queue")
            logger.info(f"[DOWNLOAD] Task {task_id}: Manual clip params - start: {start_time}, end: {end_time}")
            manual_clip_task.apply_async(
                args=[task_id, video_path, start_time, end_time, aspect_ratio],
                queue='clip'
            )
            logger.info(f"[DOWNLOAD] Task {task_id}: Manual clip task queued successfully")

    except Exception as e:
        logger.error(f"[DOWNLOAD] Task {task_id}: Download failed with error: {str(e)}")
        update_task_status(task_id, "FAILED", message=f"Download failed: {str(e)}")
        raise

@celery_app.task(
    name='tasks.transcribe_task',
    rate_limit='2/m'  # Max 2 transcriptions per minute per worker
)
def transcribe_task(task_id, video_path, original_url, aspect_ratio, multiple_clips):
    """Transcription task - queues clip task after completion"""
    logger.info(f"[TRANSCRIBE] Starting transcribe task for task_id: {task_id}, video_path: {video_path}")
    logger.info(f"[TRANSCRIBE] Task {task_id}: original_url={original_url}, aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
    audio_path = None
    
    try:
        logger.info(f"[TRANSCRIBE] Task {task_id}: Updating status to EXTRACTING_AUDIO")
        update_task_status(task_id, "EXTRACTING_AUDIO", 40, "Extracting audio")
        
        logger.info(f"[TRANSCRIBE] Task {task_id}: Extracting audio from video")
        audio_path = extract_audio(video_path)
        logger.info(f"[TRANSCRIBE] Task {task_id}: Audio extracted to {audio_path}")
        
        logger.info(f"[TRANSCRIBE] Task {task_id}: Updating status to TRANSCRIBING")
        update_task_status(task_id, "TRANSCRIBING", 60, "Transcribing audio")
        
        logger.info(f"[TRANSCRIBE] Task {task_id}: Starting audio transcription")
        try:
            logger.info(f"[TRANSCRIBE] Task {task_id}: Loading audio file for transcription")
            logger.info(f"[TRANSCRIBE] Task {task_id}: Audio file size: {os.path.getsize(audio_path)} bytes")
            
            # # Add timeout for transcription (10 minutes max)
            # @with_timeout(600)  # 10 minutes timeout
            # def transcribe_with_timeout():
            segments = transcribe_audio_whisperx(audio_path)

            logger.info(f"[TRANSCRIBE] Task {task_id}: Starting transcription with 10-minute timeout")
            # segments = transcribe_with_timeout()
            logger.info(f"[TRANSCRIBE] Task {task_id}: Transcription completed successfully, found {len(segments)} segments")
            
        except TimeoutError:
            logger.error(f"[TRANSCRIBE] Task {task_id}: Transcription timed out after 10 minutes")
            raise Exception("Transcription timed out - audio file may be too long or system is overloaded")
        except Exception as transcribe_error:
            logger.error(f"[TRANSCRIBE] Task {task_id}: Transcription step failed: {str(transcribe_error)}")
            logger.error(f"[TRANSCRIBE] Task {task_id}: Audio file path: {audio_path}")
            logger.error(f"[TRANSCRIBE] Task {task_id}: Audio file exists: {os.path.exists(audio_path) if audio_path else False}")
            if audio_path and os.path.exists(audio_path):
                logger.error(f"[TRANSCRIBE] Task {task_id}: Audio file size: {os.path.getsize(audio_path)} bytes")
            raise transcribe_error
        
        logger.info(f"[TRANSCRIBE] Task {task_id}: Updating status to ANALYZING")
        update_task_status(task_id, "ANALYZING", 80, "Finding viral moments")
        
        logger.info(f"[TRANSCRIBE] Task {task_id}: Getting video info from URL: {original_url}")
        video_info = get_video_info(original_url)  # Use original URL instead of file path
        logger.info(f"[TRANSCRIBE] Task {task_id}: Video info retrieved: {video_info}")
        
        logger.info(f"[TRANSCRIBE] Task {task_id}: Finding viral moments using AI")
        viral_moments = find_viral_moments(segments, video_info)
        logger.info(f"[TRANSCRIBE] Task {task_id}: Found {len(viral_moments)} viral moments")

        logger.info(f"[TRANSCRIBE] Task {task_id}: Queuing clip task to clip queue")
        clip_task.apply_async(
            args=[task_id, video_path, viral_moments, aspect_ratio, multiple_clips],
            queue='clip'
        )
        logger.info(f"[TRANSCRIBE] Task {task_id}: Clip task queued successfully")
        
    except Exception as e:
        logger.error(f"[TRANSCRIBE] Task {task_id}: Transcription failed with error: {str(e)}")
        update_task_status(task_id, "FAILED", message=f"Transcription failed: {str(e)}")
        raise
    finally:
        # Cleanup audio file immediately
        if audio_path and os.path.exists(audio_path):
            logger.info(f"[TRANSCRIBE] Task {task_id}: Cleaning up audio file: {audio_path}")
            cleanup_files(audio_path)

@celery_app.task(name='tasks.clip_task')
def clip_task(task_id, video_path, viral_moments, aspect_ratio, multiple_clips):
    """Clip generation task"""
    logger.info(f"[CLIP] Starting clip task for task_id: {task_id}, video_path: {video_path}")
    logger.info(f"[CLIP] Task {task_id}: aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
    logger.info(f"[CLIP] Task {task_id}: Processing {len(viral_moments)} viral moments")
    
    try:
        logger.info(f"[CLIP] Task {task_id}: Updating status to CREATING_CLIPS")
        update_task_status(task_id, "CREATING_CLIPS", 90, "Generating clips")
        clip_paths = []
        
        if multiple_clips:
            logger.info(f"[CLIP] Task {task_id}: Creating multiple clips for all viral moments")
            # Process all viral moments
            with ThreadPoolExecutor(max_workers=5) as executor:
                logger.info(f"[CLIP] Task {task_id}: Starting ThreadPoolExecutor with 5 workers")
                futures = [
                    executor.submit(
                        create_clip, 
                        video_path, 
                        moment.start_time, 
                        moment.end_time, 
                        aspect_ratio
                    )
                    for moment in viral_moments
                ]
                
                for i, future in enumerate(as_completed(futures)):
                    clip_path = future.result()
                    clip_paths.append(clip_path)
                    logger.info(f"[CLIP] Task {task_id}: Clip {i+1}/{len(viral_moments)} created: {clip_path}")
        else:
            logger.info(f"[CLIP] Task {task_id}: Creating single clip for best viral moment")
            # Process only the best viral moment
            best_moment = max(
                viral_moments, 
                key=lambda x: x.confidence_score
            )
            logger.info(f"[CLIP] Task {task_id}: Best moment selected: {best_moment.start_time}-{best_moment.end_time}s (score: {best_moment.confidence_score})")
            clip_path = create_clip(
                video_path, 
                best_moment.start_time, 
                best_moment.end_time, 
                aspect_ratio
            )
            clip_paths.append(clip_path)
            logger.info(f"[CLIP] Task {task_id}: Single clip created: {clip_path}")
        
        # Create ZIP if multiple clips
        zip_path = None
        if multiple_clips and len(clip_paths) > 1:
            logger.info(f"[CLIP] Task {task_id}: Creating ZIP file for {len(clip_paths)} clips")
            zip_path = f'clipper_clips/{task_id}.zip'
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for i, clip in enumerate(clip_paths):
                    clip_name = f"clip_{i+1}_{os.path.basename(clip)}"
                    zipf.write(clip, clip_name)
                    logger.info(f"[CLIP] Task {task_id}: Added {clip_name} to ZIP")
            logger.info(f"[CLIP] Task {task_id}: ZIP file created: {zip_path}")
        
        # Prepare result
        result = {
            "viral_moments": viral_moments,
            "clip_paths": clip_paths,
            "zip_path": zip_path
        }
        
        logger.info(f"[CLIP] Task {task_id}: Task completed successfully")
        logger.info(f"[CLIP] Task {task_id}: Result summary - clips: {len(clip_paths)}, zip: {zip_path is not None}")
        update_task_status(
            task_id, 
            "COMPLETED", 
            100, 
            "Clips created successfully", 
            result
        )
        
        return result
    except Exception as e:
        logger.error(f"[CLIP] Task {task_id}: Clip creation failed with error: {str(e)}")
        update_task_status(task_id, "FAILED", message=f"Clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file after clip processing is complete
        if video_path and os.path.exists(video_path):
            logger.info(f"[CLIP] Task {task_id}: Cleaning up video file: {video_path}")
            cleanup_files(video_path)

def create_ai_clip_task(task_id, request):
    """Orchestrate AI clip creation workflow using Celery queues"""
    logger.info(f"[ORCHESTRATE] Starting AI clip workflow for task_id: {task_id}")
    logger.info(f"[ORCHESTRATE] Task {task_id}: Request details - url: {request.url}, aspect_ratio: {request.aspectRatio}, multiple_clips: {request.multipleClips}")
    
    try:
        logger.info(f"[ORCHESTRATE] Task {task_id}: Updating status to QUEUED")
        update_task_status(task_id, "QUEUED", 5, "Queuing download task")
        
        logger.info(f"[ORCHESTRATE] Task {task_id}: Queuing download task to download queue")
        # Queue download task to download queue
        download_task.apply_async(
            args=[task_id, request.url, request.aspectRatio, request.multipleClips, "AI"],
            queue='download'
        )
        logger.info(f"[ORCHESTRATE] Task {task_id}: Download task queued successfully for AI workflow")
        
    except Exception as e:
        logger.error(f"[ORCHESTRATE] Task {task_id}: AI processing failed with error: {str(e)}")
        update_task_status(task_id, "FAILED", message=f"AI processing failed: {str(e)}")

def create_manual_clip_task(task_id, request):
    """Orchestrate manual clip creation workflow using Celery queues"""
    logger.info(f"[ORCHESTRATE] Starting manual clip workflow for task_id: {task_id}")
    logger.info(f"[ORCHESTRATE] Task {task_id}: Request details - url: {request.url}, start: {request.startTime}, end: {request.endTime}, aspect_ratio: {request.aspectRatio}")
    
    try:
        logger.info(f"[ORCHESTRATE] Task {task_id}: Updating status to QUEUED")
        update_task_status(task_id, "QUEUED", 5, "Queuing download task")
        
        logger.info(f"[ORCHESTRATE] Task {task_id}: Queuing download task to download queue")
        # Queue download task to download queue
        download_task.apply_async(
            args=[task_id, request.url, request.aspectRatio, None, "MANUAL", request.startTime, request.endTime],
            queue='download'
        )
        logger.info(f"[ORCHESTRATE] Task {task_id}: Download task queued successfully for manual workflow")
        
    except Exception as e:
        logger.error(f"[ORCHESTRATE] Task {task_id}: Manual clip processing failed with error: {str(e)}")
        update_task_status(task_id, "FAILED", message=f"Manual clip failed: {str(e)}")

@celery_app.task(name='tasks.manual_clip_task')
def manual_clip_task(task_id, video_path, start_time, end_time, aspect_ratio):
    """Manual clip creation task"""
    logger.info(f"[MANUAL_CLIP] Starting manual clip task for task_id: {task_id}")
    logger.info(f"[MANUAL_CLIP] Task {task_id}: video_path={video_path}, start={start_time}, end={end_time}, aspect_ratio={aspect_ratio}")
    
    try:
        logger.info(f"[MANUAL_CLIP] Task {task_id}: Updating status to CREATING_CLIPS")
        update_task_status(task_id, "CREATING_CLIPS", 90, "Generating clip")
        
        logger.info(f"[MANUAL_CLIP] Task {task_id}: Converting time strings to seconds")
        start_seconds = time_to_seconds(start_time)
        end_seconds = time_to_seconds(end_time)
        logger.info(f"[MANUAL_CLIP] Task {task_id}: Time conversion - start: {start_seconds}s, end: {end_seconds}s")
        
        logger.info(f"[MANUAL_CLIP] Task {task_id}: Creating clip")
        clip_path = create_clip(
            video_path,
            start_seconds,
            end_seconds,
            aspect_ratio
        )
        logger.info(f"[MANUAL_CLIP] Task {task_id}: Clip created successfully: {clip_path}")
        
        # Prepare result
        result = {
            "clip_paths": [clip_path],
            "zip_path": None
        }
        
        logger.info(f"[MANUAL_CLIP] Task {task_id}: Task completed successfully")
        update_task_status(
            task_id, 
            "COMPLETED", 
            100, 
            "Manual clip created successfully", 
            result
        )
        
        return result
    except Exception as e:
        logger.error(f"[MANUAL_CLIP] Task {task_id}: Manual clip creation failed with error: {str(e)}")
        update_task_status(task_id, "FAILED", message=f"Manual clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file
        if video_path and os.path.exists(video_path):
            logger.info(f"[MANUAL_CLIP] Task {task_id}: Cleaning up video file: {video_path}")
            cleanup_files(video_path)