import os
from functools import lru_cache

from faster_whisper import WhisperModel

# model_size = "large-v3"
model_size = "small"
@lru_cache(maxsize=1)
def get_model():
    device = os.environ.get("WHISPER_DEVICE", "cpu")
    compute_type = os.environ.get(
        "WHISPER_COMPUTE_TYPE", "float16" if device == "cuda" else "int8"
    )
    return WhisperModel(model_size, device=device, compute_type=compute_type)

def transcribe(audio_path: str):
    segments, info = get_model().transcribe(
        audio_path,
        word_timestamps=True,
        vad_filter=True,
    )

    result = []

    for segment in segments:
        words = []

        if segment.words:
            for word in segment.words:
                words.append({
                    "text": word.word,
                    "start": word.start,
                    "end": word.end,
                })

        result.append({
            "start": segment.start,
            "end": segment.end,
            "text": segment.text.strip(),
            "words": words,
        })

    return {
        "language": info.language,
        "duration": info.duration,
        "segments": result,
    }
