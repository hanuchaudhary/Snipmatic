import uuid
import zipfile
import ffmpeg
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import os
import boto3
from typing import Optional
import time
import random
from shared.celery_config import celery_app, CLIP_STORAGE_PATH
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files, time_to_seconds, send_email_notification, format_srt_time
from threading import Lock
# Initialize a lock for thread-safe operations
lock = Lock()
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
CLOUDFRONT_URL = os.getenv("CLOUDFRONT_URL")

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

def generate_subtitle_file(subtitle_segments: list, clip_start: float, clip_end: float, output_path: str) -> str:
    """Generate SRT subtitle file for a specific clip timeframe"""
    
    clip_segments = []
    for seg in subtitle_segments:
        # Check if segment overlaps with clip
        if seg['start'] < clip_end and seg['end'] > clip_start:
            # Adjust timing relative to clip start
            adjusted_start = max(0, seg['start'] - clip_start)
            adjusted_end = min(clip_end - clip_start, seg['end'] - clip_start)
            
            if adjusted_start < adjusted_end:  # Valid segment
                clip_segments.append({
                    'start': adjusted_start,
                    'end': adjusted_end,
                    'text': seg['text']
                })
    
    # Group words into subtitle chunks (3-5 words per subtitle)
    subtitle_chunks = []
    current_chunk = []
    chunk_start = 0
    words_per_chunk = 4
    
    for i, seg in enumerate(clip_segments):
        if len(current_chunk) == 0:
            chunk_start = seg['start']
        
        current_chunk.append(seg['text'])
        
        # Create chunk when we have enough words or reach end
        if len(current_chunk) >= words_per_chunk or i == len(clip_segments) - 1:
            if current_chunk:
                subtitle_chunks.append({
                    'start': chunk_start,
                    'end': seg['end'],
                    'text': ' '.join(current_chunk)
                })
            current_chunk = []
    
    # Generate SRT content
    srt_content = ""
    for i, chunk in enumerate(subtitle_chunks, 1):
        start_time = format_srt_time(chunk['start'])
        end_time = format_srt_time(chunk['end'])
        
        srt_content += f"{i}\n"
        srt_content += f"{start_time} --> {end_time}\n"
        srt_content += f"{chunk['text']}\n\n"
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(srt_content)
    
    return output_path


