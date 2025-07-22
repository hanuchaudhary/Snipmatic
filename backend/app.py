from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from tasks import create_ai_clip_task, create_manual_clip_task
from models import ClipRequest, ClipResponse
import uuid

load_dotenv()

app = FastAPI(title="Clipper API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Task status storage (in production, use Redis instead)
task_status_store = {}

@app.get("/")
async def root():
    return {"message": "Clipper API with Celery Queue System", "status": "running"}

@app.post("/clip", response_model=ClipResponse)
async def create_video_clip(request: ClipRequest, background_tasks: BackgroundTasks):
    """Create video clip - queues task for processing"""
    task_id = str(uuid.uuid4())
    task_status_store[task_id] = {
        "status": "QUEUED",
        "progress": 0,
        "message": "Task queued for processing"
    }
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
async def get_task_status(task_id: str):
    """Check status of a processing task"""
    task_status = task_status_store.get(task_id)
    if not task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return task_status