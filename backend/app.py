from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import yt_dlp
import whisperx
from google import genai
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
import zipfile

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

gemini_client = genai.Client()

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
    url: str
    startTime: str  # Format: "HH:MM:SS"
    endTime: str    # Format: "HH:MM:SS" 
    aspectRatio: str  # "original", "vertical", "square"
    subtitles: bool
    clipType: str   # "MANUAL" or "AI"
    multipleClips: bool

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

def time_to_seconds(time_str: str) -> float:
    """Convert HH:MM:SS format to seconds"""
    try:
        parts = time_str.split(':')
        hours = int(parts[0])
        minutes = int(parts[1]) 
        seconds = int(parts[2])
        print(f"Converting time {time_str} to seconds: {hours * 3600 + minutes * 60 + seconds}")
        return hours * 3600 + minutes * 60 + seconds
    except:
        return 0.0

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
            ydl.download([url])

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
    transcript = "\n".join([
        f"[{seg['start']:.1f}s - {seg['end']:.1f}s] {seg['text']}"
        for seg in segments
    ])

    prompt = f"""
        You are an expert viral content analyst. Your task is to analyze a YouTube video transcript and extract moments that are highly engaging and suitable for short-form content on platforms like TikTok, YouTube Shorts, and Instagram Reels.

        ## Goal:
        Identify moments from the transcript that:
        - Are emotionally engaging (funny, shocking, inspiring, heartfelt)
        - Contain strong hooks or quotable lines
        - Can stand alone as compelling 30–60 second clips
        - Would likely generate shares, comments, or reactions

        ## Video Information:
        Title: {video_info.get('title', 'Unknown')}
        Duration: {video_info.get('duration', 'Unknown')} seconds

        ## Guidelines:

        1. Read the full transcript.
        2. Identify up to 3 of the most compelling moments that meet the criteria above.
        - If the video is **short (<10 minutes)**: Extract 1–2 clips, ideally 30–45 seconds.
        - If the video is **medium (10–30 minutes)**: Extract 2–3 clips, ideally 45–60 seconds.
        - If the video is **long (>30 minutes)**: Extract 3 or more clips, but prioritize quality.
        3. Each clip must include:
        - `start_time`: float (in seconds)
        - `end_time`: float (in seconds)
        - `content`: the transcript excerpt
        - `reason`: why this moment is compelling/viral
        - `confidence_score`: float (0.0–1.0) based on your certainty

        ## Format:
        Respond with a JSON array:
        [
            {{
                "start_time": 102.5,
                "end_time": 141.0,
                "content": "This moment blew my mind because...",
                "reason": "It includes a surprising reveal that hooks the viewer.",
                "confidence_score": 0.92
            }},
            ...
        ]

        ## Example Output:
        [
            {{
                "start_time": 45.2,
                "end_time": 75.0,
                "content": "I never told anyone this before, but here's what happened...",
                "reason": "This is a vulnerable and shocking moment likely to resonate emotionally.",
                "confidence_score": 0.89
            }},
            {{
                "start_time": 300.0,
                "end_time": 340.0,
                "content": "And then I said to him, 'You're not even real!'",
                "reason": "This moment is humorous, has good pacing, and includes a memorable quote.",
                "confidence_score": 0.83
            }}
        ]

        ## Transcript:
        {transcript}
        """
    
    response = gemini_client.models.generate_content( model="gemini-2.5-flash",contents= prompt)
    
    if not response or not response.text:
        raise Exception("No response from Gemini API")
    
    text = response.text.strip()

    print(f"Gemini response: {text}")
    
    if text.startswith('```json'):
        text = text[7:-3]
    elif text.startswith('```'):
        text = text[3:-3]
    
    moments_data = json.loads(text)
    viral_moments = []
    
    print(f"Found {len(moments_data)} viral moments")

    for moment in moments_data:
        viral_moments.append(ViralMoment(
            start_time=float(moment['start_time']),
            end_time=float(moment['end_time']),
            content=moment['content'],
            reason=moment['reason'],
            confidence_score=float(moment['confidence_score'])
        ))
    
    return viral_moments

