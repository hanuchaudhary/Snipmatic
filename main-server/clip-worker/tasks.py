import os
import uuid
import zipfile
import ffmpeg
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import os
import boto3

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.celery_config import celery_app, CLIP_STORAGE_PATH
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files, time_to_seconds

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = None
if AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY and S3_BUCKET_NAME:
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
            region_name=AWS_REGION
        )
        logger.info("S3 client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize S3 client: {str(e)}")
        s3_client = None
else:
    logger.warning("S3 credentials not configured - S3 upload will be disabled")


def upload_to_s3(file_path: str, clip_id: str, user_id: str, is_zip: bool = False) -> str:
    """Upload clip to S3 and return URL"""
    if not S3_BUCKET_NAME or not s3_client:
        logger.warning("S3 not configured, skipping S3 upload")
        return ""
    
    if is_zip:
        s3_key = f"clips/{user_id}/{clip_id}.zip"
        content_type = 'application/zip'
    else:
        s3_key = f"clips/{user_id}/{clip_id}.mp4"
        content_type = 'video/mp4'
    
    logger.info(f"Uploading {file_path} to S3 bucket {S3_BUCKET_NAME} with key {s3_key}")
    
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        s3_client.upload_file(
            file_path,
            S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': content_type}
        )
        
        cloudfront_url = f"https://d10d2f3sgu39wn.cloudfront.net/{s3_key}"
        logger.info(f"Upload successful. CloudFront URL: {cloudfront_url}")
        return cloudfront_url
        
    except Exception as e:
        logger.error(f"Failed to upload to S3: {str(e)}")
        raise Exception(f"Failed to upload to S3: {str(e)}")


def upload_clips_to_s3(clip_paths: list, user_id: str) -> list:
    """Upload multiple clips to S3 and return URLs"""
    s3_urls = []
    
    for clip_path in clip_paths:
        try:
            filename = os.path.basename(clip_path)
            clip_id = filename.replace('.mp4', '')
            
            s3_url = upload_to_s3(clip_path, clip_id, user_id, is_zip=False)
            s3_urls.append(s3_url)
            logger.info(f"Uploaded clip to S3: {s3_url}")
            
        except Exception as e:
            logger.error(f"Failed to upload clip {clip_path}: {str(e)}")
            s3_urls.append("")  # Add empty string to maintain index alignment
    
    return s3_urls


