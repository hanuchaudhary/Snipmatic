# Download Worker Startup Script (PowerShell)
# I/O bound - can have higher concurrency

Write-Host "Starting Download Worker..." -ForegroundColor Green
Write-Host "Queue: download" -ForegroundColor Cyan
Write-Host "Concurrency: 10 (I/O bound)" -ForegroundColor Cyan
Write-Host "Prefetch: 1" -ForegroundColor Cyan
Write-Host ""

celery -A tasks worker `
    -Q download `
    --loglevel=info `
    --concurrency=10 `
    --prefetch-multiplier=1 `
    -n download_worker@$env:COMPUTERNAME
