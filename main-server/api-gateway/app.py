from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uuid
import logging
import sys
import os

from shared.models import ClipRequest, ClipResponse, TaskStatus
from shared.utils import update_task_status, get_task_status
from shared.celery_config import celery_app

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Clipper API Gateway - Celery Microservices", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
async def root():
    return {
        "message": "Clipper API Gateway with Celery Queue-based Microservices", 
        "status": "running",
        "architecture": "queue-based-microservices",
        "message_broker": "Redis",
        "task_manager": "Celery"
    }

@app.post("/clip", response_model=ClipResponse)
async def create_video_clip(request: ClipRequest):
    """Create video clip - dispatches to appropriate Celery queue"""
    task_id = str(uuid.uuid4())
    
    try:
        # Update initial status
        update_task_status(task_id, TaskStatus.QUEUED, 0, "Task queued for processing")
        
        if request.clipType == "AI":
            logger.info(f"[API] Queuing download task for AI workflow - task {task_id}")
            celery_app.send_task(
                'download_task',
                args=[task_id, request.url, request.user_id, request.aspectRatio, request.multipleClips, request.clipType, None, None],
                queue='download',
                routing_key='download'
            )
            
        else:  # MANUAL
            logger.info(f"[API] Task {task_id}: Manual clip params - start_time={request.startTime}, end_time={request.endTime}")
            # Queue manual workflow starting with download task
            logger.info(f"[API] Queuing download task for manual workflow - task {task_id}")
            celery_app.send_task(
                'download_task',
                args=[task_id, request.url, request.user_id, request.aspectRatio, None, "MANUAL", request.startTime, request.endTime],
                queue='download',
                routing_key='download'
            )
            
        
        return ClipResponse(
            success=True,
            message="Processing started - task queued to appropriate workers",
            task_id=task_id
        )
        
    except Exception as e:
        logger.error(f"[API] Failed to queue task {task_id}: {e}")
        update_task_status(task_id, TaskStatus.FAILED, 0, f"Failed to queue task: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to queue processing task")

@app.get("/status/{task_id}")
async def get_task_status_endpoint(task_id: str):
    """Check status of a processing task"""
    task_status = get_task_status(task_id)
    if not task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_status

@app.get("/queues/info")
async def get_queue_info():
    """Get information about Celery queues"""
    try:
        # Get queue statistics using Celery inspect
        inspect = celery_app.control.inspect()
        
        # Get active tasks per queue
        active_tasks = inspect.active()
        
        # Get queue lengths (requires additional Redis queries)
        import redis
        from shared.celery_config import REDIS_URL
        redis_client = redis.from_url(REDIS_URL)
        
        queue_info = {}
        for queue_name in ['download', 'transcribe', 'clip']:
            queue_length = redis_client.llen(queue_name)
            queue_info[queue_name] = {
                'pending_tasks': queue_length,
                'active_tasks': len(active_tasks.get(f'{queue_name}_worker', [])) if active_tasks else 0
            }
        
        return {
            "queues": queue_info,
            "total_workers": len(active_tasks) if active_tasks else 0,
            "broker": "Redis",
            "architecture": "queue-based-microservices"
        }
        
    except Exception as e:
        logger.error(f"Failed to get queue info: {e}")
        return {"error": "Failed to retrieve queue information"}

@app.get("/workers/status")
async def get_workers_status():
    """Get status of all Celery workers"""
    try:
        inspect = celery_app.control.inspect()
        
        # Get worker statistics
        stats = inspect.stats()
        active = inspect.active()
        registered = inspect.registered()
        
        return {
            "workers": {
                "stats": stats or {},
                "active_tasks": active or {},
                "registered_tasks": registered or {}
            },
            "architecture": "celery-workers"
        }
        
    except Exception as e:
        logger.error(f"Failed to get worker status: {e}")
        return {"error": "Failed to retrieve worker status"}

@app.post("/admin/clear-queue/{queue_name}")
async def clear_queue(queue_name: str):
    """Admin endpoint to clear a specific queue"""
    if queue_name not in ['download', 'transcribe', 'clip']:
        raise HTTPException(status_code=400, detail="Invalid queue name")
    
    try:
        import redis
        from shared.celery_config import REDIS_URL
        redis_client = redis.from_url(REDIS_URL)
        
        # Clear the queue
        cleared_count = redis_client.delete(queue_name)
        
        logger.warning(f"[ADMIN] Cleared queue '{queue_name}' - removed {cleared_count} tasks")
        
        return {
            "success": True,
            "message": f"Queue '{queue_name}' cleared",
            "tasks_removed": cleared_count
        }
        
    except Exception as e:
        logger.error(f"Failed to clear queue {queue_name}: {e}")
        raise HTTPException(status_code=500, detail="Failed to clear queue")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
