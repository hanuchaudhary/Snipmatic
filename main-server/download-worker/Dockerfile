FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    tzdata \
    && rm -rf /var/lib/apt/lists/*

COPY shared/ ./shared/

COPY download-worker/ ./

RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/storage/videos /app/storage/audio /app/storage/clips

CMD ["python", "tasks.py"]
