import os
import uuid
import yt_dlp
import logging
import os
import atexit
import signal
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import partial

from shared.celery_config import celery_app, VIDEO_STORAGE_PATH
from shared.models import TaskStatus
from shared.utils import update_task_status, cleanup_files

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Thread pool for download operations - increased for batch processing
download_executor = ThreadPoolExecutor(max_workers=5, thread_name_prefix="download-thread")

def cleanup_thread_pool():
    """Cleanup function to properly shutdown the thread pool"""
    logger.info("Shutting down download thread pool...")
    download_executor.shutdown(wait=True, cancel_futures=True)
    logger.info("Download thread pool shutdown complete")

# Register cleanup function
atexit.register(cleanup_thread_pool)

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, initiating graceful shutdown...")
    cleanup_thread_pool()
    exit(0)

# Register signal handlers
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def _download_with_ydl(url: str, ydl_opts: dict) -> dict:
    """Internal function to handle the actual download with yt-dlp"""
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
        return video_info

def calculate_download_timeout(video_duration: int = None, base_timeout: int = 300) -> int:
    """
    Calculate appropriate timeout based on video duration
    Args:
        video_duration: Duration in seconds
        base_timeout: Base timeout in seconds (default 5 minutes)
    Returns:
        Timeout in seconds
    """
    if not video_duration or video_duration <= 0:
        # If no duration info, use a reasonable default (30 minutes)
        return 1800
    
    # Calculate timeout: base time + (duration * multiplier)
    # Assuming ~1-2x video duration for download on average connection
    # Add extra buffer for safety
    calculated_timeout = base_timeout + (video_duration * 3)  # 3x duration as safety buffer
    
    # Set reasonable bounds
    min_timeout = 120   # Minimum 2 minutes
    max_timeout = 7200  # Maximum 2 hours
    
    return max(min_timeout, min(calculated_timeout, max_timeout))

def download_video(url: str, timeout_minutes: int = None) -> tuple[str, dict]:
    """Download video in highest quality using ThreadPoolExecutor and return path + video info"""
    video_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(VIDEO_STORAGE_PATH, f"video_{video_id}.%(ext)s")
    logger.info(f"Starting download for video_id: {video_id}")
    
    # First, get video info to calculate appropriate timeout
    info_ydl_opts = {
        'quiet': True,
    }
    
    video_duration = None
    try:
        with yt_dlp.YoutubeDL(info_ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            video_duration = info.get('duration', 0)
            logger.info(f"Video duration: {video_duration} seconds ({video_duration//60 if video_duration else 0} minutes)")
    except Exception as e:
        logger.warning(f"Could not get video info for timeout calculation: {e}")
    
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': output_path,
        'quiet': True,
    }
    
    # Submit download task to thread pool
    future = download_executor.submit(_download_with_ydl, url, ydl_opts)
    
    try:
        # Calculate appropriate timeout
        if timeout_minutes:
            timeout_seconds = timeout_minutes * 60
        else:
            timeout_seconds = calculate_download_timeout(video_duration)
        
        logger.info(f"Using download timeout of {timeout_seconds} seconds ({timeout_seconds//60} minutes)")
        
        # Wait for download to complete
        video_info = future.result(timeout=timeout_seconds)
        
        # Find the actual downloaded file
        downloaded_files = [f for f in os.listdir(VIDEO_STORAGE_PATH) if f.startswith(f"video_{video_id}")]
        if not downloaded_files:
            raise Exception("Download completed but file not found")
        
        video_path = os.path.join(VIDEO_STORAGE_PATH, downloaded_files[0])
        
        logger.info(f"Video downloaded: {video_path}, size: {os.path.getsize(video_path)} bytes")
        return video_path, video_info
        
    except TimeoutError as timeout_error:
        logger.error(f"Download timed out for video_id {video_id} after {timeout_seconds} seconds")
        # Cancel the future if it's still running
        future.cancel()
        raise TimeoutError(f"Download timed out after {timeout_seconds//60} minutes")
    except Exception as e:
        logger.error(f"Download failed for video_id {video_id}: {str(e)}")
        # Cancel the future if it's still running
        future.cancel()
        raise

