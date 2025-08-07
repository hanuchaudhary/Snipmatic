#!/bin/bash

# Transcribe Worker Startup Script  
# GPU bound - limit to 1-2 per GPU

echo "Starting Transcribe Worker..."
echo "Queue: transcribe"
echo "Concurrency: 2 (GPU bound - limit per GPU)"
echo "Prefetch: 1"
echo ""

celery -A shared.celery_config worker \
    -Q transcribe \
    --loglevel=info \
    --concurrency=2 \
    --prefetch-multiplier=1 \
    -n transcribe_worker@%h
