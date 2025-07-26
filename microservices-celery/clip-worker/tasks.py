import os
import uuid
import zipfile
import ffmpeg
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
import sys
import os

# Add parent directory to path for imports
from shared.celery_config import celery_app, CLIP_STORAGE_PATH
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files, time_to_seconds

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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
def clip_task(self, task_id, video_path, viral_moments, aspect_ratio, multiple_clips):
    """Clip generation task for AI-identified viral moments"""
    logger.info(f"[CLIP_WORKER] Starting AI clip task for task_id: {task_id}, video_path: {video_path}")
    logger.info(f"[CLIP_WORKER] Task {task_id}: aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
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
        
        # Create ZIP if multiple clips
        zip_path = None
        if multiple_clips and len(clip_paths) > 1:
            logger.info(f"[CLIP_WORKER] Task {task_id}: Creating ZIP file for {len(clip_paths)} clips")
            zip_path = os.path.join(CLIP_STORAGE_PATH, f"{task_id}.zip")
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for i, clip in enumerate(clip_paths):
                    clip_name = f"clip_{i+1}_{os.path.basename(clip)}"
                    zipf.write(clip, clip_name)
                    logger.info(f"[CLIP_WORKER] Task {task_id}: Added {clip_name} to ZIP")
            logger.info(f"[CLIP_WORKER] Task {task_id}: ZIP file created: {zip_path}")
        
        # Prepare result
        result = {
            "viral_moments": viral_moments,
            "clip_paths": clip_paths,
            "zip_path": zip_path
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
def manual_clip_task(self, task_id, video_path, start_time, end_time, aspect_ratio):
    """Manual clip creation task"""
    logger.info(f"[CLIP_WORKER] Starting manual clip task for task_id: {task_id}")
    logger.info(f"[CLIP_WORKER] Task {task_id}: video_path={video_path}, start={start_time}, end={end_time}, aspect_ratio={aspect_ratio}")
    
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
        
        # Prepare result
        result = {
            "clip_paths": [clip_path],
            "zip_path": None
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