def download_multiple_videos(urls: list[str], timeout_minutes: int = None) -> list[tuple[str, dict]]:
    """Download multiple videos concurrently using ThreadPoolExecutor"""
    if not urls:
        return []
    
    logger.info(f"Starting concurrent download of {len(urls)} videos")
    futures = []
    
    # Submit all download tasks
    for url in urls:
        future = download_executor.submit(download_video, url, timeout_minutes)
        futures.append((url, future))
    
    results = []
    
    # Collect results as they complete
    for url, future in futures:
        try:
            # Individual timeouts are handled within download_video
            result = future.result()  # No timeout here since it's handled inside download_video
            results.append(result)
            logger.info(f"Successfully downloaded video from {url}")
        except Exception as e:
            logger.error(f"Failed to download video from {url}: {str(e)}")
            # Continue with other downloads even if one fails
    
    logger.info(f"Completed download of {len(results)}/{len(urls)} videos")
    return results

def create_optimal_batches(task_ids, urls, batch_size=15, **kwargs):
    """
    Create optimal batches for download processing
    Args:
        task_ids: List of task IDs
        urls: List of URLs to download
        batch_size: Optimal batch size (default 15 to match ThreadPool)
        **kwargs: Additional parameters for downloads
    Returns:
        List of batch parameters for Celery tasks
    """
    if len(urls) != len(task_ids):
        raise ValueError("Number of URLs must match number of task IDs")
    
    batches = []
    total_items = len(urls)
    
    # Split into batches
    for i in range(0, total_items, batch_size):
        end_idx = min(i + batch_size, total_items)
        
        batch_data = {
            'task_ids': task_ids[i:end_idx],
            'urls': urls[i:end_idx],
        }
        
        # Add optional parameters if provided
        for key, values in kwargs.items():
            if values and len(values) >= end_idx:
                batch_data[key] = values[i:end_idx]
            else:
                batch_data[key] = None
        
        batches.append(batch_data)
    
    logger.info(f"Created {len(batches)} optimal batches for {total_items} downloads")
    logger.info(f"Batch sizes: {[len(batch['urls']) for batch in batches]}")
    
    return batches

@celery_app.task(name='submit_download_batches', bind=True)
def submit_download_batches(self, task_ids, urls, aspect_ratios=None, multiple_clips=None, clip_types=None, start_times=None, end_times=None):
    """
    Smart batch submission task - splits large downloads into optimal batches
    Use this for 10+ URLs instead of individual download_task calls
    """
    total_urls = len(urls)
    logger.info(f"[BATCH_SUBMITTER] Received {total_urls} URLs for batch processing")
    
    # Create optimal batches
    batches = create_optimal_batches(
        task_ids=task_ids,
        urls=urls,
        aspect_ratios=aspect_ratios,
        multiple_clips=multiple_clips,
        clip_types=clip_types,
        start_times=start_times,
        end_times=end_times
    )
    
    # Submit batch tasks
    batch_task_ids = []
    for i, batch in enumerate(batches):
        logger.info(f"[BATCH_SUBMITTER] Submitting batch {i+1}/{len(batches)} with {len(batch['urls'])} URLs")
        
        batch_task = celery_app.send_task(
            'download_batch_task',
            kwargs=batch,
            queue='download',
            routing_key='download'
        )
        batch_task_ids.append(batch_task.id)
        logger.info(f"[BATCH_SUBMITTER] Batch {i+1} submitted with task ID: {batch_task.id}")
    
    logger.info(f"[BATCH_SUBMITTER] All {len(batches)} batches submitted successfully")
    return {
        "status": "success",
        "total_urls": total_urls,
        "num_batches": len(batches),
        "batch_task_ids": batch_task_ids
    }