def create_clip(video_path: str, start_time: float, end_time: float, aspect_ratio: str = "original") -> str:
    """Create video clip with specified aspect ratio"""
    print(f"Creating clip from {start_time}s to {end_time}s with aspect ratio {aspect_ratio}")
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

    out = ffmpeg.output(
        video,
        audio,
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

def upload_to_s3(file_path: str, clip_id: str, is_zip: bool = False) -> str:
    """Upload clip to S3 and return URL"""
    if is_zip:
        s3_key = f"clips/{clip_id}.zip"
        content_type = 'application/zip'
    else:
        s3_key = f"clips/{clip_id}.mp4"
        content_type = 'video/mp4'
    
    print(f"Uploading {file_path} to S3 bucket {S3_BUCKET_NAME} with key {s3_key}")
    
    try:
        s3_client.upload_file(
            file_path,
            S3_BUCKET_NAME,
            s3_key,
            ExtraArgs={'ContentType': content_type}
        )
    except Exception as e:
        raise Exception(f"Failed to upload to S3: {str(e)}")

    print(f"Clip URL: https://d10d2f3sgu39wn.cloudfront.net/{s3_key}")
    
    return f"https://d10d2f3sgu39wn.cloudfront.net/{s3_key}"

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
        info = ydl.extract_info(url, download=False)
        if info is None:
            return {
                'title': '',
                'duration': 0,
                'description': ''
            }
        return {
            'title': info.get('title', ''),
            'duration': info.get('duration', 0),
            'description': info.get('description', '')[:200]
        }

@app.get("/")
async def root():
    return {"message": "Clipper API with WhisperX", "status": "running"}

@app.post("/clip", response_model=ClipResponse)
async def create_video_clip(request: ClipRequest):
    """Create video clip from YouTube URL"""
    video_path = None
    audio_path = None
    clip_paths = []
    zip_path = None 

    print(f"Received clip request: {request}")
    
    try:
        video_info = get_video_info(request.url)
        video_path = download_video(request.url)

        if request.clipType == "AI":
            # AI-powered clipping
            print(f"Using AI to find viral moments in video: {video_info['title']}")
            audio_path = extract_audio(video_path)
            segments = transcribe_audio_whisperx(audio_path)
            viral_moments = find_viral_moments(segments, video_info)
            
            if not viral_moments:
                raise Exception("No viral moments found")
            
            # if request.multipleClips is true then handle all clips else only best ranked clip
            if request.multipleClips:
                if len(viral_moments) > 1:
                    for i, moment in enumerate(viral_moments):
                        clip_start_time = moment.start_time
                        clip_end_time = moment.end_time
                        
                        print(f"Creating clip {i+1}/{len(viral_moments)}: {moment.content[:50]}... from {clip_start_time}s to {clip_end_time}s")
                        
                        clip_path = create_clip(video_path, clip_start_time, clip_end_time, request.aspectRatio)
                        clip_paths.append(clip_path)

                    # Create ZIP file of all videos
                    zip_path = 'clipper_clips/viral_clips.zip'
                    with zipfile.ZipFile(zip_path, 'w') as zipf:
                        for i, clip in enumerate(clip_paths):
                            clip_name = f"viral_moment_{i+1}_{os.path.basename(clip)}"
                            zipf.write(clip, clip_name)
                    
                    print(f"Created ZIP file with {len(clip_paths)} videos")

                    # Upload ZIP file to S3
                    clip_id = str(uuid.uuid4())
                    clip_url = upload_to_s3(zip_path, clip_id, is_zip=True)
                        
                    return ClipResponse(
                        success=True,
                        message=f"{len(clip_paths)} clips created and packaged successfully",
                        clip_url=clip_url,
                        viral_moments=viral_moments
                    )
                else:
                    # Only one viral moment found, treat as single clip
                    best_moment = viral_moments[0]
                    clip_start_time = best_moment.start_time
                    clip_end_time = best_moment.end_time

                    print(f"Only one viral moment found: {best_moment.content[:50]}... from {clip_start_time}s to {clip_end_time}s")

                    clip_path = create_clip(video_path, clip_start_time, clip_end_time, request.aspectRatio)
                    clip_paths.append(clip_path)
                    
                    clip_id = str(uuid.uuid4())
                    clip_url = upload_to_s3(clip_path, clip_id)
                    
                    return ClipResponse(
                        success=True,
                        message="Single clip created successfully",
                        clip_url=clip_url,
                        viral_moments=viral_moments
                    )
            else:
                # best moment only
                best_moment = max(viral_moments, key=lambda x: x.confidence_score)
                clip_start_time = best_moment.start_time
                clip_end_time = best_moment.end_time

                print(f"Best viral moment found: {best_moment.content[:50]}... from {clip_start_time}s to {clip_end_time}s")

                clip_path = create_clip(video_path, clip_start_time, clip_end_time, request.aspectRatio)
                clip_paths.append(clip_path)
                
                clip_id = str(uuid.uuid4())
                clip_url = upload_to_s3(clip_path, clip_id)
                
                return ClipResponse(
                    success=True,
                    message="Clip created successfully",
                    clip_url=clip_url,
                    viral_moments=viral_moments
                )

        else:  # MANUAL
            print(f"Manual clipping requested from {request.startTime} to {request.endTime}")
            
            clip_start_time = time_to_seconds(request.startTime)
            clip_end_time = time_to_seconds(request.endTime)
            viral_moments = None
            
            if clip_start_time == 0 and clip_end_time == 0:
                raise HTTPException(status_code=400, detail="Please provide valid start and end times for manual clipping")
            
            if clip_start_time >= clip_end_time:
                raise HTTPException(status_code=400, detail="Start time must be before end time")
        
            print("Start creating manual clip...")
            clip_path = create_clip(video_path, clip_start_time, clip_end_time, request.aspectRatio)
            clip_paths.append(clip_path)
            
            clip_id = str(uuid.uuid4())
            clip_url = upload_to_s3(clip_path, clip_id)
            
            return ClipResponse(
                success=True,
                message="Clip created successfully",
                clip_url=clip_url,
                viral_moments=viral_moments
            )
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        return ClipResponse(
            success=False,
            message=f"Error: {str(e)}"
        )
    
    finally:
        # Cleanup all created clips and ZIP file
        cleanup_files(video_path, audio_path, zip_path, *clip_paths)
