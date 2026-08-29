from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class VideoSource(str, Enum):
    YOUTUBE = "YOUTUBE"
    UPLOAD = "UPLOAD"


class ClipType(str, Enum):
    AI = "AI"
    MANUAL = "MANUAL"


class JobStatus(str, Enum):
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


class ClipStatus(str, Enum):
    QUEUED = "QUEUED"
    GENERATING_SUBTITLES = "GENERATING_SUBTITLES"
    RENDERING = "RENDERING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class LayoutType(str, Enum):
    SINGLE = "SINGLE"
    SPLIT_VERTICAL = "SPLIT_VERTICAL"


class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_5 = "4:5"


class JobPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    userId: str
    source: VideoSource
    sourceKey: str
    searchFrom: float | None = None
    searchTo: float | None = None
    title: str | None = None
    thumbnail: str | None = None
    aspectRatio: AspectRatio | None = None
    bgMusicKey: str | None = None
    bgMusicIntensity: float | None = None
    subtitleStyleKey: str | None = None
    prompt: str | None = None
    clipType: ClipType


class ClipPayload(BaseModel):
    id: str
    jobId: str
    status: ClipStatus
    from_: float = Field(alias="from")
    to: float
    aspectRatio: str | None = None
    subtitleStyleKey: str | None = None
    bgMusicKey: str | None = None
    bgMusicIntensity: float | None = None
    subtitlesKey: str | None = None
    layoutType: LayoutType = LayoutType.SINGLE
    secondaryVideoKey: str | None = None
    outputKey: str | None = None
    thumbnail: str | None = None
    duration: float | None = None
    score: float | None = None
    title: str | None = None
    error: str | None = None
