# Clip Worker Startup Script (PowerShell)
# CPU bound - moderate concurrency

Write-Host "Starting Clip Worker..." -ForegroundColor Green
Write-Host "Queue: clip" -ForegroundColor Cyan
Write-Host "Concurrency: 4 (CPU bound - moderate)" -ForegroundColor Cyan
Write-Host "Prefetch: 1" -ForegroundColor Cyan
Write-Host ""

celery -A tasks worker `
    -Q clip `
    --loglevel=info `
    --concurrency=4 `
    --prefetch-multiplier=1 `
    -n clip_worker@$env:COMPUTERNAME
