@echo off
echo 🚀 Setting up Clipper Microservices for Local Development
echo =======================================================

echo.
echo 1️⃣ Setting environment variables...
set PYTHONPATH=%CD%
set REDIS_URL=redis://localhost:6379/0
set STORAGE_BASE_PATH=%CD%\storage
set GEMINI_API_KEY=AIzaSyDEFuu_5nl0zc7o7qK7z7ocEx9EqcI9z0E

echo ✅ PYTHONPATH=%PYTHONPATH%
echo ✅ REDIS_URL=%REDIS_URL%
echo ✅ STORAGE_BASE_PATH=%STORAGE_BASE_PATH%

echo.
echo 2️⃣ Creating storage directories...
if not exist "storage" mkdir storage
if not exist "storage\videos" mkdir storage\videos
if not exist "storage\audio" mkdir storage\audio
if not exist "storage\clips" mkdir storage\clips
echo ✅ Storage directories created

echo.
echo 3️⃣ Testing Python imports...
python -c "import sys; sys.path.insert(0, '.'); from shared.celery_config import celery_app; print('✅ Shared modules import successful')" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Import test failed - check dependencies
    echo.
    echo Install missing packages:
    echo pip install celery redis fastapi uvicorn yt-dlp torch ffmpeg-python
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 Setup complete! Now you can run workers:
echo.
echo Terminal 1 (Download Worker):
echo cd download-worker ^&^& celery -A tasks worker -Q download --loglevel=info --concurrency=10
echo.
echo Terminal 2 (Transcribe Worker):
echo cd transcribe-worker ^&^& celery -A tasks worker -Q transcribe --loglevel=info --concurrency=2
echo.
echo Terminal 3 (Clip Worker):
echo cd clip-worker ^&^& celery -A tasks worker -Q clip --loglevel=info --concurrency=4
echo.
echo Terminal 4 (API Gateway):
echo cd api-gateway ^&^& uvicorn app:app --host 0.0.0.0 --port 8000 --reload
echo.
echo Terminal 5 (Flower Monitoring - Optional):
echo celery -A shared.celery_config.celery_app flower --port=5555
echo.
echo Don't forget to start Redis server first: redis-server
echo.
pause