@celery_app.task(name='download_batch_task', bind=True)
def download_batch_task(self, task_ids, urls, aspect_ratios=None, multiple_clips=None, clip_types=None, start_times=None, end_times=None):
    """Download multiple videos in a single task using ThreadPoolExecutor"""
    batch_size = len(urls)
    logger.info(f"[DOWNLOAD_WORKER] Starting batch download for {batch_size} URLs")
    logger.info(f"[DOWNLOAD_WORKER] Batch task ID: {self.request.id}")
    
    # Prepare parameters for each URL
    download_params = []
    for i, url in enumerate(urls):
        params = {
            'task_id': task_ids[i],
            'url': url,
            'aspect_ratio': aspect_ratios[i] if aspect_ratios else None,
            'multiple_clips': multiple_clips[i] if multiple_clips else None,
            'clip_type': clip_types[i] if clip_types else "AI",
            'start_time': start_times[i] if start_times else None,
            'end_time': end_times[i] if end_times else None,
        }
        download_params.append(params)
    
    # Use ThreadPoolExecutor to download multiple videos concurrently
    logger.info(f"[DOWNLOAD_WORKER] Submitting {batch_size} downloads to ThreadPool (max_workers={download_executor._max_workers})")
    results = []
    futures = []
    
    # Submit all downloads to thread pool
    for params in download_params:
        future = download_executor.submit(process_single_download, params)
        futures.append((params['task_id'], params['url'], future))
    
    # Collect results as they complete
    completed = 0
    failed = 0
    successful_downloads = []
    failed_downloads = []
    
    for task_id, url, future in futures:
        try:
            result = future.result()
            results.append(result)
            successful_downloads.append({"task_id": task_id, "url": url})
            completed += 1
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Batch download completed successfully ({completed}/{batch_size})")
        except Exception as e:
            failed += 1
            failed_downloads.append({"task_id": task_id, "url": url, "error": str(e)})
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Batch download failed: {str(e)} ({failed} failed so far)")
            # Individual failure handling - don't stop the batch
            try:
                update_task_status(task_id, TaskStatus.FAILED, 0, f"Download failed: {str(e)}")
            except Exception as status_error:
                logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Failed to update status: {status_error}")
    
    logger.info(f"[DOWNLOAD_WORKER] Batch complete: {completed} successful, {failed} failed out of {batch_size} total")
    
    # Log detailed results
    if successful_downloads:
        logger.info(f"[DOWNLOAD_WORKER] Successful downloads: {[d['task_id'] for d in successful_downloads]}")
    if failed_downloads:
        logger.warning(f"[DOWNLOAD_WORKER] Failed downloads: {[(d['task_id'], d['error']) for d in failed_downloads]}")
    
    return {
        "status": "completed",  # Changed from "success" to "completed" to indicate mixed results
        "completed": completed, 
        "failed": failed,
        "total": batch_size,
        "batch_task_id": self.request.id,
        "successful_downloads": successful_downloads,
        "failed_downloads": failed_downloads
    }

def process_single_download(params):
    """Process a single download within a batch - isolated error handling"""
    task_id = params['task_id']
    url = params['url']
    aspect_ratio = params['aspect_ratio']
    multiple_clips = params['multiple_clips']
    clip_type = params['clip_type']
    start_time = params['start_time']
    end_time = params['end_time']
    
    video_path = None
    video_info = None
    
    try:
        logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Starting download in batch")
        
        # Update status to downloading
        try:
            update_task_status(task_id, TaskStatus.DOWNLOADING, 10, "Downloading video")
        except Exception as status_error:
            logger.warning(f"[DOWNLOAD_WORKER] Task {task_id}: Could not update status to DOWNLOADING: {status_error}")
        
        # Attempt the download with timeout handling
        try:
            video_path, video_info = download_video(url)
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Video downloaded to {video_path}")
        except TimeoutError:
            error_msg = "Download timed out"
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: {error_msg}")
            update_task_status(task_id, TaskStatus.FAILED, 0, error_msg)
            raise Exception(error_msg)
        except Exception as download_error:
            error_msg = f"Download failed: {str(download_error)}"
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: {error_msg}")
            update_task_status(task_id, TaskStatus.FAILED, 0, error_msg)
            raise Exception(error_msg)
        
        # Update status to downloaded - only if download succeeded
        try:
            update_task_status(task_id, TaskStatus.DOWNLOADED, 30, "Video downloaded")
        except Exception as status_error:
            logger.warning(f"[DOWNLOAD_WORKER] Task {task_id}: Could not update status to DOWNLOADED: {status_error}")
            # Don't fail the download just because status update failed
        
        # Queue next task based on clip type - ONLY if download was successful
        try:
            if clip_type == "AI":
                celery_app.send_task(
                    'transcribe_task',
                    args=[task_id, video_path, url, aspect_ratio, multiple_clips, video_info],
                    queue='transcribe',
                    routing_key='transcribe'
                )
                logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Transcribe task queued successfully")
            else:  # MANUAL
                celery_app.send_task(
                    'manual_clip_task',
                    args=[task_id, video_path, start_time, end_time, aspect_ratio],
                    queue='clip',
                    routing_key='clip'
                )
                logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Manual clip task queued successfully")
        except Exception as queue_error:
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Failed to queue next task: {queue_error}")
            # Don't fail the download just because queuing failed, but log it prominently
            logger.warning(f"[DOWNLOAD_WORKER] Task {task_id}: Download succeeded but next task not queued!")
        
        # Return success only if we reach this point (download succeeded)
        return {"task_id": task_id, "status": "success", "video_path": video_path, "video_info": video_info}
        
    except Exception as e:
        # Final catch-all for any unhandled errors
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: {error_msg}")
        
        # Try to update status one more time
        try:
            update_task_status(task_id, TaskStatus.FAILED, 0, error_msg)
        except Exception as final_status_error:
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Could not update final status: {final_status_error}")
        
        # Re-raise to be caught by batch handler - NO transcribe task will be queued
        raise Exception(error_msg)