def create_clip(video_path: str, start_time: float, end_time: float, aspect_ratio: str) -> str:
    """Create a clip from video with specified aspect ratio"""
    logger.info("========== Starting create_clip ==========")
    logger.info(f"Input video path: {video_path}")
    logger.info(f"Clip start_time: {start_time}, end_time: {end_time}")
    logger.info(f"Aspect ratio requested: {aspect_ratio}")

    clip_id = str(uuid.uuid4())[:8]
    logger.info(f"Generated clip ID: {clip_id}")

    output_filename = f"clip_{clip_id}_{start_time}_{end_time}.mp4"
    logger.info(f"Output filename: {output_filename}")

    output_path = os.path.join(CLIP_STORAGE_PATH, output_filename)
    logger.info(f"Full output path: {output_path}")

    try:
        duration = end_time - start_time
        logger.info(f"Calculated clip duration: {duration} seconds")

        logger.info("Initializing FFmpeg input stream")
        input_stream = ffmpeg.input(video_path, ss=start_time, t=duration)

        logger.info("Applying aspect ratio filters")
        if aspect_ratio == "vertical":
            logger.info("Applying vertical (1080x1920) scaling and padding")
            video = input_stream['v'].filter('scale', 1080, 1920, force_original_aspect_ratio='decrease') \
                                    .filter('pad', 1080, 1920, '(ow-iw)/2', '(oh-ih)/2', color='black')
        elif aspect_ratio == "square":
            logger.info("Applying square (1080x1080) scaling and padding")
            video = input_stream['v'].filter('scale', 1080, 1080, force_original_aspect_ratio='decrease') \
                                    .filter('pad', 1080, 1080, '(ow-iw)/2', '(oh-ih)/2', color='black')
        else:
            logger.info("Keeping original aspect ratio (no scale/pad)")
            video = input_stream['v']

        # Explicitly reference the audio stream
        audio = input_stream['a']
        logger.info("Audio stream initialized from input stream")

        if duration > 2:
            logger.info("Applying fade-in/out to video stream")
            video = video.filter('fade', type='in', start_time=0, duration=0.5) \
                         .filter('fade', type='out', start_time=duration - 1, duration=0.5)

            logger.info("Applying afade-in/out to audio stream")
            audio = audio.filter('afade', type='in', start_time=0, duration=0.5) \
                         .filter('afade', type='out', start_time=duration - 1, duration=0.5)
        else:
            logger.info("Duration too short for fade effects. Skipping fade.")

        logger.info("Setting up FFmpeg output stream")
        out = ffmpeg.output(
            video,
            audio,
            output_path,
            vcodec='libx264',
            acodec='aac',
            crf=23,
            preset='medium'
        )

        logger.info("Compiling FFmpeg command (optional):")
        logger.debug(f"Compiled command: {' '.join(ffmpeg.compile(out))}")

        logger.info(f"Running FFmpeg to generate clip at: {output_path}")
        ffmpeg.run(out, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        if not os.path.exists(output_path):
            logger.error("Output file not created after FFmpeg run")
            raise Exception("Clip creation failed - output file missing")

        size = os.path.getsize(output_path)
        logger.info(f"Clip created successfully: {output_path} (size: {size} bytes)")
        logger.info("========== Finished create_clip ==========")
        return output_path

    except ffmpeg.Error as e:
        stderr_output = e.stderr.decode() if e.stderr else "No stderr captured"
        logger.error(f"FFmpeg error during clip creation:\n{stderr_output}")
        logger.exception("Full FFmpeg exception stack trace:")
        raise Exception(f"Clip creation failed: {stderr_output}")
    except Exception as e:
        logger.exception(f"Unexpected error in create_clip: {e}")
        raise


@celery_app.task(name='clip_task', bind=True)
def clip_task(self, task_id, video_path, viral_moments, aspect_ratio, multiple_clips, user_id):
    """Clip generation task for AI-identified viral moments"""
    logger.info(f"[CLIP_WORKER] Starting AI clip task for task_id: {task_id}, video_path: {video_path}")
    logger.info(f"[CLIP_WORKER] Task {task_id}: aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}, user_id={user_id}")
    logger.info(f"[CLIP_WORKER] Task {task_id}: Processing {len(viral_moments)} viral moments")
    
    try:
        logger.info(f"[CLIP_WORKER] Task {task_id}: Updating status to CREATING_CLIPS")
        update_task_status(task_id, TaskStatus.CREATING_CLIPS, 90, "Generating clips")
        clip_paths = []
        
        if multiple_clips:
            logger.info(f"[CLIP_WORKER] Task {task_id}: Creating multiple clips for all viral moments")
            # Process all viral moments with ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=5) as executor:
                logger.info(f"[CLIP_WORKER] Task {task_id}: Starting ThreadPoolExecutor with 5 workers")
                futures = [
                    executor.submit(
                        create_clip, 
                        video_path, 
                        moment['start_time'], 
                        moment['end_time'], 
                        aspect_ratio
                    )
                    for moment in viral_moments
                ]
                
                for i, future in enumerate(as_completed(futures)):
                    clip_path = future.result()
                    clip_paths.append(clip_path)
                    logger.info(f"[CLIP_WORKER] Task {task_id}: Clip {i+1}/{len(viral_moments)} created: {clip_path}")
        else:
            logger.info(f"[CLIP_WORKER] Task {task_id}: Creating single clip for best viral moment")
            # Process only the best viral moment
            best_moment = max(
                viral_moments, 
                key=lambda x: x['confidence_score']
            )
            logger.info(f"[CLIP_WORKER] Task {task_id}: Best moment selected: {best_moment['start_time']}-{best_moment['end_time']}s (score: {best_moment['confidence_score']})")
            clip_path = create_clip(
                video_path, 
                best_moment['start_time'], 
                best_moment['end_time'], 
                aspect_ratio
            )
            clip_paths.append(clip_path)
            logger.info(f"[CLIP_WORKER] Task {task_id}: Single clip created: {clip_path}")
        
        # Upload clips to S3
        logger.info(f"[CLIP_WORKER] Task {task_id}: Uploading clips to S3")
        s3_urls = upload_clips_to_s3(clip_paths, user_id)
        
        # Create ZIP if multiple clips
        zip_path = None
        zip_s3_url = ""
        if multiple_clips and len(clip_paths) > 1:
            logger.info(f"[CLIP_WORKER] Task {task_id}: Creating ZIP file for {len(clip_paths)} clips")
            zip_path = os.path.join(CLIP_STORAGE_PATH, f"{task_id}.zip")
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for i, clip in enumerate(clip_paths):
                    clip_name = f"clip_{i+1}_{os.path.basename(clip)}"
                    zipf.write(clip, clip_name)
                    logger.info(f"[CLIP_WORKER] Task {task_id}: Added {clip_name} to ZIP")
            logger.info(f"[CLIP_WORKER] Task {task_id}: ZIP file created: {zip_path}")
            zip_s3_url = upload_to_s3(zip_path, task_id, user_id, is_zip=True)

        # Prepare result
        result = {
            "viral_moments": viral_moments,
            "clip_paths": clip_paths,
            "s3_urls": s3_urls,
            "zip_path": zip_path,
            "zip_s3_url": zip_s3_url
        }
        
        logger.info(f"[CLIP_WORKER] Task {task_id}: AI clip task completed successfully")
        logger.info(f"[CLIP_WORKER] Task {task_id}: Result summary - clips: {len(clip_paths)}, zip: {zip_path is not None}")
        update_task_status(
            task_id, 
            TaskStatus.COMPLETED, 
            100, 
            "Clips created successfully", 
            result
        )
        
        return result
    except Exception as e:
        logger.error(f"[CLIP_WORKER] Task {task_id}: AI clip creation failed with error: {str(e)}")
        update_task_status(task_id, TaskStatus.FAILED, 0, f"Clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file after clip processing is complete
        if video_path and os.path.exists(video_path):
            logger.info(f"[CLIP_WORKER] Task {task_id}: Cleaning up video file: {video_path}")
            # cleanup_files(video_path)

@celery_app.task(name='manual_clip_task', bind=True)
def manual_clip_task(self, task_id, video_path, start_time, end_time, aspect_ratio, user_id):
    """Manual clip creation task"""
    logger.info(f"[CLIP_WORKER] Starting manual clip task for task_id: {task_id}")
    logger.info(f"[CLIP_WORKER] Task {task_id}: video_path={video_path}, start={start_time}, end={end_time}, aspect_ratio={aspect_ratio}, user_id={user_id}")
    
    try:
        logger.info(f"[CLIP_WORKER] Task {task_id}: Updating status to CREATING_CLIPS")
        update_task_status(task_id, TaskStatus.CREATING_CLIPS, 90, "Generating clip")
        
        logger.info(f"[CLIP_WORKER] Task {task_id}: Converting time strings to seconds")
        start_seconds = time_to_seconds(start_time)
        end_seconds = time_to_seconds(end_time)
        logger.info(f"[CLIP_WORKER] Task {task_id}: Time conversion - start: {start_seconds}s, end: {end_seconds}s")
        
        logger.info(f"[CLIP_WORKER] Task {task_id}: Creating clip")
        clip_path = create_clip(
            video_path,
            start_seconds,
            end_seconds,
            aspect_ratio
        )
        logger.info(f"[CLIP_WORKER] Task {task_id}: Clip created successfully: {clip_path}")
        
        logger.info(f"[CLIP_WORKER] Task {task_id}: Uploading clip to S3")
        s3_urls = upload_clips_to_s3([clip_path], user_id)
        s3_url = s3_urls[0] if s3_urls else ""
        
        # Prepare result
        result = {
            "clip_paths": [clip_path],
            "s3_urls": s3_urls,
            "s3_url": s3_url,
            "zip_path": None,
            "zip_s3_url": ""
        }
        
        logger.info(f"[CLIP_WORKER] Task {task_id}: Manual clip task completed successfully")
        update_task_status(
            task_id, 
            TaskStatus.COMPLETED, 
            100, 
            "Manual clip created successfully", 
            result
        )
        
        return result
    except Exception as e:
        logger.error(f"[CLIP_WORKER] Task {task_id}: Manual clip creation failed with error: {str(e)}")
        update_task_status(task_id, TaskStatus.FAILED, 0, f"Manual clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file
        if video_path and os.path.exists(video_path):
            logger.info(f"[CLIP_WORKER] Task {task_id}: Cleaning up video file: {video_path}")
            # cleanup_files(video_path)

if __name__ == "__main__":
    # Run as Celery worker - CPU bound, moderate concurrency
    logger.info("Starting Clip Worker...")
    celery_app.worker_main([
        'worker', 
        '-Q', 'clip',
        '--loglevel=info', 
        '--concurrency=4', 
        '--prefetch-multiplier=1',
        '-n', 'clip_worker@%h'
    ])
