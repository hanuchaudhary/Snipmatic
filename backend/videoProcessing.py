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
from concurrent.futures import ThreadPoolExecutor, as_completed

class ViralMoment(BaseModel):
    start_time: float
    end_time: float
    content: str
    reason: str
    confidence_score: float

class VideoProcessor:
    def __init__(self):
        pass
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
    