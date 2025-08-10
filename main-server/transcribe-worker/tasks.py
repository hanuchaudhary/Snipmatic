import os
import tempfile
import ffmpeg
from faster_whisper import WhisperModel, BatchedInferencePipeline
import torch
import logging
import json
from google import genai
import sys

from shared.celery_config import celery_app, AUDIO_STORAGE_PATH, GEMINI_API_KEY
from shared.models import TaskStatus, ViralMoment
from shared.utils import update_task_status, cleanup_files

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize AI models (loaded once per worker)
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if torch.cuda.is_available() else "int8"
model = WhisperModel("base", device=device, compute_type=compute_type)
bached_model = BatchedInferencePipeline(model)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# gets audio file for segmented transcription 
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
            
        return audio_path
        
    except ffmpeg.Error as e:
        raise Exception(f"Audio extraction failed: {str(e)}")

def transcribe_audio_whisperx(audio_path: str, generate_subtitles: bool = False) -> tuple[list, list]:
    """Transcribe audio using faster-whisper"""
    logger.info(f"Starting faster-whisper transcription for: {audio_path}, generate_subtitles: {generate_subtitles}")
    
    try:
        segments_generator, info = bached_model.transcribe(
            audio_path, 
            batch_size=8, 
            beam_size=5,
            word_timestamps=generate_subtitles 
        )
        
        segments = []
        subtitle_segments = []
        
        for segment in segments_generator:
            segments.append({
                'start': segment.start,
                'end': segment.end,
                'text': segment.text
            })

            # if subtitles === true
            if generate_subtitles:
                if hasattr(segment, 'words') and segment.words:
                    for word in segment.words:
                        subtitle_segments.append({
                            'start': word.start,
                            'end': word.end,
                            'text': word.word.strip()
                        })
                else:
                    # Fallback
                    words = segment.text.split()
                    word_duration = (segment.end - segment.start) / max(len(words), 1)
                    for i, word in enumerate(words):
                        word_start = segment.start + (i * word_duration)
                        word_end = word_start + word_duration
                        subtitle_segments.append({
                            'start': word_start,
                            'end': word_end,
                            'text': word.strip()
                        })
        
        return segments, subtitle_segments
        
    except Exception as e:
        raise Exception(f"Transcription failed: {str(e)}")

