Write-Host "🚀 Setting up Clipper Microservices for Local Development" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

Write-Host ""
Write-Host "1️⃣ Setting environment variables..." -ForegroundColor Yellow
$env:PYTHONPATH = $PWD.Path
$env:REDIS_URL = "redis://localhost:6379/0"
$env:STORAGE_BASE_PATH = "$($PWD.Path)\storage"
$env:GEMINI_API_KEY = "AIzaSyDEFuu_5nl0zc7o7qK7z7ocEx9EqcI9z0E"

Write-Host "✅ PYTHONPATH=$env:PYTHONPATH" -ForegroundColor Green
Write-Host "✅ REDIS_URL=$env:REDIS_URL" -ForegroundColor Green
Write-Host "✅ STORAGE_BASE_PATH=$env:STORAGE_BASE_PATH" -ForegroundColor Green

Write-Host ""
Write-Host "2️⃣ Creating storage directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "storage" | Out-Null
New-Item -ItemType Directory -Force -Path "storage\videos" | Out-Null
New-Item -ItemType Directory -Force -Path "storage\audio" | Out-Null
New-Item -ItemType Directory -Force -Path "storage\clips" | Out-Null
Write-Host "✅ Storage directories created" -ForegroundColor Green

Write-Host ""
Write-Host "3️⃣ Testing Python imports..." -ForegroundColor Yellow
try {
    $test = python -c "import sys; sys.path.insert(0, '.'); from shared.celery_config import celery_app; print('✅ Shared modules import successful')" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python imports working" -ForegroundColor Green
    } else {
        throw "Import failed"
    }
} catch {
    Write-Host "❌ Import test failed - check dependencies" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install missing packages:" -ForegroundColor Yellow
    Write-Host "pip install celery redis fastapi uvicorn yt-dlp torch ffmpeg-python" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter to continue anyway"
}

Write-Host ""
Write-Host "🎉 Setup complete! Now you can run workers:" -ForegroundColor Green
Write-Host ""
Write-Host "Terminal 1 (Download Worker):" -ForegroundColor Cyan
Write-Host "cd download-worker && celery -A tasks worker -Q download --loglevel=info --concurrency=10" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2 (Transcribe Worker):" -ForegroundColor Cyan  
Write-Host "cd transcribe-worker && celery -A tasks worker -Q transcribe --loglevel=info --concurrency=2" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 3 (Clip Worker):" -ForegroundColor Cyan
Write-Host "cd clip-worker && celery -A tasks worker -Q clip --loglevel=info --concurrency=4" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 4 (API Gateway):" -ForegroundColor Cyan
Write-Host "cd api-gateway && uvicorn app:app --host 0.0.0.0 --port 8000 --reload" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 5 (Flower Monitoring - Optional):" -ForegroundColor Cyan
Write-Host "celery -A shared.celery_config.celery_app flower --port=5555" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Don't forget to start Redis server first: redis-server" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
