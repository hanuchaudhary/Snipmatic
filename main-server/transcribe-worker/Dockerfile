FROM python:3.10-slim

WORKDIR /app

# Create a non-root user
RUN useradd -m celeryuser

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Copy shared modules and worker code
COPY shared/ ./shared/
COPY transcribe-worker/ ./

# Create storage directories and set permissions before switching user
RUN mkdir -p /app/storage/videos /app/storage/audio /app/storage/clips && \
    chown -R celeryuser:celeryuser /app

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Switch to non-root user
USER celeryuser

CMD ["python", "tasks.py"]
