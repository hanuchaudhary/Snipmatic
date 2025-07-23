# Clipper Queue-Based Microservices Architecture

This is a **hybrid microservices architecture** that combines the benefits of microservices with **Celery's robust queue-based task management**. Unlike traditional HTTP-based microservices, this architecture uses **dedicated message queues** to prevent starvation and ensure optimal resource utilization.

## 🏗️ Architecture Overview

### **Queue-Based Task Distribution**
```
Client Request → API Gateway → Redis Message Broker → Dedicated Worker Queues
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
            [download queue]  [transcribe queue]  [clip queue]
                    │                │                │
                    ▼                ▼                ▼
           Download Workers  Transcribe Workers  Clip Workers
              (3 workers)      (2 workers)      (5 workers)
```

### **Key Benefits Over HTTP Microservices**

✅ **No Starvation** - Dedicated queues prevent resource blocking  
✅ **Worker Concurrency** - Celery manages worker pools automatically  
✅ **Rate Limiting** - Built-in rate limiting per task type  
✅ **Fault Tolerance** - Task retries and dead letter queues  
✅ **Scalability** - Independent scaling of worker types  
✅ **Monitoring** - Real-time queue and worker monitoring via Flower  

## 🔧 Services Architecture

### 1. **API Gateway** (Port 8000)
- **Role**: FastAPI application for client requests
- **Responsibility**: Dispatch tasks to appropriate Celery queues
- **Queue Integration**: Uses `celery_app.send_task()` to enqueue jobs
- **No HTTP calls between services** - Pure message passing

### 2. **Download Workers** (Queue: `download`)
- **Workers**: 3 concurrent workers
- **Rate Limit**: 10 downloads/minute
- **Technology**: yt-dlp for video acquisition
- **Next Step**: Automatically queues to `transcribe` or `clip` queue

### 3. **Transcribe Workers** (Queue: `transcribe`)
- **Workers**: 2 concurrent workers (GPU intensive)
- **Rate Limit**: 2 transcriptions/minute (AI API limits)
- **Technology**: WhisperX + Gemini AI
- **Next Step**: Automatically queues to `clip` queue

### 4. **Clip Workers** (Queue: `clip`)
- **Workers**: 5 concurrent workers
- **Rate Limit**: 20 clips/minute
- **Technology**: FFmpeg with ThreadPoolExecutor
- **Concurrency**: Internal threading for multiple clips

### 5. **Redis Message Broker**
- **Queues**: `download`, `transcribe`, `clip`
- **Result Backend**: Task status and results storage
- **Persistence**: Task state survives restarts

### 6. **Flower Monitoring** (Port 5555)
- **Real-time queue monitoring**
- **Worker status and performance**
- **Task history and statistics**

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM (for AI models)
- GPU support (optional, for faster transcription)

### Start the System
```bash
cd microservices-celery

# Start all services with workers
docker-compose up -d

# Check service status
docker-compose ps

# Monitor queues and workers
open http://localhost:5555  # Flower dashboard
```

### View Logs by Service Type
```bash
# API Gateway logs
docker-compose logs -f api-gateway

# Download worker logs
docker-compose logs -f download-worker

# Transcribe worker logs  
docker-compose logs -f transcribe-worker

# Clip worker logs
docker-compose logs -f clip-worker

# All worker logs
docker-compose logs -f download-worker transcribe-worker clip-worker
```

## 📊 Queue Management

### Monitor Queue Status
```bash
# Check queue lengths and active tasks
curl http://localhost:8000/queues/info

# Check worker status
curl http://localhost:8000/workers/status

# Flower web interface
open http://localhost:5555
```

### Scale Workers Dynamically
```bash
# Scale download workers to 5
docker-compose up -d --scale download-worker=5

# Scale transcribe workers to 4 (if you have multiple GPUs)
docker-compose up -d --scale transcribe-worker=4

# Scale clip workers to 10
docker-compose up -d --scale clip-worker=10
```

### Clear Queues (Admin)
```bash
# Clear download queue
curl -X POST http://localhost:8000/admin/clear-queue/download

# Clear transcribe queue
curl -X POST http://localhost:8000/admin/clear-queue/transcribe

# Clear clip queue
curl -X POST http://localhost:8000/admin/clear-queue/clip
```

## 🔄 Task Flow

### AI Clip Workflow
```
API Request → download queue → Download Worker → transcribe queue → 
Transcribe Worker → clip queue → Clip Worker → Complete
```

### Manual Clip Workflow  
```
API Request → download queue → Download Worker → clip queue → 
Clip Worker → Complete
```

### Queue Benefits
- **No HTTP timeouts** - Tasks wait in queue until worker available
- **Automatic retries** - Failed tasks retry with exponential backoff
- **Load balancing** - Tasks distributed across available workers
- **Resource optimization** - Workers only process their task type

## 📡 API Usage

### Create AI Clip
```bash
curl -X POST "http://localhost:8000/clip" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://youtube.com/watch?v=example",
    "clipType": "AI",
    "aspectRatio": "9:16",
    "multipleClips": false
  }'
```

### Create Manual Clip
```bash
curl -X POST "http://localhost:8000/clip" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://youtube.com/watch?v=example", 
    "clipType": "MANUAL",
    "startTime": "00:01:30",
    "endTime": "00:02:00",
    "aspectRatio": "16:9"
  }'
```

### Check Task Status
```bash
curl "http://localhost:8000/status/{task_id}"
```

## ⚙️ Configuration

### Worker Concurrency Settings