@celery_app.task(name='download_task', bind=True)
def download_task(self, task_id, url, aspect_ratio=None, multiple_clips=None, clip_type="AI", start_time=None, end_time=None):
    """Download video task - handles queuing of next task to appropriate queue"""
    logger.info(f"[DOWNLOAD_WORKER] Starting download task for task_id: {task_id}, url: {url}")
    logger.info(f"[DOWNLOAD_WORKER] Task z{task_id}: clip_type={clip_type}, aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
    
    video_path = None
    video_info = None
    
    try:
        logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Updating status to DOWNLOADING")
        update_task_status(task_id, TaskStatus.DOWNLOADING, 10, "Downloading video")
        
        logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Calling download_video function")
        try:
            video_path, video_info = download_video(url)
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Video downloaded to {video_path}")
        except Exception as download_error:
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Download failed with error: {str(download_error)}")
            update_task_status(task_id, TaskStatus.FAILED, 0, f"Download failed: {str(download_error)}")
            raise  # Re-raise to exit the task without queuing next task
        
        # Only update to DOWNLOADED if download actually succeeded
        update_task_status(task_id, TaskStatus.DOWNLOADED, 30, "Video downloaded")
        
        # Only queue next task if download was successful
        if clip_type == "AI":
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Queuing transcribe task to 'transcribe' queue")
            try:
                celery_app.send_task(
                    'transcribe_task',
                    args=[task_id, video_path, url, aspect_ratio, multiple_clips, video_info],
                    queue='transcribe',
                    routing_key='transcribe'
                )
                logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Transcribe task queued successfully to 'transcribe' queue")
            except Exception as queue_error:
                logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Failed to queue transcribe task: {queue_error}")
                # Don't fail the download task just because queuing failed
        else:  # MANUAL
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Queuing manual clip task to 'clip' queue")
            logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Manual clip params - start: {start_time}, end: {end_time}")
            try:
                celery_app.send_task(
                    'manual_clip_task',
                    args=[task_id, video_path, start_time, end_time, aspect_ratio],
                    queue='clip',
                    routing_key='clip'
                )
                logger.info(f"[DOWNLOAD_WORKER] Task {task_id}: Manual clip task queued successfully to 'clip' queue")
            except Exception as queue_error:
                logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Failed to queue manual clip task: {queue_error}")
                # Don't fail the download task just because queuing failed

        return {"status": "success", "video_path": video_path, "video_info": video_info}

    except Exception as e:
        logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Task failed with error: {str(e)}")
        # Ensure status is marked as failed if not already done
        try:
            update_task_status(task_id, TaskStatus.FAILED, 0, f"Download failed: {str(e)}")
        except Exception as status_error:
            logger.error(f"[DOWNLOAD_WORKER] Task {task_id}: Could not update final status: {status_error}")
        raise

if __name__ == "__main__":
    
    logger.info("Starting Download Worker with process pool and batch processing...")
    try:
        celery_app.worker_main([
            'worker', 
            '-Q', 'download',
            '--loglevel=info', 
            '-P', 'processes',  
            '--concurrency=10',  
            '--prefetch-multiplier=1',
            '-n', 'download_worker@%h'
        ])
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    finally:
        cleanup_thread_pool()
