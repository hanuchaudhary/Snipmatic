from faster_whisper import WhisperModel

# model_size = "large-v3"
model_size = "small"
model = WhisperModel(model_size, device="cpu", compute_type="int8")

def transcribe(audio_path: str):
    segments, info = model.transcribe(
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