from celery import Celery
import os

# Redis/Message Broker Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/')

# Celery application instance
celery_app = Celery(
    'clipper_workers',
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Celery configuration
celery_app.conf.update(
    # Task routing - Use simple task names that work across containers
    task_routes={
        'download_task': {'queue': 'download'},
        'transcribe_task': {'queue': 'transcribe'},
        'clip_task': {'queue': 'clip'},
        'manual_clip_task': {'queue': 'clip'},
    },
    
    # Worker configuration
    worker_prefetch_multiplier=1,  # Process one task at a time per worker
    task_acks_late=True,           # Acknowledge task only after completion
    worker_disable_rate_limits=False,
    
    # Queue configuration
    task_create_missing_queues=True,
    task_default_queue='default',
    task_default_exchange='default',
    task_default_exchange_type='direct',
    task_default_routing_key='default',
    
    # Result backend configuration
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,
    
    # Serialization
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Rate limiting and concurrency
    task_annotations={
        'transcribe_task': {
            'rate_limit': '2/m',  # Max 2 transcriptions per minute
        },
        'download_task': {
            'rate_limit': '10/m',  # Max 10 downloads per minute
        },
        'clip_task': {
            'rate_limit': '20/m',  # Max 20 clips per minute
        },
        'manual_clip_task': {
            'rate_limit': '20/m',  # Max 20 clips per minute
        },
    },
    
    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Queue definitions with proper concurrency settings
QUEUE_CONFIG = {
    'download': {
        'name': 'download',
        'routing_key': 'download',
        'max_workers': 10,  # I/O bound - can have higher concurrency
        'prefetch_count': 1
    },
    'transcribe': {
        'name': 'transcribe', 
        'routing_key': 'transcribe',
        'max_workers': 2,  # GPU bound - limit to 1-2 per GPU
        'prefetch_count': 1
    },
    'clip': {
        'name': 'clip',
        'routing_key': 'clip', 
        'max_workers': 4,  # CPU bound - moderate concurrency
        'prefetch_count': 1
    }
}

# Storage paths
STORAGE_BASE_PATH = os.getenv('STORAGE_BASE_PATH', '/home/kush-chaudhary/CodeGround/SystemProj/Clipper/microservices-celery/storage')
VIDEO_STORAGE_PATH = os.path.join(STORAGE_BASE_PATH, 'videos')
AUDIO_STORAGE_PATH = os.path.join(STORAGE_BASE_PATH, 'audio')
CLIP_STORAGE_PATH = os.path.join(STORAGE_BASE_PATH, 'clips')

# API Configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyDEFuu_5nl0zc7o7qK7z7ocEx9EqcI9z0E')

# Create storage directories
os.makedirs(VIDEO_STORAGE_PATH, exist_ok=True)
os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)
os.makedirs(CLIP_STORAGE_PATH, exist_ok=True)
