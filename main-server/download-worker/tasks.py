import os
import uuid
import yt_dlp
import logging
import os
from functools import partial
import atexit
from concurrent.futures import ThreadPoolExecutor, as_completed
import signal
from shared.celery_config import celery_app, VIDEO_STORAGE_PATH
from shared.models import TaskStatus
from shared.utils import update_task_status, cleanup_files

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

download_executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="download-thread")

def cleanup_thread_pool():
    logger.info("Shutting down download thread pool...")
    download_executor.shutdown(wait=True, cancel_futures=True)
    logger.info("Download thread pool shutdown complete")

atexit.register(cleanup_thread_pool)


def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}, initiating graceful shutdown...")
    cleanup_thread_pool()
    exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def calculate_download_timeout(video_duration: int = 0, base_timeout: int = 300) -> int:
    if not video_duration or video_duration <= 0:
        return 180
    
    calculated_timeout = base_timeout + (video_duration * 3)
    
    min_timeout = 120
    max_timeout = 600
    
    return max(min_timeout, min(calculated_timeout, max_timeout))

def _download_with_ydl(url: str, ydl_opts: dict) -> dict:
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if info is None:
            raise Exception("Failed to extract video information")
        
        video_info = {
            'title': info.get('title', 'Unknown'),
            'description': info.get('description', ''),
            'duration': info.get('duration', 0),
            'uploader': info.get('uploader', 'Unknown'),
            'upload_date': info.get('upload_date', ''),
        }
        
        ydl.download([url])
        return video_info
    
def download_video(url: str, timeout_minutes: int = 0, video_duration: int = 0) -> tuple[str, dict]:
    video_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(VIDEO_STORAGE_PATH, f"video_{video_id}.%(ext)s")
    logger.info(f"Starting download for video_id: {video_id}")
    
    cookies_file_path = os.getenv("COOKIES_FILE_PATH", "/app/cookies.txt")

    ydl_opts = {
        'format': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]',
        'outtmpl': output_path,
        'quiet': True,
        "no_warnings": True
    }
    
    if os.path.exists(cookies_file_path):
        ydl_opts['cookiefile'] = cookies_file_path
        logger.info(f"Using cookies file: {ydl_opts}")
    else:
        logger.warning(f"Cookies file not found at: {cookies_file_path}")
        logger.warning("Proceeding without cookies - some videos may not be accessible")
    
    future = download_executor.submit(_download_with_ydl, url, ydl_opts)
    
    if timeout_minutes:
        timeout_seconds = timeout_minutes * 60
    else:
        timeout_seconds = calculate_download_timeout(video_duration)
    
    try:
        video_info = future.result(timeout=timeout_seconds)
        
        downloaded_files = [f for f in os.listdir(VIDEO_STORAGE_PATH) if f.startswith(f"video_{video_id}")]
        if not downloaded_files:
            raise Exception("Download completed but file not found")
        
        video_path = os.path.join(VIDEO_STORAGE_PATH, downloaded_files[0])
        
        logger.info(f"Video downloaded: {video_path}, size: {os.path.getsize(video_path)} bytes")
        return video_path, video_info
        
    except TimeoutError as timeout_error:
        future.cancel()
        raise TimeoutError(f"Download timed out after {timeout_seconds//60} minutes")
    except Exception as e:
        logger.error(f"Download failed for video_id {video_id}: {str(e)}")
        future.cancel()
        raise

@celery_app.task(name='download_task', bind=True)
def download_task(self, task_id, url, user_id, aspect_ratio=None, multiple_clips=None, clip_type="AI", start_time=None, end_time=None, subtitles=False, duration=0):
   
    video_path = None
    video_info = None
    try:
        update_task_status(user_id, task_id, TaskStatus.DOWNLOADING, 10, "Downloading video")
        video_path, video_info = download_video(url, video_duration=duration)
        print(f"Video downloaded successfully: {video_path}")
        
    except Exception as download_error:
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Download failed with error: {str(download_error)}")
            update_task_status(user_id, task_id, TaskStatus.FAILED, 0, f"Download failed: {str(download_error)}")
            raise

    update_task_status(user_id, task_id, TaskStatus.DOWNLOADED, 30, "Video downloaded")

    if clip_type == "AI":
           
            try:
                celery_app.send_task(
                    'transcribe_task',
                    args=[task_id, video_path, url, aspect_ratio, multiple_clips, video_info, user_id, subtitles],
                    queue='transcribe',
                    routing_key='transcribe'
                )
                
            except Exception as queue_error:
                logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Failed to queue transcribe task: {queue_error}")
    else:
            try:
                celery_app.send_task(
                    'manual_clip_task',
                    args=[task_id, video_path, start_time, end_time, aspect_ratio, user_id, subtitles],
                    queue='clip',
                    routing_key='clip'
                )
            except Exception as queue_error:
                 logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Failed to queue manual clip task: {queue_error}")
    return {"status": "success", "video_path": video_path, "video_info": video_info}

if __name__ == "__main__":
    logger.info("Starting Download Worker...")
    try:
        celery_app.worker_main([
            'worker', 
            '-Q', 'download',
            '--loglevel=info', 
            '-P', 'processes',
            '--concurrency=5', 
            '--prefetch-multiplier=1',
            '-n', 'download_worker@%h'
        ])
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    finally:
        cleanup_thread_pool()
