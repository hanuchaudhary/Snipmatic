FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy shared modules
COPY shared/ ./shared/

# Copy worker code
COPY transcribe-worker/ ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create storage directories
RUN mkdir -p /app/storage/videos /app/storage/audio /app/storage/clips

CMD ["python", "tasks.py"]
