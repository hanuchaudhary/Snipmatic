#!/bin/bash

# Download Worker Startup Script
# I/O bound - can have higher concurrency

echo "Starting Download Worker..."
echo "Queue: download"
echo "Concurrency: 10 (I/O bound)"
echo "Prefetch: 1"
echo ""

celery -A shared.celery_config worker \
    -Q download \
    --loglevel=info \
    --concurrency=3 \
    --prefetch-multiplier=5 \
    -n download_worker@%h