**Concurrency Per Worker Instance:**
- **Download Workers**: 10 concurrency per worker (I/O bound - can handle more)
- **Transcribe Workers**: 2 concurrency per worker (GPU bound - limited by GPU memory)  
- **Clip Workers**: 4 concurrency per worker (CPU bound - moderate parallelism)

**Proper Celery Commands:**
```bash
# Download worker (I/O bound - can have higher concurrency)
celery -A tasks worker -Q download --loglevel=info --concurrency=10 --prefetch-multiplier=1

# Transcribe worker (GPU bound - limit to 1-2 per GPU)
celery -A tasks worker -Q transcribe --loglevel=info --concurrency=2 --prefetch-multiplier=1

# Clip worker (CPU bound - moderate concurrency)
celery -A tasks worker -Q clip --loglevel=info --concurrency=4 --prefetch-multiplier=1
```

```python
# In shared/celery_config.py
QUEUE_CONFIG = {
    'download': {
        'max_workers': 3,      # 3 worker instances
        'concurrency': 10,     # 10 concurrent tasks per worker
        'rate_limit': '10/m'   # 10 downloads per minute
    },
    'transcribe': {
        'max_workers': 2,      # 2 worker instances
        'concurrency': 2,      # 2 concurrent tasks per worker (GPU bound)
        'rate_limit': '2/m'    # 2 transcriptions per minute
    },
    'clip': {
        'max_workers': 5,      # 5 worker instances  
        'concurrency': 4,      # 4 concurrent tasks per worker
        'rate_limit': '20/m'   # 20 clips per minute
    }
}
```

### Environment Variables
```bash
# Redis configuration
REDIS_URL=redis://redis:6379/0

# API keys
GEMINI_API_KEY=your_gemini_key

# Storage paths
STORAGE_BASE_PATH=/app/storage
```

## 📈 Monitoring & Observability

### Flower Dashboard (http://localhost:5555)
- **Active Tasks**: Currently processing tasks
- **Queue Lengths**: Pending tasks per queue  
- **Worker Status**: Online/offline workers
- **Task History**: Completed/failed task logs
- **Broker Status**: Redis connection health

### API Endpoints
```bash
# Queue information
GET /queues/info

# Worker status
GET /workers/status

# Task status
GET /status/{task_id}
```

### Logs
Each worker service logs with structured format:
```
[WORKER_TYPE] Task {task_id}: {operation} - {details}
```

## 🔧 Development

### Run Individual Workers Locally
```bash
# Set environment variables
export REDIS_URL=redis://localhost:6379/0
export STORAGE_BASE_PATH=/tmp/clipper

# Run download worker with proper concurrency
cd download-worker
celery -A tasks worker --loglevel=info --queues=download --concurrency=10 --prefetch-multiplier=1

# Run transcribe worker with GPU-optimized settings
cd transcribe-worker
celery -A tasks worker --loglevel=info --queues=transcribe --concurrency=2 --prefetch-multiplier=1

# Run clip worker with CPU-optimized settings
cd clip-worker
celery -A tasks worker --loglevel=info --queues=clip --concurrency=4 --prefetch-multiplier=1
```

### Testing Queue Behavior
```python
from shared.celery_config import celery_app

# Send task directly to queue
result = celery_app.send_task(
    'download_worker.tasks.download_task',
    args=['test_task_id', 'https://youtube.com/watch?v=example'],
    queue='download'
)

# Check task status
print(result.status)
```

## 🚀 Production Deployment

### Scaling Strategy
- **Download Workers**: Scale based on network bandwidth
- **Transcribe Workers**: Scale based on GPU availability  
- **Clip Workers**: Scale based on CPU cores
- **Redis**: Use Redis Cluster for high availability

### Resource Allocation
```yaml
# docker-compose.yml
services:
  download-worker:
    deploy:
      replicas: 3
      resources:
        limits:
          memory: 1G
  
  transcribe-worker:
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 8G
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
  
  clip-worker:
    deploy:
      replicas: 5
      resources:
        limits:
          memory: 2G
```

## 🆚 Comparison: Queue-Based vs HTTP Microservices

| Aspect | Queue-Based (This) | HTTP Microservices |
|--------|-------------------|-------------------|
| **Communication** | Message queues | HTTP requests |
| **Fault Tolerance** | Automatic retries | Manual retry logic |
| **Load Balancing** | Queue distribution | Load balancer needed |
| **Starvation Prevention** | ✅ Dedicated queues | ❌ Can occur |
| **Worker Management** | ✅ Celery handles | ❌ Manual scaling |
| **Monitoring** | ✅ Built-in Flower | ❌ Additional tools |
| **Rate Limiting** | ✅ Per task type | ❌ Global only |
| **Backpressure** | ✅ Queue buffering | ❌ Can overwhelm |

## 🔍 Troubleshooting

### Common Issues

1. **Workers Not Processing Tasks**
   ```bash
   # Check worker status
   docker-compose logs -f download-worker
   
   # Check Redis connectivity
   docker-compose exec redis redis-cli ping
   ```

2. **Queue Buildup**
   ```bash
   # Check queue lengths
   curl http://localhost:8000/queues/info
   
   # Scale up workers
   docker-compose up -d --scale clip-worker=10
   ```

3. **GPU Issues**
   ```bash
   # Check GPU availability
   nvidia-smi
   
   # Restart transcribe workers
   docker-compose restart transcribe-worker
   ```

This queue-based microservices architecture gives you the best of both worlds: **microservices isolation** with **Celery's proven task queue management**! 🎉
