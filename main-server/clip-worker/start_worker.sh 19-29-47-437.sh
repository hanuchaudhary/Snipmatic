#!/bin/bash

# Clip Worker Startup Script
# CPU bound - moderate concurrency

echo "Starting Clip Worker..."
echo "Queue: clip" 
echo "Concurrency: 4 (CPU bound - moderate)"
echo "Prefetch: 1"
echo ""

# Use shared.celery_config for centralized configuration
celery -A shared.celery_config worker \
    -Q clip \
    --loglevel=info \
    --concurrency=5 \
    --prefetch-multiplier=1 \
    -n clip_worker@%h
