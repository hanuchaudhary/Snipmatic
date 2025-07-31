FROM python:3.10-slim

WORKDIR /app

RUN useradd -m celeryuser

RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

COPY shared/ ./shared/
COPY transcribe-worker/ ./

RUN mkdir -p /app/storage/videos /app/storage/audio /app/storage/clips && \
    chown -R celeryuser:celeryuser /app

RUN pip install --no-cache-dir -r requirements.txt

USER celeryuser

CMD ["python", "tasks.py"]
