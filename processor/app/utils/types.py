from enum import Enum

from pydantic import BaseModel, ConfigDict, model_validator


class VideoSource(str, Enum):
    YOUTUBE = "YOUTUBE"
    UPLOAD = "UPLOAD"


class ProcessingType(str, Enum):
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
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AspectRatio(str, Enum):
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_5 = "4:5"


class JobPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    projectId: str
    userId: str
    source: VideoSource
    sourceUrl: str | None = None
    sourceKey: str | None = None
    processingType: ProcessingType
    fromDuration: float
    toDuration: float
    prompt: str | None = None
    aspectRatio: AspectRatio
    subtitlesEnabled: bool = False
    subtitleStyleKey: str | None = None

    @model_validator(mode="after")
    def validate_source_and_range(self):
        if self.toDuration <= self.fromDuration:
            raise ValueError("toDuration must be greater than fromDuration")
        if self.source == VideoSource.YOUTUBE and not self.sourceUrl:
            raise ValueError("sourceUrl is required for YouTube jobs")
        if self.source == VideoSource.UPLOAD and not self.sourceKey:
            raise ValueError("sourceKey is required for uploaded jobs")
        return self

    @property
    def duration(self) -> float:
        return self.toDuration - self.fromDuration
