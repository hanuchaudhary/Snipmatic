from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class TaskStatus(str, Enum):
    QUEUED = "QUEUED"
    DOWNLOADING = "DOWNLOADING"
    DOWNLOADED = "DOWNLOADED"
    EXTRACTING_AUDIO = "EXTRACTING_AUDIO"
    TRANSCRIBING = "TRANSCRIBING"
    ANALYZING = "ANALYZING"
    CREATING_CLIPS = "CREATING_CLIPS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class ClipType(str, Enum):
    AI = "AI"
    MANUAL = "MANUAL"

class ClipRequest(BaseModel):
    user_id: str
    task_id: str
    url: str
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    aspectRatio: str = "9:16"
    subtitles: bool = False
    clipType: str = "AI"
    multipleClips: bool = False
    duration: int = 0

class ViralMoment(BaseModel):
    start_time: float
    end_time: float
    content: str
    reason: str
    confidence_score: float

class ClipResponse(BaseModel):
    success: bool
    message: str
    task_id: Optional[str] = None
    clip_url: Optional[str] = None
    viral_moments: Optional[List[ViralMoment]] = None

class TaskResult(BaseModel):
    viral_moments: Optional[List[ViralMoment]] = None
    clip_paths: Optional[List[str]] = None
    s3_urls: Optional[List[str]] = None
    s3_url: Optional[str] = None
    zip_path: Optional[str] = None
    zip_s3_url: Optional[str] = None

