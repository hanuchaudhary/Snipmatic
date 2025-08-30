from celery import Celery
import os
import urllib.parse

# Environment Variables
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Storage paths
STORAGE_PATH = os.getenv("STORAGE_PATH", "/app/storage")
DOWNLOAD_STORAGE_PATH = os.path.join(STORAGE_PATH, "downloads")
TRANSCRIPTION_STORAGE_PATH = os.path.join(STORAGE_PATH, "transcriptions")
CLIP_STORAGE_PATH = os.path.join(STORAGE_PATH, "clips")

# Create directories if they don't exist
os.makedirs(DOWNLOAD_STORAGE_PATH, exist_ok=True)
os.makedirs(TRANSCRIPTION_STORAGE_PATH, exist_ok=True)
os.makedirs(CLIP_STORAGE_PATH, exist_ok=True)

# Parse Redis URL for SSL configuration
parsed_redis_url = urllib.parse.urlparse(REDIS_URL)

# SSL/TLS configuration for Upstash
broker_connection_retry_on_startup = True
broker_connection_retry = True

# SSL configuration for Upstash Redis
if parsed_redis_url.scheme == 'rediss' or 'upstash' in REDIS_URL:
    # SSL Redis connection (Upstash)
    broker_use_ssl = {
        'ssl_cert_reqs': None,
        'ssl_ca_certs': None,
        'ssl_certfile': None,
        'ssl_keyfile': None,
        'ssl_check_hostname': False,
    }
    
    redis_backend_use_ssl = {
        'ssl_cert_reqs': None,
        'ssl_ca_certs': None,
        'ssl_certfile': None,
        'ssl_keyfile': None,
        'ssl_check_hostname': False,
    }
    
    # Transport options for broker
    broker_transport_options = {
        'ssl_cert_reqs': None,
        'ssl_ca_certs': None,
        'ssl_certfile': None,
        'ssl_keyfile': None,
        'visibility_timeout': 3600,
        'fanout_prefix': True,
        'fanout_patterns': True
    }
    
    # Result backend transport options
    result_backend_transport_options = {
        'ssl_cert_reqs': None,
        'ssl_ca_certs': None,
        'ssl_certfile': None,
        'ssl_keyfile': None,
    }
else:
    # Regular Redis connection
    broker_transport_options = {
        'visibility_timeout': 3600,
        'fanout_prefix': True,
        'fanout_patterns': True
    }

# Create Celery app with proper configuration
celery_app = Celery(
    'clip_microservices',
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        'download-worker.tasks',
        'transcribe-worker.tasks', 
        'clip-worker.tasks'
    ]
)

# Celery Configuration
celery_app.conf.update(
    # Basic settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Task routing
    task_routes={
        'download_task': {'queue': 'download'},
        'transcribe_task': {'queue': 'transcribe'},
        'clip_task': {'queue': 'clip'},
        'manual_clip_task': {'queue': 'clip'}
    },
    
    # Task execution settings
    task_always_eager=False,
    task_eager_propagates=True,
    task_ignore_result=False,
    task_store_eager_result=True,
    
    # Result backend settings
    result_expires=86400,  # 24 hours
    result_persistent=True,
    
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    worker_disable_rate_limits=True,
    
    # Connection settings
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_pool_limit=10,
    
    # Task acknowledgment settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    
    # SSL settings (added dynamically above based on URL)
    **({
        'broker_use_ssl': broker_use_ssl,
        'redis_backend_use_ssl': redis_backend_use_ssl,
        'broker_transport_options': broker_transport_options,
        'result_backend_transport_options': result_backend_transport_options,
    } if parsed_redis_url.scheme == 'rediss' or 'upstash' in REDIS_URL else {
        'broker_transport_options': broker_transport_options
    })
)

# Test Celery connection
def test_celery_connection():
    """Test Celery broker connection"""
    try:
        # Check broker connection
        celery_app.control.inspect().stats()
        print("Celery broker connection successful")
        return True
    except Exception as e:
        print(f"Celery broker connection failed: {e}")
        return False

if __name__ == "__main__":
    test_celery_connection()
