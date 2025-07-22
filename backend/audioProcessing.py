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


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client()
# WhisperX setup
device = "cuda" if torch.cuda.is_available() else "cpu"
compute_type = "float16" if torch.cuda.is_available() else "int8"
whisperx_model = whisperx.load_model("base", device, compute_type=compute_type)

class ViralMoment(BaseModel):
    start_time: float
    end_time: float
    content: str
    reason: str
    confidence_score: float
    
class AudioProcessor:
    def __init__(self):
        pass
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
            - Can stand alone as compelling 30-60 second clips
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
    
