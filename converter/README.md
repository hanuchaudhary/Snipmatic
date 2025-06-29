# Simple Clipper API

Single-file YouTube video clipper with AI-powered viral moment detection.

## Features
- Download YouTube videos in full quality
- AI transcription with Whisper
- Viral moment detection with Gemini AI
- Video clipping with FFmpeg (landscape/portrait/square)
- S3 upload for clips
- Manual or AI-powered clipping

## Setup

1. Create `.env` file:
```env
GEMINI_API_KEY=your_gemini_api_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

2. Run with Docker:
```bash
docker-compose -f docker-compose.simple.yml up --build
```

## API Usage

### Create Clip (AI-powered)
```bash
curl -X POST "http://localhost:8000/clip" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "orientation": "portrait",
    "use_ai": true
  }'
```

### Create Clip (Manual)
```bash
curl -X POST "http://localhost:8000/clip" \
  -H "Content-Type: application/json" \
  -d '{
    "youtube_url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "orientation": "landscape",
    "start_time": 30.0,
    "end_time": 90.0,
    "use_ai": false
  }'
```

### Parameters
- `youtube_url`: YouTube video URL
- `orientation`: "landscape", "portrait", or "square"
- `start_time`/`end_time`: Manual clip times (seconds)
- `use_ai`: Use AI to find viral moments (default: true)

### Response
```json
{
  "success": true,
  "message": "Clip created successfully",
  "clip_url": "https://your-bucket.s3.amazonaws.com/clips/clip_id.mp4",
  "viral_moments": [...]
}
```

API docs: `http://localhost:8000/docs`
