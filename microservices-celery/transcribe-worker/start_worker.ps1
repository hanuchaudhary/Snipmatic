# Transcribe Worker Startup Script (PowerShell)
# GPU bound - limit to 1-2 per GPU

Write-Host "Starting Transcribe Worker..." -ForegroundColor Green
Write-Host "Queue: transcribe" -ForegroundColor Cyan
Write-Host "Concurrency: 2 (GPU bound - limit per GPU)" -ForegroundColor Cyan
Write-Host "Prefetch: 1" -ForegroundColor Cyan
Write-Host ""

celery -A tasks worker `
    -Q transcribe `
    --loglevel=info `
    --concurrency=2 `
    --prefetch-multiplier=1 `
    -n transcribe_worker@$env:COMPUTERNAME
