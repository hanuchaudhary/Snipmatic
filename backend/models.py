from pydantic import BaseModel
from typing import List, Optional

class ClipRequest(BaseModel):
    url: str
    startTime: str
    endTime: str
    aspectRatio: str
    subtitles: bool
    clipType: str
    multipleClips: bool

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