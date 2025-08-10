import redis
import json
import logging
from typing import Optional
from datetime import datetime
import sys
import os
import ffmpeg
from shared.models import TaskStatus
from shared.celery_config import REDIS_URL
import requests
EMAIL_SERVER_URL = os.getenv("EMAIL_SERVER_URL")  
EMAIL_API_KEY = os.getenv("EMAIL_API_KEY")

logger = logging.getLogger(__name__)

# Redis client for status storage
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def format_srt_time(seconds: float) -> str:
    """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

def generate_subtitle_file(subtitle_segments: list, clip_start: float, clip_end: float, output_path: str) -> str:
    """Generate SRT subtitle file for a specific clip timeframe"""
    
    # Filter segments that fall within the clip timeframe
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
        
        # styles
        subtitle_style = (
            "FontName=Arial Black,"
            "FontSize=6"
            "PrimaryColour=&Hffffff&,"  # White text
            "SecondaryColour=&H000000&,"  # Black secondary
            "OutlineColour=&H000000&,"   # Black outline
            "BackColour=&H80000000&,"    # Semi-transparent background
            "Bold=1,"
            "Italic=0,"
            "Underline=0,"
            "BorderStyle=3,"  # Box background
            "Outline=2,"      # Outline thickness
            "Shadow=0,"
            "Alignment=2,"    # Bottom center
            f"MarginL=40,"
            f"MarginR=40,"
            f"MarginV=40"  # Distance from bottom
        )
        
        # Create input stream
        input_stream = ffmpeg.input(input_video)
        
        if len(audio_streams) > 0:
            # Apply subtitle filter to video stream only and keep audio
            video_with_subtitles = input_stream['v'].filter('subtitles', srt_file, force_style=subtitle_style)
            audio = input_stream['a']
            
            # Output with both video (with subtitles) and audio
            out = ffmpeg.output(video_with_subtitles, audio, output_video, vcodec='libx264', acodec='aac', crf=23)
        else:
            # No audio stream, just video with subtitles
            logger.warning("No audio stream found in input video!")
            video_with_subtitles = input_stream.filter('subtitles', srt_file, force_style=subtitle_style)
            out = ffmpeg.output(video_with_subtitles, output_video, vcodec='libx264', crf=23)
        
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

def update_task_status(user_id: Optional[str], task_id: str, status: TaskStatus, progress: int = 0, 
                      message: str = "", result: Optional[dict] = None):
    """Update task status in Redis"""
    try:
        # Get existing status or create new one
        existing_data = redis_client.get(f"task_status:{task_id}")
        
        if existing_data:
            task_data = json.loads(existing_data)
            task_data.update({
                'status': status,
                'progress': progress,
                'message': message,
                'updated_at': datetime.utcnow().isoformat()
            })
            if result:
                task_data['result'] = result
        else:
            task_data = {
                'user_id': user_id,
                'task_id': task_id,
                'status': status,
                'progress': progress,
                'message': message,
                'result': result,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        
        # # Publish to Redis channel for real-time updates
        # redis_client.publish(f"status:{task_id}", json.dumps(task_data, default=str))

        # Store with 24 hour TTL
        redis_client.setex(
            f"task_status:{task_id}",
            86400,  # 24 hours
            json.dumps(task_data, default=str)
        )
        
        logger.info(f"Status updated for task {task_id}: {status} ({progress}%) - {message}")
        
    except Exception as e:
        logger.error(f"Failed to update status for task {task_id}: {e}")

def get_task_status(task_id: str) -> Optional[dict]:
    """Get task status from Redis"""
    try:
        data = redis_client.get(f"task_status:{task_id}")
        if data:
            return json.loads(data)
        return None
    except Exception as e:
        logger.error(f"Failed to get status for task {task_id}: {e}")
        return None

def cleanup_files(*file_paths):
    """Clean up temporary files"""
    import os
    for file_path in file_paths:
        try:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up file: {file_path}")
        except Exception as e:
            logger.warning(f"Failed to cleanup {file_path}: {e}")

def time_to_seconds(time_str: str) -> float:
    """Convert HH:MM:SS format to seconds"""
    try:
        parts = time_str.split(':')
        if len(parts) == 3:
            hours = int(parts[0])
            minutes = int(parts[1])
            seconds = float(parts[2])
            return hours * 3600 + minutes * 60 + seconds
        elif len(parts) == 2:
            minutes = int(parts[0])
            seconds = float(parts[1])
            return minutes * 60 + seconds
        else:
            return float(parts[0])
    except:
        return 0.0
def send_email_notification(task_id: str):
    """Send email notification when clips are generated"""
    if not EMAIL_SERVER_URL:
        logger.warning("Email server URL not configured, skipping email notification")
        return
    
    try:
        payload = {
            "task_id": task_id,
            "message": f"Your clip(s) have been generated successfully!"
        }
        
        headers = {"Content-Type": "application/json"}
        if EMAIL_API_KEY:
            headers["Authorization"] = f"Bearer {EMAIL_API_KEY}"
        
        response = requests.post(
            EMAIL_SERVER_URL,
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            logger.info(f"[CLIP_WORKER] Task : Email notification sent successfully")
        else:
            logger.error(f"[CLIP_WORKER] Task : Email notification failed with status {response.status_code}")
            
    except Exception as e:
        logger.error(f"[CLIP_WORKER] Task : Failed to send email notification: {str(e)}")