def burn_subtitles_to_video(input_video: str, srt_file: str, output_video: str, video_width: int = 1080, video_height: int = 1920):
    """Burn subtitles into video using FFmpeg"""
    
    try:
        logger.info(f"Burning subtitles: {input_video} -> {output_video}")
        logger.info(f"SRT file: {srt_file}")
        
        # Verify input file has audio
        probe = ffmpeg.probe(input_video)
        audio_streams = [stream for stream in probe['streams'] if stream['codec_type'] == 'audio']
        video_streams = [stream for stream in probe['streams'] if stream['codec_type'] == 'video']
        
        logger.info(f"Input video has {len(video_streams)} video streams and {len(audio_streams)} audio streams")
        
        subtitle_style = (
            "FontName=Roboto Bold,"
            "FontSize=15,"
            "PrimaryColour=&HFFFFFF&," 
            "OutlineColour=&H000000&,"
            "Bold=1,"
            "Italic=0,"
            "Underline=0,"
            "BorderStyle=1,"
            "Outline=2,"
            "Shadow=0,"
            "Alignment=2,"
            "MarginL=60,"
            "MarginR=60,"
            "MarginV=30"
        )

        # Create input stream
        input_stream = ffmpeg.input(input_video)
        
        if len(audio_streams) > 0:
            # Apply subtitle filter to video stream only and keep audio
            video_with_subtitles = input_stream['v'].filter('subtitles', srt_file, force_style=subtitle_style, threads=3)
            audio = input_stream['a']
            
            # Output with both video (with subtitles) and audio
            out = ffmpeg.output(video_with_subtitles, audio, output_video, vcodec='libx264', acodec='aac', crf=28, threads=3, preset='faster')
        else:
            # No audio stream, just video with subtitles
            logger.warning("No audio stream found in input video!")
            video_with_subtitles = input_stream.filter('subtitles', srt_file, force_style=subtitle_style)
            out = ffmpeg.output(video_with_subtitles, output_video, vcodec='libx264', crf=28, threads=3, preset='faster')
        
        # Run the command
        ffmpeg.run(out, overwrite_output=True, capture_stdout=True, capture_stderr=True)
        
        # Verify output has audio
        if os.path.exists(output_video):
            output_probe = ffmpeg.probe(output_video)
            output_audio_streams = [stream for stream in output_probe['streams'] if stream['codec_type'] == 'audio']
            logger.info(f"Output video has {len(output_audio_streams)} audio streams")
        
        return output_video
        
    except ffmpeg.Error as e:
        stderr_output = e.stderr.decode() if e.stderr else "No stderr captured"
        logger.error(f"FFmpeg error during subtitle burning: {stderr_output}")
        raise Exception(f"Subtitle burning failed: {stderr_output}")
    except Exception as e:
        logger.error(f"Unexpected error during subtitle burning: {str(e)}")
        raise Exception(f"Subtitle burning failed: {str(e)}")


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

        cloudfront_url = f"{CLOUDFRONT_URL}/{s3_key}"
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
        
        # Streamcopy for original video
        use_stream_copy = (aspect_ratio == "original" and 
                          not enable_subtitles)  
        
        if use_stream_copy:
            logger.info("Using stream copy for clip creation (no filters)")
            input_args = {
                'ss': start_time,
                't': duration
            }
            output_args = {
                    'c' : 'copy',
                    'vsync': '0',
                    'avoid_negative_ts': 'make_zero',
                    'movflags': '+faststart'
            }
            
            ffmpeg.input(video_path, **input_args).output(output_path, **output_args).run(
                overwrite_output=True, capture_stdout=True, capture_stderr=True)
            
        else:
            input_stream = ffmpeg.input(video_path, ss=start_time, t=duration)
            
            if aspect_ratio == "vertical":
                video = input_stream['v'].filter('scale', 1080, 1920, force_original_aspect_ratio='increase',threads=3).filter('crop', 1080, 1920)
            else:
                video = input_stream['v'].filter('scale', 1080, 1080, force_original_aspect_ratio='decrease',threads=3) \
                                        .filter('pad', 1080, 1080, '(ow-iw)/2', '(oh-ih)/2', color='black')
            # else:  # original
            #     video = input_stream['v']
            
            # Explicitly reference the audio stream
            audio = input_stream['a']
            
            # Apply fade effects for longer clips
            if duration > 2:
                video = video.filter('fade', type='in', start_time=0, duration=0.5) \
                             .filter('fade', type='out', start_time=duration - 1, duration=0.5)
                audio = audio.filter('afade', type='in', start_time=0, duration=0.5) \
                             .filter('afade', type='out', start_time=duration - 1, duration=0.5)
            
            # Process for subtitles if needed
            temp_output = None
            final_output = output_path
            
            if enable_subtitles and subtitle_segments:
                temp_output = os.path.join(CLIP_STORAGE_PATH, f"temp_clip_{clip_id}.mp4")
                final_output = temp_output
                
            # Output with encoding
            out = ffmpeg.output(
                video,
                audio,
                final_output,
                vcodec='libx264',
                acodec='aac',
                crf=27,
                preset='faster',
                threads=3
            )
            ffmpeg.run(out, overwrite_output=True, capture_stdout=True, capture_stderr=True)
            
            # Handle subtitles if needed
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
        
        # Verify the output exists
        if not os.path.exists(output_path):
            raise Exception("Clip creation failed - output file missing")
        size = os.path.getsize(output_path)
        logger.info(f"Clip created successfully: {output_path} (size: {size} bytes)")
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

        update_task_status(user_id, task_id, TaskStatus.CREATING_CLIPS, 90, "Generating clips")
        clip_paths = []
        
        if multiple_clips:
            # Process all viral moments with ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=3) as executor:
                logger.info(f"[CLIP_WORKER] Task {task_id}: Starting ThreadPoolExecutor with 3 workers")
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
                    time.sleep(random.uniform(0.01, 0.05))
                    with lock:
                        if not os.path.exists(clip_path):
                            logger.error(f"[CLIP_WORKER] Task {task_id}: Clip creation failed for moment {i+1}")
                            continue
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
            user_id,
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
        update_task_status(user_id, task_id, TaskStatus.FAILED, 0, f"Clip creation failed: {str(e)}")
        if video_path and os.path.exists(video_path):
            logger.info(f"[CLIP_WORKER] Task {task_id}: Cleaning up video file: {video_path}")
            cleanup_files(video_path)
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

        update_task_status(user_id, task_id, TaskStatus.CREATING_CLIPS, 90, "Generating clip")


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
            user_id,
            task_id,
            TaskStatus.COMPLETED,
            100,
            "Manual clip created successfully",
            result
        )
        
        return result
    except Exception as e:
        logger.error(f"[CLIP_WORKER] Task {task_id}: Manual clip creation failed with error: {str(e)}")
        update_task_status(user_id, task_id, TaskStatus.FAILED, 0, f"Manual clip creation failed: {str(e)}")
        raise
    finally:
        # Cleanup video file
        if video_path and os.path.exists(video_path):
            logger.info(f"[CLIP_WORKER] Task {task_id}: Cleaning up video file: {video_path}")
            cleanup_files(video_path)

if __name__ == "__main__":
    # Run as Celery worker - CPU bound, moderate concurrency
    try:
        logger.info("Starting Clip Worker...")
        celery_app.worker_main([
            'worker', 
            '-Q', 'clip',
            '--loglevel=info', 
            '--concurrency=2', 
            '--prefetch-multiplier=1',
            '-n', 'clip_worker@%h'
        ])
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")