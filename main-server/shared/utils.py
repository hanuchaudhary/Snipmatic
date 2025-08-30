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
import urllib.parse

EMAIL_SERVER_URL = os.getenv("EMAIL_SERVER_URL")  
EMAIL_API_KEY = os.getenv("EMAIL_API_KEY")

logger = logging.getLogger(__name__)

def create_redis_client():
    """Create Redis client with proper SSL configuration for Upstash"""
    try:
        # Parse the Redis URL to check if it's SSL
        parsed_url = urllib.parse.urlparse(REDIS_URL)
        
        if parsed_url.scheme == 'rediss' or 'upstash' in REDIS_URL:
            # SSL connection for Upstash
            redis_client = redis.from_url(
                REDIS_URL, 
                decode_responses=True,
                ssl_cert_reqs=None,  # Don't verify SSL certificates
                ssl_check_hostname=False,
                socket_connect_timeout=30,
                socket_timeout=30,
                retry_on_timeout=True,
                health_check_interval=30
            )
        else:
            # Regular connection
            redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        
        # Test the connection
        redis_client.ping()
        logger.info("Redis connection established successfully")
        return redis_client
        
    except Exception as e:
        logger.error(f"Failed to connect to Redis: {e}")
        # Fallback: try with explicit SSL config
        try:
            if 'upstash' in REDIS_URL or REDIS_URL.startswith('rediss://'):
                redis_client = redis.Redis(
                    host=parsed_url.hostname,
                    port=parsed_url.port or 6380,
                    password=parsed_url.password,
                    username=parsed_url.username or 'default',
                    ssl=True,
                    ssl_cert_reqs=None,
                    ssl_check_hostname=False,
                    decode_responses=True,
                    socket_connect_timeout=30,
                    socket_timeout=30,
                    retry_on_timeout=True
                )
                redis_client.ping()
                logger.info("Redis connection established with fallback SSL configuration")
                return redis_client
        except Exception as e2:
            logger.error(f"Fallback Redis connection also failed: {e2}")
            raise Exception(f"Cannot connect to Redis: {e}, Fallback: {e2}")

# Initialize Redis client
redis_client = create_redis_client()

def test_redis_connection():
    """Test Redis connection and log details"""
    try:
        # Test basic connection
        result = redis_client.ping()
        logger.info(f"Redis ping successful: {result}")
        
        # Test set/get
        test_key = "test_connection"
        redis_client.set(test_key, "test_value", ex=60)
        retrieved_value = redis_client.get(test_key)
        logger.info(f"Redis set/get test successful: {retrieved_value}")
        
        # Clean up
        redis_client.delete(test_key)
        
        return True
    except Exception as e:
        logger.error(f"Redis connection test failed: {e}")
        return False

# Test connection on import (but not during main execution)
if __name__ != "__main__":
    try:
        test_redis_connection()
    except Exception as e:
        logger.warning(f"Redis connection test failed during import: {e}")

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
    max_retries = 3
    for attempt in range(max_retries):
        try:
            # Get existing status or create new one
            existing_data = redis_client.get(f"task_status:{task_id}")
            
            if existing_data:
                task_data = json.loads(str(existing_data))
                task_data.update({
                    'status': status.value if hasattr(status, 'value') else status,
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
                    'status': status.value if hasattr(status, 'value') else status,
                    'progress': progress,
                    'message': message,
                    'result': result,
                    'created_at': datetime.utcnow().isoformat(),
                    'updated_at': datetime.utcnow().isoformat()
                }
            
            # Store with 24 hour TTL in Redis
            redis_client.setex(
                f"task_status:{task_id}",
                86400,  # 24 hours
                json.dumps(task_data, default=str)
            )
            
            # Update PostgreSQL database as well
            postgres_success = update_task_in_postgres(
                task_id=task_id,
                status=status.value if hasattr(status, 'value') else status,
                progress=progress,
                message=message,
                result=result,
                user_id=user_id
            )
            
            if postgres_success:
                logger.info(f"Status updated for task {task_id}: {status} ({progress}%) - {message} [Redis & PostgreSQL]")
            else:
                logger.warning(f"Status updated for task {task_id}: {status} ({progress}%) - {message} [Redis only - PostgreSQL failed]")
            
            return True  # Success
            
        except redis.ConnectionError as e:
            logger.warning(f"Redis connection error on attempt {attempt + 1}/{max_retries}: {e}")
            if attempt < max_retries - 1:
                # Try to reconnect
                try:
                    global redis_client
                    redis_client = create_redis_client()
                except Exception as reconnect_error:
                    logger.error(f"Failed to reconnect to Redis: {reconnect_error}")
            else:
                logger.error(f"Failed to update status for task {task_id} after {max_retries} attempts: {e}")
                return False
        except Exception as e:
            logger.error(f"Failed to update status for task {task_id} on attempt {attempt + 1}: {e}")
            if attempt == max_retries - 1:
                return False

def get_task_status(task_id: str) -> Optional[dict]:
    """Get task status from Redis"""
    max_retries = 3
    for attempt in range(max_retries):
        try:
            data = redis_client.get(f"task_status:{task_id}")
            if data:
                return json.loads(str(data))
            return None
        except redis.ConnectionError as e:
            logger.warning(f"Redis connection error getting task status on attempt {attempt + 1}/{max_retries}: {e}")
            if attempt < max_retries - 1:
                try:
                    global redis_client
                    redis_client = create_redis_client()
                except Exception as reconnect_error:
                    logger.error(f"Failed to reconnect to Redis: {reconnect_error}")
            else:
                logger.error(f"Failed to get status for task {task_id} after {max_retries} attempts: {e}")
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
            logger.info(f"[CLIP_WORKER] Task {task_id}: Email notification sent successfully")
        else:
            logger.error(f"[CLIP_WORKER] Task {task_id}: Email notification failed with status {response.status_code}")
            
    except Exception as e:
        logger.error(f"[CLIP_WORKER] Task {task_id}: Failed to send email notification: {str(e)}")



