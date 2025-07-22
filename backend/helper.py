import yt_dlp
import whisperx
import ffmpeg
import json
import uuid
import tempfile
import torch
import os
import shutil
import logging
from google import genai
from models import ViralMoment

# Configure logging for helper functions
logger = logging.getLogger(__name__)

# Configuration
GEMINI_API_KEY = "AIzaSyDEFuu_5nl0zc7o7qK7z7ocEx9EqcI9z0E"
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if torch.cuda.is_available() else "int8"

logger.info(f"[HELPER] Initializing WhisperX with device: {device}, compute_type: {compute_type}")
try:
    whisperx_model = whisperx.load_model("base", device, compute_type=compute_type)
    logger.info(f"[HELPER] WhisperX model loaded successfully")
except Exception as e:
    logger.error(f"[HELPER] Failed to load WhisperX model: {str(e)}")
    whisperx_model = None

gemini_client = genai.Client(api_key=GEMINI_API_KEY)

# Create necessary directories
os.makedirs('clipper_videos', exist_ok=True)
os.makedirs('clipper_audio', exist_ok=True)
os.makedirs('clipper_clips', exist_ok=True)

def time_to_seconds(time_str: str) -> float:
    """Convert HH:MM:SS format to seconds"""
    try:
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) 
        seconds = int(parts[2])
        return hours * 3600 + minutes * 60 + seconds
    except:
        return 0.0

def download_video(url: str) -> str:
    """Download video in highest quality"""
    temp_dir = tempfile.mkdtemp(prefix='clipper_video_')
    video_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(temp_dir, f"video_{video_id}.%(ext)s")
    
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': output_path,
        'quiet': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        # Find the downloaded file
        for file in os.listdir(temp_dir):
            if file.startswith(f"video_{video_id}"):
                return os.path.join(temp_dir, file)
        raise Exception("Video file not found after download")
        
    except Exception as e:
        try:
            shutil.rmtree(temp_dir)
        except:
            pass
        raise Exception(f"Video download failed: {str(e)}")

def extract_audio(video_path: str) -> str:
    """Extract audio from video for transcription"""
    audio_id = str(uuid.uuid4())[:8]
    audio_path = f"clipper_audio/audio_{audio_id}.wav"

    (
        ffmpeg
        .input(video_path)
        .output(audio_path, acodec='pcm_s16le', ac=1, ar='16000')
        .overwrite_output()
        .run(capture_stdout=True, capture_stderr=True)
    )
    return audio_path

def transcribe_audio_whisperx(audio_path: str) -> list:
    """Transcribe audio using WhisperX"""
    """Transcribe audio using WhisperX with better timestamps"""
    print(f"Transcribing audio from {audio_path}")
    # Load audio
    audio = whisperx.load_audio(audio_path)

    print("Model loaded, starting transcription")
    # Transcribe with WhisperX
    result = whisperx_model.transcribe(audio, batch_size=16)

    print(f"Transcription completed: {len(result['segments'])} segments found")
    
    # Align whisper output for better timestamps
    model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
    result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
    
    # Convert to our format
    segments = []
    for segment in result["segments"]:
        segments.append({
            'start': segment['start'],
            'end': segment['end'],
            'text': segment['text'].strip()
        })
    print(f"Transcription segments: {segments}")
    return segments
    
def find_viral_moments(segments: list, video_info: dict) -> list:
    """Use Gemini to find viral moments in transcription"""
    transcript = "\n".join(
        f"[{seg['start']:.1f}s - {seg['end']:.1f}s] {seg['text']}"
        for seg in segments
    )

    prompt = f"""
        You are an expert viral content analyst. Your task is to analyze a YouTube video transcript and extract moments that are highly engaging and suitable for short-form content.
        
        ## Video Information:
        Title: {video_info.get('title', 'Unknown')}
        Duration: {video_info.get('duration', 'Unknown')} seconds
        
        ## Transcript:
        {transcript}
        
        ## Format:
        Respond with a JSON array of viral moments
        """
    
    response = gemini_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    
    if not response or not response.text:
        raise Exception("No response from Gemini API")
    
    text = response.text.strip()
    if text.startswith('```json'):
        text = text[7:-3]
    elif text.startswith('```'):
        text = text[3:-3]
    
    moments_data = json.loads(text)
    return [
        ViralMoment(
            start_time=float(moment['start_time']),
            end_time=float(moment['end_time']),
            content=moment['content'],
            reason=moment['reason'],
            confidence_score=float(moment['confidence_score'])
        ) for moment in moments_data
    ]

def create_clip(video_path: str, start_time: float, end_time: float, aspect_ratio: str) -> str:
    """Create video clip with specified aspect ratio"""
    clip_id = str(uuid.uuid4())[:8]
    output_path = f"clipper_clips/clip_{clip_id}.mp4"
    duration = end_time - start_time
    
    input_video = ffmpeg.input(video_path, ss=start_time, t=duration)
    
    if aspect_ratio == "vertical":
        video = ffmpeg.filter(input_video, 'scale', 1080, 1920, force_original_aspect_ratio='decrease')
        video = ffmpeg.filter(video, 'pad', 1080, 1920, '(ow-iw)/2', '(oh-ih)/2', color='black')
    elif aspect_ratio == "square":
        video = ffmpeg.filter(input_video, 'scale', 1080, 1080, force_original_aspect_ratio='decrease')
        video = ffmpeg.filter(video, 'pad', 1080, 1080, '(ow-iw)/2', '(oh-ih)/2', color='black')
    else:  # original
        video = input_video

    audio = input_video
    
    if duration > 2:
        video = ffmpeg.filter(video, 'fade', type='in', start_time=0, duration=0.5)
        video = ffmpeg.filter(video, 'fade', type='out', start_time=duration-1, duration=0.5)
        audio = ffmpeg.filter(input_video, 'afade', type='in', start_time=0, duration=0.5)
        audio = ffmpeg.filter(audio, 'afade', type='out', start_time=duration-1, duration=0.5)

    ffmpeg.output(
        video,
        audio,
        output_path,
        vcodec='libx264',
        acodec='aac',
        crf=23,
        preset='medium'
    ).run(overwrite_output=True, capture_stdout=True, capture_stderr=True)

    return output_path

def cleanup_files(*file_paths):
    """Clean up temporary files and directories"""
    for file_path in file_paths:
        try:
            if file_path and os.path.exists(file_path):
                if os.path.isfile(file_path):
                    os.remove(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
        except Exception:
            pass

def get_video_info(url: str) -> dict:
    """Get video information"""
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            'title': info.get('title', ''),
            'duration': info.get('duration', 0),
            'description': info.get('description', '')[:200]
        } if info else {'title': '', 'duration': 0, 'description': ''}