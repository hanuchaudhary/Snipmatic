from celery import Celery
import os
from kombu import Queue



REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/')
REDIS_URL1 = os.getenv('REDIS_URL1', 'redis://localhost:6379/')
celery_app = Celery(
    'clipper_workers',
    broker=REDIS_URL1,
    backend=REDIS_URL
)

celery_app.conf.update(
    # result_backend_transport_options={
    #     'ssl_cert_reqs': 'none',
    #     'ssl_ca_certs': None,
    #     'ssl_certfile': None,
    #     'ssl_keyfile': None
    # },

    task_routes={
        'download_task': {'queue': 'download'},
        'transcribe_task': {'queue': 'transcribe'},
        'clip_task': {'queue': 'clip'},
        'manual_clip_task': {'queue': 'clip'},
    },
     task_queues=[
        Queue('download', routing_key='download'),
        Queue('transcribe', routing_key='transcribe'),
        Queue('clip', routing_key='clip')
    ],
    worker_prefetch_multiplier=1,
    task_acks_late=True,         
    worker_disable_rate_limits=False,
    
    task_create_missing_queues=True,
    task_default_queue='default',
    task_default_exchange='default',
    task_default_exchange_type='direct',
    task_default_routing_key='default',
    
    result_expires=3600,
    result_persistent=True,
    
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    task_annotations={
        'transcribe_task': {
            'rate_limit': '2/m',
        },
        'download_task': {
            'rate_limit': '50/m',
        },
        'clip_task': {
            'rate_limit': '100/m',
        },
        'manual_clip_task': {
            'rate_limit': '40/m',
        },
    },
    
    worker_send_task_events=False,
    task_send_sent_event=False,
)


QUEUE_CONFIG = {
    'download': {
        'name': 'download',
        'routing_key': 'download',
        'max_workers': 10,
        'prefetch_count': 5
    },
    'transcribe': {
        'name': 'transcribe', 
        'routing_key': 'transcribe',
        'max_workers': 2,
        'prefetch_count': 1
    },
    'clip': {
        'name': 'clip',
        'routing_key': 'clip', 
        'max_workers': 5,
        'prefetch_count': 1
    }
}
STORAGE_BASE_PATH = os.getenv('STORAGE_BASE_PATH', '/home/kush-chaudhary/CodeGround/SystemProj/Clipper/microservices-celery/storage')
VIDEO_STORAGE_PATH = os.path.join(STORAGE_BASE_PATH, 'videos')
AUDIO_STORAGE_PATH = os.path.join(STORAGE_BASE_PATH, 'audio')
CLIP_STORAGE_PATH = os.path.join(STORAGE_BASE_PATH, 'clips')

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

os.makedirs(VIDEO_STORAGE_PATH, exist_ok=True)
os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)
os.makedirs(CLIP_STORAGE_PATH, exist_ok=True)
