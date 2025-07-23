import os
import tempfile
import ffmpeg
import whisperx
import torch
import logging
import json
from google import genai
from shared.celery_config import celery_app, AUDIO_STORAGE_PATH, GEMINI_API_KEY
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize AI models (loaded once per worker)
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if torch.cuda.is_available() else "int8"
whisperx_model = whisperx.load_model("base", device, compute_type=compute_type)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

def extract_audio(video_path: str) -> str:
    """Extract audio from video file"""
    audio_filename = f"audio_{os.path.basename(video_path).split('.')[0]}.wav"
    audio_path = os.path.join(AUDIO_STORAGE_PATH, audio_filename)
    
    logger.info(f"Extracting audio from {video_path} to {audio_path}")
    
    try:
        (
            ffmpeg
            .input(video_path)
            .output(audio_path, acodec='pcm_s16le', ac=1, ar='16000')
            .overwrite_output()
            .run(quiet=True)
        )
        
        if not os.path.exists(audio_path):
            raise Exception("Audio extraction failed - output file not created")
            
        logger.info(f"Audio extracted successfully: {audio_path}, size: {os.path.getsize(audio_path)} bytes")
        return audio_path
        
    except ffmpeg.Error as e:
        logger.error(f"FFmpeg error during audio extraction: {e}")
        raise Exception(f"Audio extraction failed: {str(e)}")

def transcribe_audio_whisperx(audio_path: str) -> list:
    """Transcribe audio using WhisperX"""
    logger.info(f"Starting WhisperX transcription for: {audio_path}")
    
    try:
        # Load audio
        audio = whisperx.load_audio(audio_path)
        logger.info(f"Audio loaded, duration: {len(audio)/16000:.2f} seconds")
        
        # Transcribe
        result = whisperx_model.transcribe(audio, batch_size=16)
        segments = result["segments"]
        
        logger.info(f"Transcription completed. Found {len(segments)} segments")
        return segments
        
    except Exception as e:
        logger.error(f"WhisperX transcription failed: {e}")
        raise Exception(f"Transcription failed: {str(e)}")

def find_viral_moments(segments: list, video_info: dict) -> list[ViralMoment]:
    """Use Gemini AI to find viral moments from transcript"""
    logger.info("Starting viral moment analysis with Gemini AI")
    
    # Prepare transcript text
    transcript_text = "\n".join([f"[{seg['start']:.1f}s - {seg['end']:.1f}s]: {seg['text']}" for seg in segments])
    
    prompt = f"""
    Analyze this video transcript and identify the most viral/engaging moments. Consider:
    - Funny, surprising, or emotional content
    - Key insights or revelations  
    - Quotable moments
    - Peak engagement points
    - Dramatic or climactic moments

    Video Info:
    Title: {video_info.get('title', 'Unknown')}
    Description: {video_info.get('description', '')[:200]}...
    Duration: {video_info.get('duration', 0)} seconds

    Transcript:
    {transcript_text}

    Return up to 5 viral moments in this JSON format:
    [
        {{
            "start_time": 123.5,
            "end_time": 156.2, 
            "content": "Brief description of what happens",
            "reason": "Why this moment is viral/engaging",
            "confidence_score": 0.85
        }}
    ]
    
    Make sure start_time < end_time and moments are 15-60 seconds long.
    """
    
    try:
        response = gemini_client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt
        )
        
        # Extract JSON from response
        response_text = response.text
        
        # Find JSON in the response
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']') + 1
        
        if start_idx == -1 or end_idx == 0:
            raise Exception("No JSON found in Gemini response")
        
        json_text = response_text[start_idx:end_idx]
        moments_data = json.loads(json_text)
        
        # Convert to ViralMoment objects
        viral_moments = []
        for moment in moments_data:
            viral_moment = ViralMoment(
                start_time=float(moment['start_time']),
                end_time=float(moment['end_time']),
                content=moment['content'],
                reason=moment['reason'],
                confidence_score=float(moment['confidence_score'])
            )
            viral_moments.append(viral_moment)
        
        logger.info(f"Found {len(viral_moments)} viral moments")
        return viral_moments
        
    except Exception as e:
        logger.error(f"Viral moment analysis failed: {e}")
        raise Exception(f"AI analysis failed: {str(e)}")

@celery_app.task(
    name='transcribe_worker.tasks.transcribe_task', 
    bind=True,
    rate_limit='2/m'  # Max 2 transcriptions per minute per worker
)
def transcribe_task(self, task_id, video_path, original_url, aspect_ratio, multiple_clips, video_info):
    """Transcription task - queues clip task after completion"""
    logger.info(f"[TRANSCRIBE_WORKER] Starting transcribe task for task_id: {task_id}, video_path: {video_path}")
    logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: original_url={original_url}, aspect_ratio={aspect_ratio}, multiple_clips={multiple_clips}")
    audio_path = None
    
    try:
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Updating status to EXTRACTING_AUDIO")
        update_task_status(task_id, TaskStatus.EXTRACTING_AUDIO, 40, "Extracting audio")
        
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Extracting audio from video")
        audio_path = extract_audio(video_path)
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Audio extracted to {audio_path}")
        
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Updating status to TRANSCRIBING")
        update_task_status(task_id, TaskStatus.TRANSCRIBING, 60, "Transcribing audio")
        
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Starting audio transcription")
        segments = transcribe_audio_whisperx(audio_path)
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Transcription completed successfully, found {len(segments)} segments")
        
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Updating status to ANALYZING")
        update_task_status(task_id, TaskStatus.ANALYZING, 80, "Finding viral moments")
        
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Finding viral moments using AI")
        viral_moments = find_viral_moments(segments, video_info)
        
        # Serialize viral moments
        viral_moments_serialized = []
        for m in viral_moments:
            if hasattr(m, 'model_dump'):
                viral_moments_serialized.append(m.model_dump())
            elif hasattr(m, 'dict'):
                viral_moments_serialized.append(m.dict())
            else:
                # Fallback to manual serialization
                viral_moments_serialized.append({
                    'start_time': m.start_time,
                    'end_time': m.end_time,
                    'content': m.content,
                    'reason': m.reason,
                    'confidence_score': m.confidence_score
                })

        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Found {len(viral_moments)} viral moments")

        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Queuing clip task to 'clip' queue")
        # Queue to clip queue
        celery_app.send_task(
            'clip_worker.tasks.clip_task',
            args=[task_id, video_path, viral_moments_serialized, aspect_ratio, multiple_clips],
            queue='clip',
            routing_key='clip'
        )
        logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Clip task queued successfully to 'clip' queue")
        
        return {"status": "success", "viral_moments": viral_moments_serialized}
        
    except Exception as e:
        logger.error(f"[TRANSCRIBE_WORKER] Task {task_id}: Transcription failed with error: {str(e)}")
        update_task_status(task_id, TaskStatus.FAILED, 0, f"Transcription failed: {str(e)}")
        raise
    finally:
        # Cleanup audio file immediately
        if audio_path and os.path.exists(audio_path):
            logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Cleaning up audio file: {audio_path}")
            cleanup_files(audio_path)

if __name__ == "__main__":
    # Run as Celery worker - GPU bound, limit to 1-2 per GPU
    logger.info("Starting Transcribe Worker...")
    celery_app.worker_main([
        'worker', 
        '-Q', 'transcribe',
        '--loglevel=info', 
        '--pool=solo'
    ])
