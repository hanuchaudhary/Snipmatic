from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import yt_dlp
import whisperx
import google.generativeai as genai
import ffmpeg
import boto3
import os
import json
import uuid
import tempfile
import torch
from datetime import datetime
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

# Create necessary directories
os.makedirs('clipper_videos', exist_ok=True)
os.makedirs('clipper_audio', exist_ok=True)
os.makedirs('clipper_clips', exist_ok=True)

genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel('gemini-1.5-flash')

s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)

# WhisperX setup
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if torch.cuda.is_available() else "int8"
whisperx_model = whisperx.load_model("base", device, compute_type=compute_type)

app = FastAPI(title="Clipper API", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class ClipRequest(BaseModel):
    youtube_url: HttpUrl
    orientation: Optional[str] = "landscape"  # landscape, portrait, square
    start_time: Optional[float] = None  # manual start time in seconds
    end_time: Optional[float] = None    # manual end time in seconds
    use_ai: Optional[bool] = True       # use AI to find viral moments

class ViralMoment(BaseModel):
    start_time: float
    end_time: float
    content: str
    reason: str
    confidence_score: float

class ClipResponse(BaseModel):
    success: bool
    message: str
    clip_url: Optional[str] = None
    viral_moments: Optional[List[ViralMoment]] = None

# Helper functions
def download_video(url: str) -> str:
    """Download video in highest quality"""
    print(f"Downloading video from {url}")
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
            ydl.download([str(url)])

        print(f"Video downloaded to {temp_dir}")
        
        # Find the downloaded file
        for file in os.listdir(temp_dir):
            if file.startswith(f"video_{video_id}"):
                return os.path.join(temp_dir, file)
        raise Exception("Video file not found after download")
        
    except Exception as e:
        try:
            import shutil
            shutil.rmtree(temp_dir)
        except:
            pass
        raise Exception(f"Video download failed: {str(e)}")

def extract_audio(video_path: str) -> str:
    """Extract audio from video for transcription"""
    print(f"Extracting audio from {video_path}")

    audio_id = str(uuid.uuid4())[:8]
    audio_path = f"clipper_audio/audio_{audio_id}.wav"

    (
        ffmpeg
        .input(video_path)
        .output(audio_path, acodec='pcm_s16le', ac=1, ar='16000')
        .overwrite_output()
        .run(capture_stdout=True, capture_stderr=True)
    )
    print(f"Audio extracted to {audio_path}")
    
    return audio_path

def transcribe_audio_whisperx(audio_path: str) -> List[Dict[str, Any]]:
    """Transcribe audio using WhisperX with better timestamps"""
    print(f"Transcribing audio from {audio_path}")
    # Load audio
    audio = whisperx.load_audio(audio_path)
    
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

def find_viral_moments(segments: List[Dict[str, Any]], video_info: Dict[str, Any]) -> List[ViralMoment]:
    """Use Gemini to find viral moments in transcription"""
    # Prepare transcript
    transcript = "\n".join([
        f"[{seg['start']:.1f}s - {seg['end']:.1f}s] {seg['text']}"
        for seg in segments
    ])
    
    prompt = f"""
    Analyze this video transcript and identify 3 viral moments that would be great for social media clips.
    
    Video Info: {video_info.get('title', 'Unknown')}
    
    Transcript:
    {transcript}
    
    Find moments that are:
    - Funny, shocking, or inspiring
    - Quotable or memorable
    - Have emotional peaks
    - Would work well as short clips (30-60 seconds)
    
    Respond with JSON array:
    [
        {{
            "start_time": 45.2,
            "end_time": 78.5,
            "content": "transcript text",
            "reason": "why this is viral",
            "confidence_score": 0.85
        }}
    ]
    """
    
    response = gemini_model.generate_content(prompt)
    text = response.text.strip()

    print(f"Gemini response: {text}")
    
    if text.startswith('```json'):
        text = text[7:-3]
    elif text.startswith('```'):
        text = text[3:-3]
    
    moments_data = json.loads(text)
    viral_moments = []
    
    print(f"Found {moments_data} viral moments")

    for moment in moments_data:
        viral_moments.append(ViralMoment(
            start_time=float(moment['start_time']),
            end_time=float(moment['end_time']),
            content=moment['content'],
            reason=moment['reason'],
            confidence_score=float(moment['confidence_score'])
        ))
    
    return viral_moments

def create_clip(video_path: str, start_time: float, end_time: float, orientation: str = "landscape") -> str:
    """Create video clip with specified orientation"""
    print(f"Creating clip from {start_time}s to {end_time}s with orientation {orientation}")
    clip_id = str(uuid.uuid4())[:8]
    output_path = f"clipper_clips/clip_{clip_id}.mp4"
    duration = end_time - start_time
    
    input_video = ffmpeg.input(video_path, ss=start_time, t=duration)
    
    if orientation == "portrait":
        video = ffmpeg.filter(input_video, 'scale', 1080, 1920, force_original_aspect_ratio='decrease')
        video = ffmpeg.filter(video, 'pad', 1080, 1920, '(ow-iw)/2', '(oh-ih)/2', color='black')
    elif orientation == "square":
        video = ffmpeg.filter(input_video, 'scale', 1080, 1080, force_original_aspect_ratio='decrease')
        video = ffmpeg.filter(video, 'pad', 1080, 1080, '(ow-iw)/2', '(oh-ih)/2', color='black')
    else:
        video = input_video
    
    out = ffmpeg.output(
        video,
        output_path,
        vcodec='libx264',
        acodec='aac',
        crf=23,
        preset='medium'
    )
    
    print(f"Running ffmpeg to create clip at {output_path}")
    ffmpeg.run(out, overwrite_output=True, capture_stdout=True, capture_stderr=True)

    print(f"Clip created successfully: {output_path}")
    return output_path

def upload_to_s3(file_path: str, clip_id: str) -> str:
    """Upload clip to S3 and return URL"""
    s3_key = f"clips/{clip_id}.mp4"
    print(f"Uploading {file_path} to S3 bucket {S3_BUCKET_NAME} with key {s3_key}")
    
    try:
        s3_client.upload_file(
            file_path,
            S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': 'video/mp4', 'ACL': 'public-read'}
        )
    except Exception as e:
        raise Exception(f"Failed to upload to S3: {str(e)}")

    print(f"File uploaded to S3: https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}")
    
    return f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"

def cleanup_files(*file_paths):
    """Clean up temporary files and directories"""
    for file_path in file_paths:
        try:
            if file_path and os.path.exists(file_path):
                if os.path.isfile(file_path):
                    os.remove(file_path)
                elif os.path.isdir(file_path):
                    import shutil
                    shutil.rmtree(file_path)
                
                # Clean up parent temp directory
                parent_dir = os.path.dirname(file_path)
                if parent_dir.startswith('/tmp/tmp') and os.path.exists(parent_dir):
                    import shutil
                    shutil.rmtree(parent_dir)
        except:
            pass

def get_video_info(url: str) -> Dict[str, Any]:
    """Get video information"""
    ydl_opts = {'quiet': True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(str(url), download=False)
        return {
            'title': info.get('title', ''),
            'duration': info.get('duration', 0),
            'description': info.get('description', '')[:200]
        }

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Clipper API with WhisperX", "status": "running"}

@app.post("/clip", response_model=ClipResponse)
async def create_video_clip(request: ClipRequest):
    """Create video clip from YouTube URL"""
    video_path = None
    audio_path = None
    clip_path = None
    
    try:
        # Get video info
        video_info = get_video_info(request.youtube_url)
        
        # Download video
        video_path = download_video(request.youtube_url)

        if request.use_ai and (request.start_time == 0 or request.end_time == 0):
            # AI-powered clipping
            print(f"Using AI to find viral moments in video: {video_info['title']}")
            audio_path = extract_audio(video_path)
            segments = transcribe_audio_whisperx(audio_path)
            viral_moments = find_viral_moments(segments, video_info)
            
            if not viral_moments:
                raise Exception("No viral moments found")
            
            # Use the best viral moment
            best_moment = max(viral_moments, key=lambda x: x.confidence_score)
            clip_start_time = best_moment.start_time
            clip_end_time = best_moment.end_time
            
        else:
            # Manual clipping
            print(f"Manual clipping requested from {request.start_time}s to {request.end_time}s")
            if request.start_time is None or request.end_time is None:
                raise HTTPException(status_code=400, detail="start_time and end_time required for manual clipping")
            
            clip_start_time = request.start_time
            clip_end_time = request.end_time
            viral_moments = None
        
        # Create clip
        clip_path = create_clip(video_path, clip_start_time, clip_end_time, request.orientation or "landscape")
        
        # Upload to S3
        clip_id = str(uuid.uuid4())
        clip_url = upload_to_s3(clip_path, clip_id)
        
        return ClipResponse(
            success=True,
            message="Clip created successfully with WhisperX",
            clip_url=clip_url,
            viral_moments=viral_moments
        )
        
    except Exception as e:
        return ClipResponse(
            success=False,
            message=f"Error: {str(e)}"
        )
    
    # finally:
        # Cleanup
        # cleanup_files(video_path, audio_path, clip_path)
