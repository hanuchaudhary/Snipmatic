from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class VideoSource(str, Enum):
    YOUTUBE = "YOUTUBE"
    UPLOAD = "UPLOAD"


class ClipType(str, Enum):
    AI = "AI"
    MANUAL = "MANUAL"

class ClipStatus(str, Enum):
    QUEUED = "QUEUED"
    DOWNLOADING = "DOWNLOADING"
    PREPROCESSING = "PREPROCESSING"
    TRANSCRIBING = "TRANSCRIBING"
    DIARIZING = "DIARIZING"
    DETECTING_FACES = "DETECTING_FACES"
    TRACKING = "TRACKING"
    ANALYZING = "ANALYZING"
    FINDING_CLIPS = "FINDING_CLIPS"
    GENERATING_SUBTITLES = "GENERATING_SUBTITLES"
    GENERATING_CLIPS = "GENERATING_CLIPS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_5 = "4:5"


class JobPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    userId: str
    jobId: str
    source: VideoSource
    sourceKey: str
    from_: float = Field(alias="from")
    to: float
    duration: float
    title: str
    thumbnail: str
    aspectRatio: AspectRatio
    bgMusicKey: str
    subtitlesKey: str
    layoutKey: str
    prompt: str
    clipType: ClipType
