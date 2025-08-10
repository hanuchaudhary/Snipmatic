import uuid
import zipfile
import ffmpeg
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import os
import boto3
from typing import Optional

from shared.celery_config import celery_app, CLIP_STORAGE_PATH
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files, time_to_seconds, send_email_notification, generate_subtitle_file, burn_subtitles_to_video

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


def create_clip(video_path: str, start_time: float, end_time: float, aspect_ratio: str, subtitle_segments: Optional[list] = None, enable_subtitles: bool = False) -> str:
    """Create a clip from video with specified aspect ratio and optional subtitles"""

    clip_id = str(uuid.uuid4())[:8]
    output_filename = f"clip_{clip_id}_{start_time}_{end_time}.mp4"
    output_path = os.path.join(CLIP_STORAGE_PATH, output_filename)

    try:
        duration = end_time - start_time
        input_stream = ffmpeg.input(video_path, ss=start_time, t=duration)
      
        if aspect_ratio == "vertical":
            video = input_stream['v'].filter('scale', 1080, 1920, force_original_aspect_ratio='decrease') \
                                    .filter('pad', 1080, 1920, '(ow-iw)/2', '(oh-ih)/2', color='black')
        elif aspect_ratio == "square":
            video = input_stream['v'].filter('scale', 1080, 1080, force_original_aspect_ratio='decrease') \
                                    .filter('pad', 1080, 1080, '(ow-iw)/2', '(oh-ih)/2', color='black')
        else:
            video = input_stream['v']

        # Explicitly reference the audio stream
        audio = input_stream['a']
      
        if duration > 2:
            video = video.filter('fade', type='in', start_time=0, duration=0.5) \
                         .filter('fade', type='out', start_time=duration - 1, duration=0.5)
            audio = audio.filter('afade', type='in', start_time=0, duration=0.5) \
                         .filter('afade', type='out', start_time=duration - 1, duration=0.5)
        else:
            logger.info("Duration too short for fade effects. Skipping fade.")

        # Create temporary output for the clip (without subtitles)
        temp_output = None
        final_output = output_path

        if enable_subtitles and subtitle_segments:
            # Create temporary file for clip without subtitles
            temp_output = os.path.join(CLIP_STORAGE_PATH, f"temp_clip_{clip_id}.mp4")
            final_output = temp_output
            
        logger.info("Setting up FFmpeg output stream")
        out = ffmpeg.output(
            video,
            audio,
            final_output,
            vcodec='libx264',
            acodec='aac',
            crf=23,
            preset='medium'
        )
        logger.debug(f"Compiled command: {' '.join(ffmpeg.compile(out))}")
        ffmpeg.run(out, overwrite_output=True, capture_stdout=True, capture_stderr=True)

        if not os.path.exists(final_output):
            raise Exception("Clip creation failed - output file missing")

        # if subtitles === true
        if enable_subtitles and subtitle_segments and temp_output:
            logger.info(f"Adding subtitles to clip {clip_id}")
            
            # SRT file
            srt_filename = f"subtitles_{clip_id}.srt"
            srt_path = os.path.join(CLIP_STORAGE_PATH, srt_filename)
            
            generate_subtitle_file(subtitle_segments, start_time, end_time, srt_path)
            
            # Burn subtitles into the final video
            burn_subtitles_to_video(temp_output, srt_path, output_path)
            
            # Clean up temporary files
            if os.path.exists(temp_output):
                os.remove(temp_output)
            if os.path.exists(srt_path):
                os.remove(srt_path)

        size = os.path.getsize(output_path)
        logger.info(f"Clip created successfully: {output_path} (size: {size} bytes)")
        logger.info("========== Finished create_clip ==========")
        return output_path

    except ffmpeg.Error as e:
        stderr_output = e.stderr.decode() if e.stderr else "No stderr captured"
        raise Exception(f"Clip creation failed: {stderr_output}")
    except Exception as e:
        logger.exception(f"Unexpected error in create_clip: {e}")
        raise


@celery_app.task(name='clip_task', bind=True)
def clip_task(self, task_id, video_path, viral_moments, subtitle_segments, aspect_ratio, multiple_clips, user_id, subtitles=False):
    """Clip generation task for AI-identified viral moments"""
  
    try:
        
        update_task_status(task_id, TaskStatus.CREATING_CLIPS, 90, "Generating clips")
        clip_paths = []
        
        if multiple_clips:
            # Process all viral moments with ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=5) as executor:
                logger.info(f"[CLIP_WORKER] Task {task_id}: Starting ThreadPoolExecutor with 5 workers")
                futures = [
                    executor.submit(
                        create_clip, 
                        video_path, 
                        moment['start_time'], 
                        moment['end_time'], 
                        aspect_ratio,
                        subtitle_segments,
                        subtitles
                    )
                    for moment in viral_moments
                ]
                
                for i, future in enumerate(as_completed(futures)):
                    clip_path = future.result()
                    clip_paths.append(clip_path)
                    logger.info(f"[CLIP_WORKER] Task {task_id}: Clip {i+1}/{len(viral_moments)} created: {clip_path}")
        else:
            
            best_moment = max(
                viral_moments, 
                key=lambda x: x['confidence_score']
            )
            
            clip_path = create_clip(
                video_path, 
                best_moment['start_time'], 
                best_moment['end_time'], 
                aspect_ratio,
                subtitle_segments,
                subtitles
            )
            clip_paths.append(clip_path)
        
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
        
        update_task_status(
            task_id, 
            TaskStatus.COMPLETED, 
            100, 
            "Clips created successfully", 
            result
        )
        send_email_notification(task_id) 
        return result
    except Exception as e:
        logger.error(f"[CLIP_WORKER] Task {task_id}: AI clip creation failed with error: {str(e)}")
        update_task_status(task_id, TaskStatus.FAILED, 0, f"Clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file after clip processing is complete
        if video_path and os.path.exists(video_path):
            logger.info(f"[CLIP_WORKER] Task {task_id}: Cleaning up video file: {video_path}")
            cleanup_files(video_path)

@celery_app.task(name='manual_clip_task', bind=True)
def manual_clip_task(self, task_id, video_path, start_time, end_time, aspect_ratio, user_id, subtitles=False):
    """Manual clip creation task"""
    
    try:
        
        update_task_status(task_id, TaskStatus.CREATING_CLIPS, 90, "Generating clip")
        
       
        start_seconds = time_to_seconds(start_time)
        end_seconds = time_to_seconds(end_time)
        
        # TODO: ADD SUBTITLES FEATURE FOR MANUAL CLIPS
        clip_path = create_clip(
            video_path,
            start_seconds,
            end_seconds,
            aspect_ratio,
            subtitle_segments=[],  # Empty for manual clips
            enable_subtitles=False  # manual subtitles === False for now
        )
        
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
    try:
        logger.info("Starting Clip Worker...")
        celery_app.worker_main([
            'worker', 
            '-Q', 'clip',
            '--loglevel=info', 
            '--concurrency=4', 
            '--prefetch-multiplier=1',
            '-n', 'clip_worker@%h'
        ])
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")