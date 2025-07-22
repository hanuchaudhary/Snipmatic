from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from tasks import create_ai_clip_task, create_manual_clip_task
from models import ClipRequest, ClipResponse
from status_store import task_status_store, update_task_status, get_task_status
import uuid

load_dotenv()

app = FastAPI(title="Clipper API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.get("/")
async def root():
    return {"message": "Clipper API with Celery Queue System", "status": "running"}

@app.post("/clip", response_model=ClipResponse)
async def create_video_clip(request: ClipRequest, background_tasks: BackgroundTasks):
    """Create video clip - queues task for processing"""
    task_id = str(uuid.uuid4())
    update_task_status(task_id, "QUEUED", 0, "Task queued for processing")
    
    if request.clipType == "AI":
        background_tasks.add_task(create_ai_clip_task, task_id, request)
    else:
        background_tasks.add_task(create_manual_clip_task, task_id, request)
    
    return ClipResponse(
        success=True,
        message="Processing started",
        task_id=task_id
    )

@app.get("/status/{task_id}")
async def get_task_status_endpoint(task_id: str):
    """Check status of a processing task"""
    task_status = get_task_status(task_id)
    if not task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_status