import redis
import json
import logging
from typing import Optional
from datetime import datetime
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shared.models import TaskStatus
from shared.celery_config import REDIS_URL

logger = logging.getLogger(__name__)

# Redis client for status storage
redis_client = redis.from_url(REDIS_URL, decode_responses=True)

def update_task_status(task_id: str, status: TaskStatus, progress: int = 0, 
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
                'task_id': task_id,
                'status': status,
                'progress': progress,
                'message': message,
                'result': result,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
        
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
