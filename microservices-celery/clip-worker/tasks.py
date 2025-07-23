import os
import uuid
import zipfile
import ffmpeg
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from shared.celery_config import celery_app, CLIP_STORAGE_PATH
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files, time_to_seconds

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_clip(video_path: str, start_time: float, end_time: float, aspect_ratio: str) -> str:
    """Create a clip from video with specified aspect ratio"""
    logger.info(f"Creating clip: {start_time}s - {end_time}s, aspect ratio: {aspect_ratio}")
    
    clip_id = str(uuid.uuid4())[:8]
    output_filename = f"clip_{clip_id}_{start_time}_{end_time}.mp4"
    output_path = os.path.join(CLIP_STORAGE_PATH, output_filename)
    
    try:
        # Calculate duration
        duration = end_time - start_time
        
        # Set up video filters based on aspect ratio
        if aspect_ratio == "9:16":  # Vertical/Portrait
            width, height = 720, 1280
            video_filter = f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}"
        elif aspect_ratio == "1:1":  # Square
            width, height = 720, 720
            video_filter = f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}"
        else:  # 16:9 Horizontal/Landscape (default)
            width, height = 1280, 720
            video_filter = f"scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}"
        
        # Create the clip using ffmpeg
        (
            ffmpeg
            .input(video_path, ss=start_time, t=duration)
            .filter('video', video_filter)
            .output(
                output_path,
                vcodec='libx264',
                acodec='aac',
                preset='medium',
                crf=23,
                movflags='faststart'
            )
            .overwrite_output()
            .run(quiet=True)
        )
        
        if not os.path.exists(output_path):
            raise Exception("Clip creation failed - output file not created")
        
        logger.info(f"Clip created successfully: {output_path}, size: {os.path.getsize(output_path)} bytes")
        return output_path
        
    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error during clip creation: {e}")
        raise Exception(f"Clip creation failed: {str(e)}")

@celery_app.task(name='clip_worker.tasks.clip_task', bind=True)
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
            cleanup_files(video_path)

@celery_app.task(name='clip_worker.tasks.manual_clip_task', bind=True)
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
            cleanup_files(video_path)

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
