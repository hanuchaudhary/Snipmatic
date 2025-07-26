#!/bin/bash

# Clip Worker Startup Script
# CPU bound - moderate concurrency

echo "Starting Clip Worker..."
echo "Queue: clip" 
echo "Concurrency: 4 (CPU bound - moderate)"
echo "Prefetch: 1"
echo ""

celery -A tasks worker \
    -Q clip \
    --loglevel=info \
    --concurrency=4 \
    --prefetch-multiplier=1 \
    -n clip_worker@%h
