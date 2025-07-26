from gevent import monkey
monkey.patch_all()
import os
import uuid
import yt_dlp
import logging
import os

from shared.celery_config import celery_app, VIDEO_STORAGE_PATH
from shared.models import TaskStatus
from shared.utils import update_task_status, cleanup_files

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def download_video(url: str) -> tuple[str, dict]:
    """Download video in highest quality and return path + video info"""
    video_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(VIDEO_STORAGE_PATH, f"video_{video_id}.%(ext)s")
    print("hi this was executed")
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': output_path,
        'quiet': True,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        # Get video info first
        info = ydl.extract_info(url, download=False)
        video_info = {
            'title': info.get('title', 'Unknown'),
            'description': info.get('description', ''),
            'duration': info.get('duration', 0),
            'uploader': info.get('uploader', 'Unknown'),
            'upload_date': info.get('upload_date', ''),
        }
        
        # Download the video
        ydl.download([url])
        
        # Find the actual downloaded file
        downloaded_files = [f for f in os.listdir(VIDEO_STORAGE_PATH) if f.startswith(f"video_{video_id}")]
        if not downloaded_files:
            raise Exception("Download completed but file not found")
        
        video_path = os.path.join(VIDEO_STORAGE_PATH, downloaded_files[0])
        
        logger.info(f"Video downloaded: {video_path}, size: {os.path.getsize(video_path)} bytes")
        return video_path, video_info

@celery_app.task(name='download_task', bind=True)
def download_task(self, task_id, url, aspect_ratio=None, multiple_clips=None, clip_type="AI", start_time=None, end_time=None):
    """Download video task - handles queuing of next task to appropriate queue"""
    logger.info(f"[DOWNLOAD_WORKER] Starting download task for task_id: {task_id}, url: {url}")
    logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: clip_type={clip_type}, aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
    
    try:
        logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Updating status to DOWNLOADING")
        update_task_status(task_id, TaskStatus.DOWNLOADING, 10, "Downloading video")
        
        logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Calling download_video function")
        video_path, video_info = download_video(url)
        logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Video downloaded to {video_path}")
        
        update_task_status(task_id, TaskStatus.DOWNLOADED, 30, "Video downloaded")
        
        if clip_type == "AI":
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Queuing transcribe task to 'transcribe' queue")
            # Queue to transcribe queue
            celery_app.send_task(
                'transcribe_task',
                args=[task_id, video_path, url, aspect_ratio, multiple_clips, video_info],
                queue='transcribe',
                routing_key='transcribe'
            )
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Transcribe task queued successfully to 'transcribe' queue")
        else:  # MANUAL
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Queuing manual clip task to 'clip' queue")
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Manual clip params - start: {start_time}, end: {end_time}")
            # Queue to clip queue
            celery_app.send_task(
                'manual_clip_task',
                args=[task_id, video_path, start_time, end_time, aspect_ratio],
                queue='clip',
                routing_key='clip'
            )
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Manual clip task queued successfully to 'clip' queue")

        return {"status": "success", "video_path": video_path, "video_info": video_info}

    except Exception as e:
        logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Download failed with error: {str(e)}")
        update_task_status(task_id, TaskStatus.FAILED, 0, f"Download failed: {str(e)}")
        raise

if __name__ == "__main__":
    # Run as Celery worker - I/O bound, can have higher concurrency
    logger.info("Starting Download Worker...")
    celery_app.worker_main([
        'worker', 
        '-Q', 'download',
        '--loglevel=info', 
        '-P', 'gevent',
        '--concurrency=30', 
        '--prefetch-multiplier=1',
        '-n', 'download_worker@%h'
    ])