def find_viral_moments(segments: list, video_info: dict) -> list[ViralMoment]:
    """Use Gemini AI to find viral moments from transcript"""
    logger.info("Starting viral moment analysis with Gemini AI")
    
    # Prepare transcript text
    transcript_text = "\n".join([f"[{seg['start']:.1f}s - {seg['end']:.1f}s]: {seg['text']}" for seg in segments])
    
    prompt = f"""
        You are an expert viral content analyst with deep knowledge of social media trends, audience engagement, and short-form video platforms like TikTok, YouTube Shorts, and Instagram Reels. Your task is to analyze a YouTube video transcript and extract moments that are highly engaging and optimized for short-form content (15–60 seconds) to maximize virality.

        ## Goal:
        Identify moments from the transcript that:
        - Are emotionally engaging (e.g., funny, shocking, inspiring, heartwarming, relatable, or controversial)
        - Contain strong hooks, quotable lines, or memorable soundbites that grab attention within the first 3–5 seconds
        - Can stand alone as compelling, self-contained clips (no external context needed)
        - Are likely to drive high engagement (shares, comments, likes, or saves) based on platform trends
        - Align with the platform's audience (e.g., TikTok's Gen Z trends, Instagram's aesthetic-driven content, YouTube Shorts' broad appeal)

        ## Video Information:
        - Title: {video_info.get('title', 'Unknown')}
        - Duration: {video_info.get('duration', 'Unknown')} seconds
        - Video Type: {video_info.get('type', 'Unknown')} (e.g., vlog, interview, tutorial, storytelling, comedy, reaction, etc.)
        - Target Audience: {video_info.get('target_audience', 'Unknown')} (e.g., Gen Z, Millennials, general audience)

        ## Guidelines:

        1. **Analyze the Transcript**:
        - Read the full transcript to understand the narrative arc, tone, and key moments.
        - Identify the video's emotional peaks, punchlines, or surprising revelations.
        - Consider the video type (e.g., comedy, storytelling, educational) to tailor clip selection.
        - If visual elements are implied (e.g., reactions, gestures, or on-screen actions), note their potential to enhance the clip's appeal.

        2. **Clip Selection Criteria**:
        - **Length**: 
            - Short videos (<10 minutes): Extract 1–2 clips, ideally 15–45 seconds.
            - Medium videos (10–30 minutes): Extract 2–3 clips, ideally 30–60 seconds.
            - Long videos (>30 minutes): Extract 3–4 clips, prioritizing quality over quantity.
        - **Hook Strength**: The clip should have a strong opening (first 3–5 seconds) to stop scrollers.
        - **Emotional Impact**: Prioritize moments that evoke strong emotions (laughter, awe, empathy, shock).
        - **Platform Fit**: Ensure clips align with platform trends (e.g., TikTok favors humor/trends, Instagram favors polished/inspirational, YouTube Shorts favors broad appeal).
        - **Standalone Value**: Clips should be understandable without additional context.
        - **Visual Potential**: If the transcript implies visual elements (e.g., dramatic gestures, reactions), highlight their role in virality.

        3. **Output Requirements**:
        For each clip, provide:
        - `start_time`: float (in seconds, precise to 0.1)
        - `end_time`: float (in seconds, precise to 0.1)
        - `content`: The exact transcript excerpt for the clip
        - `reason`: A detailed explanation of why this moment is compelling and viral, including emotional impact, platform fit, and hook strength
        - `confidence_score`: float (0.0–1.0) based on your certainty of virality
        - `platform_fit`: A dictionary specifying suitability for TikTok, YouTube Shorts, and Instagram Reels (e.g., "{{"TikTok": 0.9, "YouTube Shorts": 0.8, "Instagram Reels": 0.7}}")
        - `visual_notes`: Optional notes on implied visual elements (e.g., "Speaker's shocked expression could enhance impact")
        - `suggested_caption`: A concise, platform-friendly caption to accompany the clip (max 15 words)

        4. **Additional Considerations**:
        - Avoid moments that require heavy editing to make sense (e.g., complex setups or callbacks).
        - Prioritize diversity in emotional tone across clips (e.g., one funny, one heartfelt, one shocking).
        - If the transcript includes timestamps, use them for precision; otherwise, estimate based on pacing.
        - If the video type or audience is specified, tailor clips to resonate with that demographic.
        - Avoid copyrighted material or sensitive content that could lead to platform removal.

        ## Format:
        Respond with a JSON array of clip objects:
        [
            {{
                "start_time": 102.5,
                "end_time": 141.0,
                "content": "This moment blew my mind because...",
                "reason": "A shocking reveal with a strong hook, perfect for TikTok's fast-paced audience.",
                "confidence_score": 0.92,
                "platform_fit": {{"TikTok": 0.95, "YouTube Shorts": 0.85, "Instagram Reels": 0.80}},
                "visual_notes": "Speaker's dramatic pause and wide-eyed expression could amplify impact.",
                "suggested_caption": "You won't believe what happened next! 😱 #ViralMoment"
            }},
            ...
        ]

        ## Example Output:
        [
            {{
                "start_time": 45.2,
                "end_time": 75.0,
                "content": "I never told anyone this before, but here's what happened...",
                "reason": "A vulnerable, emotional confession that resonates universally, with a strong hook for Instagram Reels.",
                "confidence_score": 0.89,
                "platform_fit": {{"TikTok": 0.85, "YouTube Shorts": 0.90, "Instagram Reels": 0.95}},
                "visual_notes": "Close-up of speaker's face could enhance emotional connection.",
                "suggested_caption": "My secret revealed... 😢 #LifeStory"
            }},
            {{
                "start_time": 300.0,
                "end_time": 340.0,
                "content": "And then I said to him, 'You're not even real!'",
                "reason": "A humorous punchline with fast pacing, ideal for TikTok's comedy trends.",
                "confidence_score": 0.83,
                "platform_fit": {{"TikTok": 0.90, "YouTube Shorts": 0.80, "Instagram Reels": 0.75}},
                "visual_notes": "Reaction shots of others laughing could boost engagement.",
                "suggested_caption": "The ultimate comeback! 😂 #Funny"
            }}
        ]

        ## Transcript:
        {transcript_text}
    """

    try:
        response = gemini_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        # Extract JSON from response
        response_text = response.text
        
        if not response_text:
            raise Exception("Empty response from Gemini API")
        
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
        return viral_moments
        
    except Exception as e:
        raise Exception(f"AI analysis failed: {str(e)}")

@celery_app.task(
    name='transcribe_task', 
    bind=True,
    rate_limit='2/m'  # Max 2 transcriptions per minute per worker
)

def transcribe_task(self, task_id, video_path, original_url, aspect_ratio, multiple_clips, video_info, user_id, subtitles=False):
    """Transcription task - queues clip task after completion"""
    audio_path = None
    
    try:

        update_task_status(user_id, task_id, TaskStatus.EXTRACTING_AUDIO, 40, "Extracting audio")

        audio_path = extract_audio(video_path)

        update_task_status(user_id, task_id, TaskStatus.TRANSCRIBING, 60, "Transcribing audio")

        # Get both segments and subtitle data if subtitles enabled
        if subtitles:
            segments, subtitle_segments = transcribe_audio_whisperx(audio_path, generate_subtitles=True)
        else:
            segments, _ = transcribe_audio_whisperx(audio_path, generate_subtitles=False)
            subtitle_segments = []

        update_task_status(user_id, task_id, TaskStatus.ANALYZING, 80, "Finding viral moments")

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

        # Queue to clip queue with subtitle data
        celery_app.send_task(
            'clip_task',
            args=[task_id, video_path, viral_moments_serialized, subtitle_segments, aspect_ratio, multiple_clips, user_id, subtitles],
            queue='clip',
            routing_key='clip'
        )
        
        return {"status": "success", "viral_moments": viral_moments_serialized}
        
    except Exception as e:
        logger.error(f"[TRANSCRIBE_WORKER] Task {task_id}: Transcription failed with error: {str(e)}")
        update_task_status(user_id, task_id, TaskStatus.FAILED, 0, f"Transcription failed: {str(e)}")
        raise
    finally:
        # Cleanup audio file immediately
        if audio_path and os.path.exists(audio_path):
            logger.info(f"[TRANSCRIBE_WORKER] Task {task_id}: Cleaning up audio file: {audio_path}")
            cleanup_files(audio_path)

if __name__ == "__main__":
    # Run as Celery worker - GPU bound, limit to 1-2 per GPU
    try:
        logger.info("Starting Transcribe Worker...")
        celery_app.worker_main([
            'worker', 
            '-Q', 'transcribe',
            '--loglevel=info', 
            '--pool=solo'
        ])
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    
