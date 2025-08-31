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
from shared.database import update_task_in_postgres
import requests
EMAIL_SERVER_URL = os.getenv("EMAIL_SERVER_URL")  
EMAIL_API_KEY = os.getenv("EMAIL_API_KEY")

logger = logging.getLogger(__name__)

# Redis client for status storage
redis_client = redis.Redis.from_url(REDIS_URL)

def format_srt_time(seconds: float) -> str:
    """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

def update_task_status(user_id: Optional[str], task_id: str, status: TaskStatus, progress: int = 0, 
                      message: str = "", result: Optional[dict] = None):
    """Update task status in Redis and PostgreSQL"""
    try:
        # Get existing status or create new one
        existing_data = redis_client.get(f"task_status:{task_id}")
        
        if existing_data:
            task_data = json.loads(str(existing_data))
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

        # Store with 24 hour TTL in Redis
        redis_client.setex(
            f"task_status:{task_id}",
            86400,  # 24 hours
            json.dumps(task_data, default=str)
        )
        
        # Update PostgreSQL database as well
        postgres_success = update_task_in_postgres(
            task_id=task_id,
            status=status.value,  # Convert enum to string
            progress=progress,
            message=message,
            result=result,
            user_id=user_id
        )
        
        if postgres_success:
            logger.info(f"Status updated for task {task_id}: {status} ({progress}%) - {message} [Redis & PostgreSQL]")
        else:
            logger.warning(f"Status updated for task {task_id}: {status} ({progress}%) - {message} [Redis only - PostgreSQL failed]")
        
    except Exception as e:
        logger.error(f"Failed to update status for task {task_id}: {e}")

def get_task_status(task_id: str) -> Optional[dict]:
    """Get task status from Redis"""
    try:
        data = redis_client.get(f"task_status:{task_id}")
        if data:
            return json.loads(str(data))
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



