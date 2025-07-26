#!/usr/bin/env python3
"""
Local test script for Clipper microservices
This script tests that all modules can be imported correctly for local development
"""

import sys
import os

# Add the microservices directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

def test_imports():
    """Test that all modules can be imported correctly"""
    print("🧪 Testing imports for local development...")
    
    try:
        # Test shared modules
        print("📦 Testing shared modules...")
        from shared.celery_config import celery_app, REDIS_URL
        from shared.models import TaskStatus, ClipRequest, ClipResponse
        from shared.utils import update_task_status, get_task_status
        print("✅ Shared modules imported successfully")
        
        # Test download worker
        print("📦 Testing download-worker modules...")
        from download_worker.tasks import download_task, download_video
        print("✅ Download worker modules imported successfully")
        
        # Test transcribe worker
        print("📦 Testing transcribe-worker modules...")
        from transcribe_worker.tasks import transcribe_task, extract_audio, transcribe_audio_whisperx
        print("✅ Transcribe worker modules imported successfully")
        
        # Test clip worker
        print("📦 Testing clip-worker modules...")
        from clip_worker.tasks import clip_task, manual_clip_task, create_clip
        print("✅ Clip worker modules imported successfully")
        
        # Test API gateway
        print("📦 Testing api-gateway modules...")
        from api_gateway.app import app
        print("✅ API gateway modules imported successfully")
        
        print("\n🎉 All imports successful! Ready for local development.")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Make sure you're running this from the microservices-celery directory")
        print("2. Set PYTHONPATH: set PYTHONPATH=%CD% (Windows) or export PYTHONPATH=$(pwd) (Linux/Mac)")
        print("3. Check that all __init__.py files exist")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def test_celery_config():
    """Test Celery configuration"""
    print("\n🔧 Testing Celery configuration...")
    
    try:
        from shared.celery_config import celery_app
        
        print(f"📍 Broker URL: {celery_app.conf.broker_url}")
        print(f"📍 Backend URL: {celery_app.conf.result_backend}")
        
        # Test task routing
        routes = celery_app.conf.task_routes
        print(f"📍 Task routes configured: {len(routes)} routes")
        for task, route in routes.items():
            print(f"   - {task} → {route['queue']} queue")
        
        print("✅ Celery configuration looks good")
        return True
        
    except Exception as e:
        print(f"❌ Celery configuration error: {e}")
        return False

def test_storage_paths():
    """Test storage directory creation"""
    print("\n📁 Testing storage paths...")
    
    try:
        from shared.celery_config import VIDEO_STORAGE_PATH, AUDIO_STORAGE_PATH, CLIP_STORAGE_PATH
        
        paths = [
            ("Video storage", VIDEO_STORAGE_PATH),
            ("Audio storage", AUDIO_STORAGE_PATH), 
            ("Clip storage", CLIP_STORAGE_PATH)
        ]
        
        for name, path in paths:
            if os.path.exists(path):
                print(f"✅ {name}: {path}")
            else:
                print(f"⚠️  {name}: {path} (will be created)")
                
        return True
        
    except Exception as e:
        print(f"❌ Storage path error: {e}")
        return False

def print_setup_instructions():
    """Print setup instructions for local development"""
    print("\n📋 Setup Instructions for Local Development:")
    print("=" * 50)
    
    print("\n1️⃣ Environment Setup:")
    print("   set PYTHONPATH=%CD%")
    print("   set REDIS_URL=redis://localhost:6379/0")
    print("   set STORAGE_BASE_PATH=%CD%\\storage")
    print("   set GEMINI_API_KEY=your_api_key_here")
    
    print("\n2️⃣ Install Dependencies:")
    print("   pip install celery redis fastapi uvicorn yt-dlp whisperx torch ffmpeg-python")
    
    print("\n3️⃣ Start Redis Server:")
    print("   redis-server")
    
    print("\n4️⃣ Run Workers (in separate terminals):")
    print("   Terminal 1: cd download-worker && celery -A tasks worker -Q download --loglevel=info")
    print("   Terminal 2: cd transcribe-worker && celery -A tasks worker -Q transcribe --loglevel=info")
    print("   Terminal 3: cd clip-worker && celery -A tasks worker -Q clip --loglevel=info")
    print("   Terminal 4: cd api-gateway && uvicorn app:app --host 0.0.0.0 --port 8000 --reload")
    
    print("\n5️⃣ Test API:")
    print("   curl -X POST http://localhost:8000/clip -H 'Content-Type: application/json' -d '{...}'")

if __name__ == "__main__":
    print("🚀 Clipper Microservices - Local Development Test")
    print("=" * 50)
    
    # Run tests
    imports_ok = test_imports()
    config_ok = test_celery_config()
    storage_ok = test_storage_paths()
    
    # Summary
    print("\n📊 Test Summary:")
    print(f"   Imports: {'✅ PASS' if imports_ok else '❌ FAIL'}")
    print(f"   Celery Config: {'✅ PASS' if config_ok else '❌ FAIL'}")
    print(f"   Storage Paths: {'✅ PASS' if storage_ok else '❌ FAIL'}")
    
    if imports_ok and config_ok and storage_ok:
        print("\n🎉 All tests passed! Your setup is ready for local development.")
    else:
        print("\n⚠️  Some tests failed. Check the errors above and follow the setup instructions.")
    
    print_setup_instructions()
