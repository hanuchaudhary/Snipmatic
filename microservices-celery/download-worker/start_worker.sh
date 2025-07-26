#!/bin/bash

# Download Worker Startup Script
# I/O bound - can have higher concurrency

echo "Starting Download Worker..."
echo "Queue: download"
echo "Concurrency: 10 (I/O bound)"
echo "Prefetch: 1"
echo ""

celery -A tasks worker \
    -Q download \
    --loglevel=info \
    --concurrency=10 \
    --prefetch-multiplier=1 \
    -n download_worker@%h
